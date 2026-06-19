import type { ReactElement } from 'react'
import { LogIn, RefreshCw } from 'lucide-react'

interface AuthRequiredProps {
  hasSession: boolean
  onGoToLogin: () => void
  onReauth: () => void
}

export default function AuthRequired({
  hasSession,
  onGoToLogin,
  onReauth
}: AuthRequiredProps): ReactElement {
  if (hasSession) {
    return (
      <div className="pc-view pc-auth-view">
        <div className="pc-auth-card">
          <div className="pc-auth-logo">MN</div>
          <h2>Session expirée</h2>
          <p className="pc-auth-sub">
            Votre compte est connecté dans le launcher, mais Party-cipate n&apos;a pas pu
            valider votre session. Déconnectez-vous puis reconnectez-vous dans Configuration.
          </p>
          <button type="button" className="pc-btn pc-btn-primary pc-btn-full" onClick={onReauth}>
            <RefreshCw size={16} />
            Se reconnecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pc-view pc-auth-view">
      <div className="pc-auth-card">
        <div className="pc-auth-logo">MN</div>
        <h2>Compte M-Network requis</h2>
        <p className="pc-auth-sub">
          Party-cipate utilise le même compte que Platform Master. Connectez-vous dans
          l&apos;onglet Configuration.
        </p>
        <button type="button" className="pc-btn pc-btn-primary pc-btn-full" onClick={onGoToLogin}>
          <LogIn size={16} />
          Aller à Configuration
        </button>
      </div>
    </div>
  )
}
