import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, type AuthResponse, type Account, type Transaction, type Network, type Setting } from './api'
import { useWalletStore } from '@/stores/walletStore'
import { useTransactionStore } from '@/stores/transactionStore'
import toast from 'react-hot-toast'

// Query keys
export const queryKeys = {
  auth: ['auth'] as const,
  accounts: ['accounts'] as const,
  transactions: ['transactions'] as const,
  transaction: (hash: string) => ['transactions', hash] as const,
  networks: ['networks'] as const,
  settings: ['settings'] as const,
  health: ['health'] as const,
}

// Auth mutations
export function useRegister() {
  const queryClient = useQueryClient()
  const { setWallet } = useWalletStore()

  return useMutation({
    mutationFn: apiClient.register,
    onSuccess: (data) => {
      apiClient.setToken(data.token)
      queryClient.setQueryData(queryKeys.auth, data)
      toast.success('Wallet created successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const { setWallet } = useWalletStore()

  return useMutation({
    mutationFn: apiClient.login,
    onSuccess: (data) => {
      apiClient.setToken(data.token)
      queryClient.setQueryData(queryKeys.auth, data)
      toast.success('Logged in successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useImportWallet() {
  const queryClient = useQueryClient()
  const { setWallet } = useWalletStore()

  return useMutation({
    mutationFn: apiClient.importWallet,
    onSuccess: (data) => {
      apiClient.setToken(data.token)
      queryClient.setQueryData(queryKeys.auth, data)
      toast.success('Wallet imported successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Account queries
export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: apiClient.getAccounts,
    enabled: !!apiClient.token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      toast.success('Account created successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Transaction queries
export function useTransactions(limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.transactions, limit],
    queryFn: () => apiClient.getTransactions(limit),
    enabled: !!apiClient.token,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  })
}

export function useTransaction(hash: string) {
  return useQuery({
    queryKey: queryKeys.transaction(hash),
    queryFn: () => apiClient.getTransaction(hash as `0x${string}`),
    enabled: !!hash && !!apiClient.token,
    staleTime: 10 * 1000, // 10 seconds
  })
}

export function useSendTransaction() {
  const queryClient = useQueryClient()
  const { addTransaction, addPendingTransaction } = useTransactionStore()

  return useMutation({
    mutationFn: apiClient.sendTransaction,
    onSuccess: (data) => {
      addPendingTransaction(data.hash)
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      toast.success('Transaction sent successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useSendTokenTransaction() {
  const queryClient = useQueryClient()
  const { addTransaction, addPendingTransaction } = useTransactionStore()

  return useMutation({
    mutationFn: apiClient.sendTokenTransaction,
    onSuccess: (data) => {
      addPendingTransaction(data.hash)
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      toast.success('Token transaction sent successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Network queries
export function useNetworks() {
  return useQuery({
    queryKey: queryKeys.networks,
    queryFn: apiClient.getNetworks,
    enabled: !!apiClient.token,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useAddNetwork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.addNetwork,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.networks })
      toast.success('Network added successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Settings queries
export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: apiClient.getSettings,
    enabled: !!apiClient.token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: apiClient.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings })
      toast.success('Settings updated successfully!')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

// Health check
export function useHealthCheck() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: apiClient.healthCheck,
    refetchInterval: 30 * 1000, // Check every 30 seconds
    retry: 3,
  })
}

// Utility hook to check if user is authenticated
export function useAuth() {
  const { isConnected, isUnlocked } = useWalletStore()
  
  return {
    isAuthenticated: isConnected && isUnlocked,
    isConnected,
    isUnlocked,
  }
}
