'use client';

import { useState } from 'react'
import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-[#6c47ff]">Statify</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#home" className="text-sm font-medium hover:text-[#6c47ff]">
            Home
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium hover:text-[#6c47ff]">
            How It Works
          </Link>
          <Link href="/#features" className="text-sm font-medium hover:text-[#6c47ff]">
            Features
          </Link>
          <Link href="/#faq" className="text-sm font-medium hover:text-[#6c47ff]">
            FAQ
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-5">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium cursor-pointer hover:text-[#6c47ff]">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-5 hover:bg-[#5a3ad1]">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-700 hover:text-[#6c47ff]"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden border-t bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <Link href="/#home" className="text-sm font-medium hover:text-[#6c47ff] py-2" onClick={closeMenu}>
            Home
          </Link>
          <Link href="/#how-it-works" className="text-sm font-medium hover:text-[#6c47ff] py-2" onClick={closeMenu}>
            How It Works
          </Link>
          <Link href="/#features" className="text-sm font-medium hover:text-[#6c47ff] py-2" onClick={closeMenu}>
            Features
          </Link>
          <Link href="/#faq" className="text-sm font-medium hover:text-[#6c47ff] py-2" onClick={closeMenu}>
            FAQ
          </Link>

          {/* Mobile Auth Buttons */}
          <SignedOut>
            <div className="pt-4 border-t space-y-4">
              <SignInButton mode="modal">
                <button className="w-full text-sm font-medium cursor-pointer hover:text-[#6c47ff] py-2 text-left">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="w-full bg-[#6c47ff] text-white rounded-full font-medium text-sm h-12 px-5 hover:bg-[#5a3ad1]">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </nav>
      </div>
    </header>
  )
}
