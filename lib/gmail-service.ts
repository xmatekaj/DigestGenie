// lib/gmail-service.ts - Gmail API integration service
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

interface EmailData {
  id: string
  threadId: string
  subject: string
  from: string
  to: string
  date: string
  snippet: string
  body: string
  isNewsletter: boolean
}

export class GmailService {
  private oauth2Client: any

  constructor(accessToken: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    )

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })
  }

  /**
   * Fetch emails from Gmail with newsletter filtering
   */
  async fetchEmails(userId: string, maxResults: number = 50): Promise<EmailData[]> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })

      // Get user's subscribed newsletters for filtering
      const subscriptions = await prisma.userNewsletterSubscription.findMany({
        where: { userId },
        include: { newsletter: true }
      })

      const senderEmails = subscriptions.map(sub => sub.newsletter.senderEmail)
      
      // Build Gmail query to filter newsletters
      let query = 'is:unread'
      if (senderEmails.length > 0) {
        const senderQuery = senderEmails.map(email => `from:${email}`).join(' OR ')
        query += ` AND (${senderQuery})`
      }

      console.log('Gmail query:', query)

      // List messages
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      })

      if (!listResponse.data.messages || listResponse.data.messages.length === 0) {
        console.log('No messages found')
        return []
      }

      // Fetch full message details
      const emails: EmailData[] = []
      
      for (const message of listResponse.data.messages) {
        try {
          const messageResponse = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full'
          })

          const email = this.parseGmailMessage(messageResponse.data)
          if (email) {
            emails.push(email)
          }
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error)
          continue
        }
      }

      return emails

    } catch (error) {
      console.error('Gmail API error:', error)
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        throw new Error('Gmail authentication failed. Please re-authenticate.')
      }
      
      throw new Error(`Failed to fetch emails: ${error.message}`)
    }
  }

  /**
   * Parse Gmail message to extract relevant data
   */
  private parseGmailMessage(message: any): EmailData | null {
    try {
      const headers = message.payload?.headers || []
      
      // Extract headers
      const getHeader = (name: string) => 
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

      const subject = getHeader('Subject')
      const from = getHeader('From')
      const to = getHeader('To')
      const date = getHeader('Date')

      // Extract body content
      let body = ''
      if (message.payload?.body?.data) {
        body = Buffer.from(message.payload.body.data, 'base64').toString()
      } else if (message.payload?.parts) {
        body = this.extractBodyFromParts(message.payload.parts)
      }

      // Determine if this looks like a newsletter
      const isNewsletter = this.isNewsletterEmail(subject, from, body)

      return {
        id: message.id,
        threadId: message.threadId,
        subject,
        from,
        to,
        date,
        snippet: message.snippet || '',
        body,
        isNewsletter
      }

    } catch (error) {
      console.error('Error parsing Gmail message:', error)
      return null
    }
  }

  /**
   * Extract body text from Gmail message parts
   */
  private extractBodyFromParts(parts: any[]): string {
    let body = ''
    
    for (const part of parts) {
      if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
        if (part.body?.data) {
          body += Buffer.from(part.body.data, 'base64').toString()
        }
      } else if (part.parts) {
        body += this.extractBodyFromParts(part.parts)
      }
    }
    
    return body
  }

  /**
   * Heuristic to determine if email is a newsletter
   */
  private isNewsletterEmail(subject: string, from: string, body: string): boolean {
    const newsletterKeywords = [
      'newsletter', 'digest', 'weekly', 'daily', 'update', 'roundup',
      'briefing', 'bulletin', 'news', 'unsubscribe', 'mailing list'
    ]

    const text = `${subject} ${from} ${body}`.toLowerCase()
    
    return newsletterKeywords.some(keyword => text.includes(keyword)) ||
           body.includes('unsubscribe') ||
           from.includes('noreply') ||
           from.includes('newsletter')
  }

  /**
   * Mark email as read in Gmail
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
      
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      })
    } catch (error) {
      console.error('Error marking email as read:', error)
    }
  }

  /**
   * Refresh access token if needed
   */
  async refreshTokenIfNeeded(userId: string): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
      // TODO
      // if (!user || !user.tokenExpiry || !user.refreshToken) {
      //   return null
      // }

      // // Check if token is expired (with 5 minute buffer)
      // const now = new Date()
      // const expiry = new Date(user.tokenExpiry)
      // const bufferTime = 5 * 60 * 1000 // 5 minutes

      // if (now.getTime() < (expiry.getTime() - bufferTime)) {
      //   // Token is still valid
      //   return user.accessToken
      // }

      // // Refresh the token
      // this.oauth2Client.setCredentials({
      //   refresh_token: user.refreshToken
      // })

      // const { credentials } = await this.oauth2Client.refreshAccessToken()

      // // Update user with new token
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: {
      //     accessToken: credentials.access_token,
      //     tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
      //     updatedAt: new Date()
      //   }
      // })

      // return credentials.access_token

    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }
}