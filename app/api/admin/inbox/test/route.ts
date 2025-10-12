// app/api/admin/inbox/test/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me',
    'xmatekaj@gmail.com'
  ]
  return adminEmails.includes(email)
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create test email
    const testEmail = await prisma.rawEmail.create({
      data: {
        userId: user.id,
        sender: 'newsletter@techpresso.com',
        subject: 'Test Newsletter - Techpresso Daily',
        receivedDate: new Date(),
        rawContent: `
# Techpresso Daily - Test Edition

Welcome to your daily dose of tech news!

## Top Stories

### 1. AI Breakthrough in Natural Language Processing
Researchers announce major advancement in language models...

### 2. New Smartphone Release
Tech giant unveils latest flagship device with groundbreaking features...

### 3. Cybersecurity Alert
Important security update released for major operating systems...

---
This is a test email created for testing DigestGenie's email processing system.
        `.trim(),
        processed: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Test email created',
      email: {
        id: testEmail.id,
        subject: testEmail.subject
      }
    })
  } catch (error) {
    console.error('Error creating test email:', error)
    return NextResponse.json(
      { error: 'Failed to create test email' },
      { status: 500 }
    )
  }
}