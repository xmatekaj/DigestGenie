// lib/email-utils.ts - Email processing utilities
import crypto from 'crypto'

/**
 * Generate a unique system email for a user
 */
export async function generateSystemEmail(userId: string): Promise<string> {
  const emailDomain = process.env.EMAIL_DOMAIN || 'newsletters.localhost'
  
  // Create a short, unique identifier based on user ID
  const shortId = userId.slice(0, 8)
  const timestamp = Date.now().toString().slice(-4)
  
  // Generate a more unique identifier if needed
  const hash = crypto.createHash('md5').update(userId).digest('hex').slice(0, 6)
  
  return `user-${shortId}-${hash}@${emailDomain}`
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Extract domain from email address
 */
export function extractDomainFromEmail(email: string): string {
  const match = email.match(/@(.+)$/)
  return match ? match[1] : ''
}

/**
 * Check if email is from our system
 */
export function isSystemEmail(email: string): boolean {
  const emailDomain = process.env.EMAIL_DOMAIN || 'newsletters.localhost'
  return email.endsWith(`@${emailDomain}`)
}

/**
 * Parse system email to extract user info
 */
export function parseSystemEmail(email: string): { userId?: string } {
  const emailDomain = process.env.EMAIL_DOMAIN || 'newsletters.localhost'
  
  if (!email.endsWith(`@${emailDomain}`)) {
    return {}
  }
  
  // Extract user identifier from email pattern: user-{shortId}-{hash}@domain
  const localPart = email.split('@')[0]
  const match = localPart.match(/^user-([a-f0-9]{8})-([a-f0-9]{6})$/)
  
  if (match) {
    return { userId: match[1] }
  }
  
  return {}
}