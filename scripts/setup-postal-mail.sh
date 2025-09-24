#!/bin/bash
# setup-postal-mail.sh - Setup Postal mail server for localhost/VPS

set -e

echo "🚀 Setting up Postal Mail Server for DigestGenie..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Detect if running on localhost or VPS
detect_environment() {
    if [[ "$HOSTNAME" == "localhost" ]] || [[ "$HOSTNAME" =~ ^(127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.) ]]; then
        ENVIRONMENT="localhost"
        DOMAIN="postal.digestgenie.local"
        EMAIL_DOMAIN="newsletters.digestgenie.local"
    else
        ENVIRONMENT="vps"
        echo "Enter your domain (e.g., digestgenie.com):"
        read -p "> " USER_DOMAIN
        DOMAIN="mail.$USER_DOMAIN"
        EMAIL_DOMAIN="newsletters.$USER_DOMAIN"
    fi
    
    print_step "Environment: $ENVIRONMENT"
    print_step "Postal domain: $DOMAIN"
    print_step "Email domain: $EMAIL_DOMAIN"
}

# Setup localhost hosts file
setup_localhost_hosts() {
    if [ "$ENVIRONMENT" = "localhost" ]; then
        print_step "Setting up localhost hosts..."
        
        # Check if entries exist
        if ! grep -q "postal.digestgenie.local" /etc/hosts; then
            echo "127.0.0.1 postal.digestgenie.local" | sudo tee -a /etc/hosts
            echo "127.0.0.1 newsletters.digestgenie.local" | sudo tee -a /etc/hosts
            print_success "Added hosts entries"
        else
            print_success "Hosts entries already exist"
        fi
    fi
}

# Create Postal configuration
create_postal_config() {
    print_step "Creating Postal configuration..."
    
    mkdir -p postal/config
    
    cat > postal/config/postal.yml << EOF
general:
  use_ip_pools: false
  
web_server:
  bind_address: 0.0.0.0
  port: 5000

smtp_server:
  port: 25
  tls_enabled: true
  tls_certificate_path: ""
  tls_private_key_path: ""
  proxy_protocol: false
  log_connect: true
  strip_received_headers: true

logging:
  stdout: true
  
dns:
  mx_records:
    - mx1.$DOMAIN
  spf_include: spf.$DOMAIN
  return_path: rp.$DOMAIN
  route_domain: $DOMAIN
  track_domain: $DOMAIN
  
smtp:
  host: $DOMAIN
  port: 25
  username: ""
  password: ""
  from_name: "DigestGenie"
  from_address: "noreply@$EMAIL_DOMAIN"

rspamd:
  enabled: true
  host: postal-rspamd
  port: 11334

spamd:
  enabled: false
EOF

    print_success "Postal configuration created"
}

# Generate docker-compose file
generate_docker_compose() {
    print_step "Generating docker-compose file..."
    
    cat > docker-compose.postal.yml << 'EOF'
version: '3.8'

services:
  postal:
    image: postalserver/postal:3.0.2
    container_name: postal-server
    ports:
      - "25:25"
      - "587:587"
      - "5000:5000"
    environment:
      - POSTAL_DATABASE_URL=postgresql://postal:postal123@postal-db:5432/postal
      - POSTAL_RABBITMQ_URL=amqp://postal:postal123@postal-rabbitmq:5672
      - POSTAL_REDIS_URL=redis://postal-redis:6379/0
      - POSTAL_SECRET_KEY=change-this-secret-key-in-production
    volumes:
      - postal_data:/opt/postal/data
      - ./postal/config:/opt/postal/config
    depends_on:
      - postal-db
      - postal-rabbitmq
      - postal-redis
    networks:
      - postal-network

  postal-db:
    image: postgres:13
    container_name: postal-db
    environment:
      - POSTGRES_DB=postal
      - POSTGRES_USER=postal
      - POSTGRES_PASSWORD=postal123
    volumes:
      - postal_db_data:/var/lib/postgresql/data
    networks:
      - postal-network

  postal-rabbitmq:
    image: rabbitmq:3-management
    container_name: postal-rabbitmq
    environment:
      - RABBITMQ_DEFAULT_USER=postal
      - RABBITMQ_DEFAULT_PASS=postal123
    volumes:
      - postal_rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "15672:15672" # Management UI
    networks:
      - postal-network

  postal-redis:
    image: redis:6
    container_name: postal-redis
    volumes:
      - postal_redis_data:/data
    networks:
      - postal-network

  # For testing - catches outgoing emails
  mailhog:
    image: mailhog/mailhog:latest
    container_name: mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - postal-network

volumes:
  postal_data:
  postal_db_data:
  postal_rabbitmq_data:
  postal_redis_data:

networks:
  postal-network:
    driver: bridge
EOF

    print_success "Docker compose file generated"
}

