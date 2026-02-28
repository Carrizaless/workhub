import Link from 'next/link'
import { getPosts } from '@/actions/posts'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Server-side pagination via URL searchParams
export default async function BlogPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const params = await searchParams
  const page = Math.max(1, parseInt(params?.page || '1', 10))
  const { data: posts, error, totalPages } = await getPosts({ page, pageSize: 8 })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Blog / Instrucciones</h1>
        {isAdmin && (
          <Link
            href="/blog/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva publicación
          </Link>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {!posts?.length && !error && (
        <Card>
          <div className="py-12 text-center">
            <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-sm text-gray-500">No hay publicaciones todavía.</p>
            {isAdmin && (
              <Link href="/blog/new" className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline">
                Crear la primera
              </Link>
            )}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {posts?.map((post) => {
          const rawText = post.contenido.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
          const excerpt = rawText.length > 160 ? rawText.slice(0, 160).trimEnd() + '...' : rawText
          const author = post.creado_por?.nombre || post.creado_por?.email || 'Admin'
          const date = format(new Date(post.created_at), "d 'de' MMMM, yyyy", { locale: es })

          return (
            <Link key={post.id} href={`/blog/${post.id}`} className="block group">
              <Card className="transition-shadow group-hover:shadow-md">
                <div className="space-y-2">
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {post.titulo}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                    <span>{author}</span>
                    <span>·</span>
                    <span>{date}</span>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}`}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
