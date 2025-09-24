// components/email/system-email-dashboard.tsx - Complete fixed version
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
  RefreshCw, 
  Settings,
  BarChart3,
  Clock,
  Inbox,
  TrendingUp
} from 'lucide-react'

interface EmailStats {
  systemEmail: string | null
  totalEmailsReceived: number
  emailsProcessedToday: number
  lastEmailReceived: Date | null
  processingStatus: string
}

export function SystemEmailDashboard() {
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(false)
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
      }
    } catch (error) {
      console.error('Error fetching email stats:', error)
    }
  }

  const generateSystemEmail = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/system-email', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setEmailStats(prev => prev ? {
          ...prev,
          systemEmail: data.systemEmail,
          processingStatus: 'active'
        } : null)
      } else {
        setError(data.error || 'Failed to generate system email')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copySystemEmail = async () => {
    if (emailStats?.systemEmail) {
      await navigator.clipboard.writeText(emailStats.systemEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const refreshStats = async () => {
    setLoading(true)
    await fetchEmailStats()
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* System Email Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Your Newsletter Email
          </CardTitle>
          <CardDescription>
            Use this unique email address to subscribe to newsletters. All emails sent here will be automatically processed and organized.
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
                  <code className="text-lg font-mono text-blue-800 bg-white px-3 py-2 rounded border">
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
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No newsletter email yet</h3>
                <p className="text-gray-600 mb-6">
                  Generate your unique newsletter email address to start receiving and organizing newsletters automatically.
                </p>
              </div>

              <Button onClick={generateSystemEmail} disabled={loading} size="lg">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Generate Newsletter Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Statistics */}
      {emailStats?.systemEmail && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Inbox className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Emails</p>
                  <p className="text-2xl font-bold text-gray-900">{emailStats.totalEmailsReceived}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{emailStats.emailsProcessedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {emailStats.lastEmailReceived 
                      ? new Date(emailStats.lastEmailReceived).toLocaleDateString()
                      : 'None yet'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Settings className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge variant={emailStats.processingStatus === 'active' ? 'default' : 'secondary'}>
                    {emailStats.processingStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      {emailStats?.systemEmail && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Management</CardTitle>
            <CardDescription>
              Manage your newsletter email settings and processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={refreshStats} variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh Stats
              </Button>
              
              <Button onClick={copySystemEmail} variant="outline">
                {copied ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Email'}
              </Button>
              
              <Button variant="outline" asChild>
                <a href="/dashboard/newsletters">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Newsletters
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Generate your newsletter email</p>
                <p className="text-gray-600">Click the button above to create your unique newsletter address</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Subscribe to newsletters</p>
                <p className="text-gray-600">Use your DigestGenie email when subscribing to any newsletter</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Automatic processing</p>
                <p className="text-gray-600">Emails are automatically organized, summarized, and categorized by AI</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-xs mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-medium">Enjoy organized newsletters</p>
                <p className="text-gray-600">View all your newsletters in one place, neatly organized and summarized</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}