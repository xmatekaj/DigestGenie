// prisma/migrations/005_gmail_integration.sql
-- Add Gmail integration fields to existing tables

-- Update users table with Gmail token storage
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "accessToken" TEXT,
ADD COLUMN IF NOT EXISTS "refreshToken" TEXT,
ADD COLUMN IF NOT EXISTS "tokenExpiry" TIMESTAMP;

-- Create processed_emails table for Gmail emails
CREATE TABLE IF NOT EXISTS processed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "gmailMessageId" VARCHAR(255) UNIQUE NOT NULL,
  "threadId" VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  sender VARCHAR(500) NOT NULL,
  recipient VARCHAR(500) NOT NULL,
  "receivedDate" TIMESTAMP NOT NULL,
  snippet TEXT,
  content TEXT,
  "isNewsletter" BOOLEAN DEFAULT false,
  "processingStatus" VARCHAR(50) DEFAULT 'pending',
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT processed_emails_userId_fkey 
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS processed_emails_userId_idx ON processed_emails("userId");
CREATE INDEX IF NOT EXISTS processed_emails_gmailMessageId_idx ON processed_emails("gmailMessageId");
CREATE INDEX IF NOT EXISTS processed_emails_receivedDate_idx ON processed_emails("receivedDate");
CREATE INDEX IF NOT EXISTS processed_emails_processingStatus_idx ON processed_emails("processingStatus");

-- Create email_articles table to link processed emails with articles
CREATE TABLE IF NOT EXISTS email_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "processedEmailId" UUID NOT NULL,
  "articleId" UUID NOT NULL,
  "extractedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT email_articles_processedEmailId_fkey 
  FOREIGN KEY ("processedEmailId") REFERENCES processed_emails(id) ON DELETE CASCADE,
  
  CONSTRAINT email_articles_articleId_fkey 
  FOREIGN KEY ("articleId") REFERENCES articles(id) ON DELETE CASCADE,
  
  CONSTRAINT email_articles_unique 
  UNIQUE ("processedEmailId", "articleId")
);

-- Add Gmail sync settings to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "gmailSyncEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "lastGmailSync" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "gmailSyncInterval" INTEGER DEFAULT 300; -- seconds

-- Create table for Gmail sync logs
CREATE TABLE IF NOT EXISTS gmail_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "syncStarted" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "syncCompleted" TIMESTAMP,
  "emailsFound" INTEGER DEFAULT 0,
  "emailsProcessed" INTEGER DEFAULT 0,
  "errors" TEXT[],
  status VARCHAR(50) DEFAULT 'running',
  
  CONSTRAINT gmail_sync_logs_userId_fkey 
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for sync logs
CREATE INDEX IF NOT EXISTS gmail_sync_logs_userId_idx ON gmail_sync_logs("userId");
CREATE INDEX IF NOT EXISTS gmail_sync_logs_syncStarted_idx ON gmail_sync_logs("syncStarted");