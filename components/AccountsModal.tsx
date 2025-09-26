'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWalletStore } from '@/stores/walletStore'
import { Copy, MoreVertical, Plus, Search } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { AddAccountModal } from './AddAccountModal'
import toast from 'react-hot-toast'

interface AccountsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountsModal({ open, onOpenChange }: AccountsModalProps) {
  const { accounts, currentAccount, switchAccount, accountNames, setAccountName } = useWalletStore((s) => ({
    accounts: s.accounts,
    currentAccount: s.currentAccount,
    switchAccount: s.switchAccount,
    accountNames: s.accountNames,
    setAccountName: s.setAccountName,
  }))
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter(a => a.address.toLowerCase().includes(q))
  }, [query, accounts])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied')
  }

  if (showAdd) {
    return (
      <AddAccountModal
        open={true}
        onOpenChange={(o) => {
          if (!o) {
            setShowAdd(false)
            onOpenChange(true)
          }
        }}
        onDone={() => {
          setShowAdd(false)
          onOpenChange(false)
        }}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#0D1117]">
        <DialogHeader className="p-4 border-b border-gray-800">
          <DialogTitle>Accounts</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-500"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-auto">
            {filtered.map((acc) => (
              <div key={acc.address} className={`flex items-center justify-between p-3 rounded-lg ${currentAccount?.address === acc.address ? 'bg-gray-800/60' : 'bg-gray-800/30'}`}>
                <button
                  onClick={() => { switchAccount(acc.address); onOpenChange(false) }}
                  className="text-left flex items-center gap-3 flex-1"
                >
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-400 to-red-500" />
                  <div>
                    <div className="font-medium">{accountNames[acc.address] || `Account ${accounts.findIndex(a => a.address === acc.address) + 1}`}</div>
                    <div className="text-xs text-gray-400">0x{acc.address.slice(2,8)}...{acc.address.slice(-6)}</div>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <button onClick={() => copy(acc.address)} className="p-1 hover:bg-gray-800 rounded" title="Copy address">
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="p-1" aria-label="More actions">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content className="min-w-[160px] bg-[#0E141B] border border-gray-700 rounded-md p-1 shadow-xl">
                      <DropdownMenu.Item className="px-3 py-2 text-sm text-white hover:bg-gray-800 rounded-md cursor-pointer"
                        onClick={() => {
                          const current = accountNames[acc.address] || `Account ${accounts.findIndex(a => a.address === acc.address) + 1}`
                          const name = window.prompt('Set account name', current)
                          if (name && name.trim()) setAccountName(acc.address, name.trim())
                        }}
                      >
                        Rename
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">No accounts found</div>
            )}
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="w-full bg-transparent border-2 border-cyan-400 text-cyan-400 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-cyan-400/10 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add account or wallet
          </button>
        </div>
      </DialogContent>

      <AddAccountModal open={showAdd} onOpenChange={setShowAdd} onDone={() => onOpenChange(false)} />
    </Dialog>
  )
}
