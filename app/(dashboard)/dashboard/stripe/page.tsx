'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MetricCard from '../sidebar/metric-card'
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  CreditCard,
  ExternalLink,
  DollarSign,
  Users,
  Package,
  TrendingUp,
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

interface StripeTransaction {
  id: string
  created: number
  amount: number
  currency: string
  status: string
  customerEmail: string | null
  cardBrand: string | null
  cardLast4: string | null
}

interface StripeTransactionsResponse {
  stripeUserId: string
  hasMore: boolean
  data: StripeTransaction[]
}

export default function StripePage() {
  const router = useRouter()
  const [data, setData] = useState<StripeSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const [transactions, setTransactions] = useState<StripeTransaction[]>([])
  const [transactionsHasMore, setTransactionsHasMore] = useState(false)
  const [transactionsLoading, setTransactionsLoading] = useState(true)

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

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true)
      const res = await fetch('/api/stripe/transactions?limit=10')
      if (!res.ok) {
        console.error('Failed to load Stripe transactions')
        setTransactions([])
        setTransactionsHasMore(false)
        return
      }

      const json: StripeTransactionsResponse = await res.json()
      setTransactions(json.data)
      setTransactionsHasMore(json.hasMore)
    } catch (e) {
      console.error('Error loading Stripe transactions', e)
      setTransactions([])
      setTransactionsHasMore(false)
    } finally {
      setTransactionsLoading(false)
    }
  }

  useEffect(() => {
    fetchStripeData()
    fetchTransactions()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchStripeData(), fetchTransactions()])
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <MetricCard
            title="Balances"
            value={
              available
                ? `${formatMoney(available.amount, available.currency)}`
                : '$0.00'
            }
            icon={DollarSign}
            iconColor="#10b981"
            subtitle={
              pending
                ? `Pending: ${formatMoney(pending.amount, pending.currency)}`
                : 'Available / pending'
            }
            loading={refreshing}
          />

          <MetricCard
            title="Transactions"
            value={metrics.transactionsCount}
            icon={CreditCard}
            iconColor="#6c47ff"
            subtitle={`Total: ${formatMoney(
              metrics.transactionsTotalAmount,
              transactionsCurrency
            )}`}
            loading={refreshing}
          />

          <MetricCard
            title="Customers"
            value={metrics.customersCount}
            icon={Users}
            iconColor="#f59e0b"
            subtitle="Recent Stripe customers"
            loading={refreshing}
          />

          <MetricCard
            title="Active subscriptions"
            value={metrics.subscriptionsCount}
            icon={TrendingUp}
            iconColor="#ef4444"
            subtitle="Billing subscriptions (sample)"
            loading={refreshing}
          />
        </section>

        {/* Recent transactions */}
        <section
          aria-label="Recent Stripe transactions"
          className="space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold">Recent transactions</h2>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Showing up to 10 latest charges from this connected account
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                {transactionsLoading ? (
                  <div className="p-6 flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[#6c47ff]" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Loading transactions…
                    </span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No transactions yet. New payments for this connected account
                    will appear here.
                  </div>
                ) : (
                  <table className="min-w-full table-auto text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Payment method
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Details
                        </th>

                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-gray-100 dark:border-gray-700/60 last:border-b-0"
                        >
                          <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-200">
                            {new Date(tx.created).toLocaleString()}
                          </td>
                          <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-200">
                            {tx.customerEmail ?? '—'}
                          </td>
                          <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900 dark:text-gray-100 font-medium">
                            {formatMoney(tx.amount, tx.currency)}
                          </td>
                          <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                tx.status === 'succeeded'
                                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-700 dark:text-gray-200">
                            {tx.cardBrand && tx.cardLast4
                              ? `${tx.cardBrand.toUpperCase()} •••• ${tx.cardLast4}`
                              : '—'}
                          </td>
                          <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const prefix = livemode ? '' : '/test'
                                const url = `https://dashboard.stripe.com${prefix}/b/${stripeUserId}?destination=/payments/${tx.id}`
                                window.open(url, '_blank', 'noopener,noreferrer')
                              }}
                              className="inline-flex items-center justify-center rounded-md border border-gray-200 gap-1.5  dark:border-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              aria-label="View payment in Stripe dashboard"
                            >
                              View
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
