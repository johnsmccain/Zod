'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateWalletDialog, ImportWalletDialog, UnlockWalletDialog } from '@/components'
import { useWallet } from '@/hooks/useWallet'
import { Wallet, Download, Lock } from 'lucide-react'

export default function HomePage() {
  const { isConnected, isUnlocked } = useWallet()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            GuildWallet
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your secure gateway to the decentralized web
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome to GuildWallet</CardTitle>
            <CardDescription>
              Create a new wallet or import an existing one to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="w-full"
              size="lg"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Create New Wallet
            </Button>
            
            <Button 
              onClick={() => setShowImportDialog(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Import Existing Wallet
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By using GuildWallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      <CreateWalletDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
      
      <ImportWalletDialog 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog} 
      />
    </div>
  )
}
