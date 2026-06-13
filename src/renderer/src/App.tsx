import { useState, useEffect, useCallback, type ReactElement } from 'react'
import './App.css'
import Wiki from './components/Wiki'

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

const NAV_TABS = ['Actualités', 'Platform Master', 'Wiki', 'Configuration']

export default function App(): ReactElement {
  const [versions, setVersions] = useState<Version[]>([])
  const [selected, setSelected] = useState<Version | null>(null)
  const [installed, setInstalled] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'downloading' | 'launching' | 'error'>('idle')
  const [progress, setProgress] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('Actualités')
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)
  const [playtime, setPlaytime] = useState(0)

  useEffect(() => {
    loadVersions()
    window.launcher.getInstalledVersion().then(setInstalled)

    const unsub = window.launcher.onDownloadProgress(({ pct }: { pct: number }) => {
      setProgress(pct)
    })
    window.launcher.getPlaytime().then(setPlaytime)
    return unsub
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

  // Correction de la condition : Est-ce que la version sélectionnée AU BAS de l'écran correspond à celle installée ?
  const isInstalled = selected !== null && installed === selected.version
  const isDownloading = status === 'downloading'
  const isLaunching = status === 'launching'

  return (
    <div className="app dashboard-layout">
      {/* BARRE DE TITRE */}
      <div className="titlebar">
        <div className="titlebar-controls">
          <button className="titlebar-btn close" onClick={() => window.launcher.close()} />
          <button className="titlebar-btn minimize" onClick={() => window.launcher.minimize()} />
        </div>
        <div className="titlebar-drag">
          <span className="titlebar-drag-title">PLATFORM MASTER LAUNCHER</span>
        </div>
      </div>

      <div className="main-container">
        {/* SIDEBAR GAUCHE */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-avatar">PM</div>
            <div className="brand-text">
              <h4>M-Network</h4>
              <p className="status-online"><span className="pulse-dot" /> Connecté</p>
            </div>
          </div>
          <div className="sidebar-menu">
            {NAV_TABS.map(tab => (
              <button
                key={tab}
                className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="nav-icon">
                  {tab === 'Actualités' && '📰'}
                  {tab === 'Platform Master' && '🎮'}
                  {tab === 'Configuration' && '⚙️'}
                  {tab === 'Wiki' && '📖'}
                </span>
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* CONTENU DROIT */}
        <div className="content-wrapper">
          <main className="scrollable-content">

            {/* ONGLET 1 : ACTUALITÉS */}
            {activeTab === 'Actualités' && (
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

            {/* ONGLET 2 : PLATFORM MASTER */}
            {activeTab === 'Platform Master' && (
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

            {activeTab === 'Wiki' && <Wiki />}

            {/* ONGLET 3 : CONFIGURATION */}
            {activeTab === 'Configuration' && (
              <div className="tab-view animate-fade-in">
                <div className="view-header">
                  <div>
                    <h2 className="view-title">Paramètres avancés</h2>
                    <p className="view-subtitle">Ajustements et options de l'exécutable.</p>
                  </div>
                </div>
                <div className="empty-state-card">
                  <span className="empty-icon">⚙️</span>
                  <h3>Espace en développement</h3>
                  <p>L'allocation de mémoire RAM sera implémentée dans la prochaine build.</p>
                </div>
              </div>
            )}

            {errorMsg && <div className="global-error-toast">⚠ {errorMsg}</div>}
          </main>

          {/* BARRE DE LANCEMENT BASSE PERMANENTE */}
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
        </div>
      </div>
    </div>
  )
}
