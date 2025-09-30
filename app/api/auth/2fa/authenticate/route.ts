import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
// /app/api/auth/2fa/authenticate/route.ts - Authenticate with 2FA during login
export async function POST(request: NextRequest) {
  const { email, token } = await request.json()

  const user = await prisma.user.findUnique({
    where: { email },
    include: { user2fa: true }
  })

  if (!user?.user2fa?.[0]?.isEnabled) {
    return NextResponse.json({ error: '2FA not enabled' }, { status: 400 })
  }

  // Check if it's a backup code
  if (user.user2fa[0].backupCodes.includes(token.toUpperCase())) {
    // Remove used backup code
    const updatedCodes = user.user2fa[0].backupCodes.filter(
      code => code !== token.toUpperCase()
    )
    
    await prisma.user2fa.update({
      where: { id: user.user2fa[0].id },
      data: { backupCodes: updatedCodes }
    })

    return NextResponse.json({ success: true, method: 'backup' })
  }

  // Verify TOTP token
  const verified = speakeasy.totp.verify({
    secret: user.user2fa[0].secret,
    encoding: 'base32',
    token,
    window: 1
  })

  if (!verified) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  return NextResponse.json({ success: true, method: 'totp' })
}