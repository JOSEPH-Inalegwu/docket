import { useState, useEffect, useCallback, useRef } from 'react'

interface ShopifyData {
  orders: any[]
  products: any[]
  analytics: any
  chartData: { date: string; revenue: number; orderCount: number }[]
  isLoading: boolean 
  error: string | null
  refetch: () => void
  lastSynced: Date | null
  chartDays: 30 | 90
  setChartDays: (days: 30 | 90) => void
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

  ordersLoading: boolean
  productsLoading: boolean
}

export function useShopifyData(limit: number = 10): ShopifyData {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [chartDays, setChartDays] = useState<30 | 90>(30)
  
  // Skip fetching if limit is 0 (disconnected state)
  const shouldFetch = limit > 0
  
  // Global loading only for initial mount
  const [isLoading, setIsLoading] = useState(true)
  const isInitialLoad = useRef(true)
  
  // Per-section loading for pagination/filters
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  
  const [error, setError] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState<Date | null>(null)

  // Pagination state
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersTotalCount, setOrdersTotalCount] = useState(0)
  const ordersPerPage = 10

  const [productsPage, setProductsPage] = useState(1)
  const [productsTotalCount, setProductsTotalCount] = useState(0)
  const productsPerPage = 10

  const fetchData = useCallback(async () => {
    // Skip if not connected
    if (!shouldFetch) {
      setIsLoading(false)
      isInitialLoad.current = false
      return
    }

    // Only show full-page loading on the very first fetch
    if (isInitialLoad.current) {
      setIsLoading(true)
    } else {
      // On subsequent fetches, show only section-level loaders
      setOrdersLoading(true)
      setProductsLoading(true)
    }
    
    setError(null)

    try {
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
        if (ordersData.totalCount !== undefined) {
          setOrdersTotalCount(ordersData.totalCount)
        }
      }
      
      if (productsData.success) {
        setProducts(productsData.products)
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
      // Clear all loading states
      if (isInitialLoad.current) {
        setIsLoading(false)
        isInitialLoad.current = false
      }
      setOrdersLoading(false)
      setProductsLoading(false)
    }
  }, [chartDays, ordersPage, productsPage, shouldFetch]) 

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
    ordersLoading, 
    productsLoading, 
    error,
    refetch: fetchData,
    lastSynced,
    chartDays,
    setChartDays,
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

