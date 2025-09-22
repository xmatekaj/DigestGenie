#!/bin/bash
# generate-env-keys.sh - Generate required environment keys

echo "🔑 Generating environment keys for DigestGenie..."
echo ""

# Function to generate a random key
generate_key() {
    if command -v openssl >/dev/null 2>&1; then
        # Use OpenSSL if available
        openssl rand -hex 32
    elif command -v node >/dev/null 2>&1; then
        # Use Node.js if available
        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    else
        # Fallback: use /dev/urandom
        head /dev/urandom | tr -dc A-Za-z0-9 | head -c 64
    fi
}

# Generate N8N_ENCRYPTION_KEY
echo "1️⃣  N8N_ENCRYPTION_KEY"
echo "   Purpose: Encrypts sensitive data in n8n workflows"
N8N_KEY="digestgenie-n8n-$(generate_key | head -c 20)-2024"
echo "   Generated: $N8N_KEY"
echo ""

# WEBHOOK_URL explanation
echo "2️⃣  WEBHOOK_URL"
echo "   Purpose: Base URL for n8n webhooks"
echo "   For local development: http://localhost:5678"
echo "   For production: https://yourdomain.com (where n8n is hosted)"
WEBHOOK_URL="http://localhost:5678"
echo "   Using: $WEBHOOK_URL"
echo ""

# Generate INTERNAL_API_KEY
echo "3️⃣  INTERNAL_API_KEY"
echo "   Purpose: Secure communication between n8n and your API"
INTERNAL_KEY="digestgenie-api-$(generate_key | head -c 20)-2024"
echo "   Generated: $INTERNAL_KEY"
echo ""

# Create .env additions
echo "📝 Add these to your .env file:"
echo "=================================="
echo ""
echo "# n8n Configuration"
echo "N8N_ENCRYPTION_KEY=\"$N8N_KEY\""
echo "WEBHOOK_URL=\"$WEBHOOK_URL\""
echo "INTERNAL_API_KEY=\"$INTERNAL_KEY\""
echo ""
echo "=================================="
echo ""

# Create a separate file with these values
cat > .env.n8n << EOF
# n8n Configuration - Generated $(date)
N8N_ENCRYPTION_KEY="$N8N_KEY"
WEBHOOK_URL="$WEBHOOK_URL"
INTERNAL_API_KEY="$INTERNAL_KEY"
EOF

echo "✅ Keys generated and saved to .env.n8n"
echo ""
echo "🔄 To apply these:"
echo "1. Copy the lines above to your .env file"
echo "2. Or run: cat .env.n8n >> .env"
echo "3. Restart your Docker containers: docker-compose restart"
echo ""

# Additional security notes
echo "🔒 Security Notes:"
echo "- Keep these keys secret and never commit them to version control"
echo "- Use different keys for production and development"
echo "- Regenerate keys periodically for better security"