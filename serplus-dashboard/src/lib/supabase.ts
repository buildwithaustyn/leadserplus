// For client-side usage
export { createClient } from './supabase-client'

// For server-side usage:
// - In app directory (Server Components), use createAppDirectorySupabaseClient
// - In pages directory (API Routes), use createPagesDirectorySupabaseClient
export { 
  createAppDirectorySupabaseClient,
  createPagesDirectorySupabaseClient,
  createServerClient // deprecated
} from './supabase-server'
