import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-[#6c47ff]">Statify</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/dashboard" 
            className="text-sm font-medium text-gray-700 hover:text-[#6c47ff] transition-colors"
          >
            Overview
          </Link>
          <Link 
            href="/dashboard/analytics" 
            className="text-sm font-medium text-gray-700 hover:text-[#6c47ff] transition-colors"
          >
            Analytics
          </Link>
          <Link 
            href="/integrations" 
            className="text-sm font-medium text-gray-700 hover:text-[#6c47ff] transition-colors"
          >
            Integrations
          </Link>
          <Link 
            href="/settings" 
            className="text-sm font-medium text-gray-700 hover:text-[#6c47ff] transition-colors"
          >
            Settings
          </Link>
        </nav>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-12 h-12"
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}