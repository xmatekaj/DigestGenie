// app/api/webhooks/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, from, subject, body: emailBody, html, text, raw, date, id } = body

    console.log('📧 Received email webhook:', { to, from, subject })

    // Handle 'to' as array or string
    const recipientEmail = Array.isArray(to) ? to[0] : to
    
    if (!recipientEmail) {
      console.log('⚠️ No recipient email found')
      return NextResponse.json({ 
        error: 'No recipient email provided',
        shouldDelete: true  // Tell forwarder to delete this email
      }, { status: 400 })
    }

    console.log('🔍 Looking for user with system email:', recipientEmail)

    // Find user by system email
    const user = await prisma.user.findFirst({
      where: { systemEmail : recipientEmail }
    })

    if (!user) {
      console.log('⚠️ User not found for email:', recipientEmail, '- Marking for deletion')
      return NextResponse.json({ 
        error: 'User not found',
        message: `No user found with system email: ${recipientEmail}`,
        shouldDelete: true  // Tell forwarder to delete spam/unknown emails
      }, { status: 404 })
    }

    console.log('✅ Found user:', user.email)

    const emailContent = emailBody || html || text || ''

    const rawEmail = await prisma.rawEmail.create({
      data: {
        userId: user.id,
        sender: from || 'unknown@unknown.com',
        subject: subject || '(No subject)',
        receivedDate: date ? new Date(date) : new Date(),
        rawContent: emailContent,
        processed: false
      }
    })

    console.log('✅ Email stored with ID:', rawEmail.id)

    return NextResponse.json({ 
      success: true,
      message: 'Email received and stored',
      emailId: rawEmail.id
    })

  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      shouldDelete: false  // Don't delete on server errors, might be temporary
    }, { status: 500 })
  }
}
