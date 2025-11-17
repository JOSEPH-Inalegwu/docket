import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { verifyAndConsumeOAuthState, upsertToolConnection } from '@/lib/supabase/server'
import { encryptToken } from '@/lib/oauth/token-manager'

// Token exchange endpoints for each provider
const TOKEN_ENDPOINTS: Record<string, string> = {
  shopify: 'https://{shop}/admin/oauth/access_token',
  stripe: 'https://connect.stripe.com/oauth/token',
  amazon: 'https://api.amazon.com/auth/o2/token',
  woocommerce: '',
}

// Provider-specific configuration
const PROVIDER_CONFIG: Record<string, {
  clientIdEnv: string
  clientSecretEnv: string
  requiresShopDomain?: boolean
}> = {
  shopify: {
    clientIdEnv: 'SHOPIFY_CLIENT_ID',
    clientSecretEnv: 'SHOPIFY_CLIENT_SECRET',
    requiresShopDomain: true,
  },
  stripe: {
    clientIdEnv: 'STRIPE_CLIENT_ID',
    clientSecretEnv: 'STRIPE_CLIENT_SECRET',
  },
  amazon: {
    clientIdEnv: 'AMAZON_CLIENT_ID',
    clientSecretEnv: 'AMAZON_CLIENT_SECRET',
  },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { userId } = await auth()
  
  if (!userId) {
    return Response.redirect(new URL('/sign-in?error=unauthorized', request.url))
  }

  const { provider: providerParam } = await params
  const provider = providerParam.toLowerCase()
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const shop = searchParams.get('shop')

  // ✅ ADD DEBUG LOGS HERE
  console.log('🔄 OAuth Callback Started for:', provider)
  console.log('📋 Callback URL Parameters:', {
    code: code ? 'present' : 'missing',
    state: state ? 'present' : 'missing', 
    shop: shop ? shop : 'missing',
    error: error ? error : 'none'
  })

  // Handle OAuth errors from provider
  if (error) {
    console.error(`OAuth error from ${provider}:`, error)
    return Response.redirect(new URL(`/dashboard?error=oauth_${error}`, request.url))
  }

  // Validate required parameters
  if (!code || !state) {
    console.error('Missing code or state in OAuth callback')
    return Response.redirect(new URL('/dashboard?error=missing_params', request.url))
  }

  // Check if provider is supported
  const config = PROVIDER_CONFIG[provider]
  if (!config) {
    console.error(`Unsupported provider: ${provider}`)
    return Response.redirect(new URL('/dashboard?error=invalid_provider', request.url))
  }

  try {
    // Step 1: Verify CSRF state token
    const storedState = await verifyAndConsumeOAuthState(state, userId)
    
    if (!storedState) {
      console.error('Invalid or expired OAuth state')
      return Response.redirect(new URL('/dashboard?error=invalid_state', request.url))
    }

    if (storedState.provider !== provider) {
      console.error('Provider mismatch in OAuth state')
      return Response.redirect(new URL('/dashboard?error=provider_mismatch', request.url))
    }

    // Step 2: Get provider credentials from environment
    const clientId = process.env[config.clientIdEnv]
    const clientSecret = process.env[config.clientSecretEnv]

    if (!clientId || !clientSecret) {
      console.error(`Missing credentials for provider: ${provider}`)
      return Response.redirect(new URL('/dashboard?error=missing_credentials', request.url))
    }

    // Step 3: Build token exchange endpoint
    let tokenEndpoint = TOKEN_ENDPOINTS[provider]
    
    // Handle Shopify's dynamic shop domain
    if (provider === 'shopify') {
      if (!shop) {
        console.error('Missing shop parameter for Shopify')
        return Response.redirect(new URL('/dashboard?error=missing_shop', request.url))
      }
      tokenEndpoint = tokenEndpoint.replace('{shop}', shop)
    }

    // Step 4: Exchange authorization code for access token
    const tokenRequestBody: Record<string, string> = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback/${provider}`,
    }

    // Stripe requires specific parameters
    if (provider === 'stripe') {
      tokenRequestBody.grant_type = 'authorization_code'
    }

    console.log('🔄 Exchanging code for tokens...')
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(tokenRequestBody),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`Token exchange failed for ${provider}:`, errorText)
      return Response.redirect(new URL(`/dashboard?error=token_exchange_failed`, request.url))
    }

    const tokens = await tokenResponse.json()
    console.log('✅ Token exchange successful')

    // Step 5: Extract tokens (provider-specific field names)
    let accessToken: string
    let refreshToken: string | null = null
    let expiresIn: number | null = null

    if (provider === 'shopify') {
      accessToken = tokens.access_token
      // Shopify tokens don't expire
    } else if (provider === 'stripe') {
      accessToken = tokens.access_token
      refreshToken = tokens.refresh_token || null
      expiresIn = tokens.expires_in || null
    } else if (provider === 'amazon') {
      accessToken = tokens.access_token
      refreshToken = tokens.refresh_token || null
      expiresIn = tokens.expires_in || null
    } else {
      accessToken = tokens.access_token
      refreshToken = tokens.refresh_token || null
      expiresIn = tokens.expires_in || null
    }

    if (!accessToken) {
      console.error(`No access token received from ${provider}`)
      return Response.redirect(new URL(`/dashboard?error=no_access_token`, request.url))
    }

    // Step 6: Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(accessToken)
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null

    // Step 7: Calculate token expiration
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 1000)
      : null

    // Step 8: Store encrypted tokens in database
    console.log('💾 Storing connection in database...')
    await upsertToolConnection(userId, provider, {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      shopDomain: provider === 'shopify' ? shop : null,
      expiresAt,
      metadata: {
        scope: tokens.scope || null,
        tokenType: tokens.token_type || 'Bearer',
        connectedAt: new Date().toISOString(),
      },
    })

    console.log(`✅ Successfully connected ${provider} for user ${userId}`)

    // Step 9: Redirect to provider dashboard with success message
    const redirectUrl = new URL(`/dashboard/${provider}`, request.url)
    redirectUrl.searchParams.set('connected', 'true')
    if (shop) {
      redirectUrl.searchParams.set('shop', shop)
    }
    
    console.log('🔀 Final redirect to:', redirectUrl.toString())
    return Response.redirect(redirectUrl)

  } catch (error) {
    console.error(`OAuth callback error for ${provider}:`, error)
    
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }

    return Response.redirect(
      new URL(`/dashboard?error=connection_failed&provider=${provider}`, request.url)
    )
  }
}