#!/bin/bash
# fix-system-emails.sh - Update system emails from old domain to new domain

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Fix System Emails - Update Domain${NC}"
echo -e "${BLUE}  Old: @newsletters.57.129.47.114.nip.io${NC}"
echo -e "${BLUE}  New: @digest-genie.com${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Show current emails
echo -e "${YELLOW}Current system emails:${NC}"
docker exec digestgenie-postgres psql -U postgres -d DigestGenie_db -c "SELECT email, system_email FROM users WHERE system_email IS NOT NULL;"

echo ""
echo -e "${YELLOW}Updating system emails...${NC}"

# Update users table
docker exec digestgenie-postgres psql -U postgres -d DigestGenie_db -c "
UPDATE users 
SET system_email = REPLACE(system_email, '@newsletters.57.129.47.114.nip.io', '@digest-genie.com')
WHERE system_email LIKE '%@newsletters.57.129.47.114.nip.io';
"

# Update email_processing table
docker exec digestgenie-postgres psql -U postgres -d DigestGenie_db -c "
UPDATE email_processing
SET email_address = REPLACE(email_address, '@newsletters.57.129.47.114.nip.io', '@digest-genie.com')
WHERE email_address LIKE '%@newsletters.57.129.47.114.nip.io';
"

echo -e "${GREEN}✅ Updated!${NC}"
echo ""

# Show updated emails
echo -e "${YELLOW}Updated system emails:${NC}"
docker exec digestgenie-postgres psql -U postgres -d DigestGenie_db -c "SELECT email, system_email FROM users WHERE system_email IS NOT NULL;"

echo ""
echo -e "${GREEN}Done! All system emails updated to @digest-genie.com${NC}"
