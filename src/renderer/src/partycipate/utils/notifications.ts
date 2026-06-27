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
