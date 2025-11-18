import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getToolConnection, disconnectTool } from '@/lib/supabase/server'

// ✅ Define the type for your connection
interface ToolConnection {
  is_active: boolean
  token_expires_at: string | null
  connected_at: string
  shop_domain: string | null
  metadata: Record<string, any> | null
  deleted_at: string | null
  [key: string]: any
}

/**
 * GET /api/connections/[provider]
 * Check if user has an active connection for the specified provider
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { provider: providerParam } = await params
    const provider = providerParam.toLowerCase()

    // Get connection from database
    const connection = await getToolConnection(userId, provider) as ToolConnection | null
    if (!connection) {
      return NextResponse.json({ isConnected: false, provider })
    }

    // Check if connection is active
    const isActive = connection.is_active

    // Check if token is expired
    const isExpired = connection.token_expires_at 
      ? new Date(connection.token_expires_at) < new Date()
      : false

    const isConnected = isActive && !isExpired

    return NextResponse.json({
      isConnected,
      provider,
      connectedAt: connection.connected_at,
      shopDomain: connection.shop_domain,
      isExpired,
      metadata: connection.metadata,
    })

  } catch (error) {
    console.error('Error checking connection status:', error)
    return NextResponse.json({ isConnected: false, error: 'Failed to check connection status' }, { status: 500 })
  }
}

/**
 * DELETE /api/connections/[provider]
 * Disconnect/revoke access for the specified provider
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { provider: providerParam } = await params
    const provider = providerParam.toLowerCase()

    // Disconnect the tool (soft delete)
    await disconnectTool(userId, provider)

    return NextResponse.json({
      success: true,
      message: `Successfully disconnected ${provider}`,
      provider,
    })

  } catch (error) {
    console.error('Error disconnecting provider:', error)
    return NextResponse.json({ error: 'Failed to disconnect provider' }, { status: 500 })
  }
}
