import type { ReactElement } from 'react'
import { MessageSquare } from 'lucide-react'

export default function Messages(): ReactElement {
  return (
    <div className="pc-view">
      <div className="pc-view-header">
        <div>
          <p className="pc-view-kicker">Social</p>
          <h2 className="pc-view-title">Messages</h2>
        </div>
      </div>
      <div className="pc-empty">
        <MessageSquare size={40} className="pc-empty-icon-svg" />
        <p className="pc-empty-title">Messagerie</p>
        <p className="pc-empty-sub">Les conversations arrivent bientôt dans la superapp.</p>
      </div>
    </div>
  )
}
