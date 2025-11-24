import { OAuthProviderFactory } from './oauth-provider-factory'
import { verifyAndConsumeOAuthState, upsertToolConnection, OAuthState } from '@/lib/supabase/server'
import { encryptToken } from './token-manager'

export interface CallbackParams {
  code: string
  state: string
  error?: string
  // Provider-specific params
  shop?: string // Shopify
  [key: string]: string | undefined
}

export interface CallbackResult {
  success: boolean
  redirectUrl: string
  error?: string
}

export class OAuthCallbackHandler {
  /**
   * Main callback handler - processes OAuth callbacks for ALL providers
   * @param userId - Current authenticated user ID
   * @param provider - Provider name (shopify, stripe, etc.)
   * @param params - Callback parameters from OAuth provider
   * @param baseUrl - Base URL for redirects
   */
  async handleCallback(
    userId: string,
    provider: string,
    params: CallbackParams,
    baseUrl: string
  ): Promise<CallbackResult> {
    const { code, state, error, ...additionalParams } = params

    // Step 1: Handle OAuth errors from provider
    if (error) {
      console.error(`OAuth error from ${provider}:`, error)
      return {
        success: false,
        redirectUrl: `${baseUrl}/dashboard?error=oauth_${error}`,
        error: error,
      }
    }

    // Step 2: Validate required parameters
    if (!code || !state) {
      console.error('Missing code or state in callback')
      return {
        success: false,
        redirectUrl: `${baseUrl}/dashboard?error=missing_params`,
        error: 'missing_params',
      }
    }

    try {
      // Step 3: Verify and consume state (CSRF protection)
      const storedState = await verifyAndConsumeOAuthState(state, userId)
      
      if (!storedState) {
        console.error('Invalid or expired OAuth state')
        return {
          success: false,
          redirectUrl: `${baseUrl}/dashboard?error=invalid_state`,
          error: 'invalid_state',
        }
      }

      // Step 4: Validate provider matches
      if (storedState.provider !== provider) {
        console.error(`Provider mismatch: expected ${storedState.provider}, got ${provider}`)
        return {
          success: false,
          redirectUrl: `${baseUrl}/dashboard?error=provider_mismatch`,
          error: 'provider_mismatch',
        }
      }

      // Step 5: Get provider instance from factory
      const oauthProvider = OAuthProviderFactory.create(provider)

      // Step 6: Exchange code for tokens - Filter out undefined values
      const cleanParams = Object.entries(additionalParams).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {} as Record<string, string>)

      const tokens = await oauthProvider.exchangeCodeForToken(code, cleanParams)


      if (!tokens.accessToken) {
        console.error(`No access token received from ${provider}`)
        return {
          success: false,
          redirectUrl: `${baseUrl}/dashboard?error=no_access_token`,
          error: 'no_access_token',
        }
      }

      // Step 7: Encrypt tokens
      const encryptedAccessToken = encryptToken(tokens.accessToken)
      const encryptedRefreshToken = tokens.refreshToken 
        ? encryptToken(tokens.refreshToken) 
        : null

      // Step 8: Save tokens to database
      await upsertToolConnection(userId, provider, {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        shopDomain: additionalParams.shop || null,
        expiresAt: tokens.expiresAt || null,
        metadata: {
          ...tokens.metadata,
          tokenType: tokens.tokenType || 'Bearer',
          connectedAt: new Date().toISOString(),
        },
      })

      // Step 9: Build success redirect URL
      const redirectUrl = new URL(`${baseUrl}/dashboard/${provider}`)
      redirectUrl.searchParams.set('connected', 'true')
      
      if (additionalParams.shop) {
        redirectUrl.searchParams.set('shop', additionalParams.shop)
      }

      console.log(`✅ Successfully connected ${provider} for user ${userId}`)

      return {
        success: true,
        redirectUrl: redirectUrl.toString(),
      }

    } catch (error) {
      console.error(`OAuth callback error for ${provider}:`, error)
      
      return {
        success: false,
        redirectUrl: `${baseUrl}/dashboard?error=connection_failed&provider=${provider}`,
        error: error instanceof Error ? error.message : 'unknown_error',
      }
    }
  }

  /**
   * Validates callback parameters
   */
  private validateParams(params: CallbackParams): { valid: boolean; error?: string } {
    if (!params.code) {
      return { valid: false, error: 'missing_code' }
    }

    if (!params.state) {
      return { valid: false, error: 'missing_state' }
    }

    return { valid: true }
  }

  /**
   * Builds error redirect URL
   */
  private buildErrorUrl(baseUrl: string, error: string, provider?: string): string {
    const url = new URL(`${baseUrl}/dashboard`)
    url.searchParams.set('error', error)
    
    if (provider) {
      url.searchParams.set('provider', provider)
    }

    return url.toString()
  }

  /**
   * Builds success redirect URL
   */
  private buildSuccessUrl(
    baseUrl: string, 
    provider: string, 
    additionalParams?: Record<string, string>
  ): string {
    const url = new URL(`${baseUrl}/dashboard/${provider}`)
    url.searchParams.set('connected', 'true')

    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value)
        }
      })
    }

    return url.toString()
  }
}