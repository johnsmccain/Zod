'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/hooks/useWallet'
import { MnemonicStep } from '../components/MnemonicStep'
import { ConfirmStep } from '../components/Createss'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import Image from 'next/image'
import row from '../public/bck.png'
import shield from '../public/shield.png'
import Complete from './Complete'

interface CreateWalletDialogProps {
  onComplete: () => void
}

export function CreateWalletDialog({ onComplete: onDialogComplete }: CreateWalletDialogProps) {
  const router = useRouter()
  const { createWallet, isLoading } = useWallet()
  const [step, setStep] = useState<'password' | 'mnemonic' | 'confirm' | 'complete'>('password')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [selectedWords, setSelectedWords] = useState<string[]>([])

  useEffect(() => {
    console.log('Current step:', step)
  }, [step])

  const handleCreateWallet = async () => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      const result = await createWallet(password)
      if (result && result.mnemonic) {
        setMnemonic(result.mnemonic)
        setStep('mnemonic')
        console.log('Wallet created successfully with mnemonic')
      } else {
        throw new Error('No mnemonic returned from wallet creation')
      }
    } catch (error) {
      toast.error('Failed to create wallet')
      console.error('Create wallet error:', error)
    }
  }

  const resetFlow = () => {
    setStep('password')
    setPassword('')
    setConfirmPassword('')
    setMnemonic('')
    setSelectedWords([])
    onDialogComplete()
  }

  const getStepNumber = () => {
    switch (step) {
      case 'password':
        return 1
      case 'mnemonic':
        return 2
      case 'confirm':
        return 3
      case 'complete':
        return 4
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0D1117] text-white p-4 w-full flex flex-col relative"
      style={{
        background: 'linear-gradient(to right, #0D1117 70%)',
        position: 'relative',
      }}
    >
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)]"
        style={{ filter: 'blur(20px)' }}
      ></div>

      <header className="p-4 border-b border-gray-800 mt-8 z-10 relative">
        <div className="flex items-center justify-center mb-8">
          <button
            onClick={resetFlow}
            className="text-cyan-400 hover:text-cyan-300"
          >
            <Image src={row} alt="Back" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold">Create Wallet</h1>
            <div className="text-sm text-gray-400">Step {getStepNumber()} of 4</div>
          </div>
          <div className="w-6"></div>
        </div>
        <div className="w-full bg-gray-700 h-4 mt-2 rounded-full overflow-hidden z-10 relative">
          <div
            className="bg-cyan-400 h-4"
            style={{ width: step === 'password' ? '25%' : step === 'mnemonic' ? '50%' : step === 'confirm' ? '75%' : '100%' }}
          ></div>
        </div>
      </header>

      <main className="p-6 space-y-6 overflow-auto h-[calc(100vh-64px)] z-10 relative">
        {step === 'password' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-cyan-400">Secure Your Wallet</h2>
              <p className="text-gray-400">Create a strong password to protect your wallet.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Enter password (min 8 characters)</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 mt-1"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-500 mt-1"
                  placeholder="Confirm password"
                />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-start justify-between">
              <div className="flex items-start">
                <Image src={shield} alt="Security Shield" className="w-6 h-6 mr-3 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-200">Security Tips:</h3>
                  <ul className="text-sm text-gray-400 list-disc pl-4 mt-1">
                    <li>Use a mix of letters, numbers, and symbols.</li>
                    <li>Don’t use personal information.</li>
                    <li>Make it unique to this wallet.</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button
              onClick={handleCreateWallet}
              disabled={isLoading || !password || !confirmPassword}
              className="w-full bg-[#00F2FF] text-white text-lg py-3 rounded-lg z-10 relative"
            >
              {isLoading ? 'Creating...' : 'Continue'}
            </Button>
          </div>
        )}

        {step === 'mnemonic' && (
          <MnemonicStep
            mnemonic={mnemonic}
            setStep={setStep}
          />
        )}

        {step === 'confirm' && (
          <ConfirmStep
            mnemonic={mnemonic}
            selectedWords={selectedWords}
            setSelectedWords={setSelectedWords}
            onComplete={() => {
              console.log('onComplete called, transitioning to complete step')
              setStep('complete')
            }}
          />
        )}

        {step === 'complete' && (
          <Complete />
        )}
      </main>
    </div>
  )
}