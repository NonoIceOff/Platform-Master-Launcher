export {}

interface AuthUser {
  id: string
  email: string
  username: string
  createdAt?: string
}

interface PublicSession {
  user: AuthUser
}

interface ApiRequestResult {
  ok: boolean
  status: number
  data: unknown
}

declare global {
  interface Window {
    launcher: {
      getInstalledVersion: () => Promise<string | null>
      fetchVersions: (url: string) => Promise<unknown>
      downloadVersion: (
        version: string,
        url: string | string[]
      ) => Promise<{ version: string; exe: string }>
      launchGame: () => Promise<{ ok?: boolean; error?: string }>
      getPlaytime: () => Promise<number>

      getApiBase: () => Promise<string>

      getSession: () => Promise<PublicSession | null>
      validateSession: () => Promise<{ session: PublicSession | null; expired: boolean }>
      login: (email: string, password: string) => Promise<PublicSession>
      register: (email: string, username: string, password: string) => Promise<PublicSession>
      logout: () => Promise<{ ok: boolean }>

      apiRequest: (options: {
        method?: string
        path: string
        body?: unknown
        auth?: boolean
      }) => Promise<ApiRequestResult>

      close: () => void
      minimize: () => void

      onDownloadProgress: (cb: (data: { pct: number }) => void) => () => void
    }

    electron: {
      process: {
        versions: NodeJS.ProcessVersions
      }
    }
  }
}
