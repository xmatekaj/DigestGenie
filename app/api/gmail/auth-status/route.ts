// app/api/gmail/auth-status/route.ts - Check Gmail authentication status
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Gmail integration not yet implemented
    return NextResponse.json({
      isConnected: false,
      hasValidTokens: false,
      lastSync: null,
      syncEnabled: false
    });

  } catch (error) {
    console.error('Error checking Gmail status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}