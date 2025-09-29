import { useCallback, useEffect } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { useNetworkStore } from '@/stores/networkStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { 
  waitForTransaction, 
  getBalance,
  type TransactionRequest,
  type SupportedChainId,
  SUPPORTED_CHAINS
} from '@/lib/crypto/transactions'
import { createWalletClient, createPublicClient, http, parseEther } from 'viem'
import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts'
import { useTransactions as useTransactionsQuery } from '@/services/queries'
import { decryptWallet } from '@/lib/crypto'
import toast from 'react-hot-toast'

export function useTransactions() {
  const { currentAccount, encryptedWallet, encryptedWallets } = useWalletStore()
  const { currentChainId } = useNetworkStore()
  const { 
    transactions, 
    pendingTransactions, 
    addTransaction, 
    updateTransaction,
    removePendingTransaction 
  } = useTransactionStore()
  
  const { data: backendTransactions, isLoading } = useTransactionsQuery()
  // Removed backend send mutation; we will send locally with viem

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
      const chain = SUPPORTED_CHAINS[currentChainId]
      // Resolve a valid private key: use stored one if valid, otherwise decrypt with password
      const normalize = (s: string) => {
        let v = (s || '').toString().replace(/\s+/g, '').toLowerCase()
        if (!v.startsWith('0x')) v = '0x' + v
        return v
      }
      let pk = normalize(currentAccount.privateKey || '')
      if (!/^0x[0-9a-f]{64}$/.test(pk)) {
        // Try decrypting from encrypted storage using the provided password
        const enc = (encryptedWallets && currentAccount.address && encryptedWallets[currentAccount.address]) || encryptedWallet
        if (!enc) throw new Error('No encrypted key for this account, please re-import or set a password')
        try {
          const { wallet, mnemonic } = await decryptWallet(enc, password)
          pk = normalize(wallet.privateKey)
          // If still invalid, derive from mnemonic if present
          if (!/^0x[0-9a-f]{64}$/.test(pk) && mnemonic) {
            try {
              const accFromSeed = mnemonicToAccount(mnemonic)
              const priv = accFromSeed.getHdKey().privateKey
              if (priv && priv.length === 32) {
                pk = '0x' + Array.from(priv).map(b => b.toString(16).padStart(2,'0')).join('')
              }
            } catch { /* ignore */ }
          }
        } catch (e) {
          throw new Error('Invalid password or corrupted encrypted wallet')
        }
      }
      if (!/^0x[0-9a-f]{64}$/.test(pk)) {
        throw new Error('Invalid private key format for signing')
      }
      const account = privateKeyToAccount(pk as `0x${string}`)
      const rpcUrl = (chain as any)?.rpcUrls?.default?.http?.[0]
      const transport = rpcUrl ? http(rpcUrl) : http()
      const client = createWalletClient({ account, chain, transport })
      const publicClient = createPublicClient({ chain, transport })

      // Explicitly fetch the latest pending nonce to avoid "nonce too low" and duplicate tx issues
      const nonce = await publicClient.getTransactionCount({ address: account.address, blockTag: 'pending' })

      const hash = await client.sendTransaction({
        to: transaction.to,
        value: parseEther(transaction.value),
        data: transaction.data as any,
        nonce,
      })

      toast.success('Transaction sent!')
      return hash
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send transaction'
      toast.error(message)
      throw error
    }
  }, [currentAccount, currentChainId])

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
