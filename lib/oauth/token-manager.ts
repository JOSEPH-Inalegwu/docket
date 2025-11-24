import CryptoJS from 'crypto-js'
import { getToolConnection, upsertToolConnection, ToolConnection } from '@/lib/supabase/server'
import { OAuthProviderFactory } from './oauth-provider-factory'

// ✅ Ensure ENCRYPTION_KEY is defined at build/runtime
const ENCRYPTION_KEY: string = process.env.ENCRYPTION_KEY as string

if (!ENCRYPTION_KEY) {
  throw new Error(
    'ENCRYPTION_KEY is not set. Generate one with: openssl rand -base64 32'
  )
}

// =====================================================
// ENCRYPTION FUNCTIONS (Your existing code)
// =====================================================

/**
 * Encrypts a token using AES encryption
 * @param token - Plain text token to encrypt
 * @returns Encrypted token as base64 string
 */
export function encryptToken(token?: string): string {
  if (!token) {
    throw new Error('Token cannot be empty or undefined')
  }

  try {
    const encrypted = CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt token')
  }
}

/**
 * Decrypts an encrypted token
 * @param encryptedToken - Encrypted token as base64 string
 * @returns Decrypted plain text token
 */
export function decryptToken(encryptedToken?: string): string {
  if (!encryptedToken) {
    throw new Error('Encrypted token cannot be empty or undefined')
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)

    if (!decrypted) {
      throw new Error('Decryption resulted in empty string')
    }

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt token')
  }
}

/**
 * Validates if a token is properly encrypted
 * @param encryptedToken - Token to validate
 * @returns true if valid, false otherwise
 */
export function isValidEncryptedToken(encryptedToken?: string): boolean {
  if (!encryptedToken) return false

  try {
    const decrypted = decryptToken(encryptedToken)
    return decrypted.length > 0
  } catch {
    return false
  }
}

/**
 * Encrypts multiple tokens at once
 * @param tokens - Object with token keys and values
 * @returns Object with encrypted tokens
 */
export function encryptTokens(tokens: Record<string, string>): Record<string, string> {
  const encrypted: Record<string, string> = {}

  for (const [key, value] of Object.entries(tokens)) {
    if (value) {
      encrypted[key] = encryptToken(value)
    }
  }

  return encrypted
}

/**
 * Decrypts multiple tokens at once
 * @param encryptedTokens - Object with encrypted token keys and values
 * @returns Object with decrypted tokens
 */
export function decryptTokens(encryptedTokens: Record<string, string>): Record<string, string> {
  const decrypted: Record<string, string> = {}

  for (const [key, value] of Object.entries(encryptedTokens)) {
    if (value) {
      decrypted[key] = decryptToken(value)
    }
  }

  return decrypted
}

// =====================================================
// TOKEN MANAGEMENT FUNCTIONS (New - Phase 1, Step 5)
// =====================================================

/**
 * Get a valid access token for a user and provider
 * Automatically refreshes if expired
 * @param userId - User ID
 * @param provider - Provider name
 * @returns Decrypted access token ready to use
 */
export async function getValidAccessToken(
  userId: string,
  provider: string
): Promise<string> {
  // Get connection from database
  const connection = await getToolConnection(userId, provider)

  if (!connection) {
    throw new Error(`No active connection found for provider: ${provider}`)
  }

  // Decrypt the access token
  const accessToken = decryptToken(connection.access_token)

  // Check if token needs refresh
  if (isTokenExpired(connection)) {
    console.log(`Token expired for ${provider}, refreshing...`)
    
    // Refresh the token
    const newAccessToken = await refreshAccessToken(userId, provider, connection)
    return newAccessToken
  }

  return accessToken
}

/**
 * Check if a token is expired
 * @param connection - Tool connection object
 * @returns true if expired or expiring soon (within 5 minutes)
 */
export function isTokenExpired(connection: ToolConnection): boolean {
  // If no expiration date, token doesn't expire (like Shopify)
  if (!connection.token_expires_at) {
    return false
  }

  const expiresAt = new Date(connection.token_expires_at)
  const now = new Date()
  
  // Add 5 minute buffer - refresh if expiring in less than 5 minutes
  const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
  
  return now.getTime() >= (expiresAt.getTime() - bufferTime)
}

/**
 * Refresh an access token using the refresh token
 * @param userId - User ID
 * @param provider - Provider name
 * @param connection - Current connection object
 * @returns New decrypted access token
 */
export async function refreshAccessToken(
  userId: string,
  provider: string,
  connection: ToolConnection
): Promise<string> {
  // Check if refresh token exists
  if (!connection.refresh_token) {
    throw new Error(`No refresh token available for provider: ${provider}`)
  }

  // Decrypt refresh token
  const refreshToken = decryptToken(connection.refresh_token)

  // Get provider instance
  const oauthProvider = OAuthProviderFactory.create(provider)

  try {
    // Call provider's refresh method
    const tokens = await oauthProvider.refreshToken(refreshToken)

    // Encrypt new tokens
    const encryptedAccessToken = encryptToken(tokens.accessToken)
    const encryptedRefreshToken = tokens.refreshToken 
      ? encryptToken(tokens.refreshToken)
      : connection.refresh_token // Keep old refresh token if new one not provided

    // Update database with new tokens
    await upsertToolConnection(userId, provider, {
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: tokens.expiresAt || null,
      shopDomain: connection.shop_domain,
      metadata: {
        ...connection.metadata,
        lastRefreshed: new Date().toISOString(),
      },
    })

    console.log(`✅ Token refreshed successfully for ${provider}`)

    return tokens.accessToken

  } catch (error) {
    console.error(`Failed to refresh token for ${provider}:`, error)
    
    // Mark connection as inactive if refresh fails
    await markConnectionInactive(userId, provider)
    
    throw new Error(`Token refresh failed for ${provider}. Please reconnect.`)
  }
}

/**
 * Validate if a token is still valid with the provider
 * @param userId - User ID
 * @param provider - Provider name
 * @returns true if valid, false otherwise
 */
export async function validateToken(
  userId: string,
  provider: string
): Promise<boolean> {
  try {
    const connection = await getToolConnection(userId, provider)
    
    if (!connection) {
      return false
    }

    const accessToken = decryptToken(connection.access_token)
    const oauthProvider = OAuthProviderFactory.create(provider)

    return await oauthProvider.validateToken(accessToken)

  } catch (error) {
    console.error(`Token validation failed for ${provider}:`, error)
    return false
  }
}

/**
 * Mark a connection as inactive (used when token refresh fails)
 * @param userId - User ID
 * @param provider - Provider name
 */
async function markConnectionInactive(
  userId: string,
  provider: string
): Promise<void> {
  const { disconnectTool } = await import('@/lib/supabase/server')
  await disconnectTool(userId, provider)
}

/**
 * Get connection status for a provider
 * @param userId - User ID
 * @param provider - Provider name
 * @returns Connection status object
 */
export async function getConnectionStatus(
  userId: string,
  provider: string
): Promise<{
  connected: boolean
  expiresAt: Date | null
  isExpired: boolean
  needsRefresh: boolean
}> {
  const connection = await getToolConnection(userId, provider)

  if (!connection) {
    return {
      connected: false,
      expiresAt: null,
      isExpired: false,
      needsRefresh: false,
    }
  }

  const expiresAt = connection.token_expires_at 
    ? new Date(connection.token_expires_at) 
    : null

  return {
    connected: connection.is_active,
    expiresAt,
    isExpired: isTokenExpired(connection),
    needsRefresh: isTokenExpired(connection) && !!connection.refresh_token,
  }
}