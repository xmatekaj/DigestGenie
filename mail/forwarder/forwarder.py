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
        
        logger.info(f"📧 Processing: '{subject}' from {from_email} to {to_addrs}")
        
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
