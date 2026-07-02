import { createApiClient } from '@nonoiceoff/party-cipate-core'

const client = createApiClient(
  {
    async request(path, { method, body, auth }) {
      const result = await window.launcher.apiRequest({ method, path, body, auth })
      return result
    }
  },
  {
    onBanned: () => window.dispatchEvent(new CustomEvent('mnet-account-banned')),
    onSessionExpired: () => window.dispatchEvent(new CustomEvent('mnet-session-expired')),
    sessionExpiredMessage: 'Session expirée — reconnectez-vous dans Configuration'
  }
)

export async function getApiBase(): Promise<string> {
  const base = await window.launcher.getApiBase()
  return `${base.replace(/\/$/, '')}/api`
}

export const apiGet = client.apiGet
export const apiPost = client.apiPost
export const apiPatch = client.apiPatch
export const apiDelete = client.apiDelete

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
