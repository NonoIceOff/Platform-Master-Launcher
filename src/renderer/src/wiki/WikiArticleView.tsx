import { type ReactElement } from 'react'
import { getWikiArticle } from './articles'
import { categoryLabels } from './navigation'
import type { WikiSection } from './types'

function WikiTable({ table }: { table: NonNullable<WikiSection['table']> }): ReactElement {
  return (
    <div className="wiki-table-wrap">
      <table className="wiki-table">
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function WikiSectionBlock({ section }: { section: WikiSection }): ReactElement {
  return (
    <section className="wiki-section" id={section.id}>
      <h2 className="wiki-section-title">{section.title}</h2>
      {section.paragraphs?.map((p, i) => (
        <p key={i} className="wiki-paragraph">{p}</p>
      ))}
      {section.list && (
        <ul className="wiki-list">
          {section.list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {section.table && <WikiTable table={section.table} />}
    </section>
  )
}

interface WikiArticleViewProps {
  articleId: string
  onNavigate: (id: string) => void
  getTitle: (id: string) => string
}

export default function WikiArticleView({
  articleId,
  onNavigate,
  getTitle,
}: WikiArticleViewProps): ReactElement | null {
  const article = getWikiArticle(articleId)

  if (!article) {
    return (
      <div className="wiki-not-found">
        <h2>Article introuvable</h2>
        <p>Cette page n&apos;existe pas dans le wiki.</p>
      </div>
    )
  }

  const categoryLabel = categoryLabels[article.category] ?? article.category

  return (
    <article className="wiki-article animate-fade-in">
      <nav className="wiki-breadcrumb">
        <button type="button" onClick={() => onNavigate('accueil')}>Wiki</button>
        <span className="wiki-breadcrumb-sep">›</span>
        <span className="wiki-breadcrumb-muted">{categoryLabel}</span>
        <span className="wiki-breadcrumb-sep">›</span>
        <span>{article.title}</span>
      </nav>

      <div className="wiki-article-layout">
        <div className="wiki-article-body">
          <header className="wiki-article-header">
            <h1 className="wiki-article-title">{article.title}</h1>
            {article.subcategory && (
              <span className="wiki-article-tag">{article.subcategory}</span>
            )}
            <p className="wiki-article-lead">{article.summary}</p>
          </header>

          {article.sections.length > 1 && (
            <nav className="wiki-toc">
              <div className="wiki-toc-title">Sommaire</div>
              <ol>
                {article.sections.map((s, i) => (
                  <li key={i}>
                    <a href={`#wiki-sec-${articleId}-${i}`}>{s.title}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {article.sections.map((section, i) => (
            <div key={i} id={`wiki-sec-${articleId}-${i}`}>
              <WikiSectionBlock section={section} />
            </div>
          ))}

          {article.seeAlso && article.seeAlso.length > 0 && (
            <footer className="wiki-see-also">
              <h3>Voir aussi</h3>
              <div className="wiki-see-also-links">
                {article.seeAlso.map(id => (
                  <button key={id} type="button" className="wiki-link" onClick={() => onNavigate(id)}>
                    {getTitle(id)}
                  </button>
                ))}
              </div>
            </footer>
          )}
        </div>

        {article.infobox && (
          <aside className="wiki-infobox">
            {article.infobox.icon && (
              <div className="wiki-infobox-icon">{article.infobox.icon}</div>
            )}
            <div className="wiki-infobox-title">
              {article.infobox.title ?? article.title}
            </div>
            <table className="wiki-infobox-table">
              <tbody>
                {article.infobox.rows.map((row, i) => (
                  <tr key={i}>
                    <th>{row.label}</th>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </aside>
        )}
      </div>
    </article>
  )
}
