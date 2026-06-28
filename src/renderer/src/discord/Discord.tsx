import {
  useState,
  useEffect,
  useRef,
  useCallback,
  Fragment,
  type ReactElement,
  type ReactNode
} from 'react'
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
  Trash2,
  Users,
  Eye,
  PencilLine,
  Building2,
  Reply,
  AtSign
} from 'lucide-react'
import { apiGet, apiPost, apiPatch, apiDelete } from '../partycipate/api'
import {
  fetchChatUnread,
  markChannelRead,
  searchMembers,
  type MemberSuggestion
} from '../partycipate/utils/notifications'
import './Discord.css'

interface ChannelMeta {
  id: string
  label: string
  description: string
  adminOnly: boolean
  canPost: boolean
  production?: boolean
}

interface MessageReaction {
  emoji: string
  count: number
  me: boolean
}

interface ReplyPreview {
  id: number
  user_id?: string
  username?: string
  content?: string
  deleted?: boolean
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
  reactions?: MessageReaction[]
  reply_to?: number | null
  reply_preview?: ReplyPreview | null
}

interface ReplyTarget {
  id: number
  username: string
  content: string
}

const DEFAULT_REACTIONS = ['👍', '❤️', '😂', '😮', '😢']

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

interface ChannelAccessMember {
  id: string
  username: string
  profile_picture: string | null
  role: Role
  canPost: boolean
  isChef: boolean
  adminOversight: boolean
}

interface ChannelAccess {
  channel: string
  label: string
  type: 'public' | 'announce' | 'production'
  productionName: string | null
  readScope: string
  writeScope: string
  members: ChannelAccessMember[]
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
  initialChannel?: string | null
}

function ChannelIcon({
  channel,
  production = false,
  size = 18,
  className
}: {
  channel: string
  production?: boolean
  size?: number
  className?: string
}): ReactElement {
  if (production) return <Building2 size={size} className={className} />
  if (channel === 'annonces') return <Megaphone size={size} className={className} />
  return <Hash size={size} className={className} />
}

// Détecte les liens dans un message et les rend cliquables (ouverture externe).
const URL_RE = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi
const MENTION_RE = /@([a-zA-Z0-9_]{2,24})/g

