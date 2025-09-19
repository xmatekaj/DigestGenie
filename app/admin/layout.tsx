// app/admin/layout.tsx - Fixed with proper session handling
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';

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
  
  console.log('Admin Layout - Session:', session); // Debug log
  
  if (!session?.user?.email) {
    console.log('No session, redirecting to signin'); // Debug log
    redirect('/auth/signin');
  }

  const userIsAdmin = await isAdmin(session.user.email);
  console.log('User is admin:', userIsAdmin, 'Email:', session.user.email); // Debug log

  if (!userIsAdmin) {
    console.log('User not admin, redirecting to dashboard'); // Debug log
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                DigestGenie Admin
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/admin/categories" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Categories
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}