// lib/api/providers/shopify.ts
import { decryptToken } from '@/lib/oauth/token-manager'
import { getToolConnection } from '@/lib/supabase/server'

export class ShopifyAPI {
  private accessToken: string
  private shopDomain: string

  constructor(accessToken: string, shopDomain: string) {
    this.accessToken = accessToken
    this.shopDomain = shopDomain
  }

  async getOrders() {
    const response = await fetch(
      `https://${this.shopDomain}/admin/api/2024-01/orders.json`,
      {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
        },
      }
    )
    return response.json()
  }

  async getProducts() {
    const response = await fetch(
      `https://${this.shopDomain}/admin/api/2024-01/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
        },
      }
    )
    return response.json()
  }

  // Add more API methods as needed
}

// Helper function to get Shopify API instance for a user
export async function getShopifyAPI(userId: string) {
  const connection = await getToolConnection(userId, 'shopify')
  if (!connection) throw new Error('Shopify not connected')
  
  const accessToken = decryptToken(connection.access_token)
  const shopDomain = connection.shop_domain
  
  return new ShopifyAPI(accessToken, shopDomain)
}