'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Crown,
  Sparkles,
  Filter,
  Home,
  Shield,
  ChevronDown,
} from 'lucide-react'

const adminEmails = ['admin@digestgenie.com', 'matekaj@proton.me', 'xmatekaj@gmail.com'];

export function Header() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Check if user is admin
  const isAdmin = session?.user?.email && adminEmails.includes(session.user.email)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showUserMenu])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Search Bar */}
        <div className="flex items-center space-x-4 flex-1">
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Ask your genie... ✨"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-genie-300 focus:ring-genie-200"
              />
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-3">
          {/* Magic Filter - Hidden on mobile */}
          <Button variant="outline" size="sm" className="hidden lg:flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Magic Filter
          </Button>

          {/* Notifications */}
          <Button variant="outline" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-magic-500 text-white text-xs">
              3
            </Badge>
          </Button>

          {/* Upgrade Badge - Hidden on mobile */}
          <Badge className="hidden md:flex bg-gradient-to-r from-magic-500 to-genie-500 text-white hover:from-magic-600 hover:to-genie-600 cursor-pointer">
            <Crown className="w-3 h-3 mr-1" />
            Free Genie
            <Sparkles className="w-3 h-3 ml-1" />
          </Badge>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

          {/* Admin Panel Link (if admin) */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md transition-colors"
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
              <div className="w-8 h-8 bg-gradient-to-br from-genie-500 to-magic-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.name?.split(' ')[0] || 'Genie User'}
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
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'Genie User'}</p>
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