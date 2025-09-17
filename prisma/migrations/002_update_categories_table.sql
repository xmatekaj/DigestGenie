-- Migration: Update categories table for admin panel
-- File: migrations/002_update_categories_table.sql

-- Add missing columns to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'Globe',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update color column to store Tailwind gradient classes instead of hex
-- Rename existing color column and add new one for gradients
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS color_gradient VARCHAR(100) DEFAULT 'from-blue-500 to-cyan-500';

-- Update existing records with default values
UPDATE categories 
SET 
  icon = 'Globe' WHERE icon IS NULL,
  is_active = true WHERE is_active IS NULL,
  sort_order = 1 WHERE sort_order IS NULL OR sort_order = 0,
  color_gradient = 'from-blue-500 to-cyan-500' WHERE color_gradient IS NULL;

-- Add some default categories if table is empty
INSERT INTO categories (name, description, icon, color_gradient, user_id, is_active, sort_order)
SELECT * FROM (VALUES 
  ('Technology', 'Latest tech news and innovations', 'Zap', 'from-blue-500 to-cyan-500', NULL, true, 1),
  ('Programming', 'Development, coding, and software engineering', 'Code', 'from-green-500 to-emerald-500', NULL, true, 2),
  ('Electronics', 'Hardware, circuits, and electronic engineering', 'Cpu', 'from-purple-500 to-violet-500', NULL, true, 3),
  ('Business', 'Corporate news and business insights', 'Briefcase', 'from-orange-500 to-red-500', NULL, true, 4),
  ('Startup', 'Entrepreneurship and venture capital', 'TrendingUp', 'from-pink-500 to-rose-500', NULL, true, 5),
  ('Global News', 'International news and current events', 'Globe', 'from-indigo-500 to-blue-500', NULL, true, 6)
) AS default_categories(name, description, icon, color_gradient, user_id, is_active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id IS NULL);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_user_system ON categories(user_id) WHERE user_id IS NULL;