import bcrypt from 'bcrypt';
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