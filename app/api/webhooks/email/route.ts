// app/api/webhooks/email/route.ts - Handle incoming emails from mail server
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailProcessor } from '@/lib/email-processor'

/**
 * Webhook endpoint to receive incoming emails from mail server
 * Supports multiple email service formats (Postal, Mailgun, SendGrid, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature for security
    const signature = request.headers.get('x-webhook-signature') || request.headers.get('signature')
    if (!verifyWebhookSignature(request, signature)) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const emailData = await request.json()
    console.log('📧 Received email webhook:', emailData.subject)

    // Parse email data based on provider
    const provider = detectEmailProvider(request, emailData)
    const parsedEmail = await parseEmailData(emailData, provider)

    if (!parsedEmail) {
      console.error('❌ Failed to parse email data')
      return NextResponse.json({ error: 'Invalid email data' }, { status: 400 })
    }

    // Find user by system email
    const user = await prisma.user.findFirst({
      where: { systemEmail: parsedEmail.to }
    })

    if (!user) {
      console.error(`❌ No user found for email: ${parsedEmail.to}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email already processed (prevent duplicates)
    const existingEmail = await prisma.processedEmail.findFirst({
      where: {
        messageId: parsedEmail.messageId,
        userId: user.id
      }
    })

    if (existingEmail) {
      console.log(`⚠️ Email already processed: ${parsedEmail.messageId}`)
      return NextResponse.json({ message: 'Already processed' })
    }

    // Store raw email
    const processedEmail = await prisma.processedEmail.create({
      data: {
        messageId: parsedEmail.messageId,
        threadId: parsedEmail.threadId || parsedEmail.messageId,
        subject: parsedEmail.subject,
        sender: parsedEmail.from,
        recipient: parsedEmail.to,
        receivedDate: new Date(parsedEmail.date),
        snippet: parsedEmail.snippet || '',
        content: parsedEmail.content,
        isNewsletter: detectNewsletter(parsedEmail),
        processingStatus: 'pending',
        userId: user.id
      }
    })

    // Queue for AI processing (async)
    queueEmailProcessing(processedEmail.id, user.id)

    console.log(`✅ Email processed successfully: ${parsedEmail.subject}`)
    return NextResponse.json({ 
      success: true, 
      emailId: processedEmail.id 
    })

  } catch (error) {
    console.error('❌ Email webhook error:', error)
    return NextResponse.json({ 
      error: 'Processing failed',
      details: error.message 
    }, { status: 500 })
  }
}

/**
 * Verify webhook signature for security
 */
function verifyWebhookSignature(request: NextRequest, signature: string | null): boolean {
  if (process.env.NODE_ENV === 'development') {
    return true // Skip verification in development
  }

  const webhookSecret = process.env.WEBHOOK_SECRET
  if (!webhookSecret || !signature) {
    return false
  }

  // Implementation would depend on your email service
  // Example for HMAC SHA256:
  // const expectedSignature = crypto.createHmac('sha256', webhookSecret)
  //   .update(body)
  //   .digest('hex')
  // return signature === expectedSignature

  return true
}

/**
 * Detect which email provider sent the webhook
 */
function detectEmailProvider(request: NextRequest, data: any): string {
  const userAgent = request.headers.get('user-agent') || ''
  
  if (userAgent.includes('Postal') || data.postal) return 'postal'
  if (userAgent.includes('Mailgun') || data.signature) return 'mailgun'
  if (userAgent.includes('SendGrid') || data.envelope) return 'sendgrid'
  if (data.cloudflare || request.headers.get('cf-ray')) return 'cloudflare'
  
  return 'generic'
}

/**
 * Parse email data based on provider format
 */
async function parseEmailData(data: any, provider: string): Promise<{
  messageId: string
  threadId?: string
  subject: string
  from: string
  to: string
  date: string
  snippet: string
  content: string
} | null> {
  
  try {
    switch (provider) {
      case 'postal':
        return {
          messageId: data.message_id || data.id,
          subject: data.subject,
          from: data.from,
          to: data.to,
          date: data.timestamp || new Date().toISOString(),
          snippet: data.text?.substring(0, 200) || '',
          content: data.html || data.text || ''
        }

      case 'mailgun':
        return {
          messageId: data['Message-Id'],
          subject: data.subject,
          from: data.sender,
          to: data.recipient,
          date: data.timestamp || new Date().toISOString(),
          snippet: data['stripped-text']?.substring(0, 200) || '',
          content: data['stripped-html'] || data['stripped-text'] || ''
        }

      case 'sendgrid':
        return {
          messageId: data.headers?.['Message-ID'] || data.envelope?.messageId,
          subject: data.subject,
          from: data.from?.email || data.from,
          to: data.to?.[0]?.email || data.to,
          date: data.envelope?.timestamp || new Date().toISOString(),
          snippet: data.text?.substring(0, 200) || '',
          content: data.html || data.text || ''
        }

      case 'cloudflare':
        return {
          messageId: data.headers?.['message-id'] || crypto.randomUUID(),
          subject: data.headers?.subject,
          from: data.from,
          to: data.to,
          date: new Date().toISOString(),
          snippet: data.text?.substring(0, 200) || '',
          content: data.html || data.text || ''
        }

      default:
        // Generic format
        return {
          messageId: data.messageId || data.id || crypto.randomUUID(),
          subject: data.subject,
          from: data.from || data.sender,
          to: data.to || data.recipient,
          date: data.date || data.timestamp || new Date().toISOString(),
          snippet: (data.content || data.text || data.body || '').substring(0, 200),
          content: data.content || data.html || data.text || data.body || ''
        }
    }
  } catch (error) {
    console.error('Error parsing email data:', error)
    return null
  }
}

/**
 * Detect if email is likely a newsletter
 */
function detectNewsletter(email: any): boolean {
  const newsletterIndicators = [
    'newsletter', 'digest', 'weekly', 'daily', 'update', 'roundup',
    'briefing', 'bulletin', 'news', 'unsubscribe', 'mailing list',
    'campaign', 'broadcast'
  ]

  const text = `${email.subject} ${email.from} ${email.content}`.toLowerCase()
  
  return newsletterIndicators.some(indicator => text.includes(indicator)) ||
         email.content.includes('unsubscribe') ||
         email.from.includes('noreply') ||
         email.from.includes('newsletter')
}

/**
 * Queue email for AI processing (async)
 */
async function queueEmailProcessing(emailId: string, userId: string): Promise<void> {
  try {
    // In a production app, you'd use a proper queue like Redis/Bull
    // For now, we'll process immediately in the background
    
    setTimeout(async () => {
      try {
        const processor = new EmailProcessor()
        await processor.processEmail(emailId, userId)
        console.log(`🤖 AI processing completed for email: ${emailId}`)
      } catch (error) {
        console.error(`❌ AI processing failed for email: ${emailId}`, error)
      }
    }, 1000)

  } catch (error) {
    console.error('Error queuing email processing:', error)
  }
}

// Also handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  // Some email services send GET requests to verify webhook URLs
  const challenge = request.nextUrl.searchParams.get('challenge')
  
  if (challenge) {
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ 
    status: 'Email webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}