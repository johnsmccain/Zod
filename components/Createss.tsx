'use client'

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
  const [verificationWords, setVerificationWords] = useState<{ position: number; value: string }[]>([])
  const [inputValues, setInputValues] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    if (!mnemonic) {
      console.error('Mnemonic is empty')
      toast.error('No mnemonic provided')
      return
    }
    console.log('Mnemonic received:', mnemonic)
    const words = mnemonic.split(' ').filter(word => word.trim())
    console.log('Split words:', words)
    const positions: { position: number; value: string }[] = []
    const usedPositions = new Set()

    while (positions.length < 4 && positions.length < words.length) {
      const randomPos = Math.floor(Math.random() * words.length)
      if (!usedPositions.has(randomPos)) {
        positions.push({
          position: randomPos + 1,
          value: words[randomPos].trim(),
        })
        usedPositions.add(randomPos)
      }
    }

    positions.sort((a, b) => a.position - b.position)
    setVerificationWords(positions)

    const initialInputs: { [key: number]: string } = {}
    positions.forEach(word => {
      initialInputs[word.position] = ''
    })
    setInputValues(initialInputs)
    console.log('Verification words:', positions)
  }, [mnemonic])

  const handleInputChange = (position: number, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [position]: value.trim(),
    }))
    console.log('Input values:', { ...inputValues, [position]: value.trim() })
  }

  const isVerificationCorrect = () => {
    let allCorrect = true
    verificationWords.forEach(word => {
      const input = (inputValues[word.position] || '').trim().toLowerCase()
      // Optional: Normalize spaces to hyphens (comment out if strict matching is required)
      // const normalizedInput = input.replace(/\s+/g, '-')
      const expected = word.value.toLowerCase()
      console.log(`Word #${word.position}: input="${input}", expected="${expected}"`)
      if (input !== expected) {
        allCorrect = false
        toast.error(`Word #${word.position} is incorrect. Expected: ${expected}`)
      }
    })
    return allCorrect
  }

  const handleVerify = () => {
    console.log('handleVerify called')
    if (isVerificationCorrect()) {
      console.log('Verification passed, calling onComplete')
      setSelectedWords(verificationWords.map(word => word.value))
      onComplete()
    } else {
      console.log('Verification failed')
      const clearedInputs: { [key: number]: string } = {}
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
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-gray-400 text-sm">
          <p>Debug (remove in production):</p>
          {verificationWords.map(word => (
            <p key={word.position}>Word #{word.position}: {word.value}</p>
          ))}
        </div>
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold text-white">
            Verify Seed Phrase
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Enter the words below exactly as shown in the mnemonic (include hyphens, e.g., test-word-1).
          </p>
        </div>
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