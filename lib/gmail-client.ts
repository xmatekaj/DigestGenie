// lib/gmail-client.ts - Real Gmail API client
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL + '/api/auth/callback/google'
);

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export class GmailClient {
  constructor(private accessToken: string, private refreshToken?: string) {
    oauth2Client.setCredentials({
      access_token: this.accessToken,
      refresh_token: this.refreshToken
    });
  }

  async getUnreadEmails(maxResults: number = 20) {
    try {
      console.log('🔍 Fetching unread emails from Gmail...');
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults
      });
      
      const messages = response.data.messages || [];
      console.log(`📧 Found ${messages.length} unread emails`);
      
      return messages;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error(`Failed to fetch emails: ${error.message}`);
    }
  }

  async getEmailDetails(messageId: string) {
    try {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching email details for ${messageId}:`, error);
      return null;
    }
  }

  async markAsRead(messageId: string) {
    try {
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
      return true;
    } catch (error) {
      console.error('Error marking email as read:', error);
      return false;
    }
  }
}

// Email content extraction functions
export function extractEmailContent(payload: any) {
  let textContent = '';
  let htmlContent = '';

  function extractFromPart(part: any) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      textContent += Buffer.from(part.body.data, 'base64').toString('utf-8');
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      htmlContent += Buffer.from(part.body.data, 'base64').toString('utf-8');
    } else if (part.parts) {
      part.parts.forEach(extractFromPart);
    }
  }

  if (payload.parts) {
    payload.parts.forEach(extractFromPart);
  } else if (payload.body?.data) {
    if (payload.mimeType === 'text/plain') {
      textContent = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.mimeType === 'text/html') {
      htmlContent = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }
  }

  return { text: textContent, html: htmlContent };
}

export function isNewsletterEmail(from: string, subject: string): boolean {
  // Known newsletter domains - expanded list
  const newsletterDomains = [
    'morningbrew.com',
    'techcrunch.com',
    'substack.com',
    'thehustle.co',
    'ben-evans.com',
    'stratechery.com',
    'beehiiv.com',
    'convertkit.com',
    'mailchimp.com',
    'constantcontact.com',
    'newsletter.com',
    'ghost.io',
    'buttondown.email',
    'revue.com',
    'tinyletter.com'
  ];

  // Newsletter keywords - expanded list
  const newsletterKeywords = [
    'newsletter',
    'digest',
    'weekly',
    'daily',
    'briefing',
    'roundup',
    'update',
    'bulletin',
    'dispatch',
    'edition',
    'issue',
    'recap',
    'summary',
    'briefing',
    'report'
  ];

  // Common newsletter sender patterns
  const newsletterSenderPatterns = [
    /no-?reply/i,
    /newsletter/i,
    /digest/i,
    /updates?/i,
    /news/i
  ];

  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();

  // Check sender domain
  const emailDomain = fromLower.split('@')[1];
  if (emailDomain && newsletterDomains.some(domain => emailDomain.includes(domain))) {
    return true;
  }

  // Check sender patterns
  if (newsletterSenderPatterns.some(pattern => pattern.test(fromLower))) {
    return true;
  }

  // Check subject for newsletter keywords
  if (newsletterKeywords.some(keyword => subjectLower.includes(keyword))) {
    return true;
  }

  // Check for common unsubscribe patterns (newsletters usually have these)
  if (subjectLower.includes('unsubscribe') || fromLower.includes('unsubscribe')) {
    return true;
  }

  return false;
}

export function extractArticlesFromContent(content: { text: string; html: string }, subject: string) {
  const articles = [];
  
  try {
    // Try to extract from HTML first
    if (content.html) {
      const htmlArticles = extractFromHTML(content.html);
      articles.push(...htmlArticles);
    }
    
    // If no articles found, create one from the entire content
    if (articles.length === 0) {
      const cleanText = content.text || stripHTML(content.html);
      if (cleanText.length > 50) { // Only if there's substantial content
        articles.push({
          title: subject || 'Newsletter Update',
          content: cleanText,
          excerpt: cleanText.substring(0, 300) + (cleanText.length > 300 ? '...' : ''),
          url: ''
        });
      }
    }
  } catch (error) {
    console.error('Error extracting articles:', error);
    // Fallback: create single article from subject
    articles.push({
      title: subject || 'Newsletter Update',
      content: content.text || 'Newsletter content',
      excerpt: subject || 'Newsletter update',
      url: ''
    });
  }
  
  return articles.slice(0, 10); // Limit to 10 articles per email
}

function extractFromHTML(html: string) {
  const articles = [];
  
  try {
    // Look for article titles in various HTML structures
    const titlePatterns = [
      /<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi,
      /<div[^>]*class[^>]*(?:title|headline|header|subject)[^>]*>(.*?)<\/div>/gi,
      /<p[^>]*class[^>]*(?:title|headline|header|subject)[^>]*>(.*?)<\/p>/gi,
      /<td[^>]*class[^>]*(?:title|headline|header|subject)[^>]*>(.*?)<\/td>/gi
    ];
    
    const linkPattern = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    
    let titleMatches = [];
    titlePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(html)) !== null && titleMatches.length < 10) {
        const cleanTitle = stripHTML(match[1]).trim();
        if (cleanTitle.length > 10 && cleanTitle.length < 200) { // Reasonable title length
          titleMatches.push({
            title: cleanTitle,
            fullMatch: match[0]
          });
        }
      }
    });
    
    // Extract links
    let linkMatch;
    const links = [];
    while ((linkMatch = linkPattern.exec(html)) !== null && links.length < 20) {
      const url = linkMatch[1];
      const text = stripHTML(linkMatch[2]).trim();
      
      // Filter out common non-article links
      if (!isUtilityLink(url) && text.length > 5) {
        links.push({
          url: url,
          text: text
        });
      }
    }
    
    // Create articles by matching titles with links
    titleMatches.forEach((titleMatch, index) => {
      const relatedLink = links.find(link => 
        link.text.toLowerCase().includes(titleMatch.title.toLowerCase().split(' ')[0]) ||
        titleMatch.title.toLowerCase().includes(link.text.toLowerCase().split(' ')[0])
      ) || links[index]; // Fallback to sequential matching
      
      articles.push({
        title: titleMatch.title,
        content: `Article: ${titleMatch.title}`,
        excerpt: titleMatch.title.length > 100 ? titleMatch.title.substring(0, 100) + '...' : titleMatch.title,
        url: relatedLink?.url || ''
      });
    });
    
  } catch (error) {
    console.error('Error parsing HTML:', error);
  }
  
  return articles;
}

function stripHTML(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function isUtilityLink(url: string): boolean {
  const utilityPatterns = [
    /unsubscribe/i,
    /preferences/i,
    /settings/i,
    /privacy/i,
    /terms/i,
    /facebook\.com/i,
    /twitter\.com/i,
    /linkedin\.com/i,
    /instagram\.com/i,
    /mailto:/i,
    /\.png$/i,
    /\.jpg$/i,
    /\.gif$/i
  ];
  
  return utilityPatterns.some(pattern => pattern.test(url));
}

export function extractEmailFromHeader(fromHeader: string): string {
  const emailMatch = fromHeader.match(/<(.+?)>/) || fromHeader.match(/(\S+@\S+)/);
  return emailMatch ? emailMatch[1] : fromHeader;
}

export function extractNewsletterName(fromHeader: string): string {
  // Try to extract name before email
  const nameMatch = fromHeader.match(/^(.+?)\s*<.+>$/);
  if (nameMatch) {
    return nameMatch[1].replace(/['"]/g, '').trim();
  }
  
  // If no name found, use domain-based name
  const email = extractEmailFromHeader(fromHeader);
  const domain = email.split('@')[1];
  
  if (domain) {
    const domainName = domain.split('.')[0];
    return domainName.charAt(0).toUpperCase() + domainName.slice(1);
  }
  
  return 'Unknown Newsletter';
}