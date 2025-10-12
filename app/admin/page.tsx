// app/admin/page.tsx - Full admin dashboard implementation
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  RefreshCw,
  Settings,
  Tag,
  Plus,
  ExternalLink
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
  isPredefined: boolean;
  isActive: boolean;
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
        fetch('/api/admin/newsletters')
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
        setTopNewsletters(newslettersData.slice(0, 5));
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAdminData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
  href="/admin/inbox"
  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
>
  <div className="flex items-center">
    <Mail className="w-8 h-8 text-indigo-600" />
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-900">Inbox</p>
      <p className="text-xs text-gray-500">View all emails</p>
    </div>
  </div>
</Link>
        <Link
          href="/admin/categories"
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Tag className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Categories</p>
              <p className="text-xs text-gray-500">Manage topics</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/newsletters"
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Newsletters</p>
              <p className="text-xs text-gray-500">Email sources</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Users</p>
              <p className="text-xs text-gray-500">User management</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">System Settings</p>
              <p className="text-xs text-gray-500">Configuration</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Newsletters</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalNewsletters || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalSubscriptions || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Tag className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalCategories || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Newsletter Management Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Newsletter Management</h2>
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/newsletters"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
              <Link
                href="/admin/newsletters"
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Newsletter
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {topNewsletters.length > 0 ? (
              <div className="space-y-4">
                {topNewsletters.map((newsletter) => (
                  <div key={newsletter.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{newsletter.name}</h3>
                      <p className="text-sm text-gray-500">{newsletter.senderEmail}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        newsletter.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-1 inline-block ${
                          newsletter.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        {newsletter.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {newsletter.subscriberCount} subs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No newsletters yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first newsletter.</p>
                <div className="mt-4">
                  <Link
                    href="/admin/newsletters"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Newsletter
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link
              href="/admin/users"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.newsletterCount} newsletter{user.newsletterCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users yet</h3>
                <p className="mt-1 text-sm text-gray-500">Users will appear here as they sign up.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Active Users (30d)</div>
              <div className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">Processed Emails</div>
              <div className="text-2xl font-bold text-blue-600">{stats?.processedEmails || 0}</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-medium text-gray-900">New Signups (7d)</div>
              <div className="text-2xl font-bold text-purple-600">{stats?.recentSignups || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
