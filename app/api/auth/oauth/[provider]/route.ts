import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { storeOAuthState } from '@/lib/supabase/server'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

// OAuth configuration for each provider
const OAUTH_CONFIG: Record<string, {
  authUrl: string
  clientId: string
  scopes: string
  redirectUri: string
  requiresShopParam?: boolean
}> = {
  shopify: {
    authUrl: 'https://{shop}/admin/oauth/authorize',
    clientId: process.env.SHOPIFY_CLIENT_ID || '',
    scopes: 'read_products,read_orders,read_customers,read_analytics',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback/shopify`,
    requiresShopParam: true,
  },
  stripe: {
    authUrl: 'https://connect.stripe.com/oauth/authorize',
    clientId: process.env.STRIPE_CLIENT_ID || '',
    scopes: 'read_write',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback/stripe`,
  },
  amazon: {
    authUrl: 'https://www.amazon.com/ap/oa',
    clientId: process.env.AMAZON_CLIENT_ID || '',
    scopes: 'profile postal_code',
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback/amazon`,
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return redirect('/sign-in')
    }

    const { provider: providerParam } = await params
    const provider = providerParam.toLowerCase()
    const searchParams = request.nextUrl.searchParams
    const shop = searchParams.get('shop')

    // Get provider configuration
    const config = OAUTH_CONFIG[provider]

    if (!config) {
      console.error(`Invalid provider: ${provider}`)
      return redirect(`/dashboard?error=invalid_provider`)
    }

    // Validate shop parameter for Shopify
    if (config.requiresShopParam && !shop) {
      console.error('Missing shop parameter for Shopify')
      return redirect(`/dashboard/${provider}?error=missing_shop`)
    }

    // Validate client ID is configured
    if (!config.clientId) {
      console.error(`Missing client ID for provider: ${provider}`)
      return redirect(`/dashboard?error=missing_config`)
    }

    // Generate a random state for CSRF protection
    const state = crypto.randomUUID()
    
    // Store state in database with 5 minute expiry
    await storeOAuthState(userId, provider, state)

    // Build OAuth authorization URL
    let authUrl = config.authUrl

    // Handle Shopify's dynamic shop domain
    if (provider === 'shopify' && shop) {
      authUrl = authUrl.replace('{shop}', shop)
    }

    const authUrlObj = new URL(authUrl)
    authUrlObj.searchParams.set('client_id', config.clientId)
    authUrlObj.searchParams.set('scope', config.scopes)
    authUrlObj.searchParams.set('redirect_uri', config.redirectUri)
    authUrlObj.searchParams.set('state', state)
    authUrlObj.searchParams.set('response_type', 'code')

    // Provider-specific parameters
    if (provider === 'stripe') {
      authUrlObj.searchParams.set('stripe_landing', 'login')
    }

    console.log(`✅ Initiating OAuth for ${provider}, user: ${userId}`)
    console.log(`🔗 Redirecting to: ${authUrlObj.toString()}`)

    // Redirect to OAuth provider
    redirect(authUrlObj.toString())

  } catch (error) {
    // Don't catch redirect errors - they need to bubble up
    if (isRedirectError(error)) {
      throw error
    }

    console.error(`❌ OAuth initiation error:`, error)
    return redirect(`/dashboard?error=oauth_init_failed`)
  }
}

/**
 * Usage examples:
 * 
 * For Stripe:
 * GET /api/auth/oauth/stripe
 * 
 * For Shopify (requires shop parameter):
 * GET /api/auth/oauth/shopify?shop=mystore.myshopify.com
 * 
 * For Amazon:
 * GET /api/auth/oauth/amazon
 */