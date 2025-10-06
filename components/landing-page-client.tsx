// components/landing-page-client.tsx - Updated with better navigation
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
  Plus,
  LayoutDashboard
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
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderEmptyState = () => (
    <div className="text-center py-16">
      <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No articles yet
      </h3>
      <p className="text-gray-600 mb-6">
        {session 
          ? "Subscribe to newsletters to start seeing articles here"
          : "Sign in to subscribe to newsletters and see personalized content"
        }
      </p>
      {session && (
        <Link
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Subscribe to Newsletters
        </Link>
      )}
    </div>
  );

  const renderArticle = (article: Article) => {
    const categoryData = categories.find(c => c.id === article.category);
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
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-12 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
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
      {showAdminBanner && isAdmin && (
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
            
            {/* Updated Navigation */}
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  {/* Show admin panel link for admins */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  )}
                  
                  {/* Show dashboard link for all logged-in users */}
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My Dashboard
                  </Link>
                  
                  {/* User info */}
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{session.user?.email}</span>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Display Controls */}
        <div className="flex items-center justify-between mb-8">
          {/* Category Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All
              {articles.length > 0 && (
                <span className="ml-2 text-xs">({articles.length})</span>
              )}
            </button>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                  {category.articleCount !== undefined && category.articleCount > 0 && (
                    <span className="text-xs">({category.articleCount})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Display Mode Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDisplayMode('cards')}
              className={`p-2 rounded-lg ${
                displayMode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              title="Card view"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`p-2 rounded-lg ${
                displayMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDisplayMode('compact')}
              className={`p-2 rounded-lg ${
                displayMode === 'compact'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
              title="Compact view"
            >
              <Type className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Articles Display */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        ) : (
          <>
            {filteredArticles.length === 0 ? (
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

                {/* CTA Section for non-logged users */}
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