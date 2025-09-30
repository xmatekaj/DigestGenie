// components/gmail/gmail-integration.tsx - Gmail integration UI component
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface EmailSummary {
  id: string
  subject: string
  sender: string
  date: string
  snippet: string
  isNewsletter: boolean
}

export function GmailIntegration() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [emails, setEmails] = useState<EmailSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check Gmail authentication status on component mount
  useEffect(() => {
    checkGmailAuth()
  }, [session])

  const checkGmailAuth = async () => {
    if (!session?.user?.email) return

    try {
      const response = await fetch('/api/gmail/auth-status')
      const data = await response.json()
      setIsAuthenticated(data.isAuthenticated)
    } catch (error) {
      console.error('Error checking Gmail auth:', error)
    }
  }

  const fetchEmails = async () => {
    if (!session?.user?.email) {
      setError('Please sign in to access Gmail')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gmail/fetch-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          maxResults: 20
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'INSUFFICIENT_SCOPES' || data.code === 'AUTH_FAILED') {
          setError(data.error)
          setIsAuthenticated(false)
        } else {
          setError(data.error || 'Failed to fetch emails')
        }
        return
      }

      setEmails(data.emails || [])
      setIsAuthenticated(true)
      console.log(`Fetched ${data.emailsProcessed} new emails out of ${data.emailsFound} found`)

    } catch (error) {
      console.error('Error fetching emails:', error)
      setError('Network error occurred while fetching emails')
    } finally {
      setIsLoading(false)
    }
  }

  const reauthorizeGmail = () => {
    // Trigger re-authentication with Gmail scopes
    window.location.href = '/api/auth/signin/google'
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gmail Integration
          </CardTitle>
          <CardDescription>
            Sign in to connect your Gmail account
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Gmail Integration
            </div>
            <Badge variant={isAuthenticated ? "default" : "secondary"}>
              {isAuthenticated ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> Connected</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" /> Not Connected</>
              )}
            </Badge>
          </CardTitle>
          <CardDescription>
            Automatically fetch and process newsletters from your Gmail account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                {(error.includes('authentication') || error.includes('permissions')) && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal ml-2"
                    onClick={reauthorizeGmail}
                  >
                    Re-authenticate now
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={fetchEmails}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isLoading ? 'Fetching...' : 'Fetch Emails'}
            </Button>

            {!isAuthenticated && (
              <Button 
                variant="outline"
                onClick={reauthorizeGmail}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Connect Gmail
              </Button>
            )}
          </div>

          {emails.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Recently Processed Emails ({emails.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {emails.map((email) => (
                  <div 
                    key={email.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{email.subject}</p>
                        {email.isNewsletter && (
                          <Badge variant="secondary" className="text-xs">Newsletter</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        From: {email.sender}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {email.snippet}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400 ml-4 text-right">
                      {new Date(email.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAuthenticated && emails.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No emails found. Try fetching emails to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gmail Setup Instructions */}
      {!isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Gmail Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">To connect Gmail:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Click "Connect Gmail" button above</li>
                <li>Sign in with your Google account</li>
                <li>Grant permission to read your emails</li>
                <li>Return here and click "Fetch Emails"</li>
              </ol>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Privacy Note:</strong> We only read emails from newsletters you've subscribed to. 
                Your personal emails remain private and are never accessed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}