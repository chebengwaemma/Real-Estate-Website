import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseEnv } from '@/lib/env'

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

/** True once real Supabase credentials are available (env or public fallback). */
export const isSupabaseConfigured = hasSupabaseEnv()

/**
 * Uses VITE_* when set; otherwise the public project fallback so production
 * matches local even if Vercel env vars were never configured.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
