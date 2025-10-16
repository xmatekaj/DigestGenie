// components/layout/header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { 
  User, 
  ChevronDown, 
  Settings, 
  LogOut, 
  Crown, 
  Shield, 
  Home,
  Menu
} from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Check if user is admin
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me',
    'xmatekaj@gmail.com'
  ]
  const isAdmin = session?.user?.email ? adminEmails.includes(session.user.email) : false

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          {/* Hamburger Menu - Mobile Only */}
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Upgrade Button - Desktop Only */}
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-sm">
            <Crown className="w-4 h-4" />
            <span>Upgrade to Pro</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Admin Panel Link - Desktop Only */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-md p-2 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name?.split(' ')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                {/* User Info (shown on mobile) */}
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>

                {/* Admin Panel Link (mobile only) */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 sm:hidden"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Link>
                )}

                {/* Settings */}
                <Link
                  href="/dashboard/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>

                {/* Upgrade (mobile only) */}
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </button>

                <div className="border-t border-gray-100 my-1"></div>

                {/* Back to Main Page */}
                <Link
                  href="/"
                  className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Back to Main Page
                </Link>

                {/* Logout */}
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}