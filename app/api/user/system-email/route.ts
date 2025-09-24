// app/api/user/system-email/route.ts - Generate and manage system emails
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
//import { generateSystemEmail } from '@/lib/email-utils'

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        emailProcessing: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      systemEmail: user.systemEmail,
      processingStatus: user.emailProcessing?.[0]?.processingStatus || 'inactive'
    })
  } catch (error) {
    console.error('Error fetching system email:', error)
    return NextResponse.json({ error: 'Failed to fetch system email' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate system email if doesn't exist
    let systemEmail = user.systemEmail
    if (!systemEmail) {
      systemEmail = await generateSystemEmail(user.id)
      
      await prisma.user.update({
        where: { id: user.id },
        data: { systemEmail }
      })
    }

    // Create or update email processing record
    await prisma.emailProcessing.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailAddress: systemEmail,
        processingStatus: 'active'
      },
      update: {
        processingStatus: 'active',
        updatedAt: new Date()
      }
    })

    // TODO: Create email account in Postal mail server
    // This would involve calling Postal API to create the email account
    await createPostalEmailAccount(systemEmail, user.id)

    return NextResponse.json({ 
      systemEmail,
      message: 'System email activated successfully'
    })
  } catch (error) {
    console.error('Error creating system email:', error)
    return NextResponse.json({ error: 'Failed to create system email' }, { status: 500 })
  }
}

// Helper function to generate unique system email
async function generateSystemEmail(userId: string): Promise<string> {
  const shortUserId = userId.slice(0, 8)
  const baseEmail = `user${shortUserId}@newsletters.yourdomain.com`
  
  // Check if email already exists
  const existingUser = await prisma.user.findFirst({
    where: { systemEmail: baseEmail }
  })

  if (existingUser) {
    // Generate with timestamp suffix if collision
    const timestamp = Date.now().toString().slice(-4)
    return `user${shortUserId}${timestamp}@newsletters.yourdomain.com`
  }

  return baseEmail
}

// Helper function to create email account in Postal
async function createPostalEmailAccount(email: string, userId: string) {
  // This is a placeholder - you'll need to implement actual Postal API integration
  // based on your Postal server configuration
  
  const postalApiUrl = process.env.POSTAL_API_URL
  const postalApiKey = process.env.POSTAL_API_KEY

  if (!postalApiUrl || !postalApiKey) {
    console.log('Postal API not configured, skipping email account creation')
    return
  }

  try {
    const response = await fetch(`${postalApiUrl}/api/v1/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${postalApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: email,
        user_id: userId,
        forward_to: null // We'll process emails via webhook
      })
    })

    if (!response.ok) {
      throw new Error(`Postal API error: ${response.statusText}`)
    }

    console.log(`Successfully created email account: ${email}`)
  } catch (error) {
    console.error('Failed to create Postal email account:', error)
    throw error
  }
}