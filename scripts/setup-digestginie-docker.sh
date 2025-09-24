#!/bin/bash
# vps-setup.sh - Initial VPS setup for DigestGenie
# Run this script on your VPS: 57.129.47.114

set -e

echo "🚀 Setting up DigestGenie on VPS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. Consider creating a non-root user for better security."
    fi
}

# Update system packages
update_system() {
    print_step "Updating system packages..."
    apt-get update -y
    apt-get upgrade -y
    apt-get install -y curl wget git nano htop unzip
    print_status "System packages updated"
}

# Install Docker
install_docker() {
    print_step "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_status "Docker already installed"
        docker --version
        return
    fi
    
    # Install Docker using official script
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # Add current user to docker group if not root
    if [[ $EUID -ne 0 ]]; then
        usermod -aG docker $USER
        print_warning "Please logout and login again to use docker without sudo"
    fi
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Start Docker service
    systemctl enable docker
    systemctl start docker
    
    print_status "Docker installed successfully"
    docker --version
    docker-compose --version
}

# Setup firewall (UFW)
setup_firewall() {
    print_step "Setting up firewall..."
    
    # Install UFW if not installed
    apt-get install -y ufw
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (current connection)
    ufw allow ssh
    ufw allow 22/tcp
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow application ports
    ufw allow 3000/tcp  # Next.js app
    ufw allow 5678/tcp  # n8n
    ufw allow 8025/tcp  # MailHog (development only)
    
    # Enable firewall
    ufw --force enable
    
    print_status "Firewall configured"
    ufw status
}

# Create project directory
setup_project_directory() {
    print_step "Setting up project directory..."
    
    PROJECT_DIR="/home/$(whoami)/dev/digestgenie"
    
    # Create directory structure
    mkdir -p $PROJECT_DIR
    cd $PROJECT_DIR
    
    # Create subdirectories
    mkdir -p {logs,ssl,uploads,n8n/workflows,data/{postgres,redis,n8n}}
    
    # Set permissions
    chmod 755 $PROJECT_DIR
    chmod -R 755 logs ssl uploads
    chmod -R 777 data  # Docker containers need access
    
    print_status "Project directory created: $PROJECT_DIR"
    echo "Project path: $PROJECT_DIR"
}

# Create initial environment file for VPS
create_vps_env() {
    print_step "Creating VPS environment configuration..."
    
    cat > .env << 'EOF'
# DigestGenie VPS Configuration
NODE_ENV=production
DEBUG_MODE=false

# Server Configuration
SERVER_IP=57.129.47.114
WEBHOOK_URL=http://57.129.47.114:5678
NEXTAUTH_URL=http://57.129.47.114:3000

# Database Configuration
DATABASE_URL=postgresql://postgres:digestgenie2024@postgres:5432/digestgenie_prod
DB_PASSWORD=digestgenie2024

# Security Keys (PLEASE CHANGE THESE IN PRODUCTION)
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-key-min-32-chars
N8N_ENCRYPTION_KEY=your-n8n-encryption-key-min-32-chars
INTERNAL_API_KEY=your-internal-api-key-for-n8n-webhooks

# API Keys (TO BE CONFIGURED)
ANTHROPIC_API_KEY=sk-ant-your-claude-api-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration
EMAIL_DOMAIN=newsletters.57.129.47.114.nip.io

# n8n Configuration
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=http

# Admin Settings
ADMIN_EMAILS=your-email@example.com

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_2FA=true
MONETIZATION_ENABLED=false

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Subscription Limits (Free Plan)
FREE_PLAN_MAX_NEWSLETTERS=3
FREE_PLAN_MAX_ARTICLES_PER_MONTH=1000
EOF

    print_status "Environment file created. Please edit .env with your actual API keys."
    print_warning "IMPORTANT: Update the following in .env file:"
    echo "  - ANTHROPIC_API_KEY (your Claude API key)"
    echo "  - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
    echo "  - ADMIN_EMAILS (your email address)"
    echo "  - Change default passwords and secret keys"
}

