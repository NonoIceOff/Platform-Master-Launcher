import { useState, useEffect, useCallback, type ReactElement } from 'react'
import './App.css'
import Wiki from './components/Wiki'
import Partycipate from './partycipate/Partycipate'

const VERSIONS_URL =
  'https://api.github.com/repos/NonoIceOff/Platform-Master/contents/versions.json?ref=new-master'

interface Version {
  version: string
  label?: string
  url: string | string[] // 🚀 Accepte une chaîne ou une liste de chaînes
  changelog: string[]
}

interface VersionsData {
  versions: Version[]
}

type AppSection = 'pm' | 'pc' | 'configuration'
type PmTab = 'Actualités' | 'Platform Master' | 'Wiki'

const PM_TABS: { id: PmTab; label: string }[] = [
  { id: 'Actualités', label: 'Actualités' },
  { id: 'Platform Master', label: 'Profil jeu' },
  { id: 'Wiki', label: 'Wiki' }
]

function formatLauncherError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  return raw
    .replace(/^Error invoking remote method '[^']+':\s*/, '')
    .replace(/ÔÇö/g, '—')
    .replace(/\u00E2\u0080\u0094/g, '—')
}

export default function App(): ReactElement {
  const [versions, setVersions] = useState<Version[]>([])
  const [selected, setSelected] = useState<Version | null>(null)
  const [installed, setInstalled] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'downloading' | 'launching' | 'error'>('idle')
  const [progress, setProgress] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [activeSection, setActiveSection] = useState<AppSection>('pm')
  const [pmTab, setPmTab] = useState<PmTab>('Actualités')
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)
  const [playtime, setPlaytime] = useState(0)
  const [session, setSession] = useState<{
    user: { id: string; email: string; username: string; profilePicture?: string | null }
  } | null>(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authUsername, setAuthUsername] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [discordLoading, setDiscordLoading] = useState(false)
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false)
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    loadVersions()
    window.launcher.getInstalledVersion().then(setInstalled)
    void window.launcher.validateSession().then(({ session: s, expired }) => {
      if (expired) {
        setSession(null)
        setSessionExpiredNotice(true)
        setActiveSection('configuration')
      } else if (s) {
        setSession({ user: s.user })
      }
      setSessionReady(true)
    })

    const unsub = window.launcher.onDownloadProgress(({ pct }: { pct: number }) => {
      setProgress(pct)
    })
    window.launcher.getPlaytime().then(setPlaytime)
    window.launcher.getAppVersion().then(setAppVersion)

    const onSessionExpired = (): void => {
      setSession(null)
      setSessionExpiredNotice(true)
      setActiveSection('configuration')
    }
    window.addEventListener('mnet-session-expired', onSessionExpired)

    return () => {
      unsub()
      window.removeEventListener('mnet-session-expired', onSessionExpired)
    }
  }, [])

  const formatPlaytime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)

    return `${h}h ${m}m`
  }

  const loadVersions = useCallback(async () => {
    setRefreshing(true)
    setErrorMsg('')

    try {
      const data = (await window.launcher.fetchVersions(VERSIONS_URL)) as VersionsData
      const buildList = data.versions || []
      setVersions(buildList)

      if (buildList.length > 0) {
        setSelected(buildList[0])
        setExpandedVersion(buildList[0].version)
      }
    } catch (e) {
      setErrorMsg('Impossible de récupérer les versions depuis GitHub.')
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Action appelée quand on clique sur une carte d'actualité
  const handleSelectNewsVersion = (v: Version) => {
    if (expandedVersion === v.version) {
      setExpandedVersion(null)
    } else {
      setExpandedVersion(v.version)
      setSelected(v) // 🔥 TRÈS IMPORTANT : On synchronise immédiatement le profil sélectionné global !
    }
  }

  const handleDownload = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault()
    if (!selected) return

    setStatus('downloading')
    setProgress(0)
    setErrorMsg('')

    try {
      // Lance l'événement IPC vers le main process (index.ts)
      await window.launcher.downloadVersion(selected.version, selected.url)
      // Une fois fini, on met à jour la version installée localement
      const currentInstalled = await window.launcher.getInstalledVersion()
      setInstalled(currentInstalled)
      setStatus('idle')
    } catch (e: unknown) {
      setErrorMsg('Téléchargement échoué : ' + (e instanceof Error ? e.message : String(e)))
      setStatus('error')
    }
  }

  const handlePlay = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault()
    if (!selected) return

    setStatus('launching')
    setErrorMsg('')

    const res = await window.launcher.launchGame()

    if (res?.error) {
      setErrorMsg(res.error)
      setStatus('error')
    } else {
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  const handleAuthSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setAuthLoading(true)
    setErrorMsg('')

    try {
      const result =
        authMode === 'login'
          ? await window.launcher.login(authEmail, authPassword)
          : await window.launcher.register(authEmail, authUsername, authPassword)
      setSession(result)
      setAuthPassword('')
      setSessionExpiredNotice(false)
    } catch (err: unknown) {
      setErrorMsg(formatLauncherError(err))
    } finally {
      setAuthLoading(false)
    }
  }

  const handleDiscordLogin = async (): Promise<void> => {
    setDiscordLoading(true)
    setErrorMsg('')
    try {
      const result = await window.launcher.loginWithDiscord()
      setSession(result)
      setAuthPassword('')
      setSessionExpiredNotice(false)
    } catch (err: unknown) {
      const msg = formatLauncherError(err)
      if (!/annul/i.test(msg)) setErrorMsg(msg)
    } finally {
      setDiscordLoading(false)
    }
  }

  const handleReauth = async (): Promise<void> => {
    await window.launcher.logout()
    setSession(null)
    setActiveSection('configuration')
  }

  const handleLogout = async (): Promise<void> => {
    await window.launcher.logout()
    setSession(null)
    setAuthEmail('')
    setAuthUsername('')
    setAuthPassword('')
  }

  const resizeImageToDataUrl = (file: File, max = 256): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Lecture du fichier impossible'))
      reader.onload = () => {
        const img = new Image()
        img.onerror = () => reject(new Error('Image invalide'))
        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.width, img.height))
          const w = Math.max(1, Math.round(img.width * scale))
          const h = Math.max(1, Math.round(img.height * scale))
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Canvas non supporté'))
          ctx.drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/webp', 0.85))
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    })

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setAvatarError('')
    if (!file.type.startsWith('image/')) {
      setAvatarError('Veuillez choisir une image.')
      return
    }

    setAvatarBusy(true)
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      const updated = await window.launcher.updateProfile({ profilePicture: dataUrl })
      setSession(updated)
    } catch (err: unknown) {
      setAvatarError(formatLauncherError(err))
    } finally {
      setAvatarBusy(false)
    }
  }

  const handleAvatarRemove = async (): Promise<void> => {
    setAvatarError('')
    setAvatarBusy(true)
    try {
      const updated = await window.launcher.updateProfile({ profilePicture: null })
      setSession(updated)
    } catch (err: unknown) {
      setAvatarError(formatLauncherError(err))
    } finally {
      setAvatarBusy(false)
    }
  }

  // Correction de la condition : Est-ce que la version sélectionnée AU BAS de l'écran correspond à celle installée ?
  const isInstalled = selected !== null && installed === selected.version
  const isDownloading = status === 'downloading'
  const isLaunching = status === 'launching'
  const showGameBar =
    activeSection === 'pm' && (pmTab === 'Actualités' || pmTab === 'Platform Master')

  return (
    <div className="app dashboard-layout">
      <header className="titlebar">
        <div className="titlebar-controls">
          <button className="titlebar-btn close" onClick={() => window.launcher.close()} />
          <button className="titlebar-btn minimize" onClick={() => window.launcher.minimize()} />
        </div>

        <nav className="app-nav">
          <button
            type="button"
            className={`app-nav-tab app-nav-tab-pm ${activeSection === 'pm' ? 'active' : ''}`}
            onClick={() => setActiveSection('pm')}
          >
            Platform Master
          </button>
          <button
            type="button"
            className={`app-nav-tab app-nav-tab-pc ${activeSection === 'pc' ? 'active' : ''}`}
            onClick={() => setActiveSection('pc')}
          >
            Party-cipate
          </button>
        </nav>

        <div className="titlebar-drag">
          <span className="titlebar-drag-title">LAUNCHER MASTER</span>
          {appVersion && <span className="titlebar-version">v{appVersion}</span>}
        </div>

        <button
          type="button"
          className={`app-account-btn ${activeSection === 'configuration' ? 'active' : ''}`}
          onClick={() => setActiveSection('configuration')}
        >
          <span className="app-account-avatar">
            {session?.user.profilePicture ? (
              <img src={session.user.profilePicture} alt="" className="avatar-img" />
            ) : session ? (
              session.user.username.slice(0, 2).toUpperCase()
            ) : (
              '?'
            )}
          </span>
          <span className="app-account-name">
            {session ? session.user.username : 'Se connecter'}
          </span>
          {session && <span className="app-account-dot" />}
        </button>
      </header>

      {activeSection === 'pm' && (
        <nav className="app-subnav app-subnav--pm">
          {PM_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`app-subnav-tab ${pmTab === tab.id ? 'active' : ''}`}
              onClick={() => setPmTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      <div className="main-container">
        <div className="content-wrapper">
          <main className={`scrollable-content${activeSection === 'pc' ? ' scrollable-content-embedded' : ''}`}>

            {activeSection === 'pm' && pmTab === 'Actualités' && (
              <div className="tab-view animate-fade-in">
                <div className="view-header">
                  <div>
                    <h2 className="view-title">Fil d'actualités</h2>
                    <p className="view-subtitle">Cliquez sur un bloc pour basculer sur cette version et inspecter ses notes.</p>
                  </div>
                  {installed && <div className="global-badge">✓ Version active sur le PC : v{installed}</div>}
                </div>

                <div className="news-feed-premium">
                  {versions.map((v, idx) => {
                    const isExpanded = expandedVersion === v.version
                    const isCardSelected = selected?.version === v.version

                    return (
                      <div
                        key={v.version}
                        className={`news-card-premium ${isExpanded ? 'active' : ''} ${isCardSelected ? 'selected-border' : ''}`}
                        onClick={() => handleSelectNewsVersion(v)}
                      >
                        <div className={`news-card-glow ${idx === 0 ? 'first-glow' : ''}`} />
                        <div className="news-card-main">
                          <div className="news-card-header">
                            <div className="news-card-meta">
                              <span className={`news-badge-type ${idx === 0 ? 'badge-major' : 'badge-patch'}`}>
                                {idx === 0 ? '🔥 DERNIÈRE BUILD' : '📦 PATCH'}
                              </span>
                              <h3 className="news-card-title">Version {v.version}</h3>
                              {v.label && <span className="news-card-label">{v.label}</span>}
                              {installed === v.version && <span className="downloaded-tag">Téléchargé ✓</span>}
                            </div>
                            <div className={`news-arrow ${isExpanded ? 'rotated' : ''}`}>⚡</div>
                          </div>

                          <p className="news-card-summary">
                            Cliquez pour charger ce profil et afficher le rapport de développement complet.
                          </p>

                          <div className={`news-card-expanded-content ${isExpanded ? 'show' : ''}`}>
                            <div className="changelog-box-premium" onClick={(e) => e.stopPropagation()}>
                              <div className="changelog-box-title">Modifications :</div>
                              <ul className="changelog-bullet-list">
                                {v.changelog && v.changelog.length > 0 ? (
                                  v.changelog.map((line, i) => (
                                    <li key={i} className="changelog-bullet-item">
                                      <span className="bullet-decor">▹</span>
                                      <span className="bullet-text">{line}</span>
                                    </li>
                                  ))
                                ) : (
                                  <p className="no-changelog">Aucun détail pour cette version.</p>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {activeSection === 'pm' && pmTab === 'Platform Master' && (
              <div className="tab-view animate-fade-in">
                <div className="view-header">
                  <div>
                    <h2 className="view-title">Configuration du Profil</h2>
                    <p className="view-subtitle">Choisissez la version cible pour le bouton de lancement global.</p>
                  </div>
                </div>

                <p className="playtime">
                  Temps de jeu : {formatPlaytime(playtime)}
                </p>

                <div className="profile-selection-card">
                  <label className="input-group-label">PROFIL ACTIF POUR LE JEU</label>
                  <div className="custom-select-wrapper">
                    <select
                      className="premium-select"
                      value={selected?.version ?? ''}
                      onChange={(e) => {
                        const found = versions.find(v => v.version === e.target.value)
                        if (found) setSelected(found)
                      }}
                      disabled={isDownloading}
                    >
                      {versions.length === 0 && <option>Recherche des versions...</option>}
                      {versions.map(v => (
                        <option key={v.version} value={v.version}>
                          v{v.version} {v.label ? `— ${v.label}` : ''} {installed === v.version ? '(Installé ✓)' : ''}
                        </option>
                      ))}
                    </select>

                    <button
                      className={`premium-refresh-btn ${refreshing ? 'spinning' : ''}`}
                      onClick={loadVersions}
                      disabled={refreshing || isDownloading}
                    >
                      ↻
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'pm' && pmTab === 'Wiki' && <Wiki />}

            {activeSection === 'pc' && (
              <Partycipate
                session={session}
                sessionReady={sessionReady}
                onGoToLogin={() => setActiveSection('configuration')}
                onReauth={handleReauth}
              />
            )}

            {activeSection === 'configuration' && (
              <div className="tab-view animate-fade-in">
                <div className="view-header">
                  <div>
                    <h2 className="view-title">Compte Master</h2>
                    <p className="view-subtitle">
                      Un seul compte pour Platform Master et Party-cipate.
                    </p>
                  </div>
                </div>

                {sessionExpiredNotice && !session && (
                  <div className="auth-expired-banner">
                    Votre session a expiré. Reconnectez-vous pour utiliser Party-cipate et les
                    fonctionnalités en ligne.
                  </div>
                )}

                {session ? (
                  <div className="account-card">
                    <div className="account-avatar-large">
                      {session.user.profilePicture ? (
                        <img src={session.user.profilePicture} alt="" className="avatar-img" />
                      ) : (
                        session.user.username.slice(0, 2).toUpperCase()
                      )}
                      <label
                        className={`avatar-edit-btn ${avatarBusy ? 'busy' : ''}`}
                        title="Changer la photo de profil"
                      >
                        {avatarBusy ? '…' : '✎'}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handleAvatarChange}
                          disabled={avatarBusy}
                          hidden
                        />
                      </label>
                    </div>

                    <div className="account-info">
                      <h3>{session.user.username}</h3>
                      <p className="account-email">{session.user.email}</p>
                      <p className="account-hint">
                        Votre compte sera automatiquement utilisé lors du lancement du jeu.
                      </p>
                      <p className="account-hint account-session-hint">
                        Session active pendant 7 jours (reconnexion automatique).
                      </p>
                    </div>

                    {avatarError && <p className="auth-error">{avatarError}</p>}

                    <div className="account-actions">
                      {session.user.profilePicture && (
                        <button
                          className="action-btn btn-secondary"
                          onClick={handleAvatarRemove}
                          disabled={avatarBusy}
                        >
                          RETIRER LA PHOTO
                        </button>
                      )}
                      <button className="action-btn btn-logout" onClick={handleLogout}>
                        SE DÉCONNECTER
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="auth-card">
                    <div className="auth-tabs">
                      <button
                        className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                        onClick={() => setAuthMode('login')}
                      >
                        Connexion
                      </button>
                      <button
                        className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                        onClick={() => setAuthMode('register')}
                      >
                        Inscription
                      </button>
                    </div>

                    <form className="auth-form" onSubmit={handleAuthSubmit}>
                      {errorMsg && (
                        <div className="auth-error-banner" role="alert">
                          {errorMsg}
                        </div>
                      )}
                      {authMode === 'register' && (
                        <div className="auth-field">
                          <label>Pseudo</label>
                          <input
                            type="text"
                            value={authUsername}
                            onChange={(e) => setAuthUsername(e.target.value)}
                            placeholder="MonPseudo"
                            required
                            minLength={3}
                            maxLength={24}
                            pattern="[a-zA-Z0-9_]+"
                          />
                        </div>
                      )}
                      <div className="auth-field">
                        <label>Email</label>
                        <input
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="email@exemple.com"
                          required
                        />
                      </div>
                      <div className="auth-field">
                        <label>Mot de passe</label>
                        <input
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={8}
                        />
                      </div>
                      <button
                        className="action-btn btn-install auth-submit"
                        disabled={authLoading || discordLoading}
                      >
                        {authLoading
                          ? 'PATIENTEZ...'
                          : authMode === 'login'
                            ? 'SE CONNECTER'
                            : 'CRÉER UN COMPTE'}
                      </button>

                      <div className="auth-divider">
                        <span>ou</span>
                      </div>

                      <button
                        type="button"
                        className="btn-discord"
                        onClick={handleDiscordLogin}
                        disabled={authLoading || discordLoading}
                      >
                        <svg
                          className="btn-discord-icon"
                          viewBox="0 0 24 24"
                          width="20"
                          height="20"
                          aria-hidden="true"
                          fill="currentColor"
                        >
                          <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.18.325-.39.762-.535 1.107a18.27 18.27 0 0 0-5.043 0C10.835 3.762 10.62 3.325 10.44 3a19.74 19.74 0 0 0-3.76 1.369C2.36 9.046 1.5 13.61 1.86 18.116a19.95 19.95 0 0 0 6.073 3.058c.49-.668.927-1.378 1.304-2.124a12.9 12.9 0 0 1-2.052-.978c.172-.127.34-.26.502-.396 3.96 1.83 8.245 1.83 12.158 0 .164.137.332.27.502.396-.654.387-1.343.715-2.053.978.377.746.814 1.456 1.304 2.124a19.88 19.88 0 0 0 6.073-3.058c.42-5.227-.715-9.75-3.625-13.747ZM8.52 15.331c-1.182 0-2.157-1.086-2.157-2.42 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.955 2.42-2.157 2.42Zm6.96 0c-1.182 0-2.157-1.086-2.157-2.42 0-1.333.955-2.42 2.157-2.42 1.21 0 2.176 1.096 2.157 2.42 0 1.334-.946 2.42-2.157 2.42Z" />
                        </svg>
                        <span>
                          {discordLoading ? 'CONNEXION DISCORD...' : 'CONTINUER AVEC DISCORD'}
                        </span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (showGameBar || activeSection === 'configuration') && (
              <div className="global-error-toast" role="alert">
                ⚠ {errorMsg}
              </div>
            )}
          </main>

          {showGameBar && (
          <footer className="persistent-action-bar">
            {isDownloading && (
              <div className="premium-progress-area">
                <div className="premium-progress-bar-container">
                  <div className="premium-progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="premium-progress-labels">
                  <span>Téléchargement des fichiers binaires...</span>
                  <span className="pct-text">{progress}%</span>
                </div>
              </div>
            )}

            <div className="action-bar-layout">
              <div className="selected-version-details">
                <div className="version-indicator-dot" />
                <div>
                  <span className="version-main-title">
                    {selected ? `Platform Master v${selected.version}` : 'Sélectionnez une version'}
                  </span>
                  <span className="version-sub-title">
                    {isInstalled ? 'Cette build est prête (Exécutable local disponible)' : 'Fichiers non trouvés, installation requise'}
                  </span>
                </div>
              </div>

              {isInstalled ? (
                <button className="action-btn btn-launch" onClick={handlePlay} disabled={isLaunching}>
                  {isLaunching ? 'LANCEMENT...' : 'JOUER'}
                </button>
              ) : (
                <button className="action-btn btn-install" onClick={handleDownload} disabled={isDownloading || !selected}>
                  {isDownloading ? 'PATIENTEZ' : 'TÉLÉCHARGER'}
                </button>
              )}
            </div>
          </footer>
          )}
        </div>
      </div>
    </div>
  )
}
