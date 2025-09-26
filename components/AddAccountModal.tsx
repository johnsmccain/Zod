'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { CreateEthAccountModal } from './CreateEthAccountModal'
import { useWalletStore } from '@/stores/walletStore'

interface AddAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}

export function AddAccountModal({ open, onOpenChange, onDone }: AddAccountModalProps) {
  const { importFromMnemonic, importFromPrivateKey, isLoading } = useWallet()
  const [mode, setMode] = useState<'menu' | 'seed' | 'pk' | 'create-eth'>('menu')
  const [password, setPassword] = useState('')
  const [seed, setSeed] = useState('')
  const [pkey, setPkey] = useState('')
  const [seedName, setSeedName] = useState('')
  const [pkName, setPkName] = useState('')
  const setAccountName = useWalletStore(s => s.setAccountName)

  const onCreate = () => {
    toast.error('Create new derived account: coming soon')
  }

  const onImportSeed = async () => {
    const words = seed.trim().split(/\s+/).filter(Boolean)
    if (!(words.length === 12 || words.length === 24)) {
      toast.error('Enter a valid 12/24 word phrase')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    const acc = await importFromMnemonic(seed.trim(), password)
    if (acc?.address && seedName.trim()) setAccountName(acc.address, seedName.trim())
    onOpenChange(false)
    onDone?.()
  }

  const onImportPk = async () => {
    let pk = pkey.replace(/\s+/g, '').toLowerCase()
    // Allow with or without 0x
    if (!pk.startsWith('0x')) pk = '0x' + pk
    if (!/^0x[0-9a-fA-F]{64}$/.test(pk)) {
      toast.error('Invalid private key. Expected 64 hex characters (with or without 0x).')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    const acc = await importFromPrivateKey(pk, password)
    if (acc?.address && pkName.trim()) setAccountName(acc.address, pkName.trim())
    onOpenChange(false)
    onDone?.()
  }

  if (mode === 'create-eth') {
    return (
      <CreateEthAccountModal
        open={true}
        onBack={() => setMode('menu')}
        onDone={() => onOpenChange(false)}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#0D1117]">
        <DialogHeader className="relative">
          {mode !== 'menu' && (
            <button onClick={() => setMode('menu')} className="absolute left-0 top-0 p-2" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <DialogTitle className="text-center">Add account</DialogTitle>
        </DialogHeader>

        {mode === 'menu' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Create a new account</div>
              <button className="text-cyan-400 font-medium" onClick={() => setMode('create-eth')}>+ Ethereum account</button>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Import a wallet or account</div>
              <button className="text-cyan-400 font-medium" onClick={() => setMode('seed')}>Secret Recovery Phrase</button>
              <button className="text-cyan-400 font-medium block" onClick={() => setMode('pk')}>Private Key</button>
            </div>
          </div>
        )}

        {mode === 'seed' && (
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-gray-400">Account name</label>
              <Input value={seedName} onChange={(e) => setSeedName(e.target.value)} placeholder="e.g. Savings" />
            </div>
            <div>
              <label className="text-sm text-gray-400">Recovery Phrase</label>
              <textarea
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="mt-1 w-full h-28 rounded-lg border border-gray-800 bg-[#0B1116] px-3 py-3 text-sm"
                placeholder="Enter 12 or 24 words"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a password" />
            </div>
            <Button className="w-full" disabled={isLoading} onClick={onImportSeed}>{isLoading ? 'Importing...' : 'Import'}</Button>
          </div>
        )}

        {mode === 'pk' && (
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-gray-400">Account name</label>
              <Input value={pkName} onChange={(e) => setPkName(e.target.value)} placeholder="e.g. Trading" />
            </div>
            <div>
              <label className="text-sm text-gray-400">Private Key</label>
              <textarea
                value={pkey}
                onChange={(e) => setPkey(e.target.value)}
                className="mt-1 w-full h-24 rounded-lg border border-gray-800 bg-[#0B1116] px-3 py-3 text-sm"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a password" />
            </div>
            <Button className="w-full" disabled={isLoading} onClick={onImportPk}>{isLoading ? 'Importing...' : 'Import'}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
