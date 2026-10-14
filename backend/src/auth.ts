import jwt from 'jsonwebtoken';

interface AdminPayload {
  email: string;
  role: 'admin';
}

function isAdminPayload(value: unknown): value is AdminPayload {
  return (
    typeof value === 'object' && value !== null &&
    'email' in value && typeof value.email === 'string' &&
    'role' in value && value.role === 'admin'
  );
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
}

export function generateAdminToken(email: string): string {
  const payload: AdminPayload = { email, role: 'admin' };
  return jwt.sign(payload, getSecret(), { expiresIn: '2h' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  const secret = getSecret(); // eksik secret bir yapılandırma hatası: fırlatsın, 401'e dönüşmesin
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    return isAdminPayload(decoded) ? decoded : null;
  } catch {
    return null;
  }
}