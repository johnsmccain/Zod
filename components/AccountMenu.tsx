'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { 
  ArrowLeft, 
  Edit, 
  ChevronRight, 
  Copy,
  Eye,
  EyeOff,
  Home,
  Activity,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AccountMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountMenu({ isOpen, onClose }: AccountMenuProps) {
  const router = useRouter()
  const { currentAccount } = useWallet()
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [networks, setNetworks] = useState({
    ethereum: true,
    megaTestnet: false,
    baseMainnet: false
  })

  if (!isOpen) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const toggleNetwork = (network: string) => {
    setNetworks(prev => ({
      ...prev,
      [network]: !prev[network as keyof typeof prev]
    }))
  }

  return (
    <div className="fixed inset-0 bg-[#0D1117] text-white z-50 overflow-y-auto">
      {/* Background gradient */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)]"
        style={{ filter: 'blur(20px)' }}
      ></div>

      {/* Header */}
      <header className="flex items-center justify-center p-4 border-b border-gray-800 relative z-10">
        <button 
          onClick={onClose}
          className="absolute left-4 p-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Account 1</h1>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4 relative z-10 pb-24">
        {/* Account Details */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-medium">Account Details</h2>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Account 1</span>
              <Edit className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white">Address</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">
                {currentAccount ? 
                  `0x${currentAccount.address.slice(2, 8)}...${currentAccount.address.slice(-6)}` 
                  : '0x1c5...i5fnx'
                }
              </span>
              <button 
                onClick={() => currentAccount && copyToClipboard(currentAccount.address, 'Address')}
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white">Wallet</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Wallet 1</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-4">
          {/* Secret Recovery Phrase */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <button 
              onClick={() => setShowMnemonic(!showMnemonic)}
              className="flex items-center justify-between w-full"
            >
              <span className="text-white font-medium">Secret Recovery Phrase</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            
            {showMnemonic && (
              <div className="mt-4 p-3 bg-gray-900 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Recovery Phrase</span>
                  <button onClick={() => setShowMnemonic(false)}>
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="text-sm text-white font-mono break-all">
                  abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
                </div>
                <button 
                  onClick={() => copyToClipboard('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about', 'Recovery phrase')}
                  className="mt-2 text-cyan-400 text-sm flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
            )}
          </div>

          {/* Private Key */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <button 
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="flex items-center justify-between w-full"
            >
              <span className="text-white font-medium">Private Key</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
            
            {showPrivateKey && (
              <div className="mt-4 p-3 bg-gray-900 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Private Key</span>
                  <button onClick={() => setShowPrivateKey(false)}>
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <div className="text-sm text-white font-mono break-all">
                  {currentAccount?.privateKey || '0x1234567890abcdef...'}
                </div>
                <button 
                  onClick={() => currentAccount && copyToClipboard(currentAccount.privateKey, 'Private key')}
                  className="mt-2 text-cyan-400 text-sm flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Smart Contract Account */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Enable smart contract account</h3>
          <p className="text-gray-400 text-sm mb-4">
            You can enable smart account features on supported networks.{' '}
            <span className="text-cyan-400">Learn more</span>
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">Ethereum Mainnet</span>
              <button 
                onClick={() => toggleNetwork('ethereum')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  networks.ethereum ? 'bg-cyan-400' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  networks.ethereum ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white">Mega Testnet</span>
              <button 
                onClick={() => toggleNetwork('megaTestnet')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  networks.megaTestnet ? 'bg-cyan-400' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  networks.megaTestnet ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white">Base Mainnet</span>
              <button 
                onClick={() => toggleNetwork('baseMainnet')}
                className={`w-12 h-6 rounded-full transition-colors ${
                  networks.baseMainnet ? 'bg-cyan-400' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  networks.baseMainnet ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
        <div className="flex justify-around">
          <button 
            onClick={() => {
              onClose()
              router.push('/dashboard')
            }}
            className="flex flex-col items-center gap-1 text-cyan-400"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>
          <button 
            onClick={() => {
              onClose()
              // Handle activity navigation
            }}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <Activity className="w-5 h-5" />
            <span className="text-xs">Activity</span>
          </button>
          <button 
            onClick={() => {
              onClose()
              router.push('/settings')
            }}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}