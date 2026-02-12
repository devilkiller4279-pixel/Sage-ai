# Database Setup Instructions

The database connection is failing because the Supabase database needs to be initialized first.

## Steps to Fix:

### Option 1: Use Your Supabase Database (Recommended)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (or create a new one)
3. **Go to SQL Editor**
4. **Run the schema** from `db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'New Chat',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
```

5. **Get your connection string**:
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - Update `.env.local` with the correct URL

### Option 2: Use Local PostgreSQL (Alternative)

If you don't have a Supabase account or want to test locally:

1. Install PostgreSQL locally
2. Create a database: `createdb ai_chatbot`
3. Run the schema from `db/schema.sql`
4. Update `.env.local`:
   ```
   SUPABASE_DBURL=postgresql://username:password@localhost:5432/ai_chatbot
   ```

### Current Issue:

The URL `db.dxvpbenpfjppvbvvhnyh.supabase.co` cannot be resolved. This means either:
- The database project doesn't exist
- The database was deleted
- The URL is incorrect
- Network/firewall issue

Please verify your Supabase project and update the connection string in `.env.local`.
