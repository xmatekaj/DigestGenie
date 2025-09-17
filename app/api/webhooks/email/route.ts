// /app/api/webhooks/email/route.ts - Email webhook handler
import { EmailProcessor } from '@/lib/email-processor'

export async function POST(request: NextRequest) {
  const emailData = await request.json()
  
  // Verify webhook signature for security
  const signature = request.headers.get('x-webhook-signature')
  if (!verifyWebhookSignature(signature, emailData)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    // Store raw email
    const rawEmail = await prisma.rawEmail.create({
      data: {
        messageId: emailData.messageId,
        sender: emailData.from,
        subject: emailData.subject,
        receivedDate: new Date(emailData.date),
        rawContent: emailData.raw,
        userId: await getUserIdFromEmail(emailData.to),
      }
    })

    // Queue for processing
    await prisma.processingJob.create({
      data: {
        jobType: 'email_processing',
        payload: { rawEmailId: rawEmail.id },
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
