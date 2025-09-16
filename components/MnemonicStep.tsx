import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface MnemonicStepProps {
  mnemonic: string
  setStep: (step: 'password' | 'mnemonic' | 'confirm') => void
}

export function MnemonicStep({ mnemonic, setStep }: MnemonicStepProps) {
  const [copied, setCopied] = useState(false)

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
  }

  // Split mnemonic into 12 words array
  const words = mnemonic.split(' ').slice(0, 12);

  return (
    <div className="space-y-6  ">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-cyan-400 sm:text-2xl">Backup Seed Phrase</h2>
        <p className="text-gray-400 sm:text-base text-sm">Write down these 12 words in order.</p>
      </div>

      {/* Critical Security Warning */}
      <div className="bg-red-900/20 border border-red-600/30 p-3 sm:p-4 rounded-lg">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 mt-1">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm font-bold">!</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-400 sm:text-base mb-1">Critical Security Warning</h3>
            <p className="text-sm text-red-300 sm:text-base">
              Never share your seed phrase with anyone. Anyone with these words can access your funds. Store them securely offline.
            </p>
          </div>
        </div>
      </div>

      {/* Words Grid - 2 columns on mobile, 6 on desktop */}
      <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 text-sm">
          {words.map((word, index) => (
            <div
              key={index}
              className="bg-gray-900 border border-gray-600 rounded px-2 py-1 sm:px-3 sm:py-2 text-center text-white font-mono text-xs sm:text-sm"
            >
              {index + 1}. {word}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={copyMnemonic}
          className="w-full bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white text-sm py-2 sm:py-3"
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
        
        <Button
          onClick={confirmMnemonic}
          className="w-full bg-[#00F2FF] hover:bg-cyan-500 text-white text-lg py-2 sm:py-3 rounded-lg font-medium"
        >
          I've written down
          
        </Button>
      </div>
    </div>
  )
}