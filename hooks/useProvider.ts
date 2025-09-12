'use client'

import { useEffect } from 'react'
import { injectProvider, removeProvider } from '@/lib/provider'
import { useWallet } from '@/hooks/useWallet'

export function useProvider() {
  const { isConnected, isUnlocked } = useWallet()

  useEffect(() => {
    // Inject provider when wallet is connected and unlocked
    if (isConnected && isUnlocked) {
      injectProvider()
    } else {
      removeProvider()
    }

    // Cleanup on unmount
    return () => {
      removeProvider()
    }
  }, [isConnected, isUnlocked])

  return {
    isProviderInjected: isConnected && isUnlocked,
  }
}
