export type WikiCategoryId =
  | 'accueil'
  | 'blocs'
  | 'objets'
  | 'outils'
  | 'mobs'
  | 'biomes'
  | 'dimensions'
  | 'fabrication'
  | 'mecaniques'
  | 'succes'
  | 'multijoueur'

export interface WikiInfoboxRow {
  label: string
  value: string
}

export interface WikiTable {
  headers: string[]
  rows: string[][]
}

export interface WikiSection {
  id?: string
  title: string
  paragraphs?: string[]
  list?: string[]
  table?: WikiTable
}

export interface WikiArticle {
  id: string
  title: string
  category: WikiCategoryId
  subcategory?: string
  summary: string
  infobox?: {
    icon?: string
    title?: string
    rows: WikiInfoboxRow[]
  }
  sections: WikiSection[]
  seeAlso?: string[]
}

export interface WikiNavGroup {
  id: WikiCategoryId
  label: string
  icon: string
  articles: { id: string; label: string }[]
}
