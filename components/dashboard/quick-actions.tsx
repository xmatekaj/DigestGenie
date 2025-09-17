// components/dashboard/quick-actions.tsx - Quick action buttons
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, Mail, Zap, Settings, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()
  const [systemEmailModal, setSystemEmailModal] = useState(false)
  const [systemEmail, setSystemEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleGenerateSystemEmail = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/system-email', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setSystemEmail(data.systemEmail)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate system email')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyEmail = async () => {
    if (systemEmail) {
      await navigator.clipboard.writeText(systemEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-sm text-gray-600">
          Get started with essential setup tasks
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Generate System Email */}
          <Dialog open={systemEmailModal} onOpenChange={setSystemEmailModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex flex-col h-auto py-4 px-3">
                <Mail className="h-6 w-6 mb-2 text-blue-500" />
                <span className="text-sm font-medium">Setup Email</span>
                <span className="text-xs text-gray-500">Generate forwarding email</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Setup System Email</DialogTitle>
                <DialogDescription>
                  Generate a unique email address for forwarding your newsletters
                </DialogDescription>
              </DialogHeader>

              {!systemEmail ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      We'll create a unique email address like <strong>user12345@newsletters.yourdomain.com</strong> 
                      that you can use to forward newsletters from your regular email providers.
                    </AlertDescription>
                  </Alert>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handleGenerateSystemEmail}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Generating...' : 'Generate System Email'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your system email has been generated successfully!
                    </AlertDescription>
                  </Alert>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono text-blue-600">
                        {systemEmail}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyEmail}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-2">
                    <h4 className="font-medium">Next Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Copy this email address</li>
                      <li>Set up email forwarding in your email provider (Gmail, Outlook, etc.)</li>
                      <li>Forward newsletters to this address</li>
                      <li>We'll automatically process and organize them for you!</li>
                    </ol>
                  </div>

                  <Button 
                    onClick={() => setSystemEmailModal(false)}
                    className="w-full"
                  >
                    Done
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Add Newsletter */}
          <Button 
            variant="outline" 
            className="flex flex-col h-auto py-4 px-3"
            onClick={() => router.push('/dashboard?tab=browse')}
          >
            <Plus className="h-6 w-6 mb-2 text-green-500" />
            <span className="text-sm font-medium">Add Newsletter</span>
            <span className="text-xs text-gray-500">Browse & subscribe</span>
          </Button>

          {/* AI Features */}
          <Button 
            variant="outline" 
            className="flex flex-col h-auto py-4 px-3"
            onClick={() => router.push('/dashboard/settings#ai')}
          >
            <Zap className="h-6 w-6 mb-2 text-purple-500" />
            <span className="text-sm font-medium">AI Features</span>
            <span className="text-xs text-gray-500">Configure AI options</span>
          </Button>

          {/* Settings */}
          <Button 
            variant="outline" 
            className="flex flex-col h-auto py-4 px-3"
            onClick={() => router.push('/dashboard/settings')}
          >
            <Settings className="h-6 w-6 mb-2 text-gray-500" />
            <span className="text-sm font-medium">Settings</span>
            <span className="text-xs text-gray-500">Preferences & account</span>
          </Button>
        </div>

        {/* Setup Progress */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Setup Progress</h3>
            <Badge variant="secondary">2/4 Complete</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Account created</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Email verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
              <span className="text-gray-500">System email generated</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
              <span className="text-gray-500">First newsletter subscribed</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}