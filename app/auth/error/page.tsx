// app/auth/error/page.tsx - OAuth error handling page
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react'

const errorMessages = {
  'Configuration': 'Server configuration error. Please contact support.',
  'AccessDenied': 'Access was denied. You may have cancelled the authorization or denied permissions.',
  'Verification': 'Email verification failed.',
  'Default': 'An unexpected error occurred during authentication.',
  'OAuthCallback': 'OAuth callback error. Please try signing in again.',
  'OAuthSignin': 'Error during OAuth sign-in process.',
  'OAuthCreateAccount': 'Could not create OAuth account.',
  'EmailCreateAccount': 'Could not create email account.',
  'Callback': 'OAuth callback error.',
  'OAuthAccountNotLinked': 'This OAuth account is not linked to an existing user.',
  'EmailSignin': 'Email sign-in error.',
  'CredentialsSignin': 'Invalid credentials provided.',
  'SessionRequired': 'Session required to access this page.'
}

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  
  const errorMessage = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default

  const handleRetry = () => {
    // Clear any cached auth state and redirect to sign in
    window.location.href = '/auth/signin'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Authentication Error</CardTitle>
          <CardDescription>
            There was a problem signing you in
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {errorMessage}
            </AlertDescription>
          </Alert>

          {error === 'AccessDenied' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Why this happened:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• You clicked "Cancel" or "Deny" during Google sign-in</li>
                <li>• Gmail permissions were not granted</li>
                <li>• Your Google account may have restrictions</li>
              </ul>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleRetry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" /> Home
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <Link 
              href="/contact" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Still having trouble? Contact support
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}