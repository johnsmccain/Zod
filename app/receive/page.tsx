'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWallet } from '@/hooks/useWallet'
import { useNetwork } from '@/hooks/useNetwork'
import { formatAddress, copyToClipboard } from '@/lib/utils'
import { 
  ArrowLeft, 
  Copy, 
  Download,
  QrCode
} from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

export default function ReceivePage() {
  const router = useRouter()
  const { isConnected, isUnlocked, currentAccount } = useWallet()
  const { getCurrentNetwork } = useNetwork()
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!isConnected || !isUnlocked) {
      router.push('/')
    }
  }, [isConnected, isUnlocked, router])

  // Generate QR code
  useEffect(() => {
    if (currentAccount) {
      generateQRCode()
    }
  }, [currentAccount])

  const generateQRCode = async () => {
    if (!currentAccount) return

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(currentAccount.address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrCodeDataUrl(qrCodeDataUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const handleCopyAddress = async () => {
    if (currentAccount) {
      try {
        await copyToClipboard(currentAccount.address)
        toast.success('Address copied to clipboard')
      } catch (error) {
        toast.error('Failed to copy address')
      }
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a')
      link.href = qrCodeDataUrl
      link.download = 'wallet-address-qr.png'
      link.click()
      toast.success('QR code downloaded')
    }
  }

  const network = getCurrentNetwork()

  if (!isConnected || !isUnlocked || !currentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">Receive</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receive {network?.currency.symbol || 'ETH'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Wallet Address QR Code"
                      className="w-64 h-64"
                    />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Your Address</label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-sm bg-muted px-3 py-2 rounded flex-1 break-all">
                    {currentAccount.address}
                  </code>
                  <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button onClick={handleCopyAddress} className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Address
                </Button>
                <Button variant="outline" onClick={handleDownloadQR} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> Only send {network?.currency.symbol || 'ETH'} and supported tokens to this address. 
                  Sending other assets may result in permanent loss.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Network Info */}
          <Card>
            <CardHeader>
              <CardTitle>Network Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span>{network?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span>{network?.currency.symbol || 'ETH'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span>{network?.isTestnet ? 'Testnet' : 'Mainnet'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
