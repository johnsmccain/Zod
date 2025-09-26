'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { useNetworkStore } from '@/stores/networkStore'
import { Copy } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReceiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiveDialog({ open, onOpenChange }: ReceiveDialogProps) {
  const { currentAccount } = useWallet()
  const { currentChainId, networks } = useNetworkStore()
  const net = networks.find(n => n.id === currentChainId)

  const copy = () => {
    if (!currentAccount) return
    navigator.clipboard.writeText(currentAccount.address)
    toast.success('Address copied')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0D1117]">
        <DialogHeader>
          <DialogTitle>Receive</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-400">Network</div>
          <div className="p-3 bg-gray-800/40 rounded-md flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-md" />
            <div className="text-white text-sm">{net?.name ?? 'Unknown'}</div>
          </div>

          <div className="text-sm text-gray-400">Your address</div>
          <div className="p-3 bg-gray-800/40 rounded-md flex items-center justify-between">
            <div className="font-mono text-sm break-all text-white">{currentAccount?.address}</div>
            <button onClick={copy} className="p-2 hover:bg-gray-800 rounded" title="Copy">
              <Copy className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          <div className="text-xs text-gray-500">Only send {net?.currency.symbol || 'ETH'} on {net?.name}. Sending other assets may result in permanent loss.</div>

          <Button className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
