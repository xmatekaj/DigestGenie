#!/bin/bash
# setup.sh - Setup script for Newsletter Aggregator

set -e

echo "🚀 Setting up Newsletter Aggregator..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Create environment file
create_env_file() {
    print_step "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_status "Created .env file from .env.example"
        else
            print_error ".env.example not found. Please create environment file manually."
            exit 1
        fi
    else
        print_warning ".env file already exists, skipping..."
    fi

    # Generate secure secrets
    if command -v openssl &> /dev/null; then
        print_status "Generating secure secrets..."
        
        # Replace placeholder values with generated secrets
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)
        INTERNAL_API_KEY=$(openssl rand -base64 24)
        DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
        POSTAL_DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
        
        # Update .env file with generated values
        sed -i.bak "s/your-super-secret-nextauth-secret-key-min-32-chars/$NEXTAUTH_SECRET/" .env
        sed -i.bak "s/your-n8n-encryption-key-min-32-chars/$N8N_ENCRYPTION_KEY/" .env
        sed -i.bak "s/your-internal-api-key-for-n8n-webhooks/$INTERNAL_API_KEY/" .env
        sed -i.bak "s/your_secure_db_password/$DB_PASSWORD/" .env
        sed -i.bak "s/your-postal-db-password/$POSTAL_DB_PASSWORD/" .env
        
        # Remove backup file
        rm .env.bak 2>/dev/null || true
        
        print_status "Generated secure secrets and updated .env file"
    else
        print_warning "OpenSSL not found. Please manually update secrets in .env file"
    fi
    
    print_warning "Please update the following values in your .env file:"
    echo "  - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (for OAuth)"
    echo "  - OPENAI_API_KEY (for AI features)"
    echo "  - EMAIL_DOMAIN (your domain for system emails)"
    echo "  - NEXTAUTH_URL (your application URL)"
}

# Create necessary directories
create_directories() {
    print_step "Creating necessary directories..."
    
    directories=(
        "uploads"
        "n8n/workflows"
        "prisma/migrations"
        "logs"
        "ssl"
    )
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_status "Created directory: $dir"
        fi
    done
}

# Setup database
setup_database() {
    print_step "Setting up database..."
    
    # Start only PostgreSQL for initial setup
    docker-compose up -d postgres redis
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Generate Prisma client and run migrations
    if [ -f "package.json" ]; then
        print_status "Installing dependencies..."
        npm install
        
        print_status "Generating Prisma client..."
        npm run db:generate
        
        print_status "Running database migrations..."
        npm run db:push
        
        print_status "Database setup complete"
    else
        print_warning "package.json not found. Skipping dependency installation."
    fi
}

# Import n8n workflows
import_n8n_workflows() {
    print_step "Setting up n8n workflows..."
    
    # Copy workflow files to n8n directory
    if [ -f "n8n-email-workflow.json" ]; then
        cp n8n-email-workflow.json n8n/workflows/
        print_status "Copied email processing workflow"
    fi
    
    print_status "n8n workflows ready for import"
}

# Start all services
start_services() {
    print_step "Starting all services..."
    
    docker-compose up -d
    
    print_status "All services started!"
    
    echo ""
    echo "🎉 Newsletter Aggregator setup complete!"
    echo ""
    echo "Services running on:"
    echo "  📱 Web App:      http://localhost:3000"
    echo "  🔧 n8n:          http://localhost:5678"
    echo "  📊 Admin Panel:  http://localhost:3000/admin"
    echo ""
    echo "Next steps:"
    echo "1. Visit http://localhost:3000 to access the application"
    echo "2. Create your first account using Google OAuth"
    echo "3. Set up your system email for newsletter forwarding"
    echo "4. Subscribe to your first newsletter!"
    echo ""
    echo "For n8n setup:"
    echo "1. Visit http://localhost:5678"
    echo "2. Complete the initial setup wizard"
    echo "3. Import the email processing workflow from n8n/workflows/"
    echo ""
}

# Health check
health_check() {
    print_step "Running health checks..."
    
    sleep 15  # Wait for services to fully start
    
    # Check web app
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        print_status "✅ Web application is healthy"
    else
        print_warning "⚠️  Web application health check failed"
    fi
    
    # Check n8n
    if curl -f http://localhost:5678/healthz >/dev/null 2>&1; then
        print_status "✅ n8n is healthy"
    else
        print_warning "⚠️  n8n health check failed"
    fi
    
    # Check database connection
    if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_status "✅ PostgreSQL is healthy"
    else
        print_warning "⚠️  PostgreSQL health check failed"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_status "✅ Redis is healthy"
    else
        print_warning "⚠️  Redis health check failed"
    fi
}

# Cleanup function
cleanup() {
    print_step "Cleaning up..."
    docker-compose down
}

# Main setup flow
main() {
    print_step "Starting Newsletter Aggregator setup..."
    
    check_docker
    create_env_file
    create_directories
    setup_database
    import_n8n_workflows
    start_services
    health_check
    
    print_status "Setup completed successfully! 🎉"
}

# Handle script interruption
trap cleanup EXIT

# Parse command line arguments
case "${1:-setup}" in
    "setup")
        main
        ;;
    "start")
        docker-compose up -d
        health_check
        ;;
    "stop")
        docker-compose down
        ;;
    "restart")
        docker-compose restart
        health_check
        ;;
    "logs")
        docker-compose logs -f "${2:-web}"
        ;;
    "clean")
        print_warning "This will remove all containers and volumes. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            docker-compose down -v
            docker system prune -f
            print_status "Cleanup completed"
        fi
        ;;
    "help")
        echo "Newsletter Aggregator Setup Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  setup     - Full setup (default)"
        echo "  start     - Start all services"
        echo "  stop      - Stop all services"
        echo "  restart   - Restart all services"
        echo "  logs      - Show logs (optionally specify service)"
        echo "  clean     - Remove all containers and volumes"
        echo "  help      - Show this help message"
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac