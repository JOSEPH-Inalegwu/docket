'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useConnection } from '@/hooks/use-connection'
import { useShopifyData } from '@/hooks/use-shopify-data'
import MetricCard from '../sidebar/metric-card'
import OrderCard from '@/components/ui/order-card'
import ProductCard from '@/components/ui/product-card'
import { RevenueChart } from '@/components/ui/revenue-chart'
import { QuickStats } from '@/components/ui/quick-stats'
import {
  ShoppingBag,
  Loader2,
  AlertCircle,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'

export default function ShopifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isConnected, isLoading, error, connectionData, refetch } = useConnection('shopify')

  const [shopDomain, setShopDomain] = useState('')

  // Fetch Shopify data only if connected
  const {
    orders,
    products,
    analytics,
    chartData,
    isLoading: dataLoading, // only true on first load now
    ordersLoading, // NEW: true when fetching orders page
    productsLoading, // NEW: true when fetching products page
    error: dataError,
    refetch: refetchData,
    lastSynced,
    ordersPagination,
    productsPagination,
    handleOrdersPageChange,
    handleProductsPageChange,
    chartDays,
    setChartDays,
  } = useShopifyData(6)

  // Check for successful connection from OAuth callback
  useEffect(() => {
    const connected = searchParams.get('connected')

    if (connected === 'true') {
      console.log('✅ OAuth connection successful')
      refetch()

      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('connected')
      router.replace(newUrl.pathname + newUrl.search)
    }
  }, [searchParams, refetch, router])

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered')
    await refetchData()
  }

  const getShopifyAdminUrl = () => {
    if (!connectionData?.shopDomain) return '#'
    const shopName = connectionData.shopDomain.replace('.myshopify.com', '')
    return `https://admin.shopify.com/store/${shopName}`
  }

  // Loading state - ONLY for connection check now
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center" aria-busy="true" aria-live="polite">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#6c47ff]" />
          <p className="text-gray-600 dark:text-gray-400">
            Checking Shopify connection status...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <section
          className="text-center max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800"
          aria-labelledby="shopify-connection-error-title"
        >
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 id="shopify-connection-error-title" className="text-xl font-semibold mb-2">
            Connection error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-[#6c47ff] text-white rounded-lg hover:bg-[#5a38e6] transition-colors"
          >
            Try again
          </button>
        </section>
      </div>
    )
  }

  // Not connected - redirect to dashboard
  if (!isConnected) {
    router.push('/dashboard')
    return null
  }

  // Connected - show dashboard with real data
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent">
      <main
        className="mx-auto w-full max-w-6xl px-0 md:px-4 py-4 md:py-6 space-y-6 md:space-y-8"
        aria-label="Shopify analytics dashboard"
      >
        {/* Header - unchanged */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#95BF47]/20 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[#95BF47]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                  Shopify dashboard analytics
                </h1>
                {connectionData?.shopDomain && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    Connected store: {connectionData.shopDomain}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.open(getShopifyAdminUrl(), '_blank', 'noopener,noreferrer')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto"
              aria-label="Open Shopify admin in a new tab"
            >
              <span className="text-sm font-medium">View in Shopify admin</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {connectionData?.connectedAt && (
                <span>
                  Connected on {new Date(connectionData.connectedAt).toLocaleDateString()}
                </span>
              )}
              {lastSynced && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>Last synced: {lastSynced.toLocaleTimeString()}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={dataLoading || ordersLoading || productsLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
              aria-label="Refresh Shopify analytics data"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading || ordersLoading || productsLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">
                {dataLoading || ordersLoading || productsLoading ? 'Refreshing…' : 'Refresh data'}
              </span>
            </button>
          </div>
        </header>

        {/* Data Error Banner */}
        {dataError && (
          <section
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex flex-col sm:flex-row items-start gap-3"
            aria-live="polite"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-red-800 dark:text-red-200">
                Failed to load Shopify data
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300 break-words">{dataError}</p>
            </div>
          </section>
        )}

        {/* 1. Analytics Metrics Grid - uses global dataLoading */}
        <section
          aria-label="Key Shopify metrics summary"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <MetricCard
            title="Total orders"
            value={analytics?.totalOrders || 0}
            icon={ShoppingBag}
            iconColor="#6c47ff"
            subtitle="All time"
            loading={dataLoading}
          />
          <MetricCard
            title="Total revenue"
            value={
              analytics?.totalRevenue
                ? `$${analytics.totalRevenue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : '$0.00'
            }
            icon={DollarSign}
            iconColor="#10b981"
            subtitle="All time"
            loading={dataLoading}
          />
          <MetricCard
            title="Total customers"
            value={analytics?.totalCustomers || 0}
            icon={Users}
            iconColor="#f59e0b"
            subtitle="All time"
            loading={dataLoading}
          />
          <MetricCard
            title="Conversion rate"
            value={analytics?.conversionRate ? `${analytics.conversionRate}%` : '0%'}
            icon={TrendingUp}
            iconColor="#ef4444"
            subtitle="Store average"
            loading={dataLoading}
          />
        </section>

        {/* 2. Revenue Chart - uses global dataLoading */}
        <section aria-label="Revenue performance over time">
          <RevenueChart
            data={chartData}
            isLoading={dataLoading}
            days={chartDays}
            onDaysChange={setChartDays}
          />
        </section>

        {/* 3. Quick Stats - uses global dataLoading */}
        <section aria-label="Shopify quick stats">
          <QuickStats analytics={analytics} isLoading={dataLoading} />
        </section>

        {/* 4. Recent Orders Table - NOW uses ordersLoading */}
        <section aria-label="Recent Shopify orders" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold">Recent orders</h2>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {ordersPagination.totalItems} total orders
            </span>
          </div>

          <div className="overflow-x-auto">
            {ordersLoading ? (
              <div className="inline-block min-w-full align-middle">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full table-auto" aria-busy="true">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Fulfillment
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(6)].map((_, i) => (
                        <OrderCard
                          key={i}
                          orderNumber=""
                          customerName=""
                          email=""
                          totalPrice=""
                          financialStatus=""
                          fulfillmentStatus=""
                          createdAt=""
                          loading={true}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : orders.length > 0 ? (
              <div className="inline-block min-w-full align-middle">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Fulfillment
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <OrderCard
                          key={order.id}
                          orderNumber={order.orderNumber}
                          customerName={order.customerName}
                          email={order.email}
                          totalPrice={order.totalPrice}
                          financialStatus={order.financialStatus}
                          fulfillmentStatus={order.fulfillmentStatus}
                          createdAt={order.createdAt}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No orders yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Orders will appear here once customers make purchases.
                </p>
              </div>
            )}
          </div>

          {orders.length > 0 && ordersPagination.totalPages > 1 && (
            <Pagination
              currentPage={ordersPagination.currentPage}
              totalPages={ordersPagination.totalPages}
              onPageChange={handleOrdersPageChange}
              totalItems={ordersPagination.totalItems}
              itemsPerPage={ordersPagination.itemsPerPage}
            />
          )}
        </section>

        {/* 5. Products Table - NOW uses productsLoading */}
        <section aria-label="Shopify products" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold">Products</h2>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {productsPagination.totalItems} total products
            </span>
          </div>

          <div className="overflow-x-auto">
            {productsLoading ? (
              <div className="inline-block min-w-full align-middle">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full table-auto" aria-busy="true">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(6)].map((_, i) => (
                        <ProductCard
                          key={i}
                          title=""
                          status=""
                          totalInventory={0}
                          price=""
                          loading={true}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : products.length > 0 ? (
              <div className="inline-block min-w-full align-middle">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          title={product.title}
                          status={product.status}
                          totalInventory={product.totalInventory}
                          price={product.variants[0]?.price || '$0.00'}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No products yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Add products to your Shopify store to see them here.
                </p>
              </div>
            )}
          </div>

          {products.length > 0 && productsPagination.totalPages > 1 && (
            <Pagination
              currentPage={productsPagination.currentPage}
              totalPages={productsPagination.totalPages}
              onPageChange={handleProductsPageChange}
              totalItems={productsPagination.totalItems}
              itemsPerPage={productsPagination.itemsPerPage}
            />
          )}
        </section>
      </main>
    </div>
  )
}
