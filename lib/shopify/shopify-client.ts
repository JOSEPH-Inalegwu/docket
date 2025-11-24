// lib/shopify/shopify-client.ts
import { decryptToken } from '@/lib/oauth/token-manager'

// Mock data toggle - controlled by environment variable
const USE_MOCK_DATA = process.env.SHOPIFY_USE_MOCK_DATA === 'true'

interface ShopifyClientConfig {
  shopDomain: string
  accessToken: string
}

interface ShopifyOrder {
  id: string
  orderNumber: string 
  customerName: string  
  email: string
  createdAt: string
  totalPrice: string
  currency: string
  financialStatus: string
  fulfillmentStatus: string
  lineItemsCount: number
}


interface ShopifyProduct {
  id: string
  title: string
  status: string
  totalInventory: number
  variants: {
    id: string
    price: string
    inventoryQuantity: number
  }[]
  createdAt: string
}

interface ShopifyAnalytics {
  totalOrders: number
  totalRevenue: string
  averageOrderValue: string
  totalCustomers: number
  conversionRate: number
}

export class ShopifyClient {
  private shopDomain: string
  private accessToken: string
  private apiVersion = '2024-01'

  constructor(config: ShopifyClientConfig) {
    this.shopDomain = config.shopDomain
    this.accessToken = config.accessToken
  }

  /**
   * Make GraphQL request to Shopify
   */
  private async graphql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    if (USE_MOCK_DATA) {
      console.log('🎭 Using mock data for Shopify API')
      return this.getMockResponse<T>(query)
    }

