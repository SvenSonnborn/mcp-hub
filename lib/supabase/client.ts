import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export const createSupabaseBrowserClient = () => {
  if (typeof window === 'undefined') {
    // Return null during SSR/build to avoid errors
    return null as unknown as SupabaseClient
  }

  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('Supabase URL and Anon Key are required')
    }

    browserClient = createBrowserClient(url, key)
  }

  return browserClient
}
