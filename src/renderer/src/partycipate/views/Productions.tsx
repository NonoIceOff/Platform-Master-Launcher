import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { Building2, Crown, RefreshCw, Users2 } from 'lucide-react'
import { apiGet } from '../api'
import { useToast } from '../components/Toast'
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
  const [loading, setLoading] = useState(true)
  const { showToast, ToastComponent } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await apiGet<Production[]>('/productions/mine')
      setProductions(Array.isArray(list) ? list : [])
    } catch (err: unknown) {
      showToast((err as Error).message || 'Impossible de charger vos productions', 'error')
      setProductions([])
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

  return (
    <div className="pc-view">
      <div className="pc-view-header pc-view-header-row">
        <div>
          <p className="pc-view-kicker">Ma production</p>
          <h2 className="pc-view-title">Mes productions</h2>
          <p className="pc-gestion-sub">
            Vos productions et vos rôles. Gérez l&apos;équipe, les permissions et les invitations.
          </p>
        </div>
        <div className="pc-view-actions">
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
              <div className="pc-prod-card-icon">
                <Building2 size={18} />
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
              {(p.is_chef || p.can_invite) && (
                <button
                  type="button"
                  className="pc-btn pc-btn-primary pc-btn-sm"
                  onClick={() => onNavigate({ type: 'production', id: p.id })}
                >
                  <Users2 size={14} />
                  {p.is_chef ? "Gérer l'équipe" : 'Inviter'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {ToastComponent}
    </div>
  )
}
