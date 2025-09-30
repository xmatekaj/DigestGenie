// /app/api/auth/2fa/setup/route.ts - 2FA Setup
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import * as speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { user2fa: true }
  })

  if (user?.user2fa?.[0]?.isEnabled) {
    return NextResponse.json({ error: '2FA already enabled' }, { status: 400 })
  }

  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `Newsletter Aggregator (${user?.email})`,
    issuer: 'Newsletter Aggregator',
    length: 32
  })

  // Generate backup codes
  const backupCodes = Array.from({ length: 8 }, () =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  )

  await prisma.user2fa.deleteMany({
    where: { userId: user!.id }
  });
  
  // Create new 2FA record
  await prisma.user2fa.create({
    data: {
      userId: user!.id,
      secret: secret.base32,
      backupCodes: backupCodes,
      isEnabled: false
    }
  });

  // // Store in database (not enabled yet)
  // await prisma.user2fa.upsert({
  //   where: { userId: user!.id },
  //   create: {
  //     userId: user!.id,
  //     secret: secret.base32,
  //     backupCodes,
  //     isEnabled: false
  //   },
  //   update: {
  //     secret: secret.base32,
  //     backupCodes,
  //     isEnabled: false
  //   }
  // })

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

  return NextResponse.json({
    qrCode: qrCodeUrl,
    secret: secret.base32,
    backupCodes
  })
}