import { apiGet, apiPost, apiDelete } from '../api'
import type { Production } from '../types'

export type EventPermission = 'can_create_events' | 'can_edit_events' | 'can_draw'

export interface FollowState {
  following: boolean
  followers_count: number
}

export async function fetchMyProductions(): Promise<Production[]> {
  try {
    const list = await apiGet<Production[]>('/productions/mine')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export async function fetchFollowedProductions(): Promise<Production[]> {
  try {
    const list = await apiGet<Production[]>('/productions/following')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

// État d'abonnement. Si connecté, on connaît `following` ; sinon seulement le total.
export async function fetchFollowState(
  productionId: string,
  loggedIn: boolean
): Promise<FollowState> {
  if (loggedIn) {
    try {
      return await apiGet<FollowState>(`/productions/${productionId}/follow`)
    } catch {
      // repli sur les infos publiques
    }
  }
  try {
    const pub = await apiGet<{ followers_count?: number }>(`/productions/${productionId}`, false)
    return { following: false, followers_count: pub.followers_count ?? 0 }
  } catch {
    return { following: false, followers_count: 0 }
  }
}

export async function followProduction(productionId: string): Promise<FollowState> {
  return apiPost<FollowState>(`/productions/${productionId}/follow`, {})
}

export async function unfollowProduction(
  productionId: string,
  loggedIn: boolean
): Promise<FollowState> {
  await apiDelete(`/productions/${productionId}/follow`)
  return fetchFollowState(productionId, loggedIn)
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
