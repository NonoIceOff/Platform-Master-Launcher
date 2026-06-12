import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('launcher', {
  getInstalledVersion: () => ipcRenderer.invoke('get-installed-version'),

  fetchVersions: (url: string) => ipcRenderer.invoke('fetch-versions', url),

  downloadVersion: (version: string, url: string | string[]) =>
    ipcRenderer.invoke('download-version', { version, url }),

  launchGame: () => ipcRenderer.invoke('launch-game'),

  getPlaytime: () => ipcRenderer.invoke('get-playtime'),

  close: () => ipcRenderer.send('window-close'),

  minimize: () => ipcRenderer.send('window-minimize'),

  onDownloadProgress: (cb: (data: { pct: number }) => void) => {
    const handler = (_: any, data: any) => cb(data)
    ipcRenderer.on('download-progress', handler)

    return () => ipcRenderer.removeListener('download-progress', handler)
  }
})
