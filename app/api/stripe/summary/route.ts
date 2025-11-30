// app/api/stripe/summary/route.ts

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getConnectedStripeSummary } from '@/lib/stripe/connected'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const summary = await getConnectedStripeSummary(userId)
    return NextResponse.json(summary)
  } catch (error: any) {
    console.error('Error fetching Stripe summary:', error)

    if (error?.message === 'Stripe not connected') {
      return NextResponse.json({ error: 'not_connected' }, { status: 400 })
    }

    return NextResponse.json({ error: 'stripe_summary_failed' }, { status: 500 })
  }
}
