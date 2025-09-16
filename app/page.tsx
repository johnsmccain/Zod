'use client'

import { useState, useEffect } from 'react'
import { CreateWalletDialog, ImportWalletDialog, UnlockWalletDialog } from '@/components'
import { useWallet } from '@/hooks/useWallet'
import WelcomeSection from '../components/WelcomeSection'

export default function HomePage() {
  const { isConnected, isUnlocked } = useWallet()
  const [showCreateFlow, setShowCreateFlow] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCreateFlow(false) // Reset to show WelcomeSection after timer
    }, 20000)
    return () => clearTimeout(timer)
  }, [])

  // If wallet is connected but locked, show unlock dialog
  if (isConnected && !isUnlocked) {
    return <UnlockWalletDialog open={true} onOpenChange={() => {}} />
  }

  // If wallet is connected and unlocked, redirect to dashboard
  if (isConnected && isUnlocked) {
    window.location.href = '/dashboard'
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      {!showCreateFlow ? (
        <WelcomeSection
          setShowCreateDialog={setShowCreateFlow}
          setShowImportDialog={setShowImportDialog}
        />
      ) : (
        <CreateWalletDialog onComplete={() => setShowCreateFlow(false)} />
      )}

      <ImportWalletDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  )
}