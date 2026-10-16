import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { isLoginBody, isPasswordCorrect, requireAdmin, isSection, isNewEntry, isNewVolunteer } from './validation';
import { generateAdminToken } from './auth';
import { listEntries, addEntry, deleteEntry, addVolunteer, listVolunteers, getSetting, setSetting } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5023;

app.use(cors({ origin: 'https://yesil-iz-website.vercel.app', credentials: true }));
app.use(express.json());
app.use(cookieParser());

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
} as const;

type Handler = (req: Request, res: Response) => Promise<unknown>;
const safe = (fn: Handler) => (req: Request, res: Response): void => {
  fn(req, res).catch((err) => {
    console.error(`${req.method} ${req.path} başarısız:`, err);
    res.status(500).json({ error: 'Sunucu hatası' });
  });
};

app.post('/api/admin/login', safe(async (req, res) => {
  const body = req.body;
  if (!isLoginBody(body)) return res.status(400).json({ error: 'Geçersiz giriş verisi' });

  const { email, password } = body;
  if (!(await isPasswordCorrect(email, password))) {
    return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
  }

  const token = generateAdminToken(email);
  res.cookie('admin_token', token, { ...cookieOptions, maxAge: 2 * 60 * 60 * 1000 });
  res.json({ message: 'Giriş başarılı' });
}));

app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3023', 
  credentials: true 
}));

app.post('/api/admin/logout', (_req: Request, res: Response) => {
  res.clearCookie('admin_token', cookieOptions);
  res.json({ message: 'Çıkış yapıldı' });
});

app.get('/api/admin/panel', requireAdmin, (_req: Request, res: Response) => {
  res.json({ message: 'Admin paneli verisi' });
});

app.get('/api/entries/:section', safe(async (req, res) => {
  const { section } = req.params;
  if (section !== 'all' && !isSection(section)) {
    return res.status(404).json({ error: 'Bölüm bulunamadı' });
  }
  res.json(await listEntries(section));
}));

app.post('/api/admin/entries', requireAdmin, safe(async (req, res) => {
  const body = req.body;
  if (!isNewEntry(body)) return res.status(400).json({ error: 'Geçersiz veri' });
  res.status(201).json(await addEntry(body));
}));

app.delete('/api/admin/entries/:id', requireAdmin, safe(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Geçersiz id' });
  const ok = await deleteEntry(id);
  res.status(ok ? 200 : 404).json({ ok });
}));

const volunteerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5 });

app.post('/api/volunteers', volunteerLimiter, safe(async (req, res) => {
  const body = req.body;
  if (!isNewVolunteer(body)) return res.status(400).json({ error: 'Geçersiz başvuru' });
  await addVolunteer(body);
  res.status(201).json({ message: 'Başvurun alındı' });
}));

app.get('/api/admin/volunteers', requireAdmin, safe(async (_req, res) => {
  res.json(await listVolunteers());
}));


app.get('/api/settings', safe(async (_req, res) => {
  const val = await getSetting('is_application_open');
  const isApplicationOpen = val === null ? true : val === 'true';
  res.json({ isApplicationOpen });
}));

app.post('/api/admin/toggle-applications', requireAdmin, safe(async (_req, res) => {
  const val = await getSetting('is_application_open');
  const currentStatus = val === null ? true : val === 'true';
  const newStatus = !currentStatus;

  await setSetting('is_application_open', String(newStatus));

  res.json({
    isApplicationOpen: newStatus,
    message: `Başvurular ${newStatus ? 'açıldı' : 'kapatıldı'}`
  });
}));

app.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} üzerinde çalışıyor.`);
});

app.post('/api/admin/toggle-applications', requireAdmin, async (_req, res) => {
  try {
    const val = await getSetting('is_application_open');
    const currentStatus = val === null ? true : val === 'true';
    const newStatus = !currentStatus;

    await setSetting('is_application_open', String(newStatus));

    res.json({
      isApplicationOpen: newStatus,
      message: `Başvurular ${newStatus ? 'açıldı' : 'kapatıldı'}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Ayar güncellenemedi' });
  }
});