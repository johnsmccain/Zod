'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTransactions } from '@/hooks/useTransactions'
import { useNetwork } from '@/hooks/useNetwork'
import { isValidAddress } from '@/lib/crypto'
import toast from 'react-hot-toast'

interface SendTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendTransactionDialog({ open, onOpenChange }: SendTransactionDialogProps) {
  const { sendTransaction, isLoading } = useTransactions()
  const { getCurrentNetwork } = useNetwork()
  const [to, setTo] = useState('')
  const [value, setValue] = useState('')
  const [password, setPassword] = useState('')

  const network = getCurrentNetwork()

  const handleSend = async () => {
    if (!to || !value || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (!isValidAddress(to)) {
      toast.error('Invalid recipient address')
      return
    }

    if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      toast.error('Invalid amount')
      return
    }

    try {
      await sendTransaction({
        to: to as `0x${string}`,
        value,
      }, password)
      
      onOpenChange(false)
      resetForm()
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const resetForm = () => {
    setTo('')
    setValue('')
    setPassword('')
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetForm()
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Transaction</DialogTitle>
          <DialogDescription>
            Send {network?.currency.symbol || 'ETH'} to another address
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="to">Recipient Address</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="value">Amount ({network?.currency.symbol || 'ETH'})</Label>
            <Input
              id="value"
              type="number"
              step="0.000001"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.0"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your wallet password"
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleSend}
            disabled={isLoading || !to || !value || !password}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Transaction'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
