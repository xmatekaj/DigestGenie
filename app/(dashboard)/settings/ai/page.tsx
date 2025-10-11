// app/(dashboard)/settings/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  User,
  Bell,
  Mail,
  Shield,
  Sparkles,
  CreditCard,
  ChevronRight,
  Settings as SettingsIcon,
  Key,
  Palette
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();

  const settingSections: SettingSection[] = [
    {
      id: 'account',
      title: 'Account Settings',
      description: 'Manage your account information and preferences',
      icon: User,
      href: '/dashboard/settings/account'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure email and push notifications',
      icon: Bell,
      href: '/dashboard/settings/notifications'
    },
    {
      id: 'email',
      title: 'Email Preferences',
      description: 'Set up your newsletter forwarding email',
      icon: Mail,
      href: '/dashboard/settings/email'
    },
    {
      id: 'ai',
      title: 'AI Features',
      description: 'Customize AI summarization and categorization',
      icon: Sparkles,
      href: '/dashboard/settings/ai'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize the look and feel',
      icon: Palette,
      href: '/dashboard/settings/appearance'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Password, 2FA, and privacy settings',
      icon: Shield,
      href: '/dashboard/settings/security'
    },
    {
      id: 'billing',
      title: 'Billing & Subscription',
      description: 'Manage your subscription and payment methods',
      icon: CreditCard,
      href: '/dashboard/settings/billing'
    },
    {
      id: 'api',
      title: 'API Keys',
      description: 'Manage API access and integrations',
      icon: Key,
      href: '/dashboard/settings/api'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {session?.user?.name || 'User'}
            </h2>
            <p className="text-gray-600">{session?.user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                Free Plan
              </span>
              <span className="text-xs text-gray-500">
                3/3 newsletters used
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/settings/billing"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.id}
              href={section.href}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-lg hover:shadow-md transition-shadow">
            <Mail className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Get System Email</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-lg hover:shadow-md transition-shadow">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-gray-900">Test AI Features</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-white rounded-lg hover:shadow-md transition-shadow">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Enable 2FA</span>
          </button>
        </div>
      </div>
    </div>
  );
}