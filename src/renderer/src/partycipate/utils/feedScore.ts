import type { Event } from '../types'

// Contexte de personnalisation du feed (dépend de l'utilisateur connecté).
export interface FeedContext {
  followedProductionIds: Set<string>
  memberProductionIds: Set<string>
  now?: number
}

// Pondérations du score de pertinence. Ajustables au besoin.
const WEIGHTS = {
  followed: 60, // abonné à la production de l'événement
  member: 35, // membre de la production
  recency: 28, // fraîcheur (décroissance exponentielle)
  likes: 12, // log2(1 + likes)
  participants: 6, // log2(1 + participants)
  open: 15 // inscriptions ouvertes et tirage non effectué
}

// Demi-vie de la récence ~72h => constante de décroissance (en heures).
const RECENCY_TAU_HOURS = 104 // exp(-72/104) ≈ 0.5

function recencyScore(event: Event, now: number): number {
  // On se base sur created_date (starts_at peut être une date aberrante).
  const created = event.created_date ?? event.starts_at
  if (!created) return 0
  const t = new Date(created).getTime()
  if (Number.isNaN(t)) return 0
  const ageHours = Math.max(0, (now - t) / 3_600_000)
  return Math.exp(-ageHours / RECENCY_TAU_HOURS)
}

// Score de pertinence d'un événement pour un utilisateur donné.
export function scoreEvent(event: Event, ctx: FeedContext): number {
  const now = ctx.now ?? Date.now()
  const pid = event.production_id ?? null

  let score = 0
  if (pid && ctx.followedProductionIds.has(pid)) score += WEIGHTS.followed
  if (pid && ctx.memberProductionIds.has(pid)) score += WEIGHTS.member
  score += WEIGHTS.recency * recencyScore(event, now)
  score += WEIGHTS.likes * Math.log2(1 + (event.votes_count ?? 0))
  score += WEIGHTS.participants * Math.log2(1 + (event.participants_count ?? 0))
  if (event.is_open && !event.draw_done) score += WEIGHTS.open

  return score
}

// Trie une copie de la liste par score décroissant (départage par récence).
export function sortByScore(events: Event[], ctx: FeedContext): Event[] {
  const now = ctx.now ?? Date.now()
  return [...events]
    .map((e) => ({ e, s: scoreEvent(e, { ...ctx, now }) }))
    .sort((a, b) => {
      if (b.s !== a.s) return b.s - a.s
      const ta = new Date(a.e.created_date ?? a.e.starts_at ?? 0).getTime()
      const tb = new Date(b.e.created_date ?? b.e.starts_at ?? 0).getTime()
      return tb - ta
    })
    .map((x) => x.e)
}
