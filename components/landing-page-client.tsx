// components/landing-page-client.tsx - Updated without mock articles
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Session } from 'next-auth';
import { 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  BookOpen,
  Zap,
  Code,
  Cpu,
  Briefcase,
  Globe,
  TrendingUp,
  User,
  Settings,
  Filter,
  Grid3X3,
  List,
  Image,
  Type,
  LogIn,
  Shield,
  X,
  ExternalLink,
  Mail,
  Plus
} from 'lucide-react';

interface LandingPageClientProps {
  session: Session | null;
  isAdmin: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  articleCount?: number;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  newsletter: string;
  publishedAt: Date;
  readTime: string;
  aiIcon: string;
  interestScore: number;
}

export default function LandingPageClient({ session, isAdmin }: LandingPageClientProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<'cards' | 'list' | 'compact'>('cards');
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdminBanner, setShowAdminBanner] = useState(false);

  const itemsPerPage = 6;

  useEffect(() => {
    if (isAdmin) {
      setShowAdminBanner(true);
    }
    fetchCategories();
    fetchArticles();
  }, [isAdmin]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const categoriesWithIcons = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: getIconComponent(cat.icon),
          color: cat.color,
          articleCount: cat.articleCount || 0
        }));
        setCategories(categoriesWithIcons);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set empty categories if fetch fails
      setCategories([]);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles/public');
      if (response.ok) {
        const data = await response.json();
        setArticles(data);
      } else {
        // If no public articles endpoint or no articles, show empty
        setArticles([]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'Zap': Zap,
      'Code': Code,
      'Cpu': Cpu,
      'Briefcase': Briefcase,
      'Globe': Globe,
      'TrendingUp': TrendingUp,
    };
    return iconMap[iconName] || Globe;
  };

  const dismissAdminBanner = () => {
    setShowAdminBanner(false);
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <Mail className="mx-auto h-16 w-16 text-gray-300" />
      <h3 className="mt-4 text-xl font-medium text-gray-900">
        Welcome to DigestGenie
      </h3>
      <p className="mt-2 text-gray-500 max-w-md mx-auto">
        Start by subscribing to newsletters to see curated articles here. 
        Our AI will help you discover the most relevant content.
      </p>
      {session ? (
        <div className="mt-8 space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
          <div>
            <Link
              href="/dashboard/newsletters"
              className="inline-flex items-center px-4 py-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              Browse Newsletters →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Get Started
          </Link>
        </div>
      )}
    </div>
  );

  const renderArticle = (article: Article) => {
    const categoryData = categories.find(cat => cat.id === article.category);
    const IconComponent = categoryData?.icon || Globe;

    switch (displayMode) {
      case 'list':
        return (
          <div key={article.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${categoryData?.color} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-blue-600">{article.newsletter}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{formatDate(article.publishedAt)}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{article.readTime}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{article.summary}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl">{article.aiIcon}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${article.interestScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{article.interestScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'compact':
        return (
          <div key={article.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryData?.color} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{article.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-blue-600">{article.newsletter}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{formatDate(article.publishedAt)}</span>
                </div>
              </div>
              <span className="text-lg">{article.aiIcon}</span>
            </div>
          </div>
        );

      default: // cards
        return (
          <div key={article.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-gray-300">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryData?.color} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-blue-600">{article.newsletter}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{formatDate(article.publishedAt)}</span>
                    <span className="text-gray-300">•</span>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{article.readTime}</span>
                  </div>
                </div>
                <span className="text-2xl">{article.aiIcon}</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{article.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{article.summary}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" 
                      style={{ width: `${article.interestScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{article.interestScore}% match</span>
                </div>
                <BookOpen className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Banner */}
      {showAdminBanner && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">Admin Panel Active</span>
                <Link 
                  href="/admin" 
                  className="text-sm underline hover:no-underline"
                >
                  Manage System
                </Link>
              </div>
              <button 
                onClick={dismissAdminBanner}
                className="p-1 hover:bg-purple-500 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  DigestGenie
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{session.user?.name}</span>
                  </div>
                </div>
              ) : (
                <Link href="/auth/signin" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading content...</p>
          </div>
        ) : (
          <>
            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setCurrentPage(0);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    All Categories
                    {articles.length > 0 && (
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedCategory === 'all' ? 'bg-blue-500' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {articles.length}
                      </span>
                    )}
                  </button>
                  
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    const categoryArticles = articles.filter(article => article.category === category.id);
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setCurrentPage(0);
                        }}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category.id
                            ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{category.name}</span>
                        {categoryArticles.length > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {categoryArticles.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Controls */}
            {articles.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                  </span>
                  {selectedCategory !== 'all' && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setCurrentPage(0);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear filter
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
                    <button
                      onClick={() => setDisplayMode('cards')}
                      className={`p-2 rounded ${displayMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDisplayMode('list')}
                      className={`p-2 rounded ${displayMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDisplayMode('compact')}
                      className={`p-2 rounded ${displayMode === 'compact' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Type className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Articles or Empty State */}
            {articles.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                {/* Articles Grid */}
                <div className={`grid gap-6 ${
                  displayMode === 'cards' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                  displayMode === 'list' ? 'grid-cols-1' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {paginatedArticles.map(renderArticle)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium ${
                            currentPage === i
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* CTA Section */}
                {!session && (
                  <div className="text-center mt-16 py-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Ready to personalize your experience?
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Sign in to subscribe to newsletters, save articles, and get AI-powered recommendations.
                    </p>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Get Started Free
                    </Link>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}