import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// /app/api/subscriptions/route.ts - Newsletter subscriptions
export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      userNewsletterSubscriptions: {
        include: {
          newsletter: true
        }
      }
    }
  })

  return NextResponse.json({ userNewsletterSubscriptions: user?.userNewsletterSubscriptions || [] })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { newsletterId, customCategory, displayPreference } = await request.json()

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  const subscription = await prisma.userNewsletterSubscription.create({
    data: {
      userId: user!.id,
      newsletterId,
      customCategory,
      displayPreference,
    }
  })

  return NextResponse.json({ subscription })
}