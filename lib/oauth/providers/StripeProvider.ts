// lib/oauth/providers/StripeProvider.ts

import Stripe from 'stripe'
import { BaseOAuthProvider, ProviderConfig, TokenResponse } from '../base-oauth-provider'

export class StripeProvider extends BaseOAuthProvider {
  private stripe: Stripe

  constructor(config: ProviderConfig) {
    // Provider name is 'stripe' for logging/metadata in BaseOAuthProvider
    super('stripe', config)

    if (!config.clientSecret) {
      throw new Error('Stripe clientSecret (secret key) is not configured')
    }

    // Use the secret key from config to talk to Stripe
    this.stripe = new Stripe(config.clientSecret, {
      apiVersion: '2023-10-16',
    })
  }

  /**
   * For Stripe Connect OAuth we already build the authorize URL
   * in your /api/auth/oauth/[provider] route,
   * so getAuthorizationUrl is not needed right now.
   * If BaseOAuthProvider declares it abstract, we can implement a simple version later.
   */
  getAuthorizationUrl(_state: string, _additionalParams?: Record<string, string>): string {
    throw new Error('Stripe getAuthorizationUrl is not used in this flow')
  }

  /**
   * Exchanges authorization code for connected account information.
   * For Standard accounts, the key output is stripe_user_id (the connected account ID).[attached_file:148][web:21]
   */
  async exchangeCodeForToken(
    code: string,
    _additionalParams?: Record<string, string>
  ): Promise<TokenResponse> {
    // POST https://connect.stripe.com/oauth/token with grant_type=authorization_code and code[attached_file:148][web:139]
    const response = await this.stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    const stripeUserId = response.stripe_user_id

    if (!stripeUserId) {
      throw new Error('Missing stripe_user_id in Stripe OAuth response')
    }

    // For Standard accounts, Stripe recommends storing stripe_user_id
    // and using it with the Stripe-Account header for future API calls.[attached_file:148][web:21]
    // Your TokenResponse requires an accessToken, so we store the ID there.
    const tokenResponse: TokenResponse = {
      accessToken: stripeUserId,
      refreshToken: null,
      expiresAt: null,
      tokenType: response.token_type ?? 'bearer',
      metadata: {
        stripeUserId,
        scope: response.scope,
        livemode: response.livemode,
      },
    }

    return tokenResponse
  }

  /**
   * Stripe OAuth for Standard accounts doesn’t use refresh tokens in the same way;
   * we won’t support refresh here for now.
   */
  async refreshToken(_refreshToken: string): Promise<TokenResponse> {
    throw new Error('Stripe tokens are not refreshed via this method in this integration')
  }

  /**
   * Minimal validation: you can later implement a test call using Stripe-Account header.
   */
  async validateToken(_accessToken: string): Promise<boolean> {
    // Later you can make a simple request using Stripe-Account + accessToken (which is stripe_user_id).[web:21]
    return true
  }

  /**
   * Revoking a connection for Standard accounts is done via Stripe’s deauthorization endpoint;
   * we’ll leave this as a no-op for now.
   */
  async revokeToken(_accessToken: string): Promise<void> {
    console.log('Stripe deauthorization not implemented yet for Standard accounts')
  }
}
