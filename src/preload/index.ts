import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('launcher', {
  getInstalledVersion: () => ipcRenderer.invoke('get-installed-version'),

  fetchVersions: (url: string) => ipcRenderer.invoke('fetch-versions', url),

  downloadVersion: (version: string, url: string | string[]) =>
    ipcRenderer.invoke('download-version', { version, url }),

  launchGame: () => ipcRenderer.invoke('launch-game'),

  getPlaytime: () => ipcRenderer.invoke('get-playtime'),

  getApiBase: () => ipcRenderer.invoke('get-api-base') as Promise<string>,

  getAppVersion: () => ipcRenderer.invoke('get-app-version') as Promise<string>,

  getSession: () => ipcRenderer.invoke('auth-get-session'),

  validateSession: () =>
    ipcRenderer.invoke('auth-validate-session') as Promise<{
      session: { user: { id: string; email: string; username: string } } | null
      expired: boolean
    }>,

  login: (email: string, password: string) =>
    ipcRenderer.invoke('auth-login', { email, password }),

  register: (email: string, username: string, password: string) =>
    ipcRenderer.invoke('auth-register', { email, username, password }),

  loginWithDiscord: () => ipcRenderer.invoke('auth-login-discord'),

  logout: () => ipcRenderer.invoke('auth-logout'),

  updateProfile: (payload: { profilePicture?: string | null; username?: string }) =>
    ipcRenderer.invoke('auth-update-profile', payload),

  apiRequest: (options: {
    method?: string
    path: string
    body?: unknown
    auth?: boolean
  }) => ipcRenderer.invoke('api-request', options),

  close: () => ipcRenderer.send('window-close'),

  minimize: () => ipcRenderer.send('window-minimize'),

  onDownloadProgress: (cb: (data: { pct: number }) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, data: { pct: number }): void => cb(data)
    ipcRenderer.on('download-progress', handler)

    return () => ipcRenderer.removeListener('download-progress', handler)
  }
})
