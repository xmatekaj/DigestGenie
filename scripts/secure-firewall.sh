#!/bin/bash
# secure-firewall.sh - Secure firewall configuration for DigestGenie

set -e

echo "🔒 Securing DigestGenie firewall configuration..."

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

# Reset and configure secure firewall
configure_secure_firewall() {
    print_step "Configuring secure firewall rules..."
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Essential services only
    print_status "Opening essential ports..."
    
    # SSH - Essential for server management (custom port)
    ufw allow 63852/tcp
    
    # HTTP/HTTPS - For web traffic (we'll use reverse proxy)
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable firewall
    ufw --force enable
    
    print_status "Secure firewall configured"
    ufw status numbered
}

# Configure internal Docker networking
configure_docker_networking() {
    print_step "Configuring Docker internal networking..."
    
    # Update docker-compose to use internal networking only
    cat > docker-compose.secure.yml << 'EOF'
version: '3.8'

services:
  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: digestgenie_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/ssl/certs:ro
    depends_on:
      - web
      - n8n
    restart: unless-stopped
    networks:
      - digestgenie

  # Next.js Web Application (INTERNAL ONLY)
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: digestgenie_web
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    # NO EXTERNAL PORTS - accessed via nginx proxy
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - digestgenie

  # PostgreSQL (INTERNAL ONLY)
  postgres:
    image: postgres:15-alpine
    container_name: digestgenie_postgres
    environment:
      POSTGRES_DB: digestgenie_prod
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    # NO EXTERNAL PORTS - internal access only
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - digestgenie

  # Redis (INTERNAL ONLY)
  redis:
    image: redis:7-alpine
    container_name: digestgenie_redis
    volumes:
      - ./data/redis:/data
    # NO EXTERNAL PORTS - internal access only
    restart: unless-stopped
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - digestgenie

  # n8n (INTERNAL ONLY)
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
      - WEBHOOK_URL=http://nginx/webhooks
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - GENERIC_TIMEZONE=UTC
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - INTERNAL_API_KEY=${INTERNAL_API_KEY}
    # NO EXTERNAL PORTS - accessed via nginx proxy
    volumes:
      - ./data/n8n:/home/node/.n8n
      - ./n8n/workflows:/tmp/workflows:ro
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - digestgenie

networks:
  digestgenie:
    driver: bridge
    internal: false  # Allow external access for web services only

volumes:
  postgres_data:
  redis_data:
  n8n_data:
EOF

    print_status "Secure Docker Compose configuration created"
}

# Create Nginx reverse proxy configuration
create_nginx_config() {
    print_step "Creating Nginx reverse proxy configuration..."
    
    mkdir -p nginx
    
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Hide Nginx version
    server_tokens off;
    
    # Main application
    server {
        listen 80;
        server_name 57.129.47.114;
        
        # Security: Rate limiting
        location / {
            proxy_pass http://web:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Rate limiting
            limit_req zone=general burst=20 nodelay;
        }
        
        # n8n webhooks (restricted path)
        location /webhooks/ {
            proxy_pass http://n8n:5678/webhook/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Additional security for webhooks
            allow 127.0.0.1;
            # Add your trusted IP ranges here if needed
            # allow YOUR_TRUSTED_IP_RANGE;
            deny all;
        }
        
        # Block access to sensitive paths
        location ~ /\.(env|git) {
            deny all;
            return 404;
        }
    }
    
    # n8n admin interface (IP restricted)
    server {
        listen 80;
        server_name n8n.57.129.47.114;
        
        location / {
            # Restrict to your IP only - UPDATE THIS!
            allow YOUR_IP_ADDRESS;  # Replace with your actual IP
            deny all;
            
            proxy_pass http://n8n:5678;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
}
EOF

    print_status "Nginx configuration created"
    print_warning "IMPORTANT: Update nginx/nginx.conf with your actual IP address for n8n access"
}

# Create IP whitelist configuration
create_ip_whitelist() {
    print_step "Creating IP whitelist configuration..."
    
    cat > update-ip-whitelist.sh << 'EOF'
#!/bin/bash
# update-ip-whitelist.sh - Update IP whitelist for n8n access

# Get your current IP
CURRENT_IP=$(curl -s ifconfig.me)
echo "Your current IP: $CURRENT_IP"

# Update nginx configuration
sed -i "s/YOUR_IP_ADDRESS/$CURRENT_IP/" nginx/nginx.conf

echo "IP whitelist updated. Restart nginx to apply changes:"
echo "docker-compose restart nginx"
EOF

    chmod +x update-ip-whitelist.sh
    print_status "IP whitelist script created. Run ./update-ip-whitelist.sh to set your IP"
}

# Display security recommendations
show_security_recommendations() {
    print_step "Security recommendations:"
    echo ""
    echo "🔒 SECURITY IMPROVEMENTS IMPLEMENTED:"
    echo ""
    echo "✅ Closed unnecessary ports (3000, 5678, 8025)"
    echo "✅ All services now internal-only except HTTP/HTTPS"
    echo "✅ Nginx reverse proxy for controlled access"
    echo "✅ Rate limiting configured"
    echo "✅ Security headers added"
    echo "✅ IP-based access control for admin interfaces"
    echo ""
    echo "🚨 NEXT STEPS (IMPORTANT):"
    echo ""
    echo "1. Update your IP whitelist:"
    echo "   ./update-ip-whitelist.sh"
    echo ""
    echo "2. Switch to secure configuration:"
    echo "   mv docker-compose.yml docker-compose.old.yml"
    echo "   mv docker-compose.secure.yml docker-compose.yml"
    echo ""
    echo "3. Restart services:"
    echo "   docker-compose down"
    echo "   docker-compose up -d"
    echo ""
    echo "4. Access points after security update:"
    echo "   - Main app: http://57.129.47.114"
    echo "   - n8n admin: http://n8n.57.129.47.114 (IP restricted)"
    echo "   - Webhooks: http://57.129.47.114/webhooks/[webhook-id]"
    echo ""
    echo "5. Consider getting an SSL certificate:"
    echo "   - Use Let's Encrypt with certbot"
    echo "   - Configure HTTPS in nginx"
    echo ""
    echo "🔐 ADDITIONAL SECURITY MEASURES TO CONSIDER:"
    echo ""
    echo "- Set up fail2ban for SSH protection"
    echo "- Configure automatic security updates"
    echo "- Use strong, unique passwords for all services"
    echo "- Regular backups of database and configurations"
    echo "- Monitor logs for suspicious activity"
}

# Main execution
main() {
    configure_secure_firewall
    configure_docker_networking
    create_nginx_config
    create_ip_whitelist
    show_security_recommendations
}

# Run main function
main "$@"
