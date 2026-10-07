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