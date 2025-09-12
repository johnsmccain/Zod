import { 
  createWalletClient, 
  createPublicClient, 
  http, 
  parseEther, 
  formatEther,
  type Hash,
  type Address,
  type Chain
} from 'viem'
import { mainnet, sepolia, polygon } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export interface TransactionRequest {
  to: Address
  value: string // in ETH
  data?: `0x${string}`
  gasLimit?: bigint
  gasPrice?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

export interface TransactionResult {
  hash: Hash
  status: 'pending' | 'success' | 'failed'
  blockNumber?: bigint
  gasUsed?: bigint
}

export const SUPPORTED_CHAINS = {
  1: mainnet,
  11155111: sepolia,
  137: polygon,
} as const

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS

/**
 * Create a wallet client for signing transactions
 */
export function createWalletClientForChain(chainId: SupportedChainId, privateKey: string) {
  const chain = SUPPORTED_CHAINS[chainId]
  const account = privateKeyToAccount(privateKey as `0x${string}`)
  
  return createWalletClient({
    account,
    chain,
    transport: http(),
  })
}

/**
 * Create a public client for reading blockchain data
 */
export function createPublicClientForChain(chainId: SupportedChainId) {
  const chain = SUPPORTED_CHAINS[chainId]
  
  return createPublicClient({
    chain,
    transport: http(),
  })
}

/**
 * Get account balance
 */
export async function getBalance(
  address: Address,
  chainId: SupportedChainId
): Promise<string> {
  const publicClient = createPublicClientForChain(chainId)
  const balance = await publicClient.getBalance({ address })
  return formatEther(balance)
}

/**
 * Get transaction count (nonce)
 */
export async function getTransactionCount(
  address: Address,
  chainId: SupportedChainId
): Promise<number> {
  const publicClient = createPublicClientForChain(chainId)
  return await publicClient.getTransactionCount({ address })
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  from: Address,
  to: Address,
  value: string,
  data?: `0x${string}`,
  chainId: SupportedChainId = 1
): Promise<bigint> {
  const publicClient = createPublicClientForChain(chainId)
  
  return await publicClient.estimateGas({
    account: from,
    to,
    value: parseEther(value),
    data,
  })
}

/**
 * Send a transaction
 */
export async function sendTransaction(
  privateKey: string,
  transaction: TransactionRequest,
  chainId: SupportedChainId = 1
): Promise<Hash> {
  const walletClient = createWalletClientForChain(chainId, privateKey)
  
  const hash = await walletClient.sendTransaction({
    to: transaction.to,
    value: parseEther(transaction.value),
    data: transaction.data,
    gas: transaction.gasLimit,
    gasPrice: transaction.gasPrice,
    maxFeePerGas: transaction.maxFeePerGas,
    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
  })
  
  return hash
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  hash: Hash,
  chainId: SupportedChainId = 1
): Promise<TransactionResult> {
  const publicClient = createPublicClientForChain(chainId)
  
  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    
    return {
      hash,
      status: receipt.status === 'success' ? 'success' : 'failed',
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
    }
  } catch (error) {
    return {
      hash,
      status: 'failed',
    }
  }
}

/**
 * Sign a message
 */
export async function signMessage(
  privateKey: string,
  message: string,
  chainId: SupportedChainId = 1
): Promise<`0x${string}`> {
  const walletClient = createWalletClientForChain(chainId, privateKey)
  
  return await walletClient.signMessage({
    message,
  })
}

/**
 * Get transaction details
 */
export async function getTransaction(
  hash: Hash,
  chainId: SupportedChainId = 1
) {
  const publicClient = createPublicClientForChain(chainId)
  
  return await publicClient.getTransaction({ hash })
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(
  hash: Hash,
  chainId: SupportedChainId = 1
) {
  const publicClient = createPublicClientForChain(chainId)
  
  return await publicClient.getTransactionReceipt({ hash })
}
