import { apiGet, apiPost } from '../api'

export interface AppNotification {
  id: number
  event_id: number
  name: string
  image_url: string | null
  production_id: string
  production_name: string | null
  production_avatar: string | null
  created_at: string | null
  unread: boolean
}

export interface NotificationsResponse {
  notifications: AppNotification[]
  unread_count: number
  last_read_at: string | null
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  try {
    const data = await apiGet<NotificationsResponse>('/notifications')
    return {
      notifications: Array.isArray(data?.notifications) ? data.notifications : [],
      unread_count: Number(data?.unread_count) || 0,
      last_read_at: data?.last_read_at ?? null
    }
  } catch {
    return { notifications: [], unread_count: 0, last_read_at: null }
  }
}

export async function markNotificationsRead(): Promise<void> {
  try {
    await apiPost('/notifications/read', {})
  } catch {
    /* non bloquant */
  }
}

// ── Messages de chat non lus (badges channel + onglet + inbox) ──

export interface ChatUnreadChannel {
  id: string
  label: string
  production: boolean
  count: number
}

export interface ChatUnreadResponse {
  total: number
  channels: ChatUnreadChannel[]
}

export async function fetchChatUnread(): Promise<ChatUnreadResponse> {
  try {
    const data = await apiGet<ChatUnreadResponse>('/channels/unread')
    return {
      total: Number(data?.total) || 0,
      channels: Array.isArray(data?.channels) ? data.channels : []
    }
  } catch {
    return { total: 0, channels: [] }
  }
}

// Marque un channel comme lu (jusqu'au dernier message, ou jusqu'à messageId).
export async function markChannelRead(channel: string, messageId?: number): Promise<void> {
  try {
    await apiPost(`/channels/${encodeURIComponent(channel)}/read`, { messageId: messageId ?? 0 })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('partycipate-chat-read'))
    }
  } catch {
    /* non bloquant */
  }
}

// ── Mentions @username ──

export interface MentionNotification {
  id: number
  message_id: number
  channel: string
  channel_label: string
  production: boolean
  from_user_id: string
  from_username: string
  from_avatar: string | null
  content: string
  created_at: string | null
  unread: boolean
}

export interface MentionsResponse {
  mentions: MentionNotification[]
  unread: number
}

export async function fetchMentions(): Promise<MentionsResponse> {
  try {
    const data = await apiGet<MentionsResponse>('/channels/mentions')
    return {
      mentions: Array.isArray(data?.mentions) ? data.mentions : [],
      unread: Number(data?.unread) || 0
    }
  } catch {
    return { mentions: [], unread: 0 }
  }
}

export async function markMentionsRead(): Promise<void> {
  try {
    await apiPost('/channels/mentions/read', {})
  } catch {
    /* non bloquant */
  }
}

export interface MemberSuggestion {
  id: string
  username: string
  profile_picture: string | null
  role?: string
}

// Recherche de membres d'un channel pour l'autocomplétion des mentions.
export async function searchMembers(channel: string, query: string): Promise<MemberSuggestion[]> {
  try {
    const data = await apiGet<{ members: MemberSuggestion[] }>(
      `/channels/${encodeURIComponent(channel)}/members?q=${encodeURIComponent(query)}`
    )
    return Array.isArray(data?.members) ? data.members : []
  } catch {
    return []
  }
}
