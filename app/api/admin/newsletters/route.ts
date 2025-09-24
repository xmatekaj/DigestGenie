// app/api/admin/newsletters/route.ts - Fixed syntax error
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Check if user is admin
async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me'
  ];
  return adminEmails.includes(email);
}

// GET /api/admin/newsletters - Fetch all newsletters for admin management
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    console.log('🔍 Fetching newsletters for admin panel...');

    // Fetch all newsletters with subscriber counts
    const newsletters = await prisma.newsletters.findMany({
      include: {
        _count: {
          select: {
            userNewsletterSubscriptions: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: [
        { isPredefined: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform to match frontend expectations
    const transformedNewsletters = newsletters.map(newsletter => ({
      id: newsletter.id,
      name: newsletter.name,
      description: newsletter.description || '',
      senderEmail: newsletter.senderEmail || '',
      senderDomain: newsletter.senderDomain || '',
      websiteUrl: newsletter.websiteUrl || '',
      logoUrl: newsletter.logoUrl || '',
      frequency: newsletter.frequency || 'weekly',
      isPredefined: newsletter.isPredefined,
      isActive: newsletter.isActive,
      subscriberCount: newsletter._count.userNewsletterSubscriptions,
      createdAt: newsletter.createdAt.toISOString(),
      updatedAt: newsletter.updatedAt.toISOString()
    }));

    console.log(`✅ Returning ${transformedNewsletters.length} newsletters`);
    return NextResponse.json(transformedNewsletters);

  } catch (error) {
    console.error('❌ Failed to fetch admin newsletters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/newsletters - Create new newsletter
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { 
      name, 
      description, 
      senderEmail, 
      senderDomain,
      websiteUrl, 
      logoUrl, 
      frequency, 
      isPredefined,
      isActive 
    } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Newsletter name is required' }, { status: 400 });
    }

    if (!senderEmail || senderEmail.trim().length === 0) {
      return NextResponse.json({ error: 'Sender email is required' }, { status: 400 });
    }

    // Check for duplicate newsletter names
    const existingNewsletter = await prisma.newsletters.findFirst({
      where: {
        name: name.trim()
      }
    });

    if (existingNewsletter) {
      return NextResponse.json({ error: 'Newsletter with this name already exists' }, { status: 409 });
    }

    // Extract sender domain from email if not provided
    const domain = senderDomain || senderEmail.split('@')[1];

    // Create newsletter
    const newNewsletter = await prisma.newsletters.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        senderEmail: senderEmail.trim(),
        senderDomain: domain,
        websiteUrl: websiteUrl?.trim() || '',
        logoUrl: logoUrl?.trim() || '',
        frequency: frequency || 'weekly',
        isPredefined: isPredefined !== false,
        isActive: isActive !== false,
        createdBy: null // Admin-created newsletters
      },
      include: {
        _count: {
          select: {
            userNewsletterSubscriptions: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    // Transform response
    const transformedNewsletter = {
      id: newNewsletter.id,
      name: newNewsletter.name,
      description: newNewsletter.description || '',
      senderEmail: newNewsletter.senderEmail || '',
      senderDomain: newNewsletter.senderDomain || '',
      websiteUrl: newNewsletter.websiteUrl || '',
      logoUrl: newNewsletter.logoUrl || '',
      frequency: newNewsletter.frequency || 'weekly',
      isPredefined: newNewsletter.isPredefined,
      isActive: newNewsletter.isActive,
      subscriberCount: newNewsletter._count.userNewsletterSubscriptions,
      createdAt: newNewsletter.createdAt.toISOString(),
      updatedAt: newNewsletter.updatedAt.toISOString()
    };

    return NextResponse.json(transformedNewsletter, { status: 201 });

  } catch (error) {
    console.error('Failed to create newsletter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}