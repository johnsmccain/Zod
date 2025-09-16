'use client'

import { Button } from '@/components/ui/button'
import { Shield, Settings, Zap } from 'lucide-react'
import { Dispatch, SetStateAction } from 'react'
import Image from 'next/image'
import od from '../public/od.png'

interface WelcomeSectionProps {
  setShowCreateDialog: Dispatch<SetStateAction<boolean>>
  setShowImportDialog: Dispatch<SetStateAction<boolean>>
}

export default function WelcomeSection({ setShowCreateDialog, setShowImportDialog }: WelcomeSectionProps) {
  return (
    <div className="bg-[#0D1117] min-h-screen flex flex-col items-center justify-center w-full px-4 relative">
      
      <div className="flex flex-col items-center space-y-8 w-full max-w-sm z-10">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <Image src={od} alt="od" className="mx-auto" width={100} height={100} />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome to</h1>
          <h2 className="text-3xl font-bold text-white">Zod Wallet</h2>
          <p className="text-gray-400 text-base">Your most secure wallet</p>
        </div>

        {/* Features */}
        <div className="space-y-6 w-full">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-cyan-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Secure by Design</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Your keys, your crypto. Advanced encryption protects your assets.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-cyan-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Settings className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Full Control</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Non-custodial wallet gives you complete control of your funds.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-cyan-400/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">Lightning Fast</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Quick transactions across multiple blockchain networks.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full pt-4">
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="w-full bg-cyan-400 hover:bg-cyan-500 text-gray-900 font-semibold py-4 rounded-lg text-base transition-colors"
          >
            Create New Wallet
          </Button>
          <Button 
            onClick={() => setShowImportDialog(true)}
            className="w-full bg-transparent hover:bg-gray-800/50 text-cyan-400 font-semibold py-4 rounded-lg border-2 border-gray-700 hover:border-gray-600 text-base transition-colors"
          >
            Import existing Wallet
          </Button>
        </div>
      </div>
    </div>
  )
}