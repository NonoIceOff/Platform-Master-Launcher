import { app, BrowserWindow, ipcMain, shell, safeStorage, type IpcMainInvokeEvent } from 'electron'
import { join, basename, resolve } from 'path'
import fs from 'node:fs'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { ReadableStream } from 'node:stream/web'
import { spawn } from 'node:child_process'
import 'dotenv/config'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

/* ────────────────────────────────
   🧠 GLOBAL WINDOW (FIX IMPORTANT)
──────────────────────────────── */
let mainWindow: BrowserWindow | null = null

const MAX_OFFLINE_MS = 7 * 24 * 60 * 60 * 1000
const SESSION_REVERIFY_MS = 24 * 60 * 60 * 1000

function getTokenExpiryMs(token: string): number | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const payload = JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as { exp?: number }
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function assertTrustedSender(event: IpcMainInvokeEvent): void {
  if (mainWindow && event.sender !== mainWindow.webContents) {
    throw new Error('Accès IPC refusé')
  }
}

function toPublicSession(session: AuthSession): PublicSession {
  return { user: session.user }
}

function normalizeApiPath(path: string): string {
  if (!path || typeof path !== 'string') {
    throw new Error('Chemin API invalide')
  }
  if (/^https?:\/\//i.test(path)) {
    throw new Error('URL absolue interdite')
  }
  const normalized = path.startsWith('/api/') ? path : `/api/${path.replace(/^\//, '')}`
  if (normalized.includes('..')) {
    throw new Error('Chemin API invalide')
  }
  return normalized
}

function sanitizeFilename(filename: string): string {
  const safe = basename(decodeURIComponent(filename || ''))
  if (!safe || safe === '.' || safe === '..' || /[\\/]/.test(safe)) {
    throw new Error('Nom de fichier invalide')
  }
  return safe
}

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
const AUTH_FILE = join(app.getPath('userData'), 'auth.json')
const GODOT_USERDATA = join(app.getPath('appData'), 'Godot', 'app_userdata', 'Platform Master')

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
   🪟 WINDOW — HD minimum 1080×720, redimensionnable
──────────────────────────────── */
const WINDOW_MIN_WIDTH = 1080
const WINDOW_MIN_HEIGHT = 720
const WINDOW_DEFAULT_WIDTH = 1280
const WINDOW_DEFAULT_HEIGHT = 800

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: WINDOW_DEFAULT_WIDTH,
    height: WINDOW_DEFAULT_HEIGHT,
    minWidth: WINDOW_MIN_WIDTH,
    minHeight: WINDOW_MIN_HEIGHT,
    resizable: true,
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

  const rendererUrl = process.env.ELECTRON_RENDERER_URL
  if (!app.isPackaged && rendererUrl) {
    mainWindow.loadURL(rendererUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      void shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed =
      !app.isPackaged && rendererUrl
        ? url.startsWith(rendererUrl)
        : url.startsWith('file://')
    if (!allowed) {
      event.preventDefault()
    }
  })
}

