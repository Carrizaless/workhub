import Badge from '@/components/ui/Badge'
import { STATE_COLORS, getStateLabel } from '@/lib/constants'

/**
 * @param {string} estado
 * @param {boolean} isAdmin        - viewer is admin
 * @param {boolean} isAssignedToMe - task is assigned to the current user
 */
export default function TaskStatusBadge({
  estado,
  isAdmin = false,
  isAssignedToMe = false,
}) {
  const label = getStateLabel(estado, { isAdmin, isAssignedToMe })
  return (
    <Badge className={STATE_COLORS[estado] || 'bg-gray-100 text-gray-700'}>
      {label}
    </Badge>
  )
}
