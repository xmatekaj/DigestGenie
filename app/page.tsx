// app/page.tsx - Improved approach with admin notification instead of auto-redirect
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LandingPageClient from '@/components/landing-page-client';

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me'
  ];
  return adminEmails.includes(email);
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin but don't force redirect
  let userIsAdmin = false;
  if (session?.user?.email) {
    userIsAdmin = await isAdmin(session.user.email);
  }

  // Pass both session and admin status to client component
  return <LandingPageClient session={session} isAdmin={userIsAdmin} />;
}