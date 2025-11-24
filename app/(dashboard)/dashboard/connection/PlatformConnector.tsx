'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Loader2 } from 'lucide-react'

interface PlatformConnectorProps {
  platform: {
    id: string // 'shopify', 'stripe', etc.
    name: string // 'Shopify', 'Stripe', etc.
    icon: string // URL or path to icon
    description?: string
    requiresShopDomain?: boolean
  }
  isConnected?: boolean
  onConnectionChange?: (connected: boolean) => void
}

export function PlatformConnector({
  platform,
  isConnected = false,
  onConnectionChange,
}: PlatformConnectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [shopDomain, setShopDomain] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = () => {
    // If platform requires shop domain (like Shopify), show modal
    if (platform.requiresShopDomain) {
      setIsModalOpen(true)
    } else {
      // For other platforms (Stripe, Amazon), redirect directly
      initiateOAuth()
    }
  }

  const handleModalSubmit = () => {
    // Validate shop domain
    const validation = validateShopDomain(shopDomain)
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid shop domain')
      return
    }

    // Proceed with OAuth
    initiateOAuth(shopDomain)
  }

  const initiateOAuth = (shop?: string) => {
    setIsConnecting(true)
    setError(null)

    // Build OAuth URL
    const oauthUrl = new URL(`/api/auth/oauth/${platform.id}`, window.location.origin)
    
    if (shop) {
      oauthUrl.searchParams.set('shop', shop)
    }

    // Redirect to OAuth flow
    window.location.href = oauthUrl.toString()
  }

  const validateShopDomain = (domain: string): { valid: boolean; error?: string } => {
    if (!domain.trim()) {
      return { valid: false, error: 'Shop domain is required' }
    }

    // Remove https://, http://, and trailing slashes
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')

    // Check if it's a valid Shopify domain format
    const shopifyPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/
    
    if (!shopifyPattern.test(cleanDomain)) {
      return { 
        valid: false, 
        error: 'Invalid format. Use: yourstore.myshopify.com' 
      }
    }

    return { valid: true }
  }

  const handleDisconnect = async () => {
    if (!confirm(`Are you sure you want to disconnect ${platform.name}?`)) {
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const response = await fetch(`/api/auth/oauth/disconnect/${platform.id}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      onConnectionChange?.(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Platform Icon */}
            <img 
              src={platform.icon} 
              alt={platform.name} 
              className="w-10 h-10 rounded"
            />
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{platform.name}</h3>
                {isConnected && (
                  <Badge variant="default" className="text-xs">
                    Connected
                  </Badge>
                )}
              </div>
              {platform.description && (
                <p className="text-sm text-muted-foreground">
                  {platform.description}
                </p>
              )}
            </div>
          </div>

          {/* Connect/Disconnect Button */}
          <Button
            onClick={isConnected ? handleDisconnect : handleConnect}
            disabled={isConnecting}
            variant={isConnected ? 'outline' : 'default'}
            size="sm"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isConnected ? 'Disconnecting...' : 'Connecting...'}
              </>
            ) : (
              <>{isConnected ? 'Disconnect' : 'Connect'}</>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-destructive/10 text-destructive text-sm rounded">
            {error}
          </div>
        )}
      </Card>

      {/* Shop Domain Modal (for Shopify) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {platform.name}</DialogTitle>
            <DialogDescription>
              Enter your {platform.name} store domain to connect.
            </DialogDescription>
          </DialogHeader>

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
                    handleModalSubmit()
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false)
                setShopDomain('')
                setError(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleModalSubmit} disabled={isConnecting}>
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