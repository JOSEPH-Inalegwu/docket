// lib/api/providers/shopify.ts
import { decryptToken } from '@/lib/oauth/token-manager'
import { getToolConnection } from '@/lib/supabase/server'

// Interface representing the shape of connection record from Supabase
interface ShopifyConnection {
  accessToken: string
  shopDomain: string
  metadata?: Record<string, any>
}

// Interface for Shopify API responses
interface ShopifyOrder {
  id: number
  email: string
  created_at: string
  // Add more fields as needed
}

interface ShopifyProduct {
  id: number
  title: string
  // Add more fields as needed
}

export class ShopifyAPI {
  private accessToken: string
  private shopDomain: string

  constructor(accessToken: string, shopDomain: string) {
    if (!accessToken) throw new Error('Access token is required')
    if (!shopDomain) throw new Error('Shop domain is required')

    this.accessToken = accessToken
    this.shopDomain = shopDomain
  }

  async getOrders(): Promise<{ orders: ShopifyOrder[] }> {
    const response = await fetch(
      `https://${this.shopDomain}/admin/api/2024-01/orders.json`,
      {
        headers: { 'X-Shopify-Access-Token': this.accessToken },
      }
    )

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getProducts(): Promise<{ products: ShopifyProduct[] }> {
    const response = await fetch(
      `https://${this.shopDomain}/admin/api/2024-01/products.json`,
      {
        headers: { 'X-Shopify-Access-Token': this.accessToken },
      }
    )

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Add more API methods here, each with proper return types
}

/**
 * Helper function to get a typed ShopifyAPI instance for a user
 */
export async function getShopifyAPI(userId: string): Promise<ShopifyAPI> {
  const connection = await getToolConnection(userId, 'shopify') as ShopifyConnection | null

  if (!connection) throw new Error('Shopify not connected')

  const { accessToken, shopDomain } = connection

  if (!accessToken) throw new Error('No access token found for Shopify')
  if (!shopDomain) throw new Error('No shop domain found for Shopify')

  const decryptedToken = decryptToken(accessToken)

  return new ShopifyAPI(decryptedToken, shopDomain)
}
