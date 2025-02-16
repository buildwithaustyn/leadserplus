import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// For use in app directory (Server Components)
export const createAppDirectorySupabaseClient = () => {
  const cookieStore = require('next/headers').cookies()
  return createServerComponentClient({ cookies: cookieStore })
}

// For use in pages directory (API Routes)
export const createPagesDirectorySupabaseClient = (context: { req: any; res: any }) => {
  return createServerComponentClient({ cookies: () => context.req.cookies })
}

// Backwards compatibility
export const createServerClient = createPagesDirectorySupabaseClient