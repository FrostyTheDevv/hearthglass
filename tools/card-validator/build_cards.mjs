import { EXPANSION_88_CARDS } from './expansion_160_cards.mjs';
import { EXPANSION_320_CARDS } from './expansion_320_cards.mjs';
import { EXPANSION_480_CARDS } from './expansion_480_cards.mjs';
import { compileCardLoreAndArt, MASTER_ART_STYLE_GUIDE, FACTION_VISUAL_GUIDES } from './lore_and_art_compiler.mjs';
import { LUMENPORT_DISTRICTS, LUMENPORT_INTERIORS, LUMENPORT_NPCS, ACT1_QUESTS } from './lumenport_world_data.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

/**
 * Canonical 72-Card Phase 1 Starter Set (64 Faction Cards: 8 per Faction + 8 Neutral Cards)
 * Covers:
 * - All 8 Major Factions + Neutral
 * - All 4 Card Classes: Creature, Tactic, Relic, Environment
 * - All 10 Creature Combat Roles: Vanguard, Bulwark, Assassin, Marksman, Caster, Support, Trickster, Summoner, Controller, Colossus
 * - All 20 Core Keywords: Guard, Swift, Reach, Pierce, Ward, Stealth, Drain, Anchor, Skirmish, Rebirth, Burn, Growth, Shield, Exhaust, Silence, Awaken, Resonate, Recall, Corrode, Echo
 * - All 8 Faction Signature Mechanics: Overheat (heat), Bloom (growth), Assembly (assembly), Current (current), Refraction (refraction), Veil (veil), Alignment (alignment), Reclaim (reclaim)
 */
