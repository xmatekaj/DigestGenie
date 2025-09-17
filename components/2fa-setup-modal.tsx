// /components/2fa-setup-modal.tsx - Frontend 2FA setup component
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface TwoFactorSetupModalProps {
  open: boolean
  onClose: () => void
}

export function TwoFactorSetupModal({ open, onClose }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [qrCode, setQrCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSetup = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Setup failed')
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setBackupCodes(data.backupCodes)
      setStep('verify')
    } catch (error) {
      setError('Failed to set up 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      })

      if (!response.ok) {
        throw new Error('Verification failed')
      }

      // Success - 2FA is now enabled
      onClose()
      window.location.reload()
    } catch (error) {
      setError('Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
        </DialogHeader>

        {step === 'setup' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Two-factor authentication adds an extra layer of security to your account.
            </p>
            <Button onClick={handleSetup} disabled={loading} className="w-full">
              {loading ? 'Setting up...' : 'Set up 2FA'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app:
              </p>
              <img src={qrCode} alt="2FA QR Code" className="mx-auto mb-4" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Code</label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <Button onClick={handleVerify} disabled={loading || verificationCode.length !== 6} className="w-full">
              {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
            </Button>

            <Alert>
              <AlertDescription>
                <strong>Backup Codes:</strong> Save these codes in a safe place. You can use them to access your account if you lose your authenticator device.
                <div className="grid grid-cols-2 gap-1 mt-2 font-mono text-xs">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-gray-100 p-1 rounded">
                      {code}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}