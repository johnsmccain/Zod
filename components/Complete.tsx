import React from 'react'
import { Check } from 'lucide-react'

export default function Complete() {
  const handleContinue = () => {
    // Handle navigation to wallet or next step
    console.log('Continue to wallet')
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold text-white">
            Wallet Created
          </h1>
          <h2 className="text-2xl font-semibold text-white">
            Successfully!
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed px-4">
            Your Zen Wallet is ready to use. Keep your seed phrase secure.
          </p>
        </div>

        {/* Security Reminder */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
          <h3 className="text-white font-medium text-sm">
            Security Reminder
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Your seed phrase is the only way to recover your wallet. Store it in a safe place and never share it with anyone.
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-semibold py-4 rounded-lg text-base transition-colors"
        >
          Continue to Wallet
        </button>
      </div>
    </div>
  )
}