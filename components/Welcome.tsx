import React from 'react'
import welcome from '../public/Bitcoin2.png'
import Image from 'next/image'
import od from '../public/od.png'

const Welcome = () => {
  return (
    <div className="relative w-full h-screen">
      {/* Welcome image with #0D1117 background */}
      <div className="absolute inset-0" style={{ backgroundColor: '#0D1117' }}>
        <Image src={welcome} alt="Welcome" className="w-full h-full object-cover opacity-60" />
      </div>
      {/* Gradient circles using pseudo-elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-64 h-64 bg-blue-400 rounded-full opacity-20 -top-20 -left-20" style={{ filter: 'blur(40px)' }}></div>
        <div className="absolute w-72 h-72 bg-purple-400 rounded-full opacity-15 -bottom-24 -right-24" style={{ filter: 'blur(40px)' }}></div>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <Image src={od} alt="od" className="mx-auto mb-4" width={120} height={120} />
        <h2 className="text-4xl font-bold text-white">Zod Wallet</h2>
      </div>
    </div>
  )
}

export default Welcome