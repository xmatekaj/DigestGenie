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