# Create Docker Compose file for VPS
create_docker_compose() {
    print_step "Creating Docker Compose configuration..."
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: digestgenie_postgres
    environment:
      POSTGRES_DB: digestgenie_prod
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - digestgenie

  # Redis for caching
  redis:
    image: redis:7-alpine
    container_name: digestgenie_redis
    volumes:
      - ./data/redis:/data
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "6379:6379"
    restart: unless-stopped
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - digestgenie

  # n8n Workflow Automation
  n8n:
    image: n8nio/n8n:latest
    container_name: digestgenie_n8n
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_prod
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - WEBHOOK_URL=${WEBHOOK_URL}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=${N8N_PORT}
      - N8N_PROTOCOL=${N8N_PROTOCOL}
      - GENERIC_TIMEZONE=UTC
      - N8N_SECURE_COOKIE=false
      - NODE_ENV=${NODE_ENV}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - INTERNAL_API_KEY=${INTERNAL_API_KEY}
    ports:
      - "5678:5678"
    volumes:
      - ./data/n8n:/home/node/.n8n
      - ./n8n/workflows:/tmp/workflows:ro
      - /etc/localtime:/etc/localtime:ro
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:5678/healthz || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - digestgenie

  # MailHog for email testing (development)
  mailhog:
    image: mailhog/mailhog:latest
    container_name: digestgenie_mailhog
    ports:
      - "1025:1025"  # SMTP server
      - "8025:8025"  # Web UI
    restart: unless-stopped
    networks:
      - digestgenie

networks:
  digestgenie:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  n8n_data:
EOF

    print_status "Docker Compose configuration created"
}

# Setup system service for auto-start
setup_systemd_service() {
    print_step "Creating systemd service for auto-start..."
    
    PROJECT_DIR="/home/$(whoami)/dev/digestgenie"
    
    cat > /etc/systemd/system/digestgenie.service << EOF
[Unit]
Description=DigestGenie Newsletter Aggregator
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0
User=$(whoami)
Group=$(whoami)

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable digestgenie.service
    
    print_status "Systemd service created and enabled"
}

# Generate secure secrets
generate_secrets() {
    print_step "Generating secure secrets..."
    
    if command -v openssl &> /dev/null; then
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)
        INTERNAL_API_KEY=$(openssl rand -base64 24)
        
        # Update .env file
        sed -i "s/your-super-secret-nextauth-secret-key-min-32-chars/$NEXTAUTH_SECRET/" .env
        sed -i "s/your-n8n-encryption-key-min-32-chars/$N8N_ENCRYPTION_KEY/" .env
        sed -i "s/your-internal-api-key-for-n8n-webhooks/$INTERNAL_API_KEY/" .env
        
        print_status "Secure secrets generated and updated in .env"
    else
        print_warning "OpenSSL not found. Please update secrets manually in .env"
    fi
}

# Display next steps
show_next_steps() {
    print_step "Setup completed! Next steps:"
    echo ""
    echo "📋 NEXT STEPS:"
    echo ""
    echo "1. Edit configuration:"
    echo "   nano ~/.env"
    echo "   - Add your Claude API key (ANTHROPIC_API_KEY)"
    echo "   - Add Google OAuth credentials"
    echo "   - Update ADMIN_EMAILS with your email"
    echo ""
    echo "2. Clone your project repository:"
    echo "   cd ~/dev/digestgenie"
    echo "   git clone [your-repo-url] ."
    echo ""
    echo "3. Start the services:"
    echo "   docker-compose up -d"
    echo ""
    echo "4. Access your applications:"
    echo "   - Web App: http://57.129.47.114:3000"
    echo "   - n8n: http://57.129.47.114:5678" 
    echo "   - MailHog: http://57.129.47.114:8025"
    echo ""
    echo "5. Check service status:"
    echo "   docker-compose ps"
    echo "   docker-compose logs [service-name]"
    echo ""
    echo "🔥 Pro tip: Use 'systemctl start digestgenie' to auto-start all services"
}

# Main execution
main() {
    check_root
    update_system
    install_docker
    setup_firewall
    setup_project_directory
    create_vps_env
    create_docker_compose
    setup_systemd_service
    generate_secrets
    show_next_steps
}

# Run main function
main "$@"
