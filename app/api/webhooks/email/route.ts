// app/api/webhooks/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, from, subject, html, text } = body;

    // Find user by system email
    const user = await prisma.user.findFirst({
      where: { systemEmail: to }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Store raw email for processing
    await prisma.rawEmail.create({
      data: {
        userId: user.id,
        sender: from,
        subject: subject,
        receivedDate: new Date(),
        rawContent: html || text || '',
        processed: false
      }
    });

    // Email processing is handled by n8n workflows
    // This endpoint just receives and stores the webhook data
    console.log('Email received:', { to, from, subject });

    return NextResponse.json({ 
      success: true,
      message: 'Email received and queued for processing' 
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}