import { ShoppingBag, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export interface ToolNestedLink {
  label: string
  href: string
}

export interface Tool {
  id: string
  name: string
  href: string
  icon: LucideIcon
  color: string
  isConnected: boolean
  nestedLinks?: ToolNestedLink[]
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
    nestedLinks: [
      { label: 'Orders', href: '/dashboard/shopify/orders' },
      { label: 'Products', href: '/dashboard/shopify/products' },
      { label: 'Analytics', href: '/dashboard/shopify/analytics' },
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    href: '/dashboard/amazon',
    icon: Package,
    color: '#ff9900',
    isConnected: false,
    nestedLinks: [
      { label: 'Sales', href: '/dashboard/amazon/sales' },
      { label: 'Inventory', href: '/dashboard/amazon/inventory' },
      { label: 'Reports', href: '/dashboard/amazon/reports' },
    ],
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    href: '/dashboard/woocommerce',
    icon: ShoppingCart,
    color: '#96588a',
    isConnected: false,
    nestedLinks: [
      { label: 'Orders', href: '/dashboard/woocommerce/orders' },
      { label: 'Customers', href: '/dashboard/woocommerce/customers' },
      { label: 'Revenue', href: '/dashboard/woocommerce/revenue' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    href: '/dashboard/stripe',
    icon: TrendingUp,
    color: '#635bff',
    isConnected: false,
    nestedLinks: [
      { label: 'Payments', href: '/dashboard/stripe/payments' },
      { label: 'Customers', href: '/dashboard/stripe/customers' },
      { label: 'Balance', href: '/dashboard/stripe/balance' },
    ],
  },
]