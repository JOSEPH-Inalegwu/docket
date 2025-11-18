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

  // OAuth error handling
  if (error) return Response.redirect(new URL(`/dashboard?error=oauth_${error}`, request.url))
  if (!code || !state) return Response.redirect(new URL('/dashboard?error=missing_params', request.url))

  const config = PROVIDER_CONFIG[provider]
  if (!config) return Response.redirect(new URL('/dashboard?error=invalid_provider', request.url))

  try {
    // ✅ Type-safe stored state
    interface OAuthState {
      provider: string
      [key: string]: any
    }

    const storedState = await verifyAndConsumeOAuthState(state, userId) as OAuthState | null
    if (!storedState) {
      console.error('Invalid or expired OAuth state')
      return Response.redirect(new URL('/dashboard?error=invalid_state', request.url))
    }

    if (storedState.provider !== provider) {
      console.error('Provider mismatch in OAuth state')
      return Response.redirect(new URL('/dashboard?error=provider_mismatch', request.url))
    }

    const clientId = process.env[config.clientIdEnv]
    const clientSecret = process.env[config.clientSecretEnv]
    if (!clientId || !clientSecret) {
      console.error(`Missing credentials for provider: ${provider}`)
      return Response.redirect(new URL('/dashboard?error=missing_credentials', request.url))
    }

    let tokenEndpoint = TOKEN_ENDPOINTS[provider]
    if (provider === 'shopify' && shop) tokenEndpoint = tokenEndpoint.replace('{shop}', shop)

    const tokenRequestBody: Record<string, string> = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback/${provider}`,
    }

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(tokenRequestBody),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error(`Token exchange failed for ${provider}:`, errorText)
      return Response.redirect(new URL(`/dashboard?error=token_exchange_failed`, request.url))
    }

    const tokens = await tokenResponse.json()
    const accessToken = tokens.access_token
    if (!accessToken) {
      console.error(`No access token received from ${provider}`)
      return Response.redirect(new URL(`/dashboard?error=no_access_token`, request.url))
    }

    const encryptedAccessToken = encryptToken(accessToken)
    const encryptedRefreshToken = tokens.refresh_token ? encryptToken(tokens.refresh_token) : null

    await upsertToolConnection(userId, provider, {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      shopDomain: provider === 'shopify' ? shop : null,
      expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      metadata: { scope: tokens.scope || null, tokenType: tokens.token_type || 'Bearer', connectedAt: new Date().toISOString() },
    })

    const redirectUrl = new URL(`/dashboard/${provider}`, request.url)
    redirectUrl.searchParams.set('connected', 'true')
    if (shop) redirectUrl.searchParams.set('shop', shop)
    return Response.redirect(redirectUrl)

  } catch (err) {
    console.error(`OAuth callback error for ${provider}:`, err)
    return Response.redirect(new URL(`/dashboard?error=connection_failed&provider=${provider}`, request.url))
  }
}