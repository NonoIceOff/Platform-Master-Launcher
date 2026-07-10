import type { WikiArticle } from './types'

export const wikiArticles: WikiArticle[] = [
  {
    id: 'accueil',
    title: 'Wiki Platform Master',
    category: 'accueil',
    summary:
      'Encyclopédie officielle du jeu — blocs, objets, mobs, enchantements, biomes et multijoueur.',
    sections: [
      {
        title: 'Bienvenue',
        paragraphs: [
          "Bienvenue sur le Wiki Platform Master, l'encyclopédie dédiée au sandbox 2D Platform Master (moteur Godot). Ce wiki recense le contenu du jeu tel qu'implémenté dans le dépôt platform-master et le serveur multijoueur PM_Server.",
          'Utilisez la barre de recherche ou la navigation à gauche pour parcourir les articles. Les tableaux reprennent les données réelles du jeu : outils requis, tiers de pioche, recettes, statistiques des mobs et paramètres de génération.'
        ]
      },
      {
        title: 'Le jeu en chiffres',
        table: {
          headers: ['Élément', 'Total', 'Détail'],
          rows: [
            ['Blocs', '111', 'Terrain, minerais, 7 bois, pierre, végétation, structures'],
            ['Objets', '44', 'Matériaux, seaux, 9 potions, équipement, 6 épées'],
            ['Outils', '18', '3 types × 6 tiers, enchantables'],
            ['Enchantements', '2', 'Efficacité (I-III), Fortune (I-III)'],
            ['Mobs', '5', 'Zombie, mouton, lapin, abeille, Shadow Boss'],
            ['Biomes', '13', 'Générés par bruit de Voronoï'],
            ['Dimensions', '2', 'Overworld & Shadow'],
            ['Succès', '13', 'Persistés par monde, en arbre']
          ]
        }
      },
      {
        title: 'Catégories principales',
        list: [
          'Blocs — 111 types : terrain, minerais, bois, pierre, décoration, végétation, structures…',
          'Objets — matériaux, seaux, potions, équipement et épées',
          'Outils — 6 tiers (bois → pierre → fer → rubis → saphir → émeraude), enchantables',
          'Enchantement — table dédiée, effet de glint, Efficacité et Fortune',
          'Mobs — zombies, moutons, lapins, abeilles et le Shadow Boss',
          'Biomes — 13 biomes procéduraux, de la savane aux badlands',
          'Dimensions — Overworld, dimension Shadow, types de monde',
          "Fabrication — craft main, table d'assemblage, four, chaudron, tailleur de pierre",
          'Multijoueur — PM_Server, chat et synchronisation réseau'
        ]
      },
      {
        title: 'Nouveautés récentes',
        list: [
          "Système d'enchantement complet : table dédiée, effet de glint scintillant, Efficacité et Fortune",
          'Blocs de décoration en pierre : briques ciselées, fissurées, moussues et pilier',
          'Nouveaux biomes : Landes, Savane, Pins géants, Badlands et Jungle',
          'Nouveau mob passif : le lapin (biome Landes)'
        ]
      },
      {
        title: 'Version de référence',
        paragraphs: [
          'Contenu basé sur Platform Master 0.10.0-Snap3 (Godot) et PM_Server 0.10.0-Snap1. Certaines potions ou mécaniques sont partiellement implémentées — consultez les articles concernés pour le détail.'
        ]
      }
    ],
    seeAlso: ['blocs-terrain', 'enchantement', 'biomes', 'craft']
  },

  // ─── BLOCS ───
  {
    id: 'blocs-terrain',
    title: 'Blocs de terrain',
    category: 'blocs',
    subcategory: 'Terrain',
    summary: 'Couches de surface : herbe, terre, sable, boue, argile et neige.',
    infobox: {
      icon: '🌍',
      title: 'Terrain',
      rows: [
        { label: 'Outil', value: 'Pelle (tier 0+)' },
        { label: 'Biomes', value: 'Tous selon la surface' }
      ]
    },
    sections: [
      {
        title: 'Description',
        paragraphs: [
          'Les blocs de terrain forment la croûte du monde. Chaque biome choisit sa tuile de surface et de sous-surface via le générateur ; la plupart se creusent à la pelle dès le tier 0 (main ou bois).'
        ]
      },
      {
        title: 'Liste des blocs',
        table: {
          headers: ['Bloc', 'ID', 'Durabilité', 'Biome / surface'],
          rows: [
            ["Bloc d'herbe", '0', '0,35', 'Plaines, forêt, montagnes'],
            ['Terre', '1', '0,40', 'Sous-surface universelle'],
            ['Herbe courte', '23', '0,35', 'Décoration de surface'],
            ['Sable', '11', '0,30', 'Désert, océan, plage'],
            ['Herbe enneigée', '39', '0,35', 'Toundra'],
            ['Bloc de neige', '40', '0,35', 'Sommets, toundra'],
            ['Herbe de savane', '77', '0,35', 'Savane'],
            ['Bloc de bruyère', '73', '0,35', 'Landes'],
            ['Boue', '85', '0,30', 'Marais'],
            ["Bloc d'argile", '48', '0,55', 'Souterrain, berges'],
            ['Argile rouge / jaune / blanche', '82–84', '0,55', 'Badlands']
          ]
        }
      }
    ],
    seeAlso: ['biomes', 'blocs-vegetation', 'blocs-desert', 'outils']
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
        { label: 'Bonus', value: 'Fortune / potion' }
      ]
    },
    sections: [
      {
        title: 'Description',
        paragraphs: [
          'Les minerais apparaissent en profondeur via le générateur de grottes. En biome désert, des variantes en grès remplacent la roche normale. Chaque filon exige un tier de pioche minimum ; un tier insuffisant casse le bloc sans rien lâcher.',
          "L'enchantement Fortune sur la pioche et la potion de fortune augmentent la chance de double drop sur tous les minerais."
        ]
      },
      {
        title: 'Minerais en roche',
        table: {
          headers: ['Minerai', 'ID', 'Tier pioche', 'Fusion →'],
          rows: [
            ['Charbon', '5', '1 (bois)', 'Charbon'],
            ['Fer', '6', '2 (pierre)', 'Lingot de fer'],
            ['Rubis', '7', '3 (fer)', 'Rubis'],
            ['Émeraude', '8', '5 (saphir)', 'Émeraude'],
            ['Minerai du vide', '9', '5', 'Lingot du vide'],
            ['Saphir', '10', '4 (rubis)', 'Saphir']
          ]
        }
      },
      {
        title: 'Variantes grès (désert)',
        paragraphs: [
          'IDs 13 à 18. Mêmes tiers et fusions : grès charbon, fer, rubis, émeraude, vide et saphir. Le four accepte roche et grès indifféremment via les tags #coal_ores, #iron_ores, etc.'
        ]
      }
    ],
    seeAlso: ['four-fusion', 'outils', 'enchant-fortune', 'mecanique-minage']
  },
  {
    id: 'blocs-bois',
    title: 'Bois',
    category: 'blocs',
    subcategory: 'Bois',
    summary: 'Sept essences : chêne, bouleau, pin, peuplier, acacia, baobab et jungle.',
    infobox: {
      icon: '🌳',
      title: 'Bois',
      rows: [
        { label: 'Outil', value: 'Hache tier 0+' },
        { label: 'Essences', value: '7' }
      ]
    },
    sections: [
      {
        title: 'Essences',
        table: {
          headers: ['Essence', 'Bûche', 'Planches', 'Feuilles', 'Biome'],
          rows: [
            ['Chêne', '3', '43', '4', 'Plaines, forêt'],
            ['Bouleau', '44', '45', '70', 'Forêt'],
            ['Pin', '46', '47', '71', 'Montagnes, toundra'],
            ['Peuplier', '68', '69', '72', 'Plaines'],
            ['Acacia', '79', '80', '81', 'Savane'],
            ['Baobab', '87', '88', '89', 'Savane'],
            ['Jungle', '104', '105', '106', 'Jungle']
          ]
        }
      },
      {
        title: 'Dérivés craftables',
        list: [
          '1 bûche → 4 planches (craft main)',
          '2 planches → 4 bâtons',
          "Table d'assemblage : 4 bâtons + 4 planches",
          'Coffre : 8 planches',
          'Les tags #logs et #planks acceptent chêne, bouleau, pin, peuplier, baobab et jungle'
        ]
      },
      {
        title: 'Génération',
        paragraphs: [
          "La végétation procédurale choisit l'essence selon le biome : chêne/peuplier en plaine, bouleau en forêt, pin en montagne, toundra et pins géants, acacia et baobab en savane, arbres de jungle denses en jungle."
        ]
      }
    ],
    seeAlso: ['craft', 'biomes', 'blocs-vegetation']
  },
  {
    id: 'blocs-pierre',
    title: 'Pierre & roche',
    category: 'blocs',
    subcategory: 'Pierre',
    summary: 'Roche de base, pierre taillée, briques, granit et deepstone ombragée.',
    infobox: { icon: '🪨', title: 'Pierre', rows: [{ label: 'Outil', value: 'Pioche tier 1+' }] },
    sections: [
      {
        title: 'Types de pierre',
        table: {
          headers: ['Bloc', 'ID', 'Obtention'],
          rows: [
            ['Pierre', '2', 'Sous-sol, montagnes'],
            ['Pierre taillée (cobblestone)', '21', 'Craft (1 pierre → 2)'],
            ['Pierre lisse', '24', 'Tailleur de pierre'],
            ['Briques de pierre', '25', 'Tailleur / craft (4 pierre → 4)'],
            ['Dalles de pierre', '26', 'Tailleur de pierre'],
            ['Granit', '75', 'Génération souterraine'],
            ['Pierre moussue', '41', 'Donjons, marais'],
            ['Lianes', '42', 'Marais, grottes'],
            ['Pierre ombragée (deepstone)', '27', 'Profondeur > 80 blocs'],
            ['Void Stone', '32', 'Profondeurs (durabilité 100)']
          ]
        }
      },
      {
        title: 'Profondeur',
        paragraphs: [
          'À partir de mid_stone_depth (~50) la roche domine. Au-delà de deepstone_depth (~80), la pierre ombragée remplace la pierre classique dans les grottes. Le Void Stone (durabilité 100) résiste presque indéfiniment.'
        ]
      }
    ],
    seeAlso: ['blocs-decoration', 'tailleur-pierre', 'mecanique-donjons', 'blocs-shadow']
  },
  {
    id: 'blocs-decoration',
    title: 'Décoration en pierre',
    category: 'blocs',
    subcategory: 'Décoration',
    summary: 'Briques ciselées, fissurées, moussues et pilier — bâtir avec style.',
    infobox: {
      icon: '🏛️',
      title: 'Décoration',
      rows: [
        { label: 'Outil', value: 'Pioche tier 1+' },
        { label: 'Station', value: "Table d'assemblage" },
        { label: 'Base', value: 'Briques de pierre' }
      ]
    },
    sections: [
      {
        title: 'Description',
        paragraphs: [
          'Une famille de blocs purement décoratifs dérivés des briques de pierre, pensés pour la construction : temples, ruines, colonnades. Tous se creusent à la pioche (tier 1) comme la pierre classique.'
        ]
      },
      {
        title: 'Blocs & recettes',
        table: {
          headers: ['Bloc', 'ID', "Recette (table d'assemblage)"],
          rows: [
            ['Briques de pierre', '25', '4 pierre → 4 briques'],
            ['Briques ciselées', '107', '2 briques → 1'],
            ['Briques fissurées', '108', '1 brique → 1'],
            ['Briques moussues', '109', '1 brique + 1 liane → 1'],
            ['Pilier de pierre', '110', '2 briques → 2']
          ]
        }
      },
      {
        title: 'Astuce',
        paragraphs: [
          "Les briques moussues réutilisent les lianes récoltées en marais ou en grotte. Le pilier s'aligne verticalement pour composer des colonnes ; alternez avec les briques ciselées pour un rendu de temple."
        ]
      }
    ],
    seeAlso: ['blocs-pierre', 'craft', 'blocs-structures']
  },
  {
    id: 'blocs-desert',
    title: 'Désert & Badlands',
    category: 'blocs',
    subcategory: 'Aride',
    summary: 'Sable, grès, cactus, argiles colorées et buissons morts.',
    sections: [
      {
        title: 'Blocs',
        table: {
          headers: ['Bloc', 'ID', 'Outil', 'Notes'],
          rows: [
            ['Sable', '11', 'Pelle 0', 'Surface du désert'],
            ['Grès', '12', 'Pioche 1', 'Sous-surface désert'],
            ['Briques / dalles de grès', '55–56', 'Pioche 1', 'Décoration'],
            ['Cactus', '19', 'Hache 0', 'Végétation désert'],
            ['Minerais en grès', '13–18', 'Pioche 1–5', 'Variantes désertiques'],
            ['Argile rouge / jaune / blanche', '82–84', 'Pelle 0', 'Strates des Badlands'],
            ['Buisson mort', '93', 'Main', 'Désert & badlands']
          ]
        }
      },
      {
        title: 'Badlands',
        paragraphs: [
          "Le biome Badlands empile des strates d'argile rouge (surface) et jaune (sous-sol), amplitude de relief élevée (×2,2), sans arbres. Buissons morts épars."
        ]
      }
    ],
    seeAlso: ['biomes-arides', 'blocs-minerais', 'blocs-vegetation']
  },
  {
    id: 'blocs-vegetation',
    title: 'Végétation & décor naturel',
    category: 'blocs',
    subcategory: 'Végétation',
    summary: 'Fleurs, champignons, fougères, coraux et plantes de biome.',
    infobox: {
      icon: '🌿',
      rows: [
        { label: 'Outil', value: 'Main (récolte)' },
        { label: 'Durabilité', value: '0,10 (typique)' }
      ]
    },
    sections: [
      {
        title: 'Plantes de surface',
        table: {
          headers: ['Bloc', 'ID', 'Biome'],
          rows: [
            ['Tulipe rose', '50', 'Plaines, forêt'],
            ['Tulipe rouge', '51', 'Plaines, forêt'],
            ['Rose', '52', 'Plaines, forêt'],
            ['Fougère', '102', 'Forêt, jungle'],
            ['Champignon rouge / brun', '100–101', 'Forêt, marais, jungle'],
            ['Grande feuille', '103', 'Jungle'],
            ['Bruyère', '74', 'Landes'],
            ['Fleur tinctoriale', '76', 'Landes (→ teinture violette)'],
            ['Haute herbe jaune', '78', 'Savane'],
            ['Herbe des marais', '86', 'Marais']
          ]
        }
      },
      {
        title: 'Décor aquatique & rocheux',
        table: {
          headers: ['Bloc', 'ID', 'Emplacement'],
          rows: [
            ['Corail', '94', 'Océan (fond)'],
            ['Algue', '95', 'Océan'],
            ['Coquillage', '96', 'Plage, océan'],
            ['Rocher', '97', 'Montagnes, plage'],
            ['Bloc à papillons', '90', 'Décoratif (particules)']
          ]
        }
      },
      {
        title: 'Biomes froids',
        table: {
          headers: ['Bloc', 'ID', 'Biome'],
          rows: [
            ['Glace', '98', 'Toundra, lacs gelés'],
            ['Buisson givré', '99', 'Toundra']
          ]
        }
      },
      {
        title: 'Note',
        paragraphs: [
          'La plupart des plantes se récoltent à la main et se replacent librement. Le bloc à papillons émet un nuage de particules persistant géré par le MothParticleManager. La fleur tinctoriale lâche de la teinture violette à la casse.'
        ]
      }
    ],
    seeAlso: ['biomes', 'blocs-terrain', 'blocs-fluides']
  },
  {
    id: 'blocs-fluides',
    title: 'Fluides & lave',
    category: 'blocs',
    subcategory: 'Fluides',
    summary: 'Eau, lave et obsidienne — tuiles fluides avec physique dédiée.',
    sections: [
      {
        title: 'Eau',
        paragraphs: [
          "Tuile ID 20. Propagation horizontale (~4 blocs), sources infinies via seau, lacs statiques en génération. Voir l'article Eau pour la physique complète."
        ]
      },
      {
        title: 'Lave',
        paragraphs: [
          'Tuile ID 91. Transportable en seau de lave ou seau de magma. Textures de flux vertical (lava_up / lava_down). Émet une lumière intense et inflige des dégâts au contact.'
        ]
      },
      {
        title: 'Obsidienne',
        table: {
          headers: ['Propriété', 'Valeur'],
          rows: [
            ['ID', '92'],
            ['Durabilité', '3,50 (très résistant)'],
            ['Outil', 'Pioche tier 6 (émeraude)'],
            ['Formation', 'Contact lave / eau'],
            ['Usage', "Table d'enchantement"]
          ]
        }
      }
    ],
    seeAlso: ['mecanique-eau', 'objets-seaux', 'table-enchantement']
  },
  {
    id: 'blocs-structures',
    title: 'Structures & blocs interactifs',
    category: 'blocs',
    subcategory: 'Structures',
    summary: 'Blocs fonctionnels : craft, stockage, transport, enchantement et spawn.',
    sections: [
      {
        title: 'Liste',
        table: {
          headers: ['Bloc', 'Fonction', 'Craft'],
          rows: [
            ["Table d'assemblage", 'Craft avancé', '4 bâtons + 4 planches'],
            ['Tailleur de pierre', 'Variantes de pierre', 'Craft (8 pierre + 1 fer)'],
            ['Four', 'Fusion de minerais', 'Génération / créatif'],
            ['Chaudron', 'Potions', '5 lingots de fer (table)'],
            [
              "Table d'enchantement",
              'Enchanter les outils',
              '2 obsidienne + 4 briques + 4 émeraude'
            ],
            ['Coffre', 'Stockage 27 slots', '8 planches'],
            ['Enclume', '—', '—'],
            ['Ruche', 'Abeilles / miel', '—'],
            ['Tapis roulant', 'Transport entités', '3 fer + 2 cordes → ×4'],
            ['Spawner (zombie / mouton / abeille)', 'Spawn mobs', 'Craft table (4 fer + 1 os)'],
            ['Verre', 'Transparent', 'Fusion de sable']
          ]
        }
      }
    ],
    seeAlso: ['craft', 'table-enchantement', 'chaudron', 'mecanique-convoyeur']
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
          headers: ['Bloc', 'ID', 'Tier', 'Usage'],
          rows: [
            ['Herbe ombragée', '57', '0', 'Surface Shadow'],
            ['Terre ombragée', '58', '0', 'Sous-sol Shadow'],
            ['Bûche ombragée', '59', '0', 'Bois Shadow'],
            ['Pierre ombragée & variantes', '27–31', '1', 'Construction, donjons'],
            ['Portail ombragé', '60', '5', 'Traversée dimensionnelle'],
            ['Piédestal du boss', '61', '5', 'Invoque le Shadow Boss']
          ]
        }
      },
      {
        title: 'Portail ombragé',
        paragraphs: [
          "Craft table d'assemblage : 8 pierre ombragée + 2 lingots du vide → 1 portail."
        ]
      }
    ],
    seeAlso: ['dimension-shadow', 'mob-shadow-boss']
  },
  {
    id: 'torche',
    title: 'Torche',
    category: 'blocs',
    summary: 'Source de lumière portable, craftable dès le début.',
    infobox: {
      icon: '🔥',
      rows: [
        { label: 'ID', value: '54' },
        { label: 'Craft', value: '1 bâton + 1 charbon → 4' },
        { label: 'Lumière', value: 'Élevée (BFS)' },
        { label: 'Durabilité', value: '0,10' }
      ]
    },
    sections: [
      {
        title: 'Utilisation',
        paragraphs: [
          "Les torches éclairent les grottes et repoussent l'obscurité via le système d'éclairage dynamique. Indispensables la nuit et en spéléologie. La lumière se recalcule (BFS) à chaque pose ou casse."
        ]
      }
    ],
    seeAlso: ['mecanique-eclairage', 'craft', 'succes']
  },
  {
    id: 'four',
    title: 'Four',
    category: 'blocs',
    summary: 'Structure interactive pour fondre les minerais.',
    infobox: {
      icon: '🔥',
      rows: [
        { label: 'ID', value: '38' },
        { label: 'Interaction', value: 'Clic sur le bloc' },
        { label: 'Recettes', value: '6 fusions de minerais' }
      ]
    },
    sections: [
      {
        title: 'Fonction',
        paragraphs: [
          'Ouvre le menu de fusion. Accepte tout minerai de charbon, fer, rubis, saphir, émeraude ou du vide (roche ou grès). Débloque le succès « Chaleur ».'
        ]
      }
    ],
    seeAlso: ['four-fusion', 'blocs-minerais']
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
          headers: ['Objet', 'ID', 'Source'],
          rows: [
            ['Bâton', '200', 'Craft planches'],
            ['Charbon', '202', 'Fusion minerai charbon'],
            ['Lingot de fer', '201', 'Fusion minerai fer'],
            ['Rubis', '206', 'Fusion minerai rubis'],
            ['Saphir', '207', 'Fusion minerai saphir'],
            ['Émeraude', '205', 'Fusion minerai émeraude'],
            ['Lingot du vide', '209', 'Fusion minerai du vide'],
            ['Corde / Ficelle', '203 / 212', 'Craft'],
            ['Fragment de verre', '208', 'Casse de verre'],
            ['Miel', '214', 'Ruches / abeilles'],
            ['Blé', '213', 'Récolte'],
            ['Nourriture', '215', 'Récolte / craft'],
            ['Os', '216', 'Associé aux zombies'],
            ['Teinture violette', '249', 'Fleur tinctoriale (Landes)']
          ]
        }
      },
      {
        title: "Rôle de l'émeraude",
        paragraphs: [
          "L'émeraude sert de monnaie d'enchantement : chaque enchantement à la table coûte 1 à 3 émeraudes selon le palier. Elle entre aussi dans la recette de la table d'enchantement (×4) et de la potion de portée."
        ]
      }
    ],
    seeAlso: ['four-fusion', 'craft', 'enchantement']
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
          headers: ['Seau', 'ID', 'Usage'],
          rows: [
            ['Seau vide', '217', 'Récupération de fluide'],
            ["Seau d'eau", '218', "Source infinie d'eau"],
            ['Seau de lave', '219', 'Placement de lave'],
            ['Seau de magma', '220', 'Variante lave']
          ]
        }
      }
    ],
    seeAlso: ['mecanique-eau', 'blocs-fluides']
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
            ['Vision nocturne', 'Fiole + Verre + Charbon', 'Éclaire les grottes']
          ]
        }
      },
      {
        title: 'Note',
        paragraphs: [
          "La potion d'attraction (attire les drops proches) est définie mais sans recette de chaudron active. La fiole vide n'a pas de recette craft documentée. La potion de fortune et l'enchantement Fortune se cumulent sur les minerais."
        ]
      }
    ],
    seeAlso: ['chaudron', 'enchant-fortune']
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
          headers: ['Objet', 'ID', 'Effet / usage'],
          rows: [
            ['Jetpack', '240', 'Vol avec carburant (100). Craft : 4 fer + 2 charbon + 2 cordes'],
            ['Jetpack fixé', '241', 'Variante équipée'],
            ['Parachute', '239', 'Ralentit la chute'],
            ['Sac à dos', '238', 'Stockage additionnel'],
            ['Marteau', '236', 'Outil spécial (2 bâtons + 2 fer)'],
            ['Horloge', '242', "Affiche l'heure du monde"],
            ['Couronne', '237', 'Associée au Shadow Boss']
          ]
        }
      }
    ],
    seeAlso: ['craft', 'mob-shadow-boss']
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
          headers: ['Épée', 'ID', 'Dégâts', 'Craft disponible'],
          rows: [
            ['Bois', '243', '2', 'Oui (2 planches + 1 bâton)'],
            ['Pierre', '244', '3', 'Oui (2 pierre taillée + 1 bâton)'],
            ['Fer', '245', '4', 'Oui (2 fer + 1 bâton)'],
            ['Rubis', '247', '5', 'Oui (2 rubis + 1 bâton)'],
            ['Saphir', '248', '6', 'Non'],
            ['Émeraude', '246', '7', 'Non']
          ]
        }
      }
    ],
    seeAlso: ['outils', 'mobs-apercu']
  },

  // ─── OUTILS ───
  {
    id: 'outils',
    title: 'Outils',
    category: 'outils',
    summary:
      'Pioches, haches et pelles — 6 tiers avec durabilité et vitesse variables, enchantables.',
    infobox: {
      icon: '⛏️',
      rows: [
        { label: 'Types', value: 'Pioche, hache, pelle' },
        { label: 'Tiers', value: '6 (bois → émeraude)' },
        { label: 'Enchantable', value: 'Oui (table)' },
        { label: 'Guide en jeu', value: 'Touche Tab' }
      ]
    },
    sections: [
      {
        title: 'Tiers',
        table: {
          headers: ['Tier', 'Matériau', "Casse les minerais jusqu'à"],
          rows: [
            ['0', 'Main', '—'],
            ['1', 'Bois', 'Charbon'],
            ['2', 'Pierre', 'Fer'],
            ['3', 'Fer', 'Rubis'],
            ['4', 'Rubis', 'Saphir'],
            ['5', 'Saphir', 'Émeraude / vide'],
            ['6', 'Émeraude', 'Tout (obsidienne)']
          ]
        }
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
            ['Émeraude', '400', '×0,2']
          ]
        }
      },
      {
        title: 'Craft',
        paragraphs: [
          'Outils bois → pierre → fer → rubis craftables. Saphir et émeraude : définis mais sans recette craft actuelle.',
          "Recettes type pioche : 2 bâtons + 3 matériau (pelle : 1 matériau). Station : main (bois) ou table d'assemblage (pierre+)."
        ]
      },
      {
        title: 'Enchantement',
        paragraphs: [
          "Tous les outils sont enchantables à la table d'enchantement. Efficacité accélère le minage ; Fortune (pioche uniquement) améliore les drops de minerais. Un outil enchanté arbore un effet de glint scintillant."
        ]
      }
    ],
    seeAlso: ['enchantement', 'blocs-minerais', 'mecanique-minage', 'craft']
  },

  // ─── ENCHANTEMENT ───
  {
    id: 'enchantement',
    title: "Système d'enchantement",
    category: 'enchantement',
    summary: "Renforcez vos outils avec des émeraudes à la table d'enchantement.",
    infobox: {
      icon: '✨',
      title: 'Enchantement',
      rows: [
        { label: 'Station', value: "Table d'enchantement" },
        { label: 'Monnaie', value: 'Émeraude' },
        { label: 'Enchantements', value: '2 (Efficacité, Fortune)' },
        { label: 'Niveaux', value: 'I à III' }
      ]
    },
    sections: [
      {
        title: 'Principe',
        paragraphs: [
          "L'enchantement renforce un outil (pioche, hache ou pelle) en lui greffant un pouvoir. Un outil enchanté devient un objet distinct, reconnaissable à son effet de glint scintillant et à son nom suffixé (ex. « Pioche en fer (Efficacité II) »).",
          "Techniquement, un outil enchanté est un identifiant composite résolu à la volée — le jeu n'a pas besoin d'une entrée séparée par combinaison de tier, d'enchantement et de niveau."
        ]
      },
      {
        title: 'Déroulé',
        list: [
          "Fabriquez et posez une table d'enchantement",
          'Faites un clic droit dessus pour ouvrir le menu',
          'Sélectionnez un outil enchantable de votre inventaire',
          'Choisissez un palier : Faible (1 émeraude), Moyen (2), Fort (3)',
          "L'enchantement et son niveau sont tirés aléatoirement selon le palier"
        ]
      },
      {
        title: 'Paliers & niveaux',
        table: {
          headers: ['Palier', 'Coût', 'Niveau obtenu'],
          rows: [
            ['Faible', '1 émeraude', 'I'],
            ['Moyen', '2 émeraudes', 'I à II'],
            ['Fort', '3 émeraudes', 'II à III']
          ]
        }
      },
      {
        title: 'Enchantements disponibles',
        table: {
          headers: ['Enchantement', "S'applique à", 'Effet par niveau'],
          rows: [
            ['Efficacité', 'Pioche, hache, pelle', 'Minage ×0,8 plus rapide / niveau'],
            ['Fortune', 'Pioche', '+15 % de double drop de minerai / niveau']
          ]
        }
      },
      {
        title: 'Effet de glint',
        paragraphs: [
          "Les outils enchantés affichent un scintillement animé (glint) : une bande lumineuse violette qui balaie l'icône, calquée sur l'alpha de l'outil. Il apparaît dans la barre rapide, sur le curseur de l'inventaire et dans la liste de la table d'enchantement."
        ]
      }
    ],
    seeAlso: ['table-enchantement', 'enchant-efficacite', 'enchant-fortune', 'outils']
  },
  {
    id: 'table-enchantement',
    title: "Table d'enchantement",
    category: 'enchantement',
    summary: 'Station qui enchante les outils contre des émeraudes.',
    infobox: {
      icon: '📗',
      title: "Table d'enchantement",
      rows: [
        { label: 'ID bloc', value: '111' },
        { label: 'Craft', value: '2 obsidienne + 4 briques + 4 émeraude' },
        { label: 'Station', value: "Table d'assemblage" },
        { label: 'Interaction', value: 'Clic droit' },
        { label: 'Durabilité', value: '100' }
      ]
    },
    sections: [
      {
        title: 'Fabrication',
        paragraphs: [
          "La table se fabrique à la table d'assemblage : 2 obsidienne + 4 briques de pierre + 4 émeraudes → 1 table d'enchantement. L'obsidienne (pioche émeraude requise) et les émeraudes en font un objectif de milieu / fin de partie."
        ]
      },
      {
        title: 'Interface',
        list: [
          'Colonne de gauche : vos outils enchantables (avec glint si déjà enchantés)',
          'Panneau de droite : outil sélectionné, enchantement actuel, émeraudes disponibles',
          'Trois boutons de palier (Faible / Moyen / Fort) activés selon vos émeraudes',
          'E ou Échap pour fermer'
        ]
      },
      {
        title: 'Bon à savoir',
        paragraphs: [
          "Enchanter consomme l'outil de base et les émeraudes, puis rend l'outil enchanté équivalent. Ré-enchanter un outil déjà enchanté remplace son enchantement par le nouveau tirage."
        ]
      }
    ],
    seeAlso: ['enchantement', 'blocs-fluides', 'objets-materiaux', 'craft']
  },
  {
    id: 'enchant-efficacite',
    title: 'Efficacité',
    category: 'enchantement',
    summary: 'Accélère la vitesse de minage. Niveaux I à III.',
    infobox: {
      icon: '⚡',
      title: 'Efficacité',
      rows: [
        { label: 'Outils', value: 'Pioche, hache, pelle' },
        { label: 'Niveau max', value: 'III' },
        { label: 'Effet', value: '×0,8 temps de casse / niveau' }
      ]
    },
    sections: [
      {
        title: 'Effet',
        paragraphs: [
          "Efficacité réduit le temps de casse des blocs en multipliant le facteur de vitesse de l'outil par 0,8 à chaque niveau (l'effet se compose). Elle fonctionne sur les trois types d'outils, sur leur matériau approprié."
        ]
      },
      {
        title: 'Gain approximatif',
        table: {
          headers: ['Niveau', 'Multiplicateur cumulé', 'Vitesse'],
          rows: [
            ['I', '×0,80', '+25 % environ'],
            ['II', '×0,64', '+56 % environ'],
            ['III', '×0,51', '+95 % environ']
          ]
        }
      },
      {
        title: 'Synergie',
        paragraphs: [
          "Se cumule avec la potion de hâte et l'effet Haste. Idéale sur une pioche pour miner en profondeur, ou sur une hache pour abattre la jungle."
        ]
      }
    ],
    seeAlso: ['enchantement', 'outils', 'mecanique-minage']
  },
  {
    id: 'enchant-fortune',
    title: 'Fortune',
    category: 'enchantement',
    summary: 'Multiplie les drops de minerais. Pioche uniquement, niveaux I à III.',
    infobox: {
      icon: '🍀',
      title: 'Fortune',
      rows: [
        { label: 'Outil', value: 'Pioche' },
        { label: 'Niveau max', value: 'III' },
        { label: 'Effet', value: '+15 % double drop / niveau' }
      ]
    },
    sections: [
      {
        title: 'Effet',
        paragraphs: [
          "Fortune ajoute une chance de faire tomber un exemplaire supplémentaire du minerai miné : +15 % par niveau, soit jusqu'à +45 % au niveau III. L'effet ne s'applique qu'aux blocs dont le nom se termine par « minerai » (roche et grès)."
        ]
      },
      {
        title: 'Cumul avec la potion',
        paragraphs: [
          "La potion de fortune (+50 %) et l'enchantement Fortune s'additionnent en une seule probabilité, tirée une fois par bloc. Une pioche Fortune III + potion de fortune atteint donc +95 % de chance de double drop."
        ]
      },
      {
        title: 'Chances par niveau',
        table: {
          headers: ['Niveau', 'Bonus enchant.', 'Avec potion (+50 %)'],
          rows: [
            ['I', '+15 %', '+65 %'],
            ['II', '+30 %', '+80 %'],
            ['III', '+45 %', '+95 %']
          ]
        }
      }
    ],
    seeAlso: ['enchantement', 'blocs-minerais', 'objets-potions']
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
          'Troupeaux de biome : lapins en Landes, moutons en Savane / Plaines / Forêt',
          'Abeilles : issues des ruches réellement présentes (Forêt, Plaines, Landes)',
          'Zombies : la nuit en mode Survie (15 % par tick)',
          'Spawners posés : zombie, mouton, abeille (rayon ~12 blocs)',
          'Shadow Boss : via piédestal ombragé uniquement'
        ]
      },
      {
        title: 'Liste',
        table: {
          headers: ['Mob', 'PV', 'Dégâts', 'Vitesse', 'Type'],
          rows: [
            ['Zombie', '12', '2', '80', 'Hostile'],
            ['Mouton', '8', '0', '40', 'Passif'],
            ['Lapin', '4', '0', '55', 'Passif'],
            ['Abeille', '6', '1', '120', 'Neutre'],
            ['Shadow Boss', '200', '4', '60', 'Boss']
          ]
        }
      }
    ],
    seeAlso: ['mob-zombie', 'mob-lapin', 'mob-shadow-boss', 'mecanique-jour-nuit']
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
        { label: 'Apparition', value: 'Nuit / spawner' }
      ]
    },
    sections: [
      {
        title: 'Comportement',
        paragraphs: [
          "Poursuit le joueur à vue et inflige des dégâts au contact. Apparaît la nuit en mode Survie (15 % par tick de spawn) ou via un spawner zombie. L'os sert de matériau de craft associé aux zombies."
        ]
      }
    ],
    seeAlso: ['objets-potions', 'mecanique-jour-nuit', 'mobs-apercu']
  },
  {
    id: 'mob-mouton',
    title: 'Mouton',
    category: 'mobs',
    summary: 'Mob passif errant en troupeau.',
    infobox: {
      icon: '🐑',
      rows: [
        { label: 'PV', value: '8' },
        { label: 'Dégâts', value: '0' },
        { label: 'Vitesse', value: '40' },
        { label: 'Groupe', value: '2 à 5' }
      ]
    },
    sections: [
      {
        title: 'Comportement',
        paragraphs: [
          "Errance aléatoire, aucune attaque, fuit quand on l'attaque. Apparaît en troupeaux en Savane (3-5), Plaines et Forêt (2-3), ou via spawner mouton."
        ]
      }
    ],
    seeAlso: ['mobs-apercu', 'biomes-tempere']
  },
  {
    id: 'mob-lapin',
    title: 'Lapin',
    category: 'mobs',
    summary: 'Petit mob passif des Landes, rapide et craintif.',
    infobox: {
      icon: '🐇',
      rows: [
        { label: 'PV', value: '4' },
        { label: 'Dégâts', value: '0' },
        { label: 'Vitesse', value: '55' },
        { label: 'Biome', value: 'Landes' }
      ]
    },
    sections: [
      {
        title: 'Comportement',
        paragraphs: [
          'Le lapin est le mob emblématique du biome Landes : il y apparaît en petits groupes de 2 à 4 (60 % de chance par tick de spawn de troupeau). Passif, il erre et fuit le joueur. Le plus fragile des mobs avec 4 PV.'
        ]
      }
    ],
    seeAlso: ['mobs-apercu', 'biomes-tempere']
  },
  {
    id: 'mob-abeille',
    title: 'Abeille',
    category: 'mobs',
    summary: 'Mob volant rapide, issu des ruches.',
    infobox: {
      icon: '🐝',
      rows: [
        { label: 'PV', value: '6' },
        { label: 'Dégâts', value: '1' },
        { label: 'Vitesse', value: '120' },
        { label: 'Source', value: 'Ruche (beehive)' }
      ]
    },
    sections: [
      {
        title: 'Comportement',
        paragraphs: [
          'Les abeilles sortent des ruches réellement présentes dans le monde (posées au sol en Landes, ou accrochées à un arbre en Forêt / Plaines). Un cooldown par ruche (45 s) évite le sur-spawn. Elles volent vers le joueur ; le miel est associé aux ruches.'
        ]
      }
    ],
    seeAlso: ['objets-materiaux', 'blocs-structures']
  },
  {
    id: 'mob-shadow-boss',
    title: 'Shadow Boss',
    category: 'mobs',
    summary: 'Boss de la dimension Shadow — 200 PV.',
    infobox: {
      icon: '👤',
      rows: [
        { label: 'PV', value: '200' },
        { label: 'Dégâts', value: '4' },
        { label: 'Vitesse', value: '60' },
        { label: 'Invocation', value: 'Piédestal ombragé (clic)' }
      ]
    },
    sections: [
      {
        title: 'Invocation',
        paragraphs: [
          "Interagir avec le piédestal ombragé dans un donjon ou la dimension Shadow. Débloque le succès « L'ombre s'éveille ». Un seul boss peut être invoqué à la fois."
        ]
      },
      {
        title: 'Victoire',
        paragraphs: [
          "Vaincre le boss débloque le succès « Chasseur d'ombres ». La couronne est le trophée associé à cet exploit."
        ]
      }
    ],
    seeAlso: ['dimension-shadow', 'succes', 'objets-equipement']
  },

  // ─── BIOMES ───
  {
    id: 'biomes',
    title: 'Les 13 biomes',
    category: 'biomes',
    summary: 'Treize biomes procéduraux générés par bruit de Voronoï.',
    sections: [
      {
        title: "Vue d'ensemble",
        paragraphs: [
          "Le monde est découpé en biomes mélangés par poids selon la position horizontale. Chaque biome définit sa tuile de surface, sa sous-surface, une amplitude de relief et une densité d'arbres. La Plage est un biome de transition entre terre et océan."
        ]
      },
      {
        title: 'Tableau complet',
        table: {
          headers: ['Biome', 'Surface', 'Relief', 'Arbres', 'Signature'],
          rows: [
            ['Plaines', 'Herbe', '×0,8', '20 %', 'Chêne, peuplier, fleurs, moutons'],
            ['Forêt', 'Herbe', '×1,0', '60 %', 'Bouleau/chêne dense, ruches'],
            ['Montagnes', 'Herbe/roche', '×8,0', '5 %', 'Pics élevés, pins, neige'],
            ['Pins géants', 'Herbe', '×2,5', '12 %', 'Pins massifs'],
            ['Savane', 'Herbe de savane', '×0,7', '8 %', 'Acacia, baobab, hautes herbes'],
            ['Landes', 'Bruyère', '×0,9', '5 %', 'Bruyère, fleur tinctoriale, lapins'],
            ['Désert', 'Sable', '×0,6', '0 %', 'Cactus, grès, buissons morts'],
            ['Badlands', 'Argile rouge', '×2,2', '0 %', "Strates d'argile colorée"],
            ['Océan', 'Sable', '×0,1', '0 %', 'Eau, corail, algues'],
            ['Plage', 'Sable', '×0,3', '0 %', 'Transition, coquillages'],
            ['Marais', 'Boue', '×0,35', '25 %', 'Arbres tordus, mousse, lianes'],
            ['Toundra', 'Herbe enneigée', '×1,2', '25 %', 'Pins, neige, baies givrées'],
            ['Jungle', 'Herbe', '×1,0', '65 %', 'Arbres denses, fougères, grande feuille']
          ]
        }
      },
      {
        title: 'Génération',
        paragraphs: [
          'Chunks de 50 blocs de large. Les poids de biome sont calculés par un bruit de Voronoï et lissés entre colonnes. Montagnes : amplitude ×8. Océans : amplitude ×0,1. Certains biomes rares (océan, marais, landes, savane, désert, badlands, toundra, jungle) reçoivent un boost de rareté ; les Pins géants sont resserrés.'
        ]
      }
    ],
    seeAlso: ['biomes-tempere', 'biomes-arides', 'biomes-froids', 'dimension-overworld']
  },
  {
    id: 'biomes-tempere',
    title: 'Biomes tempérés',
    category: 'biomes',
    subcategory: 'Tempérés',
    summary: 'Plaines, forêt, savane, pins géants et landes.',
    sections: [
      {
        title: 'Détail',
        table: {
          headers: ['Biome', 'Faune / flore', 'Bois'],
          rows: [
            ['Plaines', 'Moutons, tulipes, roses, fougères', 'Chêne, peuplier'],
            ['Forêt', 'Ruches, champignons, fougères', 'Bouleau, chêne'],
            ['Savane', 'Moutons, hautes herbes jaunes', 'Acacia, baobab'],
            ['Pins géants', 'Relief marqué (×2,5)', 'Pins massifs'],
            ['Landes', 'Lapins, bruyère, fleur tinctoriale', 'Rare']
          ]
        }
      },
      {
        title: 'À noter',
        paragraphs: [
          'Les Landes sont le seul biome à faire apparaître des lapins en troupeau (60 %). La fleur tinctoriale des Landes lâche de la teinture violette. La Savane combine acacias et baobabs, deux essences exclusives.'
        ]
      }
    ],
    seeAlso: ['biomes', 'blocs-bois', 'mob-lapin']
  },
  {
    id: 'biomes-arides',
    title: 'Biomes arides & côtiers',
    category: 'biomes',
    subcategory: 'Arides',
    summary: 'Désert, badlands, océan et plage.',
    sections: [
      {
        title: 'Détail',
        table: {
          headers: ['Biome', 'Surface', 'Signature'],
          rows: [
            ['Désert', 'Sable / grès', 'Cactus, minerais en grès, buissons morts'],
            ['Badlands', 'Argile rouge / jaune', 'Strates colorées, relief ×2,2, aucun arbre'],
            ['Océan', 'Sable', 'Eau profonde, corail, algues, kelp'],
            ['Plage', 'Sable', 'Transition océan/terre, coquillages']
          ]
        }
      },
      {
        title: 'À noter',
        paragraphs: [
          'Le désert est le seul biome à générer des minerais en grès à la place de la roche. Les badlands empilent argile rouge (surface) et jaune (sous-sol) et ne portent aucun arbre — juste quelques buissons morts.'
        ]
      }
    ],
    seeAlso: ['biomes', 'blocs-desert', 'blocs-vegetation']
  },
  {
    id: 'biomes-froids',
    title: 'Biomes humides & froids',
    category: 'biomes',
    subcategory: 'Froids & humides',
    summary: 'Marais, jungle, toundra et montagnes.',
    sections: [
      {
        title: 'Détail',
        table: {
          headers: ['Biome', 'Surface', 'Signature'],
          rows: [
            ['Marais', 'Boue', 'Arbres tordus, herbe des marais, mousse, lianes'],
            ['Jungle', 'Herbe', 'Arbres très denses (65 %), fougères, grande feuille'],
            ['Toundra', 'Herbe enneigée', 'Pins, neige, buissons givrés, glace'],
            ['Montagnes', 'Herbe / roche', 'Pics ×8, pins épars, sommets neigeux']
          ]
        }
      },
      {
        title: 'À noter',
        paragraphs: [
          "La jungle est le biome le plus arboré du jeu (65 % de densité, espacement 2) et le seul à générer la grande feuille et les arbres de jungle. Les montagnes offrent l'amplitude de relief la plus extrême (×8), idéale pour la spéléologie verticale."
        ]
      }
    ],
    seeAlso: ['biomes', 'blocs-bois', 'mecanique-donjons']
  },

  // ─── DIMENSIONS ───
  {
    id: 'dimension-overworld',
    title: 'Overworld',
    category: 'dimensions',
    summary: 'Dimension principale — monde procédural avec les 13 biomes.',
    sections: [
      {
        title: 'Description',
        paragraphs: [
          'Monde par défaut à la création. Seed personnalisable, sauvegarde par monde dans user://worlds/. Trois modes de jeu : Survie, Créatif, Spectateur. Trois types de génération : normal, superflat, mono-biome.'
        ]
      }
    ],
    seeAlso: ['biomes', 'dimension-shadow', 'types-monde']
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
        { label: 'Spawn', value: '(0, -100)' }
      ]
    },
    sections: [
      {
        title: 'Traversée',
        paragraphs: [
          'Craft et pose un portail ombragé (8 pierre ombragée + 2 lingots du vide). En le traversant, le joueur est téléporté en dimension Shadow ; la position Overworld est mémorisée pour le retour.'
        ]
      },
      {
        title: 'Contenu',
        paragraphs: [
          "Blocs ombragés, donjons, piédestal du boss et Shadow Boss. La pierre ombragée (deepstone) est aussi présente en profondeur dans l'Overworld, au-delà de ~80 blocs."
        ]
      }
    ],
    seeAlso: ['blocs-shadow', 'mob-shadow-boss']
  },
  {
    id: 'types-monde',
    title: 'Types de monde',
    category: 'dimensions',
    summary: 'Normal, superflat et mono-biome au choix à la création.',
    sections: [
      {
        title: 'Options de génération',
        table: {
          headers: ['Type', 'Description'],
          rows: [
            ['Normal', 'Génération complète avec les 13 biomes et le relief'],
            ['Superflat', 'Couches plates uniformes, idéal pour la construction'],
            ['Mono-biome', 'Un seul biome imposé sur tout le monde']
          ]
        }
      },
      {
        title: 'Seed',
        paragraphs: [
          'Chaque monde possède une graine (seed). Elle peut être aléatoire ou personnalisée à la création (use_custom_seed). En mono-biome ou superflat, on choisit en plus le biome forcé.'
        ]
      }
    ],
    seeAlso: ['dimension-overworld', 'biomes', 'modes-jeu']
  },

  // ─── FABRICATION ───
  {
    id: 'craft',
    title: 'Craft',
    category: 'fabrication',
    summary: "Fabrication à la main et à la table d'assemblage.",
    sections: [
      {
        title: 'Stations',
        table: {
          headers: ['Station', 'Accès', 'Exemples'],
          rows: [
            ['Main', 'Menu survie (E)', 'Planches, bâtons, outils bois, torches, coffre'],
            [
              "Table d'assemblage",
              'Bloc interactif',
              "Outils pierre/fer/rubis, briques, table d'enchantement, jetpack"
            ],
            ['Tailleur de pierre', 'Bloc burin', 'Variantes de pierre (1:1)'],
            ['Four', 'Bloc four', 'Fusion minerais'],
            ['Chaudron', 'Bloc chaudron', 'Potions'],
            ["Table d'enchantement", 'Bloc dédié', 'Enchanter les outils']
          ]
        }
      },
      {
        title: 'Catégories de recettes',
        list: ['Matériaux', 'Outils', 'Structures', 'Décoration', 'Équipement']
      },
      {
        title: 'Recettes de décoration en pierre',
        table: {
          headers: ['Sortie', 'Ingrédients'],
          rows: [
            ['Briques de pierre ×4', '4 pierre'],
            ['Briques ciselées', '2 briques de pierre'],
            ['Briques fissurées', '1 brique de pierre'],
            ['Briques moussues', '1 brique + 1 liane'],
            ['Pilier de pierre ×2', '2 briques de pierre'],
            ["Table d'enchantement", '2 obsidienne + 4 briques + 4 émeraude']
          ]
        }
      },
      {
        title: "Tags d'ingrédients",
        paragraphs: [
          "#planks, #logs, #sticks acceptent n'importe quelle variante de bois. #coal_ores, #iron_ores, etc. regroupent roche et grès."
        ]
      }
    ],
    seeAlso: ['blocs-decoration', 'four-fusion', 'chaudron', 'table-enchantement']
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
            ["Minerai d'émeraude (×1)", 'Émeraude ×1'],
            ['Minerai du vide (×1)', 'Lingot du vide ×1']
          ]
        }
      },
      {
        title: 'Note',
        paragraphs: [
          'Le four accepte les variantes en grès via les tags de minerai. Fondre un premier minerai débloque le succès « Fondue », obtenir un lingot de fer débloque « Forgeron ».'
        ]
      }
    ],
    seeAlso: ['four', 'blocs-minerais']
  },
  {
    id: 'chaudron',
    title: 'Chaudron',
    category: 'fabrication',
    summary: 'Station alchimique pour les potions.',
    infobox: {
      rows: [
        { label: 'Craft', value: "5 lingots de fer (table d'assemblage)" },
        { label: 'Recettes', value: '8 potions' }
      ]
    },
    sections: [
      {
        title: 'Utilisation',
        paragraphs: [
          'Interagir avec le bloc chaudron. Sélectionner une recette, vérifier les ingrédients en inventaire, puis brasser.'
        ]
      }
    ],
    seeAlso: ['objets-potions']
  },
  {
    id: 'tailleur-pierre',
    title: 'Tailleur de pierre',
    category: 'fabrication',
    summary: 'Convertit la pierre en variantes lisses et briques.',
    sections: [
      {
        title: 'Conversions (1:1)',
        list: [
          'Pierre → pierre lisse',
          'Pierre → briques de pierre',
          'Pierre → dalles de pierre',
          'Pierre → pierre taillée'
        ]
      },
      {
        title: 'Complément',
        paragraphs: [
          "Le tailleur produit les variantes de base ; la décoration avancée (briques ciselées, fissurées, moussues, pilier) se fabrique à la table d'assemblage à partir des briques."
        ]
      }
    ],
    seeAlso: ['blocs-pierre', 'blocs-decoration']
  },

  // ─── MÉCANIQUES ───
  {
    id: 'modes-jeu',
    title: 'Modes de jeu',
    category: 'mecaniques',
    summary: 'Survie, Créatif et Spectateur, avec trois niveaux de difficulté.',
    sections: [
      {
        title: 'Modes',
        table: {
          headers: ['Mode', 'Description'],
          rows: [
            ['Survie', 'Ressources, PV, mobs, drops et enchantement actifs'],
            ['Créatif', 'Blocs illimités, pas de drops, pas de dégâts'],
            ['Spectateur', 'Observation libre, caméra détachée']
          ]
        }
      },
      {
        title: 'Difficultés',
        list: [
          'Facile — mobs moins agressifs',
          'Moyenne — équilibre par défaut',
          'Difficile — pression accrue'
        ]
      },
      {
        title: 'Notes',
        paragraphs: [
          "Le mode Survie impose une portée d'action limitée (7 blocs) et le respect des tiers d'outils. En Créatif, casser un bloc ne lâche rien : l'inventaire créatif fournit tout directement."
        ]
      }
    ],
    seeAlso: ['types-monde', 'mecanique-minage', 'mobs-apercu']
  },
  {
    id: 'mecanique-minage',
    title: 'Minage & tiers',
    category: 'mecaniques',
    summary: "Durabilité des blocs, tiers d'outils, vitesse et bonus.",
    sections: [
      {
        title: 'Règles',
        list: [
          'Chaque bloc a une durabilité et un outil efficace (pioche, hache, pelle ou main)',
          "Un tier d'outil insuffisant casse le bloc sans rien lâcher",
          "Le bon type d'outil applique son multiplicateur de vitesse",
          'Efficacité et la potion de hâte accélèrent encore le minage',
          'Fortune et la potion de fortune ajoutent des drops de minerai'
        ]
      },
      {
        title: 'Temps de casse',
        paragraphs: [
          "Le temps de casse = durabilité du bloc × multiplicateur de base × multiplicateur d'outil × bonus (Efficacité, Haste). Un minimum plancher évite les cassages instantanés. Utiliser le mauvais type d'outil ne bénéficie d'aucun bonus de vitesse."
        ]
      }
    ],
    seeAlso: ['outils', 'enchant-efficacite', 'enchant-fortune', 'blocs-minerais']
  },
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
          "Sources infinies : seau d'eau posé",
          'Eau statique : lacs générés à la création du chunk',
          'Tick physique : ~0,18 s, max 20 mises à jour / tick',
          'Remplace herbe courte et fleurs au placement'
        ]
      }
    ],
    seeAlso: ['blocs-fluides', 'objets-seaux']
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
          'Luminosité solaire selon la phase du cycle jour/nuit (nuit ~4/15, jour 15/15)',
          "Torches, four, lave — propagation en cases d'air par BFS",
          'Recalcul à la pose / casse de blocs lumineux',
          'Option désactivable dans les paramètres'
        ]
      }
    ],
    seeAlso: ['torche', 'mecanique-jour-nuit']
  },
  {
    id: 'mecanique-jour-nuit',
    title: 'Cycle jour / nuit',
    category: 'mecaniques',
    summary: '20 minutes réelles = 1 jour complet.',
    sections: [
      {
        title: 'Rythme',
        table: {
          headers: ['Phase', 'Fraction', 'Heure ~'],
          rows: [
            ['Plein jour', '0,30 – 0,75', '7h – 18h'],
            ['Crépuscule', '0,75 – 0,86', '18h – 20h40'],
            ['Nuit', '0,86 – 0,30', '20h40 – 7h']
          ]
        }
      },
      {
        title: 'Effets',
        list: [
          'Durée totale : 1200 s (20 min réelles)',
          'Nuit : luminosité faible, spawn de zombies en Survie',
          'Horloge affichable (objet + HUD debug)',
          'Succès « Survivant » : tenir une nuit entière (jour 2+)'
        ]
      }
    ],
    seeAlso: ['mob-zombie', 'mecanique-eclairage']
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
          'Contenu : torches, coffres, pierre moussue, parfois piédestal du boss',
          'Murs en briques de pierre, sol en pierre lisse'
        ]
      }
    ],
    seeAlso: ['blocs-pierre', 'mob-shadow-boss']
  },
  {
    id: 'mecanique-convoyeur',
    title: 'Tapis roulant',
    category: 'mecaniques',
    summary: 'Bloc qui pousse joueurs et mobs.',
    infobox: {
      rows: [
        { label: 'ID', value: '66' },
        { label: 'Vitesse', value: '120 u/s (impulsion)' },
        { label: 'Craft', value: '3 fer + 2 cordes → 4' }
      ]
    },
    sections: [
      {
        title: 'Fonctionnement',
        paragraphs: [
          'Toute entité sur la tuile convoyeur reçoit une impulsion horizontale. Tag bloc : conveyor.'
        ]
      }
    ],
    seeAlso: ['blocs-structures', 'craft']
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
            ['Source de vie', "Verser de l'eau", 'Clair de lune'],
            ['Établi', "Ouvrir table d'assemblage", 'Constructeur'],
            ['Artisan', 'Fabriquer un objet', 'Établi'],
            ['Chaleur', 'Ouvrir un four', 'Artisan'],
            ['Fondue', 'Fondre un minerai', 'Chaleur'],
            ['Forgeron', 'Obtenir lingot de fer', 'Fondue'],
            ['Survivant', 'Survivre une nuit', 'Premier coup'],
            ['Mémoire', 'Sauvegarder', 'Survivant'],
            ["L'ombre s'éveille", 'Invoquer Shadow Boss', 'Survivant'],
            ["Chasseur d'ombres", 'Vaincre Shadow Boss', "L'ombre s'éveille"]
          ]
        }
      },
      {
        title: 'Persistance',
        paragraphs: [
          'Les succès sont sauvegardés par monde (user://worlds/<id>/achievements.json) et affichés en arbre de progression accessible depuis le menu pause.'
        ]
      }
    ],
    seeAlso: ['mob-shadow-boss', 'craft']
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
          'Le serveur impose seed, mode de jeu et difficulté'
        ]
      },
      {
        title: 'Synchronisé',
        list: [
          'Positions des joueurs (~20 updates/s)',
          'Placement et destruction de blocs',
          'Chat textuel',
          'Métadonnées monde (seed, gamemode, difficulty)'
        ]
      },
      {
        title: 'Non synchronisé (Phase 7)',
        list: [
          'Inventaire individuel',
          'Coffres, fourneaux, crafts',
          'Mobs et combats',
          'Changements de dimension'
        ]
      }
    ],
    seeAlso: ['pm-server', 'chat-multijoueur']
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
        { label: 'Prérequis', value: 'Node.js 18+' }
      ]
    },
    sections: [
      {
        title: 'Installation',
        paragraphs: [
          'Dans le dossier PM_Server : npm install puis npm start. Configuration via config.json.'
        ]
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
            ['seed', '42424242', 'Graine partagée']
          ]
        }
      },
      {
        title: 'API REST',
        list: ['GET /api/status — infos pour le navigateur', 'GET /api/ping — test disponibilité']
      },
      {
        title: 'Limitations',
        list: [
          'Aucune persistance : redémarrage = monde reset',
          'Pas de commandes admin (/kick, /ban…)',
          "Pas d'authentification — pseudo libre"
        ]
      }
    ],
    seeAlso: ['multijoueur', 'chat-multijoueur']
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
        { label: 'Historique', value: '100 messages max' }
      ]
    },
    sections: [
      {
        title: 'Utilisation',
        list: [
          'T ouvre la saisie ; Échap ferme',
          'Bulles de dialogue au-dessus des personnages (4 s)',
          'Bloque inventaire et menus pendant la saisie'
        ]
      },
      {
        title: 'Protocole',
        paragraphs: [
          'Message client : { type: "chat", text: "..." }. Diffusé à tous via { type: "chat", name, text }.'
        ]
      }
    ],
    seeAlso: ['multijoueur', 'pm-server']
  }
]

export const wikiArticleMap = new Map<string, WikiArticle>(wikiArticles.map((a) => [a.id, a]))

export function getWikiArticle(id: string): WikiArticle | undefined {
  return wikiArticleMap.get(id)
}

export function searchWikiArticles(query: string): WikiArticle[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return wikiArticles.filter((a) => {
    const haystack = [
      a.title,
      a.summary,
      a.subcategory ?? '',
      a.category,
      ...a.sections.flatMap((s) => [
        s.title,
        ...(s.paragraphs ?? []),
        ...(s.list ?? []),
        ...(s.table?.rows.flat() ?? [])
      ])
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}
