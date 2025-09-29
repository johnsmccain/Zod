import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface TrackedToken {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
}

interface TokenState {
  tokensByChain: Record<number, TrackedToken[]>
  addToken: (chainId: number, token: TrackedToken) => void
  removeToken: (chainId: number, address: `0x${string}`) => void
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      tokensByChain: {},
      addToken: (chainId, token) => {
        set((s) => {
          const list = s.tokensByChain[chainId] ?? []
          const exists = list.find(t => t.address.toLowerCase() === token.address.toLowerCase())
          const next = exists ? list.map(t => t.address.toLowerCase() === token.address.toLowerCase() ? token : t) : [...list, token]
          return { tokensByChain: { ...s.tokensByChain, [chainId]: next } }
        })
      },
      removeToken: (chainId, address) => {
        set((s) => {
          const list = s.tokensByChain[chainId] ?? []
          const next = list.filter(t => t.address.toLowerCase() !== address.toLowerCase())
          return { tokensByChain: { ...s.tokensByChain, [chainId]: next } }
        })
      }
    }),
    {
      name: 'token-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
