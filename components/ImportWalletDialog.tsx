'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@/hooks/useWallet'
import toast from 'react-hot-toast'

interface ImportWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportWalletDialog({ open, onOpenChange }: ImportWalletDialogProps) {
  const { importFromMnemonic, importFromPrivateKey, isLoading } = useWallet()
  const [password, setPassword] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [activeTab, setActiveTab] = useState('mnemonic')

  const handleImportMnemonic = async () => {
    if (!mnemonic.trim()) {
      toast.error('Please enter your recovery phrase')
      return
    }

    if (!password) {
      toast.error('Please enter a password')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      await importFromMnemonic(mnemonic.trim(), password)
      onOpenChange(false)
      resetForm()
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleImportPrivateKey = async () => {
    if (!privateKey.trim()) {
      toast.error('Please enter your private key')
      return
    }

    if (!password) {
      toast.error('Please enter a password')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      await importFromPrivateKey(privateKey.trim(), password)
      onOpenChange(false)
      resetForm()
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const resetForm = () => {
    setPassword('')
    setMnemonic('')
    setPrivateKey('')
    setActiveTab('mnemonic')
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Wallet</DialogTitle>
          <DialogDescription>
            Import an existing wallet using your recovery phrase or private key
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mnemonic">Recovery Phrase</TabsTrigger>
            <TabsTrigger value="privateKey">Private Key</TabsTrigger>
          </TabsList>

          <TabsContent value="mnemonic" className="space-y-4">
            <div>
              <Label htmlFor="mnemonic">Recovery Phrase</Label>
              <Input
                id="mnemonic"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                placeholder="Enter your 12 or 24 word recovery phrase"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your recovery phrase separated by spaces
              </p>
            </div>
            <div>
              <Label htmlFor="password-mnemonic">Password</Label>
              <Input
                id="password-mnemonic"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password to secure your wallet"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleImportMnemonic}
              disabled={isLoading || !mnemonic.trim() || !password}
              className="w-full"
            >
              {isLoading ? 'Importing...' : 'Import Wallet'}
            </Button>
          </TabsContent>

          <TabsContent value="privateKey" className="space-y-4">
            <div>
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key (0x...)"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your private key should start with 0x and be 64 characters long
              </p>
            </div>
            <div>
              <Label htmlFor="password-private">Password</Label>
              <Input
                id="password-private"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password to secure your wallet"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleImportPrivateKey}
              disabled={isLoading || !privateKey.trim() || !password}
              className="w-full"
            >
              {isLoading ? 'Importing...' : 'Import Wallet'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
