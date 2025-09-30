// lib/email-processor.ts
// Email processing is handled by n8n workflows
// This file provides utilities for email processing when needed

export interface EmailProcessorConfig {
  anthropicApiKey?: string;
}

export class EmailProcessor {
  constructor(config: EmailProcessorConfig) {
    // Placeholder - actual processing done by n8n
  }

  async processEmail(emailContent: string) {
    return {
      success: true,
      message: "Email processing handled by n8n",
    };
  }
}

// Export standalone function for backward compatibility
export const processEmail = async (email: any) => {
  console.log('processEmail called - email processing is handled by n8n');
  return { 
    success: true,
    message: 'Email queued for processing by n8n'
  };
};