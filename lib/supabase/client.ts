import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Browser-side Supabase client
// Uses anon key and respects RLS policies
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using Clerk for auth
  },
})

// Type definitions for our tables
export type OAuthState = {
  id: string
  user_id: string
  provider: string
  state: string
  expires_at: string
  created_at: string
}

export type ToolConnection = {
  id: string
  user_id: string
  provider: string
  access_token: string
  refresh_token: string | null
  shop_domain: string | null
  token_expires_at: string | null
  connected_at: string
  last_synced_at: string | null
  is_active: boolean
  metadata: Record<string, any> | null
}

export type ApiUsage = {
  id: string
  user_id: string
  provider: string
  endpoint: string
  request_count: number
  window_start: string
  window_end: string
  created_at: string
}

// Database schema type
export type Database = {
  public: {
    Tables: {
      oauth_states: {
        Row: OAuthState
        Insert: Omit<OAuthState, 'id' | 'created_at'>
        Update: Partial<Omit<OAuthState, 'id' | 'created_at'>>
      }
      tool_connections: {
        Row: ToolConnection
        Insert: Omit<ToolConnection, 'id' | 'connected_at'>
        Update: Partial<Omit<ToolConnection, 'id' | 'connected_at'>>
      }
      api_usage: {
        Row: ApiUsage
        Insert: Omit<ApiUsage, 'id' | 'created_at'>
        Update: Partial<Omit<ApiUsage, 'id' | 'created_at'>>
      }
    }
  }
}