// app/(dashboard)/dashboard/saved/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bookmark,
  BookmarkCheck,
  Clock,
  ExternalLink,
  Mail,
  Sparkles,
  Trash2
} from 'lucide-react'

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
  aiThumbnailUrl?: string
  isRead: boolean
  isSaved: boolean
  url?: string
}

export default function SavedPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedArticles()
  }, [])

  const fetchSavedArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/articles/saved')
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      } else {
        console.error('Failed to fetch saved articles')
        setArticles([])
      }
    } catch (error) {
      console.error('Error fetching saved articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const unsaveArticle = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/save`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        // Remove from list
        setArticles(prev => prev.filter(article => article.id !== articleId))
      }
    } catch (error) {
      console.error('Error unsaving article:', error)
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
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Saved Articles</h1>
          <p className="text-gray-600 mt-2">
            Your bookmarked articles for later reading
          </p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading saved articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookmarkCheck className="h-8 w-8 text-blue-600" />
              Saved Articles
            </h1>
            <p className="text-gray-600 mt-2">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'} saved for later
            </p>
          </div>
        </div>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bookmark className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No saved articles yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Articles you bookmark will appear here. Visit your Feed to save articles for later reading.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id} className="border transition-all hover:shadow-md">
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
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                          <BookmarkCheck className="w-3 h-3 mr-1" />
                          Saved
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 leading-tight">
                        {article.aiGeneratedTitle || article.subject}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(article.receivedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => unsaveArticle(article.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {article.aiSummary && (
                  <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {article.aiSummary}
                      </p>
                    </div>
                  </div>
                )}
                
                {article.url && (
                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        Read full article
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}