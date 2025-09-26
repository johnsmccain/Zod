import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SupportedChainId, SUPPORTED_CHAINS } from '@/lib/crypto/transactions'

export interface Network {
  id: SupportedChainId
  name: string
  rpcUrl: string
  blockExplorer: string
  currency: {
    name: string
    symbol: string
    decimals: number
  }
  isTestnet: boolean
  logoUrl?: string
}

export interface NetworkState {
  currentChainId: SupportedChainId
  networks: Network[]
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentChain: (chainId: SupportedChainId) => void
  addNetwork: (network: Network) => void
  updateNetwork: (network: Network) => void
  removeNetwork: (chainId: SupportedChainId) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

const DEFAULT_NETWORKS: Network[] = [
  {
    id: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    blockExplorer: 'https://etherscan.io',
    currency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: false,
    logoUrl: '/logos/ethereum.svg',
  },
  {
    id: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/demo',
    blockExplorer: 'https://sepolia.etherscan.io',
    currency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    isTestnet: true,
    logoUrl: '/logos/ethereum.svg',
  },
  {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    currency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
    isTestnet: false,
    logoUrl: '/logos/polygon.svg',
  },
]

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChainId: 1,
      networks: DEFAULT_NETWORKS,
      isLoading: false,
      error: null,

      // Actions
      setCurrentChain: (chainId: SupportedChainId) => {
        const { networks } = get()
        const network = networks.find(n => n.id === chainId)
        
        if (!network) {
          set({ error: 'Network not supported' })
          return
        }

        set({
          currentChainId: chainId,
          error: null,
        })
      },

      addNetwork: (network: Network) => {
        const { networks } = get()
        const exists = networks.find(n => n.id === network.id)
        
        if (exists) {
          set({ error: 'Network already exists' })
          return
        }

        set({
          networks: [...networks, network],
          error: null,
        })
      },

      updateNetwork: (network: Network) => {
        const { networks } = get()
        const exists = networks.find(n => n.id === network.id)
        if (!exists) {
          set({ error: 'Network not found' })
          return
        }
        set({
          networks: networks.map(n => (n.id === network.id ? network : n)),
          error: null,
        })
      },

      removeNetwork: (chainId: SupportedChainId) => {
        const { networks, currentChainId } = get()
        
        // Don't allow removing the current network
        if (currentChainId === chainId) {
          set({ error: 'Cannot remove current network' })
          return
        }

        // Don't allow removing default networks
        const defaultNetwork = DEFAULT_NETWORKS.find(n => n.id === chainId)
        if (defaultNetwork) {
          set({ error: 'Cannot remove default network' })
          return
        }

        set({
          networks: networks.filter(n => n.id !== chainId),
          error: null,
        })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'network-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: any, version) => {
        // Backfill logos for known networks if missing
        if (persistedState && persistedState.networks) {
          const withLogos = persistedState.networks.map((n: any) => {
            if (!n.logoUrl) {
              if (n.id === 1 || n.id === 11155111) return { ...n, logoUrl: '/logos/ethereum.svg' }
              if (n.id === 137) return { ...n, logoUrl: '/logos/polygon.svg' }
              if (n.id === 42161) return { ...n, logoUrl: '/logos/arbitrum.svg' }
              if (n.id === 8453) return { ...n, logoUrl: '/logos/base.svg' }
              if (n.id === 10) return { ...n, logoUrl: '/logos/optimism.svg' }
              if (n.id === 43114) return { ...n, logoUrl: '/logos/avalanche.svg' }
              if (n.id === 56) return { ...n, logoUrl: '/logos/bnb.svg' }
              if (n.id === 250) return { ...n, logoUrl: '/logos/fantom.svg' }
            }
            return n
          })
          return { ...persistedState, networks: withLogos }
        }
        return persistedState
      },
      partialize: (state) => ({
        currentChainId: state.currentChainId,
        networks: state.networks,
      }),
    }
  )
)
