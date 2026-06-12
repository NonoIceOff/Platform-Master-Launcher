import { useState } from 'react'

export default function Versions() {
  const [versions] = useState<any>(
    (window as any).electron?.process?.versions || {}
  )

  return (
    <div className="tab-view">
      <h2>Versions</h2>

      <pre className="versions-box">
        {JSON.stringify(versions, null, 2)}
      </pre>
    </div>
  )
}
