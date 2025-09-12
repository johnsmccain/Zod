'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWallet } from '@/hooks/useWallet'
import { useNetwork } from '@/hooks/useNetwork'
import { formatAddress, formatCurrency } from '@/lib/utils'
import { Copy, Eye, EyeOff, LogOut } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function WalletCard() {
  const { currentAccount, isUnlocked, lock, disconnect } = useWallet()
  const { getCurrentNetwork } = useNetwork()
  const [showPrivateKey, setShowPrivateKey] = useState(false)

  if (!currentAccount || !isUnlocked) {
    return null
  }

  const network = getCurrentNetwork()

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(currentAccount.address)
      toast.success('Address copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const copyPrivateKey = async () => {
    try {
      await navigator.clipboard.writeText(currentAccount.privateKey)
      toast.success('Private key copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy private key')
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Wallet</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
            >
              {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={lock}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {formatAddress(currentAccount.address)}
            </code>
            <Button variant="ghost" size="icon" onClick={copyAddress}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showPrivateKey && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Private Key</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                {formatAddress(currentAccount.privateKey, 8)}
              </code>
              <Button variant="ghost" size="icon" onClick={copyPrivateKey}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-muted-foreground">Network</label>
          <p className="text-sm mt-1">{network?.name || 'Unknown'}</p>
        </div>

        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={disconnect}
          >
            Disconnect Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
