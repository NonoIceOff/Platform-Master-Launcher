import { apiGet } from '../api'
import type { Production } from '../types'

export type EventPermission = 'can_create_events' | 'can_edit_events' | 'can_draw'

export async function fetchMyProductions(): Promise<Production[]> {
  try {
    const list = await apiGet<Production[]>('/productions/mine')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

// Vrai si l'utilisateur est créateur de l'événement OU a la permission demandée
// dans la production de l'événement (chef = toutes permissions).
export function canManageEvent(
  productions: Production[],
  event: { user_id: string; production_id?: string | null },
  userId: string | null | undefined,
  perm: EventPermission
): boolean {
  if (userId && String(event.user_id) === userId) return true
  if (!event.production_id) return false
  const prod = productions.find((p) => p.id === event.production_id)
  return !!prod && (!!prod.is_chef || !!prod[perm])
}
