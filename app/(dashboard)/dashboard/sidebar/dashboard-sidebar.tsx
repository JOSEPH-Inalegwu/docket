'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import ToolList from './tool-list'
import MobileSidebarToggle from './mobile-sidebar-toggle'
import { Tool } from '@/lib/tools-config'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function DashboardSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [connectModalTool, setConnectModalTool] = useState<Tool | null>(null)
  const [shopDomain, setShopDomain] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const refetchConnectionsRef = useRef<(() => Promise<void>) | null>(null)

  // Detect OAuth success and refetch connections
  useEffect(() => {
    const connected = searchParams.get('connected')
    const provider = searchParams.get('provider') || window.location.pathname.split('/').pop()

    if (connected === 'true' && refetchConnectionsRef.current) {
      refetchConnectionsRef.current().then(() => {
        const providerName = provider 
        ? provider.charAt(0).toUpperCase() + provider.slice(1)
        : 'Provider'
        toast.success('Connected successfully!', {
          description: (
            <span className="text-sm">
              <span className="font-semibold text-primary">{providerName}</span>
              <span className="text-muted-foreground">
                {' '}has been connected to your account.
              </span>
            </span>
          ),
        })


        const newUrl = window.location.pathname
        router.replace(newUrl)
      })
    }
  }, [searchParams, router])

  const handleRefetchReady = (refetch: () => Promise<void>) => {
    refetchConnectionsRef.current = refetch
  }

  const handleToolClick = (tool: Tool) => {
    setIsMobileOpen(false)
    
    if (!tool.isConnected) {
      setConnectModalTool(tool)
      setShopDomain('')
      setError(null)
    } else {
      router.push(tool.href)
    }
  }

  const validateShopDomain = (domain: string): { valid: boolean; error?: string } => {
    if (!domain.trim()) {
      return { valid: false, error: 'Shop domain is required' }
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const shopifyPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/
    
    if (!shopifyPattern.test(cleanDomain)) {
      return { 
        valid: false, 
        error: 'Invalid format. Use: yourstore.myshopify.com' 
      }
    }

    return { valid: true }
  }

  const handleConnect = () => {
    if (!connectModalTool) return

    const toolId = connectModalTool.id

    if (toolId === 'shopify') {
      const validation = validateShopDomain(shopDomain)
      
      if (!validation.valid) {
        setError(validation.error || 'Invalid shop domain')
        return
      }
    }

    setIsConnecting(true)
    setError(null)

    const oauthUrl = new URL(`/api/auth/oauth/${toolId}`, window.location.origin)
    
    if (toolId === 'shopify' && shopDomain) {
      const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
      oauthUrl.searchParams.set('shop', cleanDomain)
    }

    window.location.href = oauthUrl.toString()
  }

  const handleDisconnect = async (toolId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return
    }

    try {
      const response = await fetch(`/api/connections/${toolId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      if (refetchConnectionsRef.current) {
        await refetchConnectionsRef.current()
      }

      const providerName = toolId.charAt(0).toUpperCase() + toolId.slice(1)
      toast.success('Disconnected successfully', {
        description: `${providerName} has been disconnected from your account.`,
      })
    } catch (err) {
      console.error('Disconnect error:', err)
      toast.error('Disconnect failed', {
        description: 'Failed to disconnect. Please try again.',
      })
    }
  }

  return (
    <>
      <MobileSidebarToggle onClick={() => setIsMobileOpen(true)} />

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

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

        <div className="h-full overflow-y-auto p-4">
          <div className="mb-4 hidden lg:block">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Your Tools
            </h2>
          </div>
          
          <ToolList 
            onToolClick={handleToolClick} 
            onRefetchReady={handleRefetchReady}
          />
        </div>
      </aside>

      <Dialog open={!!connectModalTool} onOpenChange={(open) => {
        if (!open) {
          setConnectModalTool(null)
          setShopDomain('')
          setError(null)
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {connectModalTool?.name}</DialogTitle>
            <DialogDescription>
              {connectModalTool?.id === 'shopify' 
                ? 'Enter your Shopify store domain to connect.'
                : `Connect your ${connectModalTool?.name} account.`
              }
            </DialogDescription>
          </DialogHeader>

          {connectModalTool?.id === 'shopify' ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="shop-domain">Store Domain</Label>
                <Input
                  id="shop-domain"
                  placeholder="yourstore.myshopify.com"
                  value={shopDomain}
                  onChange={(e) => {
                    setShopDomain(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConnect()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Example: mystore.myshopify.com
                </p>
              </div>

              {error && (
                <div className="p-2 bg-destructive/10 text-destructive text-sm rounded">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                You'll be redirected to {connectModalTool?.name} to authorize the connection.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConnectModalTool(null)
                setShopDomain('')
                setError(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}