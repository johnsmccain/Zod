'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, X } from 'lucide-react'
import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { useWalletStore } from '@/stores/walletStore'

interface CreateEthAccountModalProps {
  open: boolean
  onBack: () => void
  onDone: () => void
}

export function CreateEthAccountModal({ open, onBack, onDone }: CreateEthAccountModalProps) {
  const [name, setName] = useState('')
  const { createAdditionalAccount, isLoading } = useWallet()
  const setAccountName = useWalletStore(s => s.setAccountName)

  const handleCreate = async () => {
    const pwd = 'temp' // placeholder: creation uses secure flow elsewhere if needed
    const res = await createAdditionalAccount(pwd)
    if (res?.account?.address && name.trim()) {
      setAccountName(res.account.address, name.trim())
    }
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onBack() }}>
      <DialogContent className="max-w-md bg-[#0D1117]">
        <DialogHeader className="relative">
          <button onClick={onBack} className="absolute left-0 top-0 p-2" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <DialogTitle className="text-center">Add account</DialogTitle>
          <button onClick={onBack} className="absolute right-0 top-0 p-2" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <label className="text-sm text-gray-400">Account name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Trading account" />
          <Button className="w-full" disabled={!name.trim() || isLoading} onClick={handleCreate}>
            {isLoading ? 'Adding...' : 'Add account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
