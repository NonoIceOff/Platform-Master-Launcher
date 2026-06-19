async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const result = await window.launcher.apiRequest({ method, path, body, auth })

  if (result.status === 401 && auth) {
    window.dispatchEvent(new CustomEvent('mnet-session-expired'))
    const err = (result.data as { error?: string }) || {}
    throw new Error(err.error || 'Session expirée — reconnectez-vous dans Configuration')
  }

  if (!result.ok) {
    const err = (result.data as { message?: string; error?: string }) || {}
    throw new Error(err.message || err.error || `Erreur ${result.status}`)
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
