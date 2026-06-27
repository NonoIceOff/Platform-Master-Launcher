import { useState, useEffect, useMemo, type ReactElement } from 'react'
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  MessagesSquare,
  PlusCircle
} from 'lucide-react'
import type { PartycipateSession, PartycipateView } from './types'
import EventList from './views/EventList'
import EventDetail from './views/EventDetail'
import Candidates from './views/Candidates'
import EventCreate from './views/EventCreate'
import Gestion from './views/Gestion'
import Productions from './views/Productions'
import ProductionMembers from './views/ProductionMembers'
import ProductionPublic from './views/ProductionPublic'
import AuthRequired from './views/AuthRequired'
import Discord from '../discord/Discord'
import NotificationBell from './components/NotificationBell'
import './partycipate.css'

const NAV_ITEMS = [
  { id: 'home' as const, label: 'Événements', icon: null, chat: false },
  { id: 'dashboard' as const, label: 'Mes évènements', icon: LayoutDashboard, chat: false },
  { id: 'productions' as const, label: 'Mes productions', icon: Building2, chat: false },
  { id: 'chat' as const, label: 'Chat', icon: MessagesSquare, chat: true }
]

type TabId = 'home' | 'dashboard' | 'productions' | 'chat'

interface PartycipateProps {
  session: PartycipateSession | null
  sessionReady: boolean
  onGoToLogin: () => void
  onReauth: () => void
}

function tabFromView(view: PartycipateView): TabId {
  if (view.type === 'dashboard') return 'dashboard'
  if (view.type === 'productions') return 'productions'
  if (view.type === 'chat') return 'chat'
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
  const [createOpen, setCreateOpen] = useState(false)
  const [prodCreateTrigger, setProdCreateTrigger] = useState(0)

  useEffect(() => {
    if (session && view.type === 'auth-required') {
      setView({ type: 'home' })
    }
  }, [session, view.type])

  const activeNav = useMemo((): TabId => {
    if (
      view.type === 'event' ||
      view.type === 'candidates' ||
      view.type === 'create' ||
      view.type === 'modify' ||
      view.type === 'production-public'
    ) {
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
    if ((id === 'dashboard' || id === 'productions') && sessionReady && !session) {
      setReturnTab(id)
      setView({ type: 'auth-required' })
      return
    }
    goToTab(id)
  }

  function handleCreateEvent(): void {
    setCreateOpen(false)
    requireAuth({ type: 'create' })
  }

  function handleCreateProduction(): void {
    setCreateOpen(false)
    if (!sessionReady) return
    if (!session) {
      setReturnTab('productions')
      setView({ type: 'auth-required' })
      return
    }
    goToTab('productions')
    // Signale à la vue Productions d'ouvrir directement le formulaire de création.
    setProdCreateTrigger((t) => t + 1)
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
                className={`app-subnav-tab ${item.chat ? 'tab-chat' : ''} ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => handleNav(item.id)}
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="app-subnav-actions">
          <NotificationBell
            enabled={!!session}
            onOpenEvent={(eventId) => navigateFromTab(activeNav, { type: 'event', id: eventId })}
          />
          <div className="pc-create-menu">
            <button
              type="button"
              className="pc-btn pc-btn-primary pc-btn-sm"
              onClick={() => setCreateOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={createOpen}
            >
              <PlusCircle size={16} />
              Créer
            </button>
            {createOpen && (
              <>
                <div className="pc-create-menu-backdrop" onClick={() => setCreateOpen(false)} />
                <div className="pc-create-menu-pop" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className="pc-create-menu-item"
                    onClick={handleCreateEvent}
                  >
                    <CalendarDays size={15} />
                    Créer un évènement
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="pc-create-menu-item"
                    onClick={handleCreateProduction}
                  >
                    <Building2 size={15} />
                    Créer une production
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {view.type === 'chat' ? (
        <Discord session={session} onRequireLogin={onGoToLogin} />
      ) : (
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
        {view.type === 'candidates' && (
          <Candidates
            eventId={view.id}
            session={session}
            onBack={() => setView({ type: 'event', id: view.id })}
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
            openCreateSignal={prodCreateTrigger}
          />
        )}
        {view.type === 'production' && (
          <ProductionMembers productionId={view.id} onBack={() => setView({ type: 'productions' })} />
        )}
        {view.type === 'production-public' && (
          <ProductionPublic
            productionId={view.id}
            session={session}
            onBack={goBack}
            onNavigate={(next) => navigateFromTab(returnTab, next)}
            onGoToLogin={onGoToLogin}
          />
        )}
        {view.type === 'auth-required' && (
          <AuthRequired
            hasSession={!!session}
            onGoToLogin={onGoToLogin}
            onReauth={onReauth}
          />
        )}
      </div>
      )}
    </div>
  )
}