# Start services
start_services() {
    print_step "Starting Postal services..."
    
    docker-compose -f docker-compose.postal.yml up -d
    
    print_step "Waiting for services to start..."
    sleep 30
    
    print_success "Services started!"
}

# Initialize Postal
initialize_postal() {
    print_step "Initializing Postal..."
    
    # Wait for database to be ready
    print_step "Waiting for database..."
    sleep 10
    
    # Initialize database
    docker exec postal-server postal initialize
    
    # Create admin user
    print_step "Creating admin user..."
    docker exec postal-server postal make-user
    
    print_success "Postal initialized!"
}

# Generate environment file
generate_env_file() {
    print_step "Generating environment configuration..."
    
    cat >> .env.postal << EOF

# ======================
# POSTAL MAIL SERVER
# ======================
EMAIL_PROVIDER=postal
EMAIL_DOMAIN="$EMAIL_DOMAIN"
POSTAL_API_URL="http://localhost:5000"
POSTAL_API_KEY="your-postal-api-key-from-dashboard"
POSTAL_WEBHOOK_SECRET="your-webhook-secret"

# ======================
# LOCALHOST SETTINGS
# ======================
SMTP_HOST=localhost
SMTP_PORT=25
WEBHOOK_URL="http://host.docker.internal:3000/api/webhooks/email"

EOF

    print_success "Environment file created: .env.postal"
}

# Setup instructions
show_instructions() {
    echo ""
    print_success "🎉 Postal Mail Server setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. 🌐 Access Postal Dashboard:"
    echo "   http://localhost:5000"
    echo ""
    echo "2. 🔑 Login with admin credentials (created during setup)"
    echo ""
    echo "3. 📧 Create organization and mail server:"
    echo "   - Domain: $EMAIL_DOMAIN"
    echo "   - Return path: rp.$EMAIL_DOMAIN"
    echo ""
    echo "4. 🔐 Get API key:"
    echo "   - Go to Organization > API Keys"
    echo "   - Create new key"
    echo "   - Update .env.postal file"
    echo ""
    echo "5. 📨 Test services:"
    echo "   - MailHog UI: http://localhost:8025"
    echo "   - RabbitMQ Management: http://localhost:15672"
    echo ""
    echo "6. 🔧 Update your DigestGenie .env:"
    echo "   cat .env.postal >> .env"
    echo ""
    
    if [ "$ENVIRONMENT" = "vps" ]; then
        echo "🚀 VPS Additional Steps:"
        echo "1. Setup DNS records:"
        echo "   MX  $EMAIL_DOMAIN  10  $DOMAIN"
        echo "   A   $DOMAIN        your-vps-ip"
        echo ""
        echo "2. Configure SSL certificates (Let's Encrypt recommended)"
        echo "3. Open firewall ports: 25, 587, 993, 5000"
    fi
}

# Cleanup function
cleanup_on_error() {
    print_error "Setup failed! Cleaning up..."
    docker-compose -f docker-compose.postal.yml down -v 2>/dev/null || true
    exit 1
}

# Set error handling
trap cleanup_on_error ERR

# Main execution
main() {
    detect_environment
    setup_localhost_hosts
    create_postal_config
    generate_docker_compose
    start_services
    initialize_postal
    generate_env_file
    show_instructions
}

# Run main function
main "$@"