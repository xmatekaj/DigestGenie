import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';

const prisma = new PrismaClient();
// /app/api/auth/2fa/verify/route.ts - Verify and enable 2FA
export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { token } = await request.json()

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { user2fa: true }
  })

  if (!user?.user2fa) {
    return NextResponse.json({ error: '2FA not set up' }, { status: 400 })
  }

  // Verify token
  const verified = speakeasy.totp.verify({
    secret: user.user2fa[0].secret,
    encoding: 'base32',
    token,
    window: 1
  })

  if (!verified) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  // Enable 2FA
  await prisma.user2fa.update({
    where: { id: user.user2fa[0].id },
    data: { isEnabled: true }
  })

  return NextResponse.json({ success: true })
}