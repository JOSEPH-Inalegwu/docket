import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if Shopify connection exists
    const { data: connection, error } = await supabase
      .from('tool_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'shopify')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching connection:', error)
      throw error
    }

    return NextResponse.json({
      connected: !!connection,
      connection: connection || null,
    })
  } catch (error) {
    console.error('Error fetching connection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connection' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete Shopify connection
    const { error: deleteError } = await supabase
      .from('tool_connections')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'shopify')

    if (deleteError) {
      console.error('Error deleting connection:', deleteError)
      throw deleteError
    }

    // Also delete related notifications and product notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)

    await supabase
      .from('product_notifications')
      .delete()
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      message: 'Shopify connection removed successfully',
    })
  } catch (error) {
    console.error('Error disconnecting Shopify:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
