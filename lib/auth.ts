import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';

const SECRET = process.env.SESSION_SECRET || 'fallback-secret-key';

interface UserPayload {
    id: number;
    username: string;
}

export const createToken = (user: UserPayload): string => {
    return jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyToken = (token: string): UserPayload | null => {
    try {
        return jwt.verify(token, SECRET) as UserPayload;
    } catch (error) {
        return null;
    }
};

export const getUserFromRequest = (req: NextApiRequest): UserPayload | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    return verifyToken(token);
};
