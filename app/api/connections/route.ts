import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserConnections } from '@/lib/supabase/server'

/**
 * GET /api/connections
 * Get all active connections for the current user
 */
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all connections for user
    const connections = await getUserConnections(userId)

    // Transform to a simple map of provider -> connection status
    const connectionStatus = connections.reduce((acc, conn) => {
      const isExpired = conn.token_expires_at 
        ? new Date(conn.token_expires_at) < new Date()
        : false

      acc[conn.provider] = {
        isConnected: conn.is_active && !isExpired,
        connectedAt: conn.connected_at,
        shopDomain: conn.shop_domain,
        isExpired,
        metadata: conn.metadata,
      }

      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      connections: connectionStatus,
    })

  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch connections' }, 
      { status: 500 }
    )
  }
}