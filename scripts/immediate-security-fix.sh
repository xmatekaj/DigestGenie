#!/bin/bash
# immediate-security-fix.sh - Quick security fix for current DigestGenie setup

set -e

echo "🔒 Applying immediate security fixes..."

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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Fix current firewall configuration
fix_current_firewall() {
    print_step "Fixing current firewall configuration..."
    
    print_status "Current firewall status:"
    ufw status numbered
    echo ""
    
    # Remove the dangerous open ports
    print_warning "Removing dangerous open ports..."
    
    # Remove direct app access
    ufw --force delete allow 3000/tcp
    print_status "Closed port 3000/tcp (Next.js direct access)"
    
    # Remove n8n admin interface (MOST IMPORTANT!)
    ufw --force delete allow 5678/tcp
    print_status "Closed port 5678/tcp (n8n admin interface)"
    
    # Remove MailHog (development only)
    ufw --force delete allow 8025/tcp
    print_status "Closed port 8025/tcp (MailHog web interface)"
    
    # Remove standard SSH port 22 if it exists (you use 63852)
    ufw --force delete allow 22/tcp 2>/dev/null || true
    ufw --force delete allow ssh 2>/dev/null || true
    print_status "Removed standard SSH port (you use custom port 63852)"
    
    print_step "Updated firewall status:"
    ufw status numbered
}

# Verify SSH access will work
verify_ssh_access() {
    print_step "Verifying SSH access..."
    
    # Check if custom SSH port is allowed
    if ufw status | grep -q "63852/tcp"; then
        print_status "✅ SSH port 63852 is allowed"
    else
        print_warning "⚠️  SSH port 63852 not found in firewall rules"
        print_status "Adding SSH port 63852..."
        ufw allow 63852/tcp
        print_status "✅ SSH port 63852 added"
    fi
}

# Update Docker Compose to not expose dangerous ports
secure_docker_compose() {
    print_step "Securing Docker Compose configuration..."
    
    # Backup original
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml docker-compose.original.yml
        print_status "Backed up original docker-compose.yml"
    fi
    
    # Create secure version that doesn't expose internal ports
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database (INTERNAL ONLY)
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
    # REMOVED: ports: - "5432:5432"  # No external access
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - digestgenie

  # Redis for caching (INTERNAL ONLY)
  redis:
    image: redis:7-alpine
    container_name: digestgenie_redis
    volumes:
      - ./data/redis:/data
      - /etc/localtime:/etc/localtime:ro
    # REMOVED: ports: - "6379:6379"  # No external access
    restart: unless-stopped
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - digestgenie

  # n8n Workflow Automation (INTERNAL ONLY)
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
      - WEBHOOK_URL=http://57.129.47.114/webhooks
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - GENERIC_TIMEZONE=UTC
      - N8N_SECURE_COOKIE=false
      - NODE_ENV=${NODE_ENV}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - INTERNAL_API_KEY=${INTERNAL_API_KEY}
    # REMOVED: ports: - "5678:5678"  # No direct external access
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

  # Nginx Reverse Proxy (SECURE PUBLIC ACCESS)
  nginx:
    image: nginx:alpine
    container_name: digestgenie_nginx
    ports:
      - "80:80"    # Only HTTP/HTTPS exposed
      - "443:443"  # For future SSL setup
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/localtime:/etc/localtime:ro
    depends_on:
      - n8n
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

    print_status "✅ Docker Compose secured - removed external port exposure"
}

# Create basic Nginx configuration for immediate security
create_basic_nginx() {
    print_step "Creating basic Nginx security configuration..."
    
    mkdir -p nginx
    
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    # Basic security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Hide Nginx version
    server_tokens off;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    
    server {
        listen 80;
        server_name 57.129.47.114;
        
        # Basic rate limiting
        limit_req zone=general burst=20 nodelay;
        
        # For now, redirect to n8n (since you need to set it up)
        # TODO: Replace this with your actual Next.js app when ready
        location / {
            return 200 'DigestGenie is starting up. Please configure your application.';
            add_header Content-Type text/plain;
        }
        
        # n8n webhooks only (for email processing)
        location /webhooks/ {
            proxy_pass http://n8n:5678/webhook/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Temporary n8n admin access (REMOVE THIS AFTER SETUP)
        location /n8n-admin/ {
            proxy_pass http://n8n:5678/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Add authentication or IP restriction here
            auth_basic "n8n Admin Access";
            auth_basic_user_file /etc/nginx/.htpasswd;
        }
        
        # Block access to sensitive paths
        location ~ /\.(env|git) {
            deny all;
            return 404;
        }
    }
}
EOF

    print_status "✅ Basic Nginx configuration created"
}

# Create htpasswd for basic auth
create_basic_auth() {
    print_step "Setting up basic authentication for n8n admin access..."
    
    print_warning "You'll need to create a password for n8n admin access"
    echo -n "Enter username for n8n admin: "
    read USERNAME
    
    # Create .htpasswd file
    docker run --rm httpd:2.4-alpine htpasswd -nbB "$USERNAME" "$(read -s -p "Enter password: "; echo $REPLY)" > nginx/.htpasswd
    echo ""
    print_status "✅ Basic authentication configured for user: $USERNAME"
}

# Show next steps
show_immediate_next_steps() {
    print_step "Immediate security fixes applied! Next steps:"
    echo ""
    echo "🔒 SECURITY STATUS:"
    echo "✅ Dangerous ports closed (3000, 5678, 8025)"
    echo "✅ SSH access preserved on port 63852"
    echo "✅ Docker services secured (no direct external access)"
    echo "✅ Basic Nginx reverse proxy configured"
    echo ""
    echo "🚀 TO START YOUR SECURED SETUP:"
    echo ""
    echo "1. Restart services with new secure configuration:"
    echo "   docker-compose down"
    echo "   docker-compose up -d"
    echo ""
    echo "2. Check service status:"
    echo "   docker-compose ps"
    echo ""
    echo "3. Access points (SECURE):"
    echo "   - Status page: http://57.129.47.114"
    echo "   - n8n admin (temp): http://57.129.47.114/n8n-admin/"
    echo "   - Webhooks: http://57.129.47.114/webhooks/[webhook-id]"
    echo ""
    echo "4. Verify firewall status:"
    echo "   sudo ufw status"
    echo ""
    echo "⚠️  IMPORTANT: After setting up n8n, remove the temporary admin access!"
}

# Main execution
main() {
    fix_current_firewall
    verify_ssh_access
    secure_docker_compose
    create_basic_nginx
    create_basic_auth
    show_immediate_next_steps
}

# Run main function
main "$@"
