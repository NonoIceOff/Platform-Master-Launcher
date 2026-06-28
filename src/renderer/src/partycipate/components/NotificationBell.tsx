import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react'
import { Bell, Building2, CalendarDays, Hash, MessagesSquare, AtSign } from 'lucide-react'
import {
  fetchNotifications,
  markNotificationsRead,
  markMentionsRead,
  type AppNotification,
  type ChatUnreadChannel,
  type MentionNotification
} from '../utils/notifications'

const POLL_MS = 60_000

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  if (Number.isNaN(d)) return ''
  const diff = Math.max(0, Date.now() - d)
  const min = Math.floor(diff / 60_000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h} h`
  const j = Math.floor(h / 24)
  if (j < 7) return `il y a ${j} j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

interface NotificationBellProps {
  enabled: boolean
  onOpenEvent: (eventId: number) => void
  onOpenChannel?: (channelId: string) => void
  chatTotal?: number
  chatChannels?: ChatUnreadChannel[]
  mentions?: MentionNotification[]
  mentionUnread?: number
}

export default function NotificationBell({
  enabled,
  onOpenEvent,
  onOpenChannel,
  chatTotal = 0,
  chatChannels = [],
  mentions = [],
  mentionUnread = 0
}: NotificationBellProps): ReactElement | null {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    const data = await fetchNotifications()
    setItems(data.notifications)
    setUnread(data.unread_count)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setItems([])
      setUnread(0)
      return
    }
    void load()
    timer.current = setInterval(() => void load(), POLL_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [enabled, load])

  if (!enabled) return null

  // Le badge cumule événements non lus, messages de chat non lus et mentions.
  const totalBadge = unread + chatTotal + mentionUnread
  const hasContent = items.length > 0 || chatChannels.length > 0 || mentions.length > 0

  async function toggle(): Promise<void> {
    const next = !open
    setOpen(next)
    // Ouvrir l'inbox marque les notifs d'événements ET les mentions comme lues ;
    // les messages de chat restent non lus tant que le channel n'est pas ouvert.
    if (next && unread > 0) {
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
      await markNotificationsRead()
    }
    if (next && mentionUnread > 0) {
      await markMentionsRead()
      window.dispatchEvent(new CustomEvent('partycipate-mentions-read'))
    }
  }

  function handleOpen(n: AppNotification): void {
    setOpen(false)
    onOpenEvent(n.event_id)
  }

  function handleOpenChannel(c: ChatUnreadChannel): void {
    setOpen(false)
    onOpenChannel?.(c.id)
  }

  function handleOpenMention(m: MentionNotification): void {
    setOpen(false)
    onOpenChannel?.(m.channel)
  }

  return (
    <div className="pc-notif">
      <button
        type="button"
        className={`pc-notif-btn ${open ? 'active' : ''}`}
        onClick={() => void toggle()}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Notifications"
      >
        <Bell size={16} />
        {totalBadge > 0 && (
          <span className="pc-notif-badge">{totalBadge > 9 ? '9+' : totalBadge}</span>
        )}
      </button>

      {open && (
        <>
          <div className="pc-notif-backdrop" onClick={() => setOpen(false)} />
          <div className="pc-notif-pop" role="menu">
            <div className="pc-notif-head">Notifications</div>
            {!hasContent ? (
              <div className="pc-notif-empty">
                Aucune notification.
                <span>
                  Abonne-toi à des productions pour être prévenu de leurs nouveaux événements.
                </span>
              </div>
            ) : (
              <div className="pc-notif-list">
                {mentions.map((m) => (
                  <button
                    key={`mention-${m.id}`}
                    type="button"
                    className={`pc-notif-item ${m.unread ? 'unread' : ''}`}
                    onClick={() => handleOpenMention(m)}
                  >
                    <span className="pc-notif-avatar">
                      {m.from_avatar ? (
                        <img src={m.from_avatar} alt="" />
                      ) : (
                        <AtSign size={15} />
                      )}
                    </span>
                    <span className="pc-notif-body">
                      <span className="pc-notif-text">
                        <strong>{m.from_username}</strong> vous a mentionné dans{' '}
                        <strong>{m.production ? m.channel_label : `#${m.channel_label}`}</strong>
                      </span>
                      <span className="pc-notif-meta">
                        <AtSign size={11} />
                        {timeAgo(m.created_at)}
                      </span>
                    </span>
                    {m.unread && <span className="pc-notif-dot" />}
                  </button>
                ))}
                {chatChannels.map((c) => (
                  <button
                    key={`chat-${c.id}`}
                    type="button"
                    className="pc-notif-item unread"
                    onClick={() => handleOpenChannel(c)}
                  >
                    <span className="pc-notif-avatar">
                      <MessagesSquare size={15} />
                    </span>
                    <span className="pc-notif-body">
                      <span className="pc-notif-text">
                        <strong>
                          {c.count} nouveau{c.count > 1 ? 'x' : ''} message{c.count > 1 ? 's' : ''}
                        </strong>{' '}
                        dans <strong>{c.production ? c.label : `#${c.label}`}</strong>
                      </span>
                      <span className="pc-notif-meta">
                        <Hash size={11} />
                        Chat
                      </span>
                    </span>
                    <span className="pc-notif-dot" />
                  </button>
                ))}
                {items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={`pc-notif-item ${n.unread ? 'unread' : ''}`}
                    onClick={() => handleOpen(n)}
                  >
                    <span className="pc-notif-avatar">
                      {n.production_avatar ? (
                        <img src={n.production_avatar} alt="" />
                      ) : (
                        <Building2 size={15} />
                      )}
                    </span>
                    <span className="pc-notif-body">
                      <span className="pc-notif-text">
                        <strong>{n.production_name ?? 'Une production'}</strong> a ouvert les
                        inscriptions de <strong>{n.name}</strong>
                      </span>
                      <span className="pc-notif-meta">
                        <CalendarDays size={11} />
                        {timeAgo(n.created_at)}
                      </span>
                    </span>
                    {n.unread && <span className="pc-notif-dot" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
