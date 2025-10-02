#!/bin/bash

echo "🧹 Cleaning up DigestGenie repository..."

# Files to delete
FILES_TO_DELETE=(
  # Backup files
  "next.config.js.backup"
  "app/api/articles/route.ts.backup"
  "app/api/newsletters/process-email/route.ts.backup"
  "app/page.tsx.backup"
  "Dockerfile_old"
  
  # Old/duplicate env files
  ".env.active"
  ".env copy.local"
  ".env_cpy"
  ".env.local_example"
  
  # Old scripts
  "setup_public_dir.sh"
  "comprehensive_fix_script.sh"
  "get-docker.sh"
  
  # Unnecessary schema file (prisma/schema.prisma is the source of truth)
  "schema.db"
)

# Directories to clean
DIRS_TO_CLEAN=(
  ".env-backup"
)

for file in "${FILES_TO_DELETE[@]}"; do
  if [ -f "$file" ]; then
    echo "Removing: $file"
    git rm "$file" 2>/dev/null || rm "$file"
  fi
done

for dir in "${DIRS_TO_CLEAN[@]}"; do
  if [ -d "$dir" ]; then
    echo "Removing directory: $dir"
    rm -rf "$dir"
  fi
done

echo "✅ Cleanup complete!"

# Remove numbered junk files
echo "Removing numbered junk files..."
for file in 159 31 51; do
  if [ -f "$file" ]; then
    echo "Removing: $file"
    rm "$file"
  fi
done
