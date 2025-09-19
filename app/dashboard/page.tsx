'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SendTransactionDialog } from '@/components'
import { AccountMenu } from '@/components/AccountMenu'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { NetworkManager } from '@/components/NetworkManager'
import { useWallet } from '@/hooks/useWallet'
import {
  Send,
  Download,
  Settings,
  Home,
  Activity,
  User,
  Menu,
  Eye,
  Copy,
  ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { isConnected, isUnlocked, currentAccount, disconnect } = useWallet()
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
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

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', amount: '5.2847', value: '$8,432.12', icon: '⟠' },
    { symbol: 'SOL', name: 'Solana', amount: '2.4403', value: '$4,432.12', icon: '◎' }
  ]

  const activities = [
    { type: 'Sent', token: 'ETH', amount: '5.2847', value: '$8,432.12' },
    { type: 'Sent', token: 'ETH', amount: '5.2847', value: '$8,432.12' },
    { type: 'Sent', token: 'ETH', amount: '5.2847', value: '$8,432.12' }
  ]

  return (
    <div className="min-h-screen bg-[#0D1117] text-white relative">
      {/* Background gradient */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)]"
        style={{ filter: 'blur(20px)' }}
      ></div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAccountMenu(true)}
            className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center"
          >
            <User className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        <button 
          onClick={() => setShowNetworkManager(true)}
          className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors"
        >
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-sm">Ethereum Mainnet</span>
          <ChevronDown className="w-4 h-4" />
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
            {showBalance ? `$${balance}` : '••••••'}
          </div>
          <div className="text-green-400 text-sm">
            +5.67 (+2.34%)
          </div>
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
          {['Tokens', 'Assets'].map((tab) => (
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

        {/* Token List */}
        <div className="space-y-3">
          {tokens.map((token, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {token.icon}
                </div>
                <div>
                  <div className="font-semibold">{token.symbol}</div>
                  <div className="text-gray-400 text-sm">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{token.amount}</div>
                <div className="text-gray-400 text-sm">{token.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
          <div className="flex justify-around">
            <button className="flex flex-col items-center gap-1 text-cyan-400">
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('Activity')}
              className="flex flex-col items-center gap-1 text-gray-400"
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
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">{activity.type}</div>
                    <div className="text-gray-400 text-sm">{activity.token}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{activity.amount}</div>
                  <div className="text-gray-400 text-sm">{activity.value}</div>
                </div>
              </div>
            ))}
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
