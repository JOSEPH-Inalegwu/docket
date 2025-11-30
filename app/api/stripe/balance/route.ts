// app/api/stripe/balance/route.ts

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getConnectedStripeBalance } from '@/lib/stripe/connected'
import { getToolConnection } from '@/lib/supabase/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const connection = await getToolConnection(userId, 'stripe')
    if (!connection) {
      return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }

    const { balance, stripeUserId } = await getConnectedStripeBalance(userId)

    const metadata = (connection.metadata || {}) as any
    const livemode = Boolean(metadata.livemode) 
    const now = new Date().toISOString()

    return NextResponse.json({
      connectedAccountId: stripeUserId,
      balance,
      connectedAt: connection.connected_at,
      lastSynced: now,
      livemode,
    })
  } catch (error) {
    console.error('Error fetching Stripe balance:', error)
    return NextResponse.json(
      { error: 'stripe_balance_failed' },
      { status: 500 }
    )
  }
}
