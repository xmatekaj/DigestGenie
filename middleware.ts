import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// CRITICAL: Read admin emails and log them
const adminEmailsRaw = process.env.ADMIN_EMAILS || '';
console.log('[Middleware Init] ADMIN_EMAILS env var:', adminEmailsRaw);

const adminEmails = adminEmailsRaw
  ? adminEmailsRaw.split(',').map(e => e.trim().toLowerCase())
  : ['admin@digestgenie.com', 'matekaj@proton.me', 'xmatekaj@gmail.com'];

console.log('[Middleware Init] Parsed admin emails:', adminEmails);

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    // Get user email and normalize it (lowercase, trim)
    const userEmail = token?.email?.toLowerCase().trim();
    
    // Check if user is admin
    const isAdmin = userEmail && adminEmails.includes(userEmail);
    
    // Log for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('======================================');
      console.log('[Middleware] Path:', path);
      console.log('[Middleware] User email:', userEmail);
      console.log('[Middleware] Is Admin?:', isAdmin);
      console.log('======================================');
    }
    
    // Block non-admins from /admin routes
    if (path.startsWith('/admin') && !isAdmin) {
      console.log('[Middleware] ❌ Blocking non-admin from /admin, redirecting to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // Allow admins to access both /admin and /dashboard
    // No redirect - let them choose where they want to go
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*'
  ],
};