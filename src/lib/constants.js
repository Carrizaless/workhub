export const ROLES = {
  ADMIN: 'admin',
  COLABORADOR: 'colaborador',
}

export const TASK_STATES = {
  PENDIENTE: 'pendiente',
  ACEPTADA: 'aceptada',
  EN_REVISION: 'en_revision',
  EN_CORRECCION: 'en_correccion',
  APROBADA: 'aprobada',
}

export const STATE_TRANSITIONS = {
  pendiente: {
    next: ['aceptada'],
    role: 'colaborador',
    label: 'Aceptar Tarea',
  },
  aceptada: {
    next: ['en_revision'],
    role: 'colaborador',
    label: 'Enviar a Revision',
  },
  en_revision: {
    next: ['aprobada', 'en_correccion'],
    role: 'admin',
    labels: {
      aprobada: 'Aprobar',
      en_correccion: 'Solicitar Correccion',
    },
  },
  en_correccion: {
    next: ['en_revision'],
    role: 'colaborador',
    label: 'Reenviar a Revision',
  },
  aprobada: {
    next: [],
    role: null,
    label: null,
  },
}

export const STATE_COLORS = {
  pendiente: 'bg-status-pending-bg text-status-pending-text',
  aceptada: 'bg-status-accepted-bg text-status-accepted-text',
  en_revision: 'bg-status-review-bg text-status-review-text',
  en_correccion: 'bg-status-correction-bg text-status-correction-text',
  aprobada: 'bg-status-approved-bg text-status-approved-text',
}

// Generic labels (fallback)
export const STATE_LABELS = {
  pendiente: 'Pendiente',
  aceptada: 'Aceptada',
  en_revision: 'En Revisión',
  en_correccion: 'En Corrección',
  aprobada: 'Aprobada',
}

// Role-specific labels
export const STATE_LABELS_ADMIN = {
  pendiente: 'Sin aceptar',
  aceptada: 'Aceptada',
  en_revision: 'Por revisar',
  en_correccion: 'En corrección',
  aprobada: 'Aprobada',
}

export const STATE_LABELS_MINE = {
  pendiente: 'Disponible',
  aceptada: 'Aceptada',
  en_revision: 'En revisión',
  en_correccion: 'En corrección',
  aprobada: 'Aprobada',
}

export const STATE_LABELS_OTHERS = {
  pendiente: 'Disponible',
  aceptada: 'En progreso',
  en_revision: 'En revisión',
  en_correccion: 'En corrección',
  aprobada: 'Completada',
}

/**
 * Returns the correct state label based on the viewer's role/relationship.
 * @param {string} estado - The task state
 * @param {{ isAdmin: boolean, isAssignedToMe: boolean }} context
 */
export function getStateLabel(estado, { isAdmin = false, isAssignedToMe = false } = {}) {
  if (isAdmin) return STATE_LABELS_ADMIN[estado] || estado
  if (isAssignedToMe) return STATE_LABELS_MINE[estado] || estado
  return STATE_LABELS_OTHERS[estado] || estado
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
]

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
