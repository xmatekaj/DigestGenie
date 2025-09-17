# DigestGenie - AI-Powered Newsletter Aggregator

Transform your newsletter chaos into organized, AI-enhanced content streams. DigestGenie automatically processes, categorizes, and summarizes your newsletters using advanced AI.

## 🌟 Features

### Core Features
- **Newsletter Management**: Subscribe to predefined or add custom newsletters
- **AI-Powered Processing**: Automatic summarization, categorization, and interest scoring
- **Email Forwarding**: Unique system emails for seamless newsletter forwarding
- **Smart Categories**: AI-generated and custom user categories
- **Multiple Display Options**: Cards, lists, summaries, or full content
- **Reading Management**: Track read/unread status, save articles

### Advanced Features
- **Google OAuth Authentication**: Secure login with 2FA support
- **n8n Workflow Automation**: Automated email processing pipeline
- **Admin Panel**: Comprehensive platform management
- **Subscription Plans**: Freemium model with upgrade options
- **Real-time Processing**: Instant article processing and AI analysis
- **Mobile Responsive**: Works seamlessly on all devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   PostgreSQL    │    │      Redis      │
│   (Frontend +   │◄──►│   (Database)    │    │   (Caching)     │
│   API Routes)   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                                              ▲
         │                                              │
         ▼                                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│       n8n       │    │     OpenAI      │    │   Postal Mail   │
│  (Workflows)    │    │  (AI Features)  │    │    (Optional)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js with Google OAuth + 2FA
- **AI**: OpenAI GPT-3.5/4 for summaries and categorization
- **Email Processing**: n8n workflows + custom email parsing
- **Containerization**: Docker & Docker Compose
- **Caching**: Redis

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Google OAuth credentials
- OpenAI API key

### 1. Clone and Setup
```bash
git clone <your-repo>
cd newsletter-aggregator

# Make setup script executable
chmod +x setup.sh

# Run automated setup
./setup.sh
```

### 2. Configure Environment
Edit `.env` file with your credentials:
```bash
# Required: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Required: OpenAI for AI features
OPENAI_API_KEY=sk-your-openai-api-key

# Required: Your domain for system emails
EMAIL_DOMAIN=newsletters.yourdomain.com
NEXTAUTH_URL=http://localhost:3000
```

### 3. Access Applications
- **Web App**: http://localhost:3000
- **n8n Workflows**: http://localhost:5678
- **Admin Panel**: http://localhost:3000/admin

## 📋 Step-by-Step Implementation Plan

Following your requirement for minimal, testable changes, here's the implementation roadmap:

### Phase 1: Core Foundation (Week 1-2)
```bash
# 1. Apply database migrations
npm run db:push

# 2. Test basic authentication
curl http://localhost:3000/api/auth/session

# 3. Test newsletter API
curl -X POST http://localhost:3000/api/newsletters \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Newsletter","senderEmail":"test@example.com"}'
```

**Testing Checklist:**
- [ ] User can register/login with Google
- [ ] Newsletter CRUD operations work
- [ ] Database tables are created correctly
- [ ] Basic UI components render

### Phase 2: Email Processing (Week 2-3)
```bash
# 1. Set up system email generation
curl -X POST http://localhost:3000/api/user/system-email

# 2. Test n8n webhook
curl -X POST http://localhost:5678/webhook/email \
  -H "Content-Type: application/json" \
  -d '{"to":"user123@newsletters.yourdomain.com","subject":"Test"}'

# 3. Verify email processing
curl http://localhost:3000/api/newsletters/process-email
```

**Testing Checklist:**
- [ ] System emails are generated
- [ ] n8n workflow processes emails
- [ ] Articles are extracted and saved
- [ ] Email forwarding works end-to-end

### Phase 3: AI Features (Week 3-4)
```bash
# 1. Test AI summarization
curl -X POST http://localhost:3000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"content":"Your article content here"}'

# 2. Test categorization
curl -X POST http://localhost:3000/api/ai/categorize \
  -H "Content-Type: application/json" \
  -d '{"content":"Tech article about AI"}'
```

**Testing Checklist:**
- [ ] AI summaries are generated
- [ ] Content categorization works
- [ ] Interest scoring functions
- [ ] User can toggle AI features

### Phase 4: User Interface (Week 4-5)
- [ ] Newsletter dashboard is functional
- [ ] Article reading interface works
- [ ] User preferences can be saved
- [ ] Mobile responsiveness verified

### Phase 5: Admin & Monitoring (Week 5-6)
- [ ] Admin panel is accessible
- [ ] User management works
- [ ] System metrics are displayed
- [ ] Error handling is robust

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations
npm run db:studio       # Open Prisma Studio

# Docker
./setup.sh start        # Start all services
./setup.sh stop         # Stop all services  
./setup.sh logs web     # View application logs
./setup.sh clean        # Clean all containers

# Testing
npm run lint            # Lint code
npm run test            # Run tests (if configured)
```

## 📊 Usage Limits (Free Plan)
- **Newsletters**: Up to 3 subscriptions
- **Articles**: 1,000 per month
- **AI Summaries**: Included
- **Storage**: 100 saved articles
- **Categories**: 5 custom categories

## 🔒 Security Features
- Google OAuth authentication
- Optional 2FA (TOTP)
- API rate limiting
- CSRF protection
- Secure session management
- Input validation and sanitization

## 🌐 Email Processing Flow

1. **Setup**: User generates unique system email (`user123@newsletters.yourdomain.com`)
2. **Forward**: User forwards newsletters to system email
3. **Process**: n8n workflow receives email webhook
4. **Parse**: Extract articles, links, and metadata
5. **AI Enhancement**: Generate summaries, categories, interest scores
6. **Store**: Save processed content to database
7. **Display**: Show in user's personalized feed

## 🎯 Predefined Newsletters

The system includes popular newsletters like:
- TechCrunch Daily
- Morning Brew
- The Hustle
- Benedict Evans
- Stratechery

Users can also add custom newsletters by providing sender email.

## 🔄 n8n Workflow Setup

1. Access n8n at http://localhost:5678
2. Complete initial setup wizard
3. Import workflow from `n8n/workflows/`
4. Configure webhook URL: `http://web:3000/api/newsletters/process-email`
5. Set internal API key for authentication

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL status
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

**n8n Workflow Not Triggering**
```bash
# Check n8n logs
docker-compose logs n8n

# Verify webhook URL configuration
curl http://localhost:5678/webhook-test/email
```

**AI Features Not Working**
```bash
# Verify OpenAI API key
echo $OPENAI_API_KEY

# Test API connectivity
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## 📈 Roadmap

### Short Term
- [ ] Email provider integration (Gmail, Outlook)
- [ ] Mobile app (React Native)
- [ ] Advanced AI categorization
- [ ] Batch email processing

### Long Term
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the step-by-step implementation plan
4. Test changes thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check troubleshooting section above
- Review Docker logs: `./setup.sh logs`
- Open GitHub issue with detailed description

---

**Happy Newsletter Aggregating! 🎉**