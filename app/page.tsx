// app/page.tsx - Replace your current landing page
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  LogIn
} from 'lucide-react';

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
    newsletter: 'Benedict Evans',
    publishedAt: new Date(2025, 8, 14),
    readTime: '8 min read',
    aiIcon: '🌐',
    interestScore: 87
  }
];

export default function PublicLandingPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeframe, setTimeframe] = useState('today');
  const [displayMode, setDisplayMode] = useState('cards');
  const [currentPage, setCurrentPage] = useState(0);
  const [dbCategories, setDbCategories] = useState([]);

  // Fetch categories from database
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setDbCategories(data))
      .catch(err => console.log('Using mock data:', err));
  }, []);

  // Use database categories if available, otherwise use mock data
  const displayCategories = dbCategories.length > 0 ? dbCategories : categories;

  // Filter articles based on selected category and timeframe
  const filteredArticles = mockArticles.filter(article => {
    if (selectedCategory !== 'all' && article.category !== selectedCategory) return false;
    
    const now = new Date();
    const articleDate = article.publishedAt;
    
    switch (timeframe) {
      case 'today':
        return articleDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return articleDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return articleDate >= monthAgo;
      default:
        return true;
    }
  });

  const articlesPerPage = 6;
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const paginatedArticles = filteredArticles.slice(
    currentPage * articlesPerPage,
    (currentPage + 1) * articlesPerPage
  );

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const DisplayModeIcon = ({ mode }) => {
    switch (mode) {
      case 'icons':
        return <Grid3X3 className="w-4 h-4" />;
      case 'list':
        return <List className="w-4 h-4" />;
      case 'minimal':
        return <Type className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  const renderArticle = (article) => {
    const categoryInfo = displayCategories.find(cat => cat.id === article.category || cat.name.toLowerCase() === article.category);
    
    switch (displayMode) {
      case 'icons':
        return (
          <div key={article.id} className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg font-bold mr-4">
              {article.aiIcon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">{article.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{article.newsletter}</p>
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {article.readTime}
              </div>
            </div>
          </div>
        );
        
      case 'list':
        return (
          <div key={article.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-lg mr-2">{article.aiIcon}</span>
                <h3 className="font-semibold text-gray-900">{article.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-4">{article.newsletter}</span>
                <span className="mr-4">{formatDate(article.publishedAt)}</span>
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        );
        
      case 'minimal':
        return (
          <div key={article.id} className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">{article.title}</h3>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{article.newsletter}</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>
        );
        
      default: // cards
        return (
          <div key={article.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                  {article.aiIcon}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${categoryInfo?.color || 'from-gray-400 to-gray-500'}`}></div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{categoryInfo?.name}</span>
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-3 leading-tight">{article.title}</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">{article.summary}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="mr-4">{article.newsletter}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{article.readTime}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs font-medium text-green-600">{article.interestScore}% match</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">{formatDate(article.publishedAt)}</span>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Read Article →
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-40">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            DigestGenie
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your AI Newsletter Aggregator</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Categories</h3>
            
            <button
              onClick={() => setSelectedCategory('all')}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-4 h-4 mr-3" />
              All Categories
            </button>
            
            {displayCategories.map((category) => {
              const IconComponent = category.icon || Globe;
              const categoryId = category.id || category.name.toLowerCase();
              const categoryName = category.name;
              
              return (
                <button
                  key={categoryId}
                  onClick={() => setSelectedCategory(categoryId)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedCategory === categoryId 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  {categoryName}
                  <span className="ml-auto text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {mockArticles.filter(a => a.category === categoryId).length}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
          <Link href="/auth/signin">
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center">
              <LogIn className="w-4 h-4 mr-2" />
              Login / Register
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'All Categories' : displayCategories.find(c => (c.id || c.name.toLowerCase()) === selectedCategory)?.name}
            </h2>
            
            <div className="flex items-center space-x-4">
              {/* Timeframe Filter */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              
              {/* Display Mode */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {['cards', 'icons', 'list', 'minimal'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setDisplayMode(mode)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        displayMode === mode 
                          ? 'bg-white shadow text-blue-600' 
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      <DisplayModeIcon mode={mode} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Login Button */}
              <Link href="/admin">
                <button className="text-sm bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                  Admin
                </button>
              </Link>
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
  );
}