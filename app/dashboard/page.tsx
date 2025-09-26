'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SendTransactionDialog } from '@/components'
import { AccountMenu } from '@/components/AccountMenu'
import { AccountsModal } from '@/components/AccountsModal'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { NetworkManager } from '@/components/NetworkManager'
import { useWallet } from '@/hooks/useWallet'
import { useNetworkStore } from '@/stores/networkStore'
import { useWalletStore } from '@/stores/walletStore'
import {
  Send,
  Download,
  Settings,
  Home,
  Activity,
  Menu,
  Eye,
  Copy,
  ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { isConnected, isUnlocked, currentAccount, disconnect } = useWallet()
  const { currentChainId, networks } = useNetworkStore((s) => ({ currentChainId: s.currentChainId, networks: s.networks }))
  const accounts = useWalletStore((s) => s.accounts)
  const accountNames = useWalletStore((s) => s.accountNames)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [showNetworkManager, setShowNetworkManager] = useState(false)
  const [balance] = useState('12,847.32')
  const [activeTab, setActiveTab] = useState('Tokens')
  const [showBalance, setShowBalance] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isConnected || !isUnlocked) {
      router.push('/')
    }
  }, [isConnected, isUnlocked, router])

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }
  // console.log(isConnected, isUnlocked, currentAccount)

  const copyAddress = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address)
      toast.success('Address copied to clipboard')
    }
  }

  if (!isConnected || !isUnlocked || !currentAccount) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    )
  }

  const [ethBalance, setEthBalance] = useState<string>('0')

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (!currentAccount?.address || !(window as any)?.ethereum) return
        const hex = await (window as any).ethereum.request({ method: 'eth_getBalance', params: [currentAccount.address, 'latest'] })
        // hex string like 0x...
        const wei = BigInt(hex)
        const eth = Number(wei) / 1e18
        setEthBalance(eth.toLocaleString(undefined, { maximumFractionDigits: 6 }))
      } catch (e) {
        console.error('balance error', e)
      }
    }
    fetchBalance()
  }, [currentAccount?.address, currentChainId])

  return (
    <div className="min-h-screen bg-[#0D1117] text-white relative">
      {/* Background gradient */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)]"
        style={{ filter: 'blur(20px)' }}
      ></div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-400 to-red-500" />
          <button onClick={() => setShowAccountsModal(true)} className="text-left">
            <div className="flex items-center gap-1">
              <span className="font-medium">{
                (() => {
                  if (!currentAccount) return 'No account'
                  const idx = accounts.findIndex(a => a.address === currentAccount.address)
                  const fallback = idx >= 0 ? `Account ${idx + 1}` : 'Account 1'
                  return accountNames[currentAccount.address] || fallback
                })()
              }</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              {currentAccount ? `0x${currentAccount.address.slice(2,8)}...${currentAccount.address.slice(-6)}` : 'No account'}
              {currentAccount && (
                <button onClick={() => navigator.clipboard.writeText(currentAccount.address)} title="Copy address">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </button>
        </div>

        <button 
          onClick={() => setShowNetworkManager(true)}
          className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors"
        >
          {(() => {
            const net = networks.find(n => n.id === currentChainId)
            return (
              <>
                {net?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={net.logoUrl} alt={net.name} className="w-4 h-4 rounded-full bg-white" />
                ) : (
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                )}
                <span className="text-sm">{net?.name ?? 'Select network'}</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )
          })()}
        </button>

        <button
          onClick={() => setShowHamburgerMenu(true)}
          className="p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 relative z-10">
        {/* Account Info */}
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">My Account 1</h1>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <span>0x{currentAccount.address.slice(2, 8)}...{currentAccount.address.slice(-6)}</span>
            <button onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Balance</span>
            <button onClick={() => setShowBalance(!showBalance)}>
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="text-3xl font-bold text-cyan-400 mb-2">
            {showBalance ? `${ethBalance} ETH` : '••••••'}
          </div>
          <div className="text-gray-400 text-sm">Network: {networks.find(n=>n.id===currentChainId)?.name}</div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowSendDialog(true)}
            className="bg-cyan-400 text-gray-900 rounded-lg p-4 flex flex-col items-center gap-2 font-semibold"
          >
            <Send className="w-6 h-6" />
            Send
          </button>
          <button
            onClick={() => router.push('/receive')}
            className="bg-cyan-400 text-gray-900 rounded-lg p-4 flex flex-col items-center gap-2 font-semibold"
          >
            <Download className="w-6 h-6" />
            Receive
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-700">
          {['Tokens', 'Assets', 'Activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium ${activeTab === tab
                ? 'text-white border-b-2 border-cyan-400'
                : 'text-gray-400'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Token List (Tab: Tokens) */}
        {activeTab === 'Tokens' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
                  ⟠
                </div>
                <div>
                  <div className="font-semibold">ETH</div>
                  <div className="text-gray-400 text-sm">Ethereum</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{ethBalance}</div>
                <div className="text-gray-400 text-sm">on {networks.find(n=>n.id===currentChainId)?.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Assets (Tab: Assets) */}
        {activeTab === 'Assets' && (
          <div className="space-y-3">
            <div className="p-4 bg-gray-800/30 rounded-lg text-gray-400 text-sm">
              No assets to display yet.
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
          <div className="flex justify-around">
            <button className="flex flex-col items-center gap-1 text-cyan-400">
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('Activity')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'Activity' ? 'text-cyan-400' : 'text-gray-400'}`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-xs">Activity</span>
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="flex flex-col items-center gap-1 text-gray-400"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>

        {/* Activity Section (when tab is active) */}
        {activeTab === 'Activity' && (
          <div className="space-y-4 pb-20">
            <h2 className="text-lg font-semibold">Activity</h2>
            <div className="p-4 bg-gray-800/30 rounded-lg text-gray-400 text-sm">No activity yet.</div>
          </div>
        )}
      </main>

      <SendTransactionDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
      />


      <AccountMenu
        isOpen={showAccountMenu}
        onClose={() => setShowAccountMenu(false)}
      />

      <AccountsModal open={showAccountsModal} onOpenChange={setShowAccountsModal} />

      <HamburgerMenu
        isOpen={showHamburgerMenu}
        onClose={() => setShowHamburgerMenu(false)}
      />

      <NetworkManager
        isOpen={showNetworkManager}
        onClose={() => setShowNetworkManager(false)}
      />
    </div>
  )
}
