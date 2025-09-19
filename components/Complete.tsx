'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import green from '../public/green.png'

export default function Complete() {
  const router = useRouter()

  const handleContinue = () => {
    console.log('Navigating to dashboard')
    router.push('/dashboard')
  }

  console.log('Complete component rendered')

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <Image src={green} alt="Success" className="w-16 h-16" />
        </div>
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-semibold text-white">
            Wallet Created
          </h1>
          <h2 className="text-2xl font-semibold text-white">
            Successfully!
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed px-4">
            Your Zod Wallet is ready to use. Keep your seed phrase secure.
          </p>
        </div>
        <div className="bg-gray-800 border border-[#C5F25A] rounded-lg p-4 space-y-2">
          <h3 className="text-[#C5F25A] font-medium text-sm">
            Security Reminder
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Your seed phrase is the only way to recover your wallet. Store it in a safe place and never share it with anyone.
          </p>
        </div>
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