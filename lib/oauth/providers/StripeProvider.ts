// lib/oauth/providers/StripeProvider.ts

import Stripe from 'stripe'
import { BaseOAuthProvider, ProviderConfig, TokenResponse } from '../base-oauth-provider'

export class StripeProvider extends BaseOAuthProvider {
  private stripe: Stripe

  constructor(config: ProviderConfig) {
    super('stripe', config)

    if (!config.clientSecret) {
      throw new Error('Stripe clientSecret (secret key) is not configured')
    }

    // Uses the secret key from config to talk to Stripe
    this.stripe = new Stripe(config.clientSecret, {})
  }

  getAuthorizationUrl(_state: string, _additionalParams?: Record<string, string>): string {
    throw new Error('Stripe getAuthorizationUrl is not used in this flow')
  }

  /**
   * Exchanges authorization code for connected account information.
  **/
  async exchangeCodeForToken(
    code: string,
    _additionalParams?: Record<string, string>
  ): Promise<TokenResponse> {
    const response = await this.stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    const stripeUserId = response.stripe_user_id

    if (!stripeUserId) {
      throw new Error('Missing stripe_user_id in Stripe OAuth response')
    }

    const tokenResponse: TokenResponse = {
      accessToken: stripeUserId,
      refreshToken: undefined,
      expiresAt: undefined,
      tokenType: response.token_type ?? 'bearer',
      metadata: {
        stripeUserId,
        scope: response.scope,
        livemode: response.livemode,
      },
    }

    return tokenResponse
  }

  async refreshToken(_refreshToken: string): Promise<TokenResponse> {
    throw new Error('Stripe tokens are not refreshed via this method in this integration')
  }


  async validateToken(_accessToken: string): Promise<boolean> {
    return true
  }

  async revokeToken(_accessToken: string): Promise<void> {
    console.log('Stripe deauthorization not implemented yet for Standard accounts')
  }
}
