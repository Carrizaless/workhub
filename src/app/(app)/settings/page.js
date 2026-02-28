'use client'

import { useRef, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { updateProfile, changePassword, updateAvatar } from '@/actions/users'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, profile, loading } = useUser()
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)
  const supabase = createClient()

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.target)
    const result = await updateProfile(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Perfil actualizado')
    }
    setSaving(false)
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setChangingPassword(true)
    const formData = new FormData(e.target)
    const result = await changePassword(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Contraseña actualizada')
      e.target.reset()
    }
    setChangingPassword(false)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Solo se aceptan imágenes (PNG, JPG, WebP)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 2MB')
      return
    }

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploadingAvatar(true)

    const ext = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatares')
      .upload(filePath, file, { upsert: true, cacheControl: '3600' })

    if (uploadError) {
      toast.error('Error al subir la imagen: ' + uploadError.message)
      setAvatarPreview(null)
      setUploadingAvatar(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatares')
      .getPublicUrl(filePath)

    // Cache-bust so the browser reloads the new image
    const result = await updateAvatar(`${publicUrl}?t=${Date.now()}`)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Foto de perfil actualizada')
    }

    setUploadingAvatar(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  const avatarSrc = avatarPreview || profile?.avatar_url
  const initials =
    (profile?.nombre?.[0] || profile?.email?.[0] || '?').toUpperCase()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>

      {/* Avatar */}
      <Card>
        <h2 className="text-sm font-medium text-gray-900 mb-4">Foto de Perfil</h2>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Avatar"
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-semibold text-white">
                {initials}
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
                <svg className="h-5 w-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
            </label>
            <p className="text-xs text-gray-400">PNG, JPG, WebP · máx 2MB</p>
          </div>
        </div>
      </Card>

      {/* Profile info */}
      <Card>
        <h2 className="text-sm font-medium text-gray-900 mb-4">Perfil</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Nombre"
            name="nombre"
            defaultValue={profile?.nombre || ''}
            placeholder="Tu nombre completo"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Rol
            </label>
            <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </Card>

      {/* Password */}
      <Card>
        <h2 className="text-sm font-medium text-gray-900 mb-4">
          Cambiar Contraseña
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Nueva contraseña"
            name="new_password"
            type="password"
            required
            placeholder="Mínimo 6 caracteres"
          />
          <Input
            label="Confirmar contraseña"
            name="confirm_password"
            type="password"
            required
            placeholder="Repite la contraseña"
          />
          <Button type="submit" disabled={changingPassword}>
            {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
