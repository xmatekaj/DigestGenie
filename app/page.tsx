// app/page.tsx - Landing page without automatic redirects
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LandingPageClient from '@/components/landing-page-client';

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me',
    'xmatekaj@gmail.com'
  ];
  return adminEmails.includes(email);
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin (but don't redirect - let them see the landing page)
  let userIsAdmin = false;
  
  if (session?.user?.email) {
    userIsAdmin = await isAdmin(session.user.email);
  }
  
  // Pass session and admin status to client component
  // Let the user navigate to dashboard/admin via the UI
  return <LandingPageClient session={session} isAdmin={userIsAdmin} />;
}