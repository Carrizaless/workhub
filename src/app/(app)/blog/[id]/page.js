'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getPost, deletePost } from '@/actions/posts'
import { useUser } from '@/contexts/UserContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function BlogPostPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAdmin } = useUser()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      const result = await getPost(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        setPost(result.data)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    const result = await deletePost(id)
    if (result.error) {
      toast.error(result.error)
      setDeleting(false)
    } else {
      toast.success('Publicación eliminada')
      router.push('/blog')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <p className="text-sm text-gray-500 text-center py-8">Publicación no encontrada.</p>
        </Card>
      </div>
    )
  }

  const author = post.creado_por?.nombre || post.creado_por?.email || 'Admin'
  const date = format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al Blog
        </button>

        {isAdmin && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Eliminar
          </button>
        )}
      </div>

      {confirmDelete && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700">¿Eliminar esta publicación permanentemente?</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Cancelar
            </Button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      )}

      <Card>
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{post.titulo}</h1>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
              <span>{author}</span>
              <span>·</span>
              <span>{date}</span>
            </div>
          </div>
          <hr className="border-gray-100" />
          <div
            className="blog-html"
            dangerouslySetInnerHTML={{ __html: post.contenido }}
          />
        </div>
      </Card>
    </div>
  )
}
