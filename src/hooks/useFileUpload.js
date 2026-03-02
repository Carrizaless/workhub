'use client'

import { useState } from 'react'
import { createUploadUrl } from '@/actions/files'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants'

export function useFileUpload(taskId) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  async function upload(file) {
    setError(null)

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Tipo de archivo no permitido. Usa PDF, Word o imagenes.')
      return null
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('El archivo excede el límite de 50MB')
      return null
    }

    setUploading(true)
    setProgress(0)

    const filePath = `${taskId}/${Date.now()}-${file.name}`

    try {
      // Get a signed upload URL from the server
      const result = await createUploadUrl('task-attachments', filePath)

      if (result.error || !result.signedUrl) {
        setError(result.error || 'No se pudo obtener URL de subida')
        setUploading(false)
        return null
      }

      // Upload directly to Supabase Storage via XHR (bypasses client library)
      return await new Promise((resolve) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
        xhr.addEventListener('load', () => {
          setUploading(false)
          setProgress(100)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(filePath)
          } else {
            setError('Error al subir el archivo')
            resolve(null)
          }
        })
        xhr.addEventListener('error', () => {
          setUploading(false)
          setError('Error de conexion al subir el archivo')
          resolve(null)
        })
        xhr.open('PUT', result.signedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
    } catch (err) {
      setUploading(false)
      setError(err.message || 'Error al subir el archivo')
      return null
    }
  }

  return { upload, progress, uploading, error, setError }
}
