import { useCallback, useEffect } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { useNetworkStore } from '@/stores/networkStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { 
  sendTransaction, 
  waitForTransaction, 
  getBalance,
  type TransactionRequest,
  type SupportedChainId 
} from '@/lib/crypto/transactions'
import { useSendTransaction, useTransactions as useTransactionsQuery } from '@/services/queries'
import toast from 'react-hot-toast'

export function useTransactions() {
  const { currentAccount } = useWalletStore()
  const { currentChainId } = useNetworkStore()
  const { 
    transactions, 
    pendingTransactions, 
    addTransaction, 
    updateTransaction,
    removePendingTransaction 
  } = useTransactionStore()
  
  const { data: backendTransactions, isLoading } = useTransactionsQuery()
  const sendTransactionMutation = useSendTransaction()

  // Sync backend transactions with local store
  useEffect(() => {
    if (backendTransactions) {
      backendTransactions.forEach(tx => {
        addTransaction({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: new Date(tx.timestamp).getTime(),
          status: tx.status as 'pending' | 'success' | 'failed',
          blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : undefined,
          gasUsed: tx.gasUsed ? BigInt(tx.gasUsed) : undefined,
          gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : undefined,
          chainId: tx.chainId,
          type: 'send', // TODO: Determine type based on transaction data
          data: tx.data,
        })
      })
    }
  }, [backendTransactions, addTransaction])

  // Monitor pending transactions
  useEffect(() => {
    const checkPendingTransactions = async () => {
      for (const hash of pendingTransactions) {
        try {
          const result = await waitForTransaction(hash, currentChainId)
          
          if (result.status !== 'pending') {
            updateTransaction(hash, {
              status: result.status,
              blockNumber: result.blockNumber,
              gasUsed: result.gasUsed,
            })
            removePendingTransaction(hash)
            
            if (result.status === 'success') {
              toast.success('Transaction confirmed!')
            } else {
              toast.error('Transaction failed')
            }
          }
        } catch (error) {
          console.error('Error checking transaction:', error)
        }
      }
    }

    if (pendingTransactions.length > 0) {
      const interval = setInterval(checkPendingTransactions, 5000) // Check every 5 seconds
      return () => clearInterval(interval)
    }
  }, [pendingTransactions, currentChainId, updateTransaction, removePendingTransaction])

  const sendTransactionLocal = useCallback(async (
    transaction: TransactionRequest,
    password: string
  ) => {
    if (!currentAccount) {
      throw new Error('No wallet connected')
    }

    try {
      // Send transaction through backend API
      const result = await sendTransactionMutation.mutateAsync({
        fromAccountIndex: 0, // TODO: Support multiple accounts
        to: transaction.to,
        value: transaction.value,
        gasLimit: transaction.gasLimit?.toString(),
        data: transaction.data,
        password,
        rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/demo`, // TODO: Use current network RPC
      })

      toast.success('Transaction sent!')
      return result.hash
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send transaction'
      toast.error(message)
      throw error
    }
  }, [currentAccount, sendTransactionMutation])

  const getAccountBalance = useCallback(async (address?: string) => {
    if (!address && !currentAccount) {
      throw new Error('No address provided')
    }

    const targetAddress = address || currentAccount!.address
    return await getBalance(targetAddress as `0x${string}`, currentChainId)
  }, [currentAccount, currentChainId])

  return {
    // State
    transactions,
    pendingTransactions,
    isLoading,
    
    // Actions
    sendTransaction: sendTransactionLocal,
    getAccountBalance,
  }
}
