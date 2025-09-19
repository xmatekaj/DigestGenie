# Create and run the database check script
node -e "
const { PrismaClient } = require('@prisma/client')

async function checkDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking database structure...')
    await prisma.\$connect()
    console.log('✅ Database connection successful')
    
    // Check tables exist
    const tables = ['users', 'accounts', 'sessions', 'verification_tokens']
    
    for (const table of tables) {
      try {
        const result = await prisma.\$queryRawUnsafe(\`SELECT COUNT(*) FROM \${table}\`)
        console.log(\`✅ Table '\${table}' exists with \${result[0].count} records\`)
      } catch (error) {
        console.log(\`❌ Table '\${table}' missing: \${error.message.split('\\n')[0]}\`)
      }
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
  } finally {
    await prisma.\$disconnect()
  }
}

checkDatabase()
"
