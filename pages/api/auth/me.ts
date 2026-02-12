import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';
import { query } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userData = getUserFromRequest(req);

    if (!userData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [userData.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user: result.rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
