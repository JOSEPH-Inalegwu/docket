import { BaseOAuthProvider, ProviderConfig, TokenResponse } from "../base-oauth-provider"

export class ShopifyProvider extends BaseOAuthProvider {
  constructor(config: ProviderConfig) {
    super('shopify', config)
  }

  /**
   * Generates Shopify OAuth authorization URL
   * @param state - CSRF protection token
   * @param additionalParams - Must include 'shop' (e.g., { shop: 'mystore.myshopify.com' })
   */
  getAuthorizationUrl(state: string, additionalParams?: Record<string, string>): string {
    if (!additionalParams?.shop) {
      throw new Error('Shopify requires "shop" parameter (e.g., mystore.myshopify.com)')
    }

    const shop = additionalParams.shop
    const authUrl = `https://${shop}/admin/oauth/authorize`

    const params = {
      client_id: this.config.clientId,
      scope: this.config.scopes.join(','),
      redirect_uri: this.config.redirectUri,
      state: state,
    }

    return `${authUrl}?${this.buildQueryParams(params)}`
  }

  /**
   * Exchanges authorization code for access token
   * @param code - Authorization code from callback
   * @param additionalParams - Must include 'shop'
   */
  async exchangeCodeForToken(
    code: string,
    additionalParams?: Record<string, string>
  ): Promise<TokenResponse> {
    if (!additionalParams?.shop) {
      throw new Error('Shopify requires "shop" parameter for token exchange')
    }

    const shop = additionalParams.shop
    const tokenUrl = `https://${shop}/admin/oauth/access_token`

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: code,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Shopify token exchange failed: ${errorText}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      // Shopify tokens don't expire, so no refresh token or expiresAt
      tokenType: 'Bearer',
      metadata: {
        scope: data.scope,
        shop: shop,
        associatedUser: data.associated_user,
        associatedUserScope: data.associated_user_scope,
      },
    }
  }

  /**
   * Shopify tokens don't expire, so refresh is not needed
   * This method throws an error if called
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    throw new Error('Shopify tokens do not expire and cannot be refreshed')
  }

  /**
   * Validates Shopify access token by making a test API call
   * @param accessToken - The access token to validate
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      // Get shop domain from metadata (you'll need to pass this somehow)
      // For now, we'll make a generic API call to /admin/api/2024-01/shop.json
      // Note: You'll need to store shop domain with the token to use this properly
      
      // This is a placeholder - in real implementation, you'd need the shop domain
      // We'll handle this better when we integrate with TokenManager
      return true // Temporary - we'll fix this in Phase 3
    } catch (error) {
      return false
    }
  }

  /**
   * Revokes Shopify access token
   * Note: Shopify doesn't have a token revocation endpoint
   * Users must uninstall the app from their Shopify admin
   */
  async revokeToken(accessToken: string): Promise<void> {
    // Shopify doesn't provide a revocation endpoint
    // The token is invalidated when the app is uninstalled from Shopify admin
    // For now, we just log this
    console.log('Shopify tokens are revoked by uninstalling the app from Shopify admin')
  }
}