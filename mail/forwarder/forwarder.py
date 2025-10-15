# mail/forwarder/forwarder.py
import os
import time
import email
import requests
import logging
from pathlib import Path
from email import policy
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration
WEBHOOK_URL = os.getenv('WEBHOOK_URL', 'http://digestgenie-web:3000/api/webhooks/email')
MAILBOX_PATH = os.getenv('MAILBOX_PATH', '/var/mail')
CHECK_INTERVAL = int(os.getenv('CHECK_INTERVAL', '10'))

class EmailHandler(FileSystemEventHandler):
    """Handles new email files"""
    
    def on_created(self, event):
        if event.is_directory:
            return
        
        # Wait a moment for file to be fully written
        time.sleep(1)
        
        try:
            self.process_email(event.src_path)
        except Exception as e:
            logger.error(f"Error processing {event.src_path}: {e}")
    
    def process_email(self, filepath):
        """Process and forward email to webhook"""
        logger.info(f"Processing email: {filepath}")
        
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
            try:
                handler.process_email(str(filepath))
            except Exception as e:
                logger.error(f"Error processing {filepath}: {e}")

def main():
    logger.info("🚀 Mail Forwarder starting...")
    logger.info(f"Webhook URL: {WEBHOOK_URL}")
    logger.info(f"Mailbox Path: {MAILBOX_PATH}")
    logger.info(f"Check Interval: {CHECK_INTERVAL}s")
    
    # Process any existing emails
    scan_existing_emails()
    
    # Set up file watcher
    event_handler = EmailHandler()
    observer = Observer()
    observer.schedule(event_handler, MAILBOX_PATH, recursive=True)
    observer.start()
    
    logger.info("👀 Watching for new emails...")
    
    try:
        while True:
            time.sleep(CHECK_INTERVAL)
    except KeyboardInterrupt:
        observer.stop()
        logger.info("Stopping mail forwarder...")
    
    observer.join()

if __name__ == '__main__':
    main()
