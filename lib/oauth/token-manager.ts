import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY) {
  throw new Error(
    'ENCRYPTION_KEY is not set. Generate one with: openssl rand -base64 32'
  )
}

/**
 * Encrypts a token using AES encryption
 * @param token - Plain text token to encrypt
 * @returns Encrypted token as base64 string
 */
export function encryptToken(token: string): string {
  if (!token) {
    throw new Error('Token cannot be empty')
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
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) {
    throw new Error('Encrypted token cannot be empty')
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
export function isValidEncryptedToken(encryptedToken: string): boolean {
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