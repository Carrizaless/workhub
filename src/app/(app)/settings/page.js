'use client'

import { useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { useUser } from '@/contexts/UserContext'
import { updateProfile, changePassword, updateAvatar } from '@/actions/users'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, profile, loading } = useUser()
  const [saving, setSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const passwordStrength = useCallback((pw) => {
    if (!pw) return { level: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (pw.length >= 12) score++
    if (score <= 1) return { level: 1, label: 'Débil', color: 'bg-danger' }
    if (score <= 2) return { level: 2, label: 'Regular', color: 'bg-warning' }
    if (score <= 3) return { level: 3, label: 'Buena', color: 'bg-stat-amber' }
    return { level: 4, label: 'Fuerte', color: 'bg-success' }
  }, [])

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.target)
    const result = await updateProfile(formData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Perfil actualizado')
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
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

    try {
      const { createUploadUrl, getPublicUrl } = await import('@/actions/files')
      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/avatar.${ext}`

      // Get signed upload URL from server
      const urlResult = await createUploadUrl('avatares', filePath)
      if (urlResult.error || !urlResult.signedUrl) {
        toast.error('Error al subir la imagen: ' + (urlResult.error || 'No se pudo obtener URL'))
        setAvatarPreview(null)
        setUploadingAvatar(false)
        return
      }

      // Upload directly via fetch
      const uploadRes = await fetch(urlResult.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        toast.error('Error al subir la imagen')
        setAvatarPreview(null)
        setUploadingAvatar(false)
        return
      }

      // Get the public URL from the server
      const { publicUrl } = await getPublicUrl('avatares', filePath)

      // Cache-bust so the browser reloads the new image
      const result = await updateAvatar(`${publicUrl}?t=${Date.now()}`)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Foto de perfil actualizada')
      }
    } catch (err) {
      console.error('Avatar upload error:', err)
      toast.error('Error al subir la imagen. Inténtalo de nuevo.')
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted-bg" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted-bg" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted-bg" />
      </div>
    )
  }

  const avatarSrc = avatarPreview || profile?.avatar_url
  const initials =
    (profile?.nombre?.[0] || profile?.email?.[0] || '?').toUpperCase()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Configuración</h1>

      {/* Avatar */}
      <Card>
        <h2 className="text-sm font-medium text-foreground mb-4">Foto de Perfil</h2>
        <div className="flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt="Avatar"
                width={80}
                height={80}
                className="h-20 w-20 rounded-2xl object-cover"
                unoptimized={avatarSrc?.startsWith('data:')}
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-accent to-info flex items-center justify-center text-2xl font-semibold text-white">
                {initials}
              </div>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-2xl bg-card/70 flex items-center justify-center">
                <svg className="h-5 w-5 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
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
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted-bg transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
            </label>
            <p className="text-xs text-muted">PNG, JPG, WebP · máx 2MB</p>
          </div>
        </div>
      </Card>

      {/* Profile info */}
      <Card>
        <h2 className="text-sm font-medium text-foreground mb-4">Perfil</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input
            label="Nombre"
            name="nombre"
            defaultValue={profile?.nombre || ''}
            placeholder="Tu nombre completo"
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Correo electrónico
            </label>
            <p className="text-sm text-muted">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Rol
            </label>
            <p className="text-sm text-muted capitalize">{profile?.role}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            {profileSaved && (
              <span className="text-xs text-success font-medium flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Guardado
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Password */}
      <Card>
        <h2 className="text-sm font-medium text-foreground mb-4">
          Cambiar Contraseña
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <Input
              label="Nueva contraseña"
              name="new_password"
              type="password"
              required
              placeholder="Mínimo 8 caracteres, una mayúscula y un número"
              onChange={(e) => setPasswordValue(e.target.value)}
            />
            {passwordValue && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength(passwordValue).level
                          ? passwordStrength(passwordValue).color
                          : 'bg-muted-bg'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted mt-1">{passwordStrength(passwordValue).label}</p>
              </div>
            )}
          </div>
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
