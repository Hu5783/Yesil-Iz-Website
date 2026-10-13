import bcrypt from 'bcrypt';

import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from './auth';
import { SECTIONS, Section, NewEntry, NewVolunteer } from './types';



export function isSection(value: unknown): value is Section {
  return typeof value === 'string' && (SECTIONS as readonly string[]).includes(value);
}

export function isNewEntry(value: unknown): value is NewEntry {
  if (typeof value !== 'object' || value === null) return false;
  if (!('section' in value) || !('title' in value) || !('content' in value)) return false;
  return (
    isSection(value.section) &&
    typeof value.title === 'string' && value.title.trim().length > 0 && value.title.length <= 200 &&
    typeof value.content === 'string' && value.content.trim().length > 0 && value.content.length <= 5000
  );
}

export function isNewVolunteer(value: unknown): value is NewVolunteer {
  if (typeof value !== 'object' || value === null) return false;
  if (!('name' in value) || !('email' in value) || !('message' in value) || !('consent' in value)) return false;
  return (
    typeof value.name === 'string' && value.name.trim().length > 0 && value.name.length <= 100 &&
    typeof value.email === 'string' && value.email.includes('@') && value.email.length <= 200 &&
    typeof value.message === 'string' && value.message.length <= 1000 &&
    value.consent === true
  );
}

export function isLoginBody(value: unknown): value is { password: string, email: string } {
    if (typeof value === 'object' && value !== null) {
        if (!('email' in value) || !('password' in value)) {
            return false;
        }
        if (typeof value.email === 'string' && typeof value.password === 'string') {
            return true;
        }
    }
    return false;
}


export function findAdminByEmail(email: string): { email: string; passwordHash: string } | null {
  const admin_email = process.env.ADMIN_EMAIL;
  const admin_password_hash = process.env.ADMIN_PASSWORD_HASH;

  if (typeof admin_email !== 'string' || typeof admin_password_hash !== 'string') {
    return null;
  }
  if (email !== admin_email) {
    return null;
  }
  return { email: admin_email, passwordHash: admin_password_hash };
}


export async function isPasswordCorrect(email: string, password: string): Promise<boolean> {
  try {
    const admin = findAdminByEmail(email);
    if (!admin) {
      return Promise.resolve(false);
    }
    return await bcrypt.compare(password, admin.passwordHash);
  } catch (error) {
    console.log('Error comparing password:', error);
    return Promise.resolve(false);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.admin_token;
  if (typeof token !== 'string') {
    res.status(401).json({ error: 'Giriş gerekli' });
    return;
  }
  if (verifyAdminToken(token) === null) {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş oturum' });
    return;
  }
  next();
}