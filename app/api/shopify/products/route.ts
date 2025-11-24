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

    // Get pagination params from query
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    // Create Shopify client from user's connection
    const client = await ShopifyClient.fromConnection(userId)

    // Fetch products with pagination
    const { products, totalCount } = await client.getProducts(limit, page)

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      totalCount, 
      currentPage: page, 
      totalPages: Math.ceil(totalCount / limit), 
    })
  } catch (error) {
    console.error('Shopify products API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch products' 
      },
      { status: 500 }
    )
  }
}
