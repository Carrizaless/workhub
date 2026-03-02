import { createBrowserClient } from '@supabase/ssr'

let client = null

export function createClient() {
  // Reuse the same client instance (singleton)
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn('Supabase not configured: missing NEXT_PUBLIC_SUPABASE_URL or KEY')
    return createNoOpClient()
  }

  client = createBrowserClient(url, key)
  return client
}

/**
 * No-op Supabase client that handles any method chain.
 * Uses Proxy so that any chain like .from().select().eq().neq().order()
 * resolves to { data: null, error: null, count: 0 } when awaited.
 */
function createNoOpClient() {
  function createChain() {
    const proxy = new Proxy(function () {}, {
      // Handle property access (e.g. .select, .eq, .from, .auth)
      get(_target, prop) {
        // When awaited: resolve to safe query result
        if (prop === 'then') {
          return (resolve) => {
            if (resolve) resolve({ data: null, error: null, count: 0 })
          }
        }
        if (prop === 'catch' || prop === 'finally') {
          return () => proxy
        }

        // Auth namespace
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

        // Storage namespace
        if (prop === 'storage') {
          return {
            from: () => createChain(),
          }
        }

        // RPC
        if (prop === 'rpc') {
          return async () => ({ data: null, error: { message: 'Supabase no configurado' } })
        }

        // removeChannel
        if (prop === 'removeChannel') {
          return () => {}
        }

        // Everything else: return a function that continues the chain
        return (..._args) => createChain()
      },

      // Handle direct function call (e.g. from('table'), select('*'))
      apply() {
        return createChain()
      },
    })

    return proxy
  }

  return createChain()
}