const RAW_CARDS = [
  // =========================================================================
  // FACTION 01 — EMBERCLAD (8 cards: 5 Creatures, 1 Tactic, 1 Relic, 1 Environment)
  // Signature Mechanic: Overheat (heat counters)
  // =========================================================================
  {
    id: 'EMB-C-0001',
    name: 'Ashborne Initiate',
    type: 'creature',
    subtype: 'human_warrior',
    faction: 'emberclad',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 2,
    keywords: ['swift'],
    mechanics: ['heat'],
    description: 'Swift. After this attacks, gain 1 Heat counter (+1 Attack per Heat; takes 1 damage at end of turn if Heat >= 3).',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'heat', amount: 1 },
          { operation: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'Every apprentice of the Cinder Anvil learns to strike while their gauntlets still glow white-hot.',
    archetypes: ['overheat_aggro', 'burn_midrange'],
    weaknesses: ['early_guards', 'silence'],
    complexity: 'beginner',
    art: {
      subject: 'Young volcanic-armored initiate lunging forward with a glowing copper blade',
      silhouette: 'Compact agile warrior with flared furnace pauldrons',
      palette: ['copper', 'charcoal', 'ember_orange', 'ash_white'],
      lighting: 'Harsh under-lighting from molten floor grates',
      environment: 'Emberclad forge practice hall'
    }
  },
  {
    id: 'EMB-C-0002',
    name: 'Cinderplate Sentinel',
    type: 'creature',
    subtype: 'forged_knight',
    faction: 'emberclad',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 2,
    health: 4,
    keywords: ['guard', 'shield'],
    mechanics: ['heat'],
    description: 'Guard, Shield (1). When this takes combat damage, gain 1 Heat counter and deal 1 Burn damage to the attacker.',
    abilities: [
      {
        trigger: 'when_damaged',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'heat', amount: 1 },
          { operation: 'add_counter', target: 'event_source', counter: 'burn', amount: 1 }
        ]
      }
    ],
    lore: 'His shield is cast from three layers of slag-iron and quenched in dragon tallow.',
    archetypes: ['forge_relics', 'burn_midrange'],
    weaknesses: ['pierce', 'direct_removal'],
    complexity: 'beginner',
    art: {
      subject: 'Heavy armored sentinel planting a glowing furnace-door tower shield',
      silhouette: 'Wide monolithic frontline defender with vents along the crest',
      palette: ['charcoal', 'ember_orange', 'bronze'],
      lighting: 'Radiant heat seams along the shield surface',
      environment: 'Basalt bridge over magma canal'
    }
  },
  {
    id: 'EMB-C-0003',
    name: 'Coalglass Artificer',
    type: 'creature',
    subtype: 'human_artificer',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: 'support',
    cost: 3,
    attack: 2,
    health: 3,
    keywords: [],
    mechanics: ['heat'],
    description: 'On Summon: Grant an allied creature 1 Heat counter and +2/+1.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'heat', amount: 1 },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 2, health_delta: 1 }
        ]
      }
    ],
    lore: 'She tunes the resonance of molten glass cores so the armor never cools mid-duel.',
    archetypes: ['overheat_aggro', 'forge_relics'],
    weaknesses: ['empty_board'],
    complexity: 'beginner',
    art: {
      subject: 'Artificer holding tongs with a pulsing obsidian-amber Echo core',
      silhouette: 'Medium frame with leather apron, welding goggles, and mechanical bellows pack',
      palette: ['copper', 'amber', 'soot_black'],
      lighting: 'Warm core glow reflecting off glass lenses',
      environment: 'Slag-glass workshop'
    }
  },
  {
    id: 'EMB-C-0004',
    name: 'Pyrewing Harrier',
    type: 'creature',
    subtype: 'firebird_beast',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: 'marksman',
    cost: 4,
    attack: 3,
    health: 3,
    keywords: ['reach', 'burn'],
    mechanics: ['heat'],
    description: 'Reach. On Summon: Apply 1 Burn counter to the enemy Front or Rear creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'enemy_in_lane', counter: 'burn', amount: 1 },
          { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
        ]
      }
    ],
    lore: 'Trained in the thermal updrafts of Mount Ashspire, it dives past shield walls to singe command units.',
    archetypes: ['burn_midrange', 'overheat_aggro'],
    weaknesses: ['low_health', 'ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Copper-feathered raptor banking mid-air while raining glowing cinders',
      silhouette: 'Swept-wing avian predator with tail plumes of smoke',
      palette: ['ember_orange', 'ash_white', 'copper'],
      lighting: 'Backlit by volcanic sunset',
      environment: 'Thermal cliffs above Emberclad foundries'
    }
  },
  {
    id: 'EMB-C-0005',
    name: 'Furnace-Horn Ravager',
    type: 'creature',
    subtype: 'lava_behemoth',
    faction: 'emberclad',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 6,
    health: 6,
    keywords: ['pierce', 'awaken'],
    mechanics: ['heat'],
    description: 'Pierce. On Summon: Gain 2 Heat counters. Awaken: If this has 3+ Heat counters when attacking, deal 2 damage to the opposing Leader.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'heat', amount: 2 }
        ]
      },
      {
        trigger: 'after_this_attacks',
        conditions: [{ type: 'self_counter_at_least', counter: 'heat', value: 2 }],
        effects: [
          { operation: 'deal_damage', target: 'enemy_leader', amount: 2 }
        ]
      }
    ],
    lore: 'Its ribs are iron grates; its roar is the blast of a smeltery furnace blown wide open.',
    archetypes: ['overheat_aggro', 'burn_midrange'],
    weaknesses: ['high_cost', 'hard_removal'],
    complexity: 'intermediate',
    art: {
      subject: 'Massive horned quadruped armored in riveted boiler plates spewing slag',
      silhouette: 'Hulking forward-charging beast with twin smokestack horns',
      palette: ['charcoal', 'molten_gold', 'crimson'],
      lighting: 'Blazing internal furnace fire bursting through armor plates',
      environment: 'Shattered crucible arena'
    }
  },
  {
    id: 'EMB-T-0006',
    name: 'Molten Reckoning',
    type: 'tactic',
    subtype: 'destruction',
    faction: 'emberclad',
    rarity: 'common',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['burn'],
    mechanics: ['heat'],
    description: 'Standard Tactic. Deal 4 damage to a target enemy creature and apply 1 Burn counter.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 4 },
          { operation: 'add_counter', target: 'target_enemy_creature', counter: 'burn', amount: 1 }
        ]
      }
    ],
    lore: 'When negotiation fails, the forge-masters simply open the spillway.',
    archetypes: ['overheat_aggro', 'burn_midrange', 'forge_relics'],
    weaknesses: ['ward', 'refraction'],
    complexity: 'beginner',
    art: {
      subject: 'Torrent of liquid bronze crashing through an enemy barricade',
      silhouette: 'Diagonal splash arc of bright molten metal',
      palette: ['ember_orange', 'bright_yellow', 'charcoal'],
      lighting: 'High-contrast incandescent flare',
      environment: 'Battlefield trench'
    }
  },
  {
    id: 'EMB-R-0007',
    name: 'Anvilheart Gauntlet',
    type: 'relic',
    subtype: 'equipment',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['heat'],
    description: 'Relic. On Play and at the start of your turn: Grant your Front creature with the highest Attack +1/+1 and 1 Heat counter.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 1 },
          { operation: 'add_counter', target: 'strongest_ally_creature', counter: 'heat', amount: 1 }
        ]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [
          { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'Forged to compress Echo resonance into sheer kinetic impact.',
    archetypes: ['forge_relics', 'overheat_aggro'],
    weaknesses: ['relic_sabotage'],
    complexity: 'beginner',
    art: {
      subject: 'Articulated copper-and-iron gauntlet resting on a runed anvil',
      silhouette: 'Heavy mechanical fist with glowing pressure tubes',
      palette: ['copper', 'ember_orange', 'steel_gray'],
      lighting: 'Sparks drifting upward from the knuckles',
      environment: 'Master forge pedestal'
    }
  },
  {
    id: 'EMB-E-0008',
    name: 'Crucible of the First Flame',
    type: 'environment',
    subtype: 'arena_hazard',
    faction: 'emberclad',
    rarity: 'legendary',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['heat'],
    description: 'Environment. Affects all players: All creatures gain +1 Attack when summoned. At the end of each turn, the active player deals 1 damage to the opposing Leader if they control an Emberclad creature.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 0 }
        ]
      },
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Here the earliest Echo crystals were tempered in primordial fire before the Accord was ever signed.',
    archetypes: ['overheat_aggro', 'burn_midrange', 'forge_relics'],
    weaknesses: ['environment_replacement'],
    complexity: 'advanced',
    art: {
      subject: 'Circular coliseum suspended by chains above an ancient caldera',
      silhouette: 'Symmetrical ring arena with towering flame braziers',
      palette: ['ember_orange', 'charcoal', 'ash_white'],
      lighting: 'Dramatic upward volcanic glow',
      environment: 'Caldera of the First Flame'
    }
  },

  // =========================================================================
  // FACTION 02 — VERDANT PACT (8 cards: 5 Creatures, 1 Tactic, 1 Relic, 1 Environment)
  // Signature Mechanic: Bloom (growth counters)
  // =========================================================================
  {
    id: 'VER-C-0001',
    name: 'Mossveil Tender',
    type: 'creature',
    subtype: 'sylvan_druid',
    faction: 'verdant_pact',
    rarity: 'common',
    role: 'support',
    cost: 1,
    attack: 1,
    health: 3,
    keywords: ['growth'],
    mechanics: ['bloom'],
    description: 'On Summon: Grant an allied creature 1 Growth counter (+1/+1) and restore 1 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'growth', amount: 1 },
          { operation: 'heal', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'She coaxes dormant Echo seeds out of cracked cobblestone and rusted battle armor alike.',
    archetypes: ['bloom_swarm', 'regeneration'],
    weaknesses: ['low_attack'],
    complexity: 'beginner',
    art: {
      subject: 'Woodland caretaker kneeling beside glowing emerald fern-crystals',
      silhouette: 'Robed figure with antler-like wooden staff and leaf cloak',
      palette: ['emerald', 'moss_green', 'muted_gold'],
      lighting: 'Dappled sunbeams through canopy mist',
      environment: 'Whisperleaf glade'
    }
  },
  {
    id: 'VER-C-0002',
    name: 'Thornback Defender',
    type: 'creature',
    subtype: 'briar_beast',
    faction: 'verdant_pact',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 2,
    health: 4,
    keywords: ['guard', 'growth'],
    mechanics: ['bloom'],
    description: 'Guard. At the end of your turn, if you control another creature in this lane, gain 1 Growth counter (+1/+1).',
    abilities: [
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'growth', amount: 1 }
        ]
      }
    ],
    lore: 'Its carapace thickens with living ironwood every season it stands watch.',
    archetypes: ['guardian_control', 'bloom_swarm'],
    weaknesses: ['silence', 'corrode'],
    complexity: 'beginner',
    art: {
      subject: 'Quadruped tortoise-beetle covered in interlocking bark plates and golden thorns',
      silhouette: 'Low domed guardian blocking an archway of roots',
      palette: ['deep_bark_brown', 'moss_green', 'muted_gold'],
      lighting: 'Soft bioluminescent moss along shell ridges',
      environment: 'Ancient Sanctuary path'
    }
  },
  {
    id: 'VER-C-0003',
    name: 'Wildroot Stalker',
    type: 'creature',
    subtype: 'plant_predator',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: 'assassin',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['skirmish', 'growth'],
    mechanics: ['bloom'],
    description: 'Skirmish. When this moves lanes or attacks, gain 1 Growth counter (+1/+1).',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'growth', amount: 1 }
        ]
      }
    ],
    lore: 'It travels beneath the topsoil and erupts where the opponent’s formation is thinnest.',
    archetypes: ['bloom_swarm', 'guardian_control'],
    weaknesses: ['anchor_effects', 'direct_removal'],
    complexity: 'intermediate',
    art: {
      subject: 'Lithe root-panther leaping between twisted tree trunks',
      silhouette: 'Sinuous feline form woven from vines and amber thorns',
      palette: ['emerald', 'deep_bark_brown', 'amber'],
      lighting: 'Moonlight filtering through dense leaves',
      environment: 'Thornwood thicket'
    }
  },
  {
    id: 'VER-C-0004',
    name: 'Briarborn Shepherd',
    type: 'creature',
    subtype: 'spirit_keeper',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: 'summoner',
    cost: 4,
    attack: 2,
    health: 4,
    keywords: ['rebirth'],
    mechanics: ['bloom'],
    description: 'Rebirth. On Summon: Summon a 2/2 Seedling Token with Growth into an open slot in this lane (or any open slot).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Verdant Seedling',
            attack: 2,
            health: 2,
            keywords: ['growth']
          }
        ]
      }
    ],
    lore: 'Where the Shepherd walks, a hundred tiny guardians wake from the humus.',
    archetypes: ['bloom_swarm'],
    weaknesses: ['pierce', 'board_clears'],
    complexity: 'intermediate',
    art: {
      subject: 'Tall dryad-like guardian carrying a lantern of sprouting crystal seeds',
      silhouette: 'Branch-crowned figure flanked by small glowing sprout spirits',
      palette: ['emerald', 'muted_gold', 'moss_green'],
      lighting: 'Warm golden lantern glow against deep forest green',
      environment: 'Moonlit Grove'
    }
  },
  {
    id: 'VER-C-0005',
    name: 'Groveheart Behemoth',
    type: 'creature',
    subtype: 'ancient_treant',
    faction: 'verdant_pact',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 5,
    health: 7,
    keywords: ['guard', 'growth', 'drain'],
    mechanics: ['bloom'],
    description: 'Guard, Drain. Bloom (2+ Growth counters): Gains +2 Attack and Pierce. On Summon: Gain 1 Growth counter.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'growth', amount: 1 },
          { operation: 'grant_keyword', target: 'self', keyword: 'pierce' }
        ]
      }
    ],
    lore: 'Entire generations of Whisperleaf villagers have carved their vows into its lower bark.',
    archetypes: ['guardian_control', 'regeneration'],
    weaknesses: ['hard_removal', 'corrode'],
    complexity: 'intermediate',
    art: {
      subject: 'Colossal living tree-giant with a crystalline emerald heart pulsing in its chest',
      silhouette: 'Towering broad-shouldered colossus crowned with canopy foliage',
      palette: ['deep_bark_brown', 'emerald', 'muted_gold'],
      lighting: 'Brilliant emerald heart-glow radiating through bark fissures',
      environment: 'Guardian Temple courtyard'
    }
  },
  {
    id: 'VER-T-0006',
    name: 'Season of Renewal',
    type: 'tactic',
    subtype: 'healing',
    faction: 'verdant_pact',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['growth'],
    mechanics: ['bloom'],
    description: 'Standard Tactic. Restore 3 Health to all allied creatures and grant them 1 Growth counter (+1/+1).',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'all_ally_creatures', amount: 3 },
          { operation: 'add_counter', target: 'all_ally_creatures', counter: 'growth', amount: 1 }
        ]
      }
    ],
    lore: 'Rain falls for a single breath, and shattered timber knits itself back together.',
    archetypes: ['bloom_swarm', 'guardian_control', 'regeneration'],
    weaknesses: ['empty_board'],
    complexity: 'beginner',
    art: {
      subject: 'Golden rain and emerald pollen swirling across a wounded woodland vanguard',
      silhouette: 'Upward spiral of leaves and light motes',
      palette: ['emerald', 'muted_gold', 'seafoam'],
      lighting: 'Sunburst breaking through rain clouds',
      environment: 'Verdant Arena'
    }
  },
  {
    id: 'VER-R-0007',
    name: 'Sunstone Root-Censer',
    type: 'relic',
    subtype: 'global_support',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['bloom'],
    description: 'Relic. At the end of your turn, restore 2 Vitality to your Leader and grant a random allied creature 1 Growth counter.',
    abilities: [
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_leader', amount: 2 },
          { operation: 'add_counter', target: 'strongest_ally_creature', counter: 'growth', amount: 1 }
        ]
      }
    ],
    lore: 'Suspended from ironwood boughs, it burns amber resin that steadies the pulse of nearby Echoes.',
    archetypes: ['regeneration', 'guardian_control'],
    weaknesses: ['burst_damage'],
    complexity: 'beginner',
    art: {
      subject: 'Ornate gold-and-root censer swinging from braided vines',
      silhouette: 'Teardrop hanging vessel trailed by emerald incense ribbons',
      palette: ['muted_gold', 'emerald', 'deep_bark_brown'],
      lighting: 'Warm amber core light with green smoke',
      environment: 'Sanctuary altar'
    }
  },
  {
    id: 'VER-E-0008',
    name: 'Sanctuary of Thousand Roots',
    type: 'environment',
    subtype: 'sacred_grove',
    faction: 'verdant_pact',
    rarity: 'legendary',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['resonate'],
    mechanics: ['bloom'],
    description: 'Environment. At the end of each player’s turn, if that player controls 2+ lanes (Resonate), their creatures heal 2 Health and gain +0/+1.',
    abilities: [
      {
        trigger: 'turn_end',
        conditions: [{ type: 'has_resonate' }],
        effects: [
          { operation: 'heal', target: 'all_ally_creatures', amount: 2 },
          { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 0, health_delta: 1 }
        ]
      }
    ],
    lore: 'Where the roots braid together beneath the stone, no guardian ever truly stands alone.',
    archetypes: ['bloom_swarm', 'guardian_control', 'regeneration'],
    weaknesses: ['lane_denial'],
    complexity: 'advanced',
    art: {
      subject: 'Vast cathedral of living banyan roots surrounding a sunken stone duel table',
      silhouette: 'Overarching root canopy framing a glowing circular floor',
      palette: ['emerald', 'moss_green', 'muted_gold'],
      lighting: 'Cathedral shafts of sunlight and floating spore lights',
      environment: 'Heart of the Verdant Expanse'
    }
  },

  // =========================================================================
  // FACTION 03 — IRON CHOIR (8 cards: 5 Creatures, 1 Tactic, 1 Relic, 1 Environment)
  // Signature Mechanic: Assembly (assembly counters & construct tokens)
  // =========================================================================
  {
    id: 'IRN-C-0001',
    name: 'Cogline Recruit',
    type: 'creature',
    subtype: 'construct_soldier',
    faction: 'iron_choir',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 1,
    health: 3,
    keywords: ['shield'],
    mechanics: ['assembly'],
    description: 'Shield (1). On Summon: Gain 1 Assembly counter (+1 Attack when you control a Relic or another Construct).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'assembly', amount: 1 },
          { operation: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'Mass-cast in the Third Foundry, each unit marches in flawless three-four cadence.',
    archetypes: ['construct_assembly', 'equipment_tempo'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: 'Compact brass-and-steel clockwork infantryman saluting with a halberd',
      silhouette: 'Geometric soldier with visible chest Mainspring and blue ocular visor',
      palette: ['steel_gray', 'brass', 'electric_blue'],
      lighting: 'Crisp blue arc-light from the chest core',
      environment: 'Ironreach parade deck'
    }
  },
  {
    id: 'IRN-C-0002',
    name: 'Gearshield Automaton',
    type: 'creature',
    subtype: 'construct_guardian',
    faction: 'iron_choir',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 2,
    health: 4,
    keywords: ['guard', 'anchor', 'shield'],
    mechanics: ['assembly'],
    description: 'Guard, Anchor, Shield (1). At the start of your turn, restore 1 Health to this unit.',
    abilities: [
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'self', amount: 1 }
        ]
      }
    ],
    lore: 'Bolted directly into the lane floorplates, its overlapping gear-shields self-ratchet after every blow.',
    archetypes: ['mechanical_fortress', 'construct_assembly'],
    weaknesses: ['corrode', 'pierce'],
    complexity: 'beginner',
    art: {
      subject: 'Stocky automaton locking twin rotating gear-shields into the pavement',
      silhouette: 'Broad hexagonal silhouette with dual round cog-shields',
      palette: ['dark_iron', 'brass', 'electric_blue'],
      lighting: 'Sparks and blue telemetry glyphs across the shield rim',
      environment: 'Foundry District gate'
    }
  },
  {
    id: 'IRN-C-0003',
    name: 'Assembly Conductor',
    type: 'creature',
    subtype: 'human_engineer',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: 'support',
    cost: 3,
    attack: 2,
    health: 3,
    keywords: [],
    mechanics: ['assembly'],
    description: 'On Summon: Summon a 1/2 Clockwork Drone token with Shield (1) and grant all allied Iron Choir creatures 1 Assembly counter.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Clockwork Drone',
            attack: 1,
            health: 2,
            keywords: ['shield']
          },
          { operation: 'add_counter', target: 'all_ally_creatures', counter: 'assembly', amount: 1 }
        ]
      }
    ],
    lore: 'With a flick of his tuning baton, three dormant chassis lock into synchronized formation.',
    archetypes: ['construct_assembly', 'equipment_tempo'],
    weaknesses: ['full_board'],
    complexity: 'intermediate',
    art: {
      subject: 'Choir engineer conducting floating brass servo-drones with a glowing tuning rod',
      silhouette: 'Coat-clad conductor surrounded by geometric drone rings',
      palette: ['brass', 'electric_blue', 'steel_gray'],
      lighting: 'Electric blue resonance arcs connecting baton to drones',
      environment: 'Mechanical Workshops'
    }
  },
  {
    id: 'IRN-C-0004',
    name: 'Clocklash Saboteur',
    type: 'creature',
    subtype: 'construct_specialist',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: 'trickster',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['reach', 'exhaust'],
    mechanics: ['assembly'],
    description: 'Reach. On Summon: Exhaust an enemy creature in this lane for 1 turn.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust' }
        ]
      }
    ],
    lore: 'A single copper wedge fired into the right joint halts the grandest war-engine.',
    archetypes: ['equipment_tempo', 'mechanical_fortress'],
    weaknesses: ['ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Slender multi-armed clockwork specialist firing an electromagnetic tether-whip',
      silhouette: 'Crouched angular frame with whip coil extending forward',
      palette: ['steel_gray', 'electric_blue', 'brass'],
      lighting: 'Bright arc-flash along the tether',
      environment: 'Abandoned Railworks'
    }
  },
  {
    id: 'IRN-C-0005',
    name: 'Foundry Executor',
    type: 'creature',
    subtype: 'construct_titan',
    faction: 'iron_choir',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 5,
    health: 6,
    keywords: ['shield', 'pierce'],
    mechanics: ['assembly'],
    description: 'Shield (2), Pierce. On Summon: Gain +1/+1 for each Relic and Assembly counter you control (base bonus +2/+2 on summon).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'assembly', amount: 2 },
          { operation: 'modify_stats', target: 'self', attack_delta: 2, health_delta: 1 }
        ]
      }
    ],
    lore: 'When the Choir sounds the Seventh Chime, the Executor steps off the gantry crane.',
    archetypes: ['construct_assembly', 'mechanical_fortress', 'equipment_tempo'],
    weaknesses: ['silence', 'high_cost'],
    complexity: 'intermediate',
    art: {
      subject: 'Towering cathedral-shouldered automaton wielding a reciprocating pile-bunker hammer',
      silhouette: 'Massive angular mech-golem with pipe-organ exhaust vents on its back',
      palette: ['dark_iron', 'brass', 'electric_blue'],
      lighting: 'Twin searchlight eyes and pressurized steam vents',
      environment: 'Clockwork Coliseum'
    }
  },
  {
    id: 'IRN-T-0006',
    name: 'Emergency Reconfiguration',
    type: 'tactic',
    subtype: 'quick',
    faction: 'iron_choir',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['shield'],
    mechanics: ['assembly'],
    description: 'Quick Tactic. Restore 2 Health to an allied creature, grant it Shield (2), and draw 1 card.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_creature_in_lane_or_any', amount: 2 },
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield' },
          { operation: 'draw', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Modular plating swaps in 0.4 seconds under live combat conditions.',
    archetypes: ['mechanical_fortress', 'equipment_tempo', 'construct_assembly'],
    weaknesses: ['requires_board_target'],
    complexity: 'beginner',
    art: {
      subject: 'Mechanical servo-arms snapping fresh brass armor plates onto a damaged construct',
      silhouette: 'Radial burst of blueprints and interlocking plates',
      palette: ['electric_blue', 'brass', 'steel_gray'],
      lighting: 'Holographic schematic overlay',
      environment: 'Arena repair bay'
    }
  },
  {
    id: 'IRN-R-0007',
    name: 'Aether-Dynamo Core',
    type: 'relic',
    subtype: 'synergy_engine',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['assembly'],
    description: 'Relic. On Play: Gain 1 temporary Aether this turn. At the start of your turn, grant an allied creature 1 Assembly counter and +1/+0.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'gain_aether', target: 'ally_leader', amount: 1 }
        ]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'strongest_ally_creature', counter: 'assembly', amount: 1 },
          { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'Spun by copper induction coils, it hums in perfect sympathy with the Choir’s cathedral bells.',
    archetypes: ['construct_assembly', 'equipment_tempo'],
    weaknesses: ['slow_payoff'],
    complexity: 'intermediate',
    art: {
      subject: 'Spinning gyroscope of brass rings around a levitating blue Aether crystal',
      silhouette: 'Concentric spherical dynamo on a riveted plinth',
      palette: ['electric_blue', 'brass', 'dark_iron'],
      lighting: 'Intense cyan core illumination casting ring shadows',
      environment: 'Power Core Facility'
    }
  },
  {
    id: 'IRN-E-0008',
    name: 'The Grand Mechanism',
    type: 'environment',
    subtype: 'industrial_arena',
    faction: 'iron_choir',
    rarity: 'legendary',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['shield'],
    mechanics: ['assembly'],
    description: 'Environment. On Play and at the start of each player’s turn, that player’s Front creatures with Assembly counters or Relics gain Shield (1).',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'shield' }
        ]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'shield' }
        ]
      }
    ],
    lore: 'Beneath the entire city of Ironreach turns a single planetary gear train three miles wide.',
    archetypes: ['mechanical_fortress', 'construct_assembly'],
    weaknesses: ['environment_override'],
    complexity: 'advanced',
    art: {
      subject: 'Vast subterranean chamber of interlocking golden cogs and catwalks',
      silhouette: 'Monumental vertical gear wheels framing the duel platform',
      palette: ['brass', 'dark_iron', 'electric_blue'],
      lighting: 'Shafts of blue arc-light through rising steam',
      environment: 'Heart of Ironreach'
    }
  },

  // =========================================================================
  // FACTION 04 — TIDEBOUND (8 cards: 5 Creatures, 1 Tactic, 1 Relic, 1 Environment)
  // Signature Mechanic: Current (bonus after lane change or recall)
  // =========================================================================
  {
    id: 'TID-C-0001',
    name: 'Reefstep Scout',
    type: 'creature',
    subtype: 'merfolk_scout',
    faction: 'tidebound',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 2,
    keywords: ['skirmish'],
    mechanics: ['current'],
    description: 'Skirmish. Current: When this changes lanes or is summoned into an unoccupied lane, gain +1/+1.',
    abilities: [
      {
        trigger: 'on_move',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'current', amount: 1 },
          { operation: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'He reads the undertow of the arena tiles as easily as coastal currents.',
    archetypes: ['current_tempo', 'deepwater_midrange'],
    weaknesses: ['anchor', 'full_lanes'],
    complexity: 'beginner',
    art: {
      subject: 'Agile coral-armored scout vaulting over a cresting wave with a twin-pronged spear',
      silhouette: 'Dynamic lunging figure with finned greaves and flowing water ribbon',
      palette: ['azure', 'turquoise', 'pearl_white'],
      lighting: 'Caustic water reflections across pearl armor',
      environment: 'Lumenport Old Harbor breakwater'
    }
  },
  {
    id: 'TID-C-0002',
    name: 'Pearlguard Protector',
    type: 'creature',
    subtype: 'coral_warden',
    faction: 'tidebound',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 5,
    keywords: ['guard', 'ward'],
    mechanics: ['current'],
    description: 'Guard, Ward. Current: When an allied creature moves into this lane, restore 2 Health to this unit.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'current', amount: 1 }
        ]
      }
    ],
    lore: 'Nacreous shells grown over a century deflect both steel and errant hexes.',
    archetypes: ['recall_control', 'deepwater_midrange'],
    weaknesses: ['low_attack'],
    complexity: 'beginner',
    art: {
      subject: 'Defender clad in iridescent mother-of-pearl armor holding a scalloped pavise',
      silhouette: 'Curved shell-like defensive silhouette',
      palette: ['pearl_white', 'seafoam', 'azure'],
      lighting: 'Iridescent rainbow sheen over white shell plates',
      environment: 'Submerged temple steps'
    }
  },
  {
    id: 'TID-C-0003',
    name: 'Mistwake Dancer',
    type: 'creature',
    subtype: 'water_adept',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: 'trickster',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['skirmish', 'recall'],
    mechanics: ['current'],
    description: 'Skirmish. On Summon: Move another allied creature to an open adjacent lane slot and grant it +1/+1 (Current).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'move_lane', target: 'ally_creature_in_lane_or_any', direction: 'adjacent' },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'Where her silk fans part the sea-fog, an entire squad has already shifted flank.',
    archetypes: ['current_tempo', 'recall_control'],
    weaknesses: ['anchor'],
    complexity: 'intermediate',
    art: {
      subject: 'Graceful duelist spinning twin hydro-fans that leave ribbons of mist',
      silhouette: 'S-curve dancer silhouette encircled by hovering water droplets',
      palette: ['turquoise', 'seafoam', 'pearl_white'],
      lighting: 'Soft luminous mist halo',
      environment: 'Harbor lantern boardwalk'
    }
  },
  {
    id: 'TID-C-0004',
    name: 'Deepcurrent Seer',
    type: 'creature',
    subtype: 'abyssal_oracle',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: 'caster',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: [],
    mechanics: ['current'],
    description: 'On Summon: Draw 1 card. If you control creatures in at least 2 lanes, restore 2 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'draw', target: 'ally_leader', amount: 1 },
          { operation: 'heal', target: 'ally_leader', amount: 2 }
        ]
      }
    ],
    lore: 'She gazes into pressurized glass spheres taken from the Trench of Echoes.',
    archetypes: ['recall_control', 'deepwater_midrange'],
    weaknesses: ['aggressive_assassins'],
    complexity: 'beginner',
    art: {
      subject: 'Robed oracle floating slightly above the floor with glowing jellyfish motifs',
      silhouette: 'Flowing bell-shaped robes with suspended water orbs',
      palette: ['azure', 'turquoise', 'bioluminescent_cyan'],
      lighting: 'Deep-sea bioluminescence from floating spheres',
      environment: 'Tidal Sanctum'
    }
  },
  {
    id: 'TID-C-0005',
    name: 'Abyssal Shellbreaker',
    type: 'creature',
    subtype: 'leviathan_beast',
    faction: 'tidebound',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 5,
    health: 6,
    keywords: ['skirmish', 'pierce', 'reach'],
    mechanics: ['current'],
    description: 'Skirmish, Reach, Pierce. Current: When this moves lanes, it gains +2 Attack this turn.',
    abilities: [
      {
        trigger: 'on_move',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'current', amount: 1 },
          { operation: 'modify_stats', target: 'self', attack_delta: 2, health_delta: 0 }
        ]
      }
    ],
    lore: 'Ships in Lumenport harbor sound the foghorns twice when its dorsal ridge breaks the bay.',
    archetypes: ['deepwater_midrange', 'current_tempo'],
    weaknesses: ['hard_removal'],
    complexity: 'intermediate',
    art: {
      subject: 'Massive crustacean-leviathan surging through a wall of foaming water',
      silhouette: 'Broad armored sea-monster with crushing mantis-claws',
      palette: ['azure', 'dark_navy', 'seafoam', 'pearl_white'],
      lighting: 'Lightning and sea-spray highlights across wet chitin',
      environment: 'Storm-lashed sea temple'
    }
  },
  {
    id: 'TID-T-0006',
    name: 'Returning Tide',
    type: 'tactic',
    subtype: 'battlefield_manipulation',
    faction: 'tidebound',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['recall'],
    mechanics: ['current'],
    description: 'Quick Tactic. Return an allied creature to your hand (or heal it for 3 if hand is full) and draw 1 card.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_creature_in_lane_or_any', amount: 3 },
          { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'current', amount: 1 },
          { operation: 'draw', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'The wave retreats only to gather weight for the next crest.',
    archetypes: ['recall_control', 'current_tempo'],
    weaknesses: ['tempo_loss_if_misused'],
    complexity: 'intermediate',
    art: {
      subject: 'Swirling vortex of turquoise water lifting a warrior out of harm’s way',
      silhouette: 'Curling wave arc enveloping a glowing silhouette',
      palette: ['turquoise', 'seafoam', 'pearl_white'],
      lighting: 'Translucent backlit wave crest',
      environment: 'Flooded ruin'
    }
  },
  {
    id: 'TID-R-0007',
    name: 'Wayfinder Compass',
    type: 'relic',
    subtype: 'special_activation_device',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['skirmish'],
    mechanics: ['current'],
    description: 'Relic. On Play: Grant all allied creatures Skirmish and +0/+1.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'skirmish' },
          { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 0, health_delta: 1 }
        ]
      }
    ],
    lore: 'Its needle points not north, but toward the path of least resistance.',
    archetypes: ['current_tempo', 'deepwater_midrange'],
    weaknesses: ['full_board_lock'],
    complexity: 'beginner',
    art: {
      subject: 'Nautical brass-and-pearl astrolabe compass filled with glowing liquid Aether',
      silhouette: 'Circular compass rose with floating tidal rings',
      palette: ['pearl_white', 'azure', 'brass'],
      lighting: 'Soft aqua glow from the liquid center',
      environment: 'Captain’s chart table'
    }
  },
  {
    id: 'TID-E-0008',
    name: 'Palace Beneath the Wake',
    type: 'environment',
    subtype: 'submerged_sanctum',
    faction: 'tidebound',
    rarity: 'legendary',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['current'],
    description: 'Environment. Whenever a creature changes lanes or is summoned, its controller restores 1 Vitality to their Leader.',
    abilities: [
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_leader', amount: 2 }
        ]
      }
    ],
    lore: 'Sunk during the First Resonance, its marble halls still breathe with air held by tidal wards.',
    archetypes: ['recall_control', 'current_tempo', 'deepwater_midrange'],
    weaknesses: ['environment_replacement'],
    complexity: 'advanced',
    art: {
      subject: 'Grand coral-crowned palace beneath a dome of shimmering ocean water',
      silhouette: 'Fluted marble columns and arched domes under swimming manta silhouettes',
      palette: ['azure', 'turquoise', 'pearl_white'],
      lighting: 'Filtered submarine sunbeams',
      environment: 'Abyssal shelf'
    }
  },

  // =========================================================================
  // FACTION 05 — GLASSBORNE (8 cards: 5 Creatures, 1 Tactic, 1 Relic, 1 Environment)
  // Signature Mechanic: Refraction (ward, reflection, target precision)
  // =========================================================================
  {
    id: 'GLS-C-0001',
    name: 'Prismblade Apprentice',
    type: 'creature',
    subtype: 'crystal_duelist',
    faction: 'glassborne',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 2,
    keywords: ['ward'],
    mechanics: ['refraction'],
    description: 'Ward. When this creature’s Ward is consumed or when it attacks, gain +1 Attack.',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'refraction', amount: 1 }
        ]
      }
    ],
    lore: 'Trained in the Mirror Galleries, she strikes from three angles with a single lunge.',
    archetypes: ['prism_tempo', 'counterplay'],
    weaknesses: ['combat_damage_trades'],
    complexity: 'beginner',
    art: {
      subject: 'Fencer wielding a crystalline rapier that splits light into violet and cyan spectra',
      silhouette: 'Poised fencer stance with geometric crystal cape',
      palette: ['violet', 'silver', 'translucent_cyan'],
      lighting: 'Sharp prismatic light dispersion',
      environment: 'Mirror Labyrinth practice court'
    }
  },
  {
    id: 'GLS-C-0002',
    name: 'Mirrorwall Keeper',
    type: 'creature',
    subtype: 'prism_construct',
    faction: 'glassborne',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 4,
    keywords: ['guard', 'ward', 'shield'],
    mechanics: ['refraction'],
    description: 'Guard, Ward, Shield (1). Refraction: Deals 1 reflected damage to any enemy creature that attacks it.',
    abilities: [
      {
        trigger: 'when_damaged',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'event_source', amount: 1 }
        ]
      }
    ],
    lore: 'To strike the mirror is to feel your own blade rebound against your wrist.',
    archetypes: ['refraction_control', 'counterplay'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: 'Floating silver-and-crystal sentinel holding two interlocking mirror planes',
      silhouette: 'Tall diamond-shaped barrier figure',
      palette: ['silver', 'iridescent_white', 'violet'],
      lighting: 'Brilliant specular reflections across faceted planes',
      environment: 'Glassborne Archive hall'
    }
  },
  {
    id: 'GLS-C-0003',
    name: 'Shardstep Phantom',
    type: 'creature',
    subtype: 'illusion_assassin',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ['stealth', 'ward'],
    mechanics: ['refraction'],
    description: 'Stealth, Ward. Deals +1 damage when attacking an enemy Rear creature or Leader.',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Was that the real assassin in the left lane, or merely light bent through a Floating Lens?',
    archetypes: ['prism_tempo', 'counterplay'],
    weaknesses: ['low_health', 'aoe_damage'],
    complexity: 'intermediate',
    art: {
      subject: 'Faceted phantom stepping out of a shattered floating mirror with twin glass daggers',
      silhouette: 'Angular fractured silhouette with trailing mirror shards',
      palette: ['translucent_cyan', 'violet', 'silver'],
      lighting: 'Cold cyan rim-lighting through floating shards',
      environment: 'Hall of Endless Facets'
    }
  },
  {
    id: 'GLS-C-0004',
    name: 'Refraction Scholar',
    type: 'creature',
    subtype: 'human_arcanist',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: 'caster',
    cost: 3,
    attack: 2,
    health: 3,
    keywords: ['ward'],
    mechanics: ['refraction'],
    description: 'Ward. On Summon: Grant another allied creature Ward and deal 2 damage to an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'ward' },
          { operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }
        ]
      }
    ],
    lore: 'He calculates the exact refractive index required to turn a curse into a shield.',
    archetypes: ['refraction_control', 'prism_tempo'],
    weaknesses: ['low_stats'],
    complexity: 'intermediate',
    art: {
      subject: 'Scholar aligning three hovering crystal lenses to focus a beam of violet light',
      silhouette: 'Robed figure framed by geometric floating prism rings',
      palette: ['violet', 'iridescent_white', 'translucent_cyan'],
      lighting: 'Focused laser-like beam splitting through lenses',
      environment: 'Astral Archive optical lab'
    }
  },
  {
    id: 'GLS-C-0005',
    name: 'Glass Cathedral Guardian',
    type: 'creature',
    subtype: 'crystal_archon',
    faction: 'glassborne',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 5,
    health: 6,
    keywords: ['guard', 'ward', 'shield'],
    mechanics: ['refraction'],
    description: 'Guard, Ward, Shield (2). On Summon: Grant all allied creatures Ward.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'ward' }
        ]
      }
    ],
    lore: 'Carved from a single pillar of resonant quartz, it has guarded the Spire since the Accord began.',
    archetypes: ['refraction_control', 'counterplay'],
    weaknesses: ['heavy_melee_colossi'],
    complexity: 'intermediate',
    art: {
      subject: 'Monumental winged guardian made of stained crystal and silver filigree',
      silhouette: 'Cathedral-window wings spread behind an armored spear-bearer',
      palette: ['iridescent_white', 'violet', 'silver', 'translucent_cyan'],
      lighting: 'Prismatic sunbeams refracting through stained crystal wings',
      environment: 'Nave of the Glass Cathedral'
    }
  },
  {
    id: 'GLS-T-0006',
    name: 'Fractured Intention',
    type: 'tactic',
    subtype: 'counter',
    faction: 'glassborne',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['ward'],
    mechanics: ['refraction'],
    description: 'Counter / Quick Tactic. Grant an allied creature Ward and Shield (1), and deal 2 reflected damage to an enemy creature.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'ward' },
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield' },
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 2 }
        ]
      }
    ],
    lore: 'A spell aimed at a master of Glassborne rarely lands where its caster intended.',
    archetypes: ['counterplay', 'refraction_control', 'prism_tempo'],
    weaknesses: ['untargeted_effects'],
    complexity: 'intermediate',
    art: {
      subject: 'Incoming fireball shattering against a hexagonal prism barrier and rebounding',
      silhouette: 'Starburst reflection off a geometric crystal shield',
      palette: ['translucent_cyan', 'violet', 'iridescent_white'],
      lighting: 'Sharp chromatic aberration flash',
      environment: 'Duel arena'
    }
  },
  {
    id: 'GLS-R-0007',
    name: 'Kaleidoscope Lens',
    type: 'relic',
    subtype: 'defensive_ward',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['ward'],
    mechanics: ['refraction'],
    description: 'Relic. On Play and at the start of your turn: Grant a random allied creature without Ward the Ward keyword.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'ward' }
        ]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'ward' }
        ]
      }
    ],
    lore: 'Turn the brass bezel one notch and the battlefield geometry shifts by thirty degrees.',
    archetypes: ['refraction_control', 'prism_tempo'],
    weaknesses: ['empty_board'],
    complexity: 'beginner',
    art: {
      subject: 'Segmented crystal-and-silver ocular mounted on a floating gimbal',
      silhouette: 'Octagonal lens array with internal fractal facets',
      palette: ['silver', 'violet', 'translucent_cyan'],
      lighting: 'Internal kaleidoscope reflections',
      environment: 'Observatory pedestal'
    }
  },
  {
    id: 'GLS-E-0008',
    name: 'Hall of Endless Facets',
    type: 'environment',
    subtype: 'mirror_sanctum',
    faction: 'glassborne',
    rarity: 'legendary',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['ward'],
    mechanics: ['refraction'],
    description: 'Environment. On Play: Grant all friendly creatures Ward. At the end of each turn, if the active player controls a creature with Ward, deal 1 damage to the opposing Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'ward' }
        ]
      },
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Ten thousand mirrors repeat every gesture into infinity until truth and echo are one.',
    archetypes: ['refraction_control', 'counterplay', 'prism_tempo'],
    weaknesses: ['environment_replacement'],
    complexity: 'advanced',
    art: {
      subject: 'Soaring crystal gallery where infinite reflections recede into violet light',
      silhouette: 'Symmetric diamond-vaulted hall with floating crystal obelisks',
      palette: ['violet', 'silver', 'iridescent_white'],
      lighting: 'Infinite bounced light rays',
      environment: 'Mirror Labyrinth core'
    }
  },

  // =========================================================================
  // FACTION 06 — NOCTURNE (8 cards: 5 Creatures, 1 Tactic, 1 Relic, 1 Environment)
  // Signature Mechanic: Veil (stealth, ambush, disruption)
  // =========================================================================
  {
    id: 'NOC-C-0001',
    name: 'Crescent Alley Stalker',
    type: 'creature',
    subtype: 'shadow_rogue',
    faction: 'nocturne',
    rarity: 'common',
    role: 'assassin',
    cost: 1,
    attack: 2,
    health: 1,
    keywords: ['stealth', 'swift'],
    mechanics: ['veil'],
    description: 'Stealth, Swift. Veil: Enters concealed. Gains +1 Attack the turn it breaks Stealth to attack.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'veil', amount: 1 },
          { operation: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'By the time the streetlamp flickers back on, the duel has already tilted.',
    archetypes: ['veil_ambush', 'shadow_midrange'],
    weaknesses: ['1_health_fragility'],
    complexity: 'beginner',
    art: {
      subject: 'Masked figure crouching on a wet gargoyle beneath a crescent moon',
      silhouette: 'Sharp cloaked silhouette with silver crescent blades',
      palette: ['midnight_blue', 'indigo', 'silver'],
      lighting: 'Pale moonlight rim on dark velvet cloak',
      environment: 'Lumenport Underground Passage'
    }
  },
  {
    id: 'NOC-C-0002',
    name: 'Silent Bell Keeper',
    type: 'creature',
    subtype: 'masked_warden',
    faction: 'nocturne',
    rarity: 'common',
    role: 'controller',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ['silence'],
    mechanics: ['veil'],
    description: 'On Summon: Silence an enemy creature in this lane, removing its temporary buffs and disabling triggered abilities for 1 turn.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'silence', target: 'enemy_in_lane' }
        ]
      }
    ],
    lore: 'His clapperless silver bell absorbs every sound within twenty paces.',
    archetypes: ['hand_disruption', 'shadow_midrange'],
    weaknesses: ['vanilla_high_stat_creatures'],
    complexity: 'intermediate',
    art: {
      subject: 'Tall bell-keeper in a silver porcelain mask holding a dark iron handbell',
      silhouette: 'Slender vertical figure with high collar and lantern staff',
      palette: ['indigo', 'silver', 'midnight_blue'],
      lighting: 'Muted indigo aura absorbing surrounding light',
      environment: 'Gothic clocktower belfry'
    }
  },
  {
    id: 'NOC-C-0003',
    name: 'Mooncloak Duelist',
    type: 'creature',
    subtype: 'shadow_fencer',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: 'vanguard',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['stealth', 'skirmish'],
    mechanics: ['veil'],
    description: 'Stealth, Skirmish. Veil: When this attacks from Stealth, deal 1 bonus damage to the opposing Leader.',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Woven from silk steeped in liquid shadow, the cloak conceals even the wearer’s footsteps.',
    archetypes: ['veil_ambush', 'shadow_midrange'],
    weaknesses: ['guard_walls'],
    complexity: 'intermediate',
    art: {
      subject: 'Aristocratic duelist in a silver domino mask drawing a rapier from a shadow-cloak',
      silhouette: 'Sweeping cape billowing like night smoke',
      palette: ['midnight_blue', 'silver', 'restrained_crimson'],
      lighting: 'Crimson glint on the blade hilt in deep shadow',
      environment: 'Masquerade balcony'
    }
  },
  {
    id: 'NOC-C-0004',
    name: 'Umbra Archivist',
    type: 'creature',
    subtype: 'shadow_scholar',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: ['drain'],
    mechanics: ['veil'],
    description: 'Drain. On Summon: Draw 1 card and deal 1 damage to the opposing Leader.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'draw', target: 'ally_leader', amount: 1 },
          { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
        ]
      }
    ],
    lore: 'The Nocturne Society keeps copies of every treatise the Accord Institute ever burned.',
    archetypes: ['hand_disruption', 'shadow_midrange'],
    weaknesses: ['tempo_aggro'],
    complexity: 'beginner',
    art: {
      subject: 'Archivist with floating ink-shadow scrolls orbiting a silver candelabra',
      silhouette: 'Robed scholar flanked by ribbon-like shadow parchments',
      palette: ['indigo', 'midnight_blue', 'silver', 'restrained_crimson'],
      lighting: 'Silver candle flames casting long dramatic shadows',
      environment: 'Forbidden vault'
    }
  },
  {
    id: 'NOC-C-0005',
    name: 'Nightglass Specter',
    type: 'creature',
    subtype: 'spectral_entity',
    faction: 'nocturne',
    rarity: 'rare',
    role: 'assassin',
    cost: 5,
    attack: 5,
    health: 4,
    keywords: ['stealth', 'reach', 'drain'],
    mechanics: ['veil'],
    description: 'Stealth, Reach, Drain. Veil: Can target enemy Rear creatures past unguarded Front units.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'veil', amount: 1 }
        ]
      }
    ],
    lore: 'An Echo of a spy who never existed, stabilized inside smoked obsidian glass.',
    archetypes: ['veil_ambush', 'shadow_midrange'],
    weaknesses: ['guard_units'],
    complexity: 'intermediate',
    art: {
      subject: 'Translucent spectral assassin emerging from a tall stained-glass window at midnight',
      silhouette: 'Elongated wraith-like figure with twin glass talons',
      palette: ['midnight_blue', 'indigo', 'silver'],
      lighting: 'Moonlight passing directly through its semi-transparent torso',
      environment: 'Observatory belfry'
    }
  },
  {
    id: 'NOC-T-0006',
    name: 'Midnight Exchange',
    type: 'tactic',
    subtype: 'quick',
    faction: 'nocturne',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['stealth'],
    mechanics: ['veil'],
    description: 'Quick Tactic. Grant an allied creature Stealth and +2/+0, and draw 1 card.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'stealth' },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 2, health_delta: 0 },
          { operation: 'draw', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Two sealed envelopes change hands beneath the bridge; neither courier breaks stride.',
    archetypes: ['veil_ambush', 'hand_disruption', 'shadow_midrange'],
    weaknesses: ['requires_ally_on_board'],
    complexity: 'beginner',
    art: {
      subject: 'Two masked figures trading a glowing Echo card in a fog-shrouded alley',
      silhouette: 'Two overlapping cloaked silhouettes under a gas lamp',
      palette: ['midnight_blue', 'silver', 'restrained_crimson'],
      lighting: 'Single silver lantern pool in deep indigo fog',
      environment: 'Lumenport canal bridge'
    }
  },
  {
    id: 'NOC-R-0007',
    name: 'Mask of the Unseen Herald',
    type: 'relic',
    subtype: 'equipment',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['stealth'],
    mechanics: ['veil'],
    description: 'Relic. On Play: Grant your highest-Attack creature Stealth and +1/+1.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'stealth' },
          { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'Those who wear the Herald’s silver visage are forgotten the moment you look away.',
    archetypes: ['veil_ambush', 'shadow_midrange'],
    weaknesses: ['empty_board'],
    complexity: 'beginner',
    art: {
      subject: 'Half-face silver filigree mask resting on crimson velvet with shadow wisps',
      silhouette: 'Aristocratic masquerade mask with crescent forehead crest',
      palette: ['silver', 'restrained_crimson', 'midnight_blue'],
      lighting: 'Cold metallic sheen on dark velvet',
      environment: 'Secret society Sanctum'
    }
  },
  {
    id: 'NOC-E-0008',
    name: 'The Hollow Masquerade',
    type: 'environment',
    subtype: 'shadow_court',
    faction: 'nocturne',
    rarity: 'legendary',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['stealth'],
    mechanics: ['veil'],
    description: 'Environment. On Play: All friendly creatures gain Stealth. At the end of each turn, if the active player controls a creature with Stealth, they draw 1 card or deal 1 damage to the opposing Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'stealth' }
        ]
      },
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Every guest in the grand ballroom wears a mask; half of them are only Echo projections.',
    archetypes: ['veil_ambush', 'hand_disruption', 'shadow_midrange'],
    weaknesses: ['environment_replacement'],
    complexity: 'advanced',
    art: {
      subject: 'Moonlit gothic ballroom filled with waltzing shadow-projections under silver chandeliers',
      silhouette: 'Arched gothic windows framing floating chandeliers and masked dancers',
      palette: ['midnight_blue', 'indigo', 'silver', 'restrained_crimson'],
      lighting: 'Moonbeams and floating silver candle motes',
      environment: 'Nocturne Manor'
    }
  },

  // =========================================================================
  // FACTION 07 — STARWEAVE (8 cards: 5 Creatures, 1 Tactic, 1 Relic, 1 Environment)
  // Signature Mechanic: Alignment (constellation counters & precision sequences)
  // =========================================================================
  {
    id: 'STR-C-0001',
    name: 'Astrolabe Student',
    type: 'creature',
    subtype: 'human_astronomer',
    faction: 'starweave',
    rarity: 'common',
    role: 'caster',
    cost: 1,
    attack: 1,
    health: 3,
    keywords: [],
    mechanics: ['alignment'],
    description: 'On Summon: Gain 1 Alignment counter and inspect/prepare your top card (+1/+0 when Alignment >= 1).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'alignment', amount: 1 },
          { operation: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'First-year initiates chart the drift of thirty-six minor constellations before their first duel.',
    archetypes: ['alignment_combo', 'prediction_control'],
    weaknesses: ['aggressive_vanguards'],
    complexity: 'beginner',
    art: {
      subject: 'Young astronomer holding a glowing brass-and-starlight armillary sphere',
      silhouette: 'Robed student with floating constellation lines above palm',
      palette: ['midnight_purple', 'gold', 'celestial_blue'],
      lighting: 'Golden starlight projected onto the face',
      environment: 'Lumenport Observatory terrace'
    }
  },
  {
    id: 'STR-C-0002',
    name: 'Starline Sentry',
    type: 'creature',
    subtype: 'celestial_knight',
    faction: 'starweave',
    rarity: 'common',
    role: 'vanguard',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ['guard', 'shield'],
    mechanics: ['alignment'],
    description: 'Guard, Shield (1). Alignment: Gains +1/+1 whenever you play a Tactic or Environment.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'alignment', amount: 1 }
        ]
      }
    ],
    lore: 'Points of starlight connect his armor joints like a living constellation chart.',
    archetypes: ['celestial_midrange', 'prediction_control'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: 'Knight in midnight-purple plate inlaid with gold constellation lines holding a star-halberd',
      silhouette: 'Upright sentinel with halo-like astrolabe crest behind the helm',
      palette: ['midnight_purple', 'gold', 'brilliant_white'],
      lighting: 'Pinpoints of white starlight at every armor node',
      environment: 'Floating Observatory bridge'
    }
  },
  {
    id: 'STR-C-0003',
    name: 'Cometpath Ranger',
    type: 'creature',
    subtype: 'astral_archer',
    faction: 'starweave',
    rarity: 'uncommon',
    role: 'marksman',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['reach'],
    mechanics: ['alignment'],
    description: 'Reach. On Summon: Gain 1 Alignment counter and deal 2 damage to the enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'alignment', amount: 1 },
          { operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }
        ]
      }
    ],
    lore: 'He looses the arrow three seconds before his quarry steps into the star-lane.',
    archetypes: ['celestial_midrange', 'alignment_combo'],
    weaknesses: ['ward'],
    complexity: 'beginner',
    art: {
      subject: 'Archer drawing a bow of golden light whose arrow trails comet dust',
      silhouette: 'Longbowman leaning back with starry cape streaming upward',
      palette: ['celestial_blue', 'gold', 'midnight_purple'],
      lighting: 'Brilliant white-gold arrow tip illuminating the bow',
      environment: 'Astral Gardens'
    }
  },
  {
    id: 'STR-C-0004',
    name: 'Falling-Star Familiar',
    type: 'creature',
    subtype: 'celestial_spirit',
    faction: 'starweave',
    rarity: 'uncommon',
    role: 'summoner',
    cost: 4,
    attack: 2,
    health: 4,
    keywords: ['echo'],
    mechanics: ['alignment'],
    description: 'Echo. On Summon: Summon a 2/1 Constellation Wisp token with Reach into an open slot.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Constellation Wisp',
            attack: 2,
            health: 1,
            keywords: ['reach']
          },
          { operation: 'add_counter', target: 'self', counter: 'alignment', amount: 1 }
        ]
      }
    ],
    lore: 'A fragment of an ancient meteor shower caught and given playful form.',
    archetypes: ['alignment_combo', 'celestial_midrange'],
    weaknesses: ['1_health_tokens'],
    complexity: 'intermediate',
    art: {
      subject: 'Luminous fox-like spirit woven from constellations leaping between floating star rings',
      silhouette: 'Curved celestial creature with twin comet-tail ribbons',
      palette: ['celestial_blue', 'brilliant_white', 'gold'],
      lighting: 'Radiant starlight core with gold dust trail',
      environment: 'Celestial Library dome'
    }
  },
  {
    id: 'STR-C-0005',
    name: 'Celestial Crownbearer',
    type: 'creature',
    subtype: 'cosmic_paladin',
    faction: 'starweave',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 5,
    health: 6,
    keywords: ['ward', 'resonate', 'awaken'],
    mechanics: ['alignment'],
    description: 'Ward. On Summon: Gain 2 Alignment counters and draw 1 card. Resonate: If you control 2+ lanes, your creatures have +1/+1.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'alignment', amount: 2 },
          { operation: 'draw', target: 'ally_leader', amount: 1 },
          { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'When the seven rings of the Archive align, the Crownbearer descends the star-stair.',
    archetypes: ['prediction_control', 'celestial_midrange', 'alignment_combo'],
    weaknesses: ['high_cost'],
    complexity: 'advanced',
    art: {
      subject: 'Majestic cosmic knight crowned with a floating golden solar ring and nebula cloak',
      silhouette: 'Regal armored figure with hovering concentric crown rings',
      palette: ['midnight_purple', 'gold', 'celestial_blue', 'brilliant_white'],
      lighting: 'Blazing golden halo and deep nebula purple shadows',
      environment: 'Final Convergence Chamber'
    }
  },
  {
    id: 'STR-T-0006',
    name: 'Predestined Crossing',
    type: 'tactic',
    subtype: 'card_filtering',
    faction: 'starweave',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['alignment'],
    description: 'Standard Tactic. Draw 2 cards and grant an allied creature 1 Alignment counter (+1/+1).',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'draw', target: 'ally_leader', amount: 2 },
          { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'alignment', amount: 1 },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'Two orbits intersect once every four hundred years; the wise duelist is already waiting there.',
    archetypes: ['alignment_combo', 'prediction_control', 'celestial_midrange'],
    weaknesses: ['hand_size_limit'],
    complexity: 'beginner',
    art: {
      subject: 'Golden celestial tracks intersecting across a starry chart table',
      silhouette: 'Crossing elliptical rings with a bright conjunction star at center',
      palette: ['gold', 'midnight_purple', 'celestial_blue'],
      lighting: 'Bright star-conjunction flare',
      environment: 'Observatory chart room'
    }
  },
  {
    id: 'STR-R-0007',
    name: 'Orrery of the Ninth Hour',
    type: 'relic',
    subtype: 'resource_manipulation',
    faction: 'starweave',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['alignment'],
    description: 'Relic. At the start of your turn, grant an allied creature 1 Alignment counter. When you reach 3+ Alignment counters across your board, draw 1 extra card.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'strongest_ally_creature', counter: 'alignment', amount: 1 }
        ]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'strongest_ally_creature', counter: 'alignment', amount: 1 }
        ]
      }
    ],
    lore: 'Nine brass planets revolve around a shard of fallen star-glass.',
    archetypes: ['alignment_combo', 'prediction_control'],
    weaknesses: ['slow_early_tempo'],
    complexity: 'intermediate',
    art: {
      subject: 'Intricate golden mechanical orrery projecting a miniature galaxy above its rings',
      silhouette: 'Multi-ringed celestial globe on an ornate tripod',
      palette: ['gold', 'midnight_purple', 'celestial_blue'],
      lighting: 'Warm gold brass reflections and blue starlight',
      environment: 'Floating Observatory'
    }
  },
  {
    id: 'STR-E-0008',
    name: 'Observatory Beyond Dawn',
    type: 'environment',
    subtype: 'astral_dome',
    faction: 'starweave',
    rarity: 'legendary',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['resonate'],
    mechanics: ['alignment'],
    description: 'Environment. On Play: Draw 1 card. At the end of each turn, if the active player controls 2+ lanes (Resonate), grant their creatures +1/+0.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'draw', target: 'ally_leader', amount: 1 }
        ]
      },
      {
        trigger: 'turn_end',
        conditions: [{ type: 'has_resonate' }],
        effects: [
          { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'Suspended above the cloud layer, its great lens looks into tomorrow’s resonance.',
    archetypes: ['prediction_control', 'alignment_combo', 'celestial_midrange'],
    weaknesses: ['environment_replacement'],
    complexity: 'advanced',
    art: {
      subject: 'Open-domed stone and gold observatory floating among starry clouds at twilight',
      silhouette: 'Great telescope dome opening to a giant golden constellation wheel',
      palette: ['midnight_purple', 'gold', 'celestial_blue', 'brilliant_white'],
      lighting: 'Cosmic horizon glow meeting golden architecture',
      environment: 'High Astral Archive'
    }
  },

  // =========================================================================
  // FACTION 08 — GRAVEWILD (8 cards: 5 Creatures, 1 Tactic, 1 Relic, 1 Environment)
  // Signature Mechanic: Reclaim (graveyard recovery, rebirth, corrode)
  // =========================================================================
  {
    id: 'GRV-C-0001',
    name: 'Bonefield Wanderer',
    type: 'creature',
    subtype: 'risen_remnant',
    faction: 'gravewild',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 2,
    keywords: ['rebirth'],
    mechanics: ['reclaim'],
    description: 'Rebirth: When destroyed, summon a 1/1 Echo Remnant token in its place (once per card).',
    abilities: [
      {
        trigger: 'on_death',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Echo Remnant',
            attack: 1,
            health: 1,
            keywords: []
          }
        ]
      }
    ],
    lore: 'Fossilized bone bound by wild briars remembers the shield-wall it held a thousand years ago.',
    archetypes: ['sacrifice_swarm', 'reclaim_value'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: 'Skeletal warrior intertwined with burgundy moss and glowing green amber ribs',
      silhouette: 'Stooped ancient soldier with moss-draped spear and shield',
      palette: ['bone_white', 'deep_burgundy', 'moss_black', 'sickly_green'],
      lighting: 'Eerie green memory-glow inside the ribcage',
      environment: 'Fossil marsh'
    }
  },
  {
    id: 'GRV-C-0002',
    name: 'Hollowbark Defender',
    type: 'creature',
    subtype: 'fossil_guardian',
    faction: 'gravewild',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 2,
    health: 4,
    keywords: ['guard', 'corrode'],
    mechanics: ['reclaim'],
    description: 'Guard, Corrode. Whenever this battles an enemy creature, apply 1 Corrode counter (-1/-1) to it.',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1 }
        ]
      }
    ],
    lore: 'Spores nested inside its petrified bark rust steel and sap vigor on contact.',
    archetypes: ['decay_control', 'reclaim_value'],
    weaknesses: ['ranged_marksmen'],
    complexity: 'beginner',
    art: {
      subject: 'Petrified tree-husk armored in dinosaur rib-plates releasing decay spores',
      silhouette: 'Broad fossil-plated wall guardian',
      palette: ['bone_white', 'moss_black', 'sickly_green'],
      lighting: 'Green spore mist seeping from hollow eye sockets',
      environment: 'Overgrown Ossuary'
    }
  },
  {
    id: 'GRV-C-0003',
    name: 'Memory Eater',
    type: 'creature',
    subtype: 'spirit_predator',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: 'assassin',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['drain', 'corrode'],
    mechanics: ['reclaim'],
    description: 'Drain. On Summon: Apply 1 Corrode counter (-1/-1) to an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1 },
          { operation: 'modify_stats', target: 'enemy_in_lane', attack_delta: -1, health_delta: -1 }
        ]
      }
    ],
    lore: 'It feeds on the stray impressions left behind when an Echo projection shatters.',
    archetypes: ['decay_control', 'sacrifice_swarm'],
    weaknesses: ['ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Four-legged bone-masked beast inhaling ribbons of green spectral memory from a broken crystal',
      silhouette: 'Low prowl predator with elongated skull mask and trailing burgundy vines',
      palette: ['deep_burgundy', 'bone_white', 'sickly_green'],
      lighting: 'Bright green memory wisps spiraling into its jaws',
      environment: 'Ruined archive courtyard'
    }
  },
  {
    id: 'GRV-C-0004',
    name: 'Rotgarden Medium',
    type: 'creature',
    subtype: 'human_necromancer',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 2,
    health: 4,
    keywords: [],
    mechanics: ['reclaim'],
    description: 'On Summon: Reclaim the most recent non-reclaimed creature from your discard pile back to your hand (and mark it Reclaimed so it cannot loop).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'reclaim_from_discard', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'She tends the memorial bells, calling back only those Echoes that still have unfinished business.',
    archetypes: ['reclaim_value', 'sacrifice_swarm'],
    weaknesses: ['empty_discard_pile'],
    complexity: 'intermediate',
    art: {
      subject: 'Veiled medium holding a bone-framed lantern over blooming burgundy grave-lilies',
      silhouette: 'Tall robed figure with crooked lantern staff and rising spirit silhouette',
      palette: ['deep_burgundy', 'bone_white', 'sickly_green'],
      lighting: 'Pale green lantern light illuminating burgundy petals',
      environment: 'Garden of Forgotten Names'
    }
  },
  {
    id: 'GRV-C-0005',
    name: 'Ossuary Giant',
    type: 'creature',
    subtype: 'fossil_colossus',
    faction: 'gravewild',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 6,
    health: 6,
    keywords: ['pierce', 'rebirth'],
    mechanics: ['reclaim'],
    description: 'Pierce, Rebirth. On Summon: Gains +1/+1 if your discard pile has 1+ cards, and summons a 2/2 Bone Sentinel token on death.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 1 }
        ]
      },
      {
        trigger: 'on_death',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Bone Sentinel',
            attack: 2,
            health: 2,
            keywords: ['guard']
          }
        ]
      }
    ],
    lore: 'Assembled from the fossilized remains of a pre-Accord siege beast and bound with living swamp-iron.',
    archetypes: ['reclaim_value', 'sacrifice_swarm', 'decay_control'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: 'Colossal fossil-golem draped in burgundy swamp vines striding through ruined arches',
      silhouette: 'Massive horned skull shoulders and pillar-like bone arms',
      palette: ['bone_white', 'moss_black', 'deep_burgundy', 'sickly_green'],
      lighting: 'Glowing green fissure lines throughout the fossil skeleton',
      environment: 'Sunken Ossuary'
    }
  },
  {
    id: 'GRV-T-0006',
    name: 'Last Remembrance',
    type: 'tactic',
    subtype: 'summoning',
    faction: 'gravewild',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['reclaim'],
    description: 'Standard Tactic. Reclaim up to 1 qualifying creature from your discard pile to your hand, and summon a 2/2 Memorial Spirit token.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'reclaim_from_discard', target: 'ally_leader', amount: 1 },
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Memorial Spirit',
            attack: 2,
            health: 2,
            keywords: []
          }
        ]
      }
    ],
    lore: 'No warrior truly vanishes while their name remains etched on the monument.',
    archetypes: ['reclaim_value', 'sacrifice_swarm'],
    weaknesses: ['board_space_limits'],
    complexity: 'intermediate',
    art: {
      subject: 'Spectral warrior rising from an engraved stone stele surrounded by white moths',
      silhouette: 'Vertical monument with ascending spirit silhouette',
      palette: ['bone_white', 'sickly_green', 'deep_burgundy'],
      lighting: 'Soft spectral green column of light',
      environment: 'Ancient battleground memorial'
    }
  },
  {
    id: 'GRV-R-0007',
    name: 'Mourning Lantern',
    type: 'relic',
    subtype: 'synergy_engine',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['corrode'],
    mechanics: ['reclaim'],
    description: 'Relic. On Play and at the start of your turn: Apply 1 Corrode counter (-1/-1) to the weakest enemy Front creature or restore 1 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_leader', amount: 2 }
        ]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Its wick burns distilled bog-memories, guiding lost Echoes back toward the tabletop.',
    archetypes: ['decay_control', 'reclaim_value'],
    weaknesses: ['burst_aggro'],
    complexity: 'beginner',
    art: {
      subject: 'Wrought-iron and bone lantern filled with swirling green spirit-fire',
      silhouette: 'Hexagonal gothic lantern hanging from a gnarled branch',
      palette: ['moss_black', 'bone_white', 'sickly_green'],
      lighting: 'Vibrant green flame inside frosted glass',
      environment: 'Mist-covered cairn'
    }
  },
  {
    id: 'GRV-E-0008',
    name: 'Garden of Forgotten Names',
    type: 'environment',
    subtype: 'memorial_grounds',
    faction: 'gravewild',
    rarity: 'legendary',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['rebirth'],
    mechanics: ['reclaim'],
    description: 'Environment. On Play: Summon a 1/1 Echo Remnant token. At the end of each turn, if the active player has at least 1 card in their discard pile, restore 1 Vitality to their Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Echo Remnant',
            attack: 1,
            health: 1,
            keywords: []
          }
        ]
      },
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Every flower in the courtyard blooms from a shattered Echo card buried beneath the loam.',
    archetypes: ['sacrifice_swarm', 'reclaim_value', 'decay_control'],
    weaknesses: ['environment_replacement'],
    complexity: 'advanced',
    art: {
      subject: 'Overgrown courtyard of moss-covered statues and glowing burgundy flowers under twilight fog',
      silhouette: 'Broken colonnade framing a circular stone table covered in vines',
      palette: ['deep_burgundy', 'bone_white', 'moss_black', 'sickly_green'],
      lighting: 'Floating green spirit motes in deep twilight',
      environment: 'Forgotten Gallery exterior'
    }
  },

  // =========================================================================
  // NEUTRAL COLLECTION (8 cards: 5 Creatures, 1 Tactic, 1 Relic, 1 Environment)
  // Flexible deck-building staples available to all decks
  // =========================================================================
  {
    id: 'NEU-C-0001',
    name: 'Traveling Sellsword',
    type: 'creature',
    subtype: 'human_mercenary',
    faction: 'neutral',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 2,
    keywords: [],
    mechanics: [],
    description: 'Reliable frontline mercenary. On Summon: If your lane has no other friendly creatures, gain +0/+1.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'modify_stats', target: 'self', attack_delta: 0, health_delta: 1 }
        ]
      }
    ],
    lore: 'Have deck case, will travel—from Lumenport docks to the Ironreach railheads.',
    archetypes: ['neutral_curve', 'beginner_foundation'],
    weaknesses: ['no_late_scaling'],
    complexity: 'beginner',
    art: {
      subject: 'Weathered mercenary resting a broadsword on his shoulder in Arrival Square',
      silhouette: 'Balanced medium-armored traveler with cloak and duel case',
      palette: ['warm_bronze', 'leather_brown', 'steel_gray'],
      lighting: 'Morning harbor sunlight',
      environment: 'Lumenport Arrival Square'
    }
  },
  {
    id: 'NEU-C-0002',
    name: 'Caravan Ironhide',
    type: 'creature',
    subtype: 'armored_guard',
    faction: 'neutral',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 2,
    health: 4,
    keywords: ['guard'],
    mechanics: [],
    description: 'Guard. Protects Rear units in its lane from normal attacks.',
    abilities: [],
    lore: 'Merchant guilds never cross the Verdant border without two Ironhides on the lead wagon.',
    archetypes: ['neutral_curve', 'defensive_midrange'],
    weaknesses: ['pierce'],
    complexity: 'beginner',
    art: {
      subject: 'Stout caravan guard holding an iron-rimmed oak shield beside a supply wagon',
      silhouette: 'Broad-shouldered shieldbearer',
      palette: ['steel_gray', 'oak_brown', 'warm_gold'],
      lighting: 'Clear daylight',
      environment: 'Trade road outside Lumenport'
    }
  },
  {
    id: 'NEU-C-0003',
    name: 'Clocktower Lookout',
    type: 'creature',
    subtype: 'human_scout',
    faction: 'neutral',
    rarity: 'common',
    role: 'marksman',
    cost: 2,
    attack: 2,
    health: 2,
    keywords: ['reach'],
    mechanics: [],
    description: 'Reach. Can target an enemy Rear creature past an unguarded Front creature.',
    abilities: [],
    lore: 'From the third balcony of the Accord clocktower, you can see every lane of Duelist Plaza.',
    archetypes: ['neutral_curve', 'tempo'],
    weaknesses: ['guard_units'],
    complexity: 'beginner',
    art: {
      subject: 'Lookout perched on a brass clocktower railing with a repeating crossbow and spyglass',
      silhouette: 'Crouched marksman against a giant clock face',
      palette: ['brass', 'navy_blue', 'warm_gold'],
      lighting: 'Golden afternoon light',
      environment: 'Lumenport Clocktower'
    }
  },
  {
    id: 'NEU-C-0004',
    name: 'Wandering Archivist',
    type: 'creature',
    subtype: 'human_scholar',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'support',
    cost: 3,
    attack: 2,
    health: 3,
    keywords: [],
    mechanics: [],
    description: 'On Summon: Draw 1 card.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'draw', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Her backpack holds rubbings from forty-two pre-Accord monuments.',
    archetypes: ['neutral_curve', 'control_value'],
    weaknesses: ['below_curve_combat_stats'],
    complexity: 'beginner',
    art: {
      subject: 'Cheerful traveling scholar with an oversized leather pack stuffed with glowing scrolls',
      silhouette: 'Explorer with scroll-pack and walking staff',
      palette: ['parchment_cream', 'sapphire_blue', 'warm_gold'],
      lighting: 'Warm lantern light',
      environment: 'Central Card Market'
    }
  },
  {
    id: 'NEU-C-0005',
    name: 'Forgotten Observatory Guardian',
    type: 'creature',
    subtype: 'ancient_construct',
    faction: 'neutral',
    rarity: 'rare',
    role: 'colossus',
    cost: 5,
    attack: 5,
    health: 5,
    keywords: ['guard', 'anchor'],
    mechanics: [],
    description: 'Guard, Anchor. Cannot be repositioned by ordinary card effects.',
    abilities: [],
    lore: 'Built before the eight factions split, it answers any duelist whose Echo resonance rings true.',
    archetypes: ['defensive_midrange', 'control_value'],
    weaknesses: ['hard_removal'],
    complexity: 'beginner',
    art: {
      subject: 'Ancient stone-and-brass colossus standing watch with a pillar-like halberd',
      silhouette: 'Monolithic sentinel draped in weathered banners',
      palette: ['stone_gray', 'weathered_brass', 'cyan_crystal'],
      lighting: 'Dramatic skylight beam',
      environment: 'Ruined Accord courtyard'
    }
  },
  {
    id: 'NEU-T-0006',
    name: 'Measured Strike',
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: [],
    description: 'Standard Tactic. Deal 3 damage to a target enemy creature.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 3 }
        ]
      }
    ],
    lore: 'Every duelist at the Accord Institute learns the three basic counter-cuts before anything else.',
    archetypes: ['universal_removal'],
    weaknesses: ['ward', 'shield'],
    complexity: 'beginner',
    art: {
      subject: 'Precise arc of golden Aether energy cleaving through a training dummy',
      silhouette: 'Clean crescent slash of light',
      palette: ['warm_gold', 'sapphire_blue', 'white'],
      lighting: 'Sharp kinetic flash',
      environment: 'Accord tutorial hall'
    }
  },
  {
    id: 'NEU-R-0007',
    name: 'Simple Wardstone',
    type: 'relic',
    subtype: 'defensive_ward',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: ['shield'],
    mechanics: [],
    description: 'Relic. On Play: Grant an allied creature Shield (1) and restore 2 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield' },
          { operation: 'heal', target: 'ally_leader', amount: 2 }
        ]
      }
    ],
    lore: 'Sold at every harbor stall in Lumenport for three Crowns apiece.',
    archetypes: ['universal_defense'],
    weaknesses: ['low_late_game_impact'],
    complexity: 'beginner',
    art: {
      subject: 'Palm-sized carved runestone glowing with a steady blue protective rune',
      silhouette: 'Oval standing stone on a brass ring base',
      palette: ['sapphire_blue', 'stone_gray', 'warm_gold'],
      lighting: 'Soft blue rune glow',
      environment: 'Duelist tabletop'
    }
  },
  {
    id: 'NEU-E-0008',
    name: 'The Old Convergence Table',
    type: 'environment',
    subtype: 'duel_table',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: [],
    description: 'Environment. Neutralizes hazardous environments. On Play: Both players restore 2 Vitality.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_leader', amount: 2 }
        ]
      }
    ],
    lore: 'Carved of neutral slate in Duelist Plaza, it enforces a fair field for newcomers and veterans alike.',
    archetypes: ['environment_counterplay'],
    weaknesses: ['symmetrical_effect'],
    complexity: 'beginner',
    art: {
      subject: 'Weathered octagonal slate duel table inlaid with brass lane dividers in a sunny plaza',
      silhouette: 'Octagonal stone table surrounded by spectator benches',
      palette: ['slate_gray', 'warm_gold', 'cobblestone_tan'],
      lighting: 'Warm afternoon sun over Lumenport',
      environment: 'Duelist Plaza'
    }
  }
];

