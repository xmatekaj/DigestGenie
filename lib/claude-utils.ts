// lib/claude-utils.ts - Claude AI integration utilities
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface SummaryOptions {
  length: 'short' | 'medium' | 'long'
}

interface CategorizationOptions {
  categories?: string[]
}

/**
 * Generate AI summary using Claude
 */
export async function generateAISummary(
  content: string,
  options: SummaryOptions = { length: 'medium' }
): Promise<string | null> {
  if (!content || !process.env.ANTHROPIC_API_KEY) {
    return null
  }

  try {
    const lengthInstructions = {
      short: 'in 1-2 sentences (maximum 50 words)',
      medium: 'in 2-3 sentences (maximum 100 words)',
      long: 'in 3-5 sentences (maximum 200 words)'
    }

    const instruction = lengthInstructions[options.length]

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `Please summarize the following newsletter article ${instruction}. Focus on the key points and main takeaways:

${content}`
        }
      ]
    })

    const summary = response.content[0]
    return summary.type === 'text' ? summary.text.trim() : null
  } catch (error) {
    console.error('Error generating AI summary with Claude:', error)
    return null
  }
}

/**
 * Categorize content using Claude
 */
export async function categorizeContent(
  content: string,
  options: CategorizationOptions = {}
): Promise<string | null> {
  if (!content || !process.env.ANTHROPIC_API_KEY) {
    return null
  }

  try {
    const defaultCategories = [
      'Technology',
      'Business',
      'Finance',
      'Science',
      'Health',
      'Politics',
      'Entertainment',
      'Sports',
      'Lifestyle',
      'Education',
      'Startups',
      'AI/ML',
      'Cryptocurrency',
      'Marketing',
      'Design',
      'Other'
    ]

    const categories = options.categories || defaultCategories
    const categoryList = categories.join(', ')

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 20,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `Categorize the following content into ONE of these categories: ${categoryList}

Content: ${content.substring(0, 500)}

Respond with ONLY the category name, nothing else.`
        }
      ]
    })

    const category = response.content[0]
    if (category.type === 'text') {
      const result = category.text.trim()
      return categories.includes(result) ? result : 'Other'
    }
    
    return 'Other'
  } catch (error) {
    console.error('Error categorizing content with Claude:', error)
    return 'Other'
  }
}

/**
 * Score user interest using Claude
 */
export async function scoreInterest(
  content: string,
  userId?: string,
  userPreferences?: string[]
): Promise<number> {
  if (!content || !process.env.ANTHROPIC_API_KEY) {
    return 0.5 // neutral score
  }

  try {
    let prompt = `Rate how interesting and engaging this content would be for a general audience on a scale of 0.0 to 1.0, where:
- 0.0 = Not interesting at all, boring, irrelevant
- 0.5 = Moderately interesting, average engagement
- 1.0 = Extremely interesting, highly engaging, viral potential

Consider factors like:
- Novelty and uniqueness of information
- Practical value and actionability  
- Relevance to current trends
- Emotional impact and engagement potential
- Clarity and readability

Content: ${content.substring(0, 400)}`

    if (userPreferences && userPreferences.length > 0) {
      prompt += `\n\nUser interests: ${userPreferences.join(', ')}`
      prompt += `\n\nConsider how well this content matches the user's stated interests.`
    }

    prompt += `\n\nRespond with ONLY a decimal number between 0.0 and 1.0, nothing else.`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const scoreText = response.content[0]
    if (scoreText.type === 'text') {
      const score = parseFloat(scoreText.text.trim())
      return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score))
    }

    return 0.5
  } catch (error) {
    console.error('Error scoring interest with Claude:', error)
    return 0.5
  }
}

/**
 * Extract key topics and keywords from content
 */
export async function extractKeywords(
  content: string,
  maxKeywords: number = 5
): Promise<string[]> {
  if (!content || !process.env.ANTHROPIC_API_KEY) {
    return []
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: `Extract the ${maxKeywords} most important keywords or key phrases from this content. These should be the main topics, concepts, or themes discussed.

Content: ${content.substring(0, 500)}

Respond with a comma-separated list of keywords only, no explanations.`
        }
      ]
    })

    const keywordsText = response.content[0]
    if (keywordsText.type === 'text') {
      const keywords = keywordsText.text
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, maxKeywords)
      
      return keywords
    }

    return []
  } catch (error) {
    console.error('Error extracting keywords with Claude:', error)
    return []
  }
}

/**
 * Generate a suggested title for content
 */
export async function generateTitle(
  content: string,
  style: 'news' | 'casual' | 'professional' = 'news'
): Promise<string | null> {
  if (!content || !process.env.ANTHROPIC_API_KEY) {
    return null
  }

  try {
    const styleInstructions = {
      news: 'Create a compelling news-style headline that captures attention',
      casual: 'Create a friendly, conversational title',
      professional: 'Create a professional, formal title'
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      temperature: 0.4,
      messages: [
        {
          role: 'user',
          content: `${styleInstructions[style]} for this content. Keep it under 60 characters and make it engaging.

Content: ${content.substring(0, 300)}

Respond with ONLY the title, no quotes or explanations.`
        }
      ]
    })

    const title = response.content[0]
    return title.type === 'text' ? title.text.trim() : null
  } catch (error) {
    console.error('Error generating title with Claude:', error)
    return null
  }
}

/**
 * Detect if content is promotional/spam
 */
export async function detectSpam(content: string): Promise<boolean> {
  if (!content || !process.env.ANTHROPIC_API_KEY) {
    return false
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `Is this content primarily promotional, spam, or low-quality marketing material? Consider factors like:
- Excessive promotional language
- Multiple calls-to-action
- Misleading claims
- Poor quality writing
- Pure advertisement

Content: ${content.substring(0, 400)}

Respond with ONLY "true" if it's spam/promotional or "false" if it's legitimate content.`
        }
      ]
    })

    const result = response.content[0]
    if (result.type === 'text') {
      return result.text.trim().toLowerCase() === 'true'
    }

    return false
  } catch (error) {
    console.error('Error detecting spam with Claude:', error)
    return false
  }
}