import { Pool } from 'pg';
import { Entry, NewEntry, Section, Volunteer, NewVolunteer } from './types';

// Pool'u ilk kullanımda kuruyoruz: server.ts'de dotenv.config() import'lardan SONRA çalışır,
// modül yüklenirken DATABASE_URL henüz okunmamış olur.
let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (typeof connectionString !== 'string' || connectionString.length === 0) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    pool = new Pool({ connectionString, max: 5 });
    // Neon boştaki bağlantıları kapatır; bu olay dinlenmezse Node süreci çöker
    pool.on('error', (err) => console.error('Veritabanı bağlantı hatası:', err.message));
  }
  return pool;
}

// tarihi 'YYYY-MM-DD' metni olarak, İstanbul saatiyle döndür (Date nesnesi saat dilimini kaydırır)
const DATE_SQL = `to_char(created_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') AS date`;

export async function listEntries(section: Section): Promise<Entry[]> {
  const { rows } = await getPool().query<Entry>(
    `SELECT id, section, title, content, ${DATE_SQL} FROM entries WHERE section = $1 ORDER BY id DESC`,
    [section],
  );
  return rows;
}

export async function addEntry(input: NewEntry): Promise<Entry> {
  const { rows } = await getPool().query<Entry>(
    `INSERT INTO entries (section, title, content) VALUES ($1, $2, $3)
     RETURNING id, section, title, content, ${DATE_SQL}`,
    [input.section, input.title.trim(), input.content.trim()],
  );
  return rows[0];
}

export async function deleteEntry(id: number): Promise<boolean> {
  const result = await getPool().query('DELETE FROM entries WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function addVolunteer(input: NewVolunteer): Promise<Volunteer> {
  const { rows } = await getPool().query<Volunteer>(
    `INSERT INTO volunteers (name, email, message, consent) VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, message, consent, ${DATE_SQL}`,
    [input.name.trim(), input.email.trim(), input.message.trim(), true],
  );
  return rows[0];
}

export async function listVolunteers(): Promise<Volunteer[]> {
  const { rows } = await getPool().query<Volunteer>(
    `SELECT id, name, email, message, consent, ${DATE_SQL} FROM volunteers ORDER BY id DESC`,
  );
  return rows;
}