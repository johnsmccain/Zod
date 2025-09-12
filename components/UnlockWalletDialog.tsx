'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWallet } from '@/hooks/useWallet'
import toast from 'react-hot-toast'

interface UnlockWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnlockWalletDialog({ open, onOpenChange }: UnlockWalletDialogProps) {
  const { unlock, isLoading } = useWallet()
  const [password, setPassword] = useState('')

  const handleUnlock = async () => {
    if (!password) {
      toast.error('Please enter your password')
      return
    }

    try {
      const success = await unlock(password)
      if (success) {
        onOpenChange(false)
        setPassword('')
      }
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) setPassword('')
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unlock Wallet</DialogTitle>
          <DialogDescription>
            Enter your password to unlock your wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your wallet password"
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleUnlock}
            disabled={isLoading || !password}
            className="w-full"
          >
            {isLoading ? 'Unlocking...' : 'Unlock Wallet'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
