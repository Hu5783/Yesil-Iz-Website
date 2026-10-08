import jwt from 'jsonwebtoken';

export function generateAdminToken(email: string): string {
    const secret = process.env.JWT_SECRET;
    const payload = { email, role: 'admin' };
    const options = { expiresIn: '2h' };
    
    if (typeof secret !== 'string') {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign(payload, secret, {"expiresIn": "2h"});
}

export function verifyAdminToken(token: string): { email: string; role: string } | null {
    const secret = process.env.JWT_SECRET;
    if (typeof secret !== 'string') {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    try {
        const decoded = jwt.verify(token, secret) as { email: string; role: string };
        if (decoded.role === 'admin') {
            return decoded;
        }
        return null;
    } catch (error) {
        console.log('Error verifying token:', error);
        return null;
    }
}