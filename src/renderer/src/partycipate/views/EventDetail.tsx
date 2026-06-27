import { useEffect, useState, type ReactElement } from 'react'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Heart,
  Lock,
  LockOpen,
  Settings2,
  Shuffle,
  Trash2,
  Trophy,
  UserMinus,
  Users
} from 'lucide-react'
import { apiDelete, apiGet, apiPatch, apiPost } from '../api'
import { useToast } from '../components/Toast'
import type { Event, Participation, PartycipateSession, PartycipateView } from '../types'
import {
  getEventStatusBadgeClass,
  getEventStatusLabel
} from '../utils/eventStatus'
import {
  canManageEvent,
  fetchMyProductions,
  fetchFollowState,
  followProduction,
  unfollowProduction
} from '../utils/productions'

interface EventDetailProps {
  eventId: number
  session: PartycipateSession | null
  onNavigate: (view: PartycipateView) => void
  onBack: () => void
  onGoToLogin: () => void
}

export default function EventDetail({
  eventId,
  session,
  onNavigate,
  onBack,
  onGoToLogin
}: EventDetailProps): ReactElement {
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participation[]>([])
  const [votesCount, setVotesCount] = useState(0)
  const [isParticipated, setIsParticipated] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDraw, setCanDraw] = useState(false)
  const [loading, setLoading] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followBusy, setFollowBusy] = useState(false)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    void loadAll()
  }, [eventId, session?.user.id])

  useEffect(() => {
    if (!session?.user.id || !event) {
      setCanEdit(false)
      setCanDraw(false)
      return
    }
    void (async () => {
      const myProductions = await fetchMyProductions()
      setCanEdit(canManageEvent(myProductions, event, session.user.id, 'can_edit_events'))
      setCanDraw(canManageEvent(myProductions, event, session.user.id, 'can_draw'))
    })()
  }, [event, session])

  useEffect(() => {
    if (!event?.production_id) {
      setFollowing(false)
      setFollowersCount(0)
      return
    }
    void (async () => {
      const fs = await fetchFollowState(event.production_id as string, !!session)
      setFollowing(fs.following)
      setFollowersCount(fs.followers_count)
    })()
  }, [event, session])

  async function loadAll(): Promise<void> {
    setLoading(true)
    try {
      const eventJson = await apiGet<{ data?: Event } & Event>(`/events/${eventId}`, false)
      const eventData = (eventJson as { data?: Event }).data ?? (eventJson as Event)
      setEvent(eventData)

      try {
        const votesJson = await apiGet<Array<{ count: string }>>(`/votes/event/${eventId}`, false)
        setVotesCount(Number(votesJson?.[0]?.count) || 0)
      } catch {
        setVotesCount(0)
      }

      if (session) {
        try {
          const list = await apiGet<Participation[]>(`/participations/event/${eventId}`)
          setParticipants(Array.isArray(list) ? list : [])
        } catch {
          setParticipants([])
        }

        try {
          const partUser = await apiGet<{ participated: boolean }>(
            `/participations/user/${session.user.id}/event/${eventId}`
          )
          setIsParticipated(!!partUser.participated)
        } catch {
          setIsParticipated(false)
        }
      } else {
        setParticipants([])
        setIsParticipated(false)
      }
    } catch {
      setEvent(null)
      showToast('Impossible de charger cet événement', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function vote(): Promise<void> {
    if (!session) return onGoToLogin()
    try {
      await apiPost('/votes/', { event_id: eventId, value: 1 })
      await loadAll()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function participate(): Promise<void> {
    if (!session) return onGoToLogin()
    try {
      await apiPost('/participations/', { event_id: eventId })
      showToast('Inscription enregistrée !', 'success')
      await loadAll()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function unparticipate(): Promise<void> {
    if (!session) return onGoToLogin()
    try {
      await apiDelete(`/participations/user/${session.user.id}/event/${eventId}`)
      showToast('Inscription annulée', 'success')
      await loadAll()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function toggleOpen(): Promise<void> {
    if (!event) return
    try {
      await apiPatch(`/events/${eventId}`, { is_open: !event.is_open })
      showToast(event.is_open ? 'Inscriptions fermées' : 'Inscriptions ouvertes', 'success')
      await loadAll()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function deleteEvent(): Promise<void> {
    if (!event) return
    if (!window.confirm(`Supprimer « ${event.name} » définitivement ?`)) return
    try {
      await apiDelete(`/events/${eventId}`)
      showToast('Événement supprimé', 'success')
      onBack()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function runDraw(): Promise<void> {
    if (!session || !event) return
    const count = participants.length
    const max = event.max_candidates ?? 1
    const winnerCount = Math.min(max, count)
    const ok = window.confirm(
      `Lancer le tirage au sort ?\n\n${winnerCount} candidat(s) seront retenu(s) parmi ${count} demande(s) de participation. Les inscriptions seront fermées.`
    )
    if (!ok) return

    setDrawing(true)
    try {
      const data = await apiPost<{ winners_count?: number }>(
        `/participations/event/${eventId}/draw`,
        {}
      )
      showToast(`${data.winners_count ?? 0} candidat(s) retenu(s) au tirage !`, 'success')
      await loadAll()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setDrawing(false)
    }
  }

  async function toggleFollow(): Promise<void> {
    if (!event?.production_id) return
    if (!session) return onGoToLogin()
    setFollowBusy(true)
    try {
      const fs = following
        ? await unfollowProduction(event.production_id, true)
        : await followProduction(event.production_id)
      setFollowing(fs.following)
      setFollowersCount(fs.followers_count)
      showToast(
        fs.following ? 'Abonné à la production' : 'Désabonné de la production',
        'success'
      )
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setFollowBusy(false)
    }
  }

  if (loading) return <div className="pc-view pc-loading">Chargement…</div>
  if (!event) return <div className="pc-view pc-loading">Événement introuvable.</div>

  const dateStr = event.starts_at ?? event.created_date
  const dateFormatted = dateStr
    ? {
        date: new Date(dateStr).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        time: new Date(dateStr).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    : { date: '', time: '' }

  const maxCandidates = event.max_candidates ?? 1
  const winners = participants.filter((p) => p.is_selected)

  return (
    <div className="pc-view">
      <div className="pc-detail-header">
        <button type="button" className="pc-icon-btn" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="pc-view-kicker">Événement</p>
          <h2 className="pc-view-title">{event.name}</h2>
        </div>
      </div>

      {event.image_url && (
        <img src={event.image_url} alt={event.name} className="pc-detail-image" />
      )}

      <div className="pc-detail-card">
        <div className="pc-detail-top">
          <div className="pc-event-creator">
            {event.profile_picture && (
              <img src={event.profile_picture} alt="" className="pc-avatar-md" />
            )}
            <div>
              <p className="pc-view-kicker">Par</p>
              <p>{event.creator_username ?? 'Utilisateur inconnu'}</p>
            </div>
          </div>
          <span className={`pc-badge ${getEventStatusBadgeClass(event)}`}>
            {getEventStatusLabel(event)}
          </span>
        </div>

        {event.production_id && (
          <div className="pc-prod-follow">
            <button
              type="button"
              className="pc-prod-follow-info pc-prod-follow-link"
              onClick={() =>
                onNavigate({ type: 'production-public', id: event.production_id as string })
              }
              title="Voir la production"
            >
              <span className="pc-prod-follow-icon">
                {event.production_avatar ? (
                  <img src={event.production_avatar} alt="" />
                ) : (
                  <Building2 size={18} />
                )}
              </span>
              <div>
                <p className="pc-prod-follow-name">{event.production_name ?? 'Production'}</p>
                <p className="pc-prod-follow-count">
                  {followersCount} abonné{followersCount > 1 ? 's' : ''}
                </p>
              </div>
            </button>
            <button
              type="button"
              className={`pc-btn pc-btn-sm ${following ? 'pc-btn-ghost' : 'pc-btn-primary'}`}
              onClick={toggleFollow}
              disabled={followBusy}
            >
              <Heart size={15} fill={following ? 'currentColor' : 'none'} />
              {following ? 'Abonné' : 'Suivre'}
            </button>
          </div>
        )}

        <div className="pc-detail-stats">
          <span>
            <Calendar size={16} />
            {dateFormatted.date} {dateFormatted.time}
          </span>
          <span>
            <Users size={16} />
            {event.participants_count ?? participants.length} demande(s) de participation
          </span>
          <span>
            <Trophy size={16} />
            {event.draw_done
              ? `${event.selected_count ?? winners.length}/${maxCandidates} candidat(s)`
              : `${maxCandidates} candidat(s) à retenir`}
          </span>
          <span>
            <Heart size={16} />
            {votesCount}
          </span>
        </div>

        <p className="pc-detail-desc">{event.long_description || event.description}</p>

        <div className="pc-detail-actions">
          {canEdit ? (
            <>
              <button
                type="button"
                className="pc-btn pc-btn-primary"
                onClick={() => onNavigate({ type: 'modify', id: event.id })}
              >
                <Edit size={16} />
                Modifier
              </button>
              {!event.draw_done && (
                <button type="button" className="pc-btn pc-btn-ghost" onClick={toggleOpen}>
                  {event.is_open ? <Lock size={16} /> : <LockOpen size={16} />}
                  {event.is_open ? 'Fermer inscriptions' : 'Ouvrir inscriptions'}
                </button>
              )}
              {!event.draw_done && participants.length > 0 && canDraw && (
                <button
                  type="button"
                  className="pc-btn pc-btn-ghost"
                  onClick={runDraw}
                  disabled={drawing}
                >
                  <Shuffle size={16} />
                  {drawing ? 'Tirage…' : 'Tirage au sort'}
                </button>
              )}
              <button type="button" className="pc-btn pc-btn-danger" onClick={deleteEvent}>
                <Trash2 size={16} />
                Supprimer
              </button>
            </>
          ) : event.is_open && !event.draw_done ? (
            <>
              <button
                type="button"
                className={`pc-btn ${isParticipated ? 'pc-btn-danger' : 'pc-btn-primary'}`}
                onClick={isParticipated ? unparticipate : participate}
              >
                {isParticipated ? <UserMinus size={16} /> : <Users size={16} />}
                {isParticipated ? "Annuler l'inscription" : "S'inscrire"}
              </button>
              <button type="button" className="pc-btn pc-btn-ghost" onClick={vote}>
                <Heart size={16} />
                J&apos;aime
              </button>
            </>
          ) : (
            <span className="pc-badge pc-badge-closed">
              {event.draw_done ? 'Tirage terminé' : 'Inscriptions fermées'}
            </span>
          )}
        </div>
      </div>

      {(canEdit || participants.length > 0) && (
        <div className="pc-participants-card">
          <div className="pc-participants-header">
            <h3>
              {event.draw_done ? 'Candidats retenus' : 'Demandes de participations'} ({participants.length})
            </h3>
            {canEdit && !event.draw_done && (
              <p className="pc-participants-hint">
                Gérez les demandes de participation et lancez le tirage quand vous êtes prêt.
              </p>
            )}
          </div>

          {participants.length === 0 ? (
            <p className="pc-empty-sub">Aucune demande de participation pour le moment.</p>
          ) : (
            <ul className="pc-participants-list">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className={`pc-participant-row ${p.is_selected ? 'pc-participant-winner' : ''}`}
                >
                  <div className="pc-participant-avatar">
                    {p.profile_picture ? (
                      <img src={p.profile_picture} alt="" />
                    ) : (
                      (p.username ?? '?').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="pc-participant-name">{p.username ?? 'Utilisateur'}</span>
                  {p.is_selected && (
                    <span className="pc-badge pc-badge-winner">
                      <Trophy size={12} />
                      Candidat
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {event.draw_done && winners.length > 0 && (
            <p className="pc-participants-hint">
              {winners.length} candidat(s) retenu(s) sur {maxCandidates} prévu(s).
            </p>
          )}

          {canEdit && (
            <div className="pc-participants-footer">
              <button
                type="button"
                className="pc-btn pc-btn-primary"
                onClick={() => onNavigate({ type: 'candidates', id: event.id })}
              >
                <Settings2 size={16} />
                Gérer les candidats
              </button>
            </div>
          )}
        </div>
      )}

      {ToastComponent}
    </div>
  )
}
