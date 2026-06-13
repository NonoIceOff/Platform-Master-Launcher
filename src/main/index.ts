import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import fs from 'node:fs'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { ReadableStream } from 'node:stream/web'
import { exec } from 'node:child_process'
import 'dotenv/config'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

/* ────────────────────────────────
   🧠 GLOBAL WINDOW (FIX IMPORTANT)
──────────────────────────────── */
let mainWindow: BrowserWindow | null = null

/* ────────────────────────────────
   📦 AUTO UPDATER CONFIG
──────────────────────────────── */
log.transports.file.level = 'info'
autoUpdater.logger = log
autoUpdater.autoDownload = true

/* ────────────────────────────────
   📁 PATHS
──────────────────────────────── */
const INSTALL_DIR = join(app.getPath('userData'), 'versions')
const PLAYTIME_FILE = join(app.getPath('userData'), 'playtime.json')

/* ────────────────────────────────
   ⏱ PLAYTIME
──────────────────────────────── */
function getPlaytime(): number {
  try {
    if (!fs.existsSync(PLAYTIME_FILE)) return 0
    const data = JSON.parse(fs.readFileSync(PLAYTIME_FILE, 'utf8'))
    return data.seconds || 0
  } catch {
    return 0
  }
}

/* ────────────────────────────────
   🪟 WINDOW
──────────────────────────────── */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    resizable: false,
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 18 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (app.isPackaged) {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL!)
  }
}

/* ────────────────────────────────
   🚀 APP LIFECYCLE
──────────────────────────────── */
app.whenReady().then(() => {
  createWindow()

  // 🔥 AUTO UPDATE CHECK
  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, 2000)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

/* ────────────────────────────────
   🔄 AUTO UPDATER EVENTS
──────────────────────────────── */
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available')
})

autoUpdater.on('update-not-available', () => {
  mainWindow?.webContents.send('update-not-available')
})

autoUpdater.on('download-progress', (progress) => {
  mainWindow?.webContents.send('update-progress', progress.percent)
})

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-ready')

  setTimeout(() => {
    autoUpdater.quitAndInstall()
  }, 1500)
})

/* ────────────────────────────────
   📡 IPC PLAYTIME
──────────────────────────────── */
ipcMain.handle('get-playtime', () => {
  return getPlaytime()
})

/* ────────────────────────────────
   🌐 API
──────────────────────────────── */
const API_BASE = 'https://pm-api-ten.vercel.app'

