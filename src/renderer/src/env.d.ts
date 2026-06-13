export {}

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
