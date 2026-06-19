import { useEffect, useState, type ReactElement } from 'react'
import { apiGet } from '../api'
import type { Event, PartycipateSession, PartycipateView } from '../types'

interface ProfileProps {
  session: PartycipateSession | null
  sessionReady: boolean
  onNavigate: (view: PartycipateView) => void
}

export default function Profile({ session, sessionReady, onNavigate }: ProfileProps): ReactElement {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionReady) return
    if (!session) {
      onNavigate({ type: 'auth-required' })
      return
    }
    void (async () => {
      try {
        const data = await apiGet<Event[] | { data: Event[] }>(`/events/user/${session.user.id}`)
        setEvents(Array.isArray(data) ? data : (data.data ?? []))
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    })()
  }, [session, sessionReady, onNavigate])

  return (
    <div className="pc-view">
      <div className="pc-view-header">
        <div>
          <p className="pc-view-kicker">Mon compte</p>
          <h2 className="pc-view-title">Profil</h2>
        </div>
      </div>

      <div className="pc-profile-card">
        <div className="pc-profile-avatar">
          {session ? session.user.username.slice(0, 2).toUpperCase() : '?'}
        </div>
        {session && (
          <>
            <h3>{session.user.username}</h3>
            <p className="pc-profile-hint">{session.user.email}</p>
            <p className="pc-profile-hint">
              {events.length} événement{events.length > 1 ? 's' : ''} créé
              {events.length > 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>

      {loading ? (
        <p className="pc-loading">Chargement…</p>
      ) : events.length > 0 ? (
        <div className="pc-event-list">
          {events.map((ev) => (
            <button
              key={ev.id}
              type="button"
              className="pc-event-card pc-event-card-compact"
              onClick={() => onNavigate({ type: 'event', id: ev.id })}
            >
              <div className="pc-event-card-body">
                <h3>{ev.name}</h3>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
