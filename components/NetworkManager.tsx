'use client'

import { useMemo, useState } from 'react'
import { 
  ArrowLeft, 
  Search,
  MoreVertical,
  Plus,
  Info,
  X
} from 'lucide-react'
import Image from 'next/image'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useNetworkStore, type Network } from '@/stores/networkStore'

interface NetworkManagerProps {
  isOpen: boolean
  onClose: () => void
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

  const { networks, addNetwork, updateNetwork, setCurrentChain } = useNetworkStore((s) => ({
    networks: s.networks,
    addNetwork: s.addNetwork,
    updateNetwork: s.updateNetwork,
    setCurrentChain: s.setCurrentChain,
  }))

  type CatalogItem = {
    id: number
    name: string
    rpcUrl: string
    blockExplorer: string
    currency: { name: string; symbol: string; decimals: number }
    isTestnet: boolean
    logoUrl?: string
  }

  const catalog: CatalogItem[] = useMemo(() => ([
    {
      id: 42161,
      name: 'Arbitrum One',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      blockExplorer: 'https://arbiscan.io',
      currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      isTestnet: false,
      logoUrl: '/logos/arbitrum.svg',
    },
    {
      id: 10,
      name: 'Optimism',
      rpcUrl: 'https://mainnet.optimism.io',
      blockExplorer: 'https://optimistic.etherscan.io',
      currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      isTestnet: false,
      logoUrl: '/logos/optimism.svg',
    },
    {
      id: 8453,
      name: 'Base',
      rpcUrl: 'https://mainnet.base.org',
      blockExplorer: 'https://basescan.org',
      currency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      isTestnet: false,
      logoUrl: '/logos/base.svg',
    },
    {
      id: 43114,
      name: 'Avalanche C-Chain',
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      blockExplorer: 'https://snowtrace.io',
      currency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
      isTestnet: false,
      logoUrl: '/logos/avalanche.svg',
    },
    {
      id: 56,
      name: 'BNB Smart Chain',
      rpcUrl: 'https://bsc-dataseed.binance.org',
      blockExplorer: 'https://bscscan.com',
      currency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      isTestnet: false,
      logoUrl: '/logos/bnb.svg',
    },
    {
      id: 250,
      name: 'Fantom Opera',
      rpcUrl: 'https://rpc.ftm.tools',
      blockExplorer: 'https://ftmscan.com',
      currency: { name: 'Fantom', symbol: 'FTM', decimals: 18 },
      isTestnet: false,
      logoUrl: '/logos/fantom.svg',
    },
  ]), [])

  const enabledById = useMemo(() => new Set<number>(networks.map(n => Number(n.id))), [networks])
  const filteredAdditional = useMemo(
    () => catalog
      .filter(n => !enabledById.has(Number(n.id)))
      .filter(n => n.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [catalog, enabledById, searchQuery]
  )

  if (!isOpen) return null

  const handleAddNetwork = (network: CatalogItem) => {
    const toAdd: Network = {
      id: network.id as any,
      name: network.name,
      rpcUrl: network.rpcUrl,
      blockExplorer: network.blockExplorer,
      currency: network.currency,
      isTestnet: network.isTestnet,
      logoUrl: network.logoUrl,
    }
    addNetwork(toAdd)
  }

  const handleAddCustomNetwork = () => {
    if (customNetwork.name && customNetwork.rpcUrl && customNetwork.chainId) {
      const chainIdNum = Number(customNetwork.chainId)
      if (!Number.isInteger(chainIdNum)) return
      const newNetwork: Network = {
        id: chainIdNum as any,
        name: customNetwork.name,
        rpcUrl: customNetwork.rpcUrl,
        blockExplorer: customNetwork.blockExplorer || '',
        currency: { name: customNetwork.symbol || 'Native', symbol: customNetwork.symbol || 'NATIVE', decimals: 18 },
        isTestnet: false,
        logoUrl: undefined,
      }
      // If editing existing, update; else add
      if (enabledById.has(chainIdNum)) {
        updateNetwork(newNetwork)
      } else {
        addNetwork(newNetwork)
      }
      setCustomNetwork({ name: '', rpcUrl: '', chainId: '', symbol: '', blockExplorer: '' })
      setShowAddCustomNetwork(false)
    }
  }

  const filteredEnabledNetworks = networks.filter(network =>
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
        <button
          onClick={onClose}
          className="p-2 absolute right-4"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
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
                <button onClick={() => { setCurrentChain(network.id as any); onClose(); }} className="flex items-center gap-3 text-left">
                  {network.logoUrl ? (
                    <Image src={network.logoUrl} alt={network.name} width={32} height={32} className="rounded-md" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded-md" />
                  )}
                  <div>
                    <span className="text-white font-medium block">{network.name}</span>
                    <span className="text-gray-400 text-xs">Chain ID: {String(network.id)}</span>
                  </div>
                </button>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="p-1" aria-label="More actions">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content className="min-w-[140px] bg-gray-900 border border-gray-700 rounded-md p-1 shadow-xl">
                    <DropdownMenu.Item
                      className="px-3 py-2 text-sm text-white hover:bg-gray-800 rounded-md cursor-pointer"
                      onClick={() => {
                        setCustomNetwork({
                          name: network.name,
                          rpcUrl: network.rpcUrl,
                          chainId: String(network.id),
                          symbol: network.currency.symbol,
                          blockExplorer: network.blockExplorer,
                        });
                        setShowAddCustomNetwork(true);
                      }}
                    >
                      Edit
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
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
            {filteredAdditional.map((network) => (
              <div key={network.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {network.logoUrl ? (
                    <Image src={network.logoUrl} alt={network.name} width={32} height={32} className="rounded-md" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded-md" />
                  )}
                  <div>
                    <span className="text-white font-medium block">{network.name}</span>
                    <span className="text-gray-400 text-xs">Chain ID: {String(network.id)}</span>
                  </div>
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