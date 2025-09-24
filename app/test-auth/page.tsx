// app/test-auth/page.tsx - Server-side version (no useSession hook)
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, AlertCircle, CheckCircle, ArrowRight, User } from 'lucide-react'
import TestAuthClient from './test-auth-client'

export default async function TestAuth() {
  // Get session on server side
  const session = await getServerSession(authOptions)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gmail Integration Test</h1>
        <p className="text-gray-600">Test your Google authentication and Gmail API access</p>
      </div>

      {/* Server-side Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status (Server-side)
          </CardTitle>
          <CardDescription>
            Session information retrieved on the server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="font-medium text-green-900">Status:</span>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Authenticated
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="font-mono text-sm text-gray-900 mt-1">{session.user?.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Name:</span>
                  <p className="text-gray-900 mt-1">{session.user?.name || 'Not provided'}</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-900">Access Token:</span>
                <Badge className={`ml-2 ${session.accessToken ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {session.accessToken ? 'Present' : 'Missing'}
                </Badge>
                {session.accessToken && (
                  <p className="text-xs text-blue-700 mt-1">
                    Token available for Gmail API calls
                  </p>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex gap-3 flex-wrap">
                  <Link href="/api/auth/signout">
                    <Button variant="outline" size="sm">
                      Sign Out
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button size="sm">
                      Go to Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You are not currently signed in. Sign in to test Gmail integration.
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <Link href="/api/auth/signin/google">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Mail className="h-4 w-4 mr-2" />
                    Sign In with Google
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client-side Testing Component (only if authenticated) */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Gmail API Testing
            </CardTitle>
            <CardDescription>
              Test Gmail API calls and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestAuthClient />
          </CardContent>
        </Card>
      )}

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>
            Technical details for troubleshooting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Environment:</span>
                <p className="text-gray-900">{process.env.NODE_ENV}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">NextAuth URL:</span>
                <p className="text-gray-900 text-xs">{process.env.NEXTAUTH_URL}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <span className="font-medium text-gray-700">Google Client ID:</span>
                <p className="text-gray-900 text-xs">
                  {process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Missing'}
                </p>
              </div>
            </div>

            <details className="border rounded-lg p-3">
              <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                Full Session Data
              </summary>
              <div className="mt-3 p-3 bg-gray-100 rounded text-xs overflow-auto">
                <pre>{JSON.stringify(session, null, 2)}</pre>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">To enable Gmail API access:</h4>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Enable Gmail API in Google Cloud Console</li>
                <li>Add Gmail scopes to OAuth consent screen</li>
                <li>Update NextAuth configuration with Gmail scopes</li>
                <li>Re-authenticate to get Gmail permissions</li>
              </ol>
            </div>
            
            {!session && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">
                  <strong>Note:</strong> You need to sign in first to test Gmail API functionality.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}