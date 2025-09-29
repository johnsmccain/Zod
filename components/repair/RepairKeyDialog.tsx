'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@/hooks/useWallet'
import toast from 'react-hot-toast'

interface RepairKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRepaired: () => void
}

export function RepairKeyDialog({ open, onOpenChange, onRepaired }: RepairKeyDialogProps) {
  const { importFromMnemonic, importFromPrivateKey, isLoading } = useWallet()
  const [password, setPassword] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [activeTab, setActiveTab] = useState<'mnemonic' | 'privateKey'>('mnemonic')

  const resetForm = () => {
    setPassword('')
    setMnemonic('')
    setPrivateKey('')
    setActiveTab('mnemonic')
  }

  const close = (open: boolean) => {
    onOpenChange(open)
    if (!open) resetForm()
  }

  const handleRepairWithMnemonic = async () => {
    if (!mnemonic.trim()) {
      toast.error('Please enter your recovery phrase')
      return
    }
    if (!password) {
      toast.error('Please enter a password to secure the repaired wallet')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      await importFromMnemonic(mnemonic.trim(), password)
      toast.success('Wallet repaired from recovery phrase')
      onRepaired()
      close(false)
    } catch (e) {
      // errors surfaced by hook via toast
    }
  }

  const handleRepairWithPrivateKey = async () => {
    if (!privateKey.trim()) {
      toast.error('Please enter your private key')
      return
    }
    if (!password) {
      toast.error('Please enter a password to secure the repaired wallet')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      await importFromPrivateKey(privateKey.trim(), password)
      toast.success('Wallet repaired from private key')
      onRepaired()
      close(false)
    } catch (e) {
      // errors surfaced by hook via toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Repair Wallet</DialogTitle>
          <DialogDescription>
            We couldn't access your encrypted key. Restore your wallet using your
            recovery phrase or private key, then try your transaction again.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
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
                placeholder="Enter your 12-word recovery phrase"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your recovery phrase separated by spaces
              </p>
            </div>
            <div>
              <Label htmlFor="password-mnemonic">New Password</Label>
              <Input
                id="password-mnemonic"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a new password to re-encrypt your wallet"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleRepairWithMnemonic}
              disabled={isLoading || !mnemonic.trim() || !password}
              className="w-full"
            >
              {isLoading ? 'Repairing...' : 'Repair from Recovery Phrase'}
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
              <Label htmlFor="password-private">New Password</Label>
              <Input
                id="password-private"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Set a new password to re-encrypt your wallet"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleRepairWithPrivateKey}
              disabled={isLoading || !privateKey.trim() || !password}
              className="w-full"
            >
              {isLoading ? 'Repairing...' : 'Repair from Private Key'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
