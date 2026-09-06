import { createClient } from '@supabase/supabase-js'

const env = import.meta.env ?? {}
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && key)

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn('Missing Supabase environment variables.')
}

export const supabase = isSupabaseConfigured
  ? createClient(url, key)
  : null
