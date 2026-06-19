import { useState, useMemo, useCallback, type ReactElement } from 'react'
import { wikiNavigation } from '../wiki/navigation'
import { getWikiArticle, searchWikiArticles, wikiArticleMap } from '../wiki/articles'
import WikiArticleView from '../wiki/WikiArticleView'

function getArticleTitle(id: string): string {
  return getWikiArticle(id)?.title ?? id
}

export default function Wiki(): ReactElement {
  const [currentId, setCurrentId] = useState('accueil')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(['accueil', 'blocs', 'multijoueur'])
  )

  const searchResults = useMemo(
    () => (searchQuery.trim() ? searchWikiArticles(searchQuery) : []),
    [searchQuery]
  )

  const navigate = useCallback((id: string) => {
    setCurrentId(id)
    setSearchQuery('')
  }, [])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  const currentArticle = getWikiArticle(currentId)
  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="wiki-root animate-fade-in">
      <aside className="wiki-sidebar">
        <div className="wiki-sidebar-header">
          <span className="wiki-sidebar-logo">📖</span>
          <span>Wiki PM</span>
        </div>

        <nav className="wiki-nav">
          {wikiNavigation.map(group => {
            const isExpanded = expandedGroups.has(group.id)
            const isSingle = group.articles.length === 1 && group.id === 'accueil'

            if (isSingle) {
              return (
                <button
                  key={group.id}
                  type="button"
                  className={`wiki-nav-item ${currentId === group.articles[0].id ? 'active' : ''}`}
                  onClick={() => navigate(group.articles[0].id)}
                >
                  <span className="wiki-nav-icon">{group.icon}</span>
                  {group.label}
                </button>
              )
            }

            return (
              <div key={group.id} className="wiki-nav-group">
                <button
                  type="button"
                  className={`wiki-nav-group-btn ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <span className="wiki-nav-icon">{group.icon}</span>
                  <span className="wiki-nav-group-label">{group.label}</span>
                  <span className="wiki-nav-chevron">{isExpanded ? '▾' : '▸'}</span>
                </button>
                {isExpanded && (
                  <div className="wiki-nav-children">
                    {group.articles.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`wiki-nav-child ${currentId === item.id ? 'active' : ''}`}
                        onClick={() => navigate(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="wiki-sidebar-footer">
          {wikiArticleMap.size} articles
        </div>
      </aside>

      <div className="wiki-main">
        <div className="wiki-toolbar">
          <div className="wiki-search-wrap">
            <span className="wiki-search-icon">🔍</span>
            <input
              type="search"
              className="wiki-search-input"
              placeholder="Rechercher dans le wiki…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="wiki-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Effacer"
              >
                ×
              </button>
            )}
          </div>
          {currentArticle && !isSearching && (
            <span className="wiki-toolbar-meta">{currentArticle.category}</span>
          )}
        </div>

        <div className="wiki-content scrollable-inner">
          {isSearching ? (
            <div className="wiki-search-results">
              <h2 className="wiki-search-results-title">
                {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''} pour « {searchQuery} »
              </h2>
              {searchResults.length === 0 ? (
                <p className="wiki-search-empty">Aucun article ne correspond à votre recherche.</p>
              ) : (
                <ul className="wiki-search-list">
                  {searchResults.map(a => (
                    <li key={a.id}>
                      <button type="button" className="wiki-search-hit" onClick={() => navigate(a.id)}>
                        <span className="wiki-search-hit-title">{a.title}</span>
                        <span className="wiki-search-hit-summary">{a.summary}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <WikiArticleView
              articleId={currentId}
              onNavigate={navigate}
              getTitle={getArticleTitle}
            />
          )}
        </div>
      </div>
    </div>
  )
}
