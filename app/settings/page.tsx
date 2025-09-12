'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@/hooks/useWallet'
import { useNetwork } from '@/hooks/useNetwork'
import { formatAddress, copyToClipboard } from '@/lib/utils'
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  Trash2, 
  Eye, 
  EyeOff,
  LogOut,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const { 
    isConnected, 
    isUnlocked, 
    currentAccount, 
    disconnect,
    encryptedWallet 
  } = useWallet()
  const { networks, switchNetwork, getCurrentNetwork } = useNetwork()
  const [showPrivateKey, setShowPrivateKey] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isConnected || !isUnlocked) {
      router.push('/')
    }
  }, [isConnected, isUnlocked, router])

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

  const handleCopyPrivateKey = async () => {
    if (currentAccount) {
      try {
        await copyToClipboard(currentAccount.privateKey)
        toast.success('Private key copied to clipboard')
      } catch (error) {
        toast.error('Failed to copy private key')
      }
    }
  }

  const handleExportWallet = () => {
    if (encryptedWallet) {
      const dataStr = JSON.stringify(encryptedWallet, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'guildwallet-backup.json'
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Wallet exported successfully')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }

  const currentNetwork = getCurrentNetwork()

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
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="wallet" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                        {formatAddress(currentAccount.address)}
                      </code>
                      <Button variant="ghost" size="icon" onClick={handleCopyAddress}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Private Key</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                        {showPrivateKey 
                          ? formatAddress(currentAccount.privateKey, 8)
                          : '••••••••••••••••••••••••••••••••'
                        }
                      </code>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      {showPrivateKey && (
                        <Button variant="ghost" size="icon" onClick={handleCopyPrivateKey}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup & Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleExportWallet} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Wallet
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Export your encrypted wallet data for backup purposes. Keep this file secure.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="network" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Network Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Network</label>
                    <p className="text-sm mt-1">{currentNetwork?.name || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Available Networks</label>
                    <div className="space-y-2 mt-2">
                      {networks.map((network) => (
                        <div 
                          key={network.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            network.id === currentNetwork?.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => switchNetwork(network.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{network.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {network.currency.symbol} • {network.isTestnet ? 'Testnet' : 'Mainnet'}
                              </p>
                            </div>
                            {network.id === currentNetwork?.id && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Wallet Encrypted</p>
                      <p className="text-sm text-muted-foreground">
                        Your private keys are encrypted and stored securely
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button 
                      variant="destructive" 
                      onClick={handleDisconnect}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      This will lock your wallet and require your password to unlock again.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
