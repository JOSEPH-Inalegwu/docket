import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ShopifyClient } from '@/lib/shopify/shopify-client'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get limit from query params (default 10)
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')

    // Create Shopify client from user's connection
    const client = await ShopifyClient.fromConnection(userId)

    // Fetch orders
    const orders = await client.getOrders(limit)

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    })
  } catch (error) {
    console.error('Shopify orders API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders' 
      },
      { status: 500 }
    )
  }
}