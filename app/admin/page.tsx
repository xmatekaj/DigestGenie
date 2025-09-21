// app/admin/page.tsx - Updated admin dashboard with user statistics
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  TrendingUp,
  Eye,
  BarChart3,
  UserCheck,
  Calendar,
  Globe,
  Star,
  RefreshCw
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalNewsletters: number;
  activeNewsletters: number;
  totalSubscriptions: number;
  totalCategories: number;
  recentSignups: number;
  processedEmails: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  newsletterCount: number;
}

interface NewsletterStats {
  id: string;
  name: string;
  senderEmail: string;
  subscriberCount: number;
  lastProcessed: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [topNewsletters, setTopNewsletters] = useState<NewsletterStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch admin statistics
      const [statsResponse, usersResponse, newslettersResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users/recent'),
        fetch('/api/admin/newsletters/top')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setRecentUsers(usersData);
      }

      if (newslettersResponse.ok) {
        const newslettersData = await newslettersResponse.json();
        setTopNewsletters(newslettersData);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of DigestGenie system statistics and user activity</p>
        </div>
        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500">
        Last updated: {lastRefresh.toLocaleString()}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-green-600">
                {stats?.activeUsers || 0} active users
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Newsletter Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalSubscriptions || 0}</p>
              <p className="text-xs text-blue-600">
                {stats?.totalNewsletters || 0} unique newsletters
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Signups</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.recentSignups || 0}</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processed Emails</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.processedEmails || 0}</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users and Top Newsletters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <UserCheck className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name || 'Anonymous User'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                      <p className="text-xs text-blue-600">{user.newsletterCount} newsletters</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent users</h3>
                <p className="mt-1 text-sm text-gray-500">No new user registrations found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Newsletters */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Popular Newsletters</h2>
              <Star className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {topNewsletters.length > 0 ? (
              <div className="space-y-4">
                {topNewsletters.map((newsletter) => (
                  <div key={newsletter.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{newsletter.name}</p>
                        <p className="text-xs text-gray-500">{newsletter.senderEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-900 font-medium">{newsletter.subscriberCount} subscribers</p>
                      <p className="text-xs text-gray-500">
                        Last: {newsletter.lastProcessed ? formatDateTime(newsletter.lastProcessed) : 'Never'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No newsletters</h3>
                <p className="mt-1 text-sm text-gray-500">No newsletter data available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">System Overview</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{stats?.totalCategories || 0}</h3>
              <p className="text-sm text-gray-600">Active Categories</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{stats?.activeNewsletters || 0}</h3>
              <p className="text-sm text-gray-600">Active Newsletters</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {Math.round((stats?.activeUsers || 0) / Math.max(stats?.totalUsers || 1, 1) * 100)}%
              </h3>
              <p className="text-sm text-gray-600">User Engagement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}