'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { Bell } from 'lucide-react'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useEffect, useState } from 'react'

export default function DashboardNavbar() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <header className="h-16 w-full" />
  }

  const logoSrc = theme === 'dark' ? '/docket-outline.svg' : '/docket.svg'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src={logoSrc}
            alt="Docket Logo"
            width={32}
            height={32}
          />
          <span className="text-2xl font-bold text-[#6c47ff] dark:text-white">Docket</span>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Icon */}
          <button 
            className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-[#6c47ff] dark:hover:text-[#6c47ff] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile */}
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      </div>
    </header>
  )
}
