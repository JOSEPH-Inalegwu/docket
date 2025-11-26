'use client'
import { useState, useEffect } from 'react'

interface ConnectionStatus {
  isConnected: boolean
  provider: string
  connectedAt?: string
  lastSyncedAt?: string | null
  shopDomain?: string | null
  isExpired?: boolean
  metadata?: Record<string, any> | null
}

interface UseConnectionReturn {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  connectionData: ConnectionStatus | null
  refetch: () => Promise<void>
  disconnect: () => Promise<void>
}

/**
 * Hook to check connection status for a provider
 * @param provider - Provider name (shopify, stripe, etc.)
 */
export function useConnection(provider: string): UseConnectionReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionData, setConnectionData] = useState<ConnectionStatus | null>(null)

  const fetchConnectionStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔍 useConnection - Fetching status for:', provider)
      
      const response = await fetch(`/api/connections/${provider}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch connection status: ${response.status}`)
      }

      const data = await response.json()
      
      console.log('🔍 useConnection - API Response:', data)
      
      // ✅ FIX: Check the correct field name from API
      const connected = data.connected === true
      
      setIsConnected(connected)
      
      // ✅ FIX: Use the connection object from API response
      if (connected && data.connection) {
        setConnectionData({
          isConnected: connected,
          provider: provider,
          connectedAt: data.connection.connected_at,
          lastSyncedAt: data.connection.last_synced_at,
          shopDomain: data.connection.shop_domain,
          isExpired: false,
          metadata: data.connection.metadata
        })
      } else {
        setConnectionData(null)
      }
      
    } catch (err) {
      console.error('❌ useConnection - Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsConnected(false)
      setConnectionData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    try {
      setError(null)

      const response = await fetch(`/api/connections/${provider}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      // Update state after successful disconnect
      setIsConnected(false)
      setConnectionData(null)

      // Refetch to confirm
      await fetchConnectionStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
      throw err
    }
  }

  useEffect(() => {
    fetchConnectionStatus()
  }, [provider])

  return {
    isConnected,
    isLoading,
    error,
    connectionData,
    refetch: fetchConnectionStatus,
    disconnect,
  }
}

/**
 * Hook to fetch ALL connection statuses at once
 * More efficient for sidebar/dashboard that shows multiple providers
 */
export function useConnections() {
  const [connections, setConnections] = useState<Record<string, ConnectionStatus>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConnections = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔍 useConnections - Fetching all connections')

      const response = await fetch('/api/connections')

      if (!response.ok) {
        throw new Error(`Failed to fetch connections: ${response.status}`)
      }

      const data = await response.json()

      console.log('🔍 useConnections - API Response:', data)

      setConnections(data.connections || {})
    } catch (err) {
      console.error('❌ useConnections - Error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setConnections({})
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const isConnected = (provider: string): boolean => {
    return connections[provider]?.isConnected ?? false
  }

  const getConnection = (provider: string): ConnectionStatus | null => {
    return connections[provider] || null
  }

  return {
    connections,
    isLoading,
    error,
    isConnected,
    getConnection,
    refetch: fetchConnections,
  }
}