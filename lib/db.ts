import { Pool } from 'pg';

let pool: Pool | null = null;

export const getPool = (): Pool => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.SUPABASE_DBURL,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }
    return pool;
};

export const query = async (text: string, params?: any[]) => {
    const client = getPool();
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};
