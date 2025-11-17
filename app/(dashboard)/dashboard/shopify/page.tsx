'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useConnection } from '@/hooks/use-connection'
import ConnectPrompt from '../connection/connection-prompt'
import { ShoppingBag, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ShopifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isConnected, isLoading, error, connectionData, refetch } = useConnection('shopify')
  
  const [showSuccess, setShowSuccess] = useState(false)
  const [shopDomain, setShopDomain] = useState('')

  // Debug log to see current state
  console.log('🛠️ ShopifyPage State:', {
    isConnected,
    isLoading,
    error,
    connectionData,
    showSuccess,
    shopDomain
  })

  // Check for successful connection from OAuth callback
  useEffect(() => {
    const connected = searchParams.get('connected')
    console.log('🔍 URL searchParams connected value:', connected)
    console.log('🔍 Full URL:', window.location.href)
    
    if (connected === 'true') {
      console.log('✅ OAuth connection successful - showing notification')
      setShowSuccess(true)
      
      // Force refetch to ensure connection status is updated
      console.log('🔄 Refetching connection status...')
      refetch().then(() => {
        console.log('✅ Connection status refetched')
      })
      
      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        console.log('🗑️ Hiding success notification')
        setShowSuccess(false)
      }, 5000)
      
      // Clean up URL but preserve other parameters if any
      console.log('🔄 Cleaning up URL parameters...')
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('connected')
      router.replace(newUrl.pathname + newUrl.search)
      console.log('✅ URL cleaned up')
      
      return () => clearTimeout(timer)
    } else {
      console.log('❌ No connected parameter found or value is not "true"')
    }
  }, [searchParams, refetch, router])

  const handleConnect = () => {
    if (!shopDomain) {
      alert('Please enter your Shopify store domain')
      return
    }

    // Validate shop domain format
    const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    
    if (!cleanDomain.includes('.myshopify.com')) {
      alert('Please enter a valid Shopify domain (e.g., mystore.myshopify.com)')
      return
    }

    console.log('🔄 Redirecting to OAuth with shop:', cleanDomain)
    
    // Redirect to OAuth initiation with shop parameter
    window.location.href = `/api/auth/oauth/shopify?shop=${encodeURIComponent(cleanDomain)}`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#6c47ff]" />
          <p className="text-gray-600 dark:text-gray-400">Checking connection status...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-[#6c47ff] text-white rounded-lg hover:bg-[#5a38e6]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Not connected - show connection prompt
  if (!isConnected) {
    return (
      <div className="p-6">
        {/* Success notification */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200 font-medium">
              Successfully connected to Shopify!
            </p>
          </div>
        )}

        {/* Shop domain input for Shopify */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <label className="block text-sm font-medium mb-2">
              Enter your Shopify store domain
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="mystore.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-[#6c47ff] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
              />
              <button
                onClick={handleConnect}
                disabled={!shopDomain}
                className="px-6 py-2 bg-[#6c47ff] hover:bg-[#5a38e6] disabled:bg-gray-300 dark:disabled:bg-gray-700
                  text-white font-semibold rounded-lg transition-all
                  disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Example: if your store is https://mystore.myshopify.com, enter "mystore.myshopify.com"
            </p>
          </div>
        </div>

        {/* Connection prompt */}
        <ConnectPrompt
          toolName="Shopify"
          toolIcon={ShoppingBag}
          toolColor="#95BF47"
          onConnect={handleConnect}
          docsUrl="https://help.shopify.com/en/api"
        />
      </div>
    )
  }

  // Connected - show dashboard
  return (
    <div className="p-6">
      {/* Success notification */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200 font-medium">
            Successfully connected to Shopify!
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[#95BF47]/20 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-[#95BF47]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Shopify Dashboard</h1>
            {connectionData?.shopDomain && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {connectionData.shopDomain}
              </p>
            )}
          </div>
        </div>
        {connectionData?.connectedAt && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Connected on {new Date(connectionData.connectedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Metrics Grid - Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: '0', change: '+0%' },
          { label: 'Revenue', value: '$0', change: '+0%' },
          { label: 'Products', value: '0', change: '+0%' },
          { label: 'Customers', value: '0', change: '+0%' },
        ].map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
            <p className="text-3xl font-bold mb-1">{metric.value}</p>
            <p className="text-sm text-green-600 dark:text-green-400">{metric.change}</p>
          </div>
        ))}
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          🚧 Metrics Coming Soon
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Your Shopify store is successfully connected! We're currently building the metrics dashboard.
          Soon you'll see real-time data for orders, products, revenue, and more.
        </p>
      </div>
    </div>
  )
}