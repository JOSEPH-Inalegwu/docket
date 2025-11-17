'use client'

import { X } from 'lucide-react'
import { Tool } from '@/lib/tools-config'
import ConnectPrompt from './connection-prompt'

interface ConnectModalProps {
  tool: Tool
  isOpen: boolean
  onClose: () => void
  onConnect: (toolId: string) => void
}

export default function ConnectModal({ tool, isOpen, onClose, onConnect }: ConnectModalProps) {
  if (!isOpen) return null

  const handleConnect = () => {
    onConnect(tool.id)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold">Connect Integration</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <ConnectPrompt
              toolName={tool.name}
              toolIcon={tool.icon}
              toolColor={tool.color}
              onConnect={handleConnect}
              docsUrl={getDocsUrl(tool.id)}
            />
          </div>
        </div>
      </div>
    </>
  )
}

// Helper function to get docs URL for each tool
function getDocsUrl(toolId: string): string {
  const docsUrls: Record<string, string> = {
    shopify: 'https://shopify.dev/docs/apps/auth/oauth',
    amazon: 'https://developer-docs.amazon.com/sp-api/docs/authorizing-selling-partner-api-applications',
    woocommerce: 'https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication',
    stripe: 'https://stripe.com/docs/connect/oauth-reference'
  }
  return docsUrls[toolId] || '#'
}