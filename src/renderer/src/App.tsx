import { useEffect, useState } from 'react'

export default function App() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [playtime, setPlaytime] = useState<number>(0)

  useEffect(() => {
    window.launcher?.getPlaytime?.().then((t: number) => {
      setPlaytime(t)
    })

    const unsub =
      window.launcher?.onDownloadProgress?.(({ pct }: { pct: number }) => {
        console.log('progress', pct)
      })

    return () => {
      unsub?.()
    }
  }, [])

  const launch = async () => {
    const res = await window.launcher?.launchGame()

    if (!res) {
      setErrorMsg('Erreur lors du lancement')
    }
  }

  return (
    <div className="app">
      <button onClick={launch}>Play</button>

      {errorMsg && <div className="error">{errorMsg}</div>}

      <div>Playtime: {playtime}</div>
    </div>
  )
}
