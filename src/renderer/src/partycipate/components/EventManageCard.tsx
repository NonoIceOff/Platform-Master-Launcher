import type { ReactElement, MouseEvent } from 'react'
import { Calendar, Edit, Eye, Shuffle, Trash2, Trophy, Users } from 'lucide-react'
import type { Event } from '../types'
import {
  getEventStatusBadgeClass,
  getEventStatusLabel
} from '../utils/eventStatus'

interface EventManageCardProps {
  event: Event
  drawing?: boolean
  onView: (id: number) => void
  onEdit: (id: number) => void
  onDraw?: (id: number) => void
  onDelete?: (id: number) => void
  onToggleOpen?: (id: number, open: boolean) => void
}

function stop(e: MouseEvent): void {
  e.stopPropagation()
}

export default function EventManageCard({
  event,
  drawing,
  onView,
  onEdit,
  onDraw,
  onDelete,
  onToggleOpen
}: EventManageCardProps): ReactElement {
  const participants = event.participants_count ?? 0
  const max = event.max_candidates ?? 1
  const canDraw = !event.draw_done && participants > 0
  const dateStr = event.starts_at ?? event.created_date
  const dateLabel = dateStr
    ? new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  return (
    <div className="pc-manage-card">
      <button type="button" className="pc-manage-card-main" onClick={() => onView(event.id)}>
        <div className="pc-manage-card-top">
          <h3>{event.name}</h3>
          <span className={`pc-badge ${getEventStatusBadgeClass(event)}`}>
            {getEventStatusLabel(event)}
          </span>
        </div>
        <p className="pc-event-desc">{event.description || 'Sans description'}</p>
        <div className="pc-manage-meta">
          {dateLabel && (
            <span>
              <Calendar size={13} />
              {dateLabel}
            </span>
          )}
          <span className="pc-event-participants">
            {event.participants && event.participants.length > 0 ? (
              <span className="pc-avatar-stack">
                {event.participants.map((p, i) => (
                  <span
                    key={`${p.user_id}-${i}`}
                    className="pc-avatar-stack-item"
                    title={p.username ?? undefined}
                  >
                    {p.profile_picture ? (
                      <img src={p.profile_picture} alt="" />
                    ) : (
                      (p.username ?? '?')[0].toUpperCase()
                    )}
                  </span>
                ))}
              </span>
            ) : (
              <Users size={13} />
            )}
            {participants} demande(s) de participation
          </span>
          <span>
            <Trophy size={13} />
            {event.draw_done
              ? `${event.selected_count ?? 0}/${max} candidat(s)`
              : `${max} candidat(s) à retenir`}
          </span>
        </div>
      </button>

      <div className="pc-manage-actions">
        <button
          type="button"
          className="pc-btn pc-btn-ghost pc-btn-xs"
          onClick={(e) => {
            stop(e)
            onView(event.id)
          }}
        >
          <Eye size={14} />
          Voir
        </button>
        <button
          type="button"
          className="pc-btn pc-btn-ghost pc-btn-xs"
          onClick={(e) => {
            stop(e)
            onEdit(event.id)
          }}
          disabled={event.draw_done}
          title={event.draw_done ? 'Tirage déjà effectué' : undefined}
        >
          <Edit size={14} />
          Modifier
        </button>
        {canDraw && onDraw && (
          <button
            type="button"
            className="pc-btn pc-btn-primary pc-btn-xs"
            disabled={drawing}
            onClick={(e) => {
              stop(e)
              onDraw(event.id)
            }}
          >
            <Shuffle size={14} />
            {drawing ? 'Tirage…' : 'Tirer au sort'}
          </button>
        )}
        {!event.draw_done && onToggleOpen && (
          <button
            type="button"
            className="pc-btn pc-btn-ghost pc-btn-xs"
            onClick={(e) => {
              stop(e)
              onToggleOpen(event.id, !event.is_open)
            }}
          >
            {event.is_open ? 'Fermer' : 'Ouvrir'}
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="pc-btn pc-btn-danger pc-btn-xs"
            onClick={(e) => {
              stop(e)
              onDelete(event.id)
            }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
