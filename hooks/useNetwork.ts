import { useCallback } from 'react'
import { useNetworkStore } from '@/stores/networkStore'
import { type Network, type SupportedChainId } from '@/stores/networkStore'
import toast from 'react-hot-toast'

export function useNetwork() {
  const {
    currentChainId,
    networks,
    isLoading,
    error,
    setCurrentChain,
    addNetwork,
    removeNetwork,
    setLoading,
    setError,
    clearError,
  } = useNetworkStore()

  const switchNetwork = useCallback((chainId: SupportedChainId) => {
    try {
      setCurrentChain(chainId)
      const network = networks.find(n => n.id === chainId)
      if (network) {
        toast.success(`Switched to ${network.name}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to switch network'
      toast.error(message)
    }
  }, [setCurrentChain, networks])

  const addCustomNetwork = useCallback((network: Network) => {
    try {
      addNetwork(network)
      toast.success(`Added ${network.name}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add network'
      toast.error(message)
    }
  }, [addNetwork])

  const removeCustomNetwork = useCallback((chainId: SupportedChainId) => {
    try {
      removeNetwork(chainId)
      toast.success('Network removed')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove network'
      toast.error(message)
    }
  }, [removeNetwork])

  const getCurrentNetwork = useCallback(() => {
    return networks.find(n => n.id === currentChainId)
  }, [networks, currentChainId])

  const isTestnet = useCallback(() => {
    const network = getCurrentNetwork()
    return network?.isTestnet || false
  }, [getCurrentNetwork])

  return {
    // State
    currentChainId,
    networks,
    isLoading,
    error,
    
    // Actions
    switchNetwork,
    addCustomNetwork,
    removeCustomNetwork,
    getCurrentNetwork,
    isTestnet,
    clearError,
  }
}
