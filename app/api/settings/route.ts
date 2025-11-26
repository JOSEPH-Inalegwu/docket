import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch user settings
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch existing settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (it's ok if settings don't exist yet)
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        settings: {
          default_low_stock_threshold: 10,
          notifications_enabled: true,
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or update user settings
export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { default_low_stock_threshold, notifications_enabled } = body

    // Validate inputs
    if (
      typeof default_low_stock_threshold !== 'number' ||
      default_low_stock_threshold < 1 ||
      default_low_stock_threshold > 10000
    ) {
      return NextResponse.json(
        { error: 'Invalid threshold value (must be between 1-10000)' },
        { status: 400 }
      )
    }

    if (typeof notifications_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid notifications_enabled value' },
        { status: 400 }
      )
    }

    // Upsert settings (insert or update if exists)
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          default_low_stock_threshold,
          notifications_enabled,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving settings:', error)
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true, settings: data })
  } catch (error) {
    console.error('Settings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
