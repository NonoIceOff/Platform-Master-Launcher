export interface User {
  id: number
  username: string
  email: string
  profile_picture?: string | null
  discord_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface Production {
  id: string
  name: string
  created_at?: string
  is_chef?: boolean
  can_create_events?: boolean
  can_edit_events?: boolean
  can_draw?: boolean
  can_invite?: boolean
  followers_count?: number
  is_following?: boolean
}

export interface ProductionMember {
  id: string
  username: string | null
  profile_picture: string | null
  is_chef: boolean
  can_create_events: boolean
  can_edit_events: boolean
  can_draw: boolean
  can_invite: boolean
}

export interface ProductionInvite {
  token: string
  production_id: string
  created_by?: string | null
  uses: number
  revoked?: boolean
  created_at?: string
}

export interface Event {
  id: number
  name: string
  description?: string
  long_description?: string
  image_url?: string | null
  is_open: boolean
  user_id: string
  production_id?: string | null
  production_name?: string | null
  creator_username?: string
  profile_picture?: string | null
  starts_at?: string
  created_date?: string
  max_candidates?: number
  draw_done?: boolean
  votes_count?: number
  participants_count?: number
  selected_count?: number
  participants?: ParticipantPreview[]
}

export interface ParticipantPreview {
  user_id: string
  username?: string | null
  profile_picture?: string | null
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
  | { type: 'candidates'; id: number }
  | { type: 'create' }
  | { type: 'modify'; id: number }
  | { type: 'dashboard' }
  | { type: 'productions' }
  | { type: 'production'; id: string }
  | { type: 'messages' }
  | { type: 'profile' }
  | { type: 'auth-required' }

export interface PartycipateSession {
  user: { id: string; email: string; username: string }
}
