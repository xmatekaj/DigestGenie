// app/(dashboard)/page.tsx - Dashboard Home/Overview
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  TrendingUp, 
  BookMarked,
  Clock,
  Calendar,
  ArrowRight,
  Sparkles,
  Star,
  Eye
} from 'lucide-react';

interface DashboardStats {
  totalNewsletters: number;
  unreadArticles: number;
  savedArticles: number;
  readToday: number;
}

interface RecentArticle {
  id: string;
  title: string;
  newsletter: string;
  publishedAt: string;
  interestScore: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, articlesResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/articles/recent?limit=5')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        setRecentArticles(articlesData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back! 👋</h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your newsletters today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Newsletters</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalNewsletters || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <Link
            href="/dashboard/newsletters"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-4 inline-flex items-center"
          >
            Manage <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Unread Articles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.unreadArticles || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <Link
            href="/dashboard/feed"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-4 inline-flex items-center"
          >
            Read now <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Saved</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.savedArticles || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BookMarked className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <Link
            href="/dashboard/saved"
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium mt-4 inline-flex items-center"
          >
            View saved <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Read Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.readToday || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-4">
            Keep up the great work! 🎉
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Articles</h2>
            <Link
              href="/dashboard/feed"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </Link>
          </div>

          {recentArticles.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No articles yet</p>
              <Link
                href="/dashboard/newsletters"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
              >
                Subscribe to newsletters
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="font-medium text-blue-600">{article.newsletter}</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
                        {article.interestScore}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/newsletters"
                className="block w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                + Add Newsletter
              </Link>
              <Link
                href="/dashboard/settings/email"
                className="block w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                📧 Get System Email
              </Link>
              <Link
                href="/dashboard/settings/ai"
                className="block w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                ✨ Configure AI
              </Link>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Pro Tip</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use AI to automatically categorize and summarize your newsletter content for faster reading!
            </p>
            <Link
              href="/dashboard/settings/ai"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
              Enable AI Features <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Upgrade Banner */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
            <Star className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-2">Upgrade to Pro</h3>
            <p className="text-sm mb-4 text-white/90">
              Unlock unlimited newsletters, advanced AI features, and more!
            </p>
            <Link
              href="/dashboard/settings/billing"
              className="block w-full py-2 px-4 bg-white text-orange-600 hover:bg-gray-100 rounded-lg text-sm font-bold text-center transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}