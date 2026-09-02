'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [logo, setLogo] = useState('/logo.png')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gold-500/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src={logo} alt="Sampige Logo" className="h-10 w-auto" />
            <span className="text-gold-500 font-bold text-xl hidden sm:block">SAMPIGE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-gold-500 transition-colors">Home</Link>
            <Link href="/about-us" className="text-gray-300 hover:text-gold-500 transition-colors">About</Link>
            <Link href="/projects" className="text-gray-300 hover:text-gold-500 transition-colors">Projects</Link>
            <Link href="/gallery" className="text-gray-300 hover:text-gold-500 transition-colors">Gallery</Link>
            <Link href="/news" className="text-gray-300 hover:text-gold-500 transition-colors">News</Link>
            <Link href="/contact" className="text-gray-300 hover:text-gold-500 transition-colors">Contact</Link>
            <Link 
              href="/get-involved/donate" 
              className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-colors"
            >
              Donate
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <nav className="md:hidden py-4 border-t border-gold-500/10 flex flex-col gap-4">
            <Link href="/" className="text-gray-300 hover:text-gold-500 transition-colors">Home</Link>
            <Link href="/about-us" className="text-gray-300 hover:text-gold-500 transition-colors">About</Link>
            <Link href="/projects" className="text-gray-300 hover:text-gold-500 transition-colors">Projects</Link>
            <Link href="/gallery" className="text-gray-300 hover:text-gold-500 transition-colors">Gallery</Link>
            <Link href="/news" className="text-gray-300 hover:text-gold-500 transition-colors">News</Link>
            <Link href="/contact" className="text-gray-300 hover:text-gold-500 transition-colors">Contact</Link>
            <Link 
              href="/get-involved/donate" 
              className="px-4 py-2 bg-gold-500 text-black font-semibold rounded-full hover:bg-gold-600 transition-colors text-center"
            >
              Donate
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}