'use client'

import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Grid3X3,
  GitBranch,
  Shield,
  Settings
} from 'lucide-react'

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const router = useRouter()

  if (!isOpen) return null

  const menuItems = [
    {
      icon: Grid3X3,
      title: 'Account Details',
      onClick: () => {
        onClose()
        // Navigate to account details or open account menu
      }
    },
    {
      icon: GitBranch,
      title: 'Networks',
      onClick: () => {
        onClose()
        // Navigate to networks page
      }
    },
    {
      icon: Shield,
      title: 'All Permissions',
      onClick: () => {
        onClose()
        // Navigate to permissions page
      }
    },
    {
      icon: Settings,
      title: 'Settings',
      onClick: () => {
        onClose()
        router.push('/settings')
      }
    }
  ]

  return (
    <div className="fixed inset-0 bg-[#0D1117] text-white z-50">
      {/* Background gradient */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_right,_rgba(0,242,255,0.2)_0%,_transparent_70%)]"
        style={{ filter: 'blur(20px)' }}
      ></div>

      {/* Header */}
      <header className="flex items-center p-4 border-b border-gray-800 relative z-10">
        <button 
          onClick={onClose}
          className="p-2 mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      {/* Menu Items */}
      <main className="p-6 space-y-8 relative z-10">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex items-center gap-6 w-full text-left hover:bg-gray-800/30 p-4 rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-medium text-white">{item.title}</span>
          </button>
        ))}
      </main>
    </div>
  )
}