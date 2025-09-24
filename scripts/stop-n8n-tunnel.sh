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
