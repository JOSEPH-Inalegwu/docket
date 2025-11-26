import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ShopifyClient } from '@/lib/shopify/shopify-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Get user settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    // If notifications disabled or no settings, skip
    if (!settings || !settings.notifications_enabled) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notifications disabled',
        checked: 0 
      })
    }

    const threshold = settings.default_low_stock_threshold

    // 2. Check if Shopify is connected
    const { data: connection } = await supabase
      .from('tool_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'shopify')
      .eq('is_active', true)
      .single()

    if (!connection) {
      return NextResponse.json({ 
        success: true, 
        message: 'No Shopify connection',
        checked: 0 
      })
    }

    // 3. Use ShopifyClient to fetch products
    const client = await ShopifyClient.fromConnection(userId)
    const { products } = await client.getProducts(250, 1) // Get all products (up to 250)

    let notificationsCreated = 0

    // 4. Check each product against threshold
    for (const product of products) {
      const totalInventory = product.variants.reduce(
        (sum: number, variant: any) => sum + (variant.inventory_quantity || 0),
        0
      )

      // Only create notification if stock is low
      if (totalInventory <= threshold) {
        // Check if already notified about this product in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: existingState } = await supabase
          .from('product_notification_state')
          .select('*')
          .eq('user_id', userId)
          .eq('shopify_product_id', product.id.toString())
          .single()

        // Skip if we notified recently
        if (existingState?.last_notified_at && existingState.last_notified_at > oneDayAgo) {
          continue
        }

        // Create notification
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            product_id: product.id.toString(),
            product_name: product.title,
            type: 'LOW_STOCK',
            title: 'Low Stock Alert',
            message: `${product.title} is running low (${totalInventory} items left)`,
            quantity: totalInventory,
            threshold: threshold,
            is_read: false,
          })

        if (notifError) {
          console.error('Error creating notification:', notifError)
          continue
        }

        // Update notification state
        await supabase
          .from('product_notification_state')
          .upsert(
            {
              user_id: userId,
              shopify_product_id: product.id.toString(),
              product_name: product.title,
              last_notified_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id,shopify_product_id',
            }
          )

        notificationsCreated++
      }
    }

    return NextResponse.json({
      success: true,
      checked: products.length,
      notificationsCreated,
    })
  } catch (error) {
    console.error('Notification check error:', error)
    return NextResponse.json(
      { error: 'Failed to check notifications' },
      { status: 500 }
    )
  }
}
