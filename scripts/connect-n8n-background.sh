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
