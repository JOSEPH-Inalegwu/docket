'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useConnection } from '@/hooks/use-connection'
import { useShopifyData } from '@/hooks/use-shopify-data'
import ConnectPrompt from '../connection/connection-prompt'
import MetricCard from '../sidebar/metric-card'
import OrderCard from '@/components/ui/order-card'
import ProductCard from '@/components/ui/product-card'
import { RevenueChart } from '@/components/ui/revenue-chart'
import { QuickStats } from '@/components/ui/quick-stats'
import { ShoppingBag, Loader2, CheckCircle, AlertCircle, DollarSign, Package, Users, TrendingUp, RefreshCw, ExternalLink } from 'lucide-react'

export default function ShopifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isConnected, isLoading, error, connectionData, refetch } = useConnection('shopify')
  
  const [showSuccess, setShowSuccess] = useState(false)
  const [shopDomain, setShopDomain] = useState('')

  // Fetch Shopify data only if connected - changed to 6 items
  const {
    orders,
    products,
    analytics,
    chartData,
    isLoading: dataLoading,
    error: dataError,
    refetch: refetchData,
    lastSynced,
  } = useShopifyData(6);
  const [chartDays, setChartDays] = useState<30 | 90>(30);


  // Debug log to see current state
  console.log('🛠️ ShopifyPage State:', {
    isConnected,
    isLoading,
    error,
    connectionData,
    showSuccess,
    shopDomain
  })

  // Check for successful connection from OAuth callback
  useEffect(() => {
    const connected = searchParams.get('connected')
    console.log('🔍 URL searchParams connected value:', connected)
    console.log('🔍 Full URL:', window.location.href)
    
    if (connected === 'true') {
      console.log('✅ OAuth connection successful - showing notification')
      setShowSuccess(true)
      
      // Force refetch to ensure connection status is updated
      console.log('🔄 Refetching connection status...')
      refetch().then(() => {
        console.log('✅ Connection status refetched')
      })
      
      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        console.log('🗑️ Hiding success notification')
        setShowSuccess(false)
      }, 5000)
      
      // Clean up URL but preserve other parameters if any
      console.log('🔄 Cleaning up URL parameters...')
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('connected')
      router.replace(newUrl.pathname + newUrl.search)
      console.log('✅ URL cleaned up')
      
      return () => clearTimeout(timer)
    } else {
      console.log('❌ No connected parameter found or value is not "true"')
    }
  }, [searchParams, refetch, router])

  const handleConnect = () => {
    if (!shopDomain) {
      alert('Please enter your Shopify store domain')
      return
    }

    // Validate shop domain format
    const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    
    if (!cleanDomain.includes('.myshopify.com')) {
      alert('Please enter a valid Shopify domain (e.g., mystore.myshopify.com)')
      return
    }

    console.log('🔄 Redirecting to OAuth with shop:', cleanDomain)
    
    // Redirect to OAuth initiation with shop parameter
    window.location.href = `/api/auth/oauth/shopify?shop=${encodeURIComponent(cleanDomain)}`
  }

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered')
    await refetchData()
  }

  const getShopifyAdminUrl = () => {
    if (!connectionData?.shopDomain) return '#'
    const shopName = connectionData.shopDomain.replace('.myshopify.com', '')
    return `https://admin.shopify.com/store/${shopName}`
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#6c47ff]" />
          <p className="text-gray-600 dark:text-gray-400">Checking connection status...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-[#6c47ff] text-white rounded-lg hover:bg-[#5a38e6]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Not connected - show connection prompt
  if (!isConnected) {
    return (
      <div className="p-6">
        {/* Success notification */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200 font-medium">
              Successfully connected to Shopify!
            </p>
          </div>
        )}

        {/* Shop domain input for Shopify */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <label className="block text-sm font-medium mb-2">
              Enter your Shopify store domain
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="mystore.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                  bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                  focus:ring-2 focus:ring-[#6c47ff] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleConnect()}
              />
              <button
                onClick={handleConnect}
                disabled={!shopDomain}
                className="px-6 py-2 bg-[#6c47ff] hover:bg-[#5a38e6] disabled:bg-gray-300 dark:disabled:bg-gray-700
                  text-white font-semibold rounded-lg transition-all
                  disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Example: if your store is https://mystore.myshopify.com, enter "mystore.myshopify.com"
            </p>
          </div>
        </div>

        {/* Connection prompt */}
        <ConnectPrompt
          toolName="Shopify"
          toolIcon={ShoppingBag}
          toolColor="#95BF47"
          onConnect={handleConnect}
          docsUrl="https://help.shopify.com/en/api"
        />
      </div>
    )
  }

// Connected - show dashboard with real data
return (
  <div className="p-6">
    {/* Success notification */}
    {showSuccess && (
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        <p className="text-green-800 dark:text-green-200 font-medium">
          Successfully connected to Shopify!
        </p>
      </div>
    )}

    {/* Header with View in Shopify button */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#95BF47]/20 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-[#95BF47]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Shopify Dashboard</h1>
            {connectionData?.shopDomain && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {connectionData.shopDomain}
              </p>
            )}
          </div>
        </div>

        {/* View in Shopify Button */}
        <button
          onClick={() => window.open(getShopifyAdminUrl(), '_blank')}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
            rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="text-sm font-medium">View in Shopify</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Last Synced & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {connectionData?.connectedAt && (
            <span>Connected on {new Date(connectionData.connectedAt).toLocaleDateString()}</span>
          )}
          {lastSynced && (
            <>
              <span>•</span>
              <span>Last synced: {lastSynced.toLocaleTimeString()}</span>
            </>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={dataLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
            rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>
    </div>

    {/* Data Error */}
    {dataError && (
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        <div>
          <p className="text-red-800 dark:text-red-200 font-medium">Failed to load Shopify data</p>
          <p className="text-sm text-red-700 dark:text-red-300">{dataError}</p>
        </div>
      </div>
    )}

    {/* 1. Analytics Metrics Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Orders"
        value={analytics?.totalOrders || 0}
        icon={ShoppingBag}
        iconColor="#6c47ff"
        subtitle="All time"
        loading={dataLoading}
      />
      <MetricCard
        title="Total Revenue"
        value={analytics?.totalRevenue ? `$${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
        icon={DollarSign}
        iconColor="#10b981"
        subtitle="All time"
        loading={dataLoading}
      />
      <MetricCard
        title="Total Customers"
        value={analytics?.totalCustomers || 0}
        icon={Users}
        iconColor="#f59e0b"
        subtitle="All time"
        loading={dataLoading}
      />
      <MetricCard
        title="Conversion Rate"
        value={analytics?.conversionRate ? `${analytics.conversionRate}%` : '0%'}
        icon={TrendingUp}
        iconColor="#ef4444"
        subtitle="Store average"
        loading={dataLoading}
      />
    </div>

    {/* 2. Revenue Chart - Full Width */}
    <div className="mb-8">
      <RevenueChart
        data={chartData}
        isLoading={dataLoading}
        days={chartDays}
        onDaysChange={setChartDays}
      />
    </div>

    {/* 3. Quick Stats - Full Width Row */}
    <div className="mb-8">
      <QuickStats analytics={analytics} isLoading={dataLoading} />
    </div>

    {/* 4. Recent Orders Table */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Orders</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {orders.length} orders
        </span>
      </div>

      {dataLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fulfillment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
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
      ) : orders.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fulfillment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
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
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Orders will appear here once customers make purchases
          </p>
        </div>
      )}
    </div>

    {/* 5. Products Table */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Products</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {products.length} products
        </span>
      </div>

      {dataLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
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
      ) : products.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
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
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No products yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add products to your Shopify store to see them here
          </p>
        </div>
      )}
    </div>
  </div>
)
}