import { useState, useEffect, useCallback } from 'react'

interface ShopifyData {
  orders: any[]
  products: any[]
  analytics: any
  chartData: { date: string; revenue: number; orderCount: number }[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  lastSynced: Date | null
  chartDays: number
  setChartDays: (days: 30 | 90) => void
  // NEW: Pagination data
  ordersPagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  productsPagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
  handleOrdersPageChange: (page: number) => void
  handleProductsPageChange: (page: number) => void
}

export function useShopifyData(limit: number = 10): ShopifyData {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [chartDays, setChartDays] = useState<30 | 90>(30)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  // Pagination state for orders
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalCount, setOrdersTotalCount] = useState(0)
  const ordersPerPage = 10

  // Pagination state for products
  const [productsPage, setProductsPage] = useState(1)
  const [productsTotalCount, setProductsTotalCount] = useState(0)
  const productsPerPage = 10

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel with pagination
      const [ordersRes, productsRes, analyticsRes, chartRes] = await Promise.all([
        fetch(`/api/shopify/orders?limit=${ordersPerPage}&page=${ordersPage}`),
        fetch(`/api/shopify/products?limit=${productsPerPage}&page=${productsPage}`),
        fetch(`/api/shopify/analytics`),
        fetch(`/api/shopify/chart-data?days=${chartDays}`)
      ])

      const [ordersData, productsData, analyticsData, chartDataRes] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        analyticsRes.json(),
        chartRes.json()
      ])

      if (ordersData.success) {
        setOrders(ordersData.orders)
        // NEW: Set total count if API returns it
        if (ordersData.totalCount !== undefined) {
          setOrdersTotalCount(ordersData.totalCount)
        }
      }
      
      if (productsData.success) {
        setProducts(productsData.products)
        // NEW: Set total count if API returns it
        if (productsData.totalCount !== undefined) {
          setProductsTotalCount(productsData.totalCount)
        }
      }
      
      if (analyticsData.success) setAnalytics(analyticsData.analytics)
      if (chartDataRes.success) setChartData(chartDataRes.data)

      setLastSynced(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Error fetching Shopify data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [chartDays, ordersPage, productsPage]) // Added ordersPage and productsPage

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // NEW: Page change handlers
  const handleOrdersPageChange = (page: number) => {
    setOrdersPage(page)
  }

  const handleProductsPageChange = (page: number) => {
    setProductsPage(page)
  }

  return {
    orders,
    products,
    analytics,
    chartData,
    isLoading,
    error,
    refetch: fetchData,
    lastSynced,
    chartDays,
    setChartDays,
    // NEW: Return pagination data
    ordersPagination: {
      currentPage: ordersPage,
      totalPages: Math.ceil(ordersTotalCount / ordersPerPage),
      totalItems: ordersTotalCount,
      itemsPerPage: ordersPerPage,
    },
    productsPagination: {
      currentPage: productsPage,
      totalPages: Math.ceil(productsTotalCount / productsPerPage),
      totalItems: productsTotalCount,
      itemsPerPage: productsPerPage,
    },
    handleOrdersPageChange,
    handleProductsPageChange,
  }
}
