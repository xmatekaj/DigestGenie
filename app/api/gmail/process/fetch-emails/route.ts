// app/api/gmail/fetch-emails/route.ts - API route to fetch emails from Gmail
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { GmailService } from '@/lib/gmail-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { maxResults = 10 } = await request.json()

    // Get user from database with stored tokens
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.accessToken) {
      return NextResponse.json({ 
        error: 'Gmail access not authorized. Please re-authenticate with Gmail permissions.' 
      }, { status: 403 })
    }

    // Initialize Gmail service
    const gmailService = new GmailService(user.accessToken, user.refreshToken)

    // Check if token needs refresh
    const validToken = await gmailService.refreshTokenIfNeeded(user.id)
    if (!validToken) {
      return NextResponse.json({ 
        error: 'Gmail authentication expired. Please re-authenticate.' 
      }, { status: 403 })
    }

    // Fetch emails
    console.log(`Fetching up to ${maxResults} emails for user ${user.email}`)
    const emails = await gmailService.fetchEmails(user.id, maxResults)

    console.log(`Found ${emails.length} emails`)

    // Process and store emails
    const processedEmails = []
    
    for (const email of emails) {
      try {
        // Check if we already processed this email
        const existingEmail = await prisma.processedEmail.findUnique({
          where: { gmailMessageId: email.id }
        })

        if (existingEmail) {
          console.log(`Email ${email.id} already processed, skipping`)
          continue
        }

        // Store the email
        const storedEmail = await prisma.processedEmail.create({
          data: {
            gmailMessageId: email.id,
            threadId: email.threadId,
            subject: email.subject,
            sender: email.from,
            recipient: email.to,
            receivedDate: new Date(email.date),
            snippet: email.snippet,
            content: email.body,
            isNewsletter: email.isNewsletter,
            userId: user.id,
            processingStatus: 'pending',
            createdAt: new Date()
          }
        })

        // Mark as read in Gmail (optional)
        await gmailService.markAsRead(email.id)

        processedEmails.push({
          id: storedEmail.id,
          subject: email.subject,
          sender: email.from,
          date: email.date,
          snippet: email.snippet,
          isNewsletter: email.isNewsletter
        })

      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error)
        continue
      }
    }

    return NextResponse.json({
      success: true,
      emailsFound: emails.length,
      emailsProcessed: processedEmails.length,
      emails: processedEmails
    })

  } catch (error) {
    console.error('Gmail fetch error:', error)

    // Handle specific Gmail API errors
    if (error.message.includes('insufficient authentication scopes')) {
      return NextResponse.json({
        error: 'Insufficient Gmail permissions. Please re-authenticate and grant Gmail access.',
        code: 'INSUFFICIENT_SCOPES'
      }, { status: 403 })
    }

    if (error.message.includes('authentication failed')) {
      return NextResponse.json({
        error: 'Gmail authentication failed. Please re-authenticate.',
        code: 'AUTH_FAILED'
      }, { status: 401 })
    }

    return NextResponse.json({
      error: `Failed to fetch emails: ${error.message}`,
      code: 'FETCH_FAILED'
    }, { status: 500 })
  }
}