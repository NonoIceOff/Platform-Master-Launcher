import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { PlusCircle, RefreshCw, Search } from 'lucide-react'
import { apiDelete, apiFetch, apiGet } from '../api'
import EventManageCard from '../components/EventManageCard'
import { useToast } from '../components/Toast'
import type { Event, PartycipateSession, PartycipateView } from '../types'
import { getEventStatus } from '../utils/eventStatus'

type GestionFilter = 'all' | 'active' | 'ready' | 'closed' | 'drawn'

interface GestionProps {
  session: PartycipateSession | null
  sessionReady: boolean
  onNavigate: (view: PartycipateView) => void
}

export default function Gestion({
  session,
  sessionReady,
  onNavigate
}: GestionProps): ReactElement {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [drawingId, setDrawingId] = useState<number | null>(null)
  const [filter, setFilter] = useState<GestionFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { showToast, ToastComponent } = useToast()

  const loadEvents = useCallback(async () => {
    if (!session) return
    setLoading(true)
    try {
      const data = await apiGet<Event[] | { data: Event[] }>(`/events/user/${session.user.id}`)
      setEvents(Array.isArray(data) ? data : (data.data ?? []))
    } catch (err: unknown) {
      setEvents([])
      showToast((err as Error).message || 'Impossible de charger vos événements', 'error')
    } finally {
      setLoading(false)
    }
  }, [session, showToast])

  useEffect(() => {
    if (!sessionReady) return
    if (!session) {
      onNavigate({ type: 'auth-required' })
      return
    }
    void loadEvents()
  }, [session, sessionReady, onNavigate, loadEvents])

  const filtered = useMemo(() => {
    let list = events

    switch (filter) {
      case 'active':
        list = list.filter((e) => getEventStatus(e) === 'open')
        break
      case 'ready':
        list = list.filter(
          (e) => !e.draw_done && (e.participants_count ?? 0) > 0 && getEventStatus(e) !== 'draw_done'
        )
        break
      case 'closed':
        list = list.filter((e) => !e.draw_done && !e.is_open)
        break
      case 'drawn':
        list = list.filter((e) => e.draw_done)
        break
      default:
        break
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          (e.name || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q)
      )
    }

    return list
  }, [events, filter, searchQuery])

  const active = events.filter((e) => getEventStatus(e) === 'open').length
  const readyDraw = events.filter(
    (e) => !e.draw_done && (e.participants_count ?? 0) > 0
  ).length
  const drawn = events.filter((e) => e.draw_done).length

  async function toggleOpen(eventId: number, open: boolean): Promise<void> {
    try {
      const res = await apiFetch(`/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_open: open })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || 'Erreur')
      }
      showToast(open ? 'Inscriptions ouvertes' : 'Inscriptions fermées', 'success')
      await loadEvents()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function runDraw(eventId: number): Promise<void> {
    const ev = events.find((e) => e.id === eventId)
    if (!ev) return

    const count = ev.participants_count ?? 0
    const max = ev.max_candidates ?? 1
    const winnerCount = Math.min(max, count)

    if (
      !window.confirm(
        `Lancer le tirage pour « ${ev.name} » ?\n\n${winnerCount} gagnant(s) parmi ${count} inscrit(s). Les inscriptions seront fermées.`
      )
    ) {
      return
    }

    setDrawingId(eventId)
    try {
      const res = await apiFetch(`/participations/event/${eventId}/draw`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Échec du tirage')
      }
      const data = await res.json()
      showToast(`${data.winners_count ?? 0} gagnant(s) tiré(s) !`, 'success')
      await loadEvents()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setDrawingId(null)
    }
  }

  async function deleteEvent(eventId: number): Promise<void> {
    const ev = events.find((e) => e.id === eventId)
    if (!window.confirm(`Supprimer « ${ev?.name ?? 'cet événement'} » définitivement ?`)) return
    try {
      await apiDelete(`/events/${eventId}`)
      showToast('Événement supprimé', 'success')
      await loadEvents()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  const filters: { id: GestionFilter; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'active', label: 'Ouverts' },
    { id: 'ready', label: 'Prêts à tirer' },
    { id: 'closed', label: 'Fermés' },
    { id: 'drawn', label: 'Terminés' }
  ]

  return (
    <div className="pc-view">
      <div className="pc-view-header pc-view-header-row">
        <div>
          <p className="pc-view-kicker">Organisateur</p>
          <h2 className="pc-view-title">Mes évènements</h2>
          <p className="pc-gestion-sub">
            Créez, modifiez, gérez les inscriptions et lancez vos tirages au sort.
          </p>
        </div>
        <div className="pc-view-actions">
          <button
            type="button"
            className="pc-icon-btn"
            onClick={loadEvents}
            disabled={loading}
            title="Actualiser"
          >
            <RefreshCw size={15} className={loading ? 'pc-spin' : ''} />
          </button>
          <button
            type="button"
            className="pc-btn pc-btn-primary pc-btn-sm"
            onClick={() => onNavigate({ type: 'create' })}
          >
            <PlusCircle size={14} />
            Créer
          </button>
        </div>
      </div>

      <div className="pc-stats-grid pc-stats-grid-4">
        <div className="pc-stat-card">
          <span className="pc-stat-value">{events.length}</span>
          <span className="pc-stat-label">Mes événements</span>
        </div>
        <div className="pc-stat-card">
          <span className="pc-stat-value">{active}</span>
          <span className="pc-stat-label">Ouverts</span>
        </div>
        <div className="pc-stat-card pc-stat-card-highlight">
          <span className="pc-stat-value">{readyDraw}</span>
          <span className="pc-stat-label">Prêts à tirer</span>
        </div>
        <div className="pc-stat-card">
          <span className="pc-stat-value">{drawn}</span>
          <span className="pc-stat-label">Terminés</span>
        </div>
      </div>

      <div className="pc-filter-row">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`pc-filter-btn ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {f.id === 'ready' && readyDraw > 0 && (
              <span className="pc-filter-count">{readyDraw}</span>
            )}
          </button>
        ))}
      </div>

      <div className="pc-toolbar">
        <div className="pc-search">
          <Search size={15} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans mes événements..."
          />
        </div>
      </div>

      {loading && events.length === 0 ? (
        <div className="pc-skeleton-list">
          {[1, 2].map((i) => (
            <div key={i} className="pc-skeleton pc-skeleton-tall" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="pc-empty">
          <p className="pc-empty-title">
            {events.length === 0 ? 'Aucun événement créé' : 'Aucun résultat'}
          </p>
          <p className="pc-empty-sub">
            {events.length === 0
              ? 'Créez votre premier événement pour gérer inscriptions et tirages.'
              : 'Essayez un autre filtre ou une autre recherche.'}
          </p>
          {events.length === 0 && (
            <button
              type="button"
              className="pc-btn pc-btn-primary"
              onClick={() => onNavigate({ type: 'create' })}
            >
              Créer un événement
            </button>
          )}
        </div>
      ) : (
        <div className="pc-manage-list">
          {filtered.map((ev) => (
            <EventManageCard
              key={ev.id}
              event={ev}
              drawing={drawingId === ev.id}
              onView={(id) => onNavigate({ type: 'event', id })}
              onEdit={(id) => onNavigate({ type: 'modify', id })}
              onDraw={runDraw}
              onDelete={deleteEvent}
              onToggleOpen={toggleOpen}
            />
          ))}
        </div>
      )}
      {ToastComponent}
    </div>
  )
}