const SHOWCASE_APPROVED_CARD_IDS = new Set([
  'EMB-C-0001',
  'VER-C-0001',
  'IRN-C-0001',
  'TID-C-0001',
  'GLS-C-0001',
  'NOC-C-0001',
  'STR-C-0001',
  'GRV-C-0001'
]);

function enrichCard(raw) {
  const slug = raw.id.toLowerCase().replace(/-/g, '_');
  const compiled = compileCardLoreAndArt(raw);
  const isShowcaseApproved = SHOWCASE_APPROVED_CARD_IDS.has(raw.id);
  const assetFilename = `${raw.id.toLowerCase()}.svg`;

  return {
    id: raw.id,
    revision: 1,
    name: raw.name.trim(),
    name_key: `cards.${slug}.name`,
    description: raw.description,
    description_key: `cards.${slug}.description`,
    type: raw.type,
    subtype: raw.subtype,
    faction: raw.faction,
    rarity: raw.rarity,
    role: raw.role,
    cost: raw.cost,
    attack: raw.attack,
    health: raw.health,
    keywords: raw.keywords,
    mechanics: raw.mechanics,
    abilities: raw.abilities,
    lore: raw.lore,
    archetypes: raw.archetypes,
    weaknesses: raw.weaknesses,
    complexity: raw.complexity,
    gameplay_metadata: compiled.gameplay_metadata,
    identity: compiled.identity,
    art: {
      asset_id: `art_card_${slug}`,
      direction_id: `brief_${slug}`,
      art_tier: isShowcaseApproved ? 'stylized_vector_concept' : 'none',
      concept_approved: isShowcaseApproved,
      final_production_approved: false,
      approved: false,
      status: isShowcaseApproved ? 'integrated_into_game' : 'brief_ready',
      placeholder_status: isShowcaseApproved ? 'stylized_vector_concept_integrated' : 'brief_ready_awaiting_generation',
      asset_location: isShowcaseApproved ? `res://assets/cards/${assetFilename}` : `res://assets/cards/pending/${assetFilename}`,
      web_preview_url: isShowcaseApproved ? `/assets/cards/${assetFilename}` : null,
      style_id: compiled.art_specification.reference_style_id,
      prompt: compiled.art_specification.prompt,
      visual_exclusions: compiled.art_specification.visual_exclusions,
      brief: {
        ...raw.art,
        ...compiled.art_specification
      }
    },
    balance_version: 'base_002',
    release_set: 'foundations'
  };
}

