import { createBrowserClient } from '@supabase/ssr'

let client = null

export function createClient() {
  // Reuse the same client instance (singleton)
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn('Supabase not configured: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing')
    // Return a no-op proxy that won't crash on any method chain
    return createNoOpClient()
  }

  client = createBrowserClient(url, key)
  return client
}

/**
 * Creates a proxy-based no-op client that handles ANY method chain
 * without crashing. Every method returns the proxy itself (for chaining)
 * or a safe default value for terminal methods.
 */
function createNoOpClient() {
  const handler = {
    get(target, prop) {
      // Terminal async methods - return safe defaults
      if (prop === 'then') return undefined // prevents treating proxy as Promise
      if (prop === 'single') return async () => ({ data: null, error: null })
      if (prop === 'limit') return async () => ({ data: [], error: null })
      if (prop === 'insert') return () => createChainProxy()
      if (prop === 'update') return () => createChainProxy()
      if (prop === 'delete') return () => createChainProxy()
      if (prop === 'upload') return async () => ({ error: { message: 'Supabase no configurado' } })
      if (prop === 'remove') return async () => ({ error: { message: 'Supabase no configurado' } })
      if (prop === 'createSignedUrl') return async () => ({ error: { message: 'Supabase no configurado' } })
      if (prop === 'createSignedUploadUrl') return async () => ({ error: { message: 'Supabase no configurado' } })
      if (prop === 'subscribe') return () => createChainProxy()
      if (prop === 'unsubscribe') return () => {}
      if (prop === 'removeChannel') return () => {}

      // Auth methods
      if (prop === 'auth') {
        return {
          getUser: async () => ({ data: { user: null }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          signInWithPassword: async () => ({
            error: { message: 'Supabase no configurado' },
          }),
          signOut: async () => ({}),
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } },
          }),
        }
      }

      // Storage
      if (prop === 'storage') {
        return { from: () => createChainProxy() }
      }

      // RPC
      if (prop === 'rpc') {
        return async () => ({ data: null, error: { message: 'Supabase no configurado' } })
      }

      // Everything else: return a function that returns a chainable proxy
      return (..._args) => createChainProxy()
    },
  }

  function createChainProxy() {
    return new Proxy({}, handler)
  }

  return new Proxy({}, handler)
}
