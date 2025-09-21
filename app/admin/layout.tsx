// app/admin/layout.tsx - Correct admin layout (no CSS imports needed)
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Tag, 
  Users, 
  Settings, 
  ArrowLeft 
} from 'lucide-react';

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me'
  ];
  return adminEmails.includes(email);
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const userIsAdmin = await isAdmin(session.user.email);

  if (!userIsAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single Admin Navigation Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">DigestGenie Admin</span>
              </Link>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex space-x-1">
                <Link 
                  href="/admin" 
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/admin/categories" 
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  <span>Categories</span>
                </Link>
                <Link 
                  href="/admin/users" 
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </Link>
                <Link 
                  href="/admin/settings" 
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </nav>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session.user.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to App</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}