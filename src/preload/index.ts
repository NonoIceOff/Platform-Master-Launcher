import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('launcher', {
  // 🔥 GitHub / API versions (remplace Pastebin côté main process)
  fetchVersions: (url: string) =>
    ipcRenderer.invoke('fetch-versions', url),

  deleteGame: () => ipcRenderer.invoke('delete-game'),

  getInstalledVersion: () =>
    ipcRenderer.invoke('get-installed-version'),

  getPlaytime: () => ipcRenderer.invoke('get-playtime'),

  downloadVersion: (version: string, url: string) =>
    ipcRenderer.invoke('download-version', { version, url }),

  onDownloadProgress: (cb: (data: { pct: number }) => void) => {
    const handler = (_e: any, data: { pct: number }) => cb(data)
    ipcRenderer.on('download-progress', handler)

    return () => {
      ipcRenderer.removeListener('download-progress', handler)
    }
  },

  launchGame: () => ipcRenderer.invoke('launch-game'),

  openExternal: (url: string) =>
    ipcRenderer.invoke('open-external', url),

  close: () =>
    ipcRenderer.send('window-close'),

  minimize: () =>
    ipcRenderer.send('window-minimize'),
})