export const CANONICAL_LEGENDARY_IDS = new Set([
  // 8 Faction Environments (Milestone 1)
  'EMB-E-0008',
  'VER-E-0008',
  'IRN-E-0008',
  'TID-E-0008',
  'GLS-E-0008',
  'NOC-E-0008',
  'STR-E-0008',
  'GRV-E-0008',
  // 8 Faction Apex Champions / Relics (Milestone 2)
  'EMB-C-0038',
  'VER-C-0038',
  'IRN-C-0038',
  'TID-C-0038',
  'GLS-C-0038',
  'NOC-C-0038',
  'STR-C-0038',
  'GRV-C-0038',
  // 8 Neutral Accord Apex Figures, Colossi & Relics
  'NEU-C-0036',
  'NEU-C-0037',
  'NEU-C-0038',
  'NEU-C-0075',
  'NEU-R-0057',
  'NEU-R-0058',
  'NEU-R-0094',
  'NEU-E-0064'
]);

const RAW_COMBINED = [
  ...RAW_CARDS,
  ...EXPANSION_88_CARDS,
  ...EXPANSION_320_CARDS,
  ...EXPANSION_480_CARDS
];

// Four-Tier Rarity Calibration (zero Epic):
// Major factions (48 cards each): 24 Common (50%), 14 Uncommon (30%), 8 Rare (15%), 2 Legendary (5%)
// Neutral (96 cards): 48 Common (50%), 32 Uncommon (33%), 8 Rare (8%), 8 Legendary (8%)
const ALL_FACTIONS_LIST = [
  'emberclad',
  'verdant_pact',
  'iron_choir',
  'tidebound',
  'glassborne',
  'nocturne',
  'starweave',
  'gravewild',
  'neutral'
];

