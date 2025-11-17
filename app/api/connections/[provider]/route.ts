import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getToolConnection, disconnectTool } from '@/lib/supabase/server'

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
    
    console.log('🔍 Connections API - User ID:', userId)
    
    if (!userId) {
      console.log('❌ Connections API - No user ID found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { provider: providerParam } = await params
    const provider = providerParam.toLowerCase()

    console.log('🔍 Connections API - Checking provider:', provider)

    // Get connection from database
    const connection = await getToolConnection(userId, provider)
    console.log('🔍 Connections API - Connection found:', connection)

    if (!connection) {
      console.log('🔍 Connections API - No connection found')
      return NextResponse.json({
        isConnected: false,
        provider,
      })
    }

    // Check if connection is active (use is_active field from your database)
    const isActive = connection.is_active
    
    // Check if token is expired (use token_expires_at from your database schema)
    const isExpired = connection.token_expires_at 
      ? new Date(connection.token_expires_at) < new Date()
      : false

    const isConnected = isActive && !isExpired

    console.log('🔍 Connections API - Connection status:', {
      isConnected,
      isActive,
      isExpired,
      expiresAt: connection.token_expires_at,
      deletedAt: connection.deleted_at
    })

    // ✅ FIX: Return FLAT structure that matches the hook's interface
    return NextResponse.json({
      isConnected: isConnected,
      provider: provider,
      connectedAt: connection.connected_at,
      shopDomain: connection.shop_domain,
      isExpired: isExpired,
      metadata: connection.metadata,
      // Don't include isLoading, error, or connectionData - the hook manages those
    })

  } catch (error) {
    console.error('Error checking connection status:', error)
    return NextResponse.json(
      { 
        isConnected: false,
        error: 'Failed to check connection status',
      },
      { status: 500 }
    )
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
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { provider: providerParam } = await params
    const provider = providerParam.toLowerCase()

    // Disconnect the tool (soft delete)
    await disconnectTool(userId, provider)
    
    console.log(`Disconnected ${provider} for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: `Successfully disconnected ${provider}`,
      provider,
    })

  } catch (error) {
    console.error('Error disconnecting provider:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect provider' },
      { status: 500 }
    )
  }
}