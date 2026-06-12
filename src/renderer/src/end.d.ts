/// <reference types="vite/client" />

interface DownloadProgress {
  version: string
  pct: number
  received: number
  total: number
}

interface LaunchResult {
  ok?: boolean
  error?: string
}

interface Launcher {
  fetchVersions: (url: string) => Promise<{ versions: Version[] }>
  getInstalledVersion: () => Promise<string | null>
  downloadVersion: (version: string, url: string) => Promise<{ version: string; exe: string }>
  onDownloadProgress: (cb: (data: DownloadProgress) => void) => () => void
  launchGame: () => Promise<LaunchResult>
  openExternal: (url: string) => Promise<void>
  close: () => void
  minimize: () => void
}

interface Version {
  version: string
  label?: string
  url: string
  changelog: string[]
}

declare global {
  interface Window {
    launcher: Launcher
  }
}
