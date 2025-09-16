import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

interface ConfirmStepProps {
  mnemonic: string
  selectedWords: string[]
  setSelectedWords: (words: string[]) => void
  onComplete: () => void
}

export function ConfirmStep({ mnemonic, selectedWords, setSelectedWords, onComplete }: ConfirmStepProps) {
  const [verificationWords, setVerificationWords] = useState<{position: number, value: string}[]>([])
  const [inputValues, setInputValues] = useState<{[key: number]: string}>({})
  
  // Generate random positions to verify (typically 3-4 words)
  useEffect(() => {
    const words = mnemonic.split(' ')
    const positions = []
    const usedPositions = new Set()
    
    // Generate 4 random unique positions
    while (positions.length < 4 && positions.length < words.length) {
      const randomPos = Math.floor(Math.random() * words.length)
      if (!usedPositions.has(randomPos)) {
        positions.push({
          position: randomPos + 1, // 1-indexed for display
          value: words[randomPos]
        })
        usedPositions.add(randomPos)
      }
    }
    
    // Sort by position for display
    positions.sort((a, b) => a.position - b.position)
    setVerificationWords(positions)
    
    // Initialize input values
    const initialInputs: {[key: number]: string} = {}
    positions.forEach(word => {
      initialInputs[word.position] = ''
    })
    setInputValues(initialInputs)
  }, [mnemonic])

  const handleInputChange = (position: number, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [position]: value.toLowerCase().trim()
    }))
  }

  const isVerificationCorrect = () => {
    return verificationWords.every(word => 
      inputValues[word.position]?.toLowerCase() === word.value.toLowerCase()
    )
  }

  const handleVerify = () => {
    if (isVerificationCorrect()) {
      onComplete()
    } else {
      toast.error('Some words are incorrect. Please check and try again.')
      // Clear incorrect inputs
      const clearedInputs: {[key: number]: string} = {}
      verificationWords.forEach(word => {
        clearedInputs[word.position] = ''
      })
      setInputValues(clearedInputs)
    }
  }

  const allFieldsFilled = verificationWords.every(word => 
    inputValues[word.position]?.trim().length > 0
  )

  return (
    <div className=" flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold text-white">
            Verify Seed Phrase
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Please enter the words below to confirm you've saved them correctly
          </p>
        </div>

        {/* Word Input Fields */}
        <div className="space-y-4">
          {verificationWords.map((word) => (
            <div key={word.position} className="space-y-2">
              <label className="text-white font-medium text-sm">
                Word #{word.position}
              </label>
              <input
                type="text"
                value={inputValues[word.position] || ''}
                onChange={(e) => handleInputChange(word.position, e.target.value)}
                placeholder={`Enter word #${word.position}`}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                autoComplete="off"
              />
            </div>
          ))}
        </div>

        {/* Verify Button */}
        <Button
          onClick={handleVerify}
          disabled={!allFieldsFilled}
          className="w-full bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-semibold py-4 rounded-lg text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify & Continue
        </Button>
      </div>
    </div>
  )
}