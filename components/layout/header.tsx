'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
} from 'lucide-react'

export function Header() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
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

        {/* Header Actions */}
        <div className="flex items-center space-x-4">
          {/* Magic Filter */}
          <Button variant="outline" size="sm" className="hidden sm:flex items-center">
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

          {/* Upgrade Badge */}
          <Badge className="bg-gradient-to-r from-magic-500 to-genie-500 text-white hover:from-magic-600 hover:to-genie-600 cursor-pointer">
            <Crown className="w-3 h-3 mr-1" />
            Free Genie
            <Sparkles className="w-3 h-3 ml-1" />
          </Badge>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-genie-500 to-magic-500 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="hidden sm:inline font-medium">
                  {session?.user?.name?.split(' ')[0] || 'Genie User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name || 'Genie User'}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Genie Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <Crown className="mr-2 h-4 w-4" />
                <span>Upgrade Magic</span>
                <Badge className="ml-auto bg-magic-100 text-magic-700">Pro</Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center text-red-600 focus:text-red-600"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}