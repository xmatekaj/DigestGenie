// app/api/admin/check/route.ts
import { NextRequest, NextResponse } from 'next/server';

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'xmatekaj@gmail.com'
  ];
  return adminEmails.includes(email);
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }

    const adminStatus = await isAdmin(email);
    
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}