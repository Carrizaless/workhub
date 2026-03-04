'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTask, updateTaskFiles } from '@/actions/tasks'
import { createUploadUrl } from '@/actions/files'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants'

export default function TaskForm() {
  const [loading, setLoading] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([])
  const router = useRouter()

  function handleFileChange(e) {
    const selected = Array.from(e.target.files)
    const valid = []
    for (const file of selected) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: tipo de archivo no permitido`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: excede el límite de 50MB`)
        continue
      }
      valid.push(file)
    }
    setPendingFiles((prev) => [...prev, ...valid])
    e.target.value = ''
  }

  function removeFile(index) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.target)
    const result = await createTask(formData)

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    const taskId = result.data.id

    // Upload pending files to the newly created task via signed URLs
    if (pendingFiles.length > 0) {
      const uploadedFiles = []

      for (const file of pendingFiles) {
        const filePath = `${taskId}/${Date.now()}-${file.name}`
        try {
          // Get signed upload URL from server
          const urlResult = await createUploadUrl('task-attachments', filePath)
          if (urlResult.error || !urlResult.signedUrl) {
            toast.error(`Error subiendo ${file.name}: ${urlResult.error || 'No se pudo obtener URL'}`)
            continue
          }

          // Upload directly via fetch (bypasses client library)
          const uploadRes = await fetch(urlResult.signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          })

          if (uploadRes.ok) {
            uploadedFiles.push({ path: filePath, name: file.name, type: file.type })
          } else {
            toast.error(`Error subiendo ${file.name}`)
          }
        } catch {
          toast.error(`Error subiendo ${file.name}`)
        }
      }

      if (uploadedFiles.length > 0) {
        await updateTaskFiles(taskId, uploadedFiles)
      }
    }

    toast.success('Tarea creada exitosamente')
    router.push(`/tasks/${taskId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Titulo"
        name="titulo"
        required
        placeholder="Nombre de la tarea"
      />

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          Descripcion
        </label>
        <textarea
          name="descripcion"
          rows={4}
          placeholder="Describe los detalles de la tarea..."
          className="w-full rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm text-foreground placeholder-muted outline-none transition-all focus:border-blue-500 focus:bg-card focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Precio"
          name="precio"
          type="number"
          step="0.01"
          min="0"
          required
          placeholder="0.00"
        />
        <Input
          label="Fecha Limite"
          name="fecha_limite"
          type="datetime-local"
        />
      </div>

      {/* File attachments */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Documentos adjuntos{' '}
          <span className="font-normal text-muted">(opcional)</span>
        </label>

        <div className="relative rounded-xl border-2 border-dashed border-border p-5 text-center hover:border-blue-300 transition-colors cursor-pointer">
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-1.5 pointer-events-none">
            <svg
              className="mx-auto h-7 w-7 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-muted">Haz clic o arrastra archivos aquí</p>
            <p className="text-xs text-muted">PDF, Word, PNG, JPG · max 50MB</p>
          </div>
        </div>

        {pendingFiles.length > 0 && (
          <ul className="space-y-2">
            {pendingFiles.map((file, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl bg-muted-bg px-3 py-2.5 border border-border"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileTypeBadge type={file.type} />
                  <span className="text-sm text-foreground truncate">{file.name}</span>
                  <span className="text-xs text-muted flex-shrink-0">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="flex-shrink-0 text-muted hover:text-red-500 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? pendingFiles.length > 0
              ? 'Creando y subiendo...'
              : 'Creando...'
            : 'Crear Tarea'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function FileTypeBadge({ type }) {
  if (type === 'application/pdf')
    return <span className="flex-shrink-0 rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">PDF</span>
  if (type.includes('word'))
    return <span className="flex-shrink-0 rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600">DOC</span>
  if (type.startsWith('image/'))
    return <span className="flex-shrink-0 rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-600">IMG</span>
  return <span className="flex-shrink-0 rounded-md bg-muted-bg px-1.5 py-0.5 text-xs font-medium text-muted">FILE</span>
}
