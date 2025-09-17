// app/api/newsletters/process-email/route.ts - Process incoming emails from n8n
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OpenAI } from 'openai'
import { extractArticlesFromEmail } from '@/lib/email-parser'
import { generateAISummary, categorizeContent, scoreInterest } from '@/lib/ai-utils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  // Verify internal API key
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ') || 
      authHeader.split(' ')[1] !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const emailData = await request.json()
    const { 
      userId, 
      from, 
      subject, 
      htmlContent, 
      textContent, 
      receivedAt, 
      messageId,
      newsletterName,
      senderDomain,
      articles = []
    } = emailData

    // Find user
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { id: { contains: userId } },
          { systemEmail: { contains: userId } }
        ]
      },
      include: {
        userPreferences: true,
        userNewsletterSubscriptions: {
          include: { newsletter: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        status: 'error',
        error: 'User not found' 
      }, { status: 404 })
    }

    // Find or create newsletter
    let newsletter = await prisma.newsletter.findFirst({
      where: {
        OR: [
          { senderEmail: from },
          { senderDomain: senderDomain },
          { name: { contains: newsletterName, mode: 'insensitive' } }
        ]
      }
    })

    if (!newsletter) {
      // Auto-create newsletter from email
      newsletter = await prisma.newsletter.create({
        data: {
          name: newsletterName || `Newsletter from ${senderDomain}`,
          senderEmail: from,
          senderDomain: senderDomain,
          isPredefined: false,
          frequency: 'unknown'
        }
      })

      // Auto-subscribe user to this newsletter
      await prisma.userNewsletterSubscription.create({
        data: {
          userId: user.id,
          newsletterId: newsletter.id,
          isActive: true,
          aiEnabled: user.userPreferences?.globalAiEnabled ?? true
        }
      })
    }

    // Check if user is subscribed to this newsletter
    const subscription = await prisma.userNewsletterSubscription.findFirst({
      where: {
        userId: user.id,
        newsletterId: newsletter.id,
        isActive: true
      }
    })

    if (!subscription) {
      return NextResponse.json({ 
        status: 'ignored',
        message: 'User not subscribed to this newsletter'
      })
    }

    // Process articles
    const processedArticles = []
    
    for (const article of articles) {
      try {
        let aiSummary = null
        let aiCategory = null
        let interestScore = 0

        // Generate AI content if enabled
        if (subscription.aiEnabled && user.userPreferences?.globalAiEnabled) {
          // Generate summary
          if (subscription.aiSummaryEnabled) {
            aiSummary = await generateAISummary(article.content || article.excerpt, {
              length: user.userPreferences?.aiSummaryLength || 'medium'
            })
          }

          // Categorize content
          if (subscription.aiCategorizationEnabled) {
            aiCategory = await categorizeContent(article.title + ' ' + (article.content || article.excerpt))
          }

          // Score interest level
          if (subscription.aiInterestFiltering) {
            interestScore = await scoreInterest(
              article.title + ' ' + (article.content || article.excerpt),
              user.id // Could include user preferences/history for personalization
            )
          }
        }

        // Save article to database
        const savedArticle = await prisma.newsletterArticle.create({
          data: {
            newsletterId: newsletter.id,
            userId: user.id,
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            url: article.url,
            aiSummary,
            aiCategory,
            aiInterestScore: interestScore,
            sourceEmailId: messageId,
            sourceSubject: subject,
            publishedAt: new Date(receivedAt),
            processedAt: new Date()
          }
        })

        processedArticles.push(savedArticle)
      } catch (articleError) {
        console.error('Error processing article:', articleError)
        // Continue processing other articles even if one fails
      }
    }

    // Update email processing status
    await prisma.emailProcessing.updateMany({
      where: { userId: user.id },
      data: {
        lastProcessedAt: new Date(),
        processingStatus: 'active'
      }
    })

    // Log usage event for analytics
    await prisma.usageEvent.create({
      data: {
        userId: user.id,
        eventType: 'email_processed',
        eventData: {
          newsletterId: newsletter.id,
          articleCount: processedArticles.length,
          aiProcessingEnabled: subscription.aiEnabled
        },
        quotaConsumed: processedArticles.length
      }
    })

    return NextResponse.json({
      status: 'success',
      message: `Processed ${processedArticles.length} articles`,
      data: {
        newsletterId: newsletter.id,
        articleCount: processedArticles.length,
        userId: user.id
      }
    })

  } catch (error) {
    console.error('Error processing email:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Failed to process email'
    }, { status: 500 })
  }
}

// Helper function to generate AI summary
async function generateAISummary(content: string, options: { length: string }): Promise<string | null> {
  if (!content || !process.env.OPENAI_API_KEY) return null

  try {
    let maxTokens = 100 // default for medium
    if (options.length === 'short') maxTokens = 50
    else if (options.length === 'long') maxTokens = 200

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes newsletter articles. Create concise, informative summaries that capture the key points.'
        },
        {
          role: 'user',
          content: `Please summarize this article in ${options.length} length:\n\n${content}`
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.3
    })

    return response.choices[0]?.message?.content?.trim() || null
  } catch (error) {
    console.error('Error generating AI summary:', error)
    return null
  }
}

// Helper function to categorize content
async function categorizeContent(content: string): Promise<string | null> {
  if (!content || !process.env.OPENAI_API_KEY) return null

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a content categorization assistant. Categorize articles into one of these categories: Technology, Business, Finance, Science, Health, Politics, Entertainment, Sports, Lifestyle, Education, Other. Respond with just the category name.'
        },
        {
          role: 'user',
          content: `Categorize this content: ${content.substring(0, 500)}`
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    })

    return response.choices[0]?.message?.content?.trim() || 'Other'
  } catch (error) {
    console.error('Error categorizing content:', error)
    return 'Other'
  }
}

// Helper function to score user interest
async function scoreInterest(content: string, userId: string): Promise<number> {
  if (!content || !process.env.OPENAI_API_KEY) return 0.5

  try {
    // This is a simplified version - you could enhance this by including user's reading history,
    // preferences, and past interactions to make it more personalized
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an interest scoring assistant. Rate how interesting this content would be for a general audience on a scale of 0.0 to 1.0, where 0.0 is not interesting at all and 1.0 is extremely interesting. Consider factors like novelty, relevance, and engagement potential. Respond with just a decimal number.'
        },
        {
          role: 'user',
          content: `Rate this content: ${content.substring(0, 300)}`
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    })

    const score = parseFloat(response.choices[0]?.message?.content?.trim() || '0.5')
    return Math.max(0, Math.min(1, score)) // Ensure score is between 0 and 1
  } catch (error) {
    console.error('Error scoring interest:', error)
    return 0.5 // Default neutral score
  }
}