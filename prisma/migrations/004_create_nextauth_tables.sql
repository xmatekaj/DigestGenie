-- 004_create_nextauth_tables.sql
-- Create missing NextAuth tables for your DigestGenie database

-- Create accounts table for OAuth providers (Google, etc.)
CREATE TABLE accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT accounts_provider_providerAccountId_key UNIQUE (provider, "providerAccountId")
);

-- Create sessions table for user sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create verification_tokens table for email verification
CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (identifier, token)
);

-- Update users table to be compatible with NextAuth
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP,
ADD COLUMN IF NOT EXISTS image TEXT;

-- Convert users.id from UUID to TEXT for NextAuth compatibility
-- This is tricky, so let's create a new compatible structure
DO $$
BEGIN
    -- Check if users table has UUID id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        -- We need to convert UUID to TEXT for NextAuth
        -- First, let's see if there are any users
        IF (SELECT COUNT(*) FROM users) = 0 THEN
            -- No users, safe to change the column type
            ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::text;
            ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
        ELSE
            -- There are users, we need to be more careful
            -- Add a temporary column, copy data, then swap
            ALTER TABLE users ADD COLUMN new_id TEXT DEFAULT gen_random_uuid()::text;
            UPDATE users SET new_id = id::text;
            
            -- Drop old column and rename new one (only if no foreign keys)
            -- ALTER TABLE users DROP COLUMN id;
            -- ALTER TABLE users RENAME COLUMN new_id TO id;
            
            RAISE NOTICE 'Users table has UUID ids and existing data. Manual conversion needed.';
        END IF;
    END IF;
END $$;

-- Add foreign key constraints
ALTER TABLE accounts 
ADD CONSTRAINT IF NOT EXISTS accounts_userId_fkey 
FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE sessions 
ADD CONSTRAINT IF NOT EXISTS sessions_userId_fkey 
FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS accounts_userId_idx ON accounts("userId");
CREATE INDEX IF NOT EXISTS sessions_userId_idx ON sessions("userId");
CREATE INDEX IF NOT EXISTS sessions_sessionToken_idx ON sessions("sessionToken");

-- Insert a note about the migration
INSERT INTO pg_catalog.pg_description (objoid, description) 
SELECT 'accounts'::regclass::oid, 'NextAuth accounts table - stores OAuth provider information';

INSERT INTO pg_catalog.pg_description (objoid, description) 
SELECT 'sessions'::regclass::oid, 'NextAuth sessions table - stores user login sessions';

SELECT 'NextAuth tables created successfully!' as result;