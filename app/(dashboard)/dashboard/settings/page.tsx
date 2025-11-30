'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Bell, Loader2, Link as LinkIcon, ShoppingBag, X, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [threshold, setThreshold] = useState(10)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [connections, setConnections] = useState<any[]>([])
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [platformToDisconnect, setPlatformToDisconnect] = useState<string | null>(null)

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setThreshold(data.settings.default_low_stock_threshold)
            setNotificationsEnabled(data.settings.notifications_enabled)
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchConnections = async () => {
      try {
        const providers = [
          {
            id: 'shopify',
            name: 'Shopify',
            icon: ShoppingBag,
          },
          {
            id: 'stripe',
            name: 'Stripe',
            icon: LinkIcon,
          },
        ]

        const results = await Promise.all(
          providers.map(async (p) => {
            if (p.id === 'shopify') {
              const res = await fetch('/api/connections/shopify')
              if (!res.ok) return null

              const data = await res.json()

              if (!data.connected || !data.connection) return null

              const conn = data.connection
              return {
                id: p.id,
                name: p.name,
                icon: p.icon,
                connectedAt: conn.connected_at,
                shopDomain: conn.shop_domain,
              }
            }

            const res = await fetch(`/api/connections/${p.id}`)
            if (!res.ok) return null

            const data = await res.json()

            if (!data.isConnected) return null

            const shopDomain =
              p.id === 'stripe'
                ? data.metadata?.stripeUserId ?? null
                : data.shopDomain

            return {
              id: p.id,
              name: p.name,
              icon: p.icon,
              connectedAt: data.connectedAt,
              shopDomain,
            }
          })
        )

        setConnections(results.filter((c): c is NonNullable<typeof c> => c !== null))
      } catch (error) {
        console.error('Error fetching connections:', error)
      }
    }

    if (user) {
      fetchSettings()
      fetchConnections()
    }
  }, [user])

  const openDisconnectModal = (platformId: string) => {
    setPlatformToDisconnect(platformId)
    setShowDisconnectModal(true)
  }

  const closeDisconnectModal = () => {
    if (isDisconnecting) return 
    setShowDisconnectModal(false)
    setPlatformToDisconnect(null)
  }

  const confirmDisconnect = async () => {
    if (!platformToDisconnect) return

    setIsDisconnecting(platformToDisconnect)

    try {
      const res = await fetch(`/api/connections/${platformToDisconnect}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setConnections(connections.filter(c => c.id !== platformToDisconnect))
        toast.success('Disconnected successfully', {
          description: 'Your integration has been removed.',
        })
        closeDisconnectModal()

        router.push('/dashboard')
        router.refresh()
      } else {
        const data = await res.json()
        toast.error('Failed to disconnect', {
          description: data.error || 'Please try again.',
        })
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast.error('Error disconnecting', {
        description: 'Please check your connection and try again.',
      })
    } finally {
      setIsDisconnecting(null)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_low_stock_threshold: threshold,
          notifications_enabled: notificationsEnabled,
        }),
      })

      if (res.ok) {
        toast.success('Settings saved!', {
          description: 'Your notification preferences have been updated.',
        })
      } else {
        const data = await res.json()
        toast.error('Failed to save settings', {
          description: data.error || 'Please try again.',
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error saving settings', {
        description: 'Please check your connection and try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="space-y-2 mb-8">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <>
      <div className="space-y-12">
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your notification preferences and alerts
          </p>
        </div>

        {/* Notifications Settings Section */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Notifications</h2>
          
          <div className="p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 transition-all">
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#6c47ff20' }}
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#6c47ff]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold">Low Stock Alerts</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Get notified when products are running low
                  </p>
                </div>
              </div>

              {/* Enable Notifications Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-medium">Enable Notifications</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Receive alerts when product stock is low
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6c47ff]/20 dark:peer-focus:ring-[#6c47ff]/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#6c47ff]"></div>
                </label>
              </div>

              {/* Default Threshold Input */}
              <div>
                <label htmlFor="threshold" className="block text-sm sm:text-base font-medium mb-2">
                  Default Low Stock Threshold
                </label>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Alert me when any product reaches this quantity or below
                </p>
                <div className="flex items-center gap-3">
                  <input
                    id="threshold"
                    type="number"
                    min="1"
                    max="1000"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    disabled={!notificationsEnabled}
                    className="w-24 sm:w-32 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#6c47ff] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white transition-colors"
                  />
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">items</span>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#6c47ff] text-white text-sm sm:text-base rounded-lg hover:bg-[#5a38e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Connected Integrations Section */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Connected Integrations</h2>
          
          <div className="p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 transition-all">
            {connections.length === 0 ? (
              <div className="text-center py-8">
                <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No integrations connected yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map((connection) => {
                  const Icon = connection.icon
                  return (
                    <div
                      key={connection.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: '#6c47ff20' }}
                        >
                          <Icon className="w-5 h-5 text-[#6c47ff]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-medium">{connection.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                            {connection.shopDomain}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openDisconnectModal(connection.id)}
                        disabled={isDisconnecting === connection.id}
                        className="w-full sm:w-auto px-4 py-2 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Disconnect
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Disconnect Integration
                  </h3>
                </div>
              </div>
              <button
                onClick={closeDisconnectModal}
                disabled={isDisconnecting !== null}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to disconnect? This will remove access to your store data and delete all notifications.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeDisconnectModal}
                disabled={isDisconnecting !== null}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDisconnect}
                disabled={isDisconnecting !== null}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
