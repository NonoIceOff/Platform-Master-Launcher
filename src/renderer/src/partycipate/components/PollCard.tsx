import { useState, type ReactElement } from 'react'
import { Calendar, Check, Clock, Trash2, Users } from 'lucide-react'
import type { Poll, PartycipateSession } from '../types'
import { votePoll, deletePoll } from '../utils/polls'
import { useToast } from './Toast'

interface PollCardProps {
  poll: Poll
  session: PartycipateSession | null
  onVoted?: (updated: Poll) => void
  onDeleted?: (pollId: number) => void
}

function formatDate(dateString?: string | null): string | null {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export default function PollCard({ poll, session, onVoted, onDeleted }: PollCardProps): ReactElement {
  const [voting, setVoting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const hasVoted = poll.my_vote_option_id != null
  const showResults = hasVoted || poll.is_closed || !session
  const isMine = session?.user.id === String(poll.user_id)
  const creatorName = poll.creator_username ?? poll.username ?? 'Inconnu'

  async function handleVote(optionId: number): Promise<void> {
    if (voting || !session) return
    setVoting(true)
    try {
      const updated = await votePoll(poll.id, optionId)
      onVoted?.(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de voter'
      showToast(message, 'error')
    } finally {
      setVoting(false)
    }
  }

  async function handleDelete(): Promise<void> {
    if (deleting) return
    if (!window.confirm('Supprimer ce sondage ?')) return
    setDeleting(true)
    try {
      await deletePoll(poll.id)
      onDeleted?.(poll.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de supprimer'
      showToast(message, 'error')
      setDeleting(false)
    }
  }

  return (
    <div className="pc-poll-card">
      <div className="pc-event-card-header">
        <h3>{poll.question}</h3>
        <div className="pc-poll-header-badges">
          {poll.category && <span className="pc-badge pc-poll-category">{poll.category}</span>}
          {poll.is_closed && <span className="pc-badge pc-badge-closed">Clos</span>}
          {isMine && (
            <button
              type="button"
              className="pc-icon-btn pc-poll-delete-btn"
              onClick={handleDelete}
              disabled={deleting}
              title="Supprimer le sondage"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="pc-poll-options">
        {showResults
          ? poll.options.map((opt) => {
              const pct = poll.total_votes > 0 ? Math.round((opt.votes_count / poll.total_votes) * 100) : 0
              const isMineOption = poll.my_vote_option_id === opt.id
              return (
                <div
                  key={opt.id}
                  className={`pc-poll-option pc-poll-bar-row ${isMineOption ? 'pc-poll-option-mine' : ''}`}
                >
                  <div className="pc-poll-bar-label">
                    <span>
                      {isMineOption && <Check size={13} />}
                      {opt.label}
                    </span>
                    <span>
                      {opt.votes_count} ({pct}%)
                    </span>
                  </div>
                  <div className="pc-poll-bar-track">
                    <div className="pc-poll-bar" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })
          : poll.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="pc-poll-option-btn"
                disabled={voting}
                onClick={() => handleVote(opt.id)}
              >
                {opt.label}
              </button>
            ))}
      </div>

      <div className="pc-event-byline">
        <div className="pc-event-creator">
          {poll.profile_picture ? (
            <img src={poll.profile_picture} alt="" className="pc-avatar-sm" />
          ) : (
            <div className="pc-avatar-sm pc-avatar-fallback">{creatorName[0]?.toUpperCase() ?? '?'}</div>
          )}
          <span>Par {creatorName}</span>
        </div>
      </div>

      <div className="pc-event-meta">
        <span>
          <Users size={12} />
          {poll.total_votes}
        </span>
        <span>
          <Calendar size={12} />
          {formatDate(poll.created_at)}
        </span>
        <span>
          <Clock size={12} />
          {formatDate(poll.ends_at) ?? 'Pas de date de fin'}
        </span>
      </div>
      {ToastComponent}
    </div>
  )
}