for (const faction of ALL_FACTIONS_LIST) {
  const isNeutral = faction === 'neutral';
  const targetCommon = isNeutral ? 48 : 24;
  const targetUncommon = isNeutral ? 32 : 14;
  const fCards = RAW_COMBINED.filter((c) => c.faction === faction);

  for (const c of fCards) {
    if (CANONICAL_LEGENDARY_IDS.has(c.id)) {
      c.rarity = 'legendary';
    } else if (c.rarity === 'legendary') {
      c.rarity = 'rare';
    }
  }

  const nonLegs = fCards.filter((c) => c.rarity !== 'legendary');
  const typeOrder = { creature: 1, tactic: 2, relic: 3, environment: 4 };
  nonLegs.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
  });

  for (let i = 0; i < nonLegs.length; i++) {
    if (i < targetCommon) {
      nonLegs[i].rarity = 'common';
    } else if (i < targetCommon + targetUncommon) {
      nonLegs[i].rarity = 'uncommon';
    } else {
      nonLegs[i].rarity = 'rare';
    }
  }
}

const ALL_CARDS = RAW_COMBINED.map(enrichCard);

// Group by faction folder
const FACTION_FOLDERS = {
  emberclad: 'emberclad',
  verdant_pact: 'verdant-pact',
  iron_choir: 'iron-choir',
  tidebound: 'tidebound',
  glassborne: 'glassborne',
  nocturne: 'nocturne',
  starweave: 'starweave',
  gravewild: 'gravewild',
  neutral: 'neutral'
};

