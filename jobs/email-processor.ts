// jobs/email-processor.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EmailProcessor {
  /**
   * Process a raw email and extract articles
   * @param rawEmailId - ID of the raw email to process
   */
  static async processEmail(rawEmailId: string) {
    console.log(`Processing email: ${rawEmailId}`);
    
    try {
      // Fetch the raw email from database
      const rawEmail = await prisma.rawEmail.findUnique({
        where: { id: rawEmailId }
      });

      if (!rawEmail) {
        throw new Error(`Raw email not found: ${rawEmailId}`);
      }

      // Parse email content
      const articles = this.extractArticles(rawEmail.rawContent, rawEmail.subject);

      // Find or create newsletter
      let newsletter = await prisma.newsletter.findFirst({
        where: {
          OR: [
            { senderEmail: rawEmail.sender },
            { senderDomain: this.extractDomain(rawEmail.sender) }
          ]
        }
      });

      if (!newsletter) {
        newsletter = await prisma.newsletter.create({
          data: {
            name: this.extractNewsletterName(rawEmail.sender, rawEmail.subject),
            senderEmail: rawEmail.sender,
            senderDomain: this.extractDomain(rawEmail.sender),
            frequency: 'unknown',
            isActive: true,
            isPredefined: false
          }
        });
      }

      // Create articles in database
      for (const article of articles) {
        await prisma.newsletterArticle.create({
          data: {
            userId: rawEmail.userId,
            newsletterId: newsletter.id,
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            url: article.url,
            publishedAt: rawEmail.receivedDate,
            processedAt: new Date(),
            sourceEmailId: rawEmail.id,
            sourceSubject: rawEmail.subject,
            isRead: false,
            isSaved: false
          }
        });
      }

      // Mark email as processed
      await prisma.rawEmail.update({
        where: { id: rawEmailId },
        data: { processed: true }
      });

      console.log(`Successfully processed email ${rawEmailId}: ${articles.length} articles extracted`);
      
      return {
        success: true,
        articlesCount: articles.length,
        newsletterId: newsletter.id
      };

    } catch (error) {
      console.error(`Error processing email ${rawEmailId}:`, error);
      throw error;
    }
  }

  /**
   * Extract articles from email content
   */
  private static extractArticles(rawContent: string, subject: string) {
    const articles = [];
    
    try {
      // Extract links from content
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
      // TODO
    //   const matches = [...rawContent.matchAll(linkRegex)];

    //   if (matches.length > 0) {
    //     // Create article for each link found
    //     matches.forEach((match, index) => {
    //       const url = match[1];
    //       const title = this.cleanText(match[2]);
          
    //       // Skip common footer/unsubscribe links
    //       if (this.isValidArticleLink(url, title)) {
    //         articles.push({
    //           title: title,
    //           url: url,
    //           content: '',
    //           excerpt: title
    //         });
    //       }
    //     });
    //   }

      // If no valid articles found, create one from the entire email
      if (articles.length === 0) {
        const textContent = this.stripHtml(rawContent);
        articles.push({
          title: subject || 'Newsletter Update',
          url: '',
          content: textContent,
          excerpt: textContent.substring(0, 300) + '...'
        });
      }

      return articles.slice(0, 20); // Limit to 20 articles per email

    } catch (error) {
      console.error('Error extracting articles:', error);
      // Fallback: return single article
      return [{
        title: subject || 'Newsletter Update',
        url: '',
        content: rawContent,
        excerpt: subject || 'Newsletter content'
      }];
    }
  }

  /**
   * Check if URL is a valid article link
   */
  private static isValidArticleLink(url: string, title: string): boolean {
    const invalidPatterns = [
      /unsubscribe/i,
      /privacy/i,
      /terms/i,
      /manage.*preferences/i,
      /view.*browser/i,
      /mailto:/i,
      /facebook\.com/i,
      /twitter\.com/i,
      /linkedin\.com/i,
      /instagram\.com/i
    ];

    // Check if URL or title matches invalid patterns
    const isInvalid = invalidPatterns.some(pattern => 
      pattern.test(url) || pattern.test(title)
    );

    // Check minimum title length
    const hasValidTitle = title.length > 10;

    return !isInvalid && hasValidTitle;
  }

  /**
   * Extract domain from email address
   */
  private static extractDomain(email: string): string {
    const parts = email.split('@');
    return parts.length > 1 ? parts[1] : email;
  }

  /**
   * Extract newsletter name from sender or subject
   */
  private static extractNewsletterName(sender: string, subject: string): string {
    // Try to extract from sender email
    const domain = this.extractDomain(sender);
    const domainParts = domain.split('.');
    
    if (domainParts.length > 1) {
      // Capitalize first letter
      const name = domainParts[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Fallback to subject
    return subject.substring(0, 50) || 'Unknown Newsletter';
  }

  /**
   * Strip HTML tags from text
   */
  private static stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Clean text by removing extra whitespace and decoding entities
   */
  private static cleanText(text: string): string {
    return text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
}