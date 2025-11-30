// app/api/stripe/transactions/route.ts

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getConnectedStripeTransactions } from '@/lib/stripe/connected'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const limitParam = searchParams.get('limit')
  const startingAfter = searchParams.get('starting_after') || undefined

  const limit = limitParam ? Math.min(Math.max(Number(limitParam), 1), 50) : 10

  try {
    const result = await getConnectedStripeTransactions(userId, {
      limit,
      startingAfter,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching Stripe transactions:', error)

    if (error?.message === 'Stripe not connected') {
      return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'stripe_transactions_failed' },
      { status: 500 }
    )
  }
}
