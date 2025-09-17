-- Migration: 001_newsletter_tables.sql
-- Core newsletter aggregation tables

-- Newsletter sources (both user-created and predefined)
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sender_email VARCHAR(255),
  sender_domain VARCHAR(255),
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  frequency VARCHAR(50), -- daily, weekly, monthly
  is_predefined BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User newsletter subscriptions
CREATE TABLE IF NOT EXISTS user_newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  
  -- Subscription settings
  is_active BOOLEAN DEFAULT true,
  custom_category VARCHAR(100),
  
  -- AI preferences
  ai_enabled BOOLEAN DEFAULT true,
  ai_summary_enabled BOOLEAN DEFAULT true,
  ai_categorization_enabled BOOLEAN DEFAULT true,
  ai_interest_filtering BOOLEAN DEFAULT false,
  
  -- Display preferences
  display_preference JSONB DEFAULT '{"type": "full", "show_images": true}',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, newsletter_id)
);

-- Email processing table
CREATE TABLE IF NOT EXISTS email_processing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_address VARCHAR(255) NOT NULL, -- user's system email
  processing_status VARCHAR(50) DEFAULT 'pending',
  last_processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter articles/content
CREATE TABLE IF NOT EXISTS newsletter_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Article content
  title VARCHAR(500) NOT NULL,
  content TEXT,
  excerpt TEXT,
  url VARCHAR(1000),
  image_url VARCHAR(500),
  
  -- AI-generated content
  ai_summary TEXT,
  ai_category VARCHAR(100),
  ai_interest_score FLOAT DEFAULT 0,
  ai_generated_thumbnail VARCHAR(500),
  
  -- Metadata
  published_at TIMESTAMP,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_saved BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  
  -- Email source info
  source_email_id VARCHAR(255),
  source_subject VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User categories (custom groupings)
CREATE TABLE IF NOT EXISTS user_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- hex color
  icon VARCHAR(50) DEFAULT 'folder',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Category assignments for newsletters
CREATE TABLE IF NOT EXISTS newsletter_category_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  category_id UUID REFERENCES user_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, newsletter_id, category_id)
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Global AI settings
  global_ai_enabled BOOLEAN DEFAULT true,
  ai_summary_length VARCHAR(20) DEFAULT 'medium', -- short, medium, long
  ai_interest_threshold FLOAT DEFAULT 0.5,
  
  -- Digest settings
  digest_frequency VARCHAR(20) DEFAULT 'daily', -- daily, weekly, never
  digest_time TIME DEFAULT '08:00:00',
  digest_timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Display preferences
  default_view VARCHAR(20) DEFAULT 'cards', -- cards, list, magazine
  articles_per_page INTEGER DEFAULT 20,
  show_read_articles BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletters_active ON newsletters(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletters_predefined ON newsletters(is_predefined);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_newsletter_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON user_newsletter_subscriptions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_articles_user_date ON newsletter_articles(user_id, processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_newsletter ON newsletter_articles(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_articles_saved ON newsletter_articles(user_id, is_saved) WHERE is_saved = true;
CREATE INDEX IF NOT EXISTS idx_email_processing_user ON email_processing(user_id);

-- Insert some predefined newsletters (admin-curated)
INSERT INTO newsletters (name, description, sender_domain, website_url, is_predefined, frequency) VALUES
('TechCrunch', 'Latest technology news and startup coverage', 'techcrunch.com', 'https://techcrunch.com', true, 'daily'),
('Morning Brew', 'Daily business and finance newsletter', 'morningbrew.com', 'https://morningbrew.com', true, 'daily'),
('The Hustle', 'Business and tech news with personality', 'thehustle.co', 'https://thehustle.co', true, 'daily'),
('Benedict Evans', 'Tech industry analysis and insights', 'ben-evans.com', 'https://ben-evans.com', true, 'weekly'),
('Stratechery', 'Technology and media analysis', 'stratechery.com', 'https://stratechery.com', true, 'weekly')
ON CONFLICT DO NOTHING;