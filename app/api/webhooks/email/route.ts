// app/api/webhooks/email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { to, from, subject, html, text, date } = body

    console.log('📧 Received email webhook:', { to, from, subject })

    // Find user by system email
    const user = await prisma.user.findFirst({
      where: { systemEmail: to }
    })

    if (!user) {
      console.log('⚠️ User not found for email:', to)
      return NextResponse.json({ 
        error: 'User not found',
        message: `No user found with system email: ${to}`
      }, { status: 404 })
    }

    // Store raw email for processing
    const rawEmail = await prisma.rawEmail.create({
      data: {
        userId: user.id,
        sender: from,
        subject: subject || '(No subject)',
        receivedDate: date ? new Date(date) : new Date(),
        rawContent: html || text || '',
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
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}