// scripts/fix-existing-users.ts
// Run this once to add system emails to existing users
// Usage: npx ts-node scripts/fix-existing-users.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSystemEmail(email: string): string {
  const emailDomain = process.env.EMAIL_DOMAIN || 'digestgenie.com'
  const username = email.split('@')[0]
  return `${username}@${emailDomain}`
}

async function fixExistingUsers() {
  console.log('🔍 Finding users without system emails...')
  
  const usersWithoutSystemEmail = await prisma.user.findMany({
    where: {
      systemEmail: null
    }
  })

  console.log(`📊 Found ${usersWithoutSystemEmail.length} users without system emails`)

  for (const user of usersWithoutSystemEmail) {
    const systemEmail = generateSystemEmail(user.email)
    
    console.log(`✨ Creating system email for ${user.email} → ${systemEmail}`)
    
    // Update user with system email
    await prisma.user.update({
      where: { id: user.id },
      data: { systemEmail }
    })

    // Check if email processing record exists
    const existingProcessing = await prisma.emailProcessing.findFirst({
      where: { userId: user.id }
    })

    if (!existingProcessing) {
      // Create email processing record
      await prisma.emailProcessing.create({
        data: {
          userId: user.id,
          emailAddress: systemEmail,
          processingStatus: 'active'
        }
      })
      console.log(`  ✅ Created email processing record`)
    } else {
      console.log(`  ℹ️  Email processing record already exists`)
    }
  }

  console.log('✅ Done! All users now have system emails.')
}

fixExistingUsers()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })