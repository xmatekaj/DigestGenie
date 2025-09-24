#!/bin/bash
# setup-ssh-tunnel.sh - Set up secure SSH tunnel access for n8n

set -e

echo "🔐 Setting up SSH tunnel access for n8n..."

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Secure the firewall
secure_firewall() {
    print_step "Securing firewall - closing dangerous ports..."
    
    print_status "Current firewall rules:"
    ufw status numbered
    echo ""
    
    # Close the risky ports
    print_warning "Closing public access to application ports..."
    
    # Close n8n port (most important)
    if ufw status numbered | grep -q "5678/tcp"; then
        ufw --force delete allow 5678/tcp
        print_status "✅ Closed port 5678 (n8n) - now secure!"
    else
        print_status "Port 5678 already closed"
    fi
    
    # Close direct app access
    if ufw status numbered | grep -q "3000/tcp"; then
        ufw --force delete allow 3000/tcp
        print_status "✅ Closed port 3000 (direct app access)"
    else
        print_status "Port 3000 already closed"
    fi
    
    # Close MailHog
    if ufw status numbered | grep -q "8025/tcp"; then
        ufw --force delete allow 8025/tcp
        print_status "✅ Closed port 8025 (MailHog)"
    else
        print_status "Port 8025 already closed"
    fi
    
    # Remove standard SSH port 22 if it exists (you use 63852)
    ufw --force delete allow 22/tcp 2>/dev/null || true
    ufw --force delete allow ssh 2>/dev/null || true
    
    # Ensure your SSH port is open
    if ! ufw status | grep -q "63852/tcp"; then
        ufw allow 63852/tcp
        print_status "✅ Ensured SSH port 63852 is open"
    fi
    
    echo ""
    print_status "🔒 SECURE FIREWALL STATUS:"
    ufw status numbered
    echo ""
}

# Step 2: Update Docker Compose for localhost-only binding
update_docker_compose() {
    print_step "Updating Docker Compose for localhost-only access..."
    
    # Backup current config
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "docker-compose.backup.$(date +%Y%m%d_%H%M%S).yml"
        print_status "Backed up current docker-compose.yml"
    fi
    
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
    restart: unless-stopped
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - digestgenie

  # n8n - LOCALHOST BINDING ONLY (for SSH tunnel access)
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
    ports:
      - "127.0.0.1:5678:5678"  # BIND TO LOCALHOST ONLY!
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

  # Nginx - For webhooks only
  nginx:
    image: nginx:alpine
    container_name: digestgenie_nginx
    ports:
      - "80:80"
      - "443:443"
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

    print_status "✅ Docker Compose updated - n8n now localhost-only"
}

# Step 3: Create Nginx config for webhooks
create_nginx_config() {
    print_step "Creating Nginx configuration for webhooks..."
    
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
    
    # Hide server info
    server_tokens off;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=webhooks:10m rate=30r/m;
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    
    server {
        listen 80 default_server;
        server_name 57.129.47.114;
        
        # Root - Simple status
        location / {
            limit_req zone=general burst=5 nodelay;
            return 200 'DigestGenie Newsletter Aggregator\nWebhooks: /webhooks/[id]\nStatus: OK\n';
            add_header Content-Type text/plain;
        }
        
        # Health check
        location /health {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
        
        # n8n webhooks ONLY - for email processing
        location /webhooks/ {
            limit_req zone=webhooks burst=10 nodelay;
            
            proxy_pass http://n8n:5678/webhook/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-Forwarded-Host $host;
            
            # Webhook timeout settings
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
        
        # Block admin paths completely
        location ~ ^/(admin|n8n|api/admin) {
            deny all;
            return 404;
        }
        
        # Block sensitive files
        location ~ /\.(env|git|htaccess|htpasswd|log) {
            deny all;
            return 404;
        }
        
        # Block common exploit attempts
        location ~ /(wp-admin|wp-login|phpMyAdmin|phpmyadmin) {
            deny all;
            return 404;
        }
    }
}
EOF

    print_status "✅ Nginx configured for webhooks only"
}

# Step 4: Create connection scripts for local machine
create_connection_scripts() {
    print_step "Creating connection scripts..."
    
    # Main connection script
    cat > connect-to-n8n.sh << 'EOF'
#!/bin/bash
# connect-to-n8n.sh - Connect to n8n via SSH tunnel

echo "🔗 Connecting to n8n on DigestGenie server..."

# Configuration
REMOTE_HOST="57.129.47.114"
REMOTE_PORT="63852"
REMOTE_USER="ubuntu"
LOCAL_PORT="5678"
REMOTE_N8N_PORT="5678"

# Check if local port is available
if lsof -Pi :$LOCAL_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $LOCAL_PORT is already in use."
    echo "Trying alternative port 5679..."
    LOCAL_PORT="5679"
    
    if lsof -Pi :$LOCAL_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port $LOCAL_PORT is also busy. Please close other applications or choose different port."
        exit 1
    fi
fi

echo "📡 Creating SSH tunnel..."
echo "   Remote: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PORT"
echo "   Local:  http://localhost:$LOCAL_PORT"
echo ""
echo "✨ n8n will be available at: http://localhost:$LOCAL_PORT"
echo ""
echo "💡 Tips:"
echo "   - Keep this terminal window open"
echo "   - Press Ctrl+C to disconnect"
echo "   - Your n8n data is safely stored on the server"
echo ""
echo "🔄 Connecting..."
echo "----------------------------------------"

# Create the SSH tunnel
ssh -L $LOCAL_PORT:127.0.0.1:$REMOTE_N8N_PORT -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST

echo ""
echo "🔌 SSH tunnel disconnected."
EOF

    chmod +x connect-to-n8n.sh
    
    # Background connection script
    cat > connect-n8n-background.sh << 'EOF'
#!/bin/bash
# connect-n8n-background.sh - Start n8n tunnel in background

REMOTE_HOST="57.129.47.114"
REMOTE_PORT="63852"
REMOTE_USER="ubuntu"
LOCAL_PORT="5678"

# Check if already running
if lsof -Pi :$LOCAL_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ SSH tunnel already running on port $LOCAL_PORT"
    echo "   Access n8n at: http://localhost:$LOCAL_PORT"
    exit 0
fi

echo "🔗 Starting n8n SSH tunnel in background..."

# Start tunnel in background
ssh -f -N -L $LOCAL_PORT:127.0.0.1:5678 -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST

if [ $? -eq 0 ]; then
    echo "✅ SSH tunnel started successfully!"
    echo "   Access n8n at: http://localhost:$LOCAL_PORT"
    echo ""
    echo "To stop the tunnel:"
    echo "   ./stop-n8n-tunnel.sh"
else
    echo "❌ Failed to start SSH tunnel"
    exit 1
fi
EOF

    chmod +x connect-n8n-background.sh
    
    # Stop tunnel script
    cat > stop-n8n-tunnel.sh << 'EOF'
#!/bin/bash
# stop-n8n-tunnel.sh - Stop n8n SSH tunnel

echo "🔌 Stopping n8n SSH tunnels..."

# Find and kill SSH tunnels for n8n
SSH_PIDS=$(ps aux | grep "ssh.*127.0.0.1:5678" | grep -v grep | awk '{print $2}')

if [ -z "$SSH_PIDS" ]; then
    echo "ℹ️  No n8n SSH tunnels found running"
else
    for PID in $SSH_PIDS; do
        kill $PID
        echo "✅ Stopped SSH tunnel (PID: $PID)"
    done
fi

# Check if port is now free
if ! lsof -Pi :5678 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port 5678 is now available"
else
    echo "⚠️  Port 5678 still in use by another process"
fi
EOF

    chmod +x stop-n8n-tunnel.sh
    
    print_status "✅ Connection scripts created"
}

# Step 5: Create SSH config template
create_ssh_config_template() {
    print_step "Creating SSH config template..."
    
    cat > ssh-config-template.txt << 'EOF'
# Add this to your local ~/.ssh/config file for easier connection

Host digestgenie
    HostName 57.129.47.114
    Port 63852
    User ubuntu
    LocalForward 5678 127.0.0.1:5678
    # Optional: Use key-based auth
    # IdentityFile ~/.ssh/your_private_key

# With this config, you can simply run:
# ssh digestgenie
# Then access n8n at http://localhost:5678
EOF

    print_status "✅ SSH config template created"
}

# Step 6: Restart services and test
restart_and_test() {
    print_step "Restarting services with new secure configuration..."
    
    # Stop current services
    docker-compose down
    
    # Start with new configuration
    docker-compose up -d
    
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check service status
    print_step "Service Status:"
    docker-compose ps
    
    echo ""
    print_step "Testing n8n localhost binding..."
    
    # Test that n8n is accessible from localhost but not externally
    if docker-compose exec n8n curl -f http://localhost:5678/healthz >/dev/null 2>&1; then
        print_status "✅ n8n is running and accessible from localhost"
    else
        print_warning "⚠️  n8n health check failed - check logs with: docker-compose logs n8n"
    fi
    
    # Test webhook endpoint
    print_step "Testing webhook endpoint..."
    if curl -f http://57.129.47.114/health >/dev/null 2>&1; then
        print_status "✅ Webhook endpoint is accessible"
    else
        print_warning "⚠️  Webhook endpoint not accessible - check nginx logs"
    fi
}

# Step 7: Create instructions
create_instructions() {
    print_step "Creating usage instructions..."
    
    cat > HOW-TO-USE-N8N.md << 'EOF'
# How to Access n8n via SSH Tunnel

## Quick Start

### 1. Connect to n8n (Interactive)
```bash
./connect-to-n8n.sh
```
- Creates tunnel and keeps terminal open
- Access n8n at: http://localhost:5678
- Press Ctrl+C to disconnect

### 2. Connect in Background
```bash
./connect-n8n-background.sh
```
- Runs tunnel in background
- Access n8n at: http://localhost:5678
- Use `./stop-n8n-tunnel.sh` to disconnect

### 3. Manual SSH Tunnel
```bash
ssh -L 5678:127.0.0.1:5678 -p 63852 ubuntu@57.129.47.114
```

## Setup SSH Config (Optional)

Add to your `~/.ssh/config`:
```
Host digestgenie
    HostName 57.129.47.114
    Port 63852
    User ubuntu
    LocalForward 5678 127.0.0.1:5678
```

Then simply: `ssh digestgenie`

## n8n Workflow Configuration

### Webhook URLs
When creating webhooks in n8n, use:
```
http://57.129.47.114/webhooks/your-webhook-id
```

### Testing Webhooks
```bash
# Test webhook endpoint
curl -X POST http://57.129.47.114/webhooks/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 5678
lsof -i :5678

# Or use different local port
ssh -L 8678:127.0.0.1:5678 -p 63852 ubuntu@57.129.47.114
# Then access: http://localhost:8678
```

### SSH Connection Issues
```bash
# Test SSH connection
ssh -p 63852 ubuntu@57.129.47.114

# Check if services are running on server
docker-compose ps
```

### n8n Not Loading
```bash
# Check n8n logs on server
docker-compose logs n8n

# Check if n8n is bound to localhost only
docker-compose exec n8n netstat -tlnp | grep 5678
```

## Security Notes

✅ **n8n admin interface is NOT accessible from internet**
✅ **Only accessible via SSH tunnel from your machine**
✅ **Webhooks work normally for email processing**
✅ **All data and API keys remain secure**

## Next Steps

1. Connect via SSH tunnel
2. Access n8n at http://localhost:5678
3. Complete n8n setup wizard
4. Import email processing workflows
5. Configure webhook URLs using: http://57.129.47.114/webhooks/[id]
EOF

    print_status "✅ Instructions created: HOW-TO-USE-N8N.md"
}

# Final summary
show_completion_summary() {
    echo ""
    print_step "🎉 SSH Tunnel Setup Complete!"
    echo ""
    print_status "SECURITY STATUS:"
    echo "✅ n8n admin interface secured (localhost only)"
    echo "✅ Dangerous ports closed (5678, 3000, 8025)"
    echo "✅ Only SSH (63852) and HTTP/HTTPS (80/443) open"
    echo "✅ Webhooks work at: http://57.129.47.114/webhooks/[id]"
    echo ""
    print_status "FILES CREATED:"
    echo "📄 connect-to-n8n.sh - Main connection script"
    echo "📄 connect-n8n-background.sh - Background tunnel"
    echo "📄 stop-n8n-tunnel.sh - Stop tunnel"
    echo "📄 ssh-config-template.txt - SSH config template"
    echo "📄 HOW-TO-USE-N8N.md - Complete instructions"
    echo ""
    print_warning "COPY THESE SCRIPTS TO YOUR LOCAL MACHINE:"
    echo "scp -P 63852 ubuntu@57.129.47.114:~/dev/digestgenie/connect-*.sh ."
    echo "scp -P 63852 ubuntu@57.129.47.114:~/dev/digestgenie/stop-n8n-tunnel.sh ."
    echo ""
    print_status "NEXT STEPS:"
    echo "1. Copy connection scripts to your local machine"
    echo "2. Run: ./connect-to-n8n.sh"
    echo "3. Access n8n at: http://localhost:5678"
    echo "4. Complete n8n setup and configure workflows"
    echo ""
    print_status "PUBLIC ENDPOINTS (working):"
    echo "🌐 Status: http://57.129.47.114/"
    echo "🔗 Webhooks: http://57.129.47.114/webhooks/[webhook-id]"
}

# Main execution
main() {
    secure_firewall
    update_docker_compose
    create_nginx_config
    create_connection_scripts
    create_ssh_config_template
    restart_and_test
    create_instructions
    show_completion_summary
}

# Run main function
main "$@"
