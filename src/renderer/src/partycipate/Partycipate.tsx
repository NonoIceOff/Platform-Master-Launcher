import { useState, useEffect, useMemo, type ReactElement } from 'react'
import { Building2, LayoutDashboard, PlusCircle } from 'lucide-react'
import type { PartycipateSession, PartycipateView } from './types'
import EventList from './views/EventList'
import EventDetail from './views/EventDetail'
import EventCreate from './views/EventCreate'
import Gestion from './views/Gestion'
import Productions from './views/Productions'
import ProductionMembers from './views/ProductionMembers'
import AuthRequired from './views/AuthRequired'
import './partycipate.css'

const NAV_ITEMS = [
  { id: 'home' as const, label: 'Événements', icon: null },
  { id: 'dashboard' as const, label: 'Gestion', icon: LayoutDashboard },
  { id: 'productions' as const, label: 'Mes productions', icon: Building2 }
]

type TabId = 'home' | 'dashboard' | 'productions'

interface PartycipateProps {
  session: PartycipateSession | null
  sessionReady: boolean
  onGoToLogin: () => void
  onReauth: () => void
}

function tabFromView(view: PartycipateView): TabId {
  if (view.type === 'dashboard') return 'dashboard'
  if (view.type === 'productions') return 'productions'
  return 'home'
}

export default function Partycipate({
  session,
  sessionReady,
  onGoToLogin,
  onReauth
}: PartycipateProps): ReactElement {
  const [view, setView] = useState<PartycipateView>({ type: 'home' })
  const [returnTab, setReturnTab] = useState<TabId>('home')

  useEffect(() => {
    if (session && view.type === 'auth-required') {
      setView({ type: 'home' })
    }
  }, [session, view.type])

  const activeNav = useMemo((): TabId => {
    if (view.type === 'event' || view.type === 'create' || view.type === 'modify') {
      return returnTab
    }
    if (view.type === 'production') return 'productions'
    if (view.type === 'auth-required') return 'home'
    return tabFromView(view)
  }, [view, returnTab])

  function goToTab(tab: TabId): void {
    setReturnTab(tab)
    setView({ type: tab })
  }

  function navigateFromTab(tab: TabId, next: PartycipateView): void {
    if (next.type === 'home' || next.type === 'dashboard' || next.type === 'productions') {
      goToTab(next.type)
      return
    }
    setReturnTab(tab)
    setView(next)
  }

  function goBack(): void {
    setView({ type: returnTab })
  }

  function requireAuth(next: PartycipateView): void {
    if (!sessionReady) return
    if (!session) {
      setReturnTab(activeNav)
      setView({ type: 'auth-required' })
      return
    }
    navigateFromTab(activeNav, next)
  }

  function handleNav(id: TabId): void {
    if (id !== 'home' && sessionReady && !session) {
      setReturnTab(id)
      setView({ type: 'auth-required' })
      return
    }
    goToTab(id)
  }

  return (
    <div className="pc-shell">
      <header className="app-subnav app-subnav--pc">
        <nav className="app-subnav-menu">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className={`app-subnav-tab ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="app-subnav-actions">
          <button
            type="button"
            className="pc-btn pc-btn-primary pc-btn-sm"
            onClick={() => requireAuth({ type: 'create' })}
          >
            <PlusCircle size={16} />
            Créer
          </button>
        </div>
      </header>

      <div className="pc-content">
        {view.type === 'home' && (
          <EventList
            onNavigate={(next) => navigateFromTab('home', next)}
            session={session}
            onGoToLogin={onGoToLogin}
          />
        )}
        {view.type === 'event' && (
          <EventDetail
            eventId={view.id}
            session={session}
            onNavigate={(next) => navigateFromTab(returnTab, next)}
            onBack={goBack}
            onGoToLogin={onGoToLogin}
          />
        )}
        {view.type === 'create' && (
          <EventCreate
            session={session}
            sessionReady={sessionReady}
            onNavigate={(next) => navigateFromTab(returnTab, next)}
            onBack={goBack}
          />
        )}
        {view.type === 'modify' && (
          <EventCreate
            eventId={view.id}
            session={session}
            sessionReady={sessionReady}
            onNavigate={(next) => navigateFromTab(returnTab, next)}
            onBack={goBack}
          />
        )}
        {view.type === 'dashboard' && (
          <Gestion
            session={session}
            sessionReady={sessionReady}
            onNavigate={(next) => navigateFromTab('dashboard', next)}
          />
        )}
        {view.type === 'productions' && (
          <Productions
            session={session}
            sessionReady={sessionReady}
            onNavigate={(next) => navigateFromTab('productions', next)}
          />
        )}
        {view.type === 'production' && (
          <ProductionMembers productionId={view.id} onBack={() => setView({ type: 'productions' })} />
        )}
        {view.type === 'auth-required' && (
          <AuthRequired
            hasSession={!!session}
            onGoToLogin={onGoToLogin}
            onReauth={onReauth}
          />
        )}
      </div>
    </div>
  )
}
