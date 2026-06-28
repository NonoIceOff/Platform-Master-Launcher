import { useEffect, useState, type FormEvent, type ReactElement } from 'react'
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react'
import { apiDelete, apiFetch, apiGet } from '../api'
import { useToast } from '../components/Toast'
import type { PartycipateSession, PartycipateView, Production } from '../types'

interface EventCreateProps {
  session: PartycipateSession | null
  sessionReady: boolean
  onNavigate: (view: PartycipateView) => void
  onBack: () => void
  eventId?: number
}

export default function EventCreate({
  session,
  sessionReady,
  onNavigate,
  onBack,
  eventId
}: EventCreateProps): ReactElement {
  const isEdit = !!eventId
  const [form, setForm] = useState({
    name: '',
    description: '',
    long_description: '',
    image_url: '',
    duration: '',
    starts_at: '',
    is_open: true,
    max_candidates: 1,
    production_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [drawDone, setDrawDone] = useState(false)
  const [productions, setProductions] = useState<Production[]>([])
  const [productionsReady, setProductionsReady] = useState(false)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    if (!sessionReady) return
    if (!session) onNavigate({ type: 'auth-required' })
  }, [session, sessionReady, onNavigate])

  useEffect(() => {
    if (!session) return
    void (async () => {
      try {
        const list = await apiGet<Production[]>('/productions/mine')
        const arr = (Array.isArray(list) ? list : []).filter((p) => p.can_create_events)
        setProductions(arr)
        if (arr.length === 1) {
          setForm((p) => ({ ...p, production_id: p.production_id || arr[0].id }))
        }
      } catch {
        setProductions([])
      } finally {
        setProductionsReady(true)
      }
    })()
  }, [session])

  useEffect(() => {
    if (!eventId) return
    void (async () => {
      try {
        const res = await apiFetch(`/events/${eventId}`)
        if (!res.ok) return
        const json = await res.json()
        const data = json.data ?? json
        setDrawDone(!!data.draw_done)
        setForm({
          name: data.name ?? '',
          description: data.description ?? '',
          long_description: data.long_description ?? '',
          image_url: data.image_url ?? '',
          duration: data.duration ?? '',
          starts_at: data.starts_at ? data.starts_at.slice(0, 16) : '',
          is_open: !!data.is_open,
          max_candidates: data.max_candidates ?? 1,
          production_id: data.production_id ?? ''
        })
      } catch {
        showToast("Impossible de charger l'événement", 'error')
      }
    })()
  }, [eventId, showToast])

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!session) return onNavigate({ type: 'auth-required' })
    if (!form.name.trim()) return showToast("Le nom de l'événement est requis.", 'error')
    if (!isEdit && !form.production_id) {
      return showToast('Veuillez choisir une production.', 'error')
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        max_candidates: Math.max(1, Number(form.max_candidates) || 1),
        starts_at: form.starts_at || undefined,
        image_url: form.image_url || undefined,
        production_id: form.production_id || undefined
      }
      const res = await apiFetch(isEdit ? `/events/${eventId}` : '/events/', {
        method: isEdit ? 'PATCH' : 'POST',
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        showToast(err.message || err.error || 'Erreur', 'error')
        return
      }
      const event = await res.json()
      showToast(isEdit ? 'Événement mis à jour !' : 'Événement créé !', 'success')
      setTimeout(() => onNavigate({ type: 'event', id: event.id ?? eventId! }), 600)
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erreur inattendue'
      showToast(
        msg.includes('Token') || msg.includes('Session')
          ? 'Session expirée — reconnectez-vous dans Configuration'
          : msg,
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(): Promise<void> {
    if (!eventId || !session) return
    if (!window.confirm('Supprimer cet événement définitivement ?')) return
    setLoading(true)
    try {
      await apiDelete(`/events/${eventId}`)
      showToast('Événement supprimé', 'success')
      setTimeout(() => onBack(), 400)
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isEdit && productionsReady && productions.length === 0) {
    return (
      <div className="pc-view">
        <div className="pc-detail-header">
          <button type="button" className="pc-icon-btn" onClick={onBack}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="pc-view-kicker">Nouveau</p>
            <h2 className="pc-view-title">Créer un événement</h2>
          </div>
        </div>
        <div className="pc-empty">
          <p className="pc-empty-title">Création non autorisée</p>
          <p className="pc-empty-sub">
            Vous n&apos;avez la permission de créer des événements dans aucune production.
            Demandez à un chef de production de vous accorder ce droit.
          </p>
        </div>
        {ToastComponent}
      </div>
    )
  }

  return (
    <div className="pc-view">
      <div className="pc-detail-header">
        <button type="button" className="pc-icon-btn" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="pc-view-kicker">{isEdit ? 'Modifier' : 'Nouveau'}</p>
          <h2 className="pc-view-title">
            {isEdit ? "Modifier l'événement" : 'Créer un événement'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pc-form">
        {!isEdit && productions.length > 0 && (
          <label>
            Production *
            <select
              name="production_id"
              value={form.production_id}
              onChange={(e) => setForm((p) => ({ ...p, production_id: e.target.value }))}
            >
              <option value="" disabled>
                Choisir une production…
              </option>
              {productions.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Nom de l&apos;événement *
          <input
            name="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Ex: Soirée Pizza & Jeux"
          />
        </label>

        <label>
          Description courte
          <input
            name="description"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Résumé en quelques mots"
          />
        </label>

        <label>
          Description complète
          <textarea
            name="long_description"
            value={form.long_description}
            onChange={(e) => setForm((p) => ({ ...p, long_description: e.target.value }))}
            rows={4}
            placeholder="Décrivez votre événement en détail…"
          />
        </label>

        <label>
          URL de l&apos;image
          <input
            name="image_url"
            value={form.image_url}
            onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
            type="url"
            placeholder="https://exemple.com/image.jpg"
          />
        </label>

        <label>
          Nombre de candidats à retenir (tirage au sort)
          <input
            name="max_candidates"
            type="number"
            min={1}
            max={999}
            value={form.max_candidates}
            disabled={drawDone}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                max_candidates: Math.max(1, Number(e.target.value) || 1)
              }))
            }
          />
        </label>

        <label>
          Temps de tournage
          <input
            name="duration"
            value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
            placeholder="Ex: 45 minutes"
          />
        </label>

        <label>
          Date et heure
          <input
            name="starts_at"
            value={form.starts_at}
            onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))}
            type="datetime-local"
          />
        </label>

        <div className="pc-toggle-row">
          <div>
            <p className="pc-toggle-label">Événement ouvert</p>
            <p className="pc-toggle-hint">Les participants peuvent s&apos;inscrire</p>
          </div>
          <button
            type="button"
            className={`pc-toggle ${form.is_open ? 'pc-toggle-on' : ''}`}
            disabled={drawDone}
            onClick={() => setForm((p) => ({ ...p, is_open: !p.is_open }))}
          />
        </div>

        <button type="submit" disabled={loading} className="pc-btn pc-btn-primary pc-btn-full">
          <PlusCircle size={18} />
          {loading ? 'En cours…' : isEdit ? 'Enregistrer' : "Créer l'événement"}
        </button>

        {isEdit && (
          <button
            type="button"
            className="pc-btn pc-btn-danger pc-btn-full"
            disabled={loading}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            Supprimer l&apos;événement
          </button>
        )}
      </form>
      {ToastComponent}
    </div>
  )
}
