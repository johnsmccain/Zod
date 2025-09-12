// Injected script for GuildWallet Chrome Extension
// This script runs in the context of web pages and provides the EIP-1193 interface

(function() {
  'use strict'

  // Check if GuildWallet is already injected
  if (window.guildwallet) {
    return
  }

  // Simple provider implementation for extension
  class GuildWalletExtensionProvider {
    constructor() {
      this.isGuildWallet = true
      this.isConnected = false
      this.chainId = '0x1'
      this.accounts = []
      this.listeners = {}
    }

    async request(args) {
      // Send request to extension
      return new Promise((resolve, reject) => {
        const requestId = Math.random().toString(36).substr(2, 9)
        
        // Listen for response
        const handleResponse = (event) => {
          if (event.detail && event.detail.requestId === requestId) {
            window.removeEventListener('GUILDWALLET_RESPONSE', handleResponse)
            if (event.detail.error) {
              reject(new Error(event.detail.error))
            } else {
              resolve(event.detail.result)
            }
          }
        }
        
        window.addEventListener('GUILDWALLET_RESPONSE', handleResponse)
        
        // Send request
        window.dispatchEvent(new CustomEvent('GUILDWALLET_MESSAGE', {
          detail: {
            requestId,
            method: args.method,
            params: args.params
          }
        }))
        
        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener('GUILDWALLET_RESPONSE', handleResponse)
          reject(new Error('Request timeout'))
        }, 30000)
      })
    }

    on(event, listener) {
      if (!this.listeners[event]) {
        this.listeners[event] = []
      }
      this.listeners[event].push(listener)
    }

    removeListener(event, listener) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(l => l !== listener)
      }
    }

    emit(event, ...args) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(listener => listener(...args))
      }
    }
  }

  // Create and inject the provider
  const provider = new GuildWalletExtensionProvider()
  
  // Inject as both ethereum and guildwallet
  window.ethereum = provider
  window.guildwallet = provider
  
  // Dispatch ready event
  window.dispatchEvent(new Event('guildwallet#initialized'))
  
  console.log('GuildWallet extension provider injected')
})()
