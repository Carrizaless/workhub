'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/actions/posts'
import { useUser } from '@/contexts/UserContext'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function NewPostPage() {
  const { isAdmin, loading } = useUser()
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (!isAdmin) {
    router.replace('/blog')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) { toast.error('El título es requerido'); return }
    if (!contenido.trim()) { toast.error('El contenido es requerido'); return }

    setSubmitting(true)

    const formData = new FormData()
    formData.set('titulo', titulo)
    formData.set('contenido', contenido)

    const result = await createPost(formData)
    if (result.error) {
      toast.error(result.error)
      setSubmitting(false)
      return
    }

    toast.success('Publicación creada')
    router.push(`/blog/${result.data.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Nueva Publicación</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            placeholder="Título de la publicación"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Contenido{' '}
              <span className="font-normal text-gray-400">(HTML)</span>
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              rows={18}
              placeholder="<h2>Título de sección</h2>&#10;<p>Párrafo de contenido...</p>&#10;<img src=&quot;https://...&quot; alt=&quot;&quot; />"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 resize-y"
            />
            <p className="text-xs text-gray-400">
              Escribe o pega HTML. Etiquetas soportadas: h1–h3, p, ul, ol, li, strong, em, a, img, blockquote, pre, code, hr.
            </p>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Publicando...' : 'Publicar'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
