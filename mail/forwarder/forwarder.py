import os
import time
import requests
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

MAILHOG_API = os.getenv('MAILHOG_API', 'http://digestgenie-mailhog:8025/api/v2/messages')
WEBHOOK_URL = os.getenv('WEBHOOK_URL', 'http://digestgenie-web:3000/api/webhooks/email')
CHECK_INTERVAL = int(os.getenv('CHECK_INTERVAL', '5'))
processed_ids = set()

def fetch_emails():
    try:
        response = requests.get(MAILHOG_API, params={'limit': 50}, timeout=10)
        response.raise_for_status()
        return response.json().get('items', [])
    except Exception as e:
        logger.error(f"Failed to fetch emails: {e}")
        return []

def delete_email(email_id):
    try:
        base_url = MAILHOG_API.replace('/messages', '')
        requests.delete(f"{base_url}/messages/{email_id}", timeout=5)
        logger.info(f"Deleted email {email_id}")
    except Exception as e:
        logger.warning(f"Failed to delete {email_id}: {e}")

def forward_email(email):
    """Forward email to webhook"""
    try:
        email_id = email.get('ID', 'unknown')
        
        if email_id in processed_ids:
            return
        
        from_addr = email.get('From', {})
        from_email = f"{from_addr.get('Mailbox', '')}@{from_addr.get('Domain', '')}"
        to_addrs = [f"{r.get('Mailbox', '')}@{r.get('Domain', '')}" for r in email.get('To', [])]
        headers = email.get('Content', {}).get('Headers', {})
        subject = headers.get('Subject', ['No Subject'])[0] if headers.get('Subject') else 'No Subject'
        body = email.get('Content', {}).get('Body', '')
        
<<<<<<< HEAD
        logger.info(f"📧 Processing: '{subject}' from {from_email} to {to_addrs}")
||||||| a94e7e7
        try:
            self.process_email(event.src_path)
        except Exception as e:
            logger.error(f"Error processing {event.src_path}: {e}")
    
    def process_email(self, filepath):
        """Process and forward email to webhook"""
        logger.info(f"Processing email: {filepath}")
=======
        try:
            self.process_email(event.src_path)
        except Exception as e:
            logger.error(f"Error processing {event.src_path}: {e}")
    
    def is_valid_recipient_domain(to_addr, valid_domain='digest-genie.com'):
        """
        Check if recipient email address belongs to valid domain
        Returns True if domain matches, False otherwise
        """
        if not to_addr:
            return False
        
        try:
            # Extract domain from email address
            if '<' in to_addr:
                # Handle format: "Name <email@domain.com>"
                email_part = to_addr.split('<')[1].split('>')[0].strip()
            else:
                email_part = to_addr.strip()
            
            domain = email_part.split('@')[-1].lower()
            return domain == valid_domain.lower()
        except Exception as e:
            logger.error(f"Error extracting domain from {to_addr}: {e}")
            return False

    def process_email(self, filepath):
        """Process and forward email to webhook"""
        logger.info(f"Processing email: {filepath}")
>>>>>>> refs/remotes/origin/main2
        
<<<<<<< HEAD
        payload = {
            'id': email_id,
            'from': from_email,
            'to': to_addrs,
            'subject': subject,
            'body': body,
            'raw': email.get('Raw', {}).get('Data', '')
        }
        
        response = requests.post(WEBHOOK_URL, json=payload, timeout=10)
        
        # Check if we should delete the email
        should_delete = False
        
        if response.status_code in [200, 201]:
            logger.info(f"✅ Forwarded successfully")
            should_delete = True
        elif response.status_code in [400, 404]:
            # User not found or bad request - delete spam
