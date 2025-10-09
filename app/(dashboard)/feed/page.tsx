// app/(dashboard)/feed/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  ExternalLink,
  Sparkles,
  Brain,
  Eye,
  ChevronDown,
  ChevronUp,
  Mail,
  Filter,
  Search,
  RefreshCw,
  Settings as SettingsIcon,
} from 'lucide-react';
import Link from 'next/link';

interface Article {
  id: string;
  subject: string;
  aiGeneratedTitle?: string;
  aiSummary?: string;
  content?: string;
  htmlContent?: string;
  newsletter: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  aiInterestScore?: number;
  publishedAt: string;
  aiTags?: string[];
  aiGeneratedThumbnail?: string;
  isRead: boolean;
  isSaved: boolean;
  readAt?: string;
  url?: string;
}

export default function FeedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'read'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'interest'>('newest');

  useEffect(() => {
    fetchArticles();
  }, [filterBy, sortBy]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        filter: filterBy,
        sort: sortBy,
      });
      
      const response = await fetch(`/api/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaved = async (articleId: string) => {
    try {
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      const response = await fetch(`/api/articles/${articleId}/save`, {
        method: article.isSaved ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        setArticles(prev =>
          prev.map(a =>
            a.id === articleId ? { ...a, isSaved: !a.isSaved } : a
          )
        );
      }
    } catch (error) {
      console.error('Error toggling saved status:', error);
    }
  };

  const markAsRead = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        setArticles(prev =>
          prev.map(a =>
            a.id === articleId ? { ...a, isRead: true, readAt: new Date().toISOString() } : a
          )
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const toggleExpanded = (articleId: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
        // Mark as read when expanding
        if (!articles.find(a => a.id === articleId)?.isRead) {
          markAsRead(articleId);
        }
      }
      return newSet;
    });
  };

  const filteredArticles = articles.filter(article => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      article.subject.toLowerCase().includes(searchLower) ||
      article.aiGeneratedTitle?.toLowerCase().includes(searchLower) ||
      article.aiSummary?.toLowerCase().includes(searchLower) ||
      article.newsletter.name.toLowerCase().includes(searchLower) ||
      article.aiTags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInterestColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-blue-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Feed</h1>
        <p className="text-gray-600">
          {articles.filter(a => !a.isRead).length} unread articles
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Articles</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="interest">Most Interesting</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchArticles}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching articles' : 'No articles yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? 'Try adjusting your search or filters'
              : 'Subscribe to newsletters to start receiving articles'}
          </p>
          {!searchTerm && (
            <Link href="/dashboard/newsletters">
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Browse Newsletters
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => {
            const isExpanded = expandedArticles.has(article.id);
            return (
              <Card
                key={article.id}
                className={`border transition-all hover:shadow-md ${
                  !article.isRead ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Newsletter Info */}
                      <div className="flex items-center gap-2 mb-2">
                        {article.newsletter.logoUrl ? (
                          <img
                            src={article.newsletter.logoUrl}
                            alt={article.newsletter.name}
                            className="w-5 h-5 rounded"
                          />
                        ) : (
                          <Mail className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          {article.newsletter.name}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.aiGeneratedTitle || article.subject}
                      </h3>

                      {/* AI Summary */}
                      {article.aiSummary && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {article.aiSummary}
                        </p>
                      )}

                      {/* Tags & Interest Score */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.aiInterestScore !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            <Brain className={`w-3 h-3 mr-1 ${getInterestColor(article.aiInterestScore)}`} />
                            {Math.round(article.aiInterestScore * 100)}% match
                          </Badge>
                        )}
                        {article.aiTags?.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {!article.isRead && (
                          <Badge className="text-xs bg-blue-100 text-blue-700">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Article Thumbnail */}
                    {article.aiGeneratedThumbnail && (
                      <img
                        src={article.aiGeneratedThumbnail}
                        alt=""
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Expanded Content */}
                  {isExpanded && article.content && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: article.htmlContent || article.content }}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(article.id)}
                      className="flex-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Read More
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSaved(article.id)}
                      className={article.isSaved ? 'text-blue-600' : ''}
                    >
                      {article.isSaved ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </Button>

                    {article.url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}

                    {!article.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(article.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}