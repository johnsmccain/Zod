import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Hash, Address } from 'viem'

export interface Transaction {
  hash: Hash
  from: Address
  to: Address
  value: string
  timestamp: number
  status: 'pending' | 'success' | 'failed'
  blockNumber?: bigint
  gasUsed?: bigint
  gasPrice?: bigint
  chainId: number
  type: 'send' | 'receive' | 'contract'
  data?: string
}

export interface TransactionState {
  transactions: Transaction[]
  pendingTransactions: Hash[]
  isLoading: boolean
  error: string | null

  // Actions
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (hash: Hash, updates: Partial<Transaction>) => void
  removeTransaction: (hash: Hash) => void
  addPendingTransaction: (hash: Hash) => void
  removePendingTransaction: (hash: Hash) => void
  clearTransactions: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      // Initial state
      transactions: [],
      pendingTransactions: [],
      isLoading: false,
      error: null,

      // Actions
      addTransaction: (transaction: Transaction) => {
        const { transactions } = get()
        const exists = transactions.find(t => t.hash === transaction.hash)
        
        if (!exists) {
          set({
            transactions: [transaction, ...transactions].slice(0, 100), // Keep last 100
            error: null,
          })
        }
      },

      updateTransaction: (hash: Hash, updates: Partial<Transaction>) => {
        const { transactions } = get()
        
        set({
          transactions: transactions.map(t =>
            t.hash === hash ? { ...t, ...updates } : t
          ),
          error: null,
        })
      },

      removeTransaction: (hash: Hash) => {
        const { transactions } = get()
        
        set({
          transactions: transactions.filter(t => t.hash !== hash),
          error: null,
        })
      },

      addPendingTransaction: (hash: Hash) => {
        const { pendingTransactions } = get()
        
        if (!pendingTransactions.includes(hash)) {
          set({
            pendingTransactions: [...pendingTransactions, hash],
            error: null,
          })
        }
      },

      removePendingTransaction: (hash: Hash) => {
        const { pendingTransactions } = get()
        
        set({
          pendingTransactions: pendingTransactions.filter(h => h !== hash),
          error: null,
        })
      },

      clearTransactions: () => {
        set({
          transactions: [],
          pendingTransactions: [],
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
      name: 'transaction-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        pendingTransactions: state.pendingTransactions,
      }),
    }
  )
)
