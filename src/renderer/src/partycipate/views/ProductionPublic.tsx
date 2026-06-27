import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { ArrowLeft, Building2, Heart, Settings2, Users } from 'lucide-react'
import { apiGet } from '../api'
import { useToast } from '../components/Toast'
import EventCard from '../components/EventCard'
import {
  fetchProductionPublic,
  fetchFollowState,
  followProduction,
  unfollowProduction
} from '../utils/productions'
import { toVideoEmbed } from '../utils/videoEmbed'
import type { Event, PartycipateSession, PartycipateView, Production } from '../types'

interface ProductionPublicProps {
  productionId: string
  session: PartycipateSession | null
  onBack: () => void
  onNavigate: (view: PartycipateView) => void
  onGoToLogin: () => void
}

export default function ProductionPublic({
  productionId,
  session,
  onBack,
  onNavigate,
  onGoToLogin
}: ProductionPublicProps): ReactElement {
  const [production, setProduction] = useState<Production | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followBusy, setFollowBusy] = useState(false)
  const [isChef, setIsChef] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showToast, ToastComponent } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const prod = await fetchProductionPublic(productionId)
      setProduction(prod)
      if (!prod) return

      const fs = await fetchFollowState(productionId, !!session)
      setFollowing(fs.following)
      setFollowersCount(fs.followers_count)

      try {
        const all = await apiGet<Event[] | { data: Event[] }>('/events', false)
        const list = Array.isArray(all) ? all : (all.data ?? [])
        setEvents(list.filter((e) => e.production_id === productionId))
      } catch {
        setEvents([])
      }

      if (session) {
        // is_chef renvoyé ici vaut aussi pour les admins (supervision).
        try {
          const m = await apiGet<{ is_chef?: boolean }>(
            `/productions/${productionId}/members`
          )
          setIsChef(!!m.is_chef)
        } catch {
          setIsChef(false)
        }
      }
    } catch {
      setProduction(null)
    } finally {
      setLoading(false)
    }
  }, [productionId, session])

  useEffect(() => {
    void load()
  }, [load])

  async function toggleFollow(): Promise<void> {
    if (!session) return onGoToLogin()
    setFollowBusy(true)
    try {
      const fs = following
        ? await unfollowProduction(productionId, true)
        : await followProduction(productionId)
      setFollowing(fs.following)
      setFollowersCount(fs.followers_count)
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setFollowBusy(false)
    }
  }

  if (loading) return <div className="pc-view pc-loading">Chargement…</div>
  if (!production) return <div className="pc-view pc-loading">Production introuvable.</div>

  const videos = production.videos ?? []

  return (
    <div className="pc-view">
      <div className="pc-detail-header">
        <button type="button" className="pc-icon-btn" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="pc-view-kicker">Production</p>
          <h2 className="pc-view-title">{production.name}</h2>
        </div>
      </div>

      <div className="pc-prod-hero">
        <div className="pc-prod-hero-avatar">
          {production.avatar_url ? (
            <img src={production.avatar_url} alt="" />
          ) : (
            <Building2 size={34} />
          )}
        </div>
        <div className="pc-prod-hero-info">
          <h3 className="pc-prod-hero-name">{production.name}</h3>
          <div className="pc-prod-hero-stats">
            <span>
              <Heart size={14} />
              {followersCount} abonné{followersCount > 1 ? 's' : ''}
            </span>
            <span>
              <Users size={14} />
              {production.members_count ?? 0} membre{(production.members_count ?? 0) > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="pc-prod-hero-actions">
          {isChef && (
            <button
              type="button"
              className="pc-btn pc-btn-ghost pc-btn-sm"
              onClick={() => onNavigate({ type: 'production', id: productionId })}
            >
              <Settings2 size={15} />
              Gérer
            </button>
          )}
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
      </div>

      {production.description && (
        <div className="pc-prod-about">
          <h3 className="pc-section-title">À propos</h3>
          <p className="pc-prod-about-text">{production.description}</p>
        </div>
      )}

      {videos.length > 0 && (
        <div className="pc-prod-videos">
          <h3 className="pc-section-title">Vidéos</h3>
          <div className="pc-prod-video-grid">
            {videos.map((v, i) => {
              const embed = toVideoEmbed(v)
              return (
                <div key={i} className="pc-prod-video">
                  {embed.kind === 'iframe' ? (
                    <iframe
                      src={embed.src}
                      title={`Vidéo ${i + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={embed.src} controls />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="pc-prod-events">
        <h3 className="pc-section-title">Événements</h3>
        {events.length === 0 ? (
          <p className="pc-empty-sub">Aucun événement pour cette production.</p>
        ) : (
          <div className="pc-event-list">
            {events.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onClick={(id) => onNavigate({ type: 'event', id })}
              />
            ))}
          </div>
        )}
      </div>

      {ToastComponent}
    </div>
  )
}
