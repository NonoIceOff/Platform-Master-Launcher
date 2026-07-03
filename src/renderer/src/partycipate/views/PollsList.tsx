import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { PlusCircle, RefreshCw, Search } from 'lucide-react'
import PollCard from '../components/PollCard'
import { fetchPolls, type PollSort } from '../utils/polls'
import type { PartycipateSession, PartycipateView, Poll } from '../types'

const SORTS: { id: PollSort; label: string }[] = [
  { id: 'recent', label: 'Récents' },
  { id: 'popular', label: 'Populaires' },
  { id: 'ending_soon', label: 'Se terminant bientôt' }
]

interface PollsListProps {
  onNavigate: (view: PartycipateView) => void
  session: PartycipateSession | null
}

export default function PollsList({ onNavigate, session }: PollsListProps): ReactElement {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [sort, setSort] = useState<PollSort>('recent')
  const [searchQuery, setSearchQuery] = useState('')

  const load = useCallback(async (currentSort: PollSort, search: string) => {
    setLoading(true)
    try {
      const list = await fetchPolls({ sort: currentSort, search })
      setPolls(list)
    } finally {
      setLoading(false)
      setLoaded(true)
    }
  }, [])

  // Recherche server-side, débouncée pour ne pas spammer l'API à chaque frappe.
  useEffect(() => {
    const t = setTimeout(() => {
      void load(sort, searchQuery)
    }, 300)
    return () => clearTimeout(t)
  }, [sort, searchQuery, load])

  function handleVoted(updated: Poll): void {
    setPolls((list) => list.map((p) => (p.id === updated.id ? updated : p)))
  }

  function handleDeleted(pollId: number): void {
    setPolls((list) => list.filter((p) => p.id !== pollId))
  }

  const showSkeleton = loading && !loaded

  return (
    <div className="pc-view">
      <div className="pc-view-header-row">
        <div className="pc-filter-row">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`pc-filter-btn ${sort === s.id ? 'active' : ''}`}
              onClick={() => setSort(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="pc-btn pc-btn-primary pc-btn-sm"
          onClick={() => onNavigate({ type: 'polls-create' })}
        >
          <PlusCircle size={16} />
          Créer un sondage
        </button>
      </div>

      <div className="pc-toolbar">
        <div className="pc-search">
          <Search size={15} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un sondage..."
          />
        </div>
        <button
          type="button"
          className="pc-icon-btn"
          onClick={() => load(sort, searchQuery)}
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
      ) : polls.length === 0 ? (
        <div className="pc-empty">
          <p className="pc-empty-title">Aucun sondage</p>
          <p className="pc-empty-sub">
            {searchQuery
              ? 'Aucun résultat pour cette recherche'
              : session
                ? 'Créez le premier avec le bouton en haut'
                : 'Connectez-vous pour créer un sondage'}
          </p>
        </div>
      ) : (
        <div className="pc-poll-list">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              session={session}
              onVoted={handleVoted}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
