import { Address, Hash } from 'viem'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export interface ApiResponse<T = any> {
  status: 'success' | 'fail'
  data?: T
  message?: string
  error?: string
}

export interface User {
  id: string
  email: string
  name?: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
  accounts?: Account[]
}

export interface Account {
  id: string
  address: string
  name: string
  index: number
  createdAt: string
}

export interface Transaction {
  id: string
  hash: Hash
  from: Address
  to: Address
  value: string
  gasPrice?: string
  gasLimit?: string
  nonce: number
  data?: string
  timestamp: string
  status: string
  blockNumber?: number
  chainId: number
}

export interface Network {
  id: string
  name: string
  rpcUrl: string
  chainId: number
  currencyName: string
  currencySymbol: string
  currencyDecimals: number
  blockExplorer?: string
  isTestnet: boolean
}

export interface Setting {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed')
      }

      return data
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Network error')
    }
  }

  // Auth endpoints
  async register(data: {
    email: string
    password: string
    name?: string
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async login(data: {
    email: string
    password: string
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async importWallet(data: {
    email: string
    password: string
    seedPhrase: string
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/import', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  // Wallet endpoints
  async getAccounts(): Promise<Account[]> {
    const response = await this.request<Account[]>('/wallet/accounts')
    return response.data!
  }

  async createAccount(data: {
    name: string
    password: string
  }): Promise<Account> {
    const response = await this.request<Account>('/wallet/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  // Transaction endpoints
  async sendTransaction(data: {
    fromAccountIndex: number
    to: Address
    value: string
    gasLimit?: string
    data?: string
    password: string
    rpcUrl: string
  }): Promise<{ hash: Hash }> {
    const response = await this.request<{ hash: Hash }>('/transactions/send', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async sendTokenTransaction(data: {
    fromAccountIndex: number
    tokenAddress: Address
    to: Address
    amount: string
    decimals: number
    password: string
    rpcUrl: string
  }): Promise<{ hash: Hash }> {
    const response = await this.request<{ hash: Hash }>('/transactions/send-token', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async getTransactions(limit = 50): Promise<Transaction[]> {
    const response = await this.request<Transaction[]>(`/transactions?limit=${limit}`)
    return response.data!
  }

  async getTransaction(hash: Hash): Promise<Transaction> {
    const response = await this.request<Transaction>(`/transactions/${hash}`)
    return response.data!
  }

  // Network endpoints
  async getNetworks(): Promise<Network[]> {
    const response = await this.request<Network[]>('/networks')
    return response.data!
  }

  async addNetwork(data: {
    name: string
    rpcUrl: string
    chainId: number
    currencyName: string
    currencySymbol: string
    currencyDecimals: number
    blockExplorer?: string
    isTestnet?: boolean
  }): Promise<Network> {
    const response = await this.request<Network>('/networks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  // Settings endpoints
  async getSettings(): Promise<Setting[]> {
    const response = await this.request<Setting[]>('/settings')
    return response.data!
  }

  async updateSettings(settings: { key: string; value: string }[]): Promise<Setting[]> {
    const response = await this.request<Setting[]>('/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    })
    return response.data!
  }

  // Health check
  async healthCheck(): Promise<{ ok: boolean }> {
    const response = await fetch(`${this.baseURL.replace('/api', '')}/health`)
    return response.json()
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