||||||| a94e7e7
        try:
            # Read email file
            with open(filepath, 'rb') as f:
                msg = email.message_from_binary_file(f, policy=policy.default)
            
            # Extract email data
            to_addr = msg.get('To', '')
            from_addr = msg.get('From', '')
            subject = msg.get('Subject', '')
            date = msg.get('Date', '')
            
            # Extract body
            body_text = ''
            body_html = ''
            
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    if content_type == 'text/plain':
                        body_text = part.get_content()
                    elif content_type == 'text/html':
                        body_html = part.get_content()
            else:
                body_text = msg.get_content()
            
            # Prepare webhook payload
            payload = {
                'to': to_addr,
                'from': from_addr,
                'subject': subject,
                'date': date,
                'text': body_text,
                'html': body_html
            }
            
            # Send to webhook
            logger.info(f"Forwarding email to webhook: {from_addr} -> {to_addr}")
            response = requests.post(
                WEBHOOK_URL,
                json=payload,
                timeout=30
            )
            
            if response.ok:
                logger.info(f"✅ Email forwarded successfully: {subject}")
                # Optionally delete the email file
                # os.remove(filepath)
            else:
                logger.error(f"❌ Webhook failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Error processing email {filepath}: {e}")

def scan_existing_emails():
    """Scan for any existing unprocessed emails"""
    logger.info(f"Scanning {MAILBOX_PATH} for existing emails...")
    
    handler = EmailHandler()
    mailbox_path = Path(MAILBOX_PATH)
    
    if not mailbox_path.exists():
        logger.warning(f"Mailbox path does not exist: {MAILBOX_PATH}")
        return
    
    # Process all files in mailbox
    for filepath in mailbox_path.rglob('*'):
        if filepath.is_file():
=======
        try:
            # Read email file
            with open(filepath, 'rb') as f:
                msg = email.message_from_binary_file(f, policy=policy.default)
            
            # Extract email data
            to_addr = msg.get('To', '')
            from_addr = msg.get('From', '')
            subject = msg.get('Subject', '')
            date = msg.get('Date', '')
            
            # Validate recipient domain
            if not is_valid_recipient_domain(to_addr):
                logger.warning(f"❌ Rejecting email - invalid domain: {to_addr}")
                logger.info(f"Deleting email file: {filepath}")
                os.remove(filepath)
                return
            
            # Extract body
            body_text = ''
            body_html = ''
            
            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    if content_type == 'text/plain':
                        body_text = part.get_content()
                    elif content_type == 'text/html':
                        body_html = part.get_content()
            else:
                body_text = msg.get_content()
            
            # Prepare webhook payload
            payload = {
                'to': to_addr,
                'from': from_addr,
                'subject': subject,
                'date': date,
                'text': body_text,
                'html': body_html
            }
            
            # Send to webhook
            logger.info(f"Forwarding email to webhook: {from_addr} -> {to_addr}")
            response = requests.post(
                WEBHOOK_URL,
                json=payload,
                timeout=30
            )
            
            if response.ok:
                logger.info(f"✅ Email forwarded successfully: {subject}")
                # Optionally delete the email file
                # os.remove(filepath)
            else:
                logger.error(f"❌ Webhook failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"Error processing email {filepath}: {e}")

def scan_existing_emails():
    """Scan for any existing unprocessed emails"""
    logger.info(f"Scanning {MAILBOX_PATH} for existing emails...")
    
    handler = EmailHandler()
    mailbox_path = Path(MAILBOX_PATH)
    
    if not mailbox_path.exists():
        logger.warning(f"Mailbox path does not exist: {MAILBOX_PATH}")
        return
    
    # Process all files in mailbox
    for filepath in mailbox_path.rglob('*'):
        if filepath.is_file():
>>>>>>> refs/remotes/origin/main2
            try:
                response_data = response.json()
                if response_data.get('shouldDelete', False):
                    logger.warning(f"🗑️  Unknown recipient - deleting spam")
                    should_delete = True
            except:
                pass
        else:
            logger.error(f"❌ Webhook error {response.status_code}: {response.text}")
        
        if should_delete:
            processed_ids.add(email_id)
            delete_email(email_id)
            
    except Exception as e:
        logger.error(f"Error: {e}")

def main():
    logger.info("🚀 Mail Forwarder starting...")
    logger.info(f"MailHog: {MAILHOG_API}")
    logger.info(f"Webhook: {WEBHOOK_URL}")
    logger.info("👀 Watching for emails...")
    
    while True:
        try:
            emails = fetch_emails()
            if emails:
                logger.info(f"📬 Found {len(emails)} email(s)")
                for email in emails:
                    forward_email(email)
            time.sleep(CHECK_INTERVAL)
        except KeyboardInterrupt:
            break
        except Exception as e:
            logger.error(f"Error: {e}")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