/* ────────────────────────────────
   🚀 APP LIFECYCLE
──────────────────────────────── */
app.whenReady().then(async () => {
  createWindow()

  const { expired } = await validateAuthSession()
  syncAuthToGame(expired ? null : readAuthSession())

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
const API_BASE =
  process.env.PM_API_BASE ||
  (app.isPackaged ? 'https://api.montdescartes.fr' : 'http://localhost:3000')

ipcMain.handle('get-api-base', () => API_BASE)

ipcMain.handle('get-app-version', () => app.getVersion())

interface AuthUser {
  id: string
  email: string
  username: string
  createdAt?: string
  profilePicture?: string | null
}

interface ApiUser {
  id?: string | number
  email?: string
  username?: string
  createdAt?: string
  profile_picture?: string | null
}

function mapApiUser(apiUser: ApiUser | undefined, fallback?: AuthUser): AuthUser | null {
  if (!apiUser && !fallback) return null
  return {
    id: String(apiUser?.id ?? fallback?.id ?? ''),
    email: apiUser?.email ?? fallback?.email ?? '',
    username: apiUser?.username ?? fallback?.username ?? '',
    createdAt: apiUser?.createdAt ?? fallback?.createdAt,
    profilePicture: apiUser?.profile_picture ?? fallback?.profilePicture ?? null
  }
}

interface AuthSession {
  token: string
  user: AuthUser
}

interface PublicSession {
  user: AuthUser
}

interface StoredAuth {
  user: AuthUser
  token?: string
  tokenEnc?: string
  lastVerifiedAt?: string
}

function readAuthSession(): AuthSession | null {
  try {
    if (!fs.existsSync(AUTH_FILE)) return null
    const stored = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8')) as StoredAuth
    if (!stored.user?.username) return null

    let token = stored.token || ''
    if (stored.tokenEnc && safeStorage.isEncryptionAvailable()) {
      token = safeStorage.decryptString(Buffer.from(stored.tokenEnc, 'base64'))
    }

    if (!token) return null
    return { token, user: stored.user }
  } catch {
    return null
  }
}

function writeAuthSession(session: AuthSession | null): void {
  if (!session) {
    if (fs.existsSync(AUTH_FILE)) fs.unlinkSync(AUTH_FILE)
    return
  }

  const stored: StoredAuth = {
    user: session.user,
    lastVerifiedAt: new Date().toISOString()
  }

  if (safeStorage.isEncryptionAvailable()) {
    stored.tokenEnc = safeStorage.encryptString(session.token).toString('base64')
  } else if (!app.isPackaged) {
    stored.token = session.token
  } else {
    throw new Error('Chiffrement OS indisponible — session non enregistrée')
  }

  fs.writeFileSync(AUTH_FILE, JSON.stringify(stored, null, 2))
}

async function validateAuthSession(): Promise<{
  session: PublicSession | null
  expired: boolean
}> {
  const session = readAuthSession()
  if (!session) return { session: null, expired: false }

  const tokenExp = getTokenExpiryMs(session.token)
  if (tokenExp && Date.now() >= tokenExp) {
    writeAuthSession(null)
    return { session: null, expired: true }
  }

  const lastVerifiedAt = readAuthSessionLastVerified()
  if (lastVerifiedAt && Date.now() - lastVerifiedAt < SESSION_REVERIFY_MS) {
    return { session: toPublicSession(session), expired: false }
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.token}`,
        Accept: 'application/json',
        'User-Agent': 'Platform-Master-Launcher'
      }
    })

    if (res.status === 401) {
      writeAuthSession(null)
      return { session: null, expired: true }
    }

    if (!res.ok) {
      // Rate limit / erreur serveur : garder la session si le JWT est encore valide
      if (!tokenExp || Date.now() < tokenExp) {
        return { session: toPublicSession(session), expired: false }
      }
      writeAuthSession(null)
      return { session: null, expired: true }
    }

    const data = await parseApiResponse(res)
    const user = data.user as ApiUser | undefined
    const refreshed: AuthSession = user
      ? {
          token: session.token,
          user: mapApiUser(user, session.user) as AuthUser
        }
      : session

    writeAuthSession(refreshed)
    return { session: toPublicSession(refreshed), expired: false }
  } catch {
    if (tokenExp && Date.now() < tokenExp) {
      return { session: toPublicSession(session), expired: false }
    }
    if (lastVerifiedAt && Date.now() - lastVerifiedAt < MAX_OFFLINE_MS) {
      return { session: toPublicSession(session), expired: false }
    }
    writeAuthSession(null)
    return { session: null, expired: true }
  }
}

function readAuthSessionLastVerified(): number | null {
  try {
    if (!fs.existsSync(AUTH_FILE)) return null
    const stored = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8')) as StoredAuth
    if (!stored.lastVerifiedAt) return null
    const ts = Date.parse(stored.lastVerifiedAt)
    return Number.isNaN(ts) ? null : ts
  } catch {
    return null
  }
}

async function parseApiResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text()
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      throw new Error(
        `Service de comptes indisponible sur ${API_BASE} — lancez pm-api (npm start) ou définissez PM_API_BASE dans .env`
      )
    }
    throw new Error('Réponse serveur invalide')
  }
}

async function authRequest(path: string, body?: Record<string, string>): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'Platform-Master-Launcher'
    },
    body: body ? JSON.stringify(body) : undefined
  })

  const data = await parseApiResponse(res)
  if (!res.ok) {
    throw new Error(String(data.error || `Erreur ${res.status}`))
  }

  const token = data.token as string | undefined
  const user = mapApiUser(data.user as ApiUser | undefined)
  if (!token || !user?.username) {
    throw new Error('Réponse serveur invalide')
  }

  return { token, user }
}

function syncAuthToGame(session: AuthSession | null): void {
  if (!fs.existsSync(GODOT_USERDATA)) {
    fs.mkdirSync(GODOT_USERDATA, { recursive: true })
  }

  const authPath = join(GODOT_USERDATA, 'launcher_auth.json')
  const namePath = join(GODOT_USERDATA, 'player_name.txt')

  if (session) {
    fs.writeFileSync(authPath, JSON.stringify({ user: session.user }, null, 2))
    fs.writeFileSync(namePath, session.user.username)
  } else {
    if (fs.existsSync(authPath)) fs.unlinkSync(authPath)
  }
}

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

ipcMain.handle('auth-get-session', (event) => {
  assertTrustedSender(event)
  const session = readAuthSession()
  return session ? toPublicSession(session) : null
})

ipcMain.handle('auth-validate-session', (event) => {
  assertTrustedSender(event)
  return validateAuthSession()
})

ipcMain.handle('auth-login', async (event, { email, password }: { email: string; password: string }) => {
  assertTrustedSender(event)
  const session = await authRequest('/api/auth/login', { email, password })
  writeAuthSession(session)
  syncAuthToGame(session)
  return toPublicSession(session)
})

ipcMain.handle(
  'auth-register',
  async (
    event,
    { email, username, password }: { email: string; username: string; password: string }
  ) => {
    assertTrustedSender(event)
    const session = await authRequest('/api/auth/register', { email, username, password })
    writeAuthSession(session)
    syncAuthToGame(session)
    return toPublicSession(session)
  }
)

ipcMain.handle('auth-logout', (event) => {
  assertTrustedSender(event)
  writeAuthSession(null)
  syncAuthToGame(null)
  return { ok: true }
})

ipcMain.handle(
  'auth-update-profile',
  async (
    event,
    { profilePicture, username }: { profilePicture?: string | null; username?: string }
  ) => {
    assertTrustedSender(event)

    const session = readAuthSession()
    if (!session) {
      throw new Error('Vous devez être connecté')
    }

    const body: Record<string, unknown> = {}
    if (profilePicture !== undefined) body.profilePicture = profilePicture
    if (username !== undefined) body.username = username

    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${session.token}`,
        'User-Agent': 'Platform-Master-Launcher'
      },
      body: JSON.stringify(body)
    })

    const data = await parseApiResponse(res)
    if (!res.ok) {
      if (res.status === 401) {
        writeAuthSession(null)
        syncAuthToGame(null)
      }
      throw new Error(String(data.error || `Erreur ${res.status}`))
    }

    const updated: AuthSession = {
      token: session.token,
      user: mapApiUser(data.user as ApiUser | undefined, session.user) as AuthUser
    }
    writeAuthSession(updated)
    syncAuthToGame(updated)
    return toPublicSession(updated)
  }
)