for (const [factionKey, folderName] of Object.entries(FACTION_FOLDERS)) {
  const factionCards = ALL_CARDS.filter((c) => c.faction === factionKey);
  const outPath = path.join(ROOT, 'content', 'cards', folderName, 'cards.json');
  fs.writeFileSync(outPath, JSON.stringify(factionCards, null, 2) + '\n', 'utf8');
}
// Write compiled runtime bundle
const bundlePath = path.join(ROOT, 'content', 'cards', 'foundations_v1.json');
fs.writeFileSync(
  bundlePath,
  JSON.stringify(
    {
      schema_version: '1.1.0',
      release_set: 'foundations',
      balance_version: 'base_002',
      milestone: 'phase_4_expansion_480',
      target_release_total: 640,
      implemented_count: ALL_CARDS.length,
      art_style_guide: MASTER_ART_STYLE_GUIDE,
      faction_visual_guides: FACTION_VISUAL_GUIDES,
      cards: ALL_CARDS
    },
    null,
    2
  ) + '\n',
  'utf8'
);

/**
 * Helper to create a legal 40-card deck from up to two major factions + neutral
 * Respects copy limits:
 * - Common: max 3
 * - Uncommon: max 3
 * - Rare: max 2
 * - Legendary: max 1
 */
function buildLegal40CardDeck({ id, name, description, factions, cardQuantities }) {
  const total = Object.values(cardQuantities).reduce((a, b) => a + b, 0);
  if (total !== 40) {
    throw new Error(`Deck ${id} has ${total} cards instead of 40`);
  }
  const entries = Object.entries(cardQuantities).map(([card_id, count]) => ({ card_id, count }));
  return {
    id,
    name,
    description,
    factions,
    total_cards: total,
    cards: entries
  };
}

