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

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    
    // Validate days parameter
    if (days !== 30 && days !== 90) {
      return NextResponse.json(
        { success: false, error: 'Days must be 30 or 90' },
        { status: 400 }
      )
    }

    const client = await ShopifyClient.fromConnection(userId)
    const chartData = await client.getChartData(days)

    return NextResponse.json({
      success: true,
      data: chartData
    })
  } catch (error) {
    console.error('Shopify chart data API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch chart data' 
      },
      { status: 500 }
    )
  }
}