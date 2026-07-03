// NOTE: le client HTTP ci-dessous est vendorisé depuis party-cipate-core
// (temporaire — le CI de release ne peut pas résoudre la dépendance
// file:../party-cipate-core, qui pointe hors du repo checkouté). À terme,
// remplacer par la dépendance publiée sur un registry une fois
// party-cipate-core packagé/publié.

interface ApiTransportResult {
  status: number
  ok: boolean
  data: unknown
}

type ApiErr = { message?: string; error?: string; banned?: boolean }

const BAN_MESSAGE = 'Votre compte a été banni de Party-cipate.'
const SESSION_EXPIRED_MESSAGE = 'Session expirée — reconnectez-vous dans Configuration'

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const result: ApiTransportResult = await window.launcher.apiRequest({ method, path, body, auth })
  const data = result.data as ApiErr

  if (result.status === 403 && auth && data?.banned) {
    window.dispatchEvent(new CustomEvent('mnet-account-banned'))
    throw new Error(data.error || BAN_MESSAGE)
  }

  if (result.status === 401 && auth) {
    window.dispatchEvent(new CustomEvent('mnet-session-expired'))
    throw new Error(data?.error || SESSION_EXPIRED_MESSAGE)
  }

  if (!result.ok) {
    throw new Error(data?.message || data?.error || `Erreur ${result.status}`)
  }

  return result.data as T
}

export async function getApiBase(): Promise<string> {
  const base = await window.launcher.getApiBase()
  return `${base.replace(/\/$/, '')}/api`
}

export async function apiGet<T>(path: string, auth = true): Promise<T> {
  return request<T>(path, { method: 'GET', auth })
}

export async function apiPost<T>(path: string, body: unknown, auth = true): Promise<T> {
  return request<T>(path, { method: 'POST', body, auth })
}

export async function apiPatch<T>(path: string, body: unknown, auth = true): Promise<T> {
  return request<T>(path, { method: 'PATCH', body, auth })
}

export async function apiDelete(path: string, auth = true): Promise<void> {
  await request<unknown>(path, { method: 'DELETE', auth })
}

/** @deprecated Utiliser apiGet — conservé pour compatibilité interne */
export async function apiFetch(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<Response> {
  const method = options.method || 'GET'
  const auth = options.auth !== false
  let body: unknown
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body)
    } catch {
      body = options.body
    }
  }

  const result = await window.launcher.apiRequest({ method, path, body, auth })
  return new Response(JSON.stringify(result.data), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' }
  })
}
