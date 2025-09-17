// /lib/email-processor.ts - Email processing logic
import { prisma } from '@/lib/prisma'
import { OpenAI } from 'openai'
import { extractContent } from './content-extractor'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export class EmailProcessor {
  static async processEmail(rawEmailId: string) {
    const rawEmail = await prisma.rawEmail.findUnique({
      where: { id: rawEmailId },
      include: { user: true }
    })

    if (!rawEmail || rawEmail.processed) return

    try {
      // Extract clean content
      const content = extractContent(rawEmail.rawContent)
      
      // Identify or create newsletter
      const newsletter = await this.identifyNewsletter(rawEmail.sender, content)
      
      // Generate AI enhancements
      const aiEnhancements = await this.generateAIEnhancements(content, rawEmail.user)
      
      // Create article record
      const article = await prisma.article.create({
        data: {
          newsletterId: newsletter.id,
          userId: rawEmail.userId,
          subject: rawEmail.subject,
          content: content.html,
          plainContent: content.text,
          senderEmail: rawEmail.sender,
          receivedAt: rawEmail.receivedDate,
          aiSummary: aiEnhancements.summary,
          aiGeneratedTitle: aiEnhancements.title,
          aiInterestScore: aiEnhancements.interestScore,
          aiTags: aiEnhancements.tags,
          processingStatus: 'completed',
          processedAt: new Date(),
        }
      })

      // Generate thumbnail if needed
      if (aiEnhancements.shouldGenerateThumbnail) {
        await this.generateThumbnail(article.id, content.text)
      }

      // Mark as processed
      await prisma.rawEmail.update({
        where: { id: rawEmailId },
        data: { processed: true }
      })

    } catch (error) {
      console.error('Email processing error:', error)
      
      // Mark job as failed
      await prisma.processingJob.updateMany({
        where: {
          jobType: 'email_processing',
          payload: { path: ['rawEmailId'], equals: rawEmailId }
        },
        data: { status: 'failed', errorMessage: error.message }
      })
    }
  }

  private static async identifyNewsletter(senderEmail: string, content: any) {
    const senderDomain = senderEmail.split('@')[1]
    
    let newsletter = await prisma.newsletter.findFirst({
      where: {
        OR: [
          { senderEmail },
          { senderDomain }
        ]
      }
    })

    if (!newsletter) {
      // Create new newsletter entry
      newsletter = await prisma.newsletter.create({
        data: {
          name: this.extractNewsletterName(content, senderEmail),
          senderEmail,
          senderDomain,
          isPredefine: false,
        }
      })
    }

    return newsletter
  }

  private static async generateAIEnhancements(content: any, user: any) {
    const userPreferences = await prisma.userPreference.findUnique({
      where: { userId: user.id }
    })

    const prompt = `
      Analyze this newsletter content and provide:
      1. A concise summary (2-3 sentences)
      2. An engaging title
      3. Interest score (0-100) based on these keywords: ${userPreferences?.aiInterestKeywords?.join(', ')}
      4. Relevant tags (max 5)
      5. Whether a thumbnail should be generated (boolean)

      Content: ${content.text.substring(0, 2000)}
      
      Response format (JSON):
      {
        "summary": "...",
        "title": "...",
        "interestScore": 85,
        "tags": ["tech", "ai"],
        "shouldGenerateThumbnail": true
      }
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    return JSON.parse(response.choices[0].message.content!)
  }

  private static async generateThumbnail(articleId: string, content: string) {
    try {
      const imagePrompt = `Create a clean, professional thumbnail for a newsletter article about: ${content.substring(0, 200)}...`
      
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imagePrompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      })

      const imageUrl = imageResponse.data[0].url
      
      // Store the image URL
      await prisma.article.update({
        where: { id: articleId },
        data: { aiThumbnailUrl: imageUrl }
      })

    } catch (error) {
      console.error('Thumbnail generation error:', error)
    }
  }
}