    const url = `https://${this.shopDomain}/admin/api/${this.apiVersion}/graphql.json`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
    }

    return result.data as T
  }

  async getChartData(days: number = 30): Promise<{ date: string; revenue: number; orderCount: number }[]> {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic varying data
    const baseOrders = 3 + Math.floor(Math.random() * 8);
    const baseRevenue = baseOrders * (200 + Math.random() * 400);
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(baseRevenue * 100) / 100,
      orderCount: baseOrders
    });
  }

  return data;
  }

  /**
   * Fetch orders from Shopify
   */
  async getOrders(limit: number = 10, page: number = 1): Promise<{ orders: ShopifyOrder[], totalCount: number }> {
  // Main query with pagination
  const query = `
    query GetOrders($limit: Int!, $after: String) {
      orders(first: $limit, after: $after, sortKey: CREATED_AT, reverse: true) {
        edges {
          cursor
          node {
            id
            name
            customer {
              displayName
            }
            email
            createdAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            displayFinancialStatus
            displayFulfillmentStatus
            lineItems(first: 250) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  // Separate query to get total count (fetch max 250 to count)
  const countQuery = `
    query GetOrdersCount {
      orders(first: 250, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  // Calculate cursor for pagination
  let cursor = null;
  if (page > 1) {
    const skipCount = (page - 1) * limit;
    const skipQuery = `
      query SkipOrders($skip: Int!) {
        orders(first: $skip, sortKey: CREATED_AT, reverse: true) {
          edges {
            cursor
          }
        }
      }
    `;
    const skipData = await this.graphql<any>(skipQuery, { skip: skipCount });
    if (skipData?.orders?.edges?.length > 0) {
      cursor = skipData.orders.edges[skipData.orders.edges.length - 1].cursor;
    }
  }

  // Fetch both in parallel
  const [data, countData] = await Promise.all([
    this.graphql<any>(query, { limit, after: cursor }),
    this.graphql<any>(countQuery)
  ]);

  const orders = data.orders.edges.map((edge: any) => ({
    id: edge.node.id,
    orderNumber: edge.node.name,
    customerName: edge.node.customer?.displayName || 'Guest',
    email: edge.node.email,
    createdAt: edge.node.createdAt,
    totalPrice: edge.node.totalPriceSet.shopMoney.amount,
    currency: edge.node.totalPriceSet.shopMoney.currencyCode,
    financialStatus: edge.node.displayFinancialStatus,
    fulfillmentStatus: edge.node.displayFulfillmentStatus,
    lineItemsCount: edge.node.lineItems.edges.length,
  }));

  // Real total count from Shopify
  const totalCount = countData?.orders?.edges?.length || 0;

  return { orders, totalCount };
  }

  async getProducts(limit: number = 10, page: number = 1): Promise<{ products: ShopifyProduct[], totalCount: number }> {
    // Main query with pagination
    const query = `
      query GetProducts($limit: Int!, $after: String) {
        products(first: $limit, after: $after, sortKey: CREATED_AT, reverse: true) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              id
              title
              status
              totalInventory
              createdAt
              variants(first: 10) {
                edges {
                  node {
                    id
                    price
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `;

    // Separate query to get total count
    const countQuery = `
      query GetProductsCount {
        products(first: 250, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    // Calculate cursor for pagination
    let cursor = null;
    if (page > 1) {
      const skipCount = (page - 1) * limit;
      const skipQuery = `
        query SkipProducts($skip: Int!) {
          products(first: $skip, sortKey: CREATED_AT, reverse: true) {
            edges {
              cursor
            }
          }
        }
      `;
      const skipData = await this.graphql<any>(skipQuery, { skip: skipCount });
      if (skipData?.products?.edges?.length > 0) {
        cursor = skipData.products.edges[skipData.products.edges.length - 1].cursor;
      }
    }

    // Fetch both in parallel
    const [data, countData] = await Promise.all([
      this.graphql<any>(query, { limit, after: cursor }),
      this.graphql<any>(countQuery)
    ]);

    const products = data.products.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      status: edge.node.status,
      totalInventory: edge.node.totalInventory,
      createdAt: edge.node.createdAt,
      variants: edge.node.variants.edges.map((v: any) => ({
        id: v.node.id,
        price: v.node.price,
        inventoryQuantity: v.node.inventoryQuantity,
      })),
    }));

    // Real total count from Shopify
    const totalCount = countData?.products?.edges?.length || 0;

    return { products, totalCount };
  }

  /**
   * Get analytics/summary data
   */
  async getAnalytics(): Promise<ShopifyAnalytics> {
    if (USE_MOCK_DATA) {
      return {
        totalOrders: 127,
        totalRevenue: '45280.50',
        averageOrderValue: '356.54',
        totalCustomers: 89,
        conversionRate: 3.2,
      };
    }

    // Fetch actual orders with financial data
    const ordersQuery = `
      query GetOrdersForAnalytics {
        orders(first: 250) {
          edges {
            node {
              id
              totalPriceSet {
                shopMoney {
                  amount
                }
              }
              displayFinancialStatus
            }
          }
        }
      }
    `;

    const customersQuery = `
      query GetCustomersCount {
        customers(first: 250) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const ordersData = await this.graphql<any>(ordersQuery);
    const customersData = await this.graphql<any>(customersQuery);

    // Calculate real metrics
    const orders = ordersData.orders.edges.map((edge: any) => edge.node);
    
    // Count all non-refunded orders
    const validOrders = orders.filter((order: any) => 
      order.displayFinancialStatus !== 'REFUNDED'
    );
    
    // Calculate revenue from paid orders only
    const paidOrders = orders.filter((order: any) => 
      order.displayFinancialStatus === 'PAID' || 
      order.displayFinancialStatus === 'PARTIALLY_REFUNDED'
    );
    
    const totalRevenue = paidOrders.reduce((sum: number, order: any) => {
      const amount = parseFloat(order.totalPriceSet.shopMoney.amount);
      return sum + amount;
    }, 0);

    const totalOrders = validOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalCustomers = customersData.customers.edges.length;

    return {
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      averageOrderValue: averageOrderValue.toFixed(2),
      totalCustomers,
      conversionRate: 0, // Requires store session data from Shopify Analytics API
    };
  }


  /**
   * Mock data responses for development
   */
  private getMockResponse<T>(query: string): T {
    if (query.includes('GetOrders')) {
    return {
    orders: {
      edges: [
        {
          node: {
            id: 'gid://shopify/Order/1001',
            name: '#1001',
            customer: {
              displayName: 'John Smith'
            },
            email: 'customer1@example.com',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            totalPriceSet: {
              shopMoney: {
                amount: '299.99',
                currencyCode: 'USD',
              },
            },
            displayFinancialStatus: 'PAID',
            displayFulfillmentStatus: 'FULFILLED',
            lineItems: {
              edges: [{ node: { id: '1' } }, { node: { id: '2' } }],
            },
          },
        },
        {
          node: {
            id: 'gid://shopify/Order/1002',
            name: '#1002',
            customer: {
              displayName: 'Sarah Johnson'
            },
            email: 'customer2@example.com',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            totalPriceSet: {
              shopMoney: {
                amount: '149.50',
                currencyCode: 'USD',
              },
            },
            displayFinancialStatus: 'PENDING',
            displayFulfillmentStatus: 'UNFULFILLED',
            lineItems: {
              edges: [{ node: { id: '3' } }],
            },
          },
        },
        {
          node: {
            id: 'gid://shopify/Order/1003',
            name: '#1003',
            customer: {
              displayName: 'Michael Brown'
            },
            email: 'customer3@example.com',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            totalPriceSet: {
              shopMoney: {
                amount: '89.99',
                currencyCode: 'USD',
              },
            },
            displayFinancialStatus: 'PAID',
            displayFulfillmentStatus: 'FULFILLED',
            lineItems: {
              edges: [{ node: { id: '4' } }],
            },
          },
        },
        {
          node: {
            id: 'gid://shopify/Order/1004',
            name: '#1004',
            customer: {
              displayName: 'Emily Davis'
            },
            email: 'customer4@example.com',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            totalPriceSet: {
              shopMoney: {
                amount: '499.00',
                currencyCode: 'USD',
              },
            },
            displayFinancialStatus: 'PAID',
            displayFulfillmentStatus: 'FULFILLED',
            lineItems: {
              edges: [{ node: { id: '5' } }, { node: { id: '6' } }, { node: { id: '7' } }],
            },
          },
        },
        {
          node: {
            id: 'gid://shopify/Order/1005',
            name: '#1005',
            customer: {
              displayName: 'David Wilson'
            },
            email: 'customer5@example.com',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            totalPriceSet: {
              shopMoney: {
                amount: '75.25',
                currencyCode: 'USD',
              },
            },
            displayFinancialStatus: 'REFUNDED',
            displayFulfillmentStatus: 'FULFILLED',
            lineItems: {
              edges: [{ node: { id: '8' } }],
            },
          },
        },
      ],
    },
    } as T
    }

    if (query.includes('GetProducts')) {
      return {
        products: {
          edges: [
            {
              node: {
                id: 'gid://shopify/Product/2001',
                title: 'Premium Wireless Headphones',
                status: 'ACTIVE',
                totalInventory: 45,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
                variants: {
                  edges: [
                    {
                      node: {
                        id: 'gid://shopify/ProductVariant/3001',
                        price: '299.99',
                        inventoryQuantity: 45,
                      },
                    },
                  ],
                },
              },
            },
            {
              node: {
                id: 'gid://shopify/Product/2002',
                title: 'Smart Watch Pro',
                status: 'ACTIVE',
                totalInventory: 23,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
                variants: {
                  edges: [
                    {
                      node: {
                        id: 'gid://shopify/ProductVariant/3002',
                        price: '399.99',
                        inventoryQuantity: 23,
                      },
                    },
                  ],
                },
              },
            },
            {
              node: {
                id: 'gid://shopify/Product/2003',
                title: 'USB-C Charging Cable',
                status: 'ACTIVE',
                totalInventory: 150,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
                variants: {
                  edges: [
                    {
                      node: {
                        id: 'gid://shopify/ProductVariant/3003',
                        price: '19.99',
                        inventoryQuantity: 150,
                      },
                    },
                  ],
                },
              },
            },
            {
              node: {
                id: 'gid://shopify/Product/2004',
                title: 'Laptop Stand Aluminum',
                status: 'ACTIVE',
                totalInventory: 67,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
                variants: {
                  edges: [
                    {
                      node: {
                        id: 'gid://shopify/ProductVariant/3004',
                        price: '79.99',
                        inventoryQuantity: 67,
                      },
                    },
                  ],
                },
              },
            },
            {
              node: {
                id: 'gid://shopify/Product/2005',
                title: 'Mechanical Keyboard RGB',
                status: 'ACTIVE',
                totalInventory: 12,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
                variants: {
                  edges: [
                    {
                      node: {
                        id: 'gid://shopify/ProductVariant/3005',
                        price: '159.99',
                        inventoryQuantity: 12,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
      } as T
    }

    // Default empty response
    return {} as T
  }

  /**
   * Static factory method to create client from database connection
   */
  static async fromConnection(userId: string): Promise<ShopifyClient> {
    const { getToolConnection } = await import('@/lib/supabase/server')
    
    const connection = await getToolConnection(userId, 'shopify')
    
    if (!connection || !connection.is_active) {
      throw new Error('Shopify not connected')
    }

    const accessToken = await decryptToken(connection.access_token)
    
    if (!connection.shop_domain) {
      throw new Error('Shop domain not found')
    }

    return new ShopifyClient({
      shopDomain: connection.shop_domain,
      accessToken,
    })
  }

  /**
   * Create a mock client for development
   */
  static createMockClient(): ShopifyClient {
    return new ShopifyClient({
      shopDomain: 'mock-store.myshopify.com',
      accessToken: 'mock-token',
    })
  }
}

// Export types
export type { ShopifyOrder, ShopifyProduct, ShopifyAnalytics }