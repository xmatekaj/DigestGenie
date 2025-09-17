'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bookmark, 
  Star, 
  Clock, 
  ExternalLink,
  Sparkles,
  Brain,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Mock data - in real app, this would come from your API
const mockArticles = [
  {
    id: '1',
    subject: 'The Future of AI in 2024: What to Expect',
    aiGeneratedTitle: '🤖 AI Breakthroughs Set to Transform Industries This Year',
    aiSummary: 'Major AI developments expected in healthcare, autonomous vehicles, and creative tools. Key players like OpenAI and Google are releasing game-changing models.',
    newsletter: {
      name: 'TechCrunch',
      logoUrl: '/api/placeholder/32/32'
    },
    interestScore: 94,
    receivedAt: '2024-01-15T10:30:00Z',
    tags: ['AI', 'Technology', 'Innovation'],
    aiThumbnailUrl: '/api/placeholder/400/200',
    isRead: false,
    isSaved: false
  },
  {
    id: '2',
    subject: 'Weekly Market Update - January 2024',
    aiGeneratedTitle: '📈 Market Surge Continues as Tech Stocks Rally',
    aiSummary: 'S&P 500 reaches new highs driven by AI and clean energy investments. Bitcoin shows stability above $40K threshold.',
    newsletter: {
      name: 'Morning Brew',
      logoUrl: '/api/placeholder/32/32'
    },
    interestScore: 87,
    receivedAt: '2024-01-15T09:00:00Z',
    tags: ['Finance', 'Markets', 'Investment'],
    aiThumbnailUrl: '/api/placeholder/400/200',
    isRead: true,
    isSaved: true
  },
  {
    id: '3',
    subject: 'New JavaScript Framework Trends',
    aiGeneratedTitle: '⚛️ React 19 and Next.js 15 Lead Development Revolution',
    aiSummary: 'Server components and improved performance metrics are changing how developers build applications. Migration guides available.',
    newsletter: {
      name: 'JavaScript Weekly',
      logoUrl: '/api/placeholder/32/32'
    },
    interestScore: 91,
    receivedAt: '2024-01-15T08:00:00Z',
    tags: ['Development', 'JavaScript', 'Frameworks'],
    aiThumbnailUrl: '/api/placeholder/400/200',
    isRead: false,
    isSaved: false
  }
]

interface Article {
  id: string
  subject: string
  aiGeneratedTitle: string
  aiSummary: string
  newsletter: {
    name: string
    logoUrl: string
  }
  interestScore: number
  receivedAt: string
  tags: string[]
  aiThumbnailUrl?: string
  isRead: boolean
  isSaved: boolean
}

export function NewsletterFeed() {
  const [articles, setArticles] = useState<Article[]>(mockArticles)
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set())

  const toggleSaved = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, isSaved: !article.isSaved }
        : article
    ))
  }

  const toggleExpanded = (articleId: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }

  const markAsRead = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, isRead: true }
        : article
    ))
  }

  return (
    <div className="space-y-4 p-6">
      {articles.map((article) => (
        <Card key={article.id} className={`border transition-all hover:shadow-md ${
          !article.isRead ? 'border-l-4 border-l-genie-500 bg-gradient-to-r from-genie-50/30 to-transparent' : ''
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <img
                  src={article.newsletter.logoUrl}
                  alt={article.newsletter.name}
                  className="w-8 h-8 rounded-lg bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {article.newsletter.name}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        article.interestScore >= 90 ? 'border-green-300 text-green-700 bg-green-50' :
                        article.interestScore >= 80 ? 'border-magic-300 text-magic-700 bg-magic-50' :
                        'border-gray-300 text-gray-700 bg-gray-50'
                      }`}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {article.interestScore}% match
                    </Badge>
                    {!article.isRead && (
                      <Badge className="bg-genie-100 text-genie-700 text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                    {article.aiGeneratedTitle}
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSaved(article.id)}
                  className={`${article.isSaved ? 'text-magic-600 hover:text-magic-700' : 'text-gray-400 hover:text-magic-600'}`}
                >
                  <Bookmark className={`w-4 h-4 ${article.isSaved ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(article.id)}
                >
                  {expandedArticles.has(article.id) ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* AI-generated thumbnail */}
            {article.aiThumbnailUrl && (
              <div className="mb-4">
                <img
                  src={article.aiThumbnailUrl}
                  alt="AI-generated article illustration"
                  className="w-full h-32 object-cover rounded-lg bg-gradient-to-r from-genie-100 to-magic-100"
                />
              </div>
            )}

            {/* AI Summary */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-genie-600" />
                <span className="text-sm font-medium text-genie-700">Genie Summary</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {article.aiSummary}
              </p>
            </div>

            {/* Full content (when expanded) */}
            {expandedArticles.has(article.id) && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Original Subject:</h4>
                <p className="text-gray-700 text-sm italic mb-3">{article.subject}</p>
                <p className="text-gray-600 text-sm">
                  This is where the full newsletter content would appear. In the real application, 
                  this would show the complete email content with proper formatting and links.
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(article.receivedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!article.isRead && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRead(article.id)}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Mark Read
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open('#', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Original
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More */}
      <div className="text-center pt-6">
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-genie-50 to-magic-50 hover:from-genie-100 hover:to-magic-100"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Load More Magic
        </Button>
      </div>
    </div>
  )
}
