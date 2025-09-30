// app/api/gmail/process/route.ts - Real implementation
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { 
  GmailClient, 
  extractEmailContent, 
  isNewsletterEmail, 
  extractArticlesFromContent,
  extractEmailFromHeader,
  extractNewsletterName
} from '@/lib/gmail-client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin to process emails
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (!adminEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get access token from session
    const accessToken = (session as any).accessToken;
    const refreshToken = (session as any).refreshToken;
    
    if (!accessToken) {
      return NextResponse.json({ 
        error: 'Gmail access not authorized. Please sign out and sign back in to grant Gmail permissions.' 
      }, { status: 401 });
    }

    console.log('🔍 Starting Gmail processing for:', session.user.email);
    
    const gmailClient = new GmailClient(accessToken, refreshToken);
    
    // Get unread emails
    const messages = await gmailClient.getUnreadEmails(30);
    console.log(`📧 Found ${messages.length} unread emails`);
    
    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        totalEmails: 0,
        newslettersProcessed: 0,
        processedEmails: [],
        message: 'No unread emails found'
      });
    }
    
    const processedEmails = [];
    let newslettersProcessed = 0;
    let totalArticles = 0;
    
    // Find or create admin user
    let adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || 'Admin User',
          isVerified: true
        }
      });
      console.log('👤 Created admin user');
    }
    
    // Process each email
    for (const message of messages) {
      try {
        console.log(`📄 Processing message: ${message.id}`);
        
        const emailDetails = await gmailClient.getEmailDetails(message.id!);
        if (!emailDetails) {
          console.log(`❌ Could not fetch details for message ${message.id}`);
          continue;
        }
        
        const headers = emailDetails.payload?.headers || [];
        const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
        const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
        const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
        
        console.log(`📧 Email: "${subjectHeader}" from ${fromHeader}`);
        
        // Check if this looks like a newsletter
        if (!isNewsletterEmail(fromHeader, subjectHeader)) {
          console.log('❌ Not identified as newsletter, skipping');
          continue;
        }
        
        console.log('✅ Identified as newsletter, processing...');
        
        // Extract email content
        const content = extractEmailContent(emailDetails.payload);
        const articles = extractArticlesFromContent(content, subjectHeader);
        
        console.log(`📄 Extracted ${articles.length} articles`);
        
        if (articles.length === 0) {
          console.log('❌ No articles found, skipping');
          continue;
        }
        
        // Find or create newsletter
        const senderEmail = extractEmailFromHeader(fromHeader);
        const senderDomain = senderEmail.split('@')[1];
        const newsletterName = extractNewsletterName(fromHeader);
        
        let newsletter = await prisma.newsletter.findFirst({
          where: {
            OR: [
              { senderEmail: senderEmail },
              { senderDomain: senderDomain },
              { name: newsletterName }
            ]
          }
        });
        
        if (!newsletter) {
          newsletter = await prisma.newsletter.create({
            data: {
              name: newsletterName,
              senderEmail: senderEmail,
              senderDomain: senderDomain,
              isPredefined: false,
              isActive: true,
              frequency: 'unknown',
              description: `Newsletter from ${senderDomain}`
            }
          });
          console.log(`📰 Created new newsletter: ${newsletter.name}`);
        } else {
          console.log(`📰 Using existing newsletter: ${newsletter.name}`);
        }
        
        // Process and save articles
        const savedArticles = [];
        
        for (const article of articles) {
          try {
            // Check if article already exists (prevent duplicates)
            const existingArticle = await prisma.newsletterArticle.findFirst({
              where: {
                title: article.title,
                newsletterId: newsletter.id,
                userId: adminUser.id
              }
            });
            
            if (existingArticle) {
              console.log(`⚠️  Article already exists: ${article.title.substring(0, 50)}...`);
              continue;
            }
            
            const savedArticle = await prisma.newsletterArticle.create({
              data: {
                newsletterId: newsletter.id,
                userId: adminUser.id,
                title: article.title,
                content: article.content,
                excerpt: article.excerpt,
                url: article.url || '',
                sourceEmailId: message.id || '',
                sourceSubject: subjectHeader,
                publishedAt: dateHeader ? new Date(dateHeader) : new Date(),
                processedAt: new Date()
              }
            });
            
            savedArticles.push(savedArticle);
            console.log(`💾 Saved article: ${article.title.substring(0, 50)}...`);
            
          } catch (articleError) {
            console.error('Error saving article:', articleError);
          }
        }
        
        if (savedArticles.length > 0) {
          // Mark email as read
          const marked = await gmailClient.markAsRead(message.id!);
          console.log(`📖 Email marked as read: ${marked}`);
          
          processedEmails.push({
            messageId: message.id || '',
            from: fromHeader,
            subject: subjectHeader,
            newsletter: newsletter.name,
            articlesCount: savedArticles.length
          });
          
          newslettersProcessed++;
          totalArticles += savedArticles.length;
          
          console.log(`✅ Processed newsletter: ${newsletter.name} (${savedArticles.length} articles)`);
        }
        
      } catch (emailError) {
        console.error(`Error processing email ${message.id}:`, emailError);
      }
    }
    
    console.log(`🎉 Gmail processing complete!`);
    console.log(`📊 Results: ${newslettersProcessed} newsletters, ${totalArticles} articles`);
    
    return NextResponse.json({
      success: true,
      totalEmails: messages.length,
      newslettersProcessed,
      totalArticles,
      processedEmails
    });
    
  } catch (error) {
    console.error('Gmail processing error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process Gmail emails' 
    }, { status: 500 });
  }
}