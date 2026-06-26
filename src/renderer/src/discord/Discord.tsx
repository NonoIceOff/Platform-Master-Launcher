import { useState, useEffect, useRef, useCallback, type ReactElement } from 'react'
import {
  Hash,
  Megaphone,
  Lock,
  Send,
  Loader2,
  MessagesSquare,
  Shield,
  User,
  Star,
  Settings,
  X,
  Trash2
} from 'lucide-react'
import { apiGet, apiPost, apiPatch, apiDelete } from '../partycipate/api'
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
  role?: Role
  content: string
  created_at: string
}

type Role = 'admin' | 'producteur' | 'member'

interface Member {
  id: string
  username: string
  profile_picture: string | null
  role: Role
  isSuperAdmin: boolean
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  producteur: 'Producteur',
  member: 'Simple Membre'
}

function RoleBadge({ role }: { role: Role }): ReactElement {
  const Icon = role === 'admin' ? Shield : role === 'producteur' ? Star : User
  return (
    <span className={`discord-role ${role}`}>
      <Icon size={12} />
      {ROLE_LABELS[role]}
    </span>
  )
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [myRole, setMyRole] = useState<Role>('member')
  const [activeChannel, setActiveChannel] = useState<string>('general')
  const [messages, setMessages] = useState<ChannelMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const [showRoles, setShowRoles] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

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
    apiGet<{ channels: ChannelMeta[]; isAdmin: boolean; role: Role }>('/channels')
      .then((data) => {
        if (cancelled) return
        setChannels(data.channels)
        setIsAdmin(Boolean(data.isAdmin))
        setMyRole(data.role || 'member')
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

  const deleteMessage = useCallback(async (id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
    try {
      await apiDelete(`/channels/${activeChannelRef.current}/messages/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  const openRoles = useCallback(async () => {
    setShowRoles(true)
    setMembersLoading(true)
    setMembersError('')
    try {
      const data = await apiGet<{ members: Member[] }>('/channels/members')
      setMembers(data.members)
    } catch (e) {
      setMembersError(e instanceof Error ? e.message : String(e))
    } finally {
      setMembersLoading(false)
    }
  }, [])

  const changeRole = useCallback(
    async (member: Member, role: Role) => {
      if (member.isSuperAdmin || savingId || member.role === role) return
      setSavingId(member.id)
      setMembersError('')
      try {
        const data = await apiPatch<{ member: Member }>(`/channels/members/${member.id}`, { role })
        setMembers((prev) => prev.map((m) => (m.id === data.member.id ? data.member : m)))
        if (data.member.id === session?.user.id) {
          setIsAdmin(data.member.role === 'admin')
          setMyRole(data.member.role)
        }
      } catch (e) {
        setMembersError(e instanceof Error ? e.message : String(e))
      } finally {
        setSavingId(null)
      }
    },
    [savingId, session]
  )

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
        <div className="discord-channels-head">
          <span className="discord-channels-label">CHANNELS TEXTUELS</span>
          {isAdmin && (
            <button
              type="button"
              className="discord-gear"
              title="Gérer les rôles"
              onClick={() => void openRoles()}
            >
              <Settings size={15} />
            </button>
          )}
        </div>
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

        <div className="discord-userbar">
          <span className="discord-userbar-avatar">
            {session.user.profilePicture ? (
              <img src={session.user.profilePicture} alt="" />
            ) : (
              session.user.username.slice(0, 2).toUpperCase()
            )}
          </span>
          <div className="discord-userbar-info">
            <span className={`discord-userbar-name role-${myRole}`}>{session.user.username}</span>
            <RoleBadge role={myRole} />
          </div>
        </div>
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
                      <RoleBadge role={m.role || 'member'} />
                      <span className={`discord-msg-author role-${m.role || 'member'}`}>
                        {m.username}
                      </span>
                      <span className="discord-msg-time">{formatTime(m.created_at)}</span>
                    </div>
                  )}
                  <div className="discord-msg-content">{m.content}</div>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    className="discord-msg-delete"
                    title="Supprimer le message"
                    onClick={() => void deleteMessage(m.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
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

      {showRoles && (
        <div className="discord-modal-overlay" onClick={() => setShowRoles(false)}>
          <div className="discord-modal" onClick={(e) => e.stopPropagation()}>
            <div className="discord-modal-head">
              <div className="discord-modal-title">
                <Shield size={18} />
                <span>Gestion des rôles</span>
              </div>
              <button
                type="button"
                className="discord-modal-close"
                onClick={() => setShowRoles(false)}
              >
                <X size={18} />
              </button>
            </div>

            {membersError && <div className="discord-error">{membersError}</div>}

            <div className="discord-members">
              {membersLoading && <div className="discord-state">Chargement des membres…</div>}
              {!membersLoading &&
                members.map((m) => (
                  <div key={m.id} className="discord-member">
                    <span className="discord-member-avatar">
                      {m.profile_picture ? (
                        <img src={m.profile_picture} alt="" />
                      ) : (
                        m.username.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <div className="discord-member-info">
                      <span className={`discord-member-name role-${m.role}`}>
                        {m.username}
                        {m.isSuperAdmin && <span className="discord-superadmin-tag">super-admin</span>}
                      </span>
                      <RoleBadge role={m.role} />
                    </div>
                    {m.isSuperAdmin ? (
                      <span className="discord-member-locked">
                        <Lock size={14} />
                      </span>
                    ) : (
                      <div className="discord-role-select-wrap">
                        {savingId === m.id && (
                          <Loader2 size={14} className="discord-spin discord-role-saving" />
                        )}
                        <select
                          className="discord-role-select"
                          value={m.role}
                          disabled={savingId === m.id}
                          onChange={(e) => void changeRole(m, e.target.value as Role)}
                        >
                          <option value="admin">Admin</option>
                          <option value="producteur">Producteur</option>
                          <option value="member">Membre</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
