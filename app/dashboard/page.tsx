'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SendTransactionDialog } from '@/components'
import { AccountMenu } from '@/components/AccountMenu'
import { AccountsModal } from '@/components/AccountsModal'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { NetworkManager } from '@/components/NetworkManager'
import { useWallet } from '@/hooks/useWallet'
import { useNetworkStore } from '@/stores/networkStore'
import { useWalletStore } from '@/stores/walletStore'
import { injectProvider } from '@/lib/provider'
import { formatEther, createPublicClient, http, formatUnits } from 'viem'
import { SUPPORTED_CHAINS } from '@/lib/crypto/transactions'
import { useTokenStore } from '@/stores/tokenStore'
import { erc20Abi } from '@/lib/abi/erc20'
import {
  Send,
  Download,
  Settings,
  Home,
  Activity,
  Menu,
  Eye,
  Copy,
  ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { isConnected, isUnlocked, currentAccount, disconnect } = useWallet()
  const { currentChainId, networks } = useNetworkStore((s) => ({ currentChainId: s.currentChainId, networks: s.networks }))
  const accounts = useWalletStore((s) => s.accounts)
  const accountNames = useWalletStore((s) => s.accountNames)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [showNetworkManager, setShowNetworkManager] = useState(false)
  const [activeTab, setActiveTab] = useState('Tokens')
  const [showBalance, setShowBalance] = useState(true)
  const [activities, setActivities] = useState<Array<{hash:string; direction:'In'|'Out'; valueEth:string; time:number; from:string; to:string}>>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  const tokensByChain = useTokenStore(s => s.tokensByChain)
  const trackedTokens = tokensByChain[currentChainId] ?? []
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!isConnected || !isUnlocked) {
      router.push('/')
    }
  }, [isConnected, isUnlocked, router])

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }
  // console.log(isConnected, isUnlocked, currentAccount)

  const copyAddress = () => {
    if (currentAccount?.address) {
      navigator.clipboard.writeText(currentAccount.address)
      toast.success('Address copied to clipboard')
    }
  }

  if (!isConnected || !isUnlocked || !currentAccount) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    )
  }

  const [ethBalance, setEthBalance] = useState<string>('0')

  useEffect(() => {
    // Ensure our EIP-1193 provider is available
    injectProvider()
  }, [])

  useEffect(() => {
    let intervalId: number | undefined
    let cancelled = false

    const fetchBalance = async () => {
      try {
        if (!currentAccount?.address) return
        const chain = SUPPORTED_CHAINS[currentChainId]
        const activeNet = networks.find(n => n.id === currentChainId)
        let primary = activeNet?.rpcUrl || (chain as any)?.rpcUrls?.default?.http?.[0]
        // Sanitize demo RPCs
        if (primary && /infura\.io\/v3\/demo/.test(primary) && currentChainId === 11155111) primary = 'https://rpc.sepolia.org'
        if (primary && /alchemy\.com\/v2\/demo/.test(primary) && currentChainId === 1) primary = 'https://ethereum.publicnode.com'
        const fallbacks: string[] = []
        if (currentChainId === 11155111) {
          fallbacks.push('https://rpc.sepolia.org', 'https://sepolia.gateway.tenderly.co', 'https://rpc2.sepolia.org')
        } else if (currentChainId === 1) {
          fallbacks.push('https://ethereum.publicnode.com', 'https://cloudflare-eth.com')
        }
        const candidates = ([primary, ...fallbacks].filter(Boolean) as string[])
          .filter(u => !/infura\.io\/v3\/demo|alchemy\.com\/v2\/demo/.test(u))
        if (candidates.length === 0) return

        let wei: bigint | null = null
        for (const url of candidates) {
          try {
            const publicClient = createPublicClient({ chain, transport: http(url) })
            wei = await publicClient.getBalance({ address: currentAccount.address as `0x${string}` })
            break
          } catch (e) {
            continue
          }
        }
        if (wei === null) return
        const ethStr = formatEther(wei)
        if (!cancelled) {
          const n = Number(ethStr)
          setEthBalance(isNaN(n) ? ethStr : n.toLocaleString(undefined, { maximumFractionDigits: 6 }))
        }
      } catch (e) {
        console.error('balance error', e)
      }
    }

    // initial fetch
    fetchBalance()
    // poll every 8 seconds
    intervalId = window.setInterval(fetchBalance, 8000)

    // also refetch on visibility change
    const onVis = () => { if (document.visibilityState === 'visible') fetchBalance() }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelled = true
      if (intervalId) window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [currentAccount?.address, currentChainId])

  // Activity: scan latest blocks for txs involving the current address using viem public client
  useEffect(() => {
    if (activeTab !== 'Activity') return
    let intervalId: number | undefined
    let cancelled = false
    const fetchActivity = async () => {
      try {
        setIsLoadingActivity(true)
        if (!currentAccount?.address) return
        const chain = SUPPORTED_CHAINS[currentChainId]
        // Prefer user-configured RPC from network store
        const activeNet = networks.find(n => n.id === currentChainId)
        // Force stable public endpoints (ignore demo URLs)
        let rpcUrl = activeNet?.rpcUrl || (chain as any)?.rpcUrls?.default?.http?.[0]
        if (currentChainId === 11155111) rpcUrl = 'https://rpc.sepolia.org'
        if (currentChainId === 1) rpcUrl = 'https://ethereum.publicnode.com'
        if (!rpcUrl) {
          console.warn('No RPC URL configured for chain', currentChainId)
          return
        }
        const transport = http(rpcUrl)
        const publicClient = createPublicClient({ chain, transport })
        const my = currentAccount.address.toLowerCase()
        const latest = Number(await publicClient.getBlockNumber())
        const lookback = 200 // robust window
        const blockNums: number[] = []
        for (let n = latest; n > latest - lookback && n >= 0; n--) blockNums.push(n)
        const items: Array<{hash:string; direction:'In'|'Out'; valueEth:string; time:number; from:string; to:string}> = []
        const chunkSize = 20
        for (let i = 0; i < blockNums.length; i += chunkSize) {
          if (cancelled) return
          const slice = blockNums.slice(i, i + chunkSize)
          const blocks = await Promise.all(slice.map(n => publicClient.getBlock({ blockNumber: BigInt(n), includeTransactions: true })))
          for (const block of blocks) {
            const timestamp = Number(block.timestamp) * 1000
            const txs = (block.transactions || []) as any[]
            for (const tx of txs) {
              const from = ((tx as any).from || '').toLowerCase()
              const toAddr = ((tx as any).to || '').toLowerCase()
              if (from === my || toAddr === my) {
                const rawVal = (tx as any).value
                const val = typeof rawVal === 'bigint' ? rawVal : BigInt(rawVal ?? 0n)
                const eth = formatEther(val)
                items.push({
                  hash: (tx as any).hash,
                  direction: toAddr === my ? 'In' : 'Out',
                  valueEth: eth,
                  time: timestamp,
                  from: (tx as any).from ?? '0x',
                  to: (tx as any).to ?? '0x',
                })
              }
            }
          }
        }
        // ERC-20 Transfer logs for tracked tokens
        if (trackedTokens.length > 0) {
          const fromTopic = `0x000000000000000000000000${my.slice(2)}`.toLowerCase()
          const toTopic = fromTopic
          for (const t of trackedTokens) {
            try {
              const logs = await publicClient.getLogs({
                address: t.address,
                event: {
                  type: 'event',
                  name: 'Transfer',
                  inputs: [
                    { name: 'from', type: 'address', indexed: true },
                    { name: 'to', type: 'address', indexed: true },
                    { name: 'value', type: 'uint256', indexed: false },
                  ],
                } as any,
                fromBlock: BigInt(Math.max(0, latest - lookback)),
                toBlock: BigInt(latest),
              }) as any[]
              for (const log of logs) {
                const from = (log.args?.from as string || '').toLowerCase()
                const to = (log.args?.to as string || '').toLowerCase()
                if (from === my || to === my) {
                  const value = log.args?.value as bigint
                  const valStr = formatUnits(value ?? 0n, t.decimals)
                  items.push({
                    hash: log.transactionHash,
                    direction: to === my ? 'In' : 'Out',
                    valueEth: `${valStr} ${t.symbol}`,
                    time: Number((await publicClient.getBlock({ blockHash: log.blockHash })).timestamp) * 1000,
                    from,
                    to,
                  })
                }
              }
            } catch (e) {
              console.warn('token logs error', t.address, e)
            }
          }
        }

        if (!cancelled) {
          const unique = Array.from(new Map(items.map(i => [i.hash + i.valueEth, i])).values())
          unique.sort((a,b) => b.time - a.time)
          setActivities(unique)
        }
      } catch (e) {
        console.error('activity error', e)
      }
      finally {
        if (!cancelled) setIsLoadingActivity(false)
      }
    }
    fetchActivity()
    intervalId = window.setInterval(fetchActivity, 20000)
    return () => { cancelled = true; if (intervalId) window.clearInterval(intervalId) }
  }, [currentAccount?.address, currentChainId, activeTab])

  // Fetch ERC-20 balances for tracked tokens
  useEffect(() => {
    let cancelled = false
    const fn = async () => {
      try {
        if (!currentAccount?.address || trackedTokens.length === 0) {
          setTokenBalances({})
          return
        }
        const chain = SUPPORTED_CHAINS[currentChainId]
        const activeNet = networks.find(n => n.id === currentChainId)
        const rpcUrl = activeNet?.rpcUrl || (chain as any)?.rpcUrls?.default?.http?.[0]
        if (!rpcUrl) return
        const publicClient = createPublicClient({ chain, transport: http(rpcUrl) })
        const balances: Record<string, string> = {}
        for (const t of trackedTokens) {
          try {
            const bal = await publicClient.readContract({
              address: t.address,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [currentAccount.address as `0x${string}`],
            }) as bigint
            balances[t.address.toLowerCase()] = formatUnits(bal ?? 0n, t.decimals)
          } catch (e) {
            balances[t.address.toLowerCase()] = '0'
          }
        }
        if (!cancelled) setTokenBalances(balances)
      } catch {}
    }
    fn()
    const id = window.setInterval(fn, 15000)
    return () => { cancelled = true; window.clearInterval(id) }
  }, [trackedTokens.map(t=>t.address).join(','), currentAccount?.address, currentChainId])

  return (
    <div className="min-h-screen bg-[#0D1117] text-white relative">
      {/* Background gradient */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)] pointer-events-none"
        style={{ filter: 'blur(20px)' }}
      ></div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-400 to-red-500" />
          <div
            role="button"
            tabIndex={0}
            onClick={() => setShowAccountsModal(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowAccountsModal(true) }}
            className="text-left cursor-pointer outline-none"
          >
            <div className="flex items-center gap-1">
              <span className="font-medium">{accountNames[currentAccount!.address] ?? 'Account'}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xs text-gray-400">{currentAccount!.address.slice(0,6) + '...' + currentAccount!.address.slice(-4)}</div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            {currentAccount ? `0x${currentAccount.address.slice(2,8)}...${currentAccount.address.slice(-6)}` : 'No account'}
            {currentAccount && (
              <button onClick={() => navigator.clipboard.writeText(currentAccount.address)} title="Copy address">
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={() => setShowNetworkManager(true)}
          className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors"
        >
          {(() => {
            const net = networks.find(n => n.id === currentChainId)
            return (
              <>
                {net?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                  <img src={net.logoUrl} alt={net.name} className="w-4 h-4 rounded-full bg-white" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/logos/ethereum.svg'}} />
                ) : (
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                )}
                <span className="text-sm">{net?.name ?? 'Select network'}</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )
          })()}
        </button>

        <button
          onClick={() => setShowHamburgerMenu(true)}
          className="p-2"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 relative z-10">
        {/* Account Info */}
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">My Account 1</h1>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <span>0x{currentAccount.address.slice(2, 8)}...{currentAccount.address.slice(-6)}</span>
            <button onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Balance</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowBalance(!showBalance)} title="Hide/Show">
                <Eye className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  // trigger a one-off refresh by toggling activeTab
                  setActiveTab((t)=>t)
                }}
                className="text-xs text-cyan-400"
                title="Refresh balance"
              >Refresh</button>
            </div>
          </div>
          <div className="text-3xl font-bold text-cyan-400 mb-2">
            {showBalance ? `${ethBalance} ETH` : '••••••'}
          </div>
          <div className="text-gray-400 text-sm">Network: {networks.find(n=>n.id===currentChainId)?.name}</div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowSendDialog(true)}
            className="bg-cyan-400 text-gray-900 rounded-lg p-4 flex flex-col items-center gap-2 font-semibold"
          >
            <Send className="w-6 h-6" />
            Send
          </button>
          <button
            onClick={() => router.push('/receive')}
            className="bg-cyan-400 text-gray-900 rounded-lg p-4 flex flex-col items-center gap-2 font-semibold"
          >
            <Download className="w-6 h-6" />
            Receive
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-700">
          {['Tokens', 'Assets', 'Activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium ${activeTab === tab
                ? 'text-white border-b-2 border-cyan-400'
                : 'text-gray-400'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Token List (Tab: Tokens) */}
        {activeTab === 'Tokens' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">
                  ⟠
                </div>
                <div>
                  <div className="font-semibold">ETH</div>
                  <div className="text-gray-400 text-sm">Ethereum</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{ethBalance}</div>
                <div className="text-gray-400 text-sm">on {networks.find(n=>n.id===currentChainId)?.name}</div>
              </div>
            </div>

            {/* Tracked ERC-20 tokens */}
            {trackedTokens.map(t => (
              <div key={t.address} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-md flex items-center justify-center text-white font-bold">{t.symbol.slice(0,3).toUpperCase()}</div>
                  <div>
                    <div className="font-semibold">{t.symbol}</div>
                    <div className="text-gray-400 text-sm">{t.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{tokenBalances[t.address.toLowerCase()] ?? '0'}</div>
                  <div className="text-gray-400 text-sm">{networks.find(n=>n.id===currentChainId)?.name}</div>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Assets (Tab: Assets) */}
        {activeTab === 'Assets' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold">⟠</div>
                <div>
                  <div className="font-semibold">ETH</div>
                  <div className="text-gray-400 text-sm">Native asset</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{ethBalance}</div>
                <div className="text-gray-400 text-sm">{networks.find(n=>n.id===currentChainId)?.name}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 z-20">
          <div className="flex justify-around">
            <button className="flex flex-col items-center gap-1 text-cyan-400">
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('Activity')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'Activity' ? 'text-cyan-400' : 'text-gray-400'}`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-xs">Activity</span>
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="flex flex-col items-center gap-1 text-gray-400"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>

        {/* Activity Section (when tab is active) */}
        {activeTab === 'Activity' && (
          <div className="space-y-4 pb-20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Activity</h2>
              <button onClick={() => setActiveTab('Activity')} className="text-cyan-400 text-sm disabled:text-gray-500" disabled={isLoadingActivity}>
                {isLoadingActivity ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
            {activities.length === 0 ? (
              <div className="p-4 bg-gray-800/30 rounded-lg text-gray-400 text-sm">No activity found in recent blocks.</div>
            ) : (
              <div className="space-y-2">
                {activities.map(item => (
                  <div key={item.hash} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.direction==='In' ? 'bg-green-600' : 'bg-red-600'}`}>
                        <span className="text-white text-xs">{item.direction === 'In' ? '+' : '-'}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{item.direction} {Number(item.valueEth).toLocaleString(undefined,{maximumFractionDigits:6})} ETH</div>
                        <div className="text-gray-400 text-xs break-all">{item.direction==='In' ? `from ${item.from}` : `to ${item.to}`}</div>
                      </div>
                    </div>
                    <a className="text-cyan-400 text-xs" href={`${(networks.find(n=>n.id===currentChainId)?.blockExplorer||'').replace(/\/$/,'')}/tx/${item.hash}`} target="_blank" rel="noreferrer">View</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <SendTransactionDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
      />


      <AccountMenu
        isOpen={showAccountMenu}
        onClose={() => setShowAccountMenu(false)}
      />

      <AccountsModal open={showAccountsModal} onOpenChange={setShowAccountsModal} />

      <HamburgerMenu
        isOpen={showHamburgerMenu}
        onClose={() => setShowHamburgerMenu(false)}
      />

      <NetworkManager
        isOpen={showNetworkManager}
        onClose={() => setShowNetworkManager(false)}
      />
    </div>
  )
}
