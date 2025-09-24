#!/bin/bash
# update-ip-whitelist.sh - Update IP whitelist for n8n access

# Get your current IP
CURRENT_IP=$(curl -s ifconfig.me)
echo "Your current IP: $CURRENT_IP"

# Update nginx configuration
sed -i "s/YOUR_IP_ADDRESS/$CURRENT_IP/" nginx/nginx.conf

echo "IP whitelist updated. Restart nginx to apply changes:"
echo "docker-compose restart nginx"
