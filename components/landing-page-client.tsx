// components/landing-page-client.tsx - Updated with admin notification banner
'use client';

import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';

interface LandingPageClientProps {
  session: Session | null;
  isAdmin: boolean;
}

// Mock data for predefined newsletters and articles
const categories = [
  { id: 'technology', name: 'Technology', icon: Zap, color: 'from-blue-500 to-cyan-500' },
  { id: 'programming', name: 'Programming', icon: Code, color: 'from-green-500 to-emerald-500' },
  { id: 'electronics', name: 'Electronics', icon: Cpu, color: 'from-purple-500 to-violet-500' },
  { id: 'business', name: 'Business', icon: Briefcase, color: 'from-orange-500 to-red-500' },
  { id: 'startup', name: 'Startup', icon: TrendingUp, color: 'from-pink-500 to-rose-500' },
  { id: 'global', name: 'Global News', icon: Globe, color: 'from-indigo-500 to-blue-500' }
];

const mockArticles = [
  {
    id: 1,
    title: 'AI Revolution in Software Development',
    summary: 'How artificial intelligence is transforming the way we write, test, and deploy code in 2025.',
    category: 'technology',
    newsletter: 'TechCrunch Daily',
    publishedAt: new Date(2025, 8, 17),
    readTime: '5 min read',
    aiIcon: '🤖',
    interestScore: 95
  },
  {
    id: 2,
    title: 'React 19 Major Features Unveiled',
    summary: 'Exploring the groundbreaking concurrent rendering improvements and new hooks system.',
    category: 'programming',
    newsletter: 'React Newsletter',
    publishedAt: new Date(2025, 8, 16),
    readTime: '7 min read',
    aiIcon: '⚛️',
    interestScore: 88
  },
  {
    id: 3,
    title: 'Quantum Computing Breakthrough',
    summary: 'Scientists achieve 99.9% fidelity in quantum error correction, bringing us closer to practical quantum computers.',
    category: 'electronics',
    newsletter: 'IEEE Spectrum',
    publishedAt: new Date(2025, 8, 15),
    readTime: '6 min read',
    aiIcon: '⚡',
    interestScore: 92
  },
  {
    id: 4,
    title: 'Startup Funding Trends 2025',
    summary: 'Analysis of venture capital patterns and emerging investment opportunities in the current market.',
    category: 'startup',
    newsletter: 'The Hustle',
    publishedAt: new Date(2025, 8, 17),
    readTime: '4 min read',
    aiIcon: '💰',
    interestScore: 79
  },
  {
    id: 5,
    title: 'Remote Work Infrastructure Evolution',
    summary: 'How companies are investing in next-generation remote collaboration tools and virtual office spaces.',
    category: 'business',
    newsletter: 'Morning Brew',
    publishedAt: new Date(2025, 8, 16),
    readTime: '6 min read',
    aiIcon: '🏢',
    interestScore: 85
  },
  {
    id: 6,
    title: 'Edge Computing Market Expansion',
    summary: 'The rapid growth of edge computing solutions and their impact on IoT and real-time applications.',
    category: 'technology',
    newsletter: 'Wired',
    publishedAt: new Date(2025, 8, 14),
    readTime: '8 min read',
    aiIcon: '🌐',
    interestScore: 90
  }
];

const displayModes = [
  { id: 'cards', name: 'Cards', icon: Grid3X3 },
  { id: 'list', name: 'List', icon: List },
  { id: 'icons', name: 'Icons', icon: Image },
  { id: 'titles', name: 'Titles', icon: Type }
];

function DisplayModeIcon({ mode }: { mode: string }) {
  const modeData = displayModes.find(m => m.id === mode);
  const IconComponent = modeData?.icon || Grid3X3;
  return <IconComponent className="w-4 h-4" />;
}

export default function LandingPageClient({ session, isAdmin }: LandingPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [displayMode, setDisplayMode] = useState('cards');
  const [showAdminBanner, setShowAdminBanner] = useState(isAdmin);
  
  const itemsPerPage = 6;

  const filteredArticles = selectedCategory === 'all' 
    ? mockArticles 
    : mockArticles.filter(article => article.category === selectedCategory);

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

  const renderArticle = (article: typeof mockArticles[0]) => {
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
                  <span className="text-sm text-gray-500">Interest: {article.interestScore}%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'icons':
        return (
          <div key={article.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow text-center">
            <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${categoryData?.color} flex items-center justify-center mx-auto mb-3`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
            <p className="text-xs text-gray-500 mb-2">{article.newsletter}</p>
            <span className="text-lg">{article.aiIcon}</span>
          </div>
        );

      case 'titles':
        return (
          <div key={article.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryData?.color} flex items-center justify-center`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-600">{article.newsletter}</span>
              <span className="text-xs text-gray-500">{formatDate(article.publishedAt)}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{article.title}</h3>
          </div>
        );

      default: // cards
        return (
          <div key={article.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`h-2 bg-gradient-to-r ${categoryData?.color}`}></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-blue-600">{article.newsletter}</span>
                </div>
                <span className="text-2xl">{article.aiIcon}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <span className="font-medium">Interest: {article.interestScore}%</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Admin Banner */}
      {isAdmin && showAdminBanner && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">
                  You have admin access. 
                </span>
                <Link 
                  href="/admin" 
                  className="inline-flex items-center space-x-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors"
                >
                  <span>Go to Admin Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <button 
                onClick={() => setShowAdminBanner(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DigestGenie</h1>
            </div>

            <div className="flex items-center space-x-4">
              {session ? (
                <div className="flex items-center space-x-3">
                  {isAdmin && (
                    <Link href="/admin">
                      <button className="flex items-center space-x-2 text-sm bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                        <Shield className="w-4 h-4" />
                        <span>Admin</span>
                      </button>
                    </Link>
                  )}
                  <Link href="/dashboard">
                    <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Go to Dashboard
                    </button>
                  </Link>
                </div>
              ) : (
                <Link href="/auth/signin">
                  <button className="flex items-center text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-12 px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your AI-Powered Newsletter Hub
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover curated content from the world's best newsletters. 
            Let AI help you find what matters most.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white mx-4 rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Category Filter */}
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setCurrentPage(0);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setCurrentPage(0);
                        }}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Mode */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {displayModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setDisplayMode(mode.id)}
                      className={`p-2 transition-colors ${
                        displayMode === mode.id
                          ? 'bg-white shadow text-blue-600' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <DisplayModeIcon mode={mode.id} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="p-6">
            <div className={`grid gap-6 ${
              displayMode === 'cards' ? 'md:grid-cols-2 xl:grid-cols-3' :
              displayMode === 'icons' ? 'md:grid-cols-2 xl:grid-cols-4' :
              'grid-cols-1'
            }`}>
              {paginatedArticles.map(renderArticle)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-4">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="flex items-center px-4 py-2 text-sm bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-8 h-8 rounded-full text-sm ${
                        currentPage === i
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="flex items-center px-4 py-2 text-sm bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}