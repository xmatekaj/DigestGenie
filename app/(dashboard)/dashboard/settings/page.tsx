// app/(dashboard)/dashboard/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User,
  Mail,
  Shield,
  LogOut,
  CheckCircle,
  AlertCircle,
  Copy,
  Sparkles,
  Bell,
  Trash2
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [systemEmail, setSystemEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  useEffect(() => {
    fetchUserSettings()
  }, [])

  const fetchUserSettings = async () => {
    try {
      setLoading(true)
      // Fetch system email
      const emailResponse = await fetch('/api/user/system-email')
      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        setSystemEmail(emailData.systemEmail)
      }

      // Check 2FA status
      // TODO: Add API endpoint to check 2FA status
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const copySystemEmail = () => {
    if (systemEmail) {
      navigator.clipboard.writeText(systemEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {session?.user?.name || 'Not set'}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {session?.user?.email}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Email Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Newsletter Email
          </CardTitle>
          <CardDescription>
            Your dedicated email for newsletter subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systemEmail ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <code className="text-sm font-mono text-blue-800">
                  {systemEmail}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copySystemEmail}
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                Use this email address when subscribing to newsletters. All emails sent here will be automatically processed.
              </p>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No system email found. Please contact support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Features
          </CardTitle>
          <CardDescription>
            Configure how AI processes your newsletters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">AI Summaries</h4>
              <p className="text-sm text-gray-600">Generate summaries for articles</p>
            </div>
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">AI Categorization</h4>
              <p className="text-sm text-gray-600">Automatically categorize content</p>
            </div>
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Interest Scoring</h4>
              <p className="text-sm text-gray-600">Rank articles by relevance</p>
            </div>
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              <CheckCircle className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          </div>

          <p className="text-sm text-gray-500">
            AI features are currently enabled by default. Custom preferences coming soon.
          </p>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">
                {twoFactorEnabled 
                  ? 'Additional security for your account' 
                  : 'Add an extra layer of security'
                }
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              {twoFactorEnabled ? 'Manage' : 'Enable'}
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication setup coming soon.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Email Digest</h4>
                <p className="text-sm text-gray-600">Daily summary of new articles</p>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Account Actions</CardTitle>
          <CardDescription>
            Sign out or manage your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
          
          <p className="text-xs text-gray-500">
            Account deletion is not yet available. Contact support if needed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}