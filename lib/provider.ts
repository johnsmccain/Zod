import { createWalletClient, createPublicClient, http, type Address, type Chain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { useWalletStore } from '@/stores/walletStore'
import { useNetworkStore } from '@/stores/networkStore'
import { SUPPORTED_CHAINS, type SupportedChainId } from '@/lib/crypto/transactions'

export interface RequestArguments {
  method: string
  params?: unknown[] | object
}

export interface ProviderRpcError extends Error {
  code: number
  data?: unknown
}

export class GuildWalletProvider {
  private _isConnected = false
  private _chainId: string = '0x1'
  private _accounts: string[] = []

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Listen for wallet state changes
    const unsubscribe = useWalletStore.subscribe(
      (state) => ({ isConnected: state.isConnected, currentAccount: state.currentAccount }),
      (state) => {
        this._isConnected = state.isConnected
        this._accounts = state.currentAccount ? [state.currentAccount.address] : []
        this.emit('accountsChanged', this._accounts)
      }
    )

    const unsubscribeNetwork = useNetworkStore.subscribe(
      (state) => state.currentChainId,
      (chainId) => {
        this._chainId = `0x${chainId.toString(16)}`
        this.emit('chainChanged', this._chainId)
      }
    )

    // Cleanup on destroy
    return () => {
      unsubscribe()
      unsubscribeNetwork()
    }
  }

  // EIP-1193 Provider Interface
  get isMetaMask() {
    return false
  }

  get isConnected() {
    return this._isConnected
  }

  get chainId() {
    return this._chainId
  }

  get accounts() {
    return this._accounts
  }

  async request(args: RequestArguments): Promise<unknown> {
    const { method, params } = args

    switch (method) {
      case 'eth_requestAccounts':
        return this.requestAccounts()
      
      case 'eth_accounts':
        return this.accounts
      
      case 'eth_chainId':
        return this.chainId
      
      case 'eth_getBalance':
        return this.getBalance(params as [Address, string])
      
      case 'eth_sendTransaction':
        return this.sendTransaction(params as [object])
      
      case 'eth_sign':
        return this.signMessage(params as [Address, string])
      
      case 'personal_sign':
        return this.personalSign(params as [string, Address])
      
      case 'wallet_switchEthereumChain':
        return this.switchChain(params as [{ chainId: string }])
      
      case 'wallet_addEthereumChain':
        return this.addChain(params as [object])
      
      default:
        throw new Error(`Unsupported method: ${method}`)
    }
  }

  private async requestAccounts(): Promise<string[]> {
    const { isConnected, isUnlocked, currentAccount } = useWalletStore.getState()
    
    if (!isConnected || !isUnlocked || !currentAccount) {
      throw new Error('Wallet not connected or unlocked')
    }

    this._isConnected = true
    this._accounts = [currentAccount.address]
    
    return this._accounts
  }

  private async getBalance([address, blockTag]: [Address, string]): Promise<string> {
    const { currentChainId } = useNetworkStore.getState()
    const publicClient = createPublicClientForChain(currentChainId)
    
    const balance = await publicClient.getBalance({ 
      address, 
      blockTag: blockTag as `0x${string}` 
    })
    
    return `0x${balance.toString(16)}`
  }

  private async sendTransaction([transaction]: [object]): Promise<string> {
    const { currentAccount } = useWalletStore.getState()
    const { currentChainId } = useNetworkStore.getState()
    
    if (!currentAccount) {
      throw new Error('No account available')
    }

    const walletClient = createWalletClientForChain(currentChainId, currentAccount.privateKey)
    
    const hash = await walletClient.sendTransaction(transaction as any)
    
    return hash
  }

  private async signMessage([address, message]: [Address, string]): Promise<string> {
    const { currentAccount } = useWalletStore.getState()
    const { currentChainId } = useNetworkStore.getState()
    
    if (!currentAccount || currentAccount.address.toLowerCase() !== address.toLowerCase()) {
      throw new Error('Account not found or not authorized')
    }

    const walletClient = createWalletClientForChain(currentChainId, currentAccount.privateKey)
    
    return await walletClient.signMessage({ message })
  }

  private async personalSign([message, address]: [string, Address]): Promise<string> {
    return this.signMessage([address, message])
  }

  private async switchChain([{ chainId }]: [{ chainId: string }]): Promise<null> {
    const chainIdNumber = parseInt(chainId, 16)
    const { setCurrentChain } = useNetworkStore.getState()
    
    setCurrentChain(chainIdNumber as SupportedChainId)
    
    return null
  }

  private async addChain([chainParams]: [object]): Promise<null> {
    // TODO: Implement adding custom chains
    throw new Error('Adding custom chains not yet implemented')
  }

  // Event emitter functionality
  private listeners: { [event: string]: Function[] } = {}

  on(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
  }

  removeListener(event: string, listener: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== listener)
    }
  }

  private emit(event: string, ...args: unknown[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => listener(...args))
    }
  }
}

// Helper functions
function createWalletClientForChain(chainId: SupportedChainId, privateKey: string) {
  const chain = SUPPORTED_CHAINS[chainId]
  const account = privateKeyToAccount(privateKey as `0x${string}`)
  
  return createWalletClient({
    account,
    chain,
    transport: http(),
  })
}

function createPublicClientForChain(chainId: SupportedChainId) {
  const chain = SUPPORTED_CHAINS[chainId]
  
  return createPublicClient({
    chain,
    transport: http(),
  })
}

// Global provider injection
declare global {
  interface Window {
    ethereum?: GuildWalletProvider
    guildwallet?: GuildWalletProvider
  }
}

export function injectProvider() {
  if (typeof window !== 'undefined') {
    const provider = new GuildWalletProvider()
    
    // Inject as both ethereum and guildwallet for compatibility
    window.ethereum = provider
    window.guildwallet = provider
    
    console.log('GuildWallet provider injected')
  }
}

export function removeProvider() {
  if (typeof window !== 'undefined') {
    delete window.ethereum
    delete window.guildwallet
    
    console.log('GuildWallet provider removed')
  }
}
