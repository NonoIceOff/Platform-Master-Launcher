import type { Event } from '../types'

export type EventStatusKind = 'open' | 'closed' | 'draw_done'

export function getEventStatus(event: Event): EventStatusKind {
  if (event.draw_done) return 'draw_done'
  if (event.is_open) return 'open'
  return 'closed'
}

export function getEventStatusLabel(event: Event): string {
  const status = getEventStatus(event)
  if (status === 'draw_done') return 'Tirage effectué'
  if (status === 'open') return 'Inscriptions ouvertes'
  return 'Inscriptions fermées'
}

export function getEventStatusBadgeClass(event: Event): string {
  const status = getEventStatus(event)
  if (status === 'draw_done') return 'pc-badge-draw'
  if (status === 'open') return 'pc-badge-open'
  return 'pc-badge-closed'
}
