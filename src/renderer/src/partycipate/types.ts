export interface User {
  id: number
  username: string
  email: string
  profile_picture?: string | null
  discord_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface Event {
  id: number
  name: string
  description?: string
  long_description?: string
  image_url?: string | null
  is_open: boolean
  user_id: string
  creator_username?: string
  profile_picture?: string | null
  starts_at?: string
  created_date?: string
  max_candidates?: number
  draw_done?: boolean
  votes_count?: number
  participants_count?: number
  selected_count?: number
}

export interface Participation {
  id: number
  user_id: string
  event_id: number
  is_selected?: boolean
  username?: string
  profile_picture?: string | null
}

export interface Message {
  id: number
  conversation_id: number
  user_id: number
  content: string
  created_at?: string
  username?: string
  profile_picture?: string | null
}

export interface Conversation {
  id: number
  event_id?: number
  name?: string
  created_at?: string
}

export type PartycipateView =
  | { type: 'home' }
  | { type: 'event'; id: number }
  | { type: 'create' }
  | { type: 'modify'; id: number }
  | { type: 'dashboard' }
  | { type: 'messages' }
  | { type: 'profile' }
  | { type: 'auth-required' }

export interface PartycipateSession {
  user: { id: string; email: string; username: string }
}
