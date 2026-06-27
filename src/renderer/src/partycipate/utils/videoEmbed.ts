// Décrit comment afficher une URL vidéo : iframe (YouTube/Vimeo) ou balise <video>.
export interface VideoEmbed {
  kind: 'iframe' | 'video'
  src: string
}

function youtubeId(url: URL): string | null {
  if (url.hostname.includes('youtu.be')) {
    return url.pathname.slice(1) || null
  }
  if (url.hostname.includes('youtube.com')) {
    if (url.pathname === '/watch') return url.searchParams.get('v')
    if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || null
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || null
  }
  return null
}

// Convertit une URL en source embarquable. YouTube/Vimeo => iframe, sinon <video>.
export function toVideoEmbed(raw: string): VideoEmbed {
  const value = (raw || '').trim()
  try {
    const url = new URL(value)
    const yt = youtubeId(url)
    if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt}` }
    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop()
      if (id) return { kind: 'iframe', src: `https://player.vimeo.com/video/${id}` }
    }
  } catch {
    // URL invalide : on retombe sur <video>.
  }
  return { kind: 'video', src: value }
}
