// app/api/admin/newsletters/[id]/route.ts - Individual newsletter management
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

// PUT /api/admin/newsletters/[id] - Update newsletter
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const newsletterId = params.id;
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

    // Check if newsletter exists
    const existingNewsletter = await prisma.newsletters.findUnique({
      where: { id: newsletterId }
    });

    if (!existingNewsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    // Check if another newsletter with the same name exists (excluding current one)
    const duplicateNewsletter = await prisma.newsletters.findFirst({
      where: {
        name: name.trim(),
        NOT: {
          id: newsletterId
        }
      }
    });

    if (duplicateNewsletter) {
      return NextResponse.json({ error: 'Newsletter with this name already exists' }, { status: 409 });
    }

    // Extract sender domain from email if not provided
    const domain = senderDomain || senderEmail.split('@')[1];

    // Update newsletter
    const updatedNewsletter = await prisma.newsletters.update({
      where: { id: newsletterId },
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        senderEmail: senderEmail.trim(),
        senderDomain: domain,
        websiteUrl: websiteUrl?.trim() || '',
        logoUrl: logoUrl?.trim() || '',
        frequency: frequency || 'weekly',
        isPredefined: isPredefined !== false,
        isActive: isActive !== false
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

    const transformedNewsletter = {
      id: updatedNewsletter.id,
      name: updatedNewsletter.name,
      description: updatedNewsletter.description || '',
      senderEmail: updatedNewsletter.senderEmail || '',
      senderDomain: updatedNewsletter.senderDomain || '',
      websiteUrl: updatedNewsletter.websiteUrl || '',
      logoUrl: updatedNewsletter.logoUrl || '',
      frequency: updatedNewsletter.frequency || 'weekly',
      isPredefined: updatedNewsletter.isPredefined,
      isActive: updatedNewsletter.isActive,
      subscriberCount: updatedNewsletter._count.userNewsletterSubscriptions,
      createdAt: updatedNewsletter.createdAt.toISOString(),
      updatedAt: updatedNewsletter.updatedAt.toISOString()
    };

    return NextResponse.json(transformedNewsletter);

  } catch (error) {
    console.error('Failed to update newsletter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/newsletters/[id] - Delete newsletter
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const newsletterId = params.id;

    // Check if newsletter exists
    const existingNewsletter = await prisma.newsletters.findUnique({
      where: { id: newsletterId },
      include: {
        _count: {
          select: {
            userNewsletterSubscriptions: true,
            newsletterArticles: true
          }
        }
      }
    });

    if (!existingNewsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    // Check if newsletter has subscriptions or articles
    const hasSubscriptions = existingNewsletter._count.userNewsletterSubscriptions > 0;
    const hasArticles = existingNewsletter._count.newsletterArticles > 0;

    if (hasSubscriptions || hasArticles) {
      return NextResponse.json({ 
        error: `Cannot delete newsletter with ${existingNewsletter._count.userNewsletterSubscriptions} subscriptions and ${existingNewsletter._count.newsletterArticles} articles. Please deactivate instead.` 
      }, { status: 409 });
    }

    // Delete newsletter
    await prisma.newsletters.delete({
      where: { id: newsletterId }
    });

    return NextResponse.json({ message: 'Newsletter deleted successfully' });

  } catch (error) {
    console.error('Failed to delete newsletter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}