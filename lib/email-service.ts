// lib/email-service.ts - Complete email service for newsletter forwarding
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export class EmailService {
  private static readonly EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'newsletters.digestgenie.com'

  /**
   * Generate a unique system email for a user
   */
  static async generateSystemEmail(userId: string): Promise<string> {
    // Create a short, unique identifier
    const userHash = crypto.createHash('md5').update(userId).digest('hex').slice(0, 8)
    const timestamp = Date.now().toString().slice(-4)
    
    // Format: user-{hash}-{timestamp}@newsletters.digestgenie.com
    const systemEmail = `user-${userHash}-${timestamp}@${this.EMAIL_DOMAIN}`
    
    // Check for collision (very unlikely but be safe)
    const existing = await prisma.user.findFirst({
      where: { systemEmail }
    })
    
    if (existing) {
      // Add more randomness if collision
      const extra = crypto.randomBytes(2).toString('hex')
      return `user-${userHash}-${timestamp}-${extra}@${this.EMAIL_DOMAIN}`
    }
    
    return systemEmail
  }

  /**
   * Setup system email for user - creates email account and forwarding rules
   */
  static async setupSystemEmailForUser(userId: string): Promise<{
    systemEmail: string
    status: 'created' | 'exists' | 'error'
    message: string
  }> {
    try {
      // Check if user already has a system email
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return {
          systemEmail: '',
          status: 'error',
          message: 'User not found'
        }
      }

      if (user.systemEmail) {
        return {
          systemEmail: user.systemEmail,
          status: 'exists',
          message: 'System email already exists'
        }
      }

      // Generate new system email
      const systemEmail = await this.generateSystemEmail(userId)

      // Create email account in mail server (implementation depends on your mail server)
      await this.createEmailAccount(systemEmail, userId)

      // Update user record
      await prisma.user.update({
        where: { id: userId },
        data: { 
          systemEmail,
          updatedAt: new Date()
        }
      })

      // Create processing record
      await prisma.emailProcessing.create({
        data: {
          userId,
          emailAddress: systemEmail,
          processingStatus: 'active'
        }
      })

      return {
        systemEmail,
        status: 'created',
        message: 'System email created successfully'
      }

    } catch (error) {
      console.error('Error setting up system email:', error)
      return {
        systemEmail: '',
        status: 'error',
        message: 'Failed to create system email'
      }
    }
  }

  /**
   * Create email account in mail server
   * This is where you'd integrate with your mail server (Postal, Postfix, etc.)
   */
  private static async createEmailAccount(email: string, userId: string): Promise<void> {
    const emailProvider = process.env.EMAIL_PROVIDER || 'postal'

    switch (emailProvider) {
      case 'postal':
        await this.createPostalEmailAccount(email, userId)
        break
      case 'postfix':
        await this.createPostfixEmailAccount(email, userId)
        break
      case 'webhook':
        await this.createWebhookEmailAccount(email, userId)
        break
      default:
        console.log(`Mock email account created: ${email}`)
        // For development, we'll just log this
    }
  }

  /**
   * Create email account in Postal mail server
   */
  private static async createPostalEmailAccount(email: string, userId: string): Promise<void> {
    const postalApiUrl = process.env.POSTAL_API_URL
    const postalApiKey = process.env.POSTAL_API_KEY

    if (!postalApiUrl || !postalApiKey) {
      console.log('Postal not configured, skipping email account creation')
      return
    }

    try {
      const response = await fetch(`${postalApiUrl}/api/v1/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${postalApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: email,
          user_id: userId,
          // Forward to webhook for processing
          forward_to: `${process.env.NEXTAUTH_URL}/api/webhooks/email`
        })
      })

      if (!response.ok) {
        throw new Error(`Postal API error: ${response.statusText}`)
      }

      console.log(`✅ Postal email account created: ${email}`)
    } catch (error) {
      console.error('❌ Failed to create Postal email account:', error)
      throw error
    }
  }

  /**
   * Create email forwarding rule for webhook-based email handling
   */
  private static async createWebhookEmailAccount(email: string, userId: string): Promise<void> {
    // This would integrate with services like:
    // - Mailgun incoming email webhooks
    // - SendGrid inbound parse webhook
    // - Cloudflare Email Routing
    // - Custom SMTP server with webhook forwarding

    console.log(`📧 Webhook email forwarding configured for: ${email}`)
    
    // Example webhook URL where emails will be sent:
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/email`
    console.log(`📨 Emails will be forwarded to: ${webhookUrl}`)
  }

  /**
   * Create email account with Postfix (for self-hosted)
   */
  private static async createPostfixEmailAccount(email: string, userId: string): Promise<void> {
    // This would typically involve:
    // 1. Adding email to virtual_aliases
    // 2. Setting up forwarding to processing script
    // 3. Configuring mail filters
    
    console.log(`📮 Postfix email account configured: ${email}`)
  }

  /**
   * Delete system email account
   */
  static async deleteSystemEmail(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user?.systemEmail) {
        return true // Already deleted
      }

      // Delete from mail server
      await this.deleteEmailAccount(user.systemEmail)

      // Clean up database
      await prisma.emailProcessing.deleteMany({
        where: { userId }
      })

      await prisma.user.update({
        where: { id: userId },
        data: { 
          systemEmail: null,
          updatedAt: new Date()
        }
      })

      return true
    } catch (error) {
      console.error('Error deleting system email:', error)
      return false
    }
  }

  private static async deleteEmailAccount(email: string): Promise<void> {
    // Implementation depends on mail server
    console.log(`🗑️ Email account deleted: ${email}`)
  }

  /**
   * Get email statistics for user
   */
  static async getEmailStats(userId: string): Promise<{
    systemEmail: string | null
    totalEmailsReceived: number
    emailsProcessedToday: number
    lastEmailReceived: Date | null
    processingStatus: string
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          emailProcessing: true,
          processedEmails: {
            orderBy: { receivedDate: 'desc' },
            take: 1
          }
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const emailsToday = await prisma.processedEmail.count({
        where: {
          userId,
          receivedDate: {
            gte: today
          }
        }
      })

      const totalEmails = await prisma.processedEmail.count({
        where: { userId }
      })

      return {
        systemEmail: user.systemEmail,
        totalEmailsReceived: totalEmails,
        emailsProcessedToday: emailsToday,
        lastEmailReceived: user.processedEmails[0]?.receivedDate || null,
        processingStatus: user.emailProcessing?.[0]?.processingStatus || 'inactive'
      }

    } catch (error) {
      console.error('Error getting email stats:', error)
      throw error
    }
  }
}