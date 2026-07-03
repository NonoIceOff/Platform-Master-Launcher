import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { Trophy } from 'lucide-react'
import { fetchLeaderboard, type LeaderboardWindow } from '../utils/points'
import type { LeaderboardEntry } from '../types'

const WINDOWS: { id: LeaderboardWindow; label: string }[] = [
  { id: 'week', label: 'Semaine' },
  { id: 'month', label: 'Mois' },
  { id: 'all', label: 'Tout temps' }
]

export default function Classement(): ReactElement {
  const [timeWindow, setTimeWindow] = useState<LeaderboardWindow>('all')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async (w: LeaderboardWindow) => {
    setLoading(true)
    try {
      const list = await fetchLeaderboard(w)
      setEntries(list)
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    void load(timeWindow)
  }, [timeWindow, load])

  const showSkeleton = loading && !loaded

  return (
    <div className="pc-view">
      <div className="pc-view-header-row">
        <div>
          <p className="pc-view-kicker">Communauté</p>
          <h2 className="pc-view-title">Classement</h2>
        </div>
      </div>

      <div className="pc-filter-row">
        {WINDOWS.map((w) => (
          <button
            key={w.id}
            type="button"
            className={`pc-filter-btn ${timeWindow === w.id ? 'active' : ''}`}
            onClick={() => setTimeWindow(w.id)}
          >
            {w.label}
          </button>
        ))}
      </div>

      {showSkeleton ? (
        <div className="pc-skeleton-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pc-skeleton" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="pc-empty">
          <p className="pc-empty-title">Aucun classement pour le moment</p>
          <p className="pc-empty-sub">Les points gagnés sur cette période apparaîtront ici.</p>
        </div>
      ) : (
        <div className="pc-leaderboard-list">
          {entries.map((entry, i) => {
            const rank = i + 1
            return (
              <div
                key={entry.user_id}
                className={`pc-leaderboard-row ${rank <= 3 ? `pc-leaderboard-row-top${rank}` : ''}`}
              >
                <span className="pc-leaderboard-rank">#{rank}</span>
                {entry.profile_picture ? (
                  <img src={entry.profile_picture} alt="" className="pc-avatar-sm" />
                ) : (
                  <div className="pc-avatar-sm pc-avatar-fallback">
                    {entry.username[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <span className="pc-leaderboard-name">{entry.username}</span>
                <span className="pc-leaderboard-points">
                  <Trophy size={14} />
                  {entry.total}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