// Découpe un fragment de texte brut et met en valeur les mentions @username.
function renderMentions(text: string, keyBase: string, me?: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null
  MENTION_RE.lastIndex = 0
  while ((match = MENTION_RE.exec(text)) !== null) {
    const start = match.index
    if (start > lastIndex) nodes.push(text.slice(lastIndex, start))
    const isMe = !!me && match[1].toLowerCase() === me.toLowerCase()
    nodes.push(
      <span key={`${keyBase}m${key++}`} className={`discord-mention ${isMe ? 'me' : ''}`}>
        @{match[1]}
      </span>
    )
    lastIndex = start + match[0].length
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

function renderMessageContent(text: string, me?: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null
  URL_RE.lastIndex = 0
  while ((match = URL_RE.exec(text)) !== null) {
    const start = match.index
    let url = match[0]
    // On retire la ponctuation finale (point, parenthèse…) du lien.
    const trailing = url.match(/[.,!?;:)\]}'"]+$/)
    const suffix = trailing ? trailing[0] : ''
    if (suffix) url = url.slice(0, url.length - suffix.length)
    if (start > lastIndex) {
      nodes.push(...renderMentions(text.slice(lastIndex, start), `u${key}`, me))
    }
    const href = url.startsWith('www.') ? `https://${url}` : url
    nodes.push(
      <a
        key={`l${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="discord-msg-link"
      >
        {url}
      </a>
    )
    if (suffix) nodes.push(suffix)
    lastIndex = start + match[0].length
  }
  if (lastIndex < text.length) {
    nodes.push(...renderMentions(text.slice(lastIndex), `u${key}`, me))
  }
  return nodes
}

function parseDate(iso: string): Date {
  return new Date(iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`)
}

// Clé de regroupement par jour (jour calendaire local).
function dayKey(iso: string): string {
  const d = parseDate(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toDateString()
}

// Libellé du séparateur de jour : Aujourd'hui / Hier / date complète.
function formatDayLabel(iso: string): string {
  const d = parseDate(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui"
  if (d.toDateString() === new Date(now.getTime() - 86_400_000).toDateString()) return 'Hier'
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' })
  })
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

export default function Discord({
  session,
  onRequireLogin,
  initialChannel
}: DiscordProps): ReactElement {
  const [channels, setChannels] = useState<ChannelMeta[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [myRole, setMyRole] = useState<Role>('member')
  const [activeChannel, setActiveChannel] = useState<string>(initialChannel || 'general')
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({})
  const [reactionEmojis, setReactionEmojis] = useState<string[]>(DEFAULT_REACTIONS)
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

  const [showAccess, setShowAccess] = useState(false)
  const [access, setAccess] = useState<ChannelAccess | null>(null)
  const [accessLoading, setAccessLoading] = useState(false)
  const [accessError, setAccessError] = useState('')

  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null)
  const [showThread, setShowThread] = useState(false)
  const [threadMessages, setThreadMessages] = useState<ChannelMessage[]>([])
  const [threadLoading, setThreadLoading] = useState(false)
  const [threadError, setThreadError] = useState('')

  // Autocomplétion des mentions @username dans le composer.
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null)
  const [mentionResults, setMentionResults] = useState<MemberSuggestion[]>([])
  const [mentionIndex, setMentionIndex] = useState(0)

  const lastIdRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const activeChannelRef = useRef(activeChannel)
  activeChannelRef.current = activeChannel
  const messageIdsRef = useRef<number[]>([])
  messageIdsRef.current = messages.map((m) => m.id)

  const current = channels.find((c) => c.id === activeChannel)

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  // Marque un channel comme lu (serveur + badge local).
  const markRead = useCallback((channel: string, messageId: number) => {
    setUnreadMap((prev) => (prev[channel] ? { ...prev, [channel]: 0 } : prev))
    void markChannelRead(channel, messageId)
  }, [])

  // Si on ouvre le chat depuis une notif, sélectionne le channel demandé.
  useEffect(() => {
    if (initialChannel) setActiveChannel(initialChannel)
  }, [initialChannel])

  // Compteurs de messages non lus par channel (badges sidebar + onglet).
  useEffect(() => {
    if (!session) return
    let cancelled = false
    const refresh = (): void => {
      if (typeof document !== 'undefined' && document.hidden) return
      void fetchChatUnread().then((data) => {
        if (cancelled) return
        const map: Record<string, number> = {}
        for (const c of data.channels) map[c.id] = c.count
        map[activeChannelRef.current] = 0
        setUnreadMap(map)
      })
    }
    refresh()
    const id = setInterval(refresh, 8000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [session])

  // Charge la liste des channels une fois connecté.
  useEffect(() => {
    if (!session) return
    let cancelled = false
    apiGet<{
      channels: ChannelMeta[]
      isAdmin: boolean
      role: Role
      reactionEmojis?: string[]
    }>('/channels')
      .then((data) => {
        if (cancelled) return
        setChannels(data.channels)
        setIsAdmin(Boolean(data.isAdmin))
        setMyRole(data.role || 'member')
        if (Array.isArray(data.reactionEmojis) && data.reactionEmojis.length) {
          setReactionEmojis(data.reactionEmojis)
        }
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
        // Plusieurs passes : le contenu (avatars/images) peut grandir après le
        // premier rendu, on garantit ainsi d'arriver tout en bas.
        requestAnimationFrame(() => scrollToBottom(false))
        setTimeout(() => scrollToBottom(false), 60)
        setTimeout(() => scrollToBottom(false), 200)
        // Ouvrir un channel le marque comme lu.
        markRead(activeChannel, lastIdRef.current)
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeChannel, session, scrollToBottom, markRead])

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
        // Le channel est actif et visible → on le garde marqué comme lu.
        markRead(channel, lastIdRef.current)
        if (wasAtBottom) requestAnimationFrame(() => scrollToBottom(true))
      } catch {
        // silencieux — on réessaie au prochain tick
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [session, scrollToBottom, markRead])

  // Réagir à un message (une seule réaction par utilisateur, bascule).
  const react = useCallback(async (messageId: number, emoji: string) => {
    try {
      const data = await apiPost<{ message_id: number; reactions: MessageReaction[] }>(
        `/channels/${activeChannelRef.current}/messages/${messageId}/reactions`,
        { emoji }
      )
      setMessages((prev) =>
        prev.map((m) => (m.id === data.message_id ? { ...m, reactions: data.reactions } : m))
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  // Mise à jour live des réactions des messages affichés.
  useEffect(() => {
    if (!session) return
    const interval = setInterval(async () => {
      if (typeof document !== 'undefined' && document.hidden) return
      const ids = messageIdsRef.current
      if (!ids.length) return
      const channel = activeChannelRef.current
      try {
        const data = await apiGet<{ reactions: Record<string, MessageReaction[]> }>(
          `/channels/${channel}/reactions?ids=${ids.join(',')}`
        )
        if (channel !== activeChannelRef.current) return
        setMessages((prev) => prev.map((m) => ({ ...m, reactions: data.reactions[m.id] || [] })))
      } catch {
        // silencieux
      }
    }, 6000)
    return () => clearInterval(interval)
  }, [session])

  const send = useCallback(async () => {
    const content = draft.trim()
    if (!content || sending) return
    setSending(true)
    setError('')
    try {
      const data = await apiPost<{ message: ChannelMessage }>(
        `/channels/${activeChannel}/messages`,
        { content, replyTo: replyTo?.id ?? null }
      )
      setDraft('')
      setReplyTo(null)
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
  }, [draft, sending, activeChannel, scrollToBottom, replyTo])

  // Ouvre la modal de conversation (fil) autour d'un message.
  const openThread = useCallback(async (messageId: number) => {
    setShowThread(true)
    setThreadLoading(true)
    setThreadError('')
    setThreadMessages([])
    try {
      const data = await apiGet<{ root_id: number; messages: ChannelMessage[] }>(
        `/channels/${activeChannelRef.current}/messages/${messageId}/thread`
      )
      setThreadMessages(data.messages)
    } catch (e) {
      setThreadError(e instanceof Error ? e.message : String(e))
    } finally {
      setThreadLoading(false)
    }
  }, [])

  const startReply = useCallback((m: ChannelMessage) => {
    setReplyTo({ id: m.id, username: m.username, content: m.content })
    inputRef.current?.focus()
  }, [])

  // Détecte un token @… juste avant le curseur pour déclencher l'autocomplétion.
  const detectMention = useCallback((value: string, caret: number) => {
    const before = value.slice(0, caret)
    const match = before.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/)
    if (!match) {
      setMention(null)
      return
    }
    const query = match[1]
    const start = caret - query.length - 1
    setMention({ start, query })
    setMentionIndex(0)
  }, [])

  const onDraftChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDraft(e.target.value)
      detectMention(e.target.value, e.target.selectionStart ?? e.target.value.length)
    },
    [detectMention]
  )

  // Recherche debouncée des membres correspondant au token courant.
  useEffect(() => {
    if (!mention) {
      setMentionResults([])
      return
    }
    let cancelled = false
    const id = setTimeout(() => {
      void searchMembers(activeChannelRef.current, mention.query).then((list) => {
        if (!cancelled) {
          setMentionResults(list)
          setMentionIndex(0)
        }
      })
    }, 120)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [mention])

  const applyMention = useCallback(
    (member: MemberSuggestion) => {
      if (!mention) return
      const end = mention.start + 1 + mention.query.length
      const next = `${draft.slice(0, mention.start)}@${member.username} ${draft.slice(end)}`
      setDraft(next)
      setMention(null)
      setMentionResults([])
      const caret = mention.start + member.username.length + 2
      requestAnimationFrame(() => {
        const el = inputRef.current
        if (el) {
          el.focus()
          el.setSelectionRange(caret, caret)
        }
      })
    },
    [mention, draft]
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (mention && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex((i) => (i + 1) % mentionResults.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex((i) => (i - 1 + mentionResults.length) % mentionResults.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        applyMention(mentionResults[mentionIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setMention(null)
        return
      }
    }
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

  const openAccess = useCallback(async () => {
    setShowAccess(true)
    setAccessLoading(true)
    setAccessError('')
    setAccess(null)
    try {
      const data = await apiGet<ChannelAccess>(`/channels/${activeChannelRef.current}/access`)
      setAccess(data)
    } catch (e) {
      setAccessError(e instanceof Error ? e.message : String(e))
    } finally {
      setAccessLoading(false)
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

  const baseChannels = channels.filter((c) => !c.production)
  const prodChannels = channels.filter((c) => c.production)

  const renderChannel = (c: ChannelMeta): ReactElement => (
    <li key={c.id}>
      <button
        type="button"
        className={`discord-channel ${c.id === activeChannel ? 'active' : ''}`}
        onClick={() => setActiveChannel(c.id)}
      >
        <span className="discord-channel-hash">
          <ChannelIcon channel={c.id} production={c.production} size={18} />
        </span>
        <span className="discord-channel-name">{c.label}</span>
        {c.adminOnly && (
          <Lock className="discord-channel-lock" size={13} aria-label="Lecture seule" />
        )}
        {c.id !== activeChannel && unreadMap[c.id] > 0 && (
          <span className="discord-channel-badge">
            {unreadMap[c.id] > 9 ? '9+' : unreadMap[c.id]}
          </span>
        )}
      </button>
    </li>
  )

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
        <ul className="discord-channel-list">{baseChannels.map(renderChannel)}</ul>

        {prodChannels.length > 0 && (
          <>
            <div className="discord-channels-head discord-channels-head-sub">
              <span className="discord-channels-label">PRODUCTIONS</span>
            </div>
            <ul className="discord-channel-list">{prodChannels.map(renderChannel)}</ul>
          </>
        )}

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
          <ChannelIcon
            channel={activeChannel}
            production={current?.production}
            size={22}
            className="discord-channel-hash big"
          />
          <span className="discord-channel-title">{current?.label || activeChannel}</span>
          {current?.description && (
            <>
              <span className="discord-header-divider" />
              <span className="discord-channel-desc">{current.description}</span>
            </>
          )}
          <button
            type="button"
            className="discord-access-btn"
            onClick={() => void openAccess()}
            title="Qui a accès à ce salon"
          >
            <Users size={15} />
            <span>Qui a accès à ce salon</span>
          </button>
        </header>

        <div className="discord-messages" ref={scrollRef}>
          {loading && <div className="discord-state">Chargement des messages…</div>}
          {!loading && messages.length === 0 && (
            <div className="discord-empty">
              <div className="discord-empty-hash">
                <ChannelIcon channel={activeChannel} production={current?.production} size={30} />
              </div>
              <h3>Bienvenue dans #{current?.label || activeChannel}</h3>
              <p>C'est le tout début de ce channel.</p>
            </div>
          )}
          {messages.map((m, idx) => {
            const prev = messages[idx - 1]
            const showDay = idx === 0 || dayKey(prev.created_at) !== dayKey(m.created_at)
            const grouped =
              !showDay &&
              !m.reply_to &&
              prev &&
              prev.user_id === m.user_id &&
              new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 5 * 60 * 1000
            return (
              <Fragment key={m.id}>
              {showDay && (
                <div className="discord-day-sep">
                  <span>{formatDayLabel(m.created_at)}</span>
                </div>
              )}
              <div className={`discord-msg ${grouped ? 'grouped' : ''}`}>
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
                  {m.reply_preview && (
                    <div className="discord-reply-preview">
                      <Reply size={13} className="discord-reply-icon" />
                      {m.reply_preview.deleted ? (
                        <span className="discord-reply-deleted">Message supprimé</span>
                      ) : (
                        <>
                          <span className="discord-reply-author">{m.reply_preview.username}</span>
                          <span className="discord-reply-text">{m.reply_preview.content}</span>
                        </>
                      )}
                      <button
                        type="button"
                        className="discord-reply-view"
                        onClick={() => void openThread(m.id)}
                      >
                        <MessagesSquare size={11} />
                        Voir la conversation
                      </button>
                    </div>
                  )}
                  {!grouped && (
                    <div className="discord-msg-head">
                      <RoleBadge role={m.role || 'member'} />
                      <span className={`discord-msg-author role-${m.role || 'member'}`}>
                        {m.username}
                      </span>
                      <span className="discord-msg-time">{formatTime(m.created_at)}</span>
                    </div>
                  )}
                  <div className="discord-msg-content">
                    {renderMessageContent(m.content, session.user.username)}
                  </div>
                  {m.reactions && m.reactions.length > 0 && (
                    <div className="discord-reactions">
                      {m.reactions.map((r) => (
                        <button
                          key={r.emoji}
                          type="button"
                          className={`discord-reaction ${r.me ? 'me' : ''}`}
                          onClick={() => void react(m.id, r.emoji)}
                        >
                          <span>{r.emoji}</span>
                          <span className="discord-reaction-count">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="discord-msg-actions">
                  {reactionEmojis.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className="discord-msg-action-emoji"
                      title="Réagir"
                      onClick={() => void react(m.id, e)}
                    >
                      {e}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="discord-msg-action-del"
                    title="Répondre"
                    onClick={() => startReply(m)}
                  >
                    <Reply size={14} />
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="discord-msg-action-del"
                      title="Supprimer le message"
                      onClick={() => void deleteMessage(m.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              </Fragment>
            )
          })}
        </div>

        {error && <div className="discord-error">{error}</div>}

        {replyTo && canPost && (
          <div className="discord-reply-banner">
            <Reply size={14} className="discord-reply-icon" />
            <span className="discord-reply-banner-label">
              Réponse à <strong>{replyTo.username}</strong>
            </span>
            <span className="discord-reply-banner-text">{replyTo.content}</span>
            <button
              type="button"
              className="discord-reply-banner-close"
              title="Annuler la réponse"
              onClick={() => setReplyTo(null)}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="discord-composer-wrap">
          {mention && canPost && mentionResults.length > 0 && (
            <div className="discord-mention-pop">
              <div className="discord-mention-head">
                <AtSign size={12} />
                Mentionner un membre
              </div>
              {mentionResults.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  className={`discord-mention-item ${i === mentionIndex ? 'active' : ''}`}
                  onMouseEnter={() => setMentionIndex(i)}
                  onClick={() => applyMention(m)}
                >
                  <span className="discord-mention-avatar">
                    {m.profile_picture ? (
                      <img src={m.profile_picture} alt="" />
                    ) : (
                      m.username.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span className="discord-mention-name">{m.username}</span>
                </button>
              ))}
            </div>
          )}
          <div className="discord-composer">
            {canPost ? (
              <>
                <textarea
                  ref={inputRef}
                  className="discord-input"
                  placeholder={`Envoyer un message dans #${current?.label || activeChannel}`}
                  value={draft}
                  rows={1}
                  maxLength={2000}
                  onChange={onDraftChange}
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

      {showAccess && (
        <div className="discord-modal-overlay" onClick={() => setShowAccess(false)}>
          <div className="discord-modal" onClick={(e) => e.stopPropagation()}>
            <div className="discord-modal-head">
              <div className="discord-modal-title">
                <Users size={18} />
                <span>Qui a accès à {access ? `#${access.label}` : 'ce salon'}</span>
              </div>
              <button
                type="button"
                className="discord-modal-close"
                onClick={() => setShowAccess(false)}
              >
                <X size={18} />
              </button>
            </div>

            {accessError && <div className="discord-error">{accessError}</div>}

            {access && (
              <div className="discord-access-scopes">
                <div className="discord-access-scope">
                  <Eye size={14} />
                  <span>
                    <strong>Peuvent voir :</strong> {access.readScope}
                  </span>
                </div>
                <div className="discord-access-scope">
                  <PencilLine size={14} />
                  <span>
                    <strong>Peuvent écrire :</strong> {access.writeScope}
                  </span>
                </div>
              </div>
            )}

            <div className="discord-members">
              {accessLoading && <div className="discord-state">Chargement…</div>}
              {!accessLoading && access && access.members.length === 0 && (
                <div className="discord-state">Aucun membre pour le moment.</div>
              )}
              {!accessLoading &&
                access?.members.map((m) => (
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
                        {m.isChef && <span className="discord-chef-tag">Chef</span>}
                        {m.adminOversight && <span className="discord-oversight-tag">admin</span>}
                      </span>
                      <RoleBadge role={m.role} />
                    </div>
                    <span
                      className={`discord-access-pill ${m.canPost ? 'write' : 'read'}`}
                      title={m.canPost ? 'Peut écrire' : 'Lecture seule'}
                    >
                      {m.canPost ? <PencilLine size={12} /> : <Eye size={12} />}
                      {m.canPost ? 'Écrit' : 'Lecture'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {showThread && (
        <div className="discord-modal-overlay" onClick={() => setShowThread(false)}>
          <div className="discord-modal" onClick={(e) => e.stopPropagation()}>
            <div className="discord-modal-head">
              <div className="discord-modal-title">
                <MessagesSquare size={18} />
                <span>Conversation</span>
              </div>
              <button
                type="button"
                className="discord-modal-close"
                onClick={() => setShowThread(false)}
              >
                <X size={18} />
              </button>
            </div>

            {threadError && <div className="discord-error">{threadError}</div>}

            <div className="discord-thread">
              {threadLoading && <div className="discord-state">Chargement…</div>}
              {!threadLoading && threadMessages.length === 0 && !threadError && (
                <div className="discord-state">Conversation introuvable.</div>
              )}
              {!threadLoading &&
                threadMessages.map((m, i) => (
                  <div key={m.id} className={`discord-thread-msg ${i === 0 ? 'root' : ''}`}>
                    <span className="discord-avatar">
                      {m.profile_picture ? (
                        <img src={m.profile_picture} alt="" />
                      ) : (
                        m.username.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <div className="discord-msg-body">
                      <div className="discord-msg-head">
                        <span className={`discord-msg-author role-${m.role || 'member'}`}>
                          {m.username}
                        </span>
                        <span className="discord-msg-time">{formatTime(m.created_at)}</span>
                        {i === 0 && <span className="discord-thread-tag">message d'origine</span>}
                      </div>
                      <div className="discord-msg-content">
                    {renderMessageContent(m.content, session.user.username)}
                  </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
