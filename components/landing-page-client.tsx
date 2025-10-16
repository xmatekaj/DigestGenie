// components/landing-page-client.tsx
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
  LayoutDashboard,
  ChevronDown
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
  source: string;
  date: string;
  readTime: string;
  category: string;
  interestScore: number;
  summary?: string;
  imageUrl?: string;
}

export default function LandingPageClient({ session, isAdmin }: LandingPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<'cards' | 'list' | 'compact'>('cards');
  const [showAdminBanner, setShowAdminBanner] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const dismissAdminBanner = () => {
    setShowAdminBanner(false);
    localStorage.setItem('adminBannerDismissed', 'true');
  };

  const categories: Category[] = [
    { id: 'all', name: 'All News', icon: Globe, color: 'blue', articleCount: 42 },
    { id: 'tech', name: 'Technology', icon: Cpu, color: 'purple', articleCount: 15 },
    { id: 'ai', name: 'AI & ML', icon: Zap, color: 'pink', articleCount: 8 },
    { id: 'code', name: 'Development', icon: Code, color: 'green', articleCount: 12 },
    { id: 'business', name: 'Business', icon: Briefcase, color: 'orange', articleCount: 7 },
    { id: 'trending', name: 'Trending', icon: TrendingUp, color: 'red', articleCount: 5 },
  ];

  const mockArticles: Article[] = [
    {
      id: '1',
      title: 'The Future of AI in Software Development',
      source: 'TechCrunch',
      date: '2024-01-15',
      readTime: '5 min',
      category: 'ai',
      interestScore: 95,
      summary: 'Exploring how artificial intelligence is revolutionizing the way we write and maintain code...',
      imageUrl: 'https://via.placeholder.com/400x200'
    },
    {
      id: '2',
      title: 'New JavaScript Framework Released',
      source: 'Dev.to',
      date: '2024-01-14',
      readTime: '3 min',
      category: 'code',
      interestScore: 87,
      summary: 'A new lightweight framework promises better performance and developer experience...'
    },
    {
      id: '3',
      title: 'Startup Funding Trends in 2024',
      source: 'Morning Brew',
      date: '2024-01-14',
      readTime: '4 min',
      category: 'business',
      interestScore: 72,
      summary: 'Analysis of investment patterns and emerging sectors in the startup ecosystem...'
    },
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? mockArticles 
    : mockArticles.filter(article => article.category === selectedCategory);

  const renderArticle = (article: Article) => {
    switch (displayMode) {
      case 'cards':
        return (
          <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {article.imageUrl && (
              <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {article.source}
                </span>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h3>
              {article.summary && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{article.summary}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5" style={{ width: '60px' }}>
                      <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${article.interestScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{article.interestScore}% match</span>
                  </div>
                </div>
                <BookOpen className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {article.source}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(article.date).toLocaleDateString()}</span>
                  <span className="text-xs text-gray-500">• {article.readTime}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">{article.title}</h3>
                {article.summary && (
                  <p className="text-sm text-gray-600 line-clamp-1">{article.summary}</p>
                )}
              </div>
              {article.imageUrl && (
                <img src={article.imageUrl} alt={article.title} className="w-24 h-24 object-cover rounded-lg ml-4" />
              )}
            </div>
          </div>
        );

      case 'compact':
        return (
          <div key={article.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{article.title}</h3>
                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <div className="flex items-center space-x-1">
                  <div className="w-12 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full" 
                      style={{ width: `${article.interestScore}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{article.interestScore}%</span>
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
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  DigestGenie
                </h1>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {session ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="hidden sm:inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Admin Panel</span>
                    </Link>
                  )}
                  
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <LayoutDashboard className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">My Dashboard</span>
                  </Link>
                  
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{session.user?.email}</span>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-gray-900 px-3 sm:px-4 py-2 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <LogIn className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Get Started</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filters and Display Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          
          {/* Category Filters - Combobox on Mobile, Horizontal Scroll on Desktop */}
          {isMobile ? (
            <div className="relative w-full">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.articleCount})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category.id
                        ? `bg-${category.color}-50 text-${category.color}-600 border border-${category.color}-200`
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {category.articleCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Display Mode Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDisplayMode('cards')}
              className={`p-2 rounded-lg transition-colors ${
                displayMode === 'cards' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Card view"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                displayMode === 'list' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDisplayMode('compact')}
              className={`p-2 rounded-lg transition-colors ${
                displayMode === 'compact' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title="Compact view"
            >
              <Type className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        <div className={
          displayMode === 'cards' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
            : 'flex flex-col space-y-3 sm:space-y-4'
        }>
          {filteredArticles.map(article => renderArticle(article))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">Try selecting a different category</p>
          </div>
        )}
      </main>
    </div>
  );
}