// /components/usage-guard.tsx - Hidden usage protection component
'use client'

import { useState, useEffect } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface UsageGuardProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function UsageGuard({ feature, children, fallback }: UsageGuardProps) {
  const [hasAccess, setHasAccess] = useState(true)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAccess()
  }, [feature])

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/usage/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitType: feature }),
      })

      const data = await response.json()
      setHasAccess(data.hasFeatureAccess && data.canProceed)
      
      if (!data.canProceed && data.requiresUpgrade) {
        setShowUpgradeDialog(true)
      }
    } catch (error) {
      console.error('Error checking access:', error)
      // Default to allowing access if check fails
      setHasAccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!hasAccess) {
    return fallback || <div>Feature not available</div>
  }

  return (
    <>
      {children}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade Required</AlertDialogTitle>
            <AlertDialogDescription>
              You've reached the limit for this feature on your current plan. 
              Upgrade to continue using advanced features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowUpgradeDialog(false)}>
              Maybe Later
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => {
                // Future: Redirect to pricing page
                console.log('Redirect to upgrade')
                setShowUpgradeDialog(false)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Upgrade Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}