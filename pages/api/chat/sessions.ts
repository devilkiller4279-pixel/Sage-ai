import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { query } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = getUserFromRequest(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const result = await query(
                'SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
                [user.id]
            );

            res.status(200).json({ sessions: result.rows });
        } catch (error) {
            console.error('Get sessions error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'POST') {
        const { title } = req.body;

        try {
            const result = await query(
                'INSERT INTO chat_sessions (user_id, title) VALUES ($1, $2) RETURNING id, title, created_at, updated_at',
                [user.id, title || 'New Chat']
            );

            res.status(201).json({ session: result.rows[0] });
        } catch (error) {
            console.error('Create session error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
