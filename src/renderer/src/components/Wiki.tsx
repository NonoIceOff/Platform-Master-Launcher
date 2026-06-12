const wikiTiles = [
  '🌍 Terre',
  '💧 Eau',
  '🪨 Pierre',
  '🌳 Bois',
  '🔥 Feu',
  '🌫️ Air',
  '⚡ Électricité',
  '❄️ Glace',
  '🌋 Lave',
  '⛏️ Minerai'
]

export default function Wiki() {
  return (
    <div className="tab-view animate-fade-in">
      <div className="view-header">
        <div>
          <h2 className="view-title">Wiki Platform Master</h2>
          <p className="view-subtitle">
            Explore les éléments du monde.
          </p>
        </div>
      </div>

      <div className="wiki-tile-grid">
        {wikiTiles.map((tile, index) => (
          <div key={index} className="wiki-tile">
            {tile}
          </div>
        ))}
      </div>
    </div>
  )
}
