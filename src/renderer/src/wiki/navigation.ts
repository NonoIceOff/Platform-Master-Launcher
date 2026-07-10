import type { WikiNavGroup } from './types'

export const wikiNavigation: WikiNavGroup[] = [
  {
    id: 'accueil',
    label: 'Accueil',
    icon: '🏠',
    articles: [{ id: 'accueil', label: "Page d'accueil" }]
  },
  {
    id: 'blocs',
    label: 'Blocs',
    icon: '🧱',
    articles: [
      { id: 'blocs-terrain', label: 'Terrain' },
      { id: 'blocs-minerais', label: 'Minerais' },
      { id: 'blocs-bois', label: 'Bois (7 essences)' },
      { id: 'blocs-pierre', label: 'Pierre & roche' },
      { id: 'blocs-decoration', label: 'Décoration en pierre' },
      { id: 'blocs-desert', label: 'Désert & Badlands' },
      { id: 'blocs-vegetation', label: 'Végétation' },
      { id: 'blocs-fluides', label: 'Fluides & lave' },
      { id: 'blocs-structures', label: 'Structures' },
      { id: 'blocs-shadow', label: 'Dimension ombragée' },
      { id: 'torche', label: 'Torche' },
      { id: 'four', label: 'Four' }
    ]
  },
  {
    id: 'objets',
    label: 'Objets',
    icon: '🎒',
    articles: [
      { id: 'objets-materiaux', label: 'Matériaux' },
      { id: 'objets-seaux', label: 'Seaux' },
      { id: 'objets-potions', label: 'Potions' },
      { id: 'objets-equipement', label: 'Équipement' },
      { id: 'objets-armes', label: 'Épées' }
    ]
  },
  {
    id: 'outils',
    label: 'Outils',
    icon: '⛏️',
    articles: [{ id: 'outils', label: 'Pioches, haches & pelles' }]
  },
  {
    id: 'enchantement',
    label: 'Enchantement',
    icon: '✨',
    articles: [
      { id: 'enchantement', label: "Système d'enchantement" },
      { id: 'table-enchantement', label: "Table d'enchantement" },
      { id: 'enchant-efficacite', label: 'Efficacité' },
      { id: 'enchant-fortune', label: 'Fortune' }
    ]
  },
  {
    id: 'mobs',
    label: 'Mobs',
    icon: '🧟',
    articles: [
      { id: 'mobs-apercu', label: 'Aperçu' },
      { id: 'mob-zombie', label: 'Zombie' },
      { id: 'mob-mouton', label: 'Mouton' },
      { id: 'mob-lapin', label: 'Lapin' },
      { id: 'mob-abeille', label: 'Abeille' },
      { id: 'mob-shadow-boss', label: 'Shadow Boss' }
    ]
  },
  {
    id: 'biomes',
    label: 'Biomes',
    icon: '🌲',
    articles: [
      { id: 'biomes', label: 'Les 13 biomes' },
      { id: 'biomes-tempere', label: 'Tempérés' },
      { id: 'biomes-arides', label: 'Arides' },
      { id: 'biomes-froids', label: 'Froids & humides' }
    ]
  },
  {
    id: 'dimensions',
    label: 'Dimensions',
    icon: '🌀',
    articles: [
      { id: 'dimension-overworld', label: 'Overworld' },
      { id: 'dimension-shadow', label: 'Dimension Shadow' },
      { id: 'types-monde', label: 'Types de monde' }
    ]
  },
  {
    id: 'fabrication',
    label: 'Fabrication',
    icon: '🔨',
    articles: [
      { id: 'craft', label: 'Craft' },
      { id: 'four-fusion', label: 'Fusion (four)' },
      { id: 'chaudron', label: 'Chaudron' },
      { id: 'tailleur-pierre', label: 'Tailleur de pierre' }
    ]
  },
  {
    id: 'mecaniques',
    label: 'Mécaniques',
    icon: '⚙️',
    articles: [
      { id: 'modes-jeu', label: 'Modes de jeu' },
      { id: 'mecanique-minage', label: 'Minage & tiers' },
      { id: 'mecanique-eau', label: 'Eau' },
      { id: 'mecanique-eclairage', label: 'Éclairage' },
      { id: 'mecanique-jour-nuit', label: 'Cycle jour / nuit' },
      { id: 'mecanique-donjons', label: 'Donjons' },
      { id: 'mecanique-convoyeur', label: 'Tapis roulant' }
    ]
  },
  {
    id: 'succes',
    label: 'Succès',
    icon: '🏆',
    articles: [{ id: 'succes', label: 'Liste des succès' }]
  },
  {
    id: 'multijoueur',
    label: 'Multijoueur',
    icon: '🌐',
    articles: [
      { id: 'multijoueur', label: 'Introduction' },
      { id: 'pm-server', label: 'PM_Server' },
      { id: 'chat-multijoueur', label: 'Chat' }
    ]
  }
]

export const categoryLabels: Record<string, string> = Object.fromEntries(
  wikiNavigation.map((g) => [g.id, g.label])
)
