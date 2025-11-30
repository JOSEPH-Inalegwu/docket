'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  CreditCard,
  ExternalLink,
} from 'lucide-react'

interface StripeSummaryResponse {
  stripeUserId: string
  livemode: boolean
  connectedAt: string | null
  lastSynced: string | null
  balance: {
    available?: { amount: number; currency: string }[]
    pending?: { amount: number; currency: string }[]
  }
  metrics: {
    transactionsCount: number
    transactionsTotalAmount: number
    customersCount: number
    productsCount: number
    subscriptionsCount: number
  }
  error?: string
}

export default function StripePage() {
  const router = useRouter()
  const [data, setData] = useState<StripeSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStripeData = async () => {
    try {
      setError(null)
      const res = await fetch('/api/stripe/summary')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 401 || body.error === 'unauthorized') {
          router.push('/sign-in?error=unauthorized')
          return
        }
        if (body.error === 'not_connected') {
          router.push('/dashboard')
          return
        }
        throw new Error(body.error || 'Failed to load Stripe data')
      }

      const json: StripeSummaryResponse = await res.json()
      setData(json)
    } catch {
      setError('Failed to load Stripe data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStripeData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStripeData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center" aria-busy="true" aria-live="polite">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#6c47ff]" />
          <p className="text-gray-600 dark:text-gray-400">
            Checking Stripe connection status...
          </p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <section className="text-center max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-xl font-semibold mb-2">Stripe error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error ?? 'Unable to load Stripe data.'}
          </p>
          <button
            onClick={fetchStripeData}
            className="px-6 py-2 bg-[#6c47ff] text-white rounded-lg hover:bg-[#5a38e6] transition-colors"
          >
            Try again
          </button>
        </section>
      </div>
    )
  }

  const { stripeUserId, livemode, connectedAt, lastSynced, balance, metrics } = data
  const available = balance.available?.[0]
  const pending = balance.pending?.[0]

  const connectedOnText = connectedAt
    ? new Date(connectedAt).toLocaleDateString()
    : null
  const lastSyncedText = lastSynced
    ? new Date(lastSynced).toLocaleTimeString()
    : null

  const modeSegment = livemode ? '' : '/test'
  const dashboardBase = `https://dashboard.stripe.com/${stripeUserId}${modeSegment}`

  const formatMoney = (amount: number | null | undefined, currency = 'usd') => {
    if (!amount) return '$0.00'
    return (amount / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const transactionsCurrency = available?.currency ?? 'usd'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent">
      <main
        className="mx-auto w-full max-w-6xl px-0 md:px-4 py-4 md:py-6 space-y-6 md:space-y-8"
        aria-label="Stripe account overview"
      >
        {/* Header */}
        <header className="space-y-4">
          {/* Row 1: icon + title + View in Stripe */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#635bff]/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-[#635bff]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                  Stripe account overview
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Connected account: {stripeUserId}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                window.open(dashboardBase, '_blank', 'noopener,noreferrer')
              }
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
              aria-label="Open Stripe dashboard in a new tab"
            >
              <span className="text-sm font-medium">View in Stripe dashboard</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2: connected/last synced/mode + Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {connectedOnText && <span>Connected on {connectedOnText}</span>}
              {lastSyncedText && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>Last synced: {lastSyncedText}</span>
                </>
              )}
              <span className="hidden sm:inline">•</span>
              <span>{livemode ? 'Live mode' : 'Test mode'}</span>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
              aria-label="Refresh Stripe data"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              <span className="text-sm font-medium">
                {refreshing ? 'Refreshing…' : 'Refresh data'}
              </span>
            </button>
          </div>
        </header>

        {/* Metric blocks (balances, transactions, customers, products, subscriptions) */}
        <section
          aria-label="Stripe key metrics"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {/* Balances */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 sm:p-6">
            <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
              Balances
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Available
              </div>
              <div className="text-lg font-semibold">
                {available
                  ? formatMoney(available.amount, available.currency)
                  : '$0.00'}
              </div>
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Pending
              </div>
              <div className="text-lg font-semibold">
                {pending
                  ? formatMoney(pending.amount, pending.currency)
                  : '$0.00'}
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 sm:p-6">
            <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
              Transactions
            </div>
            <div className="text-2xl font-semibold">
              {metrics.transactionsCount}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Payments in the latest sample (up to 10).
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Total:{' '}
              {formatMoney(
                metrics.transactionsTotalAmount,
                transactionsCurrency
              )}
            </p>
          </div>

          {/* Customers */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 sm:p-6">
            <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
              Customers
            </div>
            <div className="text-2xl font-semibold">
              {metrics.customersCount}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Recent customers loaded from Stripe.
            </p>
          </div>

          {/* Product catalogue */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 sm:p-6">
            <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
              Product catalogue
            </div>
            <div className="text-2xl font-semibold">
              {metrics.productsCount}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Active products in the latest page.
            </p>
          </div>

          {/* Billing – Subscriptions */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 sm:p-6">
            <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
              Billing – Subscriptions
            </div>
            <div className="text-2xl font-semibold">
              {metrics.subscriptionsCount}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Active subscriptions in the latest page.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
