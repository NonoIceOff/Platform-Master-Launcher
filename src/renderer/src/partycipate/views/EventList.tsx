import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { apiGet } from '../api'
import EventCard from '../components/EventCard'
import { useToast } from '../components/Toast'
import type { Event, PartycipateSession, PartycipateView } from '../types'
import { getEventStatus } from '../utils/eventStatus'
import { fetchMyProductions, fetchFollowedProductions } from '../utils/productions'
import { sortByScore } from '../utils/feedScore'

type EventFilter = 'all' | 'open' | 'mine' | 'registered'

interface UserParticipation {
  event_id: number
  is_selected?: boolean
}

interface EventListProps {
  onNavigate: (view: PartycipateView) => void
  session: PartycipateSession | null
  onGoToLogin: () => void
}

export default function EventList({
  onNavigate,
  session
}: EventListProps): ReactElement {
  const [events, setEvents] = useState<Event[]>([])
  const [myParticipations, setMyParticipations] = useState<UserParticipation[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<EventFilter>('all')
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set())
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set())
  const { showToast, ToastComponent } = useToast()

  const registeredIds = useMemo(
    () => new Set(myParticipations.map((p) => p.event_id)),
    [myParticipations]
  )

  const winnerIds = useMemo(
    () => new Set(myParticipations.filter((p) => p.is_selected).map((p) => p.event_id)),
    [myParticipations]
  )

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<Event[] | { data: Event[] }>('/events')
      const list = Array.isArray(data) ? data : (data.data ?? [])
      setEvents(list)

      if (session?.user.id) {
        try {
          const parts = await apiGet<UserParticipation[]>(
            `/participations/user/${session.user.id}`
          )
          setMyParticipations(Array.isArray(parts) ? parts : [])
        } catch {
          setMyParticipations([])
        }
        try {
          const [followed, mine] = await Promise.all([
            fetchFollowedProductions(),
            fetchMyProductions()
          ])
          setFollowedIds(new Set(followed.map((p) => p.id)))
          setMemberIds(new Set(mine.map((p) => p.id)))
        } catch {
          setFollowedIds(new Set())
          setMemberIds(new Set())
        }
      } else {
        setMyParticipations([])
        setFollowedIds(new Set())
        setMemberIds(new Set())
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      showToast(
        msg.includes('fetch') ? 'pm-api indisponible — lancez npm start dans pm-api' : msg,
        'error'
      )
      setEvents([])
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [session?.user.id, showToast])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  const filteredEvents = useMemo(() => {
    let list = events

    if (filter === 'open') {
      list = list.filter((e) => getEventStatus(e) === 'open')
    } else if (filter === 'mine' && session) {
      list = list.filter((e) => String(e.user_id) === session.user.id)
    } else if (filter === 'registered' && session) {
      list = list.filter((e) => registeredIds.has(e.id))
    } else if (filter === 'all') {
      // Feed "Tous" : on masque les événements aux inscriptions fermées.
      list = list.filter((e) => getEventStatus(e) !== 'closed')
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          (e.name || '').toLowerCase().includes(q) ||
          (e.description || '').toLowerCase().includes(q) ||
          (e.creator_username || '').toLowerCase().includes(q)
      )
    }

    return list
  }, [events, filter, searchQuery, session, registeredIds])

  // Sur "Tous" : tri par score de pertinence (abonnement, likes, récence…).
  // Les autres filtres gardent un tri simple par date décroissante.
  const displayedEvents = useMemo(() => {
    if (filter === 'all') {
      return sortByScore(filteredEvents, {
        followedProductionIds: followedIds,
        memberProductionIds: memberIds
      })
    }
    return [...filteredEvents].sort((a, b) => {
      const ta = new Date(a.created_date ?? a.starts_at ?? 0).getTime()
      const tb = new Date(b.created_date ?? b.starts_at ?? 0).getTime()
      return tb - ta
    })
  }, [filteredEvents, filter, followedIds, memberIds])

  const filters: { id: EventFilter; label: string; needsAuth?: boolean }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'open', label: 'Ouverts' },
    { id: 'mine', label: 'Mes événements', needsAuth: true },
    { id: 'registered', label: 'Mes inscriptions', needsAuth: true }
  ]

  const showSkeleton = loading && !loaded

  return (
    <div className="pc-view">
      <div className="pc-filter-row">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`pc-filter-btn ${filter === f.id ? 'active' : ''}`}
            disabled={f.needsAuth && !session}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="pc-toolbar">
        <div className="pc-search">
          <Search size={15} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un événement..."
          />
        </div>
        <button
          type="button"
          className="pc-icon-btn"
          onClick={fetchEvents}
          disabled={loading}
          title="Actualiser"
        >
          <RefreshCw size={15} className={loading ? 'pc-spin' : ''} />
        </button>
      </div>

      {showSkeleton ? (
        <div className="pc-skeleton-list">
          {[1, 2].map((i) => (
            <div key={i} className="pc-skeleton" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="pc-empty">
          <p className="pc-empty-title">Aucun événement</p>
          <p className="pc-empty-sub">
            {searchQuery
              ? 'Aucun résultat pour cette recherche'
              : filter === 'registered'
                ? "Vous n'êtes inscrit à aucun événement"
                : filter === 'mine'
                  ? "Vous n'avez pas encore créé d'événement"
                  : session
                    ? 'Créez le premier avec le bouton en haut'
                    : 'Connectez-vous pour créer un événement'}
          </p>
        </div>
      ) : (
        <div className="pc-event-list">
          {displayedEvents.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              isMine={session?.user.id === String(ev.user_id)}
              isRegistered={registeredIds.has(ev.id)}
              isWinner={winnerIds.has(ev.id)}
              onClick={(id) => onNavigate({ type: 'event', id })}
              onProductionClick={(id) => onNavigate({ type: 'production-public', id })}
            />
          ))}
        </div>
      )}
      {ToastComponent}
    </div>
  )
}
