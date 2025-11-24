/**
 * Configuration required for OAuth providers
 */
export interface ProviderConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

/**
 * Standard token response structure
 */
export interface TokenResponse {
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  expiresIn?: number // seconds until expiration
  tokenType?: string
  metadata?: Record<string, any> // provider-specific data
}

/**
 * Base OAuth Provider
 * All platform-specific providers must extend this class
 */
export abstract class BaseOAuthProvider {
  protected config: ProviderConfig
  protected providerName: string

  constructor(providerName: string, config: ProviderConfig) {
    this.providerName = providerName
    this.config = config
  }

  /**
   * Generates the authorization URL to redirect the user
   * @param state - Security token to prevent CSRF attacks
   * @param additionalParams - Platform-specific parameters (e.g., Shopify shop domain)
   */
  abstract getAuthorizationUrl(
    state: string,
    additionalParams?: Record<string, string>
  ): string

  /**
   * Exchanges the authorization code for an access token
   * @param code - Authorization code from OAuth callback
   * @param additionalParams - Platform-specific parameters needed for token exchange
   */
  abstract exchangeCodeForToken(
    code: string,
    additionalParams?: Record<string, string>
  ): Promise<TokenResponse>

  /**
   * Refreshes an expired access token
   * @param refreshToken - The refresh token to use
   */
  abstract refreshToken(refreshToken: string): Promise<TokenResponse>

  /**
   * Validates if an access token is still valid
   * @param accessToken - The access token to validate
   * @returns true if token is valid, false otherwise
   */
  abstract validateToken(accessToken: string): Promise<boolean>

  /**
   * Revokes an access token (used when disconnecting)
   * @param accessToken - The access token to revoke
   */
  abstract revokeToken(accessToken: string): Promise<void>

  /**
   * Helper method to calculate expiration date
   */
  protected calculateExpiresAt(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000)
  }

  /**
   * Helper method to build query parameters
   */
  protected buildQueryParams(params: Record<string, string>): string {
    return new URLSearchParams(params).toString()
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return this.providerName
  }
}