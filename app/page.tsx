'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreateWalletDialog, ImportWalletDialog, UnlockWalletDialog } from '@/components'
import { useWallet } from '@/hooks/useWallet'
import WelcomeSection from '../components/WelcomeSection'

export default function HomePage() {
  const router = useRouter()
  const { isConnected, isUnlocked } = useWallet()
  const [showCreateFlow, setShowCreateFlow] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check wallet state on mount
  useEffect(() => {
    // Give time for the store to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle navigation based on wallet state
  useEffect(() => {
    if (!isLoading) {
      // If wallet is connected and unlocked, redirect to dashboard
      if (isConnected && isUnlocked) {
        router.push('/dashboard')
      }
    }
  }, [isConnected, isUnlocked, isLoading, router])

  // Show loading while checking wallet state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If wallet exists but is locked, show unlock screen
  if (isConnected && !isUnlocked) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <UnlockWalletDialog 
          open={true} 
          onOpenChange={() => {}} 
        />
      </div>
    )
  }

  // If no wallet exists, show welcome/create flow
  return (
    <div className="min-h-screen">
      {!showCreateFlow ? (
        <WelcomeSection
          setShowCreateDialog={setShowCreateFlow}
          setShowImportDialog={setShowImportDialog}
        />
      ) : (
        <CreateWalletDialog 
          onComplete={() => {
            setShowCreateFlow(false)
            // Navigation to dashboard will be handled by the useEffect above
          }} 
        />
      )}

      <ImportWalletDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  )
}