import express, { Request, Response } from 'express';
import { isLoginBody, isPasswordCorrect, findAdminByEmail } from './validation.js';
import cors from 'cors';
import { generateAdminToken } from './auth.js';

const app = express();
const PORT = process.env.PORT || 5023;

app.use(cors({ origin: 'http://localhost:3023' })); // Frontend portuna izin ver
app.use(express.json());

interface SupportEntry {
  id: number;
  title: string;
  content: string;
  date: string;
}

app.post('/api/admin/login', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!isLoginBody(body)) {
      return res.status(400).json({ error: 'Geçersiz giriş verisi' });
    }
    const { email, password } = body;

    const isCorrectPassword = await isPasswordCorrect(email, password);
    if (!isCorrectPassword) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre' });
    }
    const token = generateAdminToken(email);
    res.json({ message: 'Giriş başarılı' });

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000,
    });

  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});


app.get('/api/admin/panel', (req: Request, res: Response) => {
    res.json({ message: 'Admin paneli verisi' });
  });


// SQL veritabanından veri çekme simülasyonu
app.get('/api/support', async (req: Request, res: Response) => {
  try {
    // Örn: const entries = await db.query('SELECT * FROM support_entries');
    const entries: SupportEntry[] = [
      {
        id: 1,
        title: "Donation Platform Status",
        content: "Our donation platform is coming soon. We are working to create a secure way.",
        date: "2026-08-26"
      },
      {
        id: 2,
        title: "Equipment Support",
        content: "We accept recycling tools and planting supplies for upcoming projects.",
        date: "2026-08-20"
      }
    ];
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Veritabanı hatası" });
  }
});

// Yeni veri ekleme (Girdi / Output için SQL INSERT)
app.post('/api/support', async (req: Request, res: Response) => {
  const { title, content } = req.body;
  // Örn: await db.query('INSERT INTO support_entries (title, content, date) VALUES ($1, $2, NOW())', [title, content]);
  res.status(201).json({ message: "Başarıyla eklendi" });
});

app.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} üzerinde çalışıyor.`);
});