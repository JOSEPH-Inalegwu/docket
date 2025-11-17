'use client'

import { useState } from 'react'
import { ExternalLink, Loader2, Shield, CheckCircle } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

interface ConnectPromptProps {
  toolName: string
  toolIcon: LucideIcon
  toolColor: string
  onConnect: () => void
  docsUrl?: string
}

export default function ConnectPrompt({
  toolName,
  toolIcon: Icon,
  toolColor,
  onConnect,
  docsUrl
}: ConnectPromptProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = () => {
    setIsConnecting(true)
    onConnect()
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div 
          className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: toolColor + '20' }}
        >
          <Icon className="w-10 h-10" style={{ color: toolColor }} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Connect {toolName}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Securely connect your {toolName} account to start tracking your metrics
        </p>
      </div>

      {/* Connection Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 text-green-600 dark:text-green-400">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">Secure OAuth Connection</span>
        </div>

        {/* Benefits List */}
        <div className="space-y-3 mb-8">
          {[
            'No API keys needed - authenticate directly with your account',
            'Secure authorization - we never see your password',
            'Easy revocation - disconnect anytime from your settings',
            'Real-time sync - automatic updates from your store'
          ].map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300">{benefit}</p>
            </div>
          ))}
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full py-4 px-6 bg-[#6c47ff] hover:bg-[#5a38e6] disabled:bg-gray-300 dark:disabled:bg-gray-700
            text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02]
            flex items-center justify-center gap-3
            disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
          style={{
            backgroundColor: !isConnecting ? toolColor : undefined
          }}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirecting to {toolName}...
            </>
          ) : (
            <>
              <Icon className="w-5 h-5" />
              Connect with {toolName}
            </>
          )}
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          By connecting, you agree to share your {toolName} data with Docket. 
          You can revoke access anytime.
        </p>
      </div>
    </div>
  )
}