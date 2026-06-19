import type { WikiArticle } from './types'

export const wikiArticles: WikiArticle[] = [
  {
    id: 'accueil',
    title: 'Wiki Platform Master',
    category: 'accueil',
    summary: 'Encyclopédie officielle du jeu — blocs, objets, mobs, biomes et multijoueur.',
    sections: [
      {
        title: 'Bienvenue',
        paragraphs: [
          'Bienvenue sur le Wiki Platform Master, l\'encyclopédie dédiée au sandbox 2D Platform Master (Beta 9 Godot). Ce wiki recense le contenu du jeu tel qu\'implémenté dans le dépôt platform-master et le serveur multijoueur PM_Server.',
          'Utilisez la barre de recherche ou la navigation à gauche pour parcourir les articles. Les tableaux reprennent les données du jeu : outils requis, tiers de pioche, recettes et statistiques des mobs.',
        ],
      },
      {
        title: 'Catégories principales',
        list: [
          'Blocs — 88 types : terrain, minerais, bois, structures, fluides…',
          'Objets — matériaux, seaux, potions, équipement et épées',
          'Outils — 6 tiers : bois → pierre → fer → rubis → saphir → émeraude',
          'Mobs — zombies, moutons, abeilles et le Shadow Boss',
          'Biomes — 7 biomes procéduraux avec génération distincte',
          'Dimensions — Overworld et dimension Shadow',
          'Fabrication — craft main, table d\'assemblage, four, chaudron',
          'Multijoueur — PM_Server, chat et synchronisation réseau',
        ],
      },
      {
        title: 'Version de référence',
        paragraphs: [
          'Contenu basé sur Platform Master 0.10.0-Snap1 (Godot) et PM_Server 0.10.0-Snap1. Certaines potions ou mécaniques sont partiellement implémentées — consultez les articles concernés pour le détail.',
        ],
      },
    ],
    seeAlso: ['blocs-terrain', 'craft', 'multijoueur', 'biomes'],
  },

  // ─── BLOCS ───
  {
    id: 'blocs-terrain',
    title: 'Blocs de terrain',
    category: 'blocs',
    subcategory: 'Terrain',
    summary: 'Couches de surface : herbe, terre, sable et décoration végétale.',
    infobox: {
      icon: '🌍',
      title: 'Terrain',
      rows: [
        { label: 'Outil', value: 'Pelle (tier 0+)' },
        { label: 'Biomes', value: 'Tous sauf océan / désert pur' },
      ],
    },
    sections: [
      {
        title: 'Description',
        paragraphs: [
          'Les blocs de terrain forment la croûte du monde. Ils sont générés selon le biome actif et creusables à la pelle dès le tier 0 (main ou bois).',
        ],
      },
      {
        title: 'Liste des blocs',
        table: {
          headers: ['Bloc', 'ID', 'Durabilité', 'Biome typique'],
          rows: [
            ['Bloc d\'herbe', '0', '0,35', 'Plaines, forêt, marais'],
            ['Terre', '1', '0,40', 'Sous-surface universelle'],
            ['Herbe courte', '23', '0,35', 'Décoration de surface'],
            ['Sable', '11', '0,30', 'Désert, océan'],
            ['Herbe enneigée', '39', '0,35', 'Toundra, montagnes'],
            ['Bloc de neige', '40', '0,35', 'Sommets montagneux'],
            ['Bloc d\'argile', '48', '0,55', 'Génération souterraine'],
            ['Briques d\'argile', '49', '0,55', 'Craft / pose'],
            ['Tulipe rose / rouge, Rose', '50–52', '0,10', 'Plaines, forêt'],
          ],
        },
      },
    ],
    seeAlso: ['biomes', 'blocs-pierre', 'outils'],
  },
  {
    id: 'blocs-minerais',
    title: 'Minerais',
    category: 'blocs',
    subcategory: 'Minerais',
    summary: 'Six filons enfouis sous la surface, en roche ou en grès.',
    infobox: {
      icon: '💎',
      title: 'Minerais',
      rows: [
        { label: 'Outil', value: 'Pioche' },
        { label: 'Fusion', value: 'Four requis' },
      ],
    },
    sections: [
      {
        title: 'Description',
        paragraphs: [
          'Les minerais apparaissent en profondeur via le générateur de grottes. En biome désert, des variantes en grès remplacent la roche normale. Chaque filon exige un tier de pioche minimum.',
        ],
      },
      {
        title: 'Minerais en roche',
        table: {
          headers: ['Minerai', 'Tier pioche', 'Fusion →', 'Profondeur'],
          rows: [
            ['Charbon', '1 (bois)', 'Charbon', 'Peu profond'],
            ['Fer', '2 (pierre)', 'Lingot de fer', 'Moyen'],
            ['Rubis', '3 (fer)', 'Rubis', 'Profond'],
            ['Saphir', '4 (rubis)', 'Saphir', 'Profond'],
            ['Émeraude', '5 (saphir)', 'Émeraude', 'Très profond'],
            ['Minerai du vide', '5', 'Lingot du vide', 'Très profond'],
          ],
        },
      },
      {
        title: 'Variantes grès (désert)',
        paragraphs: ['Mêmes tiers et fusions : grès charbon, fer, rubis, saphir, émeraude et vide.'],
      },
    ],
    seeAlso: ['four-fusion', 'outils', 'objets-materiaux'],
  },
  {
    id: 'blocs-bois',
    title: 'Bois',
    category: 'blocs',
    subcategory: 'Bois',
    summary: 'Quatre essences : chêne, bouleau, pin et peuplier.',
    infobox: { icon: '🌳', title: 'Bois', rows: [{ label: 'Outil', value: 'Hache tier 0+' }] },
    sections: [
      {
        title: 'Essences',
        table: {
          headers: ['Essence', 'Bûche', 'Planches', 'Feuilles'],
          rows: [
            ['Chêne', 'Oak Log', 'Oak Planks', 'Oak Leaves'],
            ['Bouleau', 'Bûche de bouleau', 'Planches de bouleau', 'Feuilles de bouleau'],
            ['Pin', 'Bûche de pin', 'Planches de pin', 'Feuilles de pin'],
            ['Peuplier', 'Bûche de peuplier', 'Planches de peuplier', 'Feuilles de peuplier'],
          ],
        },
      },
      {
        title: 'Dérivés craftables',
        list: [
          '1 bûche → 4 planches (craft main)',
          '2 planches → 4 bâtons',
          'Portes, escaliers, dalles et pancartes pour chaque essence',
          'Table d\'assemblage : 4 bâtons + 4 planches',
        ],
      },
      {
        title: 'Génération',
        paragraphs: [
          'La végétation procédurale choisit l\'essence selon le biome : chêne/peuplier en plaine, bouleau en forêt, pin en montagne et toundra.',
        ],
      },
    ],
    seeAlso: ['craft', 'biomes', 'blocs-structures'],
  },
  {
    id: 'blocs-pierre',
    title: 'Pierre & roche',
    category: 'blocs',
    subcategory: 'Pierre',
    summary: 'Roche de base, pierre taillée, briques et deepstone ombragée.',
    infobox: { icon: '🪨', title: 'Pierre', rows: [{ label: 'Outil', value: 'Pioche tier 1+' }] },
    sections: [
      {
        title: 'Types de pierre',
        table: {
          headers: ['Bloc', 'Tier', 'Obtention'],
          rows: [
            ['Pierre', '1', 'Sous-sol, montagnes'],
            ['Pierre taillée', '1', 'Craft table d\'assemblage'],
            ['Pierre lisse / briques / dalles', '1', 'Tailleur de pierre'],
            ['Pierre moussue', '1', 'Donjons, marais'],
            ['Lianes', '1', 'Marais, grottes'],
            ['Pierre ombragée (deepstone)', '1', 'Profondeur > 80 blocs'],
            ['Void Stone', '1', 'Dimension / profondeurs'],
          ],
        },
      },
      {
        title: 'Profondeur',
        paragraphs: [
          'À partir de mid_stone_depth (50) la roche domine. Au-delà de deepstone_depth (80), la pierre ombragée remplace la pierre classique dans les grottes.',
        ],
      },
    ],
    seeAlso: ['tailleur-pierre', 'mecanique-donjons', 'blocs-shadow'],
  },
  {
    id: 'blocs-desert',
    title: 'Blocs du désert',
    category: 'blocs',
    subcategory: 'Désert',
    summary: 'Sable, grès, cactus et minerais en grès.',
    sections: [
      {
        title: 'Blocs',
        table: {
          headers: ['Bloc', 'Outil', 'Notes'],
          rows: [
            ['Sable', 'Pelle 0', 'Surface du biome désert'],
            ['Grès', 'Pioche 1', 'Sous-surface désert'],
            ['Briques / dalles de grès', 'Pioche 1', 'Décoration'],
            ['Cactus', 'Hache 0', 'Végétation désert'],
            ['Minerais en grès', 'Pioche 1–5', 'Variantes désertiques'],
          ],
        },
      },
    ],
    seeAlso: ['biomes', 'blocs-minerais'],
  },
  {
    id: 'blocs-fluides',
    title: 'Fluides',
    category: 'blocs',
    subcategory: 'Fluides',
    summary: 'Eau et lave — tuiles fluides avec physique dédiée.',
    sections: [
      {
        title: 'Eau',
        paragraphs: [
          'Tuile ID 20. Propagation horizontale (~4 blocs), sources infinies via seau, lacs statiques en génération. Voir l\'article Eau pour la physique complète.',
        ],
      },
      {
        title: 'Lave',
        paragraphs: [
          'Transportable en seau de lave ou seau de magma. Textures de flux vertical (lava_up / lava_down). Émet une lumière intense (niveau 15).',
        ],
      },
    ],
    seeAlso: ['mecanique-eau', 'objets-seaux'],
  },
  {
    id: 'blocs-structures',
    title: 'Structures & blocs interactifs',
    category: 'blocs',
    subcategory: 'Structures',
    summary: 'Blocs fonctionnels : craft, stockage, transport et spawn.',
    sections: [
      {
        title: 'Liste',
        table: {
          headers: ['Bloc', 'Fonction', 'Craft'],
          rows: [
            ['Table d\'assemblage', 'Craft avancé', '4 bâtons + 4 planches'],
            ['Tailleur de pierre', 'Variantes de pierre', 'Craft main'],
            ['Four', 'Fusion de minerais', 'Non crafté (génération / créatif)'],
            ['Chaudron', 'Potions', '5 lingots de fer (table)'],
            ['Coffre', 'Stockage 27 slots', '8 planches'],
            ['Enclume', '—', '—'],
            ['Ruche', 'Miel (abeilles)', '—'],
            ['Tapis roulant', 'Transport entités', '3 fer + 2 cordes → ×4'],
            ['Spawner (générique / zombie / mouton / abeille)', 'Spawn mobs', 'Craft table'],
            ['Verre', 'Transparent', 'Fusion sable'],
            ['Portes (4 essences)', 'Passage', '6 planches'],
          ],
        },
      },
    ],
    seeAlso: ['craft', 'four', 'chaudron', 'mecanique-convoyeur'],
  },
  {
    id: 'blocs-shadow',
    title: 'Blocs ombragés',
    category: 'blocs',
    subcategory: 'Shadow',
    summary: 'Blocs exclusifs à la dimension Shadow et aux profondeurs.',
    sections: [
      {
        title: 'Blocs',
        table: {
          headers: ['Bloc', 'Tier', 'Usage'],
          rows: [
            ['Herbe ombragée', '0', 'Surface Shadow'],
            ['Terre ombragée', '0', 'Sous-sol Shadow'],
            ['Bûche ombragée', '0', 'Bois Shadow'],
            ['Pierre ombragée & variantes', '1', 'Construction, donjons'],
            ['Portail ombragé', '5', 'Traversée dimensionnelle'],
            ['Piédestal du boss', '5', 'Invoque le Shadow Boss'],
            ['Porte ombragée', '—', 'Objet craftable'],
          ],
        },
      },
      {
        title: 'Portail ombragé',
        paragraphs: ['Craft table d\'assemblage : 8 pierre ombragée + 2 lingots du vide → 1 portail.'],
      },
    ],
    seeAlso: ['dimension-shadow', 'mob-shadow-boss'],
  },
  {
    id: 'torche',
    title: 'Torche',
    category: 'blocs',
    summary: 'Source de lumière portable, craftable dès le début.',
    infobox: {
      icon: '🔥',
      rows: [
        { label: 'Craft', value: '1 bâton + 1 charbon → 4' },
        { label: 'Lumière', value: 'Élevée (BFS)' },
        { label: 'Durabilité', value: '0,10' },
      ],
    },
    sections: [
      {
        title: 'Utilisation',
        paragraphs: [
          'Les torches éclairent les grottes et repoussent visuellement l\'obscurité via le système d\'éclairage dynamique. Indispensables la nuit et en spéléologie.',
        ],
      },
    ],
    seeAlso: ['mecanique-eclairage', 'craft', 'succes'],
  },
  {
    id: 'four',
    title: 'Four',
    category: 'blocs',
    summary: 'Structure interactive pour fondre les minerais.',
    infobox: {
      icon: '🔥',
      rows: [
        { label: 'Interaction', value: 'Clic sur le bloc' },
        { label: 'Recettes', value: '6 fusions de minerais' },
      ],
    },
    sections: [
      {
        title: 'Fonction',
        paragraphs: ['Ouvre le menu de fusion. Accepte tout minerai de charbon, fer, rubis, saphir, émeraude ou du vide (roche ou grès).'],
      },
    ],
    seeAlso: ['four-fusion', 'blocs-minerais'],
  },

  // ─── OBJETS ───
  {
    id: 'objets-materiaux',
    title: 'Matériaux',
    category: 'objets',
    summary: 'Ressources craftables obtenues par minage, fusion ou récolte.',
    sections: [
      {
        title: 'Matériaux de base',
        table: {
          headers: ['Objet', 'Source'],
          rows: [
            ['Bâton', 'Craft planches'],
            ['Charbon', 'Fusion minerai charbon'],
            ['Lingot de fer', 'Fusion minerai fer'],
            ['Rubis / Saphir / Émeraude', 'Fusion minerais correspondants'],
            ['Lingot du vide', 'Fusion minerai du vide'],
            ['Corde / Ficelle', 'Craft'],
            ['Fragment de verre', 'Casse de verre'],
            ['Miel', 'Ruches / abeilles'],
            ['Blé', 'Récolte'],
            ['Os', 'Drop zombie'],
          ],
        },
      },
    ],
    seeAlso: ['four-fusion', 'craft'],
  },
  {
    id: 'objets-seaux',
    title: 'Seaux',
    category: 'objets',
    summary: 'Contenants pour fluides.',
    sections: [
      {
        title: 'Types',
        table: {
          headers: ['Seau', 'Usage'],
          rows: [
            ['Seau vide', 'Récupération de fluide'],
            ['Seau d\'eau', 'Source infinie d\'eau'],
            ['Seau de lave', 'Placement de lave'],
            ['Seau de magma', 'Variante lave'],
          ],
        },
      },
    ],
    seeAlso: ['mecanique-eau', 'blocs-fluides'],
  },
  {
    id: 'objets-potions',
    title: 'Potions',
    category: 'objets',
    summary: 'Consommables alchimiques fabriqués au chaudron.',
    sections: [
      {
        title: 'Recettes du chaudron',
        table: {
          headers: ['Potion', 'Ingrédients', 'Effet'],
          rows: [
            ['Potion de vie', 'Fiole + Nourriture', '+4 cœurs instantané'],
            ['Potion de vitesse', 'Fiole + Miel', 'Vitesse 30 s'],
            ['Potion de saut', 'Fiole + 2 Blé', 'Saut amplifié'],
            ['Potion de hâte', 'Fiole + Charbon', 'Cassage rapide (WIP)'],
            ['Potion de portée', 'Fiole + 2 Ficelle + Émeraude', '+4 blocs portée, 60 s'],
            ['Potion de force', 'Fiole + Fer + Os', 'Dégâts mêlée'],
            ['Potion de fortune', 'Fiole + Rubis + Charbon', 'Meilleurs drops minerais'],
            ['Vision nocturne', 'Fiole + Verre + Charbon', 'Éclaire les grottes'],
          ],
        },
      },
      {
        title: 'Note',
        paragraphs: ['La potion d\'attraction est définie mais sans recette ni effet actif. La fiole vide n\'a pas de recette craft documentée.'],
      },
    ],
    seeAlso: ['chaudron'],
  },
  {
    id: 'objets-equipement',
    title: 'Équipement',
    category: 'objets',
    summary: 'Objets spéciaux : mobilité, utilitaires et trophées.',
    sections: [
      {
        title: 'Liste',
        table: {
          headers: ['Objet', 'Effet / usage'],
          rows: [
            ['Jetpack', 'Vol avec carburant (100). Craft : 4 fer + 2 charbon + 2 cordes'],
            ['Jetpack fixé', 'Variante équipée'],
            ['Parachute', 'Ralentit la chute'],
            ['Sac à dos', 'Stockage additionnel'],
            ['Marteau', 'Outil spécial (table d\'assemblage)'],
            ['Horloge', 'Affiche le temps'],
            ['Couronne', 'Drop du Shadow Boss'],
          ],
        },
      },
    ],
    seeAlso: ['craft', 'mob-shadow-boss'],
  },
  {
    id: 'objets-armes',
    title: 'Épées',
    category: 'objets',
    summary: 'Armes de mêlée avec dégâts croissants par tier.',
    sections: [
      {
        title: 'Statistiques',
        table: {
          headers: ['Épée', 'Dégâts', 'Craft disponible'],
          rows: [
            ['Bois', '2', 'Oui'],
            ['Pierre', '3', 'Oui'],
            ['Fer', '4', 'Oui'],
            ['Rubis', '5', 'Non'],
            ['Saphir', '6', 'Non'],
            ['Émeraude', '7', 'Non'],
          ],
        },
      },
    ],
    seeAlso: ['outils', 'mobs-apercu'],
  },

  // ─── OUTILS ───
  {
    id: 'outils',
    title: 'Outils',
    category: 'outils',
    summary: 'Pioches, haches et pelles — 6 tiers avec durabilité et vitesse variables.',
    infobox: {
      icon: '⛏️',
      rows: [
        { label: 'Types', value: 'Pioche, hache, pelle' },
        { label: 'Tiers', value: '6 (bois → émeraude)' },
        { label: 'Guide en jeu', value: 'Touche Tab' },
      ],
    },
    sections: [
      {
        title: 'Tiers',
        table: {
          headers: ['Tier', 'Matériau', 'Pioche minerais jusqu\'à'],
          rows: [
            ['0', 'Main', '—'],
            ['1', 'Bois', 'Charbon'],
            ['2', 'Pierre', 'Fer'],
            ['3', 'Fer', 'Rubis'],
            ['4', 'Rubis', 'Saphir'],
            ['5', 'Saphir', 'Émeraude / vide'],
            ['6', 'Émeraude', 'Tout'],
          ],
        },
      },
      {
        title: 'Statistiques (pioche type)',
        table: {
          headers: ['Tier', 'Durabilité', 'Multiplicateur vitesse'],
          rows: [
            ['Bois', '50', '×0,8'],
            ['Pierre', '100', '×0,6'],
            ['Fer', '200', '×0,4'],
            ['Rubis', '300', '×0,35'],
            ['Saphir', '350', '×0,25'],
            ['Émeraude', '400', '×0,2'],
          ],
        },
      },
      {
        title: 'Craft',
        paragraphs: [
          'Outils bois → pierre → fer → rubis craftables. Saphir et émeraude : définis dans Tools.gd mais sans recette craft actuelle.',
          'Recettes type pioche : 2 bâtons + 3 matériau (pelle : 1 matériau). Station : main (bois) ou table d\'assemblage (pierre+).',
        ],
      },
    ],
    seeAlso: ['blocs-minerais', 'craft'],
  },

  // ─── MOBS ───
  {
    id: 'mobs-apercu',
    title: 'Mobs',
    category: 'mobs',
    summary: 'Créatures vivantes : passives, hostiles et boss.',
    sections: [
      {
        title: 'Spawn',
        list: [
          'Spawners (rayon 12 blocs) : générique, zombie, mouton, abeille',
          'Zombies la nuit en mode Survie (15 % / 3 s)',
          'Shadow Boss via piédestal ombragé uniquement',
        ],
      },
      {
        title: 'Liste',
        table: {
          headers: ['Mob', 'PV', 'Dégâts', 'Type'],
          rows: [
            ['Zombie', '12', '2', 'Hostile'],
            ['Mouton', '8', '0', 'Passif'],
            ['Abeille', '6', '1', 'Neutre'],
            ['Shadow Boss', '200', '4', 'Boss'],
          ],
        },
      },
    ],
    seeAlso: ['mob-zombie', 'mob-shadow-boss', 'mecanique-jour-nuit'],
  },
  {
    id: 'mob-zombie',
    title: 'Zombie',
    category: 'mobs',
    summary: 'Mob hostile nocturne qui poursuit le joueur.',
    infobox: {
      icon: '🧟',
      rows: [
        { label: 'PV', value: '12' },
        { label: 'Dégâts', value: '2' },
        { label: 'Vitesse', value: '80' },
        { label: 'Drop', value: 'Os' },
      ],
    },
    sections: [
      {
        title: 'Comportement',
        paragraphs: ['Poursuit le joueur à vue. Apparaît la nuit en Survie ou via spawner zombie.'],
      },
    ],
    seeAlso: ['objets-potions', 'mecanique-jour-nuit'],
  },
  {
    id: 'mob-mouton',
    title: 'Mouton',
    category: 'mobs',
    summary: 'Mob passif errant.',
    infobox: {
      icon: '🐑',
      rows: [
        { label: 'PV', value: '8' },
        { label: 'Dégâts', value: '0' },
        { label: 'Vitesse', value: '40' },
      ],
    },
    sections: [{ title: 'Comportement', paragraphs: ['Errance aléatoire, aucune attaque. Spawn via spawner mouton.'] }],
  },
  {
    id: 'mob-abeille',
    title: 'Abeille',
    category: 'mobs',
    summary: 'Mob volant rapide, lié aux ruches.',
    infobox: {
      icon: '🐝',
      rows: [
        { label: 'PV', value: '6' },
        { label: 'Dégâts', value: '1' },
        { label: 'Vitesse', value: '120' },
      ],
    },
    sections: [
      {
        title: 'Comportement',
        paragraphs: ['Vole vers le joueur. Associée aux blocs ruche pour le miel.'],
      },
    ],
    seeAlso: ['objets-materiaux'],
  },
  {
    id: 'mob-shadow-boss',
    title: 'Shadow Boss',
    category: 'mobs',
    summary: 'Boss de la dimension Shadow — 200 PV, drop la couronne.',
    infobox: {
      icon: '👤',
      rows: [
        { label: 'PV', value: '200' },
        { label: 'Dégâts', value: '4' },
        { label: 'Invocation', value: 'Piédestal ombragé (clic droit)' },
        { label: 'Drop', value: 'Couronne' },
      ],
    },
    sections: [
      {
        title: 'Invocation',
        paragraphs: [
          'Interagir avec le piédestal ombragé dans un donjon ou la dimension Shadow. Débloque le succès « L\'ombre s\'éveille ».',
        ],
      },
      {
        title: 'Victoire',
        paragraphs: ['Vaincre le boss débloque « Chasseur d\'ombres » et donne la couronne.'],
      },
    ],
    seeAlso: ['dimension-shadow', 'succes', 'objets-equipement'],
  },

  // ─── BIOMES ───
  {
    id: 'biomes',
    title: 'Biomes',
    category: 'biomes',
    summary: 'Sept biomes procéduraux générés par bruit de Voronoï.',
    sections: [
      {
        title: 'Liste des biomes',
        table: {
          headers: ['Biome', 'Surface', 'Sous-sol', 'Végétation'],
          rows: [
            ['Plaines', 'Herbe', 'Terre', 'Chêne, peuplier, fleurs'],
            ['Forêt', 'Herbe', 'Terre', 'Dense, bouleau/chêne'],
            ['Montagnes', 'Herbe / roche', 'Terre', 'Pins, pics élevés, neige'],
            ['Désert', 'Sable', 'Grès', 'Cactus'],
            ['Océan', 'Sable', 'Sable', 'Plat, eau, peu d\'arbres'],
            ['Marais', 'Herbe', 'Terre', 'Arbres tordus, mousse, lianes'],
            ['Toundra', 'Herbe enneigée', 'Terre', 'Pins, neige'],
          ],
        },
      },
      {
        title: 'Génération',
        paragraphs: [
          'Chunks de 50×150 blocs. Biomes mélangés par poids selon la position. Montagnes : amplitude ×8. Océans : amplitude ×0,1.',
        ],
      },
    ],
    seeAlso: ['blocs-terrain', 'dimension-overworld'],
  },

  // ─── DIMENSIONS ───
  {
    id: 'dimension-overworld',
    title: 'Overworld',
    category: 'dimensions',
    summary: 'Dimension principale — monde procédural avec les 7 biomes.',
    sections: [
      {
        title: 'Description',
        paragraphs: [
          'Monde par défaut à la création. Seed personnalisable, sauvegarde par monde dans user://worlds/. Modes : Survie, Créatif, Spectateur.',
        ],
      },
    ],
    seeAlso: ['biomes', 'dimension-shadow'],
  },
  {
    id: 'dimension-shadow',
    title: 'Dimension Shadow',
    category: 'dimensions',
    summary: 'Dimension parallèle accessible via le portail ombragé.',
    infobox: {
      icon: '🌑',
      rows: [
        { label: 'Accès', value: 'Portail ombragé' },
        { label: 'Seed', value: 'Seed XOR 0x5BAD0FFF' },
        { label: 'Spawn', value: '(0, -100)' },
      ],
    },
    sections: [
      {
        title: 'Traversée',
        paragraphs: [
          'Craft et pose un portail ombragé. En le traversant, le joueur est téléporté en dimension Shadow ; la position Overworld est mémorisée pour le retour.',
        ],
      },
      {
        title: 'Contenu',
        paragraphs: [
          'Blocs ombragés, donjons, piédestal du boss et Shadow Boss. Pierre ombragée (deepstone) aussi présente en profondeur dans l\'Overworld.',
        ],
      },
    ],
    seeAlso: ['blocs-shadow', 'mob-shadow-boss'],
  },

  // ─── FABRICATION ───
  {
    id: 'craft',
    title: 'Craft',
    category: 'fabrication',
    summary: 'Fabrication à la main et à la table d\'assemblage.',
    sections: [
      {
        title: 'Stations',
        table: {
          headers: ['Station', 'Accès', 'Exemples'],
          rows: [
            ['Main', 'Menu survie (E)', 'Planches, bâtons, outils bois, torches, coffre'],
            ['Table d\'assemblage', 'Bloc interactif', 'Outils pierre/fer/rubis, portail, jetpack, chaudron'],
            ['Tailleur de pierre', 'Bloc burin', 'Variantes pierre (1:1)'],
            ['Four', 'Bloc four', 'Fusion minerais'],
            ['Chaudron', 'Bloc chaudron', 'Potions'],
          ],
        },
      },
      {
        title: 'Catégories de recettes',
        list: ['Matériaux', 'Outils', 'Structures', 'Décoration', 'Équipement'],
      },
      {
        title: 'Tags d\'ingrédients',
        paragraphs: ['#planks, #logs, #sticks acceptent n\'importe quelle variante de bois. #coal_ores etc. regroupent roche et grès.'],
      },
    ],
    seeAlso: ['four-fusion', 'chaudron', 'outils'],
  },
  {
    id: 'four-fusion',
    title: 'Fusion (four)',
    category: 'fabrication',
    summary: 'Conversion des minerais en matériaux raffinés.',
    sections: [
      {
        title: 'Recettes',
        table: {
          headers: ['Entrée', 'Sortie'],
          rows: [
            ['Minerai de charbon (×1)', 'Charbon ×1'],
            ['Minerai de fer (×1)', 'Lingot de fer ×1'],
            ['Minerai de rubis (×1)', 'Rubis ×1'],
            ['Minerai de saphir (×1)', 'Saphir ×1'],
            ['Minerai d\'émeraude (×1)', 'Émeraude ×1'],
            ['Minerai du vide (×1)', 'Lingot du vide ×1'],
          ],
        },
      },
    ],
    seeAlso: ['four', 'blocs-minerais'],
  },
  {
    id: 'chaudron',
    title: 'Chaudron',
    category: 'fabrication',
    summary: 'Station alchimique pour les potions.',
    infobox: {
      rows: [
        { label: 'Craft', value: '5 lingots de fer (table d\'assemblage)' },
        { label: 'Recettes', value: '8 potions' },
      ],
    },
    sections: [
      {
        title: 'Utilisation',
        paragraphs: ['Interagir avec le bloc chaudron. Sélectionner une recette, vérifier les ingrédients en inventaire, puis brasser.'],
      },
    ],
    seeAlso: ['objets-potions'],
  },
  {
    id: 'tailleur-pierre',
    title: 'Tailleur de pierre',
    category: 'fabrication',
    summary: 'Convertit la pierre en variantes décoratives.',
    sections: [
      {
        title: 'Conversions (1:1)',
        list: ['Pierre → pierre lisse', 'Pierre → briques de pierre', 'Pierre → dalles de pierre', 'Pierre → pierre taillée'],
      },
    ],
    seeAlso: ['blocs-pierre'],
  },

  // ─── MÉCANIQUES ───
  {
    id: 'mecanique-eau',
    title: 'Eau',
    category: 'mecaniques',
    summary: 'Physique fluide : propagation, sources et lacs.',
    sections: [
      {
        title: 'Règles',
        list: [
          'Portée horizontale max. : 4 blocs depuis une source',
          'Sources infinies : seau d\'eau posé',
          'Eau statique : lacs générés à la création du chunk',
          'Tick physique : ~0,18 s, max 20 mises à jour / tick',
          'Remplace herbe courte et fleurs au placement',
        ],
      },
    ],
    seeAlso: ['blocs-fluides', 'objets-seaux'],
  },
  {
    id: 'mecanique-eclairage',
    title: 'Éclairage',
    category: 'mecaniques',
    summary: 'Système jour/nuit + lumière des blocs (BFS).',
    sections: [
      {
        title: 'Sources',
        list: [
          'Luminosité solaire selon la phase du cycle jour/nuit',
          'Torches, four, lave — propagation en cases d\'air',
          'Recalcul à la pose / casse de blocs lumineux',
          'Option désactivable dans les paramètres',
        ],
      },
    ],
    seeAlso: ['torche', 'mecanique-jour-nuit'],
  },
  {
    id: 'mecanique-jour-nuit',
    title: 'Cycle jour / nuit',
    category: 'mecaniques',
    summary: '20 minutes réelles = 1 jour complet.',
    sections: [
      {
        title: 'Effets',
        list: [
          'Nuit : luminosité faible, spawn de zombies en Survie',
          'Horloge affichable (objet + HUD debug)',
          'Succès « Survivant » : tenir une nuit entière',
        ],
      },
    ],
    seeAlso: ['mob-zombie', 'mecanique-eclairage'],
  },
  {
    id: 'mecanique-donjons',
    title: 'Donjons',
    category: 'mecaniques',
    summary: 'Structures souterraines générées procéduralement.',
    sections: [
      {
        title: 'Génération',
        list: [
          '~15 % de chance par chunk',
          'Layouts : Classic, Hall, Suite, Crypt',
          'Contenu : torches, coffres, pierre moussue, parfois piédestal boss',
          'Murs en briques de pierre, sol en pierre lisse',
        ],
      },
    ],
    seeAlso: ['blocs-pierre', 'mob-shadow-boss'],
  },
  {
    id: 'mecanique-convoyeur',
    title: 'Tapis roulant',
    category: 'mecaniques',
    summary: 'Bloc qui pousse joueurs et mobs.',
    infobox: {
      rows: [
        { label: 'Vitesse', value: '120 u/s (impulsion)' },
        { label: 'Craft', value: '3 fer + 2 cordes → 4' },
      ],
    },
    sections: [
      {
        title: 'Fonctionnement',
        paragraphs: ['Toute entité sur la tuile convoyeur reçoit une impulsion horizontale. Tag bloc : conveyor.'],
      },
    ],
    seeAlso: ['blocs-structures', 'craft'],
  },

  // ─── SUCCÈS ───
  {
    id: 'succes',
    title: 'Succès',
    category: 'succes',
    summary: '13 succès persistés par monde, organisés en arbre.',
    sections: [
      {
        title: 'Liste',
        table: {
          headers: ['Succès', 'Condition', 'Prérequis'],
          rows: [
            ['Premier coup', 'Casser un bloc', '—'],
            ['Constructeur', 'Placer un bloc', 'Premier coup'],
            ['Clair de lune', 'Placer une torche', 'Constructeur'],
            ['Source de vie', 'Verser de l\'eau', 'Clair de lune'],
            ['Établi', 'Ouvrir table d\'assemblage', 'Constructeur'],
            ['Artisan', 'Fabriquer un objet', 'Établi'],
            ['Chaleur', 'Ouvrir un four', 'Artisan'],
            ['Fondue', 'Fondre un minerai', 'Chaleur'],
            ['Forgeron', 'Obtenir lingot de fer', 'Fondue'],
            ['Survivant', 'Survivre une nuit', 'Premier coup'],
            ['Mémoire', 'Sauvegarder', 'Survivant'],
            ['L\'ombre s\'éveille', 'Invoquer Shadow Boss', 'Survivant'],
            ['Chasseur d\'ombres', 'Vaincre Shadow Boss', 'L\'ombre s\'éveille'],
          ],
        },
      },
    ],
    seeAlso: ['mob-shadow-boss', 'craft'],
  },

  // ─── MULTIJOUEUR ───
  {
    id: 'multijoueur',
    title: 'Multijoueur',
    category: 'multijoueur',
    summary: 'Jouer en ligne via PM_Server et le navigateur de serveurs.',
    sections: [
      {
        title: 'Connexion',
        list: [
          'Menu principal → MULTIJOUEUR → navigateur de serveurs',
          'Serveur officiel par défaut : 127.0.0.1:8765',
          'Pseudo max 24 caractères (sauvegardé localement)',
          'Le serveur impose seed, mode de jeu et difficulté',
        ],
      },
      {
        title: 'Synchronisé',
        list: [
          'Positions des joueurs (~20 updates/s)',
          'Placement et destruction de blocs',
          'Chat textuel',
          'Métadonnées monde (seed, gamemode, difficulty)',
        ],
      },
      {
        title: 'Non synchronisé (Phase 7)',
        list: [
          'Inventaire individuel',
          'Coffres, fourneaux, crafts',
          'Mobs et combats',
          'Changements de dimension',
        ],
      },
    ],
    seeAlso: ['pm-server', 'chat-multijoueur'],
  },
  {
    id: 'pm-server',
    title: 'PM_Server',
    category: 'multijoueur',
    summary: 'Serveur Node.js officiel — port 8765, sans persistance.',
    infobox: {
      icon: '🖥️',
      rows: [
        { label: 'Version', value: '0.10.0-Snap1' },
        { label: 'Port', value: '8765 (HTTP + WS)' },
        { label: 'Max joueurs', value: '20 (configurable)' },
        { label: 'Prérequis', value: 'Node.js 18+' },
      ],
    },
    sections: [
      {
        title: 'Installation',
        paragraphs: ['Dans le dossier PM_Server : npm install puis npm start. Configuration via config.json.'],
      },
      {
        title: 'config.json',
        table: {
          headers: ['Paramètre', 'Défaut', 'Description'],
          rows: [
            ['name', 'Serveur Officiel', 'Nom affiché'],
            ['motd', 'Bienvenue !…', 'Message du jour'],
            ['port', '8765', 'Port réseau'],
            ['max_players', '20', 'Limite connexions'],
            ['gamemode', 'Creative', 'Creative / Survival / Spectator'],
            ['difficulty', 'Medium', 'Easy / Medium / Hard'],
            ['seed', '42424242', 'Graine partagée'],
          ],
        },
      },
      {
        title: 'API REST',
        list: ['GET /api/status — infos pour le navigateur', 'GET /api/ping — test disponibilité'],
      },
      {
        title: 'Limitations',
        list: [
          'Aucune persistance : redémarrage = monde reset',
          'Pas de commandes admin (/kick, /ban…)',
          'Pas d\'authentification — pseudo libre',
        ],
      },
    ],
    seeAlso: ['multijoueur', 'chat-multijoueur'],
  },
  {
    id: 'chat-multijoueur',
    title: 'Chat multijoueur',
    category: 'multijoueur',
    summary: 'Communication textuelle en session en ligne.',
    infobox: {
      rows: [
        { label: 'Touche', value: 'T (configurable)' },
        { label: 'Limite', value: '256 caractères / message' },
        { label: 'Historique', value: '100 messages max' },
      ],
    },
    sections: [
      {
        title: 'Utilisation',
        list: [
          'T ouvre la saisie ; Échap ferme',
          'Bulles de dialogue au-dessus des personnages (4 s)',
          'Bloque inventaire et menus pendant la saisie',
        ],
      },
      {
        title: 'Protocole',
        paragraphs: ['Message client : { type: "chat", text: "..." }. Diffusé à tous via { type: "chat", name, text }.'],
      },
    ],
    seeAlso: ['multijoueur', 'pm-server'],
  },
]

export const wikiArticleMap = new Map(wikiArticles.map(a => [a.id, a]))

export function getWikiArticle(id: string) {
  return wikiArticleMap.get(id)
}

export function searchWikiArticles(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return wikiArticles.filter(a => {
    const haystack = [
      a.title,
      a.summary,
      a.subcategory ?? '',
      a.category,
      ...a.sections.flatMap(s => [
        s.title,
        ...(s.paragraphs ?? []),
        ...(s.list ?? []),
        ...(s.table?.rows.flat() ?? []),
      ]),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}
