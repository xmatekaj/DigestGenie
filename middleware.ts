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
    
    // ALWAYS log for debugging
    console.log('======================================');
    console.log('[Middleware] Path:', path);
    console.log('[Middleware] Token exists:', !!token);
    console.log('[Middleware] Token email (raw):', token?.email);
    console.log('[Middleware] User email (normalized):', userEmail);
    console.log('[Middleware] Admin emails array:', adminEmails);
    console.log('[Middleware] Is Admin?:', isAdmin);
    console.log('======================================');
    
    // Redirect admins from /dashboard to /admin
    if (isAdmin && path === '/dashboard') {
      console.log('[Middleware] ✅ Redirecting admin from /dashboard to /admin');
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    
    // Block non-admins from /admin routes
    if (path.startsWith('/admin') && !isAdmin) {
      console.log('[Middleware] ❌ Blocking non-admin from /admin, redirecting to /dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // Allow access
    console.log('[Middleware] ✅ Allowing access to', path);
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
