'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWallet } from '@/hooks/useWallet'
import { useWalletStore } from '@/stores/walletStore'
import { decryptWallet } from '@/lib/crypto'
import { useNetwork } from '@/hooks/useNetwork'
import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts'
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
  const encryptedWallets = useWalletStore(s => s.encryptedWallets)
  const { networks, switchNetwork, getCurrentNetwork } = useNetwork()
  const [showPkDialog, setShowPkDialog] = useState(false)
  const [showSeedDialog, setShowSeedDialog] = useState(false)
  const [revealPassword, setRevealPassword] = useState('')
  const [revealedPk, setRevealedPk] = useState<string>('')
  const [revealedSeed, setRevealedSeed] = useState<string>('')
  const [revealLoading, setRevealLoading] = useState(false)
  const [revealError, setRevealError] = useState<string>('')
  const [pkVerified, setPkVerified] = useState<null | boolean>(null)
  const [seedVerified, setSeedVerified] = useState<null | boolean>(null)

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
    try {
      if (!revealedPk) throw new Error('Reveal private key first')
      await copyToClipboard(revealedPk)
      toast.success('Private key copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy private key')
    }
  }

  const handleCopySeed = async () => {
    try {
      if (!revealedSeed) throw new Error('Reveal recovery phrase first')
      await copyToClipboard(revealedSeed)
      toast.success('Recovery phrase copied')
    } catch (error) {
      toast.error('Failed to copy recovery phrase')
    }
  }

  const getEncryptedForCurrent = () => {
    if (!currentAccount) return null
    return (encryptedWallets && encryptedWallets[currentAccount.address]) || encryptedWallet
  }

  const doRevealPk = async () => {
    setRevealLoading(true)
    setRevealError('')
    try {
      const enc = getEncryptedForCurrent()
      if (!enc) throw new Error('No encrypted data for current account')
      const { wallet, mnemonic } = await decryptWallet(enc, revealPassword)
      // Normalize and validate
      const norm = (s:string) => {
        let v = (s || '').toString().replace(/\s+/g, '').toLowerCase()
        if (!v.startsWith('0x')) v = '0x' + v
        return v
      }
      let pk = norm(wallet.privateKey || '')
      if (!/^0x[0-9a-f]{64}$/.test(pk)) {
        // If we have a mnemonic, derive the private key from it
        if (mnemonic) {
          try {
            const accFromSeed = mnemonicToAccount(mnemonic)
            const priv = accFromSeed.getHdKey().privateKey
            if (priv && priv.length === 32) {
              const hex = '0x' + Array.from(priv).map(b => b.toString(16).padStart(2,'0')).join('')
              pk = hex
            }
          } catch {}
        }
      }
      if (!/^0x[0-9a-f]{64}$/.test(pk)) {
        throw new Error('Decrypted private key is not a valid 32-byte hex')
      }
      // Verify derived address matches current account
      let matches = false
      try {
        const acc = privateKeyToAccount(pk as `0x${string}`)
        matches = acc.address.toLowerCase() === currentAccount!.address.toLowerCase()
      } catch { matches = false }
      setRevealedPk(pk)
      setPkVerified(matches)
      toast.success('Private key revealed')
      setShowPkDialog(false)
      setRevealPassword('')
    } catch (e:any) {
      setRevealError(e?.message || 'Failed to reveal private key')
    } finally {
      setRevealLoading(false)
    }
  }

  const doRevealSeed = async () => {
    setRevealLoading(true)
    setRevealError('')
    try {
      const enc = getEncryptedForCurrent()
      if (!enc) throw new Error('No encrypted data for current account')
      const { mnemonic } = await decryptWallet(enc, revealPassword)
      if (!mnemonic) throw new Error('No recovery phrase for this account')
      setRevealedSeed(mnemonic)
      // Attempt verification by deriving an address (first account) and comparing
      try {
        const acc = mnemonicToAccount(mnemonic)
        setSeedVerified(acc.address.toLowerCase() === currentAccount!.address.toLowerCase())
      } catch { setSeedVerified(null) }
      toast.success('Recovery phrase revealed')
      setShowSeedDialog(false)
      setRevealPassword('')
    } catch (e:any) {
      setRevealError(e?.message || 'Failed to reveal recovery phrase')
    } finally {
      setRevealLoading(false)
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
    <div className="min-h-screen bg-[#0D1117] text-white relative">
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)] pointer-events-none"
        style={{ filter: 'blur(20px)' }}
      ></div>

      {/* Header */}
      <header className="">
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
          <Tabs defaultValue="wallet" className="w-full bg-[#0D1117] text-white">
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
                        {revealedPk ? formatAddress(revealedPk, 8) : '••••••••••••••••••••••••••••••••'}
                      </code>
                      {!revealedPk ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowPkDialog(true)}>
                          Reveal
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={handleCopyPrivateKey}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {pkVerified !== null && (
                      <div className={`text-xs mt-1 ${pkVerified ? 'text-green-500' : 'text-red-500'}`}>
                        {pkVerified ? 'Verified: matches current address' : 'Warning: private key does not match current address'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Secret Recovery Phrase</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                        {revealedSeed ? revealedSeed.replace(/\s+/g,' ').trim() : '•••• •••• •••• •••• •••• ••••'}
                      </code>
                      {!revealedSeed ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setShowSeedDialog(true)}>
                          Reveal
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={handleCopySeed}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {revealedSeed && seedVerified !== null && (
                      <div className={`text-xs mt-1 ${seedVerified ? 'text-green-500' : 'text-yellow-500'}`}>
                        {seedVerified ? 'Verified: derives current address' : 'Note: recovery phrase did not derive the current address (different derivation/account?)'}
                      </div>
                    )}
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
      {/* Reveal Private Key Dialog */}
      <Dialog open={showPkDialog} onOpenChange={(o)=>{ setShowPkDialog(o); setRevealError(''); setRevealPassword('') }}>
        <DialogContent className="max-w-md bg-[#0D1117]">
          <DialogHeader>
            <DialogTitle>Reveal private key</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Enter your wallet password to decrypt and reveal your private key.</p>
            <Input type="password" value={revealPassword} onChange={(e)=>setRevealPassword(e.target.value)} placeholder="Wallet password" />
            {revealError && <div className="text-red-500 text-sm">{revealError}</div>}
            <Button className="w-full" disabled={revealLoading || !revealPassword} onClick={doRevealPk}>
              {revealLoading ? 'Decrypting...' : 'Reveal'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reveal Seed Phrase Dialog */}
      <Dialog open={showSeedDialog} onOpenChange={(o)=>{ setShowSeedDialog(o); setRevealError(''); setRevealPassword('') }}>
        <DialogContent className="max-w-md bg-[#0D1117]">
          <DialogHeader>
            <DialogTitle>Reveal recovery phrase</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Enter your wallet password to decrypt and reveal your recovery phrase.</p>
            <Input type="password" value={revealPassword} onChange={(e)=>setRevealPassword(e.target.value)} placeholder="Wallet password" />
            {revealError && <div className="text-red-500 text-sm">{revealError}</div>}
            <Button className="w-full" disabled={revealLoading || !revealPassword} onClick={doRevealSeed}>
              {revealLoading ? 'Decrypting...' : 'Reveal'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
