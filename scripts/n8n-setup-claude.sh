#!/bin/bash
# n8n-setup-claude.sh - Setup script for n8n with Claude AI integration

echo "🔧 Setting up n8n with Claude AI integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if Claude API key is set
check_claude_api_key() {
    if [ -z "$ANTHROPIC_API_KEY" ]; then
        print_error "ANTHROPIC_API_KEY environment variable is not set"
        print_info "Please set your Claude API key in the .env file:"
        echo "ANTHROPIC_API_KEY=sk-ant-your-claude-api-key-here"
        exit 1
    else
        print_status "Claude API key found"
    fi
}

# Test Claude API connection
test_claude_connection() {
    print_info "Testing Claude API connection..."
    
    response=$(curl -s -X POST https://api.anthropic.com/v1/messages \
        -H "Content-Type: application/json" \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -d '{
            "model": "claude-3-haiku-20240307",
            "max_tokens": 50,
            "messages": [{"role": "user", "content": "Test connection"}]
        }')
    
    if echo "$response" | grep -q "content"; then
        print_status "Claude API connection successful"
    else
        print_error "Claude API connection failed"
        print_info "Response: $response"
        exit 1
    fi
}

# Wait for n8n to be ready
wait_for_n8n() {
    print_info "Waiting for n8n to be ready..."
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:5678/rest/login > /dev/null 2>&1; then
            print_status "n8n is ready"
            return 0
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    print_error "n8n did not start within expected time"
    exit 1
}

# Setup n8n workflow
setup_n8n_workflow() {
    print_info "Setting up n8n workflow..."
    
    # Create workflows directory if it doesn't exist
    mkdir -p n8n/workflows
    
    # Copy the Claude workflow JSON
    if [ -f "n8n-claude-workflow.json" ]; then
        cp n8n-claude-workflow.json n8n/workflows/
        print_status "Claude workflow copied to n8n/workflows/"
    else
        print_warning "Claude workflow JSON not found. You'll need to import it manually."
    fi
    
    # Set environment variables for n8n
    print_info "Setting up n8n environment variables..."
    
    # Create n8n env file
    cat > .n8n.env << EOF
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
INTERNAL_API_KEY=${INTERNAL_API_KEY}
WEBHOOK_URL=${WEBHOOK_URL}
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
EOF
    
    print_status "n8n environment configuration created"
}

# Update docker-compose to include Claude environment variables
update_docker_compose() {
    print_info "Updating Docker Compose configuration..."
    
    if [ -f "docker-compose.yml" ]; then
        # Check if ANTHROPIC_API_KEY is already in docker-compose.yml
        if ! grep -q "ANTHROPIC_API_KEY" docker-compose.yml; then
            print_warning "Please manually add ANTHROPIC_API_KEY to your docker-compose.yml n8n service:"
            echo ""
            echo "  n8n:"
            echo "    environment:"
            echo "      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY}"
            echo "      - INTERNAL_API_KEY=\${INTERNAL_API_KEY}"
            echo ""
        else
            print_status "Docker Compose already configured for Claude"
        fi
    else
        print_warning "docker-compose.yml not found"
    fi
}

# Create n8n workflow import instructions
create_import_instructions() {
    cat > n8n-workflow-import.md << 'EOF'
# n8n Workflow Import Instructions

## 1. Access n8n Interface
- Open http://localhost:5678 in your browser
- Complete the initial setup if prompted

## 2. Import Claude AI Workflow
1. Click on "Workflows" in the left sidebar
2. Click "Import from File" or "New"
3. If importing: Select the `n8n-claude-workflow.json` file
4. If creating new: Copy the workflow JSON and paste it

## 3. Configure Credentials
1. Go to "Settings" → "Credentials"
2. Add new credential for "HTTP Header Auth"
3. Set header name: `x-api-key`
4. Set header value: Your Claude API key
5. Name it "Claude API"

## 4. Configure Environment Variables
Make sure these variables are available in n8n:
- `ANTHROPIC_API_KEY`: Your Claude API key
- `INTERNAL_API_KEY`: API key for internal communication
- `WEBHOOK_URL`: Your n8n webhook URL

## 5. Test the Workflow
1. Activate the workflow
2. Send a test email to trigger the webhook
3. Check the execution log for any errors

## 6. Configure Webhook URL
The webhook URL will be displayed in the workflow:
- Copy this URL for your email forwarding setup
- Format: http://localhost:5678/webhook/newsletter-email

## Troubleshooting
- Check n8n logs: `docker-compose logs n8n`
- Verify API key is correct
- Ensure webhook is accessible from email provider
EOF
    
    print_status "Workflow import instructions created: n8n-workflow-import.md"
}

# Main execution
main() {
    echo "🚀 Starting n8n setup with Claude AI integration..."
    echo ""
    
    # Load environment variables
    if [ -f ".env" ]; then
        export $(cat .env | xargs)
        print_status "Environment variables loaded"
    else
        print_warning ".env file not found. Creating template..."
        cp .env.example .env 2>/dev/null || echo "Please create .env file with your configuration"
    fi
    
    # Run setup steps
    check_claude_api_key
    test_claude_connection
    setup_n8n_workflow
    update_docker_compose
    create_import_instructions
    
    echo ""
    print_status "n8n setup with Claude AI completed!"
    echo ""
    print_info "Next steps:"
    echo "1. Start n8n: docker-compose up -d n8n"
    echo "2. Import workflow: Follow instructions in n8n-workflow-import.md"
    echo "3. Test email processing pipeline"
    echo ""
    print_info "Access n8n at: http://localhost:5678"
}

# Run main function
main "$@"