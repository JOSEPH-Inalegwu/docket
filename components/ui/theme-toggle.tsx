'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9" /> 
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#6c47ff] dark:hover:text-[#6c47ff] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
            theme === 'light' 
              ? 'rotate-0 opacity-100' 
              : 'rotate-90 opacity-0'
          }`}
        />
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
            theme === 'dark' 
              ? 'rotate-0 opacity-100' 
              : '-rotate-90 opacity-0'
          }`}
        />
      </div>
    </button>
  )
}