// app/api/admin/fix-system-emails/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

function generateSystemEmail(email: string): string {
  const emailDomain = process.env.EMAIL_DOMAIN || 'digestgenie.com'
  const username = email.split('@')[0]
  return `${username}@${emailDomain}`
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find users without system emails
    const usersWithoutSystemEmail = await prisma.user.findMany({
      where: {
        systemEmail: null
      }
    })

    const results = []

    for (const user of usersWithoutSystemEmail) {
      const systemEmail = generateSystemEmail(user.email)
      
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
      }

      results.push({
        email: user.email,
        systemEmail: systemEmail,
        status: 'fixed'
      })
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${results.length} users`,
      results
    })
  } catch (error) {
    console.error('Error fixing system emails:', error)
    return NextResponse.json(
      { error: 'Failed to fix system emails' },
      { status: 500 }
    )
  }
}