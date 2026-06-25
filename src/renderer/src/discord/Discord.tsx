import { useState, useEffect, useRef, useCallback, type ReactElement } from 'react'
import { Hash, Megaphone, Lock, Send, Loader2, MessagesSquare } from 'lucide-react'
import { apiGet, apiPost } from '../partycipate/api'
import './Discord.css'

interface ChannelMeta {
  id: string
  label: string
  description: string
  adminOnly: boolean
  canPost: boolean
}

interface ChannelMessage {
  id: number
  channel: string
  user_id: string
  username: string
  profile_picture: string | null
  content: string
  created_at: string
}

interface DiscordProps {
  session: {
    user: { id: string; email: string; username: string; profilePicture?: string | null }
  } | null
  onRequireLogin: () => void
}

function ChannelIcon({
  channel,
  size = 18,
  className
}: {
  channel: string
  size?: number
  className?: string
}): ReactElement {
  if (channel === 'annonces') return <Megaphone size={size} className={className} />
  return <Hash size={size} className={className} />
}

function formatTime(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (sameDay) return `Aujourd'hui à ${time}`
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} à ${time}`
}

export default function Discord({ session, onRequireLogin }: DiscordProps): ReactElement {
  const [channels, setChannels] = useState<ChannelMeta[]>([])
  const [activeChannel, setActiveChannel] = useState<string>('general')
  const [messages, setMessages] = useState<ChannelMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const lastIdRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const activeChannelRef = useRef(activeChannel)
  activeChannelRef.current = activeChannel

  const current = channels.find((c) => c.id === activeChannel)

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  // Charge la liste des channels une fois connecté.
  useEffect(() => {
    if (!session) return
    let cancelled = false
    apiGet<{ channels: ChannelMeta[] }>('/channels')
      .then((data) => {
        if (cancelled) return
        setChannels(data.channels)
        if (data.channels.length && !data.channels.some((c) => c.id === activeChannelRef.current)) {
          setActiveChannel(data.channels[0].id)
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
    return () => {
      cancelled = true
    }
  }, [session])

  // (Re)charge les messages au changement de channel.
  useEffect(() => {
    if (!session) return
    let cancelled = false
    setLoading(true)
    setError('')
    setMessages([])
    lastIdRef.current = 0

    apiGet<{ messages: ChannelMessage[] }>(`/channels/${activeChannel}/messages?limit=50`)
      .then((data) => {
        if (cancelled) return
        setMessages(data.messages)
        lastIdRef.current = data.messages.length ? data.messages[data.messages.length - 1].id : 0
        requestAnimationFrame(() => scrollToBottom(false))
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeChannel, session, scrollToBottom])

  // Polling des nouveaux messages.
  useEffect(() => {
    if (!session) return
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return
      const channel = activeChannelRef.current
      try {
        const data = await apiGet<{ messages: ChannelMessage[] }>(
          `/channels/${channel}/messages?afterId=${lastIdRef.current}`
        )
        if (!data.messages.length || channel !== activeChannelRef.current) return
        const el = scrollRef.current
        const wasAtBottom = el
          ? el.scrollHeight - el.scrollTop - el.clientHeight < 80
          : true
        setMessages((prev) => [...prev, ...data.messages])
        lastIdRef.current = data.messages[data.messages.length - 1].id
        if (wasAtBottom) requestAnimationFrame(() => scrollToBottom(true))
      } catch {
        // silencieux — on réessaie au prochain tick
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [session, scrollToBottom])

  const send = useCallback(async () => {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setError('')
    try {
      const data = await apiPost<{ message: ChannelMessage }>(
        `/channels/${activeChannel}/messages`,
        { content }
      )
      setDraft('')
      setMessages((prev) =>
        prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]
      )
      lastIdRef.current = Math.max(lastIdRef.current, data.message.id)
      requestAnimationFrame(() => scrollToBottom(true))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSending(false)
    }
  }, [draft, sending, activeChannel, scrollToBottom])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  if (!session) {
    return (
      <div className="discord-locked">
        <div className="discord-locked-card">
          <div className="discord-locked-icon">
            <MessagesSquare size={44} strokeWidth={1.75} />
          </div>
          <h2>Chat communautaire</h2>
          <p>Connectez-vous à votre compte pour accéder aux channels.</p>
          <button type="button" className="action-btn" onClick={onRequireLogin}>
            SE CONNECTER
          </button>
        </div>
      </div>
    )
  }

  const canPost = current ? current.canPost : true

  return (
    <div className="discord-view">
      <aside className="discord-sidebar">
        <div className="discord-channels-label">CHANNELS TEXTUELS</div>
        <ul className="discord-channel-list">
          {channels.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`discord-channel ${c.id === activeChannel ? 'active' : ''}`}
                onClick={() => setActiveChannel(c.id)}
              >
                <span className="discord-channel-hash">
                  <ChannelIcon channel={c.id} size={18} />
                </span>
                <span className="discord-channel-name">{c.label}</span>
                {c.adminOnly && (
                  <Lock className="discord-channel-lock" size={13} aria-label="Lecture seule" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="discord-main">
        <header className="discord-channel-header">
          <ChannelIcon channel={activeChannel} size={22} className="discord-channel-hash big" />
          <span className="discord-channel-title">{current?.label || activeChannel}</span>
          {current?.description && (
            <>
              <span className="discord-header-divider" />
              <span className="discord-channel-desc">{current.description}</span>
            </>
          )}
        </header>

        <div className="discord-messages" ref={scrollRef}>
          {loading && <div className="discord-state">Chargement des messages…</div>}
          {!loading && messages.length === 0 && (
            <div className="discord-empty">
              <div className="discord-empty-hash">
                <ChannelIcon channel={activeChannel} size={30} />
              </div>
              <h3>Bienvenue dans #{current?.label || activeChannel}</h3>
              <p>C'est le tout début de ce channel.</p>
            </div>
          )}
          {messages.map((m, idx) => {
            const prev = messages[idx - 1]
            const grouped =
              prev &&
              prev.user_id === m.user_id &&
              new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60 * 1000
            const mine = m.user_id === session.user.id
            return (
              <div key={m.id} className={`discord-msg ${grouped ? 'grouped' : ''}`}>
                {!grouped ? (
                  <span className="discord-avatar">
                    {m.profile_picture ? (
                      <img src={m.profile_picture} alt="" />
                    ) : (
                      m.username.slice(0, 2).toUpperCase()
                    )}
                  </span>
                ) : (
                  <span className="discord-avatar-spacer" />
                )}
                <div className="discord-msg-body">
                  {!grouped && (
                    <div className="discord-msg-head">
                      <span className={`discord-msg-author ${mine ? 'mine' : ''}`}>
                        {m.username}
                      </span>
                      <span className="discord-msg-time">{formatTime(m.created_at)}</span>
                    </div>
                  )}
                  <div className="discord-msg-content">{m.content}</div>
                </div>
              </div>
            )
          })}
        </div>

        {error && <div className="discord-error">{error}</div>}

        <div className="discord-composer">
          {canPost ? (
            <>
              <textarea
                className="discord-input"
                placeholder={`Envoyer un message dans #${current?.label || activeChannel}`}
                value={draft}
                rows={1}
                maxLength={2000}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <button
                type="button"
                className="discord-send"
                disabled={sending || !draft.trim()}
                onClick={() => void send()}
              >
                {sending ? (
                  <Loader2 size={18} className="discord-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>Envoyer</span>
              </button>
            </>
          ) : (
            <div className="discord-readonly">
              <Lock size={14} />
              <span>Seul le staff peut écrire dans ce channel.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
