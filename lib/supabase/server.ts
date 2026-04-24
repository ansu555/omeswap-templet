import { createClient } from '@supabase/supabase-js'

function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  return { url, serviceRoleKey }
}

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseEnv()

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
