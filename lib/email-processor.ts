// /lib/email-processor.ts - Updated with usage tracking
export class EmailProcessor {
  static async processEmail(rawEmailId: string) {
    const rawEmail = await prisma.rawEmail.findUnique({
      where: { id: rawEmailId },
      include: { user: true }
    })

    if (!rawEmail || rawEmail.processed) return

    try {
      // Check if user can process more articles
      const canProcess = await SubscriptionService.checkUsageLimit(
        rawEmail.userId, 
        'articles_monthly'
      )

      if (!canProcess) {
        console.log(`User ${rawEmail.userId} has reached article processing limit`)
        // Mark as processed but don't actually process
        await prisma.rawEmail.update({
          where: { id: rawEmailId },
          data: { processed: true }
        })
        return
      }

      // Extract clean content
      const content = extractContent(rawEmail.rawContent)
      
      // Check if AI features are available
      const hasAISummaries = await SubscriptionService.hasFeatureAccess(
        rawEmail.userId, 
        'ai_summaries'
      )
      
      const hasAIThumbnails = await SubscriptionService.hasFeatureAccess(
        rawEmail.userId, 
        'ai_thumbnails'
      )

      // Identify or create newsletter
      const newsletter = await this.identifyNewsletter(rawEmail.sender, content)
      
      let aiEnhancements = {
        summary: content.text.substring(0, 200) + '...',
        title: rawEmail.subject,
        interestScore: 50,
        tags: [],
        shouldGenerateThumbnail: false
      }

      // Generate AI enhancements if available
      if (hasAISummaries) {
        aiEnhancements = await this.generateAIEnhancements(content, rawEmail.user)
        await SubscriptionService.trackUsage(rawEmail.userId, 'ai_summary_generated')
      }

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

      // Generate thumbnail if available and requested
      if (hasAIThumbnails && aiEnhancements.shouldGenerateThumbnail) {
        await this.generateThumbnail(article.id, content.text)
        await SubscriptionService.trackUsage(rawEmail.userId, 'ai_thumbnail_generated')
      }

      // Track usage
      await SubscriptionService.trackUsage(rawEmail.userId, 'article_processed', {
        newsletterName: newsletter.name,
        articleId: article.id
      })

      // Mark as processed
      await prisma.rawEmail.update({
        where: { id: rawEmailId },
        data: { processed: true }
      })

    } catch (error) {
      console.error('Email processing error:', error)
      // Handle error...
    }
  }

  
}