'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useWallet } from '@/hooks/useWallet'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWalletDialog({ open, onOpenChange }: CreateWalletDialogProps) {
  const { createWallet, isLoading } = useWallet()
  const [step, setStep] = useState<'password' | 'mnemonic' | 'confirm'>('password')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

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
      console.log(result)
      setMnemonic(result.mnemonic)
      setStep('mnemonic')
    } catch (error) {
      // Error is handled in the hook
    }
  }

  const copyMnemonic = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic)
      setCopied(true)
      toast.success('Mnemonic copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy mnemonic')
    }
  }

  const confirmMnemonic = () => {
    setStep('confirm')
    const words = mnemonic.split(' ')
    // Shuffle words for confirmation
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    setSelectedWords(shuffled)
  }

  const selectWord = (word: string) => {
    const currentSelection = selectedWords.slice(0, mnemonic.split(' ').length)
    if (currentSelection.length < mnemonic.split(' ').length) {
      setSelectedWords([...currentSelection, word])
    }
  }

  const isConfirmationCorrect = () => {
    const originalWords = mnemonic.split(' ')
    const currentSelection = selectedWords.slice(0, originalWords.length)
    return originalWords.every((word, index) => word === currentSelection[index])
  }

  const handleComplete = () => {
    if (isConfirmationCorrect()) {
      toast.success('Wallet created successfully!')
      onOpenChange(false)
      // Reset form
      setStep('password')
      setPassword('')
      setConfirmPassword('')
      setMnemonic('')
      setSelectedWords([])
    } else {
      toast.error('Incorrect word order. Please try again.')
      setSelectedWords([])
    }
  }

  const resetDialog = () => {
    setStep('password')
    setPassword('')
    setConfirmPassword('')
    setMnemonic('')
    setSelectedWords([])
    setCopied(false)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) resetDialog()
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Wallet</DialogTitle>
          <DialogDescription>
            {step === 'password' && 'Set a secure password to protect your wallet'}
            {step === 'mnemonic' && 'Save your recovery phrase in a secure location'}
            {step === 'confirm' && 'Confirm your recovery phrase by selecting words in order'}
          </DialogDescription>
        </DialogHeader>

        {step === 'password' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
            <Button 
              onClick={handleCreateWallet} 
              disabled={isLoading || !password || !confirmPassword}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create Wallet'}
            </Button>
          </div>
        )}

        {step === 'mnemonic' && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Your Recovery Phrase</p>
              <p className="text-sm text-muted-foreground mb-3">
                Write down these 12 words in the exact order shown. Store them in a secure location.
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {mnemonic.split(' ').map((word, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="font-mono">{word}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={copyMnemonic}
              className="w-full"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button onClick={confirmMnemonic} className="w-full">
              I've Saved My Recovery Phrase
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Select words in the correct order:</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {selectedWords.slice(0, mnemonic.split(' ').length).map((word, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm text-center">
                    {index + 1}. {word}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {selectedWords.map((word, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => selectWord(word)}
                  disabled={selectedWords.slice(0, mnemonic.split(' ').length).includes(word)}
                >
                  {word}
                </Button>
              ))}
            </div>
            <Button 
              onClick={handleComplete}
              disabled={!isConfirmationCorrect()}
              className="w-full"
            >
              Complete Setup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
