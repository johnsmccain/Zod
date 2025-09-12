import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { WalletAccount, EncryptedWallet } from '@/lib/crypto'

export interface WalletState {
  // Wallet data
  isConnected: boolean
  isUnlocked: boolean
  currentAccount: WalletAccount | null
  encryptedWallet: EncryptedWallet | null
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setWallet: (wallet: WalletAccount, encrypted: EncryptedWallet) => void
  unlockWallet: (password: string) => Promise<boolean>
  lockWallet: () => void
  disconnectWallet: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      isUnlocked: false,
      currentAccount: null,
      encryptedWallet: null,
      isLoading: false,
      error: null,

      // Actions
      setWallet: (wallet: WalletAccount, encrypted: EncryptedWallet) => {
        set({
          isConnected: true,
          isUnlocked: true,
          currentAccount: wallet,
          encryptedWallet: encrypted,
          error: null,
        })
      },

      unlockWallet: async (password: string) => {
        const { encryptedWallet } = get()
        if (!encryptedWallet) {
          set({ error: 'No wallet found' })
          return false
        }

        set({ isLoading: true, error: null })

        try {
          const { decryptWallet } = await import('@/lib/crypto')
          const { wallet } = await decryptWallet(encryptedWallet, password)
          
          set({
            isUnlocked: true,
            currentAccount: wallet,
            isLoading: false,
            error: null,
          })
          
          return true
        } catch (error) {
          set({
            isUnlocked: false,
            currentAccount: null,
            isLoading: false,
            error: 'Invalid password',
          })
          return false
        }
      },

      lockWallet: () => {
        set({
          isUnlocked: false,
          currentAccount: null,
        })
      },

      disconnectWallet: () => {
        set({
          isConnected: false,
          isUnlocked: false,
          currentAccount: null,
          encryptedWallet: null,
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
      name: 'wallet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isConnected: state.isConnected,
        encryptedWallet: state.encryptedWallet,
      }),
    }
  )
)
