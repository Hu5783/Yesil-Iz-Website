import { Pool, QueryResult, QueryResultRow } from 'pg';
import { Entry, NewEntry, Section, Volunteer, NewVolunteer } from './types';

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (typeof connectionString !== 'string' || connectionString.length === 0) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Neon SSL bağlantısı için gerekli
      },
      max: 5,
      keepAlive: true,                 
      idleTimeoutMillis: 4_000,       
      connectionTimeoutMillis: 10_000,
    });
    pool.on('error', (err) => console.error('Veritabanı bağlantı hatası:', err.message));
  }
  return pool;
}

const TRANSIENT_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ECONNREFUSED']);

function isTransient(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const code = 'code' in err ? err.code : undefined;
  const message = 'message' in err && typeof err.message === 'string' ? err.message : '';
  return (
    (typeof code === 'string' && TRANSIENT_CODES.has(code)) ||
    message.includes('Connection terminated') ||
    message.includes('timeout exceeded when trying to connect')
  );
}

async function query<R extends QueryResultRow>(text: string, params: unknown[] = []): Promise<QueryResult<R>> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await getPool().query<R>(text, params);
    } catch (err) {
      if (attempt >= 3 || !isTransient(err)) throw err;
      console.warn(`Veritabanı bağlantısı koptu, tekrar deneniyor (${attempt}/2)...`);
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
  }
}

// tarihi 'YYYY-MM-DD' metni olarak, İstanbul saatiyle döndürüyor
const DATE_SQL = `to_char(created_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') AS date`;

export async function listEntries(section: string): Promise<Entry[]> {
  if (section === 'all') {
    const { rows } = await query<Entry>(
      `SELECT id, section, title, content, ${DATE_SQL} FROM entries ORDER BY id DESC`
    );
    return rows;
  }
  const { rows } = await query<Entry>(
    `SELECT id, section, title, content, ${DATE_SQL} FROM entries WHERE section = $1 ORDER BY id DESC`,
    [section],
  );
  return rows;
}

export async function addEntry(input: NewEntry): Promise<Entry> {
  const { rows } = await query<Entry>(
    `INSERT INTO entries (section, title, content) VALUES ($1, $2, $3)
     RETURNING id, section, title, content, ${DATE_SQL}`,
    [input.section, input.title.trim(), input.content.trim()],
  );
  return rows[0];
}

export async function deleteEntry(id: number): Promise<boolean> {
  const result = await query('DELETE FROM entries WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function addVolunteer(input: NewVolunteer): Promise<Volunteer> {
  const { rows } = await query<Volunteer>(
    `INSERT INTO volunteers (name, email, message, consent) VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, message, consent, ${DATE_SQL}`,
    [input.name.trim(), input.email.trim(), input.message.trim(), true],
  );
  return rows[0];
}

export async function listVolunteers(): Promise<Volunteer[]> {
  const { rows } = await query<Volunteer>(
    `SELECT id, name, email, message, consent, ${DATE_SQL} FROM volunteers ORDER BY id DESC`,
  );
  return rows;
}

export async function getSetting(key: string): Promise<string | null> {
  const { rows } = await query<{ value: string }>(
    'SELECT value FROM settings WHERE key = $1',
    [key]
  );
  return rows.length > 0 ? rows[0].value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await query(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
}