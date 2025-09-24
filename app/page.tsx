// app/page.tsx - Alternative server-side approach (more reliable)
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
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
  
  // If user is logged in, check if they're admin and redirect accordingly
  if (session?.user?.email) {
    const userIsAdmin = await isAdmin(session.user.email);
    if (userIsAdmin) {
      redirect('/admin');
    }
  }

  // Pass session to client component
  return <LandingPageClient session={session} />;
}