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

export async function getConnectedStripeTransactions(
  userId: string,
  options?: { limit?: number; startingAfter?: string }
) {
  const connection = await getToolConnection(userId, 'stripe')
  if (!connection) {
    throw new Error('Stripe not connected')
  }

  const metadata = (connection.metadata || {}) as any
  const stripeUserId = metadata.stripeUserId as string | undefined

  if (!stripeUserId) {
    throw new Error('Missing stripeUserId in Stripe connection metadata')
  }

  const limit = options?.limit ?? 10

  const listParams: Stripe.ChargeListParams = {
    limit,
    expand: ['data.customer'],
  }

  if (options?.startingAfter) {
    listParams.starting_after = options.startingAfter
  }

  // List charges for the connected account using Stripe's cursor-based pagination.
  const charges = await stripe.charges.list(listParams, {
    stripeAccount: stripeUserId,
  }) 

  return {
    stripeUserId,
    hasMore: charges.has_more,
    data: charges.data.map((c) => {
      const customerObj =
        typeof c.customer === 'object' && c.customer !== null
          ? (c.customer as Stripe.Customer)
          : null

      const customerEmailFromCustomer =
        customerObj && typeof customerObj.email === 'string'
          ? customerObj.email
          : null

      const customerNameFromCustomer =
        customerObj && typeof customerObj.name === 'string'
          ? customerObj.name
          : null

      return {
        id: c.id,
        created: c.created * 1000,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        customerEmail:
          (typeof c.billing_details?.email === 'string'
            ? c.billing_details.email
            : undefined) ||
          (typeof c.receipt_email === 'string'
            ? c.receipt_email
            : undefined) ||
          customerEmailFromCustomer ||
          null,
        customerName:
          (typeof c.billing_details?.name === 'string'
            ? c.billing_details.name
            : undefined) ||
          customerNameFromCustomer ||
          null,
        cardBrand: c.payment_method_details?.card?.brand ?? null,
        cardLast4: c.payment_method_details?.card?.last4 ?? null,
      }
    })
  }
}
