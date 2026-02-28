import { format, formatDistanceToNow, isAfter } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date) {
  if (!date) return ''
  return format(new Date(date), 'dd MMM yyyy', { locale: es })
}

export function formatDateTime(date) {
  if (!date) return ''
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: es })
}

export function formatRelative(date) {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function isOverdue(deadline) {
  if (!deadline) return false
  return isAfter(new Date(), new Date(deadline))
}

/**
 * Returns the urgency status of a deadline.
 * 'vencida' → overdue (red)
 * 'urgente' → due today / < 1 day (red-light)
 * 'proxima' → < 3 days (yellow)
 * 'normal'  → >= 3 days (gray)
 * null      → no deadline
 */
export function getDeadlineStatus(fecha) {
  if (!fecha) return null
  const diff = (new Date(fecha) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'vencida'
  if (diff < 1) return 'urgente'
  if (diff < 3) return 'proxima'
  return 'normal'
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
