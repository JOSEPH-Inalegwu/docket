import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-[#6c47ff]">Statify</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#features" className="text-sm font-medium hover:text-[#6c47ff]">
            Home
          </Link>
          <Link href="/#features" className="text-sm font-medium hover:text-[#6c47ff]">
            How It Works
          </Link>
          <Link href="/#features" className="text-sm font-medium hover:text-[#6c47ff]">
            Features
          </Link>
          <Link href="/#pricing" className="text-sm font-medium hover:text-[#6c47ff]">
            Pricing
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-[#6c47ff]">
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium cursor-pointer hover:text-[#6c47ff]">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm h-10 px-5 hover:bg-[#5a3ad1]">
                Start Free Trial
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <button className="text-sm font-medium hover:text-[#6c47ff]">
                Dashboard
              </button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}