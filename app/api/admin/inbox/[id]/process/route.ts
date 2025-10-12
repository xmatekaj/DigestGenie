// app/api/admin/inbox/[id]/process/route.ts
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

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: Request,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Fetch the raw email
    const rawEmail = await prisma.rawEmail.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!rawEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    if (rawEmail.processed) {
      return NextResponse.json({ 
        error: 'Email already processed',
        message: 'This email has already been processed'
      }, { status: 400 })
    }

    // Extract domain from sender
    const senderDomain = rawEmail.sender.split('@')[1] || ''
    const senderEmail = rawEmail.sender

    // Find or create newsletter
    let newsletter = await prisma.newsletter.findFirst({
      where: {
        OR: [
          { senderEmail: senderEmail },
          { senderDomain: senderDomain }
        ]
      }
    })

    if (!newsletter) {
      // Create newsletter from email
      const newsletterName = rawEmail.subject.split('|')[0].trim() || senderDomain
      
      newsletter = await prisma.newsletter.create({
        data: {
          name: newsletterName,
          senderEmail: senderEmail,
          senderDomain: senderDomain,
          isPredefined: false,
          isActive: true
        }
      })
    }

    // Create article from email content
    const article = await prisma.newsletterArticle.create({
      data: {
        userId: rawEmail.userId,
        newsletterId: newsletter.id,
        title: rawEmail.subject,
        content: rawEmail.rawContent,
        excerpt: rawEmail.rawContent.substring(0, 300) + '...',
        sourceEmailId: rawEmail.id,
        sourceSubject: rawEmail.subject,
        processedAt: new Date(),
        isRead: false,
        isSaved: false
      }
    })

    // Mark email as processed
    await prisma.rawEmail.update({
      where: { id },
      data: { 
        processed: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email processed successfully',
      newsletter: {
        id: newsletter.id,
        name: newsletter.name
      },
      article: {
        id: article.id,
        title: article.title
      }
    })
  } catch (error) {
    console.error('Error processing email:', error)
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    )
  }
}