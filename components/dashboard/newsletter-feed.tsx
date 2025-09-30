// components/dashboard/newsletter-feed.tsx
'use client'

import { useState, useEffect } from 'react'
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
  ChevronUp,
  Mail,
  Plus,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  subject: string
  aiGeneratedTitle?: string
  aiSummary?: string
  content?: string
  newsletter: {
    name: string
    logoUrl?: string
  }
  interestScore?: number
  receivedAt: string
  tags?: string[]
  aiThumbnailUrl?: string
  isRead: boolean
  isSaved: boolean
  url?: string
}

interface NewsletterFeedProps {
  className?: string
}

export function NewsletterFeed({ className }: NewsletterFeedProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/articles')
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      } else {
        console.error('Failed to fetch articles')
        setArticles([])
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const toggleSaved = async (articleId: string) => {
    try {
      const article = articles.find(a => a.id === articleId)
      if (!article) return

      const response = await fetch(`/api/articles/${articleId}/save`, {
        method: article.isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isSaved: !article.isSaved }
            : article
        ))
      }
    } catch (error) {
      console.error('Error toggling saved status:', error)
    }
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

  const markAsRead = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        setArticles(prev => prev.map(article => 
          article.id === articleId 
            ? { ...article, isRead: true }
            : article
        ))
      }
    } catch (error) {
      console.error('Error marking article as read:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  if (loading) {
    return (
      <div className={`space-y-4 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className={`space-y-4 p-6 ${className}`}>
        <div className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No articles yet</h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">
            Subscribe to newsletters to start receiving articles. Your personalized feed will appear here.
          </p>
          <div className="mt-6 space-y-2">
            <Link href="/dashboard/newsletters">
              <Button className="inline-flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Browse Newsletters
              </Button>
            </Link>
            <div>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="inline-flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Email
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Articles</h2>
        <div className="text-sm text-gray-500">
          {articles.filter(a => !a.isRead).length} unread
        </div>
      </div>

      {articles.map((article) => (
        <Card 
          key={article.id} 
          className={`border transition-all hover:shadow-md cursor-pointer ${
            !article.isRead ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/30 to-transparent' : ''
          }`}
          onClick={() => !article.isRead && markAsRead(article.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {article.newsletter.logoUrl ? (
                  <img
                    src={article.newsletter.logoUrl}
                    alt={article.newsletter.name}
                    className="w-8 h-8 rounded-lg bg-gray-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {article.newsletter.name}
                    </span>
                    {article.interestScore && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          article.interestScore >= 90 ? 'border-green-300 text-green-700 bg-green-50' :
                          article.interestScore >= 80 ? 'border-blue-300 text-blue-700 bg-blue-50' :
                          'border-gray-300 text-gray-700 bg-gray-50'
                        }`}
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        {article.interestScore}% match
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-tight">
                    {article.aiGeneratedTitle || article.subject}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDate(article.receivedAt)}
                    </span>
                    {!article.isRead && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSaved(article.id)
                  }}
                  className={article.isSaved ? 'text-blue-600' : 'text-gray-400'}
                >
                  <Bookmark className={`w-4 h-4 ${article.isSaved ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpanded(article.id)
                  }}
                >
                  {expandedArticles.has(article.id) ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedArticles.has(article.id) && (
            <CardContent className="pt-0">
              {article.aiThumbnailUrl && (
                <img
                  src={article.aiThumbnailUrl}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {article.aiSummary || article.content?.substring(0, 300) + '...'}
                </p>
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  {article.aiSummary && (
                    <div className="flex items-center text-xs text-blue-600">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Enhanced
                    </div>
                  )}
                </div>
                
                {article.url && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(article.url, '_blank')
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Read Original
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}