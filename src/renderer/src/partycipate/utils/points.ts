import { apiGet } from '../api'
import type { LeaderboardEntry } from '../types'

export type LeaderboardWindow = 'week' | 'month' | 'all'

export async function fetchLeaderboard(
  window: LeaderboardWindow = 'all',
  limit = 20
): Promise<LeaderboardEntry[]> {
  try {
    const data = await apiGet<{ leaderboard: LeaderboardEntry[] }>(
      `/points/leaderboard?window=${window}&limit=${limit}`,
      false
    )
    return data.leaderboard ?? []
  } catch {
    return []
  }
}
