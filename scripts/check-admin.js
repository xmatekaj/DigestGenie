// scripts/check-admin.js - Debug script to verify admin configuration
// Run with: node scripts/check-admin.js

const fs = require('fs');
const path = require('path');

console.log('\n=== Admin Configuration Check ===\n');

// Try to read .env.local first, then .env
const envFiles = ['.env.local', '.env'];
let envContent = '';
let envFileUsed = '';

for (const file of envFiles) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    envContent = fs.readFileSync(filePath, 'utf8');
    envFileUsed = file;
    console.log(`Reading from: ${file}`);
    break;
  }
}

if (!envContent) {
  console.error('❌ No .env.local or .env file found!');
  console.log('\nPlease create a .env.local file with:');
  console.log('ADMIN_EMAILS=your-email@gmail.com,matekaj@proton.me,xmatekaj@gmail.com');
  process.exit(1);
}

// Parse ADMIN_EMAILS from env file
const adminEmailsMatch = envContent.match(/ADMIN_EMAILS=(.+)/);

if (!adminEmailsMatch) {
  console.error('❌ ADMIN_EMAILS not found in', envFileUsed);
  console.log('\nPlease add the following line to your', envFileUsed, 'file:');
  console.log('ADMIN_EMAILS=your-email@gmail.com,matekaj@proton.me,xmatekaj@gmail.com');
  process.exit(1);
}

const adminEmailsRaw = adminEmailsMatch[1].trim();
console.log('Raw ADMIN_EMAILS value:', adminEmailsRaw);

const adminEmails = adminEmailsRaw.split(',').map(e => e.trim().toLowerCase());
console.log('\nParsed admin emails (normalized):');
adminEmails.forEach((email, index) => {
  console.log(`  ${index + 1}. ${email} ✓`);
});

console.log('\n✅ Admin emails are configured correctly!');
console.log('\n⚠️  IMPORTANT: Make sure your Google account email matches one of these EXACTLY.');
console.log('    (Email comparison is case-insensitive)');
console.log('\n================================\n');