import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { OAuthCallbackHandler } from '@/lib/oauth/OauthCallbackHandler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { userId } = await auth()
  
  if (!userId) {
    return Response.redirect(new URL('/sign-in?error=unauthorized', request.url))
  }

  const { provider: providerParam } = await params
  const provider = providerParam.toLowerCase()
  
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const shop = searchParams.get('shop')

  // 🔍 TEMP LOG: see what we get back from Stripe
  console.log('OAuth callback received:', {
    provider,
    userId,
    code,
    state,
    error,
    shop,
  })

  // Get base URL from env
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!baseUrl) {
    console.error('NEXT_PUBLIC_APP_URL is not configured')
    return Response.redirect(new URL('/dashboard?error=config_error', request.url))
  }

  // Create callback handler instance
  const handler = new OAuthCallbackHandler()

  // Build callback params
  const callbackParams = {
    code: code || '',
    state: state || '',
    error: error || undefined,
    shop: shop || undefined,
  }

  // Process the callback
  const result = await handler.handleCallback(
    userId,
    provider,
    callbackParams,
    baseUrl
  )

  // Redirect based on result
  return Response.redirect(result.redirectUrl)
}