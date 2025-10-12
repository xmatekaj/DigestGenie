// components/email/system-email-dashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'

interface EmailStats {
  systemEmail: string | null
  processingStatus: string
}

export function SystemEmailDashboard() {
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEmailStats()
  }, [])

  const fetchEmailStats = async () => {
    try {
      const response = await fetch('/api/user/system-email')
      if (response.ok) {
        const data = await response.json()
        setEmailStats(data)
      } else {
        setError('Failed to fetch system email')
      }
    } catch (error) {
      console.error('Error fetching email stats:', error)
      setError('Failed to fetch system email')
    } finally {
      setLoading(false)
    }
  }

  const copySystemEmail = () => {
    if (emailStats?.systemEmail) {
      navigator.clipboard.writeText(emailStats.systemEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Your Newsletter Email Address
        </CardTitle>
        <CardDescription>
          Use this email to subscribe to any newsletter. All emails sent here will be automatically processed and organized.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {emailStats?.systemEmail ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-blue-900">Your Newsletter Email:</span>
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <code className="text-lg font-mono text-blue-800 bg-white px-3 py-2 rounded border block">
                  {emailStats.systemEmail}
                </code>
              </div>
              <Button
                onClick={copySystemEmail}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">✅ How to use your newsletter email:</h4>
              <ol className="text-sm text-green-800 space-y-1">
                <li><strong>1.</strong> Copy the email address above</li>
                <li><strong>2.</strong> Use it to subscribe to any newsletter</li>
                <li><strong>3.</strong> Newsletters will automatically appear in your DigestGenie dashboard</li>
                <li><strong>4.</strong> AI will organize, summarize, and categorize them for you</li>
              </ol>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> This email address was automatically created when you signed up. 
                Use it exclusively for newsletter subscriptions.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No system email found. Please contact support or try signing out and back in.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}