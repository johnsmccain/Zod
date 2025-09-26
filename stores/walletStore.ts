import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { WalletAccount, EncryptedWallet } from '@/lib/crypto'

export interface WalletState {
  // Wallet data
  isConnected: boolean
  isUnlocked: boolean
  currentAccount: WalletAccount | null
  encryptedWallet: EncryptedWallet | null
  accounts: WalletAccount[]
  encryptedWallets: Record<string, EncryptedWallet>
  accountNames: Record<string, string>
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setWallet: (wallet: WalletAccount, encrypted: EncryptedWallet) => void
  switchAccount: (address: string) => void
  addAccount: (wallet: WalletAccount, encrypted: EncryptedWallet) => void
  setAccountName: (address: string, name: string) => void
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
      accounts: [],
      encryptedWallets: {},
      accountNames: {},

      // Actions
      setWallet: (wallet: WalletAccount, encrypted: EncryptedWallet) => {
        set((state) => {
          const addr = wallet.address
          const exists = state.accounts.find(a => a.address === addr)
          const nextAccounts = exists ? state.accounts.map(a => a.address === addr ? wallet : a) : [...state.accounts, wallet]
          const index = nextAccounts.findIndex(a => a.address === addr)
          const defaultName = state.accountNames[addr] ?? `Account ${index + 1}`
          return {
            isConnected: true,
            isUnlocked: true,
            currentAccount: wallet,
            encryptedWallet: encrypted,
            accounts: nextAccounts,
            encryptedWallets: { ...state.encryptedWallets, [addr]: encrypted },
            accountNames: { ...state.accountNames, [addr]: defaultName },
            error: null,
          }
        })
      },

      addAccount: (wallet: WalletAccount, encrypted: EncryptedWallet) => {
        set((state) => {
          const addr = wallet.address
          const exists = state.accounts.find(a => a.address === addr)
          const nextAccounts = exists ? state.accounts : [...state.accounts, wallet]
          const index = nextAccounts.findIndex(a => a.address === addr)
          return {
            accounts: nextAccounts,
            encryptedWallets: { ...state.encryptedWallets, [addr]: encrypted },
            accountNames: { ...state.accountNames, [addr]: state.accountNames[addr] ?? `Account ${index + 1}` },
            // Do not change current selection automatically
            error: null,
          }
        })
      },

      setAccountName: (address: string, name: string) => {
        set((state) => ({ accountNames: { ...state.accountNames, [address]: name } }))
      },

      switchAccount: (address: string) => {
        set((state) => {
          const target = state.accounts.find(a => a.address === address) || null
          const encrypted = target ? state.encryptedWallets[address] ?? state.encryptedWallet : state.encryptedWallet
          return {
            currentAccount: target,
            isConnected: !!target,
            isUnlocked: !!target,
            encryptedWallet: encrypted,
            error: null,
          }
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
            isConnected: true,
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
      version: 1,
      migrate: (persistedState: any, version) => {
        if (!persistedState) return persistedState
        const accounts: any[] = persistedState.accounts ?? []
        const encryptedWallets: Record<string, any> = persistedState.encryptedWallets ?? {}
        const accountNames: Record<string, string> = persistedState.accountNames ?? {}
        // If we have a currentAccount but accounts list is empty, seed it
        if (persistedState.currentAccount && accounts.length === 0) {
          const acc = persistedState.currentAccount
          accounts.push(acc)
          if (persistedState.encryptedWallet && acc?.address) {
            encryptedWallets[acc.address] = persistedState.encryptedWallet
          }
        }
        // Ensure names for all accounts
        accounts.forEach((a: any, i: number) => {
          if (a?.address && !accountNames[a.address]) {
            accountNames[a.address] = `Account ${i + 1}`
          }
        })
        return { ...persistedState, accounts, encryptedWallets, accountNames }
      },
      partialize: (state) => ({
        isConnected: state.isConnected,
        encryptedWallet: state.encryptedWallet,
        accounts: state.accounts,
        encryptedWallets: state.encryptedWallets,
        accountNames: state.accountNames,
      }),
    }
  )
)
