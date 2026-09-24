'use client'

import { useState } from 'react'

export default function PoojaImpactTracker() {
  const [phone, setPhone] = useState('')

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Impact tracking feature is being connected! Your household contributions are safe.')
  }

  return (
    <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter 10-digit mobile number"
        className="flex-1 bg-black border border-gray-800 rounded-xl px-5 py-4 text-white focus:border-[#FFB300] outline-none text-center sm:text-left text-sm"
      />
      <button
        type="submit"
        className="bg-[#FFB300] text-black font-extrabold px-6 py-4 rounded-xl hover:bg-[#FFCA28] transition-colors whitespace-nowrap uppercase text-sm tracking-wider"
      >
        Check Impact
      </button>
    </form>
  )
}