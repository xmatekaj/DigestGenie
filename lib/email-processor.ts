// lib/email-processor.ts
// Email processing is handled by n8n workflows
// This is a placeholder for any direct email processing needs

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

export const processEmail = async (email: any) => {
  return { success: true };
};
