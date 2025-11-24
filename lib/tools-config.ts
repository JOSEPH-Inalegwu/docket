import { ShoppingBag, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export interface Tool {
  id: string
  name: string
  href: string
  icon: LucideIcon
  color: string
  isConnected: boolean
  dashboardUrl?: string  // External platform dashboard URL
}

// This would eventually come from your database/API
export const tools: Tool[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    href: '/dashboard/shopify',
    icon: ShoppingBag,
    color: '#96bf48',
    isConnected: false,
    dashboardUrl: 'https://admin.shopify.com', // Will be dynamic based on shop domain
  },
  {
    id: 'amazon',
    name: 'Amazon',
    href: '/dashboard/amazon',
    icon: Package,
    color: '#ff9900',
    isConnected: false,
    dashboardUrl: 'https://sellercentral.amazon.com',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    href: '/dashboard/woocommerce',
    icon: ShoppingCart,
    color: '#96588a',
    isConnected: false,
    dashboardUrl: '', // Will be dynamic based on user's WordPress site
  },
  {
    id: 'stripe',
    name: 'Stripe',
    href: '/dashboard/stripe',
    icon: TrendingUp,
    color: '#635bff',
    isConnected: false,
    dashboardUrl: 'https://dashboard.stripe.com',
  },
]