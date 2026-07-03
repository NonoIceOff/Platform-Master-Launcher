import { apiGet, apiPost, apiDelete } from '../api'
import type { Poll } from '../types'

export type PollSort = 'recent' | 'popular' | 'ending_soon'

export interface FetchPollsParams {
  sort?: PollSort
  search?: string
}

export async function fetchPolls({ sort = 'recent', search = '' }: FetchPollsParams = {}): Promise<Poll[]> {
  const params = new URLSearchParams()
  params.set('sort', sort)
  if (search) params.set('search', search)
  try {
    const data = await apiGet<Poll[] | { data: Poll[] }>(`/polls?${params.toString()}`)
    return Array.isArray(data) ? data : (data.data ?? [])
  } catch {
    return []
  }
}

export async function fetchPoll(id: number): Promise<Poll> {
  return apiGet<Poll>(`/polls/${id}`)
}

export interface CreatePollInput {
  question: string
  options: string[]
  category?: string
  ends_at?: string
}

export async function createPoll(input: CreatePollInput): Promise<Poll> {
  return apiPost<Poll>('/polls', input)
}

export async function votePoll(pollId: number, optionId: number): Promise<Poll> {
  return apiPost<Poll>(`/polls/${pollId}/vote`, { option_id: optionId })
}

export async function deletePoll(pollId: number): Promise<void> {
  await apiDelete(`/polls/${pollId}`)
}
