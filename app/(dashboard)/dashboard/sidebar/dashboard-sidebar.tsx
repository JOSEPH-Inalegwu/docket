'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ToolList from './tool-list'
import MobileSidebarToggle from './mobile-sidebar-toggle'
import ConnectModal from '../connection/connect-modal'
import { Tool } from '@/lib/tools-config'

export default function DashboardSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [connectModalTool, setConnectModalTool] = useState<Tool | null>(null)
  const router = useRouter()

  const handleToolClick = (tool: Tool) => {
    setIsMobileOpen(false)
    
    if (!tool.isConnected) {
      // Show connection modal for unconnected tools
      setConnectModalTool(tool)
    } else {
      // Navigate to tool page for connected tools
      router.push(tool.href)
    }
  }

  const handleConnect = (toolId: string) => {
    // Close the modal
    setConnectModalTool(null)
    
    // Redirect to OAuth authorization endpoint
    // This will be handled by your API route
    window.location.href = `/api/auth/oauth/${toolId}`
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <MobileSidebarToggle onClick={() => setIsMobileOpen(true)} />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 
          transform border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950 
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">Integrations</h2>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="h-full overflow-y-auto p-4">
          <div className="mb-4 hidden lg:block">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Your Tools
            </h2>
          </div>
          
          <ToolList onToolClick={handleToolClick} />
        </div>
      </aside>

      {/* Connection Modal */}
      {connectModalTool && (
        <ConnectModal
          tool={connectModalTool}
          isOpen={!!connectModalTool}
          onClose={() => setConnectModalTool(null)}
          onConnect={handleConnect}
        />
      )}
    </>
  )
}