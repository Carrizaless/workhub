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
  pendiente: 'bg-gray-100 text-gray-700',
  aceptada: 'bg-blue-100 text-blue-700',
  en_revision: 'bg-yellow-100 text-yellow-700',
  en_correccion: 'bg-red-100 text-red-700',
  aprobada: 'bg-green-100 text-green-700',
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
