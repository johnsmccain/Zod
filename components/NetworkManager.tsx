'use client'

import { useState } from 'react'
import { 
  ArrowLeft, 
  Search,
  MoreVertical,
  Plus,
  Info
} from 'lucide-react'

interface NetworkManagerProps {
  isOpen: boolean
  onClose: () => void
}

interface Network {
  id: string
  name: string
  icon: string
  enabled: boolean
  color: string
}

export function NetworkManager({ isOpen, onClose }: NetworkManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCustomNetwork, setShowAddCustomNetwork] = useState(false)
  const [customNetwork, setCustomNetwork] = useState({
    name: '',
    rpcUrl: '',
    chainId: '',
    symbol: '',
    blockExplorer: ''
  })

  const [enabledNetworks, setEnabledNetworks] = useState<Network[]>([
    { id: 'ethereum', name: 'Ethereum', icon: '⟠', enabled: true, color: 'bg-blue-500' },
    { id: 'arbitrum', name: 'Arbitrum One', icon: '🔷', enabled: true, color: 'bg-blue-400' },
    { id: 'base', name: 'Base', icon: '🔵', enabled: true, color: 'bg-blue-600' },
    { id: 'solana', name: 'Solana', icon: '◎', enabled: true, color: 'bg-purple-500' }
  ])

  const [additionalNetworks] = useState<Network[]>([
    { id: 'arbitrum-add', name: 'Arbitrum One', icon: '🔷', enabled: false, color: 'bg-blue-400' },
    { id: 'polygon', name: 'Polygon', icon: '🟣', enabled: false, color: 'bg-purple-600' },
    { id: 'avalanche', name: 'Avalanche Network C-Chain', icon: '🔺', enabled: false, color: 'bg-red-500' }
  ])

  if (!isOpen) return null

  const handleAddNetwork = (network: Network) => {
    setEnabledNetworks(prev => [...prev, { ...network, enabled: true }])
  }

  const handleAddCustomNetwork = () => {
    if (customNetwork.name && customNetwork.rpcUrl && customNetwork.chainId) {
      const newNetwork: Network = {
        id: `custom-${Date.now()}`,
        name: customNetwork.name,
        icon: '🌐',
        enabled: true,
        color: 'bg-gray-500'
      }
      setEnabledNetworks(prev => [...prev, newNetwork])
      setCustomNetwork({ name: '', rpcUrl: '', chainId: '', symbol: '', blockExplorer: '' })
      setShowAddCustomNetwork(false)
    }
  }

  const filteredEnabledNetworks = enabledNetworks.filter(network =>
    network.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAdditionalNetworks = additionalNetworks.filter(network =>
    network.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (showAddCustomNetwork) {
    return (
      <div className="fixed inset-0 bg-[#0D1117] text-white z-50 overflow-y-auto">
        {/* Background gradient */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)]"
          style={{ filter: 'blur(20px)' }}
        ></div>

        {/* Header */}
        <header className="flex items-center p-4 border-b border-gray-800 relative z-10">
          <button 
            onClick={() => setShowAddCustomNetwork(false)}
            className="p-2 mr-4"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Add Custom Network</h1>
        </header>

        {/* Form */}
        <main className="p-4 space-y-4 relative z-10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Network Name</label>
              <input
                type="text"
                value={customNetwork.name}
                onChange={(e) => setCustomNetwork(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                placeholder="Enter network name"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">RPC URL</label>
              <input
                type="text"
                value={customNetwork.rpcUrl}
                onChange={(e) => setCustomNetwork(prev => ({ ...prev, rpcUrl: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Chain ID</label>
              <input
                type="text"
                value={customNetwork.chainId}
                onChange={(e) => setCustomNetwork(prev => ({ ...prev, chainId: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Currency Symbol</label>
              <input
                type="text"
                value={customNetwork.symbol}
                onChange={(e) => setCustomNetwork(prev => ({ ...prev, symbol: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                placeholder="ETH"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Block Explorer URL (Optional)</label>
              <input
                type="text"
                value={customNetwork.blockExplorer}
                onChange={(e) => setCustomNetwork(prev => ({ ...prev, blockExplorer: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500"
                placeholder="https://etherscan.io"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddCustomNetwork(false)}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCustomNetwork}
              disabled={!customNetwork.name || !customNetwork.rpcUrl || !customNetwork.chainId}
              className="flex-1 bg-cyan-400 text-gray-900 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Network
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0D1117] text-white z-50 overflow-y-auto">
      {/* Background gradient */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)]"
        style={{ filter: 'blur(20px)' }}
      ></div>

      {/* Header */}
      <header className="flex items-center p-4 border-b border-gray-800 relative z-10">
        <button 
          onClick={onClose}
          className="p-2 mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Manage networks</h1>
      </header>

      {/* Content */}
      <main className="p-4 space-y-6 relative z-10">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500"
          />
        </div>

        {/* Enabled Networks */}
        <div>
          <h2 className="text-gray-400 text-sm font-medium mb-4">Enabled networks</h2>
          <div className="space-y-3">
            {filteredEnabledNetworks.map((network) => (
              <div key={network.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${network.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                    {network.icon}
                  </div>
                  <span className="text-white font-medium">{network.name}</span>
                </div>
                <button className="p-1">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Networks */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-gray-400 text-sm font-medium">Additional networks</h2>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {filteredAdditionalNetworks.map((network) => (
              <div key={network.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${network.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                    {network.icon}
                  </div>
                  <span className="text-white font-medium">{network.name}</span>
                </div>
                <button 
                  onClick={() => handleAddNetwork(network)}
                  className="text-cyan-400 font-medium"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Custom Network Button */}
        <button
          onClick={() => setShowAddCustomNetwork(true)}
          className="w-full bg-transparent border-2 border-cyan-400 text-cyan-400 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-cyan-400/10 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add a custom network
        </button>
      </main>
    </div>
  )
}