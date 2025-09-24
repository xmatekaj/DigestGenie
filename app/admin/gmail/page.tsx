// app/admin/gmail/page.tsx
'use client';

import { useState } from 'react';
import { Mail, RefreshCw, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface ProcessResult {
  success: boolean;
  totalEmails: number;
  newslettersProcessed: number;
  processedEmails: Array<{
    messageId: string;
    from: string;
    subject: string;
    newsletter: string;
    articlesCount: number;
  }>;
}

export default function GmailProcessingPage() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processGmailEmails = async () => {
    setProcessing(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/gmail/process', {
        method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Failed to process emails');
      }
    } catch (err) {
      setError('Network error occurred. Make sure the API endpoint exists.');
      console.error('Gmail processing error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Mail className="w-8 h-8 mr-3 text-blue-600" />
          Gmail Newsletter Processing
        </h1>
        <p className="text-gray-600 mt-2">
          Process unread emails from your Gmail account to automatically detect and import newsletters
        </p>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Setup Required:</h3>
        <ol className="list-decimal list-inside text-blue-800 space-y-1">
          <li>Enable Gmail API in Google Cloud Console</li>
          <li>Install googleapis package: <code className="bg-blue-100 px-1 rounded">npm install googleapis</code></li>
          <li>Create the Gmail processing API endpoint</li>
          <li>Update NextAuth to include Gmail scopes</li>
        </ol>
        <a 
          href="https://console.cloud.google.com" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-2"
        >
          Open Google Cloud Console <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>

      {/* Processing Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <button
            onClick={processGmailEmails}
            disabled={processing}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium text-white ${
              processing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            } transition-colors`}
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${processing ? 'animate-spin' : ''}`} />
            {processing ? 'Processing Emails...' : 'Process Gmail Emails'}
          </button>
          
          <p className="text-sm text-gray-600 mt-2">
            This will check your Gmail for unread emails and process any newsletters found.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error occurred:</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                {error.includes('API endpoint') && (
                  <p className="text-red-600 text-xs mt-2">
                    Make sure to create the <code>/api/gmail/process/route.ts</code> file first.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Results */}
        {results && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-800">Processing Complete!</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-gray-600">Total Emails Checked</p>
                <p className="text-2xl font-bold text-green-800">{results.totalEmails}</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-gray-600">Newsletters Found</p>
                <p className="text-2xl font-bold text-green-800">{results.newslettersProcessed}</p>
              </div>
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-sm text-gray-600">Articles Processed</p>
                <p className="text-2xl font-bold text-green-800">
                  {results.processedEmails?.reduce((sum, email) => sum + email.articlesCount, 0) || 0}
                </p>
              </div>
            </div>

            {results.processedEmails && results.processedEmails.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-green-800 mb-3">Processed Newsletters:</h4>
                <div className="space-y-2">
                  {results.processedEmails.map((email, index) => (
                    <div key={index} className="bg-white p-4 rounded border border-green-200 hover:border-green-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{email.newsletter}</p>
                          <p className="text-sm text-gray-600 mt-1">{email.subject}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            From: {email.from}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {email.articlesCount} article{email.articlesCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.newslettersProcessed === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  No newsletters found in unread emails. Try subscribing to some newsletters or check that they're unread in Gmail.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Scans your unread Gmail emails</li>
            <li>• Identifies newsletters using domain and keyword detection</li>
            <li>• Extracts articles and content from newsletters</li>
            <li>• Creates newsletter entries in your database</li>
            <li>• Marks processed emails as read</li>
            <li>• Articles appear in your dashboard feed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}