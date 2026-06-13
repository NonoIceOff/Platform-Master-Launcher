import { useState, type ReactElement } from 'react'

export default function Versions(): ReactElement {
  const [versions] = useState<Record<string, string>>(window.electron?.process?.versions || {})

  return (
    <div className="tab-view">
      <h2>Versions</h2>

      <pre className="versions-box">{JSON.stringify(versions, null, 2)}</pre>
    </div>
  )
}