ipcMain.handle(
  'api-request',
  async (
    event,
    {
      method = 'GET',
      path,
      body,
      auth = true
    }: { method?: string; path: string; body?: unknown; auth?: boolean }
  ) => {
    assertTrustedSender(event)

    const apiPath = normalizeApiPath(path)
    const allowedMethods = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
    const verb = String(method || 'GET').toUpperCase()
    if (!allowedMethods.includes(verb)) {
      throw new Error('Méthode HTTP non autorisée')
    }

    const session = auth ? readAuthSession() : null
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'Platform-Master-Launcher'
    }

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }
    if (auth && session?.token) {
      headers.Authorization = `Bearer ${session.token}`
    }

    const res = await fetch(`${API_BASE}${apiPath}`, {
      method: verb,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })

    const text = await res.text()
    let data: unknown = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }

    if (res.status === 401 && auth) {
      writeAuthSession(null)
      syncAuthToGame(null)
    }

    return { ok: res.ok, status: res.status, data }
  }
)

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
  return sanitizeFilename(decodeURIComponent(fileUrl.split('?')[0].split('/').pop() || ''))
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
      const dest = resolve(versionDir, filename)
      if (!dest.startsWith(resolve(versionDir))) {
        throw new Error('Chemin de destination invalide')
      }
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

  const session = readAuthSession()
  syncAuthToGame(session)

  const env = { ...process.env }
  if (session) {
    env.PM_TOKEN = session.token
    env.PM_USERNAME = session.user.username
  }

  const child = spawn(exe, [], {
    env,
    detached: true,
    stdio: 'ignore'
  })

  child.unref()

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
