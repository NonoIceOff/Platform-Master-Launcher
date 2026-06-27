import type { ReactElement } from 'react'
import { Building2, Calendar, Heart, Trophy, Users } from 'lucide-react'
import type { Event } from '../types'
import {
  getEventStatusBadgeClass,
  getEventStatusLabel
} from '../utils/eventStatus'

interface EventCardProps {
  event: Event
  onClick: (id: number) => void
  onProductionClick?: (id: string) => void
  isMine?: boolean
  isRegistered?: boolean
  isWinner?: boolean
}

export default function EventCard({
  event,
  onClick,
  onProductionClick,
  isMine,
  isRegistered,
  isWinner
}: EventCardProps): ReactElement {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString?: string): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const dateStr = event.starts_at ?? event.created_date
  const max = event.max_candidates ?? 1

  return (
    <button type="button" className="pc-event-card" onClick={() => onClick(event.id)}>
      {event.image_url && (
        <div className="pc-event-card-image">
          <img src={event.image_url} alt={event.name} />
        </div>
      )}

      <div className="pc-event-card-body">
        <div className="pc-event-card-header">
          <h3>{event.name || 'Sans titre'}</h3>
          <span className={`pc-badge ${getEventStatusBadgeClass(event)}`}>
            {getEventStatusLabel(event)}
          </span>
        </div>

        <div className="pc-event-card-tags">
          {isMine && <span className="pc-tag pc-tag-mine">Mon événement</span>}
          {isRegistered && !isMine && (
            <span className="pc-tag pc-tag-registered">Inscrit</span>
          )}
          {isWinner && <span className="pc-tag pc-tag-winner">Gagnant</span>}
        </div>

        <div className="pc-event-creator">
          {event.profile_picture ? (
            <img src={event.profile_picture} alt="" className="pc-avatar-sm" />
          ) : (
            <div className="pc-avatar-sm pc-avatar-fallback">
              {(event.creator_username ?? '?')[0].toUpperCase()}
            </div>
          )}
          <span>Par {event.creator_username ?? 'Inconnu'}</span>
        </div>

        {event.production_name && event.production_id && (
          <span
            role="link"
            tabIndex={0}
            className={`pc-event-prod ${onProductionClick ? 'pc-event-prod-link' : ''}`}
            onClick={(e) => {
              if (!onProductionClick) return
              e.stopPropagation()
              onProductionClick(event.production_id as string)
            }}
            onKeyDown={(e) => {
              if (onProductionClick && e.key === 'Enter') {
                e.stopPropagation()
                onProductionClick(event.production_id as string)
              }
            }}
            title="Voir la production"
          >
            {event.production_avatar ? (
              <img src={event.production_avatar} alt="" className="pc-event-prod-avatar" />
            ) : (
              <Building2 size={12} />
            )}
            {event.production_name}
          </span>
        )}

        <p className="pc-event-desc">{event.description || 'Aucune description'}</p>

        <div className="pc-event-meta">
          <span>
            <Calendar size={12} />
            {formatDate(dateStr)}
            {formatTime(dateStr) && ` ${formatTime(dateStr)}`}
          </span>
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
              <Users size={12} />
            )}
            {event.participants_count ?? 0}
          </span>
          <span>
            <Trophy size={12} />
            {event.draw_done
              ? `${event.selected_count ?? 0}/${max}`
              : max}
          </span>
          <span>
            <Heart size={12} />
            {event.votes_count ?? 0}
          </span>
        </div>
      </div>
    </button>
  )
}
