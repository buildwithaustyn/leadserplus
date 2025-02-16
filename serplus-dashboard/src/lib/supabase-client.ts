import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Initialize the Supabase client
export const supabase = createClientComponentClient()

// For backwards compatibility
export const createClient = () => supabase