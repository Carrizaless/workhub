'use client'

import { useCallback, useState } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { updateTaskFiles } from '@/actions/tasks'
import ProgressBar from '@/components/ui/ProgressBar'
import toast from 'react-hot-toast'

export default function FileUploader({ taskId, existingFiles = [], onUpload }) {
  const { upload, progress, uploading, error } = useFileUpload(taskId)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback(
    async (files) => {
      const results = await Promise.all(
        Array.from(files).map(async (file) => {
          const path = await upload(file)
          return path ? { path, name: file.name, type: file.type } : null
        })
      )
      const uploaded = results.filter(Boolean)
      if (uploaded.length > 0) {
        const newFiles = [...existingFiles, ...uploaded]
        await updateTaskFiles(taskId, newFiles)
        onUpload?.(newFiles)
        toast.success(`${uploaded.length} archivo${uploaded.length !== 1 ? 's' : ''} subido${uploaded.length !== 1 ? 's' : ''} exitosamente`)
      }
    },
    [upload, existingFiles, taskId, onUpload]
  )

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  function handleChange(e) {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        aria-label="Arrastra archivos o haz clic para seleccionar"
        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? 'border-accent bg-accent-subtle'
            : 'border-border hover:border-muted'
        }`}
      >
        <input
          type="file"
          onChange={handleChange}
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
          aria-label="Seleccionar archivos"
        />
        <div className="space-y-2">
          <svg
            className="mx-auto h-8 w-8 text-muted"
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
          <p className="text-sm text-muted">
            {uploading
              ? 'Subiendo...'
              : 'Arrastra archivos aqui o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-muted">
            PDF, Word, PNG, JPG (max 50MB)
          </p>
        </div>
      </div>

      {uploading && (
        <div className="mt-3">
          <ProgressBar value={progress} />
          <p className="mt-1 text-xs text-muted text-center">{progress}%</p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-danger">{error}</p>
      )}
    </div>
  )
}
