'use client'

import { useState } from 'react'
import { getSignedUrl, deleteFile } from '@/actions/files'
import { updateTaskFiles } from '@/actions/tasks'
import toast from 'react-hot-toast'

const fileIcons = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'image/png': '🖼',
  'image/jpeg': '🖼',
}

export default function FileList({ taskId, files = [], canDelete = false, onUpdate }) {
  const [loading, setLoading] = useState(null)

  async function handleDownload(file) {
    setLoading(file.path)
    const result = await getSignedUrl(file.path)
    setLoading(null)

    if (result.error) {
      toast.error('Error al obtener el enlace de descarga')
      return
    }

    window.open(result.url, '_blank')
  }

  async function handleDelete(file) {
    setLoading(file.path)
    const result = await deleteFile(file.path, taskId)

    if (result.error) {
      toast.error('Error al eliminar el archivo')
      setLoading(null)
      return
    }

    const newFiles = files.filter((f) => f.path !== file.path)
    await updateTaskFiles(taskId, newFiles)
    onUpdate?.(newFiles)
    toast.success('Archivo eliminado')
    setLoading(null)
  }

  if (!files || files.length === 0) {
    return (
      <p className="text-sm text-gray-400">No hay archivos adjuntos</p>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file, i) => (
        <div
          key={file.path || i}
          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg shrink-0">
              {fileIcons[file.type] || '📎'}
            </span>
            <span className="text-sm text-gray-700 truncate">
              {file.name || file.path?.split('/').pop() || 'Archivo'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleDownload(file)}
              disabled={loading === file.path}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Descargar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>

            {canDelete && (
              <button
                onClick={() => handleDelete(file)}
                disabled={loading === file.path}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
