import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../../lib/auth';
import { query } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = getUserFromRequest(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const sessionResult = await query(
                'SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2',
                [id, user.id]
            );

            if (sessionResult.rows.length === 0) {
                return res.status(404).json({ error: 'Session not found' });
            }

            const messagesResult = await query(
                'SELECT id, role, content, created_at, response_time FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
                [id]
            );

            res.status(200).json({
                session: sessionResult.rows[0],
                messages: messagesResult.rows
            });
        } catch (error) {
            console.error('Get session error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const result = await query(
                'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
                [id, user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Session not found' });
            }

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Delete session error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
