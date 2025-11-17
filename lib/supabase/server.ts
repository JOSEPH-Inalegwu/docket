import { createClient } from '@supabase/supabase-js'
import { Database } from './client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase service role environment variables')
}

// Server-side Supabase client with service role key
// BYPASSES RLS - use only in API routes and server components
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Helper functions for common operations

/**
 * Store OAuth state for CSRF protection
 */
export async function storeOAuthState(
  userId: string,
  provider: string,
  state: string
) {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  const { data, error } = await supabaseAdmin
    .from('oauth_states')
    .insert({
      user_id: userId,
      provider,
      state,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error storing OAuth state:', error)
    throw new Error('Failed to store OAuth state')
  }

  return data
}

/**
 * Verify OAuth state and delete after use
 */
export async function verifyAndConsumeOAuthState(
  state: string,
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from('oauth_states')
    .select()
    .eq('state', state)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    // Delete expired state
    await supabaseAdmin.from('oauth_states').delete().eq('id', data.id)
    return null
  }

  // Delete state after verification (one-time use)
  await supabaseAdmin.from('oauth_states').delete().eq('id', data.id)

  return data
}

/**
 * Store or update tool connection
 */
export async function upsertToolConnection(
  userId: string,
  provider: string,
  data: {
    accessToken: string
    refreshToken?: string | null
    shopDomain?: string | null
    expiresAt?: Date | null
    metadata?: Record<string, any> | null
  }
) {
  const { data: connection, error } = await supabaseAdmin
    .from('tool_connections')
    .upsert(
      {
        user_id: userId,
        provider,
        access_token: data.accessToken,
        refresh_token: data.refreshToken || null,
        shop_domain: data.shopDomain || null,
        token_expires_at: data.expiresAt?.toISOString() || null,
        is_active: true,
        metadata: data.metadata || null,
        last_synced_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,provider',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting tool connection:', error)
    throw new Error('Failed to store connection')
  }

  return connection
}

/**
 * Get tool connection for user
 */
export async function getToolConnection(userId: string, provider: string) {
  const { data, error } = await supabaseAdmin
    .from('tool_connections')
    .select()
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('is_active', true)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Get all active connections for user
 */
export async function getUserConnections(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('tool_connections')
    .select()
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching user connections:', error)
    return []
  }

  return data
}

/**
 * Disconnect tool (soft delete)
 */
export async function disconnectTool(userId: string, provider: string) {
  const { error } = await supabaseAdmin
    .from('tool_connections')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('provider', provider)

  if (error) {
    console.error('Error disconnecting tool:', error)
    throw new Error('Failed to disconnect tool')
  }

  return true
}

/**
 * Check API rate limit
 */
export async function checkRateLimit(
  userId: string,
  provider: string,
  maxRequestsPerHour: number = 100
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date()
  windowStart.setMinutes(0, 0, 0) // Start of current hour
  const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000) // End of hour

  // Get current usage for this hour
  const { data, error } = await supabaseAdmin
    .from('api_usage')
    .select('request_count')
    .eq('user_id', userId)
    .eq('provider', provider)
    .gte('window_start', windowStart.toISOString())
    .lt('window_end', windowEnd.toISOString())
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found (first request in window)
    console.error('Error checking rate limit:', error)
    return { allowed: false, remaining: 0 }
  }

  const currentCount = data?.request_count || 0
  const remaining = Math.max(0, maxRequestsPerHour - currentCount)

  return {
    allowed: currentCount < maxRequestsPerHour,
    remaining,
  }
}

/**
 * Increment API usage counter
 */
export async function incrementApiUsage(
  userId: string,
  provider: string,
  endpoint: string
) {
  const windowStart = new Date()
  windowStart.setMinutes(0, 0, 0)
  const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000)

  // Try to increment existing record
  const { data: existing } = await supabaseAdmin
    .from('api_usage')
    .select()
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString())
    .lt('window_end', windowEnd.toISOString())
    .single()

  if (existing) {
    // Increment count
    await supabaseAdmin
      .from('api_usage')
      .update({ request_count: existing.request_count + 1 })
      .eq('id', existing.id)
  } else {
    // Create new record
    await supabaseAdmin.from('api_usage').insert({
      user_id: userId,
      provider,
      endpoint,
      request_count: 1,
      window_start: windowStart.toISOString(),
      window_end: windowEnd.toISOString(),
    })
  }
}

/**
 * Cleanup expired OAuth states (can be called by cron job)
 */
export async function cleanupExpiredOAuthStates() {
  const { error } = await supabaseAdmin.rpc('cleanup_expired_oauth_states')

  if (error) {
    console.error('Error cleaning up OAuth states:', error)
  }
}

/**
 * Cleanup old API usage records (can be called by cron job)
 */
export async function cleanupOldApiUsage() {
  const { error } = await supabaseAdmin.rpc('cleanup_old_api_usage')

  if (error) {
    console.error('Error cleaning up API usage:', error)
  }
}