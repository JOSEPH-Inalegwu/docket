'use client'

import { Menu } from 'lucide-react'

interface MobileSidebarToggleProps {
  onClick: () => void
}

export default function MobileSidebarToggle({ onClick }: MobileSidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-[#6c47ff] text-white shadow-lg hover:bg-[#5a38e6] transition-colors lg:hidden"
      aria-label="Open sidebar"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}