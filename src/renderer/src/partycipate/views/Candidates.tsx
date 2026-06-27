import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import {
  ArrowLeft,
  Check,
  Lock,
  LockOpen,
  Save,
  Shuffle,
  Trash2,
  Trophy,
  Users
} from 'lucide-react'
import { apiDelete, apiGet, apiPatch, apiPost } from '../api'
import { useToast } from '../components/Toast'
import { canManageEvent, fetchMyProductions } from '../utils/productions'
import type { Event, Participation, PartycipateSession } from '../types'

interface CandidatesProps {
  eventId: number
  session: PartycipateSession | null
  onBack: () => void
}

export default function Candidates({ eventId, session, onBack }: CandidatesProps): ReactElement {
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participation[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [canDraw, setCanDraw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [drawing, setDrawing] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const { showToast, ToastComponent } = useToast()

  const maxCandidates = event?.max_candidates ?? 1

  const loadAll = useCallback(async (): Promise<void> => {
    setLoading(true)
    if (!session?.user.id) {
      setAllowed(false)
      setLoading(false)
      return
    }
    try {
      const eventJson = await apiGet<{ data?: Event } & Event>(`/events/${eventId}`)
      const eventData = (eventJson as { data?: Event }).data ?? (eventJson as Event)
      setEvent(eventData)

      const myProductions = await fetchMyProductions()
      const canEdit = canManageEvent(myProductions, eventData, session.user.id, 'can_edit_events')
      setCanDraw(canManageEvent(myProductions, eventData, session.user.id, 'can_draw'))
      if (!canEdit) {
        setAllowed(false)
        return
      }
      setAllowed(true)

      const list = await apiGet<Participation[]>(`/participations/event/${eventId}`)
      const rows = Array.isArray(list) ? list : []
      setParticipants(rows)
      setSelected(new Set(rows.filter((p) => p.is_selected).map((p) => p.id)))
    } catch {
      showToast('Impossible de charger les candidats', 'error')
      setEvent(null)
    } finally {
      setLoading(false)
    }
  }, [eventId, session, showToast])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  const toggleSelect = useCallback(
    (id: number) => {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          if (next.size >= maxCandidates) {
            showToast(`Maximum ${maxCandidates} candidat(s) pour cet événement.`, 'info')
            return prev
          }
          next.add(id)
        }
        return next
      })
    },
    [maxCandidates, showToast]
  )

  async function saveSelection(): Promise<void> {
    if (!event) return
    setSaving(true)
    try {
      await apiPatch(`/participations/event/${eventId}/selections`, {
        selected_ids: Array.from(selected)
      })
      showToast('Sélection enregistrée', 'success')
      await loadAll()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function removeCandidate(p: Participation): Promise<void> {
    if (!window.confirm(`Retirer ${p.username ?? 'ce candidat'} de l'événement ?`)) return
    setRemovingId(p.id)
    try {
      await apiDelete(`/participations/${p.id}`)
      showToast('Candidat retiré', 'success')
      await loadAll()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setRemovingId(null)
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

  async function runDraw(): Promise<void> {
    if (!event) return
    const count = participants.length
    const winnerCount = Math.min(maxCandidates, count)
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

  const sortedParticipants = useMemo(
    () =>
      [...participants].sort((a, b) => {
        const aw = selected.has(a.id) ? 0 : 1
        const bw = selected.has(b.id) ? 0 : 1
        if (aw !== bw) return aw - bw
        return (a.username ?? '').localeCompare(b.username ?? '')
      }),
    [participants, selected]
  )

  if (loading || allowed === null) {
    return <div className="pc-view pc-loading">Chargement…</div>
  }

  if (allowed === false) {
    return (
      <div className="pc-view pc-loading">
        Accès refusé — vous n&apos;avez pas la permission de gérer cet événement.
      </div>
    )
  }

  if (!event) return <div className="pc-view pc-loading">Événement introuvable.</div>

  return (
    <div className="pc-view">
      <div className="pc-detail-header">
        <button type="button" className="pc-icon-btn" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="pc-view-kicker">Gérer les candidats</p>
          <h2 className="pc-view-title">{event.name}</h2>
        </div>
      </div>

      <div className="pc-participants-card">
        <div className="pc-participants-header pc-candidates-toolbar">
          <h3>
            <Users size={16} /> {participants.length} demande(s) de participation
          </h3>
          <span className="pc-candidates-count">
            <Trophy size={14} />
            {selected.size}/{maxCandidates} candidat(s)
          </span>
        </div>

        {event.draw_done && (
          <p className="pc-participants-hint">
            Le tirage a déjà été effectué. La sélection ci-dessous est définitive.
          </p>
        )}
        {!event.draw_done && (
          <p className="pc-participants-hint">
            Cochez jusqu&apos;à {maxCandidates} candidat(s), puis enregistrez — ou lancez un tirage
            aléatoire.
          </p>
        )}

        {participants.length === 0 ? (
          <p className="pc-empty-sub">Aucune demande de participation pour le moment.</p>
        ) : (
          <ul className="pc-participants-list">
            {sortedParticipants.map((p) => {
              const isSel = selected.has(p.id)
              return (
                <li
                  key={p.id}
                  className={`pc-participant-row ${isSel ? 'pc-participant-winner' : ''}`}
                >
                  <button
                    type="button"
                    className={`pc-candidate-check ${isSel ? 'checked' : ''}`}
                    onClick={() => toggleSelect(p.id)}
                    disabled={event.draw_done}
                    title={isSel ? 'Retirer de la sélection' : 'Retenir comme candidat'}
                  >
                    {isSel && <Check size={14} />}
                  </button>

                  <div className="pc-participant-avatar">
                    {p.profile_picture ? (
                      <img src={p.profile_picture} alt="" />
                    ) : (
                      (p.username ?? '?').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="pc-participant-name">{p.username ?? 'Utilisateur'}</span>

                  {isSel && (
                    <span className="pc-badge pc-badge-winner">
                      <Trophy size={12} />
                      Candidat
                    </span>
                  )}

                  {!event.draw_done && (
                    <button
                      type="button"
                      className="pc-icon-btn pc-icon-btn-danger"
                      onClick={() => void removeCandidate(p)}
                      disabled={removingId === p.id}
                      title="Retirer ce candidat"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {!event.draw_done && (
          <div className="pc-participants-footer pc-candidates-actions">
            <button type="button" className="pc-btn pc-btn-ghost" onClick={toggleOpen}>
              {event.is_open ? <Lock size={16} /> : <LockOpen size={16} />}
              {event.is_open ? 'Fermer inscriptions' : 'Ouvrir inscriptions'}
            </button>
            {canDraw && (
              <button
                type="button"
                className="pc-btn pc-btn-ghost"
                onClick={runDraw}
                disabled={drawing || participants.length === 0}
              >
                <Shuffle size={16} />
                {drawing ? 'Tirage…' : 'Tirage aléatoire'}
              </button>
            )}
            <button
              type="button"
              className="pc-btn pc-btn-primary"
              onClick={saveSelection}
              disabled={saving || participants.length === 0}
            >
              <Save size={16} />
              {saving ? 'Enregistrement…' : 'Enregistrer la sélection'}
            </button>
          </div>
        )}
      </div>

      {ToastComponent}
    </div>
  )
}
