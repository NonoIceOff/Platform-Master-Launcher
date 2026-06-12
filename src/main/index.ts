import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import fs from 'node:fs'
import https from 'node:https'
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
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
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
  const isDev = !app.isPackaged

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    resizable: false,
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    visuallyOpaque: false,
    backgroundMaterial: 'acrylic',
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 18 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/* ────────────────────────────────
   🚀 APP LIFECYCLE
──────────────────────────────── */
app.whenReady().then(() => {
  createWindow()

  // 🔥 AUTO UPDATE CHECK
  autoUpdater.checkForUpdates()

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
   🌐 FETCH VERSIONS
──────────────────────────────── */
ipcMain.handle('fetch-versions', async () => {
  const API_URL = 'http://localhost:3000/api/versions'

  const res = await fetch(API_URL)
  if (!res.ok) throw new Error(`API Error: ${res.status}`)

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
  } catch {}

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

/* ────────────────────────────────
   📥 DOWNLOAD VERSION
──────────────────────────────── */
ipcMain.handle(
  'download-version',
  async (event, { version, url }: { version: string; url: string | string[] }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const safeVersion = String(version).replace(/\./g, '_')
        const versionDir = join(INSTALL_DIR, safeVersion)

        if (!fs.existsSync(versionDir)) {
          fs.mkdirSync(versionDir, { recursive: true })
        }

        const urlList = Array.isArray(url) ? url : [url]
        let exePath = ''

        for (let i = 0; i < urlList.length; i++) {
          const downloadUrl = urlList[i]

          const urlWithoutParams = downloadUrl.split('?')[0]
          const filename = decodeURIComponent(urlWithoutParams.split('/').pop() || `file_${i}`)
          const dest = join(versionDir, filename)

          if (filename.toLowerCase().endsWith('.exe')) {
            exePath = dest
          }

          await new Promise<void>((fileResolve, fileReject) => {
            const file = fs.createWriteStream(dest)

            const startDownload = (currentUrl: string): void => {
              const options: https.RequestOptions = {
                headers: { 'User-Agent': 'Platform-Master-Launcher' }
              }

              https.get(currentUrl, options, (res) => {
                if (res.statusCode === 302 || res.statusCode === 301) {
                  if (res.headers.location) return startDownload(res.headers.location)
                }

                if (res.statusCode !== 200) {
                  file.close()
                  if (fs.existsSync(dest)) fs.unlinkSync(dest)
                  return fileReject(new Error(`HTTP ${res.statusCode} sur ${filename}`))
                }

                const total = parseInt(res.headers['content-length'] || '0', 10)
                let received = 0

                res.on('data', (chunk) => {
                  received += chunk.length
                  file.write(chunk)

                  if (total > 0) {
                    const currentFilePct = (received / total) * 100
                    const globalPct = Math.round(((i * 100) + currentFilePct) / urlList.length)

                    event.sender.send('download-progress', {
                      version,
                      pct: globalPct,
                      received,
                      total,
                    })
                  }
                })

                res.on('end', () => {
                  file.end()
                  fileResolve()
                })

                res.on('error', (err) => {
                  file.close()
                  if (fs.existsSync(dest)) fs.unlinkSync(dest)
                  fileReject(err)
                })
              }).on('error', (err) => {
                file.close()
                if (fs.existsSync(dest)) fs.unlinkSync(dest)
                fileReject(err)
              })
            }

            startDownload(downloadUrl)
          })
        }

        if (!exePath && urlList.length > 0) {
          const firstUrl = urlList[0].split('?')[0]
          exePath = join(versionDir, decodeURIComponent(firstUrl.split('/').pop() || ''))
        }

        fs.writeFileSync(
          join(INSTALL_DIR, 'installed.json'),
          JSON.stringify({ version, exe: exePath }, null, 2)
        )

        resolve({ version, exe: exePath })
      } catch (err) {
        reject(err)
      }
    })
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

    fs.writeFileSync(
      PLAYTIME_FILE,
      JSON.stringify({ seconds: total })
    )
  })

  return { ok: true }
})

/* ────────────────────────────────
   🌐 OPEN EXTERNAL
──────────────────────────────── */
ipcMain.handle('open-external', (_e, url: string) =>
  shell.openExternal(url)
)

/* ────────────────────────────────
   🪟 WINDOW CONTROLS
──────────────────────────────── */
ipcMain.on('window-close', () => {
  BrowserWindow.getFocusedWindow()?.close()
})

ipcMain.on('window-minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize()
})
