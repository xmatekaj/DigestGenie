// app/admin/inbox/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2 } from 'lucide-react'
import {
  Mail,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Send,
  Loader2
} from 'lucide-react'

interface RawEmail {
  id: string
  sender: string
  subject: string
  rawContent: string
  receivedDate: string
  processed: boolean
  user: {
    email: string
    name: string | null
    systemEmail: string | null
  }
}

export default function AdminInboxPage() {
  const [emails, setEmails] = useState<RawEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [creatingTest, setCreatingTest] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<RawEmail | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/inbox')
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails)
      } else {
        setError('Failed to fetch emails')
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
      setError('Failed to fetch emails')
    } finally {
      setLoading(false)
    }
  }

  const processEmail = async (emailId: string) => {
    try {
      setProcessing(emailId)
      setError('')
      setSuccess('')

      const response = await fetch(`/api/admin/inbox/${emailId}/process`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Email processed successfully! Newsletter: ${data.newsletter.name}`)
        // Refresh emails
        await fetchEmails()
      } else {
        setError(data.error || 'Failed to process email')
      }
    } catch (error) {
      console.error('Error processing email:', error)
      setError('Failed to process email')
    } finally {
      setProcessing(null)
    }
  }

  const createTestEmail = async () => {
    try {
      setCreatingTest(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/admin/inbox/test', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Test email created successfully!')
        // Refresh emails
        await fetchEmails()
      } else {
        setError(data.error || 'Failed to create test email')
      }
    } catch (error) {
      console.error('Error creating test email:', error)
      setError('Failed to create test email')
    } finally {
      setCreatingTest(false)
    }
  }

  const deleteEmail = async (emailId: string) => {
    if (!confirm('Are you sure you want to delete this email?')) return
    
    try {
        const response = await fetch(`/api/admin/inbox/${emailId}`, {
        method: 'DELETE'
        })
        
        if (response.ok) {
        setSuccess('Email deleted successfully')
        await fetchEmails()
        } else {
        setError('Failed to delete email')
        }
    } catch (error) {
        console.error('Error deleting email:', error)
        setError('Failed to delete email')
    }
    }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Inbox</h1>
        </div>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-2">Loading emails...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-8 w-8 text-blue-600" />
              Admin Inbox
            </h1>
            <p className="text-gray-600 mt-2">
              View and process all incoming newsletter emails
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={createTestEmail} 
              variant="default"
              disabled={creatingTest}
            >
              {creatingTest ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Test Email
                </>
              )}
            </Button>
            <Button onClick={fetchEmails} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-gray-900">{emails.length}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {emails.filter(e => e.processed).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {emails.filter(e => !e.processed).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email List */}
      {emails.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emails yet</h3>
            <p className="text-gray-500">
              Emails sent to any @{process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'digestgenie.com'} address will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <Card key={email.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {email.processed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Processed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(email.receivedDate)}
                      </span>
                    </div>
                    
                    <CardTitle className="text-lg">{email.subject}</CardTitle>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Send className="h-4 w-4" />
                        <span>{email.sender}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{email.user.systemEmail || email.user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEmail(selectedEmail?.id === email.id ? null : email)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {selectedEmail?.id === email.id ? 'Hide' : 'View'}
                    </Button>
                    
                    {!email.processed && (
                      <Button
                        size="sm"
                        onClick={() => processEmail(email.id)}
                        disabled={processing === email.id}
                      >
                        {processing === email.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Process Now
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteEmail(email.id)}
                    >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {selectedEmail?.id === email.id && (
                <CardContent className="border-t">
                  <div className="pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Email Content:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-auto">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {email.rawContent}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}