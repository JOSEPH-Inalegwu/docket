// lib/oauth/oauth-provider-factory.ts

import { BaseOAuthProvider, ProviderConfig } from './base-oauth-provider'
import { ShopifyProvider } from './providers/ShopifyProvider'
import { StripeProvider } from './providers/StripeProvider' 

type SupportedProvider = 'shopify' | 'stripe' | 'amazon' | 'woocommerce'

export class OAuthProviderFactory {
  /**
   * Map of provider names to their respective classes
   */
  private static providers: Record<
    SupportedProvider,
    new (config: ProviderConfig) => BaseOAuthProvider
  > = {
    shopify: ShopifyProvider,
    stripe: StripeProvider, 
    // amazon: AmazonProvider,    // Uncomment when created
    // woocommerce: WooCommerceProvider, // Uncomment when created
  } as any // Temporary type assertion until all providers are implemented

  /**
   * Creates and returns an OAuth provider instance
   * @param providerName - Name of the provider (e.g., 'shopify', 'stripe')
   * @returns Configured provider instance
   * @throws Error if provider is not supported or missing credentials
   */
  static create(providerName: string): BaseOAuthProvider {
    const normalizedProvider = providerName.toLowerCase() as SupportedProvider

    // Check if provider is supported
    const ProviderClass = this.providers[normalizedProvider]
    if (!ProviderClass) {
      throw new Error(
        `Provider "${providerName}" is not supported. ` +
          `Supported providers: ${Object.keys(this.providers).join(', ')}`
      )
    }

    // Load configuration from environment variables
    const config = this.getProviderConfig(normalizedProvider)

     // 🔍 TEMP DEBUG: see what Stripe actually gets
    if (normalizedProvider === 'stripe') {
      console.log('Stripe config in factory:', {
        clientId: config.clientId,
        hasClientId: !!config.clientId,
        hasClientSecret: !!config.clientSecret,
      })
    }
  
    // Validate required credentials exist
    if (!config.clientId || !config.clientSecret) {
      throw new Error(
        `Missing credentials for provider "${providerName}". ` +
          `Please check your environment variables.`
      )
    }

    // Create and return provider instance
    return new ProviderClass(config)
  }

  /**
   * Loads provider configuration from environment variables
   * @param provider - Provider name
   * @returns Provider configuration
   */
  private static getProviderConfig(provider: SupportedProvider): ProviderConfig {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!baseUrl) {
      throw new Error('NEXT_PUBLIC_APP_URL is not configured')
    }

    const configs: Record<SupportedProvider, ProviderConfig> = {
      shopify: {
        clientId: process.env.SHOPIFY_CLIENT_ID || '',
        clientSecret: process.env.SHOPIFY_CLIENT_SECRET || '',
        redirectUri: `${baseUrl}/api/auth/oauth/callback/shopify`,
        scopes: ['read_products', 'write_orders', 'read_customers', 'read_analytics'],
      },
      stripe: {
        clientId: process.env.STRIPE_CLIENT_ID || '',
        clientSecret: process.env.STRIPE_CLIENT_SECRET || '',
        redirectUri: `${baseUrl}/api/auth/oauth/callback/stripe`,
        scopes: ['read_write'],
      },
      amazon: {
        clientId: process.env.AMAZON_CLIENT_ID || '',
        clientSecret: process.env.AMAZON_CLIENT_SECRET || '',
        redirectUri: `${baseUrl}/api/auth/oauth/callback/amazon`,
        scopes: ['profile', 'postal_code'],
      },
      woocommerce: {
        clientId: process.env.WOOCOMMERCE_CLIENT_ID || '',
        clientSecret: process.env.WOOCOMMERCE_CLIENT_SECRET || '',
        redirectUri: `${baseUrl}/api/auth/oauth/callback/woocommerce`,
        scopes: ['read', 'write'],
      },
    }

    return configs[provider]
  }

  /**
   * Check if a provider is supported
   * @param providerName - Provider name to check
   */
  static isSupported(providerName: string): boolean {
    return providerName.toLowerCase() in this.providers
  }

  /**
   * Get list of all supported providers
   */
  static getSupportedProviders(): SupportedProvider[] {
    return Object.keys(this.providers) as SupportedProvider[]
  }
}