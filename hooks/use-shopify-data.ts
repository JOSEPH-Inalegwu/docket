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

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [ordersRes, productsRes, analyticsRes, chartRes] = await Promise.all([
        fetch(`/api/shopify/orders?limit=${limit}`),
        fetch(`/api/shopify/products?limit=${limit}`),
        fetch(`/api/shopify/analytics`),
        fetch(`/api/shopify/chart-data?days=${chartDays}`)
      ])

      const [ordersData, productsData, analyticsData, chartDataRes] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        analyticsRes.json(),
        chartRes.json()
      ])

      if (ordersData.success) setOrders(ordersData.orders)
      if (productsData.success) setProducts(productsData.products)
      if (analyticsData.success) setAnalytics(analyticsData.analytics)
      if (chartDataRes.success) setChartData(chartDataRes.data)

      setLastSynced(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Error fetching Shopify data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [limit, chartDays])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
    setChartDays
  }
}