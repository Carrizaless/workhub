import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isConfigured =
  SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY

export function createClient() {
  if (!isConfigured) {
    // Return a mock client that won't crash the app
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({
          error: { message: 'Supabase no esta configurado. Agrega las credenciales en .env.local' },
        }),
        signOut: async () => ({}),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
          order: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
          neq: () => ({
            order: () => ({ data: [], error: null }),
          }),
          is: () => ({
            order: () => ({
              limit: async () => ({ data: [], error: null }),
            }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'Supabase no configurado' } }),
          }),
        }),
        update: () => ({
          eq: async () => ({ error: { message: 'Supabase no configurado' } }),
        }),
      }),
      rpc: async () => ({
        data: { success: false, error: 'Supabase no configurado' },
        error: null,
      }),
      storage: {
        from: () => ({
          upload: async () => ({ error: { message: 'Supabase no configurado' } }),
          createSignedUrl: async () => ({ error: { message: 'Supabase no configurado' } }),
          createSignedUploadUrl: async () => ({ error: { message: 'Supabase no configurado' } }),
          remove: async () => ({ error: { message: 'Supabase no configurado' } }),
        }),
      },
      channel: () => ({
        on: () => ({ subscribe: () => ({}) }),
      }),
      removeChannel: () => {},
    }
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