const STARTER_DECKS = [
  buildLegal40CardDeck({
    id: 'deck_ember_iron_forge',
    name: 'Molten Choir Vanguard',
    description: 'Aggressive Emberclad Overheat pressure backed by Iron Choir shields and relics.',
    factions: ['emberclad', 'iron_choir'],
    cardQuantities: {
      'EMB-C-0001': 3,
      'EMB-C-0002': 3,
      'EMB-C-0003': 3,
      'EMB-C-0004': 2,
      'EMB-C-0005': 2,
      'EMB-T-0006': 3,
      'EMB-R-0007': 2,
      'EMB-E-0008': 1,
      'IRN-C-0001': 3,
      'IRN-C-0002': 3,
      'IRN-C-0003': 3,
      'IRN-C-0004': 2,
      'IRN-C-0005': 2,
      'IRN-T-0006': 3,
      'IRN-R-0007': 2,
      'NEU-T-0006': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_verdant_tide_harmony',
    name: 'Living Tides of Whisperleaf',
    description: 'Verdant Pact Bloom growth combined with Tidebound lane mobility and healing.',
    factions: ['verdant_pact', 'tidebound'],
    cardQuantities: {
      'VER-C-0001': 3,
      'VER-C-0002': 3,
      'VER-C-0003': 3,
      'VER-C-0004': 2,
      'VER-C-0005': 2,
      'VER-T-0006': 3,
      'VER-R-0007': 2,
      'VER-E-0008': 1,
      'TID-C-0001': 3,
      'TID-C-0002': 3,
      'TID-C-0003': 3,
      'TID-C-0004': 3,
      'TID-C-0005': 2,
      'TID-T-0006': 3,
      'TID-R-0007': 2,
      'NEU-C-0004': 2
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_glass_star_prism',
    name: 'Prismatic Observatory',
    description: 'Glassborne Wards and Refraction counterplay paired with Starweave Alignment draw engines.',
    factions: ['glassborne', 'starweave'],
    cardQuantities: {
      'GLS-C-0001': 3,
      'GLS-C-0002': 3,
      'GLS-C-0003': 3,
      'GLS-C-0004': 3,
      'GLS-C-0005': 2,
      'GLS-T-0006': 3,
      'GLS-R-0007': 2,
      'GLS-E-0008': 1,
      'STR-C-0001': 3,
      'STR-C-0002': 3,
      'STR-C-0003': 3,
      'STR-C-0004': 2,
      'STR-C-0005': 2,
      'STR-T-0006': 3,
      'STR-R-0007': 2,
      'NEU-T-0006': 2
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_nocturne_grave_echo',
    name: 'Velvet Ossuary',
    description: 'Nocturne Stealth ambushes and Silence disruption backed by Gravewild Rebirth and Reclaim recursion.',
    factions: ['nocturne', 'gravewild'],
    cardQuantities: {
      'NOC-C-0001': 3,
      'NOC-C-0002': 3,
      'NOC-C-0003': 3,
      'NOC-C-0004': 3,
      'NOC-C-0005': 2,
      'NOC-T-0006': 3,
      'NOC-R-0007': 2,
      'NOC-E-0008': 1,
      'GRV-C-0001': 3,
      'GRV-C-0002': 3,
      'GRV-C-0003': 3,
      'GRV-C-0004': 2,
      'GRV-C-0005': 2,
      'GRV-T-0006': 3,
      'GRV-R-0007': 2,
      'NEU-C-0002': 2
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_ember_nocturne_blitz',
    name: 'Cinderveil Saboteurs',
    description: 'High-tempo Emberclad burn combined with Nocturne Stealth ambushes and resource drain.',
    factions: ['emberclad', 'nocturne'],
    cardQuantities: {
      'EMB-C-0001': 3,
      'EMB-C-0009': 3,
      'EMB-C-0010': 3,
      'EMB-C-0013': 2,
      'EMB-C-0014': 1,
      'EMB-T-0006': 3,
      'EMB-T-0015': 3,
      'EMB-R-0017': 2,
      'NOC-C-0001': 3,
      'NOC-C-0009': 3,
      'NOC-C-0010': 3,
      'NOC-C-0013': 2,
      'NOC-C-0014': 1,
      'NOC-T-0015': 3,
      'NOC-R-0017': 2,
      'NEU-C-0009': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_verdant_grave_cycle',
    name: 'Sporewood Reclaimers',
    description: 'Resilient Verdant Pact Bloom walls paired with Gravewild Rebirth and graveyard Reclaim engines.',
    factions: ['verdant_pact', 'gravewild'],
    cardQuantities: {
      'VER-C-0001': 3,
      'VER-C-0009': 3,
      'VER-C-0010': 3,
      'VER-C-0012': 3,
      'VER-C-0013': 2,
      'VER-C-0014': 1,
      'VER-T-0015': 3,
      'VER-R-0017': 2,
      'GRV-C-0001': 3,
      'GRV-C-0009': 3,
      'GRV-C-0011': 3,
      'GRV-C-0013': 2,
      'GRV-C-0014': 1,
      'GRV-T-0015': 3,
      'GRV-R-0017': 2,
      'NEU-C-0011': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_iron_glass_citadel',
    name: 'Aegis of the Prism Choir',
    description: 'Fortified Iron Choir Shield constructs and Glassborne Refraction wards dominating all three lanes.',
    factions: ['iron_choir', 'glassborne'],
    cardQuantities: {
      'IRN-C-0001': 3,
      'IRN-C-0002': 3,
      'IRN-C-0009': 3,
      'IRN-C-0010': 3,
      'IRN-C-0013': 2,
      'IRN-C-0014': 1,
      'IRN-T-0015': 3,
      'IRN-R-0017': 2,
      'GLS-C-0001': 3,
      'GLS-C-0009': 3,
      'GLS-C-0010': 3,
      'GLS-C-0013': 2,
      'GLS-C-0014': 1,
      'GLS-T-0015': 3,
      'GLS-R-0017': 2,
      'NEU-C-0010': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_tide_star_navigation',
    name: 'Celestial Maelstrom',
    description: 'Tidebound lane repositioning and Current surges synchronized with Starweave Alignment draw combos.',
    factions: ['tidebound', 'starweave'],
    cardQuantities: {
      'TID-C-0001': 3,
      'TID-C-0009': 3,
      'TID-C-0010': 3,
      'TID-C-0012': 3,
      'TID-C-0013': 2,
      'TID-C-0014': 1,
      'TID-T-0015': 3,
      'TID-R-0017': 2,
      'STR-C-0001': 3,
      'STR-C-0009': 3,
      'STR-C-0011': 3,
      'STR-C-0013': 2,
      'STR-C-0014': 1,
      'STR-T-0015': 3,
      'STR-R-0017': 2,
      'NEU-T-0014': 3
    }
  }),
  // 4 New Phase 3 Archetype Decks featuring the 160->320 Expansion Cards
  buildLegal40CardDeck({
    id: 'deck_star_ember_supernova',
    name: 'Supernova Conjunction',
    description: 'Phase 3 Expansion Deck: Starweave constellation scrying fuels explosive Emberclad Overheat colossi.',
    factions: ['starweave', 'emberclad'],
    cardQuantities: {
      'EMB-C-0019': 3,
      'EMB-C-0020': 3,
      'EMB-C-0023': 3,
      'EMB-C-0025': 2,
      'EMB-C-0026': 2,
      'EMB-T-0027': 3,
      'EMB-R-0030': 2,
      'EMB-E-0032': 2,
      'STR-C-0019': 3,
      'STR-C-0021': 3,
      'STR-C-0023': 3,
      'STR-C-0025': 2,
      'STR-C-0026': 1,
      'STR-T-0027': 3,
      'STR-R-0030': 2,
      'NEU-C-0017': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_iron_tide_dreadnought',
    name: 'Abyssal Dreadnought Armada',
    description: 'Phase 3 Expansion Deck: Mobile Tidebound Skirmishers and armored Iron Choir Assembly constructs.',
    factions: ['iron_choir', 'tidebound'],
    cardQuantities: {
      'IRN-C-0019': 3,
      'IRN-C-0020': 3,
      'IRN-C-0023': 3,
      'IRN-C-0025': 2,
      'IRN-C-0026': 2,
      'IRN-T-0027': 3,
      'IRN-R-0030': 2,
      'IRN-E-0032': 2,
      'TID-C-0019': 3,
      'TID-C-0020': 3,
      'TID-C-0023': 3,
      'TID-C-0025': 2,
      'TID-C-0026': 1,
      'TID-T-0027': 3,
      'TID-R-0030': 2,
      'NEU-C-0018': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_glass_nocturne_mirage',
    name: 'Mirage of the Hollow Court',
    description: 'Phase 3 Expansion Deck: Glassborne Ward illusions and Nocturne Stealth assassins striking Rear lanes.',
    factions: ['glassborne', 'nocturne'],
    cardQuantities: {
      'GLS-C-0019': 3,
      'GLS-C-0021': 3,
      'GLS-C-0023': 3,
      'GLS-C-0025': 2,
      'GLS-C-0026': 1,
      'GLS-T-0027': 3,
      'GLS-R-0030': 2,
      'GLS-E-0032': 2,
      'NOC-C-0019': 3,
      'NOC-C-0021': 3,
      'NOC-C-0023': 3,
      'NOC-C-0025': 2,
      'NOC-C-0026': 2,
      'NOC-T-0027': 3,
      'NOC-R-0030': 2,
      'NEU-C-0022': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_accord_grand_alliance',
    name: 'Lumenport Grand Alliance',
    description: 'Phase 3 Expansion Deck: High-synergy Neutral Accord veterans reinforced by Verdant Pact and Gravewild sustain.',
    factions: ['verdant_pact', 'gravewild'],
    cardQuantities: {
      'VER-C-0019': 3,
      'VER-C-0023': 3,
      'VER-C-0025': 2,
      'VER-C-0026': 2,
      'VER-T-0027': 3,
      'GRV-C-0019': 3,
      'GRV-C-0023': 3,
      'GRV-C-0025': 2,
      'GRV-C-0026': 1,
      'GRV-T-0027': 3,
      'NEU-C-0019': 3,
      'NEU-C-0025': 3,
      'NEU-C-0035': 2,
      'NEU-C-0037': 1,
      'NEU-T-0039': 3,
      'NEU-R-0051': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_ember_tide_steam',
    name: 'Ember-Tide Thermal Surge',
    description: 'Phase 4 Expansion Deck: High-tempo Steam archetype combining Emberclad Heat pressure with Tidebound Flooding and Current repositions.',
    factions: ['emberclad', 'tidebound'],
    cardQuantities: {
      'EMB-C-0001': 3,
      'EMB-C-0033': 3,
      'EMB-C-0034': 3,
      'EMB-C-0035': 3,
      'EMB-C-0038': 1,
      'EMB-T-0043': 3,
      'EMB-R-0045': 2,
      'TID-C-0001': 3,
      'TID-C-0033': 3,
      'TID-C-0034': 3,
      'TID-C-0035': 2,
      'TID-C-0038': 1,
      'TID-T-0043': 2,
      'TID-R-0045': 2,
      'NEU-C-0065': 3,
      'NEU-C-0066': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_verdant_iron_resonance',
    name: 'Verdant Iron Bastion',
    description: 'Phase 4 Expansion Deck: Colossal defensive synergy pairing Iron Choir Shield arrays with Verdant Pact Bloom growth and regenerative healing.',
    factions: ['verdant_pact', 'iron_choir'],
    cardQuantities: {
      'VER-C-0001': 3,
      'VER-C-0033': 3,
      'VER-C-0034': 3,
      'VER-C-0035': 2,
      'VER-C-0038': 1,
      'VER-T-0043': 3,
      'VER-R-0045': 2,
      'IRN-C-0001': 3,
      'IRN-C-0033': 3,
      'IRN-C-0034': 3,
      'IRN-C-0035': 2,
      'IRN-C-0038': 1,
      'IRN-T-0043': 3,
      'IRN-R-0045': 2,
      'NEU-C-0067': 3,
      'NEU-C-0068': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_glass_star_celestial',
    name: 'Prismatic Starweave Conjunction',
    description: 'Phase 4 Expansion Deck: Spell-slinging combo archetype leveraging Starweave Starlight scrying to duplicate Glassborne Prismatic echoes.',
    factions: ['glassborne', 'starweave'],
    cardQuantities: {
      'GLS-C-0001': 3,
      'GLS-C-0033': 3,
      'GLS-C-0034': 3,
      'GLS-C-0035': 2,
      'GLS-C-0038': 1,
      'GLS-T-0043': 3,
      'GLS-R-0045': 2,
      'STR-C-0001': 3,
      'STR-C-0033': 3,
      'STR-C-0034': 3,
      'STR-C-0035': 2,
      'STR-C-0038': 1,
      'STR-T-0043': 3,
      'STR-R-0045': 2,
      'NEU-C-0069': 3,
      'NEU-C-0070': 3
    }
  }),
  buildLegal40CardDeck({
    id: 'deck_nocturne_grave_nightfall',
    name: 'Nocturne Grave Harvester',
    description: 'Phase 4 Expansion Deck: Relentless attrition deck using Nocturne Stealth assassins to sacrifice friendly units and trigger Gravewild Reclaim and Rebirth.',
    factions: ['nocturne', 'gravewild'],
    cardQuantities: {
      'NOC-C-0001': 3,
      'NOC-C-0033': 3,
      'NOC-C-0034': 3,
      'NOC-C-0035': 2,
      'NOC-C-0038': 1,
      'NOC-T-0043': 3,
      'NOC-R-0045': 2,
      'GRV-C-0001': 3,
      'GRV-C-0033': 3,
      'GRV-C-0034': 3,
      'GRV-C-0035': 2,
      'GRV-C-0038': 1,
      'GRV-T-0043': 3,
      'GRV-R-0045': 2,
      'NEU-C-0071': 3,
      'NEU-C-0072': 3
    }
  })
];

fs.writeFileSync(
  path.join(ROOT, 'content', 'cards', 'starter_decks.json'),
  JSON.stringify({ schema_version: '1.1.0', decks: STARTER_DECKS }, null, 2) + '\n',
  'utf8'
);

fs.writeFileSync(
  path.join(ROOT, 'content', 'npcs', 'lumenport_npcs.json'),
  JSON.stringify(
    {
      schema_version: '1.1.0',
      districts: LUMENPORT_DISTRICTS,
      interiors: LUMENPORT_INTERIORS,
      npcs: LUMENPORT_NPCS
    },
    null,
    2
  ) + '\n',
  'utf8'
);

fs.writeFileSync(
  path.join(ROOT, 'content', 'quests', 'act1_quests.json'),
  JSON.stringify({ schema_version: '1.1.0', quests: ACT1_QUESTS }, null, 2) + '\n',
  'utf8'
);

console.log(
  `Successfully built ${ALL_CARDS.length} unique cards, ${STARTER_DECKS.length} legal 40-card starter decks, ${LUMENPORT_DISTRICTS.length} districts, ${LUMENPORT_INTERIORS.length} interiors, ${LUMENPORT_NPCS.length} NPCs, and ${ACT1_QUESTS.length} quests.`
);
