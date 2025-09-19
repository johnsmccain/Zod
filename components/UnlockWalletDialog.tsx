'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWallet } from '@/hooks/useWallet'
import toast from 'react-hot-toast'
import Image from 'next/image'
import od from '../public/od.png'
import shield from '../public/shield.png'

interface UnlockWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnlockWalletDialog({ open, onOpenChange }: UnlockWalletDialogProps) {
  const { unlock, isLoading, disconnect } = useWallet()
  const [password, setPassword] = useState('')

  const handleUnlock = async () => {
    if (!password) {
      toast.error('Please enter your password')
      return
    }

    try {
      const success = await unlock(password)
      if (success) {
        setPassword('')
        // Navigation will be handled by the parent component
      }
    } catch (error) {
      // Error is handled in the hook
      setPassword('')
    }
  }


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock()
    }
  }

  const handleUseAnotherWallet = () => {
    disconnect()
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-4 w-full flex flex-col items-center justify-center relative">
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)]"
        style={{ filter: 'blur(20px)' }}
      ></div>

      <div className="w-full max-w-sm space-y-8 z-10 relative">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <Image src={od} alt="Zod Wallet" width={80} height={80} />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Enter your password to unlock your wallet</p>
        </div>

        {/* Password Input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your wallet password"
              className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              autoFocus
            />
          </div>

          <Button
            onClick={handleUnlock}
            disabled={isLoading || !password}
            className="w-full bg-[#00F2FF] text-white text-lg py-3 rounded-lg"
          >
            {isLoading ? 'Unlocking...' : 'Unlock Wallet'}
          </Button>
        </div>

        {/* Security Info */}
        <div className="bg-gray-800 p-4 rounded-lg flex items-start">
          <Image src={shield} alt="Security Shield" className="w-5 h-5 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">Secure Access</h3>
            <p className="text-xs text-gray-400">
              Your wallet is encrypted and stored locally. Only you have access to your funds.
            </p>
          </div>
        </div>

        {/* Alternative Action */}
        <div className="text-center">
          <button
            onClick={handleUseAnotherWallet}
            className="text-cyan-400 hover:text-cyan-300 text-sm underline"
          >
            Use a different wallet
          </button>
        </div>
      </div>
    </div>
  )
}
