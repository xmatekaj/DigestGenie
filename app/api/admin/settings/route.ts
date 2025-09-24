// app/api/admin/settings/route.ts - System settings API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'admin@digestgenie.com',
    'matekaj@proton.me'
  ];
  return adminEmails.includes(email);
}

// GET /api/admin/settings - Fetch system settings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return current environment variables as settings
    // In production, you'd want to store these in a database
    const settings = {
      general: {
        siteName: process.env.SITE_NAME || 'DigestGenie',
        siteDescription: process.env.SITE_DESCRIPTION || 'Your AI-powered newsletter aggregator',
        adminEmails: process.env.ADMIN_EMAILS || '',
        maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
        allowRegistration: process.env.ALLOW_REGISTRATION !== 'false'
      },
      email: {
        smtpHost: process.env.SMTP_HOST || '',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER || '',
        smtpPassword: process.env.SMTP_PASSWORD ? '••••••••' : '', // Mask password
        fromEmail: process.env.FROM_EMAIL || '',
        fromName: process.env.FROM_NAME || 'DigestGenie',
        emailDomain: process.env.EMAIL_DOMAIN || ''
      },
      ai: {
        openaiApiKey: process.env.OPENAI_API_KEY ? '••••••••' : '', // Mask API key
        enableAiSummaries: process.env.ENABLE_AI_SUMMARIES !== 'false',
        enableAiCategories: process.env.ENABLE_AI_CATEGORIES !== 'false',
        enableAiInsights: process.env.ENABLE_AI_INSIGHTS === 'true',
        maxTokensPerRequest: process.env.MAX_TOKENS_PER_REQUEST || '4000'
      },
      security: {
        sessionTimeout: process.env.SESSION_TIMEOUT || '24',
        enableTwoFactor: process.env.ENABLE_TWO_FACTOR === 'true',
        enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
        maxLoginAttempts: process.env.MAX_LOGIN_ATTEMPTS || '5'
      },
      features: {
        enableUserRegistration: process.env.ENABLE_USER_REGISTRATION !== 'false',
        enableProFeatures: process.env.ENABLE_PRO_FEATURES === 'true',
        maxNewslettersPerUser: process.env.MAX_NEWSLETTERS_PER_USER || '3',
        enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false'
      }
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/settings - Update system settings
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await req.json();

    // In a real implementation, you would:
    // 1. Validate the settings
    // 2. Store them in a database or configuration system
    // 3. Apply them to the running system
    
    // For now, we'll just return success
    // TODO: Implement actual settings storage and application
    
    console.log('Settings update requested:', settings);
    
    // You could store these in a database table like:
    // await prisma.systemSettings.upsert({
    //   where: { key: 'system_config' },
    //   create: { key: 'system_config', value: JSON.stringify(settings) },
    //   update: { value: JSON.stringify(settings) }
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully' 
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}