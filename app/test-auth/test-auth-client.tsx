// app/test-auth/test-auth-client.tsx - Client component for interactive testing
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface GmailStatus {
  isAuthenticated: boolean
  syncEnabled?: boolean
  lastSync?: string | null
  tokenExpiry?: string | null
  needsReauth?: boolean
  error?: string
}

export default function TestAuthClient() {
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkGmailAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/gmail/auth-status')
      const data = await response.json()
      setGmailStatus(data)
    } catch (error) {
      console.error('Error:', error)
      setGmailStatus({ 
        isAuthenticated: false, 
        error: 'Failed to check Gmail authentication status' 
      })
    }
    setLoading(false)
  }

  const testGmailFetch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/gmail/fetch-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maxResults: 5
        })
      })

      const data = await response.json()
      console.log('Gmail fetch result:', data)
      
      if (response.ok) {
        alert(`Success! Found ${data.emailsFound} emails, processed ${data.emailsProcessed}`)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Gmail fetch error:', error)
      alert('Network error occurred while fetching emails')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={checkGmailAuth}
          disabled={loading}
          variant="outline"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Check Gmail Status
        </Button>

        <Button 
          onClick={testGmailFetch}
          disabled={loading || (gmailStatus && !gmailStatus.isAuthenticated)}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
          Test Gmail Fetch
        </Button>
      </div>

      {/* Gmail Status Display */}
      {gmailStatus && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Gmail API Status</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Authentication:</span>
              <Badge variant={gmailStatus.isAuthenticated ? "default" : "secondary"}>
                {gmailStatus.isAuthenticated ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" /> Not Connected</>
                )}
              </Badge>
            </div>

            {gmailStatus.syncEnabled !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sync Enabled:</span>
                <Badge variant={gmailStatus.syncEnabled ? "default" : "secondary"}>
                  {gmailStatus.syncEnabled ? 'Yes' : 'No'}
                </Badge>
              </div>
            )}

            {gmailStatus.lastSync && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync:</span>
                <span className="text-sm text-gray-900">
                  {new Date(gmailStatus.lastSync).toLocaleString()}
                </span>
              </div>
            )}

            {gmailStatus.tokenExpiry && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Token Expires:</span>
                <span className="text-sm text-gray-900">
                  {new Date(gmailStatus.tokenExpiry).toLocaleString()}
                </span>
              </div>
            )}

            {gmailStatus.needsReauth && (
              <Alert className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your Gmail authentication has expired. Please re-authenticate to continue.
                </AlertDescription>
              </Alert>
            )}

            {gmailStatus.error && (
              <Alert className="mt-3" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{gmailStatus.error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Raw Status Data */}
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              Raw API Response
            </summary>
            <pre className="text-xs bg-white p-2 rounded border mt-2 overflow-auto">
              {JSON.stringify(gmailStatus, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-2">
        <p><strong>How to test:</strong></p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Click "Check Gmail Status" to see current authentication state</li>
          <li>If not connected, you'll need to update OAuth scopes and re-authenticate</li>
          <li>Click "Test Gmail Fetch" to try fetching emails from Gmail</li>
          <li>Check browser console and network tab for detailed error information</li>
        </ol>
      </div>
    </div>
  )
}