'use client'

import { useState, useRef } from 'react'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function ChatInput({ onSend, disabled = false, uploading = false }) {
  const [text, setText] = useState('')
  const [pendingFiles, setPendingFiles] = useState([])
  const fileRef = useRef(null)

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

  function handleSubmit(e) {
    e.preventDefault()
    if ((!text.trim() && pendingFiles.length === 0) || disabled || uploading) return
    onSend(text, pendingFiles)
    setText('')
    setPendingFiles([])
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const hasContent = text.trim() || pendingFiles.length > 0

  return (
    <div className="space-y-2">
      {/* File previews */}
      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pendingFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-lg bg-muted-bg border border-border px-2.5 py-1.5 text-xs"
            >
              <FileIcon type={file.type} />
              <span className="text-foreground max-w-[120px] truncate">{file.name}</span>
              <span className="text-muted">
                {(file.size / 1024 / 1024).toFixed(1)}MB
              </span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Attachment button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || uploading}
          className="rounded-xl border border-border bg-input-bg px-3 py-2.5 text-muted hover:text-foreground hover:bg-muted-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Adjuntar archivo"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        </button>

        <input
          ref={fileRef}
          type="file"
          onChange={handleFileChange}
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="hidden"
        />

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={uploading ? 'Subiendo archivos...' : 'Escribe un mensaje...'}
          disabled={disabled || uploading}
          className="flex-1 rounded-xl border border-border bg-input-bg px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20 disabled:opacity-50 transition-colors"
        />

        <button
          type="submit"
          disabled={!hasContent || disabled || uploading}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}

function FileIcon({ type }) {
  if (type === 'application/pdf')
    return <span className="flex-shrink-0 text-red-500">
      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
    </span>
  if (type.startsWith('image/'))
    return <span className="flex-shrink-0 text-green-500">
      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
    </span>
  return <span className="flex-shrink-0 text-blue-500">
    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
  </span>
}
