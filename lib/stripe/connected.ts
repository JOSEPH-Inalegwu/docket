// lib/stripe/connected.ts

import Stripe from 'stripe'
import { getToolConnection } from '@/lib/supabase/server'

const STRIPE_PLATFORM_SECRET_KEY = process.env.STRIPE_PLATFORM_SECRET_KEY

if (!STRIPE_PLATFORM_SECRET_KEY) {
  throw new Error('STRIPE_PLATFORM_SECRET_KEY is not set')
}

const stripe = new Stripe(STRIPE_PLATFORM_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export async function getConnectedStripeBalance(userId: string) {
  const connection = await getToolConnection(userId, 'stripe')
  if (!connection) {
    throw new Error('Stripe is not connected for this user')
  }

  const metadata = (connection.metadata || {}) as any
  const stripeUserId = metadata.stripeUserId as string | undefined

  if (!stripeUserId) {
    throw new Error('Missing stripeUserId in Stripe connection metadata')
  }

  // Retrieve balance for the connected account.
  const balance = await stripe.balance.retrieve({
    stripeAccount: stripeUserId,
  })

  return { balance, stripeUserId }
}

export async function getConnectedStripeSummary(userId: string) {
  const connection = await getToolConnection(userId, 'stripe')
  if (!connection) {
    throw new Error('Stripe not connected')
  }

  const metadata = (connection.metadata || {}) as any
  const stripeUserId = metadata.stripeUserId as string | undefined
  const livemode = Boolean(metadata.livemode)

  if (!stripeUserId) {
    throw new Error('Missing stripeUserId in Stripe connection metadata')
  }

  // Fetch all needed data in parallel, acting on behalf of the connected account.
  const [balance, charges, customers, products, subscriptions] = await Promise.all([
    stripe.balance.retrieve({ stripeAccount: stripeUserId }),
    stripe.charges.list({ limit: 10, stripeAccount: stripeUserId }),
    stripe.customers.list({ limit: 10, stripeAccount: stripeUserId }),
    stripe.products.list({ limit: 10, active: true, stripeAccount: stripeUserId }),
    stripe.subscriptions.list({
      limit: 10,
      status: 'active',
      stripeAccount: stripeUserId,
    }),
  ])

  const totalChargeAmount = charges.data
    .filter((c) => c.status === 'succeeded')
    .reduce((sum, c) => sum + (c.amount ?? 0), 0)

  return {
    stripeUserId,
    livemode,
    connectedAt: connection.connected_at,
    lastSynced: new Date().toISOString(),
    balance,
    metrics: {
      transactionsCount: charges.data.length,
      transactionsTotalAmount: totalChargeAmount,
      customersCount: customers.data.length,
      productsCount: products.data.length,
      subscriptionsCount: subscriptions.data.length,
    },
  }
}
