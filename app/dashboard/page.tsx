'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  WalletCard, 
  SendTransactionDialog, 
  TransactionHistory 
} from '@/components'
import { useWallet, useProvider } from '@/hooks'
import { useTransactions } from '@/hooks/useTransactions'
import { useNetwork } from '@/hooks/useNetwork'
import { formatCurrency } from '@/lib/utils'
import { 
  Send, 
  Download, 
  Settings, 
  LogOut, 
  RefreshCw,
  Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { isConnected, isUnlocked, currentAccount, disconnect } = useWallet()
  const { getAccountBalance } = useTransactions()
  const { getCurrentNetwork } = useNetwork()
  const { isProviderInjected } = useProvider()
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [balance, setBalance] = useState('0')
  const [loadingBalance, setLoadingBalance] = useState(false)

  const network = getCurrentNetwork()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isConnected || !isUnlocked) {
      router.push('/')
    }
  }, [isConnected, isUnlocked, router])

  // Load balance
  useEffect(() => {
    if (currentAccount) {
      loadBalance()
    }
  }, [currentAccount])

  const loadBalance = async () => {
    if (!currentAccount) return
    
    setLoadingBalance(true)
    try {
      const bal = await getAccountBalance()
      setBalance(bal)
    } catch (error) {
      console.error('Failed to load balance:', error)
      toast.error('Failed to load balance')
    } finally {
      setLoadingBalance(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }

  if (!isConnected || !isUnlocked || !currentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Wallet className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">GuildWallet</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadBalance}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisconnect}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Info */}
          <div className="lg:col-span-1">
            <WalletCard />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    {loadingBalance ? (
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                    ) : (
                      formatCurrency(balance, network?.currency.symbol || 'ETH')
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {network?.name || 'Unknown Network'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setShowSendDialog(true)}
                    className="h-20 flex flex-col gap-2"
                  >
                    <Send className="w-6 h-6" />
                    Send
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => router.push('/receive')}
                  >
                    <Download className="w-6 h-6" />
                    Receive
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <TransactionHistory />
          </div>
        </div>
      </main>

      <SendTransactionDialog 
        open={showSendDialog} 
        onOpenChange={setShowSendDialog} 
      />
    </div>
  )
}