ipcMain.handle('fetch-versions', async () => {
  const res = await fetch(`${API_BASE}/api/versions`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Platform-Master-Launcher'
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API Error: ${res.status} - ${text}`)
  }

  return await res.json()
})

/* ────────────────────────────────
   📦 INSTALLED VERSION
──────────────────────────────── */
ipcMain.handle('get-installed-version', () => {
  const metaPath = join(INSTALL_DIR, 'installed.json')

  if (!fs.existsSync(metaPath)) return null

  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
    if (fs.existsSync(meta.exe)) return meta.version
  } catch {
    // Fichier meta corrompu ou illisible
  }

  return null
})

/* ────────────────────────────────
   🗑 DELETE GAME
──────────────────────────────── */
ipcMain.handle('delete-game', () => {
  const metaPath = join(INSTALL_DIR, 'installed.json')

  try {
    if (fs.existsSync(metaPath)) {
      const { version } = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      const safeVersion = String(version).replace(/\./g, '_')
      const versionDir = join(INSTALL_DIR, safeVersion)

      if (fs.existsSync(versionDir)) {
        fs.rmSync(versionDir, { recursive: true, force: true })
      }

      fs.unlinkSync(metaPath)
      return { success: true }
    }
  } catch (e) {
    return { success: false, error: String(e) }
  }

  return { success: false, error: "Le jeu n'est pas installé." }
})

function getFilenameFromUrl(fileUrl: string): string {
  return decodeURIComponent(fileUrl.split('?')[0].split('/').pop() || '')
}

function getApiDownloadUrl(version: string, fileUrl: string): string {
  const filename = getFilenameFromUrl(fileUrl)
  return `${API_BASE}/api/download/${encodeURIComponent(version)}/${encodeURIComponent(filename)}`
}

async function downloadFileToDisk(
  downloadUrl: string,
  dest: string,
  onProgress: (received: number, total: number) => void
): Promise<void> {
  const response = await fetch(downloadUrl, {
    headers: {
      'User-Agent': 'Platform-Master-Launcher',
      Accept: '*/*'
    },
    redirect: 'follow'
  })

  const filename = getFilenameFromUrl(downloadUrl) || dest

  if (!response.ok) {
    let message = `HTTP ${response.status} sur ${filename}`
    try {
      const body = (await response.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      // réponse non-JSON
    }
    throw new Error(message)
  }

  if (!response.body) {
    throw new Error(`Réponse vide pour ${filename}`)
  }

  const total = parseInt(response.headers.get('content-length') || '0', 10)
  let received = 0

  const progress = new Transform({
    transform(chunk, _encoding, callback): void {
      received += chunk.length
      onProgress(received, total)
      callback(null, chunk)
    }
  })

  const body = Readable.fromWeb(response.body as ReadableStream<Uint8Array>)
  const file = fs.createWriteStream(dest)

  try {
    await pipeline(body, progress, file)
  } catch (err) {
    file.close()
    if (fs.existsSync(dest)) fs.unlinkSync(dest)
    throw err
  }
}

/* ────────────────────────────────
   📥 DOWNLOAD VERSION
──────────────────────────────── */
ipcMain.handle(
  'download-version',
  async (event, { version, url }: { version: string; url: string | string[] }) => {
    const safeVersion = String(version).replace(/\./g, '_')
    const versionDir = join(INSTALL_DIR, safeVersion)

    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true })
    }

    const urlList = Array.isArray(url) ? url : [url]
    let exePath = ''

    for (let i = 0; i < urlList.length; i++) {
      const fileUrl = urlList[i]
      const filename = getFilenameFromUrl(fileUrl)
      const dest = join(versionDir, filename)
      const downloadUrl = getApiDownloadUrl(version, fileUrl)

      if (filename.toLowerCase().endsWith('.exe')) {
        exePath = dest
      }

      await downloadFileToDisk(downloadUrl, dest, (received, total) => {
        if (total > 0) {
          const currentFilePct = (received / total) * 100
          const globalPct = Math.round((i * 100 + currentFilePct) / urlList.length)

          event.sender.send('download-progress', {
            version,
            pct: globalPct,
            received,
            total
          })
        }
      })
    }

    if (!exePath && urlList.length > 0) {
      exePath = join(versionDir, getFilenameFromUrl(urlList[0]))
    }

    fs.writeFileSync(
      join(INSTALL_DIR, 'installed.json'),
      JSON.stringify({ version, exe: exePath }, null, 2)
    )

    return { version, exe: exePath }
  }
)

/* ────────────────────────────────
   ▶️ LAUNCH GAME
──────────────────────────────── */
ipcMain.handle('launch-game', async () => {
  const metaPath = join(INSTALL_DIR, 'installed.json')

  if (!fs.existsSync(metaPath)) {
    return { error: 'Aucune version installée' }
  }

  const { exe } = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

  if (!fs.existsSync(exe)) {
    return { error: 'Fichier introuvable : ' + exe }
  }

  const startTime = Date.now()

  const child = exec(`"${exe}"`)

  child.on('exit', () => {
    const sessionSeconds = Math.floor((Date.now() - startTime) / 1000)

    const total = getPlaytime() + sessionSeconds

    fs.writeFileSync(PLAYTIME_FILE, JSON.stringify({ seconds: total }))
  })

  return { ok: true }
})

/* ────────────────────────────────
   🌐 OPEN EXTERNAL
──────────────────────────────── */
ipcMain.handle('open-external', (_e, url: string) => shell.openExternal(url))

/* ────────────────────────────────
   🪟 WINDOW CONTROLS
──────────────────────────────── */
ipcMain.on('window-close', () => {
  BrowserWindow.getFocusedWindow()?.close()
})

ipcMain.on('window-minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize()
})
