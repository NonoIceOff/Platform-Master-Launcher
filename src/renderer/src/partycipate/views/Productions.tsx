import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactElement
} from 'react'
import { Building2, Crown, Heart, Plus, RefreshCw, Users2 } from 'lucide-react'
import { useToast } from '../components/Toast'
import {
  fetchMyProductions,
  fetchFollowedProductions,
  createProduction
} from '../utils/productions'
import type { PartycipateSession, PartycipateView, Production } from '../types'

interface ProductionsProps {
  session: PartycipateSession | null
  sessionReady: boolean
  onNavigate: (view: PartycipateView) => void
}

function permLabels(p: Production): string[] {
  if (p.is_chef) return ['Chef']
  const labels: string[] = []
  if (p.can_create_events) labels.push('Créer')
  if (p.can_edit_events) labels.push('Modifier')
  if (p.can_draw) labels.push('Tirage')
  if (p.can_invite) labels.push('Inviter')
  return labels.length ? labels : ['Membre']
}

export default function Productions({
  session,
  sessionReady,
  onNavigate
}: ProductionsProps): ReactElement {
  const [productions, setProductions] = useState<Production[]>([])
  const [followed, setFollowed] = useState<Production[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newAvatar, setNewAvatar] = useState('')
  const [creating, setCreating] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [mine, follows] = await Promise.all([
        fetchMyProductions(),
        fetchFollowedProductions()
      ])
      setProductions(mine)
      setFollowed(follows)
    } catch (err: unknown) {
      showToast((err as Error).message || 'Impossible de charger vos productions', 'error')
      setProductions([])
      setFollowed([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (!sessionReady) return
    if (!session) {
      onNavigate({ type: 'auth-required' })
      return
    }
    void load()
  }, [session, sessionReady, load, onNavigate])

  async function handleCreate(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const created = await createProduction({
        name: newName.trim(),
        description: newDescription,
        avatar_url: newAvatar
      })
      showToast(`Production « ${created.name} » créée`, 'success')
      setNewName('')
      setNewDescription('')
      setNewAvatar('')
      setShowCreate(false)
      await load()
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="pc-view">
      <div className="pc-view-header pc-view-header-row">
        <div>
          <p className="pc-view-kicker">Mes productions</p>
          <h2 className="pc-view-title">Mes productions</h2>
          <p className="pc-gestion-sub">
            Vos productions et vos rôles. Gérez l&apos;équipe, les permissions et les invitations.
          </p>
        </div>
        <div className="pc-view-actions">
          <button
            type="button"
            className="pc-btn pc-btn-primary pc-btn-sm"
            onClick={() => setShowCreate((v) => !v)}
          >
            <Plus size={15} />
            Créer une production
          </button>
          <button
            type="button"
            className="pc-icon-btn"
            onClick={load}
            disabled={loading}
            title="Actualiser"
          >
            <RefreshCw size={15} className={loading ? 'pc-spin' : ''} />
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="pc-prod-edit">
          <h3 className="pc-section-title">Nouvelle production</h3>
          <label className="pc-field">
            <span>Nom</span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom de la production"
              maxLength={80}
              autoFocus
            />
          </label>
          <label className="pc-field">
            <span>Photo de profil (URL)</span>
            <input
              value={newAvatar}
              onChange={(e) => setNewAvatar(e.target.value)}
              placeholder="https://…"
            />
          </label>
          <label className="pc-field">
            <span>Description</span>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              placeholder="Présentez votre production…"
            />
          </label>
          <div className="pc-prod-edit-actions">
            <button
              type="button"
              className="pc-btn pc-btn-ghost"
              onClick={() => setShowCreate(false)}
            >
              Annuler
            </button>
            <button type="submit" className="pc-btn pc-btn-primary" disabled={creating}>
              <Plus size={16} />
              {creating ? 'Création…' : 'Créer'}
            </button>
          </div>
          <p className="pc-invite-hint">Les vidéos pourront être ajoutées ensuite via « Gérer ».</p>
        </form>
      )}

      {loading && productions.length === 0 ? (
        <div className="pc-skeleton-list">
          {[1, 2].map((i) => (
            <div key={i} className="pc-skeleton" />
          ))}
        </div>
      ) : productions.length === 0 ? (
        <div className="pc-empty">
          <p className="pc-empty-title">Aucune production</p>
          <p className="pc-empty-sub">
            Vous n&apos;appartenez à aucune production pour le moment.
          </p>
        </div>
      ) : (
        <div className="pc-prod-list">
          {productions.map((p) => (
            <div key={p.id} className="pc-prod-card">
              <button
                type="button"
                className="pc-prod-card-main"
                onClick={() => onNavigate({ type: 'production-public', id: p.id })}
                title="Voir la page de la production"
              >
                <div className="pc-prod-card-icon">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" />
                  ) : (
                    <Building2 size={18} />
                  )}
                </div>
                <div className="pc-prod-card-body">
                  <p className="pc-prod-card-name">{p.name}</p>
                  <div className="pc-prod-card-tags">
                    {permLabels(p).map((label) => (
                      <span
                        key={label}
                        className={`pc-prod-tag ${label === 'Chef' ? 'pc-prod-tag-chef' : ''}`}
                      >
                        {label === 'Chef' && <Crown size={11} />}
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
              {(p.is_chef || p.can_invite) && (
                <button
                  type="button"
                  className="pc-btn pc-btn-primary pc-btn-sm"
                  onClick={() => onNavigate({ type: 'production', id: p.id })}
                >
                  <Users2 size={14} />
                  {p.is_chef ? 'Gérer' : 'Inviter'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {followed.length > 0 && (
        <div className="pc-followed-section">
          <h3 className="pc-section-title">
            <Heart size={16} />
            Productions suivies
          </h3>
          <div className="pc-prod-list">
            {followed.map((p) => (
              <div key={p.id} className="pc-prod-card">
                <button
                  type="button"
                  className="pc-prod-card-main"
                  onClick={() => onNavigate({ type: 'production-public', id: p.id })}
                  title="Voir la page de la production"
                >
                  <div className="pc-prod-card-icon">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" />
                    ) : (
                      <Building2 size={18} />
                    )}
                  </div>
                  <div className="pc-prod-card-body">
                    <p className="pc-prod-card-name">{p.name}</p>
                    <div className="pc-prod-card-tags">
                      <span className="pc-prod-tag">
                        {p.followers_count ?? 0} abonné{(p.followers_count ?? 0) > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {ToastComponent}
    </div>
  )
}
