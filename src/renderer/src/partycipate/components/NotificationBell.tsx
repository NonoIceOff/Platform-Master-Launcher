import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react'
import { Bell, Building2, CalendarDays } from 'lucide-react'
import {
  fetchNotifications,
  markNotificationsRead,
  type AppNotification
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
}

export default function NotificationBell({
  enabled,
  onOpenEvent
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

  async function toggle(): Promise<void> {
    const next = !open
    setOpen(next)
    if (next && unread > 0) {
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
      await markNotificationsRead()
    }
  }

  function handleOpen(n: AppNotification): void {
    setOpen(false)
    onOpenEvent(n.event_id)
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
        {unread > 0 && <span className="pc-notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <>
          <div className="pc-notif-backdrop" onClick={() => setOpen(false)} />
          <div className="pc-notif-pop" role="menu">
            <div className="pc-notif-head">Notifications</div>
            {items.length === 0 ? (
              <div className="pc-notif-empty">
                Aucune notification.
                <span>
                  Abonne-toi à des productions pour être prévenu de leurs nouveaux événements.
                </span>
              </div>
            ) : (
              <div className="pc-notif-list">
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
