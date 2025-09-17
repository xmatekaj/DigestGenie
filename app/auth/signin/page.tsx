'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  Star,
  CheckCircle,
  Zap
} from 'lucide-react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      setError('Failed to sign in with Google')
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!showTwoFactor) {
      // First step: email/password
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Check if user has 2FA enabled (mock check for now)
      const requires2FA = false // This would be checked against your API
      
      if (requires2FA) {
        setShowTwoFactor(true)
        setLoading(false)
      } else {
        window.location.href = '/dashboard'
      }
    } else {
      // Handle 2FA verification
      // This would be implemented when 2FA is fully set up
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-genie-500 via-magic-500 to-genie-600 items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-10 h-10 text-white animate-genie-sparkle" />
            </div>
            <div className="text-left">
              <h1 className="font-display text-3xl font-bold">DigestGenie</h1>
              <p className="text-white/80">Your AI Newsletter Genie</p>
            </div>
          </div>
          
          <h2 className="font-display text-2xl font-bold mb-4">
            Three Wishes Granted ✨
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Organize, summarize, and simplify your newsletters with magical AI assistance.
          </p>

          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Automatic newsletter organization</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>AI-powered summaries and insights</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Personalized content recommendations</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Save hours every week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-genie-500 to-magic-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-2xl text-gray-900">
                DigestGenie
              </span>
            </div>
            <p className="text-gray-600">Your AI Newsletter Genie</p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display font-bold">
                {showTwoFactor ? 'Enter Magic Code' : 'Welcome Back'} 🧞‍♂️
              </CardTitle>
              <CardDescription>
                {showTwoFactor 
                  ? 'Enter the 6-digit code from your authenticator app'
                  : 'Sign in to access your magical newsletter dashboard'
                }
              </CardDescription>
              {!showTwoFactor && (
                <Badge className="bg-magic-100 text-magic-700 mx-auto mt-2">
                  <Star className="w-3 h-3 mr-1" />
                  Free Forever
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {!showTwoFactor ? (
                <>
                  {/* Google Sign In */}
                  <Button
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full h-12 text-base border-2 hover:bg-gray-50"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email/Password Form */}
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-10"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-genie-500 to-magic-500 hover:from-genie-600 hover:to-magic-600 text-base font-medium"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Summoning Genie...
                        </div>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Rub the Lamp
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                /* 2FA Form */
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-genie-500 to-magic-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="twoFactorCode" className="text-sm font-medium">
                      Authentication Code
                    </label>
                    <Input
                      id="twoFactorCode"
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="text-center text-lg tracking-widest"
                      maxLength={8}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-genie-500 to-magic-500 hover:from-genie-600 hover:to-magic-600"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify & Enter'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowTwoFactor(false)
                      setTwoFactorCode('')
                      setError('')
                    }}
                  >
                    Back to Sign In
                  </Button>
                </form>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!showTwoFactor && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have a genie yet?{' '}
                    <Link href="/auth/signup" className="font-medium text-genie-600 hover:text-genie-700">
                      Create your magical account
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Preview */}
          {!showTwoFactor && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">Trusted by newsletter enthusiasts</p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Free forever
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  No credit card
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  2-min setup
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}