/**
 * Milestone C / Workstream D Expansion: 88 Additional Original Cards (72 -> 160 Total Cards)
 * - 10 additional cards per each of the 8 major factions (0009..0018) = 80 faction cards
 *   (bringing each faction from 8 to 18 cards = 144 faction cards)
 * - 8 additional Neutral cards (0009..0016) = 8 neutral cards
 *   (bringing Neutral from 8 to 16 cards)
 * Grand Total: 144 + 16 = 160 unique cards.
 */
export const EXPANSION_88_CARDS = [
  // =========================================================================
  // FACTION 01 — EMBERCLAD (+10 cards: 0009..0018 -> 18 total)
  // Archetypes: Overheat Aggro, Forge Relics, Burn Midrange
  // =========================================================================
  {
    id: 'EMB-C-0009',
    name: 'Slag-Runner Scout',
    type: 'creature',
    subtype: 'human_scout',
    faction: 'emberclad',
    rarity: 'common',
    role: 'assassin',
    cost: 2,
    attack: 3,
    health: 2,
    keywords: ['swift', 'skirmish'],
    mechanics: ['heat'],
    description: 'Swift, Skirmish. On Summon: Gain 1 Heat counter.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'add_counter', target: 'self', counter: 'heat', amount: 1 }]
      }
    ],
    lore: 'He leaps across cooling slag-crusts before the surface even solidifies.',
    archetypes: ['overheat_aggro'],
    weaknesses: ['low_health', 'guard'],
    complexity: 'beginner',
    art: {
      subject: 'Lightly armored runner sprinting across glowing basalt Crusts with twin magma knives',
      silhouette: 'Forward-leaning sprinter trailing cinders',
      palette: ['ember_orange', 'charcoal', 'copper'],
      lighting: 'Underlit by orange lava cracks',
      environment: 'Emberclad outer slag fields'
    }
  },
  {
    id: 'EMB-C-0010',
    name: 'Anvilheart Warden',
    type: 'creature',
    subtype: 'forged_paladin',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: 'bulwark',
    cost: 3,
    attack: 2,
    health: 5,
    keywords: ['guard'],
    mechanics: ['heat'],
    description: 'Guard. On Summon: If you control a Relic, gain +2/+1 and Shield (1).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [{ type: 'controls_relic' }],
        effects: [
          { operation: 'modify_stats', target: 'self', attack_delta: 2, health_delta: 1 },
          { operation: 'grant_keyword', target: 'self', keyword: 'shield' }
        ]
      }
    ],
    lore: 'Sworn to protect the Great Anvil, her breastplate locks onto nearby relic conduits.',
    archetypes: ['forge_relics', 'burn_midrange'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: 'Armored warden locking a grooved copper hammer into a glowing forge-shield',
      silhouette: 'Stout defensive stance with anvil-shaped shoulder guards',
      palette: ['copper', 'ash_white', 'ember_orange'],
      lighting: 'Warm forge fire reflecting off hammered copper',
      environment: 'Great Anvil chamber'
    }
  },
  {
    id: 'EMB-C-0011',
    name: 'Bellows-Back Salamander',
    type: 'creature',
    subtype: 'fire_reptile',
    faction: 'emberclad',
    rarity: 'common',
    role: 'caster',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['burn'],
    mechanics: ['heat'],
    description: 'On Summon: Apply 1 Burn counter to all enemy creatures in this lane.',
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
    lore: 'Domesticated by forge-guilds to keep the smelting pits at constant white heat.',
    archetypes: ['burn_midrange', 'overheat_aggro'],
    weaknesses: ['ward'],
    complexity: 'beginner',
    art: {
      subject: 'Six-legged brass-collared salamander exhaling a cone of glowing cinders',
      silhouette: 'Low lizard profile with inflating dorsal bellows-sacs',
      palette: ['ember_orange', 'charcoal', 'molten_gold'],
      lighting: 'Bright throat-glow and flying sparks',
      environment: 'Smelting pit ramp'
    }
  },
  {
    id: 'EMB-C-0012',
    name: 'Crucible ventsmith',
    type: 'creature',
    subtype: 'human_engineer',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: 'controller',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: [],
    mechanics: ['heat'],
    description: 'On Summon: Remove up to 2 Heat counters from an allied creature to deal 3 damage to an enemy creature.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'remove_counter', target: 'ally_creature_in_lane_or_any', counter: 'heat', amount: 2 },
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 3 }
        ]
      }
    ],
    lore: 'Venting excess thermal pressure at the exact moment of impact turns safety valves into artillery.',
    archetypes: ['overheat_aggro', 'burn_midrange'],
    weaknesses: ['ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Ventsmith opening a high-pressure steam-and-magma valve on a gauntlet cannon',
      silhouette: 'Engineer with heavy heat-pipe backpack and directional nozzle',
      palette: ['copper', 'charcoal', 'ash_white', 'ember_orange'],
      lighting: 'Blinding orange-white vent jet',
      environment: 'Foundry pressure catwalk'
    }
  },
  {
    id: 'EMB-C-0013',
    name: 'Magma-Core Houndmaster',
    type: 'creature',
    subtype: 'human_summoner',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: 'summoner',
    cost: 4,
    attack: 2,
    health: 3,
    keywords: [],
    mechanics: ['heat'],
    description: 'On Summon: Summon a 2/1 Cinder Hound token with Swift into an open slot.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Cinder Hound',
            attack: 2,
            health: 1,
            keywords: ['swift']
          }
        ]
      }
    ],
    lore: 'His whistle is cast from resonant brass pitched to wake sleeping slag-hounds.',
    archetypes: ['overheat_aggro'],
    weaknesses: ['full_board'],
    complexity: 'beginner',
    art: {
      subject: 'Chain-gloved handler releasing two glowing basalt-skinned hounds',
      silhouette: 'Standing handler with lunging quadruped silhouette ahead',
      palette: ['charcoal', 'ember_orange', 'copper'],
      lighting: 'Glowing magma seams along the hound ribs',
      environment: 'Ashspire kennel gate'
    }
  },
  {
    id: 'EMB-C-0014',
    name: 'Volcanic Siege-Driller',
    type: 'creature',
    subtype: 'molten_construct',
    faction: 'emberclad',
    rarity: 'rare',
    role: 'vanguard',
    cost: 5,
    attack: 5,
    health: 4,
    keywords: ['pierce'],
    mechanics: ['heat'],
    description: 'Pierce. After this attacks, gain 1 Heat counter and deal 1 damage to the enemy Leader.',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'heat', amount: 1 },
          { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Designed to bore through basalt mountain walls, it treats shield formations no differently.',
    archetypes: ['overheat_aggro', 'forge_relics'],
    weaknesses: ['low_health_for_cost'],
    complexity: 'intermediate',
    art: {
      subject: 'Armored siege rig with a spinning white-hot conical drill bit',
      silhouette: 'Wedge-shaped tracked construct tipping forward',
      palette: ['copper', 'molten_gold', 'charcoal'],
      lighting: 'Shower of molten sparks flying from the drill tip',
      environment: 'Breached fortress wall'
    }
  },
  {
    id: 'EMB-T-0015',
    name: 'Temper in Flame',
    type: 'tactic',
    subtype: 'quick',
    faction: 'emberclad',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['heat'],
    description: 'Quick Tactic. Grant an allied creature +2/+1 and 1 Heat counter.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 2, health_delta: 1 },
          { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'heat', amount: 1 }
        ]
      }
    ],
    lore: 'Steel that survives the second quenching never bends.',
    archetypes: ['overheat_aggro', 'forge_relics'],
    weaknesses: ['overheat_threshold_risk'],
    complexity: 'beginner',
    art: {
      subject: 'Greatsword plunging into an alchemical fire trough and emerging wreathed in runes',
      silhouette: 'Vertical blade surrounded by rising flame tongues',
      palette: ['ember_orange', 'ash_white', 'copper'],
      lighting: 'Intense vertical flare',
      environment: 'Weaponsmith quench trough'
    }
  },
  {
    id: 'EMB-T-0016',
    name: 'Slag Detonation',
    type: 'tactic',
    subtype: 'destruction',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: ['burn'],
    mechanics: ['heat'],
    description: 'Standard Tactic. Deal 3 damage to an enemy creature and 2 damage to the opposing Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 3 },
          { operation: 'deal_damage', target: 'enemy_leader', amount: 2 }
        ]
      }
    ],
    lore: 'Unstable slag canisters are rolled down the center lane when an opponent turtles.',
    archetypes: ['burn_midrange', 'overheat_aggro'],
    weaknesses: ['high_tactic_cost'],
    complexity: 'beginner',
    art: {
      subject: 'Copper pressure cask rupturing in a spherical wave of fire and basalt shrapnel',
      silhouette: 'Expanding shockwave ring with radial debris',
      palette: ['ember_orange', 'crimson', 'charcoal'],
      lighting: 'Explosive core flash',
      environment: 'Arena center lane'
    }
  },
  {
    id: 'EMB-R-0017',
    name: 'Bellows of the Undying Forge',
    type: 'relic',
    subtype: 'synergy_engine',
    faction: 'emberclad',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['heat'],
    description: 'Relic. On Play and at the start of your turn: Grant all allied creatures +1/+0.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [{ operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 0 }]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [{ operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 0 }]
      }
    ],
    lore: 'Driven by counterweight pistons, it breathes perpetual draft into every friendly Echo core.',
    archetypes: ['forge_relics', 'overheat_aggro'],
    weaknesses: ['slow_on_empty_board'],
    complexity: 'intermediate',
    art: {
      subject: 'Twin giant leather-and-brass bellows mounted on a runed iron frame',
      silhouette: 'Symmetrical winged bellows mechanism',
      palette: ['copper', 'charcoal', 'ember_orange'],
      lighting: 'Glowing coals beneath the nozzle',
      environment: 'High Forge altar'
    }
  },
  {
    id: 'EMB-E-0018',
    name: 'Ashspire Smeltery Floor',
    type: 'environment',
    subtype: 'foundry_arena',
    faction: 'emberclad',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['burn'],
    mechanics: ['heat'],
    description: 'Environment. On Play: Grant all allied creatures 1 Heat counter and +1/+0.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'all_ally_creatures', counter: 'heat', amount: 1 },
          { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'Open ladle channels divide the three lanes, forcing duelists to move fast or blister.',
    archetypes: ['overheat_aggro', 'burn_midrange'],
    weaknesses: ['environment_replacement'],
    complexity: 'intermediate',
    art: {
      subject: 'Industrial smeltery floor with glowing molten channels separating three steel walkways',
      silhouette: 'Three parallel grated bridges over orange lava trenches',
      palette: ['ember_orange', 'charcoal', 'copper'],
      lighting: 'Strong orange upward glow through floor grates',
      environment: 'Ashspire Smeltery'
    }
  },

  // =========================================================================
  // FACTION 02 — VERDANT PACT (+10 cards: 0009..0018 -> 18 total)
  // Archetypes: Bloom Swarm, Guardian Control, Regeneration
  // =========================================================================
  {
    id: 'VER-C-0009',
    name: 'Canopy Spriggan',
    type: 'creature',
    subtype: 'plant_sprite',
    faction: 'verdant_pact',
    rarity: 'common',
    role: 'trickster',
    cost: 1,
    attack: 1,
    health: 2,
    keywords: ['skirmish', 'growth'],
    mechanics: ['bloom'],
    description: 'Skirmish. On Summon: Gain 1 Growth counter (+1/+1).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'add_counter', target: 'self', counter: 'growth', amount: 1 }]
      }
    ],
    lore: 'Darting from bough to bough, it drops thorny burrs onto unsuspecting vanguards.',
    archetypes: ['bloom_swarm'],
    weaknesses: ['direct_damage'],
    complexity: 'beginner',
    art: {
      subject: 'Small agile wood-sprite swinging from a glowing vine',
      silhouette: 'Leaf-winged imp mid-leap',
      palette: ['emerald', 'moss_green', 'muted_gold'],
      lighting: 'Sunlit canopy shafts',
      environment: 'Upper Thornwood canopy'
    }
  },
  {
    id: 'VER-C-0010',
    name: 'Petalglass Oracle',
    type: 'creature',
    subtype: 'sylvan_seer',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: 'caster',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: [],
    mechanics: ['bloom'],
    description: 'On Summon: Draw 1 card and restore 1 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'draw', target: 'ally_leader', amount: 1 },
          { operation: 'heal', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'She reads the veins of translucent crystal petals grown in the Moonlit Grove.',
    archetypes: ['guardian_control', 'regeneration'],
    weaknesses: ['low_combat_stats'],
    complexity: 'beginner',
    art: {
      subject: 'Sylvan oracle gazing through a lotus of translucent green crystal petals',
      silhouette: 'Seated seer surrounded by floating petal lenses',
      palette: ['emerald', 'muted_gold', 'seafoam'],
      lighting: 'Soft green refraction through crystal petals',
      environment: 'Moonlit Grove pool'
    }
  },
  {
    id: 'VER-C-0011',
    name: 'Sun-Crown Stag',
    type: 'creature',
    subtype: 'forest_beast',
    faction: 'verdant_pact',
    rarity: 'common',
    role: 'vanguard',
    cost: 3,
    attack: 3,
    health: 4,
    keywords: ['growth'],
    mechanics: ['bloom'],
    description: 'After this attacks, restore 2 Vitality to your Leader and gain 1 Growth counter.',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_leader', amount: 2 },
          { operation: 'add_counter', target: 'self', counter: 'growth', amount: 1 }
        ]
      }
    ],
    lore: 'Golden sun-crystals grow naturally along its antlers, warming the winter woods.',
    archetypes: ['regeneration', 'bloom_swarm'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: 'Majestic forest stag with golden crystalline antlers charging down a mossy path',
      silhouette: 'Proud cervine profile with wide branching antlers',
      palette: ['muted_gold', 'emerald', 'deep_bark_brown'],
      lighting: 'Golden halo around the antlers',
      environment: 'Whisperleaf forest clearing'
    }
  },
  {
    id: 'VER-C-0012',
    name: 'Bramblebow Sentinel',
    type: 'creature',
    subtype: 'woodland_archer',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: 'marksman',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['reach'],
    mechanics: ['bloom'],
    description: 'Reach. On Summon: If you control a creature with Growth, deal 2 damage to an enemy in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }]
      }
    ],
    lore: 'Her living yew bow tightens its own draw-weight as the surrounding forest resonates.',
    archetypes: ['guardian_control', 'bloom_swarm'],
    weaknesses: ['ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Ranger perched on a giant root drawing a living thorn-bow',
      silhouette: 'Kneeling archer with leaf-camouflaged cloak',
      palette: ['moss_green', 'deep_bark_brown', 'emerald'],
      lighting: 'Emerald arrow tip glowing at full draw',
      environment: 'Thornwood border watch'
    }
  },
  {
    id: 'VER-C-0013',
    name: 'Ironwood Warder',
    type: 'creature',
    subtype: 'treant_guardian',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: 'controller',
    cost: 4,
    attack: 3,
    health: 5,
    keywords: ['guard', 'anchor'],
    mechanics: ['bloom'],
    description: 'Guard, Anchor. On Summon: Exhaust an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust' }]
      }
    ],
    lore: 'Roots erupt from the stone tiles to bind the legs of any intruder in its lane.',
    archetypes: ['guardian_control'],
    weaknesses: ['pierce'],
    complexity: 'intermediate',
    art: {
      subject: 'Bark-armored guardian slamming a root-staff into the ground to snare an enemy',
      silhouette: 'Broad treant figure with ground-creeping roots',
      palette: ['deep_bark_brown', 'emerald', 'moss_green'],
      lighting: 'Green rune pulse traveling along the floor roots',
      environment: 'Ancient Sanctuary courtyard'
    }
  },
  {
    id: 'VER-C-0014',
    name: 'Elder Spore-Mother',
    type: 'creature',
    subtype: 'fungal_colossus',
    faction: 'verdant_pact',
    rarity: 'rare',
    role: 'summoner',
    cost: 5,
    attack: 3,
    health: 6,
    keywords: ['guard', 'rebirth'],
    mechanics: ['bloom'],
    description: 'Guard, Rebirth. On Summon and On Death: Summon a 2/2 Seedling Token with Growth.',
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
      },
      {
        trigger: 'on_death',
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
    lore: 'Even when felled, her canopy releases a cloud of resonant spores that sprout within seconds.',
    archetypes: ['bloom_swarm', 'guardian_control'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: 'Massive bioluminescent mushroom-crowned forest spirit surrounded by floating spores',
      silhouette: 'Wide umbrella-capped colossus with trailing moss tendrils',
      palette: ['emerald', 'seafoam', 'deep_bark_brown'],
      lighting: 'Soft bioluminescent underside gills',
      environment: 'Echo Caverns grove'
    }
  },
  {
    id: 'VER-T-0015',
    name: 'Verdant Embrace',
    type: 'tactic',
    subtype: 'protection',
    faction: 'verdant_pact',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: ['shield', 'growth'],
    mechanics: ['bloom'],
    description: 'Quick Tactic. Grant an allied creature Shield (1) and 1 Growth counter (+1/+1).',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield' },
          { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'growth', amount: 1 }
        ]
      }
    ],
    lore: 'Interlocking vines weave an instant buckler over the heart.',
    archetypes: ['bloom_swarm', 'guardian_control', 'regeneration'],
    weaknesses: ['requires_board_unit'],
    complexity: 'beginner',
    art: {
      subject: 'Spiral of emerald vines wrapping around a defender in a protective dome',
      silhouette: 'Spherical vine cocoon bursting with golden leaves',
      palette: ['emerald', 'muted_gold', 'moss_green'],
      lighting: 'Radiant green barrier glow',
      environment: 'Forest battleground'
    }
  },
  {
    id: 'VER-T-0016',
    name: 'Overgrowth Surge',
    type: 'tactic',
    subtype: 'summoning',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: ['growth'],
    mechanics: ['bloom'],
    description: 'Standard Tactic. Summon a 2/2 Verdant Seedling token and grant all allied creatures 1 Growth counter (+1/+1).',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Verdant Seedling',
            attack: 2,
            health: 2,
            keywords: ['growth']
          },
          { operation: 'add_counter', target: 'all_ally_creatures', counter: 'growth', amount: 1 }
        ]
      }
    ],
    lore: 'When the Pact sounds the Horn of Spring, the very cobblestones split with new life.',
    archetypes: ['bloom_swarm'],
    weaknesses: ['board_space_limits'],
    complexity: 'intermediate',
    art: {
      subject: 'Wave of flowering vines and sprout-spirits surging across all three lanes',
      silhouette: 'Sweeping horizontal wave of foliage',
      palette: ['emerald', 'moss_green', 'muted_gold'],
      lighting: 'Golden pollen clouds in bright daylight',
      environment: 'Verdant Arena'
    }
  },
  {
    id: 'VER-R-0017',
    name: 'Heartwood Totem',
    type: 'relic',
    subtype: 'defensive_ward',
    faction: 'verdant_pact',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['guard'],
    mechanics: ['bloom'],
    description: 'Relic. On Play: Summon a 2/3 Heartwood Defender token with Guard. At turn end, heal your Leader for 1.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Heartwood Defender',
            attack: 2,
            health: 3,
            keywords: ['guard']
          }
        ]
      },
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [{ operation: 'heal', target: 'ally_leader', amount: 1 }]
      }
    ],
    lore: 'Carved from the fallen limb of an elder tree, it still projects its guardian shadow.',
    archetypes: ['guardian_control', 'regeneration'],
    weaknesses: ['full_board'],
    complexity: 'intermediate',
    art: {
      subject: 'Carved wooden totem inlaid with emerald amber standing on a mossy plinth',
      silhouette: 'Vertical carved pillar with glowing stag-horn crest',
      palette: ['deep_bark_brown', 'emerald', 'muted_gold'],
      lighting: 'Emerald runes glowing along the grain',
      environment: 'Whisperleaf shrine'
    }
  },
  {
    id: 'VER-E-0018',
    name: 'Moonlit Bloom-Glade',
    type: 'environment',
    subtype: 'mystic_forest',
    faction: 'verdant_pact',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['growth'],
    mechanics: ['bloom'],
    description: 'Environment. On Play: Restore 2 Vitality to your Leader and grant your strongest creature 1 Growth counter.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_leader', amount: 2 },
          { operation: 'add_counter', target: 'strongest_ally_creature', counter: 'growth', amount: 1 }
        ]
      }
    ],
    lore: 'Night-blooming lilies open only when twoEcho projections cross blades beneath the moon.',
    archetypes: ['regeneration', 'bloom_swarm'],
    weaknesses: ['environment_replacement'],
    complexity: 'beginner',
    art: {
      subject: 'Serene forest glade carpeted in luminous white-and-emerald night lilies',
      silhouette: 'Circular clearing framed by weeping willow boughs',
      palette: ['emerald', 'seafoam', 'muted_gold'],
      lighting: 'Silver-green moonlight reflecting off a still pond',
      environment: 'Moonlit Grove'
    }
  },

  // =========================================================================
  // FACTION 03 — IRON CHOIR (+10 cards: 0009..0018 -> 18 total)
  // Archetypes: Construct Assembly, Equipment Tempo, Mechanical Fortress
  // =========================================================================
  {
    id: 'IRN-C-0009',
    name: 'Brasswing Surveyor',
    type: 'creature',
    subtype: 'construct_scout',
    faction: 'iron_choir',
    rarity: 'common',
    role: 'marksman',
    cost: 2,
    attack: 2,
    health: 2,
    keywords: ['reach'],
    mechanics: ['assembly'],
    description: 'Reach. On Summon: Draw 1 card if you control another Construct or Relic; otherwise gain 1 Assembly counter.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'assembly', amount: 1 },
          { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Its shutter-eye captures three hundred battlefield telemetries per second.',
    archetypes: ['equipment_tempo', 'construct_assembly'],
    weaknesses: ['low_health'],
    complexity: 'beginner',
    art: {
      subject: 'Clockwork owl-falcon with articulated brass feathers and a glowing blue lens eye',
      silhouette: 'Hovering mechanical bird with spread pinion gears',
      palette: ['brass', 'electric_blue', 'steel_gray'],
      lighting: 'Blue scanning cone projected downward',
      environment: 'Ironreach skyline'
    }
  },
  {
    id: 'IRN-C-0010',
    name: 'Rivet-Line Welder',
    type: 'creature',
    subtype: 'human_artificer',
    faction: 'iron_choir',
    rarity: 'common',
    role: 'support',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: [],
    mechanics: ['assembly'],
    description: 'On Summon: Restore 2 Health to an allied creature and grant it Shield (1).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_creature_in_lane_or_any', amount: 2 },
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield' }
        ]
      }
    ],
    lore: 'No chassis leaves her lane without double-riveted breastplates.',
    archetypes: ['mechanical_fortress', 'equipment_tempo'],
    weaknesses: ['no_targets_on_empty_board'],
    complexity: 'beginner',
    art: {
      subject: 'Choir mechanic with an arc-welder torch patching a construct’s shoulder plate',
      silhouette: 'Compact worker with welding mask and tool-arm harness',
      palette: ['steel_gray', 'electric_blue', 'brass'],
      lighting: 'Brilliant cyan welding spark',
      environment: 'Foundry assembly line'
    }
  },
  {
    id: 'IRN-C-0011',
    name: 'Volt-Coil Lancer',
    type: 'creature',
    subtype: 'construct_cavalry',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: 'vanguard',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['swift', 'pierce'],
    mechanics: ['assembly'],
    description: 'Swift, Pierce. On Summon: Gain 1 Assembly counter.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'add_counter', target: 'self', counter: 'assembly', amount: 1 }]
      }
    ],
    lore: 'Powered by a wound flywheel, it accelerates down the rail-lane at forty miles an hour.',
    archetypes: ['equipment_tempo', 'construct_assembly'],
    weaknesses: ['fragile_against_bulwarks'],
    complexity: 'beginner',
    art: {
      subject: 'Wheeled clockwork centaur charging with a crackling induction lance',
      silhouette: 'Forward-thrust lance and gyro-wheel lower chassis',
      palette: ['brass', 'electric_blue', 'dark_iron'],
      lighting: 'Electric arcs spiraling down the lance',
      environment: 'Railworks test track'
    }
  },
  {
    id: 'IRN-C-0012',
    name: 'Choir Harmonic Weaver',
    type: 'creature',
    subtype: 'construct_caster',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 2,
    health: 4,
    keywords: ['shield'],
    mechanics: ['assembly'],
    description: 'Shield (1). On Summon: Grant all allied creatures +1/+1.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 1 }]
      }
    ],
    lore: 'Its chest pipes sound a resonant chord that aligns every construct servo within earshot.',
    archetypes: ['construct_assembly', 'mechanical_fortress'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: 'Organ-piped automaton emitting visible concentric rings of blue acoustic resonance',
      silhouette: 'Tall upright construct with fan-shaped organ pipes on shoulders',
      palette: ['brass', 'electric_blue', 'steel_gray'],
      lighting: 'Luminous blue sound-wave rings',
      environment: 'Choir Cathedral nave'
    }
  },
  {
    id: 'IRN-C-0013',
    name: 'Magnet-Lock Warden',
    type: 'creature',
    subtype: 'construct_controller',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: 'controller',
    cost: 4,
    attack: 3,
    health: 5,
    keywords: ['guard', 'anchor'],
    mechanics: ['assembly'],
    description: 'Guard, Anchor. On Summon: Apply Anchor and Exhaust to an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'enemy_in_lane', keyword: 'anchor' },
          { operation: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust' }
        ]
      }
    ],
    lore: 'When its electromagnets engage, even non-metallic boots feel pinned to the floorplate.',
    archetypes: ['mechanical_fortress'],
    weaknesses: ['ranged_tactics'],
    complexity: 'intermediate',
    art: {
      subject: 'Heavy iron construct projecting horseshoe magnetic field lines across the lane',
      silhouette: 'Blocky fortress unit with twin U-shaped coil emitters',
      palette: ['dark_iron', 'electric_blue', 'brass'],
      lighting: 'Glowing blue magnetic flux arcs',
      environment: 'Restricted Research Sector'
    }
  },
  {
    id: 'IRN-C-0014',
    name: 'Gantry Drone-Carrier',
    type: 'creature',
    subtype: 'construct_carrier',
    faction: 'iron_choir',
    rarity: 'rare',
    role: 'summoner',
    cost: 5,
    attack: 3,
    health: 5,
    keywords: ['shield'],
    mechanics: ['assembly'],
    description: 'Shield (1). On Summon and at turn end: Summon a 1/2 Clockwork Drone token with Shield (1) if a slot is open.',
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
          }
        ]
      }
    ],
    lore: 'A walking assembly dock that fabricates escort drones from scrap Aether mid-battle.',
    archetypes: ['construct_assembly'],
    weaknesses: ['board_space_limits'],
    complexity: 'intermediate',
    art: {
      subject: 'Four-legged mobile gantry crane lowering freshly assembled brass drones',
      silhouette: 'Quadruped industrial walker with overhead crane boom',
      palette: ['steel_gray', 'brass', 'electric_blue'],
      lighting: 'Bay lights illuminating hanging drones',
      environment: 'Foundry Assembly bay'
    }
  },
  {
    id: 'IRN-T-0015',
    name: 'Overclock Protocol',
    type: 'tactic',
    subtype: 'standard',
    faction: 'iron_choir',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: ['swift'],
    mechanics: ['assembly'],
    description: 'Standard Tactic. Grant an allied creature +2/+0, Swift, and 1 Assembly counter.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 2, health_delta: 0 },
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'swift' },
          { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'assembly', amount: 1 }
        ]
      }
    ],
    lore: 'Disengaging the governor spring doubles output for thirty decisive seconds.',
    archetypes: ['equipment_tempo', 'construct_assembly'],
    weaknesses: ['no_defensive_boost'],
    complexity: 'beginner',
    art: {
      subject: 'Brass pressure gauge needle slamming past the red mark as blue sparks fly',
      silhouette: 'Close-up circular dial and glowing gear train',
      palette: ['brass', 'electric_blue', 'ember_orange'],
      lighting: 'High-energy blue-white surge',
      environment: 'Construct cockpit'
    }
  },
  {
    id: 'IRN-T-0016',
    name: 'Magnetic Pulse Discharge',
    type: 'tactic',
    subtype: 'battlefield_manipulation',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['silence'],
    mechanics: ['assembly'],
    description: 'Standard Tactic. Silence an enemy creature and deal 2 damage to it.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'silence', target: 'target_enemy_creature' },
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 2 }
        ]
      }
    ],
    lore: 'A single capacitor bank discharge strips active enchantments from the target.',
    archetypes: ['mechanical_fortress', 'equipment_tempo'],
    weaknesses: ['ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Expanding ring of electric blue EMP energy disrupting an enemy projection',
      silhouette: 'Concentric lightning torus',
      palette: ['electric_blue', 'steel_gray', 'white'],
      lighting: 'Sharp strobe discharge',
      environment: 'Power Core arena'
    }
  },
  {
    id: 'IRN-R-0017',
    name: 'Autorepair Gantry',
    type: 'relic',
    subtype: 'global_support',
    faction: 'iron_choir',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['shield'],
    mechanics: ['assembly'],
    description: 'Relic. On Play and at the end of your turn: Restore 2 Health to all allied creatures.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [{ operation: 'heal', target: 'all_ally_creatures', amount: 2 }]
      },
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [{ operation: 'heal', target: 'all_ally_creatures', amount: 2 }]
      }
    ],
    lore: 'Articulated brass arms descend between turns to weld cracked armor and replace sheared pins.',
    archetypes: ['mechanical_fortress', 'construct_assembly'],
    weaknesses: ['one_shot_burst_removal'],
    complexity: 'intermediate',
    art: {
      subject: 'Overhead brass arch equipped with multi-jointed repair arms and welding torches',
      silhouette: 'Gantry arch spanning a battlefield lane',
      palette: ['brass', 'steel_gray', 'electric_blue'],
      lighting: 'Multiple small blue welding arcs',
      environment: 'Mechanical Workshops'
    }
  },
  {
    id: 'IRN-E-0018',
    name: 'Clockwork Coliseum Floor',
    type: 'environment',
    subtype: 'mechanized_arena',
    faction: 'iron_choir',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['assembly'],
    description: 'Environment. On Play: Grant all allied creatures 1 Assembly counter and +0/+1.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'all_ally_creatures', counter: 'assembly', amount: 1 },
          { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 0, health_delta: 1 }
        ]
      }
    ],
    lore: 'Rotating brass floorplates lock into the heel-spurs of Iron Choir formations.',
    archetypes: ['construct_assembly', 'equipment_tempo'],
    weaknesses: ['environment_replacement'],
    complexity: 'beginner',
    art: {
      subject: 'Octagonal arena floor built of interlocking rotating brass gear plates',
      silhouette: 'Symmetrical gear-patterned stadium floor',
      palette: ['brass', 'dark_iron', 'electric_blue'],
      lighting: 'Warm stadium arc-lamps and blue seam lights',
      environment: 'Clockwork Coliseum'
    }
  },

  // =========================================================================
  // FACTION 04 — TIDEBOUND (+10 cards: 0009..0018 -> 18 total)
  // Archetypes: Current Tempo, Recall Control, Deepwater Midrange
  // =========================================================================
  {
    id: 'TID-C-0009',
    name: 'Stormfin Duelist',
    type: 'creature',
    subtype: 'merfolk_warrior',
    faction: 'tidebound',
    rarity: 'common',
    role: 'vanguard',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ['skirmish'],
    mechanics: ['current'],
    description: 'Skirmish. Current: When this moves lanes or is summoned, gain +1/+0.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 0 }]
      },
      {
        trigger: 'on_move',
        conditions: [],
        effects: [{ operation: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 0 }]
      }
    ],
    lore: 'He rides the lateral surge between lanes to strike before defenders can pivot.',
    archetypes: ['current_tempo'],
    weaknesses: ['anchor'],
    complexity: 'beginner',
    art: {
      subject: 'Finned duelist lunging out of a swirling water ribbon with a coral-hilted sabre',
      silhouette: 'Agile swordsman with dorsal fin crest',
      palette: ['azure', 'turquoise', 'pearl_white'],
      lighting: 'Bright water-spray highlights',
      environment: 'Harbor seawall'
    }
  },
  {
    id: 'TID-C-0010',
    name: 'Tidepool Mender',
    type: 'creature',
    subtype: 'water_healer',
    faction: 'tidebound',
    rarity: 'common',
    role: 'support',
    cost: 2,
    attack: 1,
    health: 4,
    keywords: [],
    mechanics: ['current'],
    description: 'On Summon: Restore 3 Health to an allied creature or 2 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_creature_in_lane_or_any', amount: 3 },
          { operation: 'heal', target: 'ally_leader', amount: 2 }
        ]
      }
    ],
    lore: 'Cool brine drawn from the sacred springs washes away burn and corrosion alike.',
    archetypes: ['recall_control', 'deepwater_midrange'],
    weaknesses: ['low_attack'],
    complexity: 'beginner',
    art: {
      subject: 'Healer pouring luminous seafoam water from a nautilus shell vessel',
      silhouette: 'Robed figure with floating ribbon of healing water',
      palette: ['seafoam', 'pearl_white', 'turquoise'],
      lighting: 'Soft aqua glow on water stream',
      environment: 'Coastal sanctuary'
    }
  },
  {
    id: 'TID-C-0011',
    name: 'Riptide Harpooner',
    type: 'creature',
    subtype: 'pelagic_hunter',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: 'marksman',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['reach'],
    mechanics: ['current'],
    description: 'Reach. On Summon: Deal 2 damage to an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }]
      }
    ],
    lore: 'His braided kelp-line pulls rear-line casters straight into the breaker zone.',
    archetypes: ['current_tempo', 'deepwater_midrange'],
    weaknesses: ['ward'],
    complexity: 'beginner',
    art: {
      subject: 'Coral-armored hunter hurling a tethered bone harpoon across the wave-tops',
      silhouette: 'Wide throwing stance with coiled rope line',
      palette: ['azure', 'pearl_white', 'turquoise'],
      lighting: 'Sun-glint on wet bone harpoon tip',
      environment: 'Old Harbor pier'
    }
  },
  {
    id: 'TID-C-0012',
    name: 'Coralspire Barrier-Caller',
    type: 'creature',
    subtype: 'tide_shaper',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: 'controller',
    cost: 4,
    attack: 2,
    health: 5,
    keywords: ['guard', 'shield'],
    mechanics: ['current'],
    description: 'Guard, Shield (1). On Summon: Return an exhausted or damaged allied creature to full readiness and heal it for 2.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'heal', target: 'all_ally_creatures', amount: 2 }]
      }
    ],
    lore: 'At her command, calcified reef pillars rise from the stone in a single heartbeat.',
    archetypes: ['recall_control', 'deepwater_midrange'],
    weaknesses: ['pierce'],
    complexity: 'intermediate',
    art: {
      subject: 'Tide-shaper raising a wall of branching white and turquoise coral',
      silhouette: 'Upright caster behind a jagged coral palisade',
      palette: ['pearl_white', 'turquoise', 'azure'],
      lighting: 'Submarine caustic patterns across coral pillars',
      environment: 'Tidebound reef temple'
    }
  },
  {
    id: 'TID-C-0013',
    name: 'Shoal-Caller Siren',
    type: 'creature',
    subtype: 'aquatic_summoner',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: 'summoner',
    cost: 4,
    attack: 2,
    health: 3,
    keywords: ['skirmish'],
    mechanics: ['current'],
    description: 'Skirmish. On Summon: Summon a 2/2 Tidal Manta token with Skirmish into an open slot.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Tidal Manta',
            attack: 2,
            health: 2,
            keywords: ['skirmish']
          }
        ]
      }
    ],
    lore: 'Her song carries through three fathoms of mist, summoning winged rays from the harbor deep.',
    archetypes: ['current_tempo'],
    weaknesses: ['low_health'],
    complexity: 'intermediate',
    art: {
      subject: 'Siren perched on a wave-carved rock as glowing water-mantas glide past her',
      silhouette: 'Finned singer flanked by wide diamond-shaped manta rays',
      palette: ['turquoise', 'azure', 'seafoam'],
      lighting: 'Luminous aqua outlines on the manta wings',
      environment: 'Misty sea stacks'
    }
  },
  {
    id: 'TID-C-0014',
    name: 'Maelstrom Kraken-Spawn',
    type: 'creature',
    subtype: 'deep_cephalopod',
    faction: 'tidebound',
    rarity: 'rare',
    role: 'assassin',
    cost: 5,
    attack: 5,
    health: 4,
    keywords: ['skirmish', 'drain'],
    mechanics: ['current'],
    description: 'Skirmish, Drain. On Summon: Deal 2 damage to an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }]
      }
    ],
    lore: 'It slips from whirlpool to whirlpool, dragging isolated vanguards beneath the surface.',
    archetypes: ['deepwater_midrange', 'current_tempo'],
    weaknesses: ['ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Armored deep-sea kraken creature coiling tentacles around a stone column',
      silhouette: 'Swirling multi-tentacled silhouette with glowing bioluminescent eyes',
      palette: ['azure', 'dark_navy', 'turquoise'],
      lighting: 'Cyan bioluminescent rings along the tentacles',
      environment: 'Flooded abyssal trench'
    }
  },
  {
    id: 'TID-T-0015',
    name: 'Slipstream Shift',
    type: 'tactic',
    subtype: 'quick',
    faction: 'tidebound',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: ['skirmish'],
    mechanics: ['current'],
    description: 'Quick Tactic. Move an allied creature to an open adjacent lane slot and grant it +1/+2.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'move_lane', target: 'ally_creature_in_lane_or_any', direction: 'adjacent' },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 2 }
        ]
      }
    ],
    lore: 'Step sideways into the current and the enemy’s blow strikes only empty foam.',
    archetypes: ['current_tempo', 'recall_control'],
    weaknesses: ['anchor', 'full_board'],
    complexity: 'beginner',
    art: {
      subject: 'Duelist dissolving into a horizontal arc of water droplets and reforming in the next lane',
      silhouette: 'S-curve water ribbon connecting two lane tiles',
      palette: ['turquoise', 'seafoam', 'pearl_white'],
      lighting: 'Sparkling spray trail',
      environment: 'Arena lane boundary'
    }
  },
  {
    id: 'TID-T-0016',
    name: 'Undertow Surge',
    type: 'tactic',
    subtype: 'battlefield_manipulation',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['recall'],
    mechanics: ['current'],
    description: 'Standard Tactic. Return an enemy creature with 3 or less Attack (or damage it for 3) and draw 1 card.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 3 },
          { operation: 'draw', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'No footing holds when the harbor tide pulls back all at once.',
    archetypes: ['recall_control', 'current_tempo'],
    weaknesses: ['ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Powerful receding wave sweeping an armored opponent off their feet',
      silhouette: 'Low sweeping water vortex',
      palette: ['azure', 'turquoise', 'pearl_white'],
      lighting: 'Foaming white crest against deep blue water',
      environment: 'Submerged causeway'
    }
  },
  {
    id: 'TID-R-0017',
    name: 'Chalice of High Tide',
    type: 'relic',
    subtype: 'global_support',
    faction: 'tidebound',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['current'],
    description: 'Relic. On Play and at the start of your turn: Restore 2 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [{ operation: 'heal', target: 'ally_leader', amount: 2 }]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [{ operation: 'heal', target: 'ally_leader', amount: 2 }]
      }
    ],
    lore: 'Its pearl rim overflows with fresh healing water whenever the moon rises over Lumenport.',
    archetypes: ['recall_control', 'deepwater_midrange'],
    weaknesses: ['aggressive_pierce_decks'],
    complexity: 'beginner',
    art: {
      subject: 'Fluted mother-of-pearl chalice overflowing with glowing turquoise water',
      silhouette: 'Graceful stemmed goblet on a coral pedestal',
      palette: ['pearl_white', 'turquoise', 'azure'],
      lighting: 'Luminous aqua overflow',
      environment: 'Tidal temple altar'
    }
  },
  {
    id: 'TID-E-0018',
    name: 'Misty Harbor Boardwalk',
    type: 'environment',
    subtype: 'coastal_arena',
    faction: 'tidebound',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['skirmish'],
    mechanics: ['current'],
    description: 'Environment. On Play: Grant all allied creatures Skirmish and restore 1 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'skirmish' },
          { operation: 'heal', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Rolling sea-fog obscures the boardwalk planks, letting Tidebound scouts shift lanes unseen.',
    archetypes: ['current_tempo'],
    weaknesses: ['environment_replacement'],
    complexity: 'beginner',
    art: {
      subject: 'Lantern-lit timber boardwalk hovering above rolling turquoise harbor waves and fog',
      silhouette: 'Wooden pier perspective vanishing into luminous sea mist',
      palette: ['turquoise', 'seafoam', 'azure', 'warm_gold'],
      lighting: 'Warm brass harbor lanterns glowing in cool aqua fog',
      environment: 'Lumenport Old Harbor'
    }
  },

  // =========================================================================
  // FACTION 05 — GLASSBORNE (+10 cards: 0009..0018 -> 18 total)
  // Archetypes: Refraction Control, Prism Tempo, Counterplay
  // =========================================================================
  {
    id: 'GLS-C-0009',
    name: 'Kaleidoscope Familiar',
    type: 'creature',
    subtype: 'crystal_construct',
    faction: 'glassborne',
    rarity: 'common',
    role: 'support',
    cost: 2,
    attack: 1,
    health: 3,
    keywords: ['ward'],
    mechanics: ['refraction'],
    description: 'Ward. On Summon: Grant an allied creature Ward.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'ward' }]
      }
    ],
    lore: 'It unfolds itsfaceted wings to project a decoy prism around its partner.',
    archetypes: ['prism_tempo', 'refraction_control'],
    weaknesses: ['low_attack'],
    complexity: 'beginner',
    art: {
      subject: 'Floating origami-like crystal butterfly projecting hexagonal ward barriers',
      silhouette: 'Symmetrical faceted wing silhouette',
      palette: ['translucent_cyan', 'violet', 'iridescent_white'],
      lighting: 'Rainbow caustic reflections',
      environment: 'Glassborne study'
    }
  },
  {
    id: 'GLS-C-0010',
    name: 'Facet-Bow Marksman',
    type: 'creature',
    subtype: 'crystal_archer',
    faction: 'glassborne',
    rarity: 'common',
    role: 'marksman',
    cost: 2,
    attack: 2,
    health: 2,
    keywords: ['reach', 'ward'],
    mechanics: ['refraction'],
    description: 'Reach, Ward. Can target enemy Rear creatures past unguarded Front creatures.',
    abilities: [],
    lore: 'He fires solid needles of spun quartz that curve along refracted light beams.',
    archetypes: ['prism_tempo', 'counterplay'],
    weaknesses: ['low_health'],
    complexity: 'beginner',
    art: {
      subject: 'Archer drawing a crystalline recurve bow that fires a beam of split violet light',
      silhouette: 'Slender archer with prism quiver',
      palette: ['violet', 'silver', 'translucent_cyan'],
      lighting: 'Sharp violet laser-line along the arrow',
      environment: 'Archive balcony'
    }
  },
  {
    id: 'GLS-C-0011',
    name: 'Mirage Trickster',
    type: 'creature',
    subtype: 'illusion_duelist',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: 'trickster',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['ward', 'skirmish'],
    mechanics: ['refraction'],
    description: 'Ward, Skirmish. On Summon: Redirect 1 damage to the enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }]
      }
    ],
    lore: 'Strike the left image and the right image scores your Pauldron.',
    archetypes: ['prism_tempo', 'counterplay'],
    weaknesses: ['aoe_effects'],
    complexity: 'intermediate',
    art: {
      subject: 'Duelist splitting into two overlapping prismatic afterimages while side-stepping',
      silhouette: 'Twin overlapping fencer silhouettes',
      palette: ['translucent_cyan', 'violet', 'silver'],
      lighting: 'Chromatic split lighting',
      environment: 'Mirror Labyrinth'
    }
  },
  {
    id: 'GLS-C-0012',
    name: 'Spectrum Arbiter',
    type: 'creature',
    subtype: 'crystal_magistrate',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: 'controller',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: ['ward'],
    mechanics: ['refraction'],
    description: 'Ward. On Summon: Silence an enemy creature in this lane and grant this unit Shield (1).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'silence', target: 'enemy_in_lane' },
          { operation: 'grant_keyword', target: 'self', keyword: 'shield' }
        ]
      }
    ],
    lore: 'His gavel of clear tourmaline shatters unstable buffs with a single pure tone.',
    archetypes: ['refraction_control', 'counterplay'],
    weaknesses: ['high_stat_brutes'],
    complexity: 'intermediate',
    art: {
      subject: 'Silver-robed magistrate raising a crystalline staff that projects a hexagonal containment prism',
      silhouette: 'Tall formal arbiter with floating prism halo',
      palette: ['silver', 'iridescent_white', 'violet'],
      lighting: 'Clean white-violet geometric light beams',
      environment: 'Accord Tribunal Hall'
    }
  },
  {
    id: 'GLS-C-0013',
    name: 'Prismatic Echo-Weaver',
    type: 'creature',
    subtype: 'glass_summoner',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: 'summoner',
    cost: 4,
    attack: 2,
    health: 3,
    keywords: ['ward'],
    mechanics: ['refraction'],
    description: 'Ward. On Summon: Summon a 2/1 Mirror Decoy token with Ward into an open slot.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Mirror Decoy',
            attack: 2,
            health: 1,
            keywords: ['ward']
          }
        ]
      }
    ],
    lore: 'A single candle flame placed between two angled mirrors fills an entire hall with sentries.',
    archetypes: ['prism_tempo', 'refraction_control'],
    weaknesses: ['combat_damage_clears_1hp'],
    complexity: 'intermediate',
    art: {
      subject: 'Artificer positioning two floating mirrors that spawn a crystalline warrior reflection',
      silhouette: 'Caster flanked by angled floating mirror frames',
      palette: ['violet', 'translucent_cyan', 'silver'],
      lighting: 'Bright reflection beam between mirrors',
      environment: 'Forgotten Gallery'
    }
  },
  {
    id: 'GLS-C-0014',
    name: 'Aether-Lens Seraph',
    type: 'creature',
    subtype: 'crystal_construct',
    faction: 'glassborne',
    rarity: 'rare',
    role: 'vanguard',
    cost: 5,
    attack: 4,
    health: 5,
    keywords: ['ward', 'shield', 'reach'],
    mechanics: ['refraction'],
    description: 'Ward, Shield (1), Reach. After this attacks, grant another allied creature Ward.',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [{ operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'ward' }]
      }
    ],
    lore: 'Its six hovering wing-shards focus ambient Aether into impenetrable geometric wards.',
    archetypes: ['prism_tempo', 'refraction_control', 'counterplay'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: 'Radiant six-winged crystal seraph hovering above the battlefield with a lance of light',
      silhouette: 'Symmetric six-shard wing array around a silver core',
      palette: ['iridescent_white', 'translucent_cyan', 'violet', 'silver'],
      lighting: 'Blazing prismatic corona',
      environment: 'Upper Glass Cathedral'
    }
  },
  {
    id: 'GLS-T-0015',
    name: 'Prismatic Aegis',
    type: 'tactic',
    subtype: 'protection',
    faction: 'glassborne',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: ['ward', 'shield'],
    mechanics: ['refraction'],
    description: 'Quick Tactic. Grant an allied creature Ward and +1/+1.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'ward' },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'A thin film of resonant quartz deflects the deadliest hex.',
    archetypes: ['prism_tempo', 'counterplay', 'refraction_control'],
    weaknesses: ['requires_ally_unit'],
    complexity: 'beginner',
    art: {
      subject: 'Hexagonal cyan-and-violet crystal barrier snapping into place around a duelist',
      silhouette: 'Geometric dome of interlocking hexagons',
      palette: ['translucent_cyan', 'violet', 'iridescent_white'],
      lighting: 'Crisp specular facet highlights',
      environment: 'Duel arena'
    }
  },
  {
    id: 'GLS-T-0016',
    name: 'Shattering Focus',
    type: 'tactic',
    subtype: 'destruction',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['refraction'],
    description: 'Standard Tactic. Deal 3 damage to an enemy creature and grant an allied creature Ward.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 3 },
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'ward' }
        ]
      }
    ],
    lore: 'Converging three mirror beams onto a single point turns ambient light into a lance.',
    archetypes: ['refraction_control', 'counterplay'],
    weaknesses: ['enemy_ward'],
    complexity: 'beginner',
    art: {
      subject: 'Three beams of violet light converging through a floating crystal prism into a single destructive ray',
      silhouette: 'Triangular convergence of light beams',
      palette: ['violet', 'translucent_cyan', 'iridescent_white'],
      lighting: 'Intense white-violet focal point',
      environment: 'Optical research hall'
    }
  },
  {
    id: 'GLS-R-0017',
    name: 'Mirror-Spire Monolith',
    type: 'relic',
    subtype: 'defensive_ward',
    faction: 'glassborne',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: ['ward', 'shield'],
    mechanics: ['refraction'],
    description: 'Relic. On Play: Grant all allied creatures Shield (1). At turn start, grant your strongest creature Ward.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [{ operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'shield' }]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [{ operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'ward' }]
      }
    ],
    lore: 'A miniature replica of the Glassborne Spire that hums whenever hostile tactics are cast.',
    archetypes: ['refraction_control', 'counterplay'],
    weaknesses: ['empty_board'],
    complexity: 'intermediate',
    art: {
      subject: 'Slender obelisk of silver and violet quartz floating above a mirrored base',
      silhouette: 'Tall faceted obelisk with orbiting crystal shards',
      palette: ['silver', 'violet', 'translucent_cyan'],
      lighting: 'Internal refractive light column',
      environment: 'Glassborne sanctum'
    }
  },
  {
    id: 'GLS-E-0018',
    name: 'Prism-Light Courtyard',
    type: 'environment',
    subtype: 'crystal_plaza',
    faction: 'glassborne',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['ward'],
    mechanics: ['refraction'],
    description: 'Environment. On Play: Grant your strongest creature Ward and +1/+1.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'ward' },
          { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'Overhead prism canopies split the afternoon sun into protective bands of color.',
    archetypes: ['prism_tempo', 'refraction_control'],
    weaknesses: ['environment_replacement'],
    complexity: 'beginner',
    art: {
      subject: 'Sunlit courtyard roofed with stained crystal arches casting rainbow geometry across the floor',
      silhouette: 'Arched glass colonnade framing a polished stone duel table',
      palette: ['iridescent_white', 'violet', 'translucent_cyan'],
      lighting: 'Multi-colored geometric floor projections',
      environment: 'Accord Institute Prism Courtyard'
    }
  },

  // =========================================================================
  // FACTION 06 — NOCTURNE (+10 cards: 0009..0018 -> 18 total)
  // Archetypes: Veil Ambush, Hand Disruption, Shadow Midrange
  // =========================================================================
  {
    id: 'NOC-C-0009',
    name: 'Velvet-Mask Cutpurse',
    type: 'creature',
    subtype: 'shadow_trickster',
    faction: 'nocturne',
    rarity: 'common',
    role: 'trickster',
    cost: 2,
    attack: 2,
    health: 2,
    keywords: ['stealth', 'skirmish'],
    mechanics: ['veil'],
    description: 'Stealth, Skirmish. After this attacks, draw 1 card if you control another Nocturne card.',
    abilities: [
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [{ operation: 'add_counter', target: 'self', counter: 'veil', amount: 1 }]
      }
    ],
    lore: 'He leaves a silver calling card in the exact pocket where your spare Aether crystal used to be.',
    archetypes: ['veil_ambush', 'hand_disruption'],
    weaknesses: ['low_health'],
    complexity: 'beginner',
    art: {
      subject: 'Nimble rogue in a crimson-trimmed domino mask flipping a stolen Aether coin',
      silhouette: 'Leaning agile trickster with billowing short cape',
      palette: ['midnight_blue', 'restrained_crimson', 'silver'],
      lighting: 'Glint of silver coin in deep shadow',
      environment: 'Central Card Market night stall'
    }
  },
  {
    id: 'NOC-C-0010',
    name: 'Gargoyle Perch Sniper',
    type: 'creature',
    subtype: 'shadow_marksman',
    faction: 'nocturne',
    rarity: 'common',
    role: 'marksman',
    cost: 2,
    attack: 3,
    health: 2,
    keywords: ['reach', 'stealth'],
    mechanics: ['veil'],
    description: 'Reach, Stealth. Veil: Enters concealed and can target Rear enemies.',
    abilities: [],
    lore: 'High above the gaslamps, her silver quarrel blends with the falling rain.',
    archetypes: ['veil_ambush', 'shadow_midrange'],
    weaknesses: ['2_health_fragility'],
    complexity: 'beginner',
    art: {
      subject: 'Crossbow sniper perched beside a stone cathedral gargoyle under moonlight',
      silhouette: 'Crouched figure merging with gargoyle wings',
      palette: ['indigo', 'midnight_blue', 'silver'],
      lighting: 'Cold silver moon-rim',
      environment: 'Lumenport rooftops'
    }
  },
  {
    id: 'NOC-C-0011',
    name: 'The Unseen Herald',
    type: 'creature',
    subtype: 'shadow_envoy',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: 'support',
    cost: 3,
    attack: 2,
    health: 3,
    keywords: ['stealth'],
    mechanics: ['veil'],
    description: 'Stealth. On Summon: Grant another allied creature Stealth and +1/+1.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'stealth' },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'He announces the arrival of the Masquerade by extinguishing every lantern on the block.',
    archetypes: ['veil_ambush', 'shadow_midrange'],
    weaknesses: ['empty_board'],
    complexity: 'beginner',
    art: {
      subject: 'Tall masked herald opening a cloak of swirling night-fog to conceal a companion',
      silhouette: 'Broad sweeping cloak enveloping a second silhouette',
      palette: ['midnight_blue', 'indigo', 'silver'],
      lighting: 'Dying lantern flame turning to indigo smoke',
      environment: 'Cobblestone square at midnight'
    }
  },
  {
    id: 'NOC-C-0012',
    name: 'Dusk-Court Inquisitor',
    type: 'creature',
    subtype: 'masked_arbiter',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: 'bulwark',
    cost: 3,
    attack: 2,
    health: 5,
    keywords: ['guard', 'drain'],
    mechanics: ['veil'],
    description: 'Guard, Drain. Restores Vitality to your Leader equal to combat damage dealt.',
    abilities: [],
    lore: 'Behind the silver visor, he weighs every secret spoken in the Undercity.',
    archetypes: ['shadow_midrange', 'hand_disruption'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: 'Heavy velvet-and-silver armored guard holding a dark iron partisan and shield',
      silhouette: 'Imposing gothic sentinel with tall pointed gorget',
      palette: ['midnight_blue', 'silver', 'restrained_crimson'],
      lighting: 'Crimson reflection along the shield crest',
      environment: 'Nocturne Sanctuary gate'
    }
  },
  {
    id: 'NOC-C-0013',
    name: 'Shadow-Puppeteer',
    type: 'creature',
    subtype: 'illusion_summoner',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: 'summoner',
    cost: 4,
    attack: 2,
    health: 3,
    keywords: ['stealth'],
    mechanics: ['veil'],
    description: 'Stealth. On Summon: Summon a 2/1 Umbra Shade token with Stealth into an open slot.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Umbra Shade',
            attack: 2,
            health: 1,
            keywords: ['stealth']
          }
        ]
      }
    ],
    lore: 'With silver wire and candlelight, she casts wall-shadows that step off the plaster.',
    archetypes: ['veil_ambush'],
    weaknesses: ['full_board'],
    complexity: 'intermediate',
    art: {
      subject: 'Masked performer manipulating silver threads attached to a living shadow-assassin',
      silhouette: 'Graceful puppeteer with towering shadow projection behind her',
      palette: ['indigo', 'silver', 'midnight_blue'],
      lighting: 'Single footlight casting an oversized living shadow',
      environment: 'Abandoned theater stage'
    }
  },
  {
    id: 'NOC-C-0014',
    name: 'Sovereign of the Eclipse',
    type: 'creature',
    subtype: 'shadow_archon',
    faction: 'nocturne',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 5,
    health: 6,
    keywords: ['stealth', 'drain', 'pierce'],
    mechanics: ['veil'],
    description: 'Stealth, Drain, Pierce. On Summon: Silence an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'silence', target: 'enemy_in_lane' }]
      }
    ],
    lore: 'When the moon crosses the sun above the Archive, the Sovereign’s court claims every lane.',
    archetypes: ['shadow_midrange', 'veil_ambush', 'hand_disruption'],
    weaknesses: ['high_cost'],
    complexity: 'advanced',
    art: {
      subject: 'Regal gothic colossus cloaked in an eclipse corona wielding a silver crescent glaive',
      silhouette: 'Towering crowned figure framed by a black-and-silver solar eclipse',
      palette: ['midnight_blue', 'silver', 'restrained_crimson', 'indigo'],
      lighting: 'Dramatic eclipse rim-light in pitch darkness',
      environment: 'Eclipse Tower summit'
    }
  },
  {
    id: 'NOC-T-0015',
    name: 'Whispered Blackmail',
    type: 'tactic',
    subtype: 'standard',
    faction: 'nocturne',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['exhaust', 'silence'],
    mechanics: ['veil'],
    description: 'Standard Tactic. Silence and Exhaust a target enemy creature.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'silence', target: 'target_enemy_creature' },
          { operation: 'grant_keyword', target: 'target_enemy_creature', keyword: 'exhaust' }
        ]
      }
    ],
    lore: 'A single sealed note delivered mid-duel convinces the champion to lower their weapon.',
    archetypes: ['hand_disruption', 'shadow_midrange'],
    weaknesses: ['ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Black wax-sealed letter pinned to a table by a silver stiletto',
      silhouette: 'Diagonal dagger piercing an envelope with shadow wisps',
      palette: ['midnight_blue', 'restrained_crimson', 'silver'],
      lighting: 'Spotlight on the crimson wax seal',
      environment: 'Private duel parlor'
    }
  },
  {
    id: 'NOC-T-0016',
    name: 'Shadowstep Ambush',
    type: 'tactic',
    subtype: 'quick',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['veil'],
    description: 'Quick Tactic. Deal 3 damage to an enemy creature and restore 2 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 3 },
          { operation: 'heal', target: 'ally_leader', amount: 2 }
        ]
      }
    ],
    lore: 'The strike falls from the shadow cast by the opponent’s own torch.',
    archetypes: ['veil_ambush', 'shadow_midrange'],
    weaknesses: ['ward'],
    complexity: 'beginner',
    art: {
      subject: 'Twin silver blades striking upward out of a pool of floor shadow',
      silhouette: 'Sharp X-slash rising from darkness',
      palette: ['silver', 'indigo', 'restrained_crimson'],
      lighting: 'Metallic blade flash in dark fog',
      environment: 'Underground arena'
    }
  },
  {
    id: 'NOC-R-0017',
    name: 'Nocturne Cipher Codex',
    type: 'relic',
    subtype: 'synergy_engine',
    faction: 'nocturne',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['veil'],
    description: 'Relic. On Play: Draw 1 card. At the end of your turn, deal 1 damage to the opposing Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [{ operation: 'draw', target: 'ally_leader', amount: 1 }]
      },
      {
        trigger: 'turn_end',
        conditions: [],
        effects: [{ operation: 'deal_damage', target: 'enemy_leader', amount: 1 }]
      }
    ],
    lore: 'Its ink is visible only under silver moonlight, recording every weakness in the opponent’s form.',
    archetypes: ['hand_disruption', 'shadow_midrange'],
    weaknesses: ['slow_payoff'],
    complexity: 'intermediate',
    art: {
      subject: 'Silver-clasped leather grimoire resting on a lectern with glowing indigo cipher script',
      silhouette: 'Open codex with rising shadow numerals',
      palette: ['indigo', 'silver', 'midnight_blue'],
      lighting: 'Eerie violet-blue script glow',
      environment: 'Secret archive study'
    }
  },
  {
    id: 'NOC-E-0018',
    name: 'Moonlit Belfry Rooftops',
    type: 'environment',
    subtype: 'gothic_skyline',
    faction: 'nocturne',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['stealth'],
    mechanics: ['veil'],
    description: 'Environment. On Play: Grant your strongest creature Stealth and +1/+0.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'stealth' },
          { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'Across the slate gables of Lumenport, the Nocturne hold their unsanctioned midnight circuit.',
    archetypes: ['veil_ambush'],
    weaknesses: ['environment_replacement'],
    complexity: 'beginner',
    art: {
      subject: 'Steep gothic slate rooftops and bell towers under a huge silver full moon',
      silhouette: 'Jagged spires and gargoyles against a bright moon disc',
      palette: ['midnight_blue', 'silver', 'indigo'],
      lighting: 'High-contrast moonlight and deep roof shadows',
      environment: 'Lumenport upper skyline'
    }
  },

  // =========================================================================
  // FACTION 07 — STARWEAVE (+10 cards: 0009..0018 -> 18 total)
  // Archetypes: Alignment Combo, Prediction Control, Celestial Midrange
  // =========================================================================
  {
    id: 'STR-C-0009',
    name: 'Orbitkeeper Scholar',
    type: 'creature',
    subtype: 'human_astronomer',
    faction: 'starweave',
    rarity: 'common',
    role: 'support',
    cost: 2,
    attack: 1,
    health: 4,
    keywords: [],
    mechanics: ['alignment'],
    description: 'On Summon: Grant an allied creature 1 Alignment counter and +1/+1.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'alignment', amount: 1 },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'He adjusts the brass counterweights of the great telescope to keep the lane in true conjunction.',
    archetypes: ['alignment_combo', 'celestial_midrange'],
    weaknesses: ['low_attack'],
    complexity: 'beginner',
    art: {
      subject: 'Scholar turning a golden celestial wheel that projects star-lines onto an ally',
      silhouette: 'Robed astronomer beside a vertical brass star-ring',
      palette: ['midnight_purple', 'gold', 'celestial_blue'],
      lighting: 'Warm gold star-lines',
      environment: 'Observatory gallery'
    }
  },
  {
    id: 'STR-C-0010',
    name: 'Zenith Shieldbearer',
    type: 'creature',
    subtype: 'celestial_guardian',
    faction: 'starweave',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 2,
    health: 4,
    keywords: ['guard', 'ward'],
    mechanics: ['alignment'],
    description: 'Guard, Ward. Protects Rear units and negates the first hostile targeted effect.',
    abilities: [],
    lore: 'Her round shield is polished meteoric iron etched with the northern circumpolar stars.',
    archetypes: ['prediction_control', 'celestial_midrange'],
    weaknesses: ['pierce'],
    complexity: 'beginner',
    art: {
      subject: 'Armored guardian holding a circular star-map shield that glows with golden constellations',
      silhouette: 'Stout frontline knight with disc shield',
      palette: ['midnight_purple', 'gold', 'brilliant_white'],
      lighting: 'Constellation nodes shining on the shield face',
      environment: 'Astral Archive steps'
    }
  },
  {
    id: 'STR-C-0011',
    name: 'Nebula Veil-Dancer',
    type: 'creature',
    subtype: 'astral_adept',
    faction: 'starweave',
    rarity: 'uncommon',
    role: 'trickster',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ['skirmish', 'echo'],
    mechanics: ['alignment'],
    description: 'Skirmish, Echo. On Summon: Gain 1 Alignment counter and grant an ally +1/+0.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'self', counter: 'alignment', amount: 1 },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 0 }
        ]
      }
    ],
    lore: 'Her silk ribbons trace the retrograde loop of the outer planets.',
    archetypes: ['alignment_combo', 'celestial_midrange'],
    weaknesses: ['anchor'],
    complexity: 'intermediate',
    art: {
      subject: 'Dancer trailing ribbons of glowing purple-and-gold nebula dust across the floor',
      silhouette: 'Leaping figure encircled by elliptical star trails',
      palette: ['midnight_purple', 'gold', 'celestial_blue'],
      lighting: 'Glowing nebula mist and star sparks',
      environment: 'Astral Gardens'
    }
  },
  {
    id: 'STR-C-0012',
    name: 'Starlight Judicator',
    type: 'creature',
    subtype: 'cosmic_templar',
    faction: 'starweave',
    rarity: 'uncommon',
    role: 'controller',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: ['resonate'],
    mechanics: ['alignment'],
    description: 'On Summon: Exhaust an enemy creature in this lane. Resonate: If you control 2+ lanes, also deal 2 damage to it.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust' },
          { operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }
        ]
      }
    ],
    lore: 'When the constellations align across two lanes, judgment falls like a meteor.',
    archetypes: ['prediction_control', 'celestial_midrange'],
    weaknesses: ['ward'],
    complexity: 'intermediate',
    art: {
      subject: 'Cosmic templar calling down a pillar of blue-gold starlight onto an opponent',
      silhouette: 'Armored judge with raised astrolabe gavel',
      palette: ['celestial_blue', 'gold', 'midnight_purple'],
      lighting: 'Vertical beam of brilliant starlight',
      environment: 'Hall of Sealed Echoes'
    }
  },
  {
    id: 'STR-C-0013',
    name: 'Supernova Duelist',
    type: 'creature',
    subtype: 'astral_champion',
    faction: 'starweave',
    rarity: 'uncommon',
    role: 'assassin',
    cost: 4,
    attack: 4,
    health: 3,
    keywords: ['swift', 'awaken'],
    mechanics: ['alignment'],
    description: 'Swift. On Summon: Gain 1 Alignment counter. Awaken: Deals +1 damage to the enemy Leader after attacking.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'add_counter', target: 'self', counter: 'alignment', amount: 1 }]
      },
      {
        trigger: 'after_this_attacks',
        conditions: [],
        effects: [{ operation: 'deal_damage', target: 'enemy_leader', amount: 1 }]
      }
    ],
    lore: 'A collapsing star burns brightest in its final lunging strike.',
    archetypes: ['alignment_combo', 'celestial_midrange'],
    weaknesses: ['low_health'],
    complexity: 'intermediate',
    art: {
      subject: 'Star-armored fencer lunging in a burst of golden supernova flare',
      silhouette: 'Radiant starburst behind a darting blade-master',
      palette: ['gold', 'brilliant_white', 'midnight_purple'],
      lighting: 'Blinding white-gold flare at the rapier tip',
      environment: 'Floating Observatory platform'
    }
  },
  {
    id: 'STR-C-0014',
    name: 'Astral World-Serpent',
    type: 'creature',
    subtype: 'cosmic_dragon',
    faction: 'starweave',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 5,
    health: 7,
    keywords: ['reach', 'ward'],
    mechanics: ['alignment'],
    description: 'Reach, Ward. On Summon: Draw 1 card and grant all allied creatures 1 Alignment counter.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'draw', target: 'ally_leader', amount: 1 },
          { operation: 'add_counter', target: 'all_ally_creatures', counter: 'alignment', amount: 1 }
        ]
      }
    ],
    lore: 'Its coils span the dome of the Celestial Library, each scale a catalogued star.',
    archetypes: ['prediction_control', 'alignment_combo'],
    weaknesses: ['high_cost'],
    complexity: 'advanced',
    art: {
      subject: 'Luminous constellation dragon coiling through the open dome of an observatory',
      silhouette: 'Sinuous serpentine dragon made of starfield and golden rings',
      palette: ['midnight_purple', 'celestial_blue', 'gold', 'brilliant_white'],
      lighting: 'Internal galaxy glow and golden spine stars',
      environment: 'Celestial Library dome'
    }
  },
  {
    id: 'STR-T-0015',
    name: 'Starlight Convergence',
    type: 'tactic',
    subtype: 'quick',
    faction: 'starweave',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['alignment'],
    description: 'Quick Tactic. Grant an allied creature 1 Alignment counter and +1/+2.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'alignment', amount: 1 },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 2 }
        ]
      }
    ],
    lore: 'Three distant stars align in the lens, pouring vigor into the vanguard.',
    archetypes: ['alignment_combo', 'celestial_midrange'],
    weaknesses: ['requires_board_unit'],
    complexity: 'beginner',
    art: {
      subject: 'Three golden star-beams converging onto a knight’s breastplate',
      silhouette: 'Downward cone of constellation geometry',
      palette: ['gold', 'celestial_blue', 'brilliant_white'],
      lighting: 'Radiant starlight focus',
      environment: 'Starlit arena'
    }
  },
  {
    id: 'STR-T-0016',
    name: 'Meteor Shower Judgment',
    type: 'tactic',
    subtype: 'destruction',
    faction: 'starweave',
    rarity: 'uncommon',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['alignment'],
    description: 'Standard Tactic. Deal 4 damage to a target enemy creature and draw 1 card.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'deal_damage', target: 'target_enemy_creature', amount: 4 },
          { operation: 'draw', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Calculated to the millisecond, the falling stars strike the exact tile predicted.',
    archetypes: ['prediction_control', 'celestial_midrange'],
    weaknesses: ['ward'],
    complexity: 'beginner',
    art: {
      subject: 'Barrage of golden-blue meteors streaking down onto an enemy formation',
      silhouette: 'Parallel diagonal meteor trails with impact craters',
      palette: ['celestial_blue', 'gold', 'midnight_purple'],
      lighting: 'Brilliant white-gold impact flashes',
      environment: 'Open observatory courtyard'
    }
  },
  {
    id: 'STR-R-0017',
    name: 'Celestial Chronograph',
    type: 'relic',
    subtype: 'synergy_engine',
    faction: 'starweave',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['alignment'],
    description: 'Relic. On Play: Gain 1 Aether this turn and grant an allied creature 1 Alignment counter.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'gain_aether', target: 'ally_leader', amount: 1 },
          { operation: 'add_counter', target: 'strongest_ally_creature', counter: 'alignment', amount: 1 }
        ]
      }
    ],
    lore: 'It measures sidereal time, finding extra seconds between the ticks of mortal clocks.',
    archetypes: ['alignment_combo', 'prediction_control'],
    weaknesses: ['relic_slot_limit'],
    complexity: 'intermediate',
    art: {
      subject: 'Ornate gold pocket-chronograph open to reveal a swirling starfield dial',
      silhouette: 'Circular celestial timepiece with floating hands',
      palette: ['gold', 'midnight_purple', 'celestial_blue'],
      lighting: 'Warm gold bezel and glowing blue star dial',
      environment: 'Astronomer desk'
    }
  },
  {
    id: 'STR-E-0018',
    name: 'Star-Chart Rotunda',
    type: 'environment',
    subtype: 'celestial_hall',
    faction: 'starweave',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['alignment'],
    description: 'Environment. On Play: Grant all allied creatures 1 Alignment counter and +0/+1.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'all_ally_creatures', counter: 'alignment', amount: 1 },
          { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 0, health_delta: 1 }
        ]
      }
    ],
    lore: 'The marble floor is inlaid with brass meridians that hum when creatures stand at their intersections.',
    archetypes: ['alignment_combo', 'celestial_midrange'],
    weaknesses: ['environment_replacement'],
    complexity: 'beginner',
    art: {
      subject: 'Circular marble rotunda whose floor and dome project matching golden constellation maps',
      silhouette: 'Domed rotunda with glowing meridian lines on the floor',
      palette: ['midnight_purple', 'gold', 'celestial_blue'],
      lighting: 'Holographic star map filling the room',
      environment: 'Astral Archive Rotunda'
    }
  },

  // =========================================================================
  // FACTION 08 — GRAVEWILD (+10 cards: 0009..0018 -> 18 total)
  // Archetypes: Reclaim Value, Sacrifice Swarm, Decay Control
  // =========================================================================
  {
    id: 'GRV-C-0009',
    name: 'Spore-Husk Thrall',
    type: 'creature',
    subtype: 'corrupted_flora',
    faction: 'gravewild',
    rarity: 'common',
    role: 'trickster',
    cost: 1,
    attack: 1,
    health: 2,
    keywords: ['corrode', 'rebirth'],
    mechanics: ['reclaim'],
    description: 'Corrode, Rebirth. On Summon: Apply 1 Corrode counter (-1/-1) to an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1 }]
      }
    ],
    lore: 'When stepped upon, its hollow pod bursts in a cloud of rust-green memory spores.',
    archetypes: ['decay_control', 'sacrifice_swarm'],
    weaknesses: ['ward'],
    complexity: 'beginner',
    art: {
      subject: 'Small shambling briar-and-bone husk releasing green decay spores',
      silhouette: 'Hunched thorny figure with glowing spore pods',
      palette: ['moss_black', 'sickly_green', 'bone_white'],
      lighting: 'Green bioluminescent spore cloud',
      environment: 'Blighted marsh'
    }
  },
  {
    id: 'GRV-C-0010',
    name: 'Barrow-Bone Archer',
    type: 'creature',
    subtype: 'fossil_marksman',
    faction: 'gravewild',
    rarity: 'common',
    role: 'marksman',
    cost: 2,
    attack: 2,
    health: 2,
    keywords: ['reach', 'corrode'],
    mechanics: ['reclaim'],
    description: 'Reach. On Summon: Deal 1 damage to an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }]
      }
    ],
    lore: 'Its bow is carved from a fossil rib; its arrows are tipped with bog-iron.',
    archetypes: ['decay_control', 'sacrifice_swarm'],
    weaknesses: ['low_health'],
    complexity: 'beginner',
    art: {
      subject: 'Skeletal archer draped in burgundy vines firing a green-fletched bone arrow',
      silhouette: 'Angular bone bowman kneeling on a cairn',
      palette: ['bone_white', 'deep_burgundy', 'sickly_green'],
      lighting: 'Eerie green glow on the arrowhead',
      environment: 'Ruined barrow mound'
    }
  },
  {
    id: 'GRV-C-0011',
    name: 'Mire-Root Keeper',
    type: 'creature',
    subtype: 'spirit_tender',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: 'support',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ['drain'],
    mechanics: ['reclaim'],
    description: 'Drain. On Summon: Restore 2 Vitality to your Leader and grant an allied creature +1/+1.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'heal', target: 'ally_leader', amount: 2 },
          { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 1 }
        ]
      }
    ],
    lore: 'She feeds the roots with forgotten names so the new blossoms stand taller.',
    archetypes: ['reclaim_value', 'decay_control'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: 'Robed bog-keeper watering burgundy root-flowers with a bone pitcher',
      silhouette: 'Stooped figure with antler headdress and lantern',
      palette: ['deep_burgundy', 'bone_white', 'moss_black'],
      lighting: 'Soft green spirit-light rising from the roots',
      environment: 'Rotgarden path'
    }
  },
  {
    id: 'GRV-C-0012',
    name: 'Fossil-Cage Warden',
    type: 'creature',
    subtype: 'ossuary_construct',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: 'controller',
    cost: 4,
    attack: 3,
    health: 5,
    keywords: ['guard', 'anchor'],
    mechanics: ['reclaim'],
    description: 'Guard, Anchor. On Summon: Apply 1 Corrode counter (-1/-1) and Exhaust to an enemy in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1 },
          { operation: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust' }
        ]
      }
    ],
    lore: 'Ribs of ancient leviathans snap shut around anyone foolish enough to charge its lane.',
    archetypes: ['decay_control'],
    weaknesses: ['ranged_removal'],
    complexity: 'intermediate',
    art: {
      subject: 'Hulking warden whose torso is an open fossil ribcage trapping green spectral flames',
      silhouette: 'Broad rib-caged guardian with heavy bone club',
      palette: ['bone_white', 'moss_black', 'sickly_green'],
      lighting: 'Bright green flame caged inside white ribs',
      environment: 'Ossuary gate'
    }
  },
  {
    id: 'GRV-C-0013',
    name: 'Carrion-Briar Caller',
    type: 'creature',
    subtype: 'necrotic_summoner',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: 'summoner',
    cost: 4,
    attack: 2,
    health: 3,
    keywords: ['rebirth'],
    mechanics: ['reclaim'],
    description: 'Rebirth. On Summon: Summon two 1/1 Echo Remnant tokens into open slots.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Echo Remnant',
            attack: 1,
            health: 1,
            keywords: []
          },
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
    lore: 'Where one memory shatters, two half-remembered shadows rise to take its place.',
    archetypes: ['sacrifice_swarm', 'reclaim_value'],
    weaknesses: ['pierce', 'board_space'],
    complexity: 'intermediate',
    art: {
      subject: 'Summoner raising a gnarled root-staff as two skeletal plant-spirits claw out of the earth',
      silhouette: 'Central caster flanked by two rising remnant silhouettes',
      palette: ['deep_burgundy', 'bone_white', 'sickly_green'],
      lighting: 'Twin green ground-eruptions',
      environment: 'Sunken cemetery'
    }
  },
  {
    id: 'GRV-C-0014',
    name: 'Dread-Tar Tyrant',
    type: 'creature',
    subtype: 'fossil_dragon',
    faction: 'gravewild',
    rarity: 'rare',
    role: 'vanguard',
    cost: 5,
    attack: 5,
    health: 5,
    keywords: ['pierce', 'corrode', 'drain'],
    mechanics: ['reclaim'],
    description: 'Pierce, Drain. On Summon: Apply 1 Corrode counter (-1/-1) to all enemy creatures in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1 }]
      }
    ],
    lore: 'Preserved for ten millennia in bubbling pitch, it woke hungry for modern Aether.',
    archetypes: ['decay_control', 'reclaim_value'],
    weaknesses: ['hard_removal'],
    complexity: 'intermediate',
    art: {
      subject: 'Fossilized tyrannosaur-drake dripping with black tar and glowing green runes',
      silhouette: 'Massive jaws and spiked fossil spine',
      palette: ['moss_black', 'bone_white', 'sickly_green', 'deep_burgundy'],
      lighting: 'Glowing green eye sockets and tar sheen',
      environment: 'Tar-pit excavation'
    }
  },
  {
    id: 'GRV-T-0015',
    name: 'Blighted Spores',
    type: 'tactic',
    subtype: 'standard',
    faction: 'gravewild',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: ['corrode'],
    mechanics: ['reclaim'],
    description: 'Quick Tactic. Apply 2 Corrode counters (-2/-2) to a target enemy creature.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [{ operation: 'add_counter', target: 'target_enemy_creature', counter: 'corrode', amount: 2 }]
      }
    ],
    lore: 'Armor rusts to flakes before the swing even finishes.',
    archetypes: ['decay_control', 'sacrifice_swarm'],
    weaknesses: ['ward'],
    complexity: 'beginner',
    art: {
      subject: 'Cloud of sickly green spores corroding a steel breastplate',
      silhouette: 'Swirling spore cloud around crumbling armor',
      palette: ['sickly_green', 'moss_black', 'deep_burgundy'],
      lighting: 'Acid-green luminescence',
      environment: 'Overgrown ruin'
    }
  },
  {
    id: 'GRV-T-0016',
    name: 'Soul-Soil Harvest',
    type: 'tactic',
    subtype: 'healing',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['reclaim'],
    description: 'Standard Tactic. Reclaim 1 card from your discard pile, draw 1 card, and restore 2 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'reclaim_from_discard', target: 'ally_leader', amount: 1 },
          { operation: 'draw', target: 'ally_leader', amount: 1 },
          { operation: 'heal', target: 'ally_leader', amount: 2 }
        ]
      }
    ],
    lore: 'Nothing is wasted in the Gravewild; every fallen Echo feeds the next bloom.',
    archetypes: ['reclaim_value', 'decay_control'],
    weaknesses: ['low_tempo_on_board'],
    complexity: 'intermediate',
    art: {
      subject: 'Burgundy roots drawing glowing green crystal fragments up out of dark soil',
      silhouette: 'Upward stream of memory motes through intertwined roots',
      palette: ['deep_burgundy', 'sickly_green', 'bone_white'],
      lighting: 'Subterranean green glow',
      environment: 'Garden of Forgotten Names'
    }
  },
  {
    id: 'GRV-R-0017',
    name: 'Ossuary Bell-Chime',
    type: 'relic',
    subtype: 'synergy_engine',
    faction: 'gravewild',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['reclaim'],
    description: 'Relic. On Play and at the end of your turn: Summon a 1/1 Echo Remnant token if a slot is open.',
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
    lore: 'Each toll of the bone-bronze chime calls another forgotten sentry to the line.',
    archetypes: ['sacrifice_swarm', 'reclaim_value'],
    weaknesses: ['board_space_limits'],
    complexity: 'intermediate',
    art: {
      subject: 'Three tarnished bronze bells suspended from a fossil archway dripping with moss',
      silhouette: 'Arch-framed bell trio with green acoustic rings',
      palette: ['bone_white', 'moss_black', 'sickly_green'],
      lighting: 'Spectral green chime ripples',
      environment: 'Barrow belfry'
    }
  },
  {
    id: 'GRV-E-0018',
    name: 'Petrified Root-Catacombs',
    type: 'environment',
    subtype: 'ossuary_dungeon',
    faction: 'gravewild',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: ['corrode'],
    mechanics: ['reclaim'],
    description: 'Environment. On Play: Apply 1 Corrode counter (-1/-1) to an enemy creature and restore 2 Vitality to your Leader.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'add_counter', target: 'target_enemy_creature', counter: 'corrode', amount: 1 },
          { operation: 'heal', target: 'ally_leader', amount: 2 }
        ]
      }
    ],
    lore: 'Beneath the forest floor, fossilized roots and ancient vaults merge into a single labyrinth.',
    archetypes: ['decay_control', 'reclaim_value'],
    weaknesses: ['environment_replacement'],
    complexity: 'beginner',
    art: {
      subject: 'Underground catacomb supported by petrified white tree roots and lit by green torches',
      silhouette: 'Ribbed root-vault tunnel framing a stone duel table',
      palette: ['bone_white', 'moss_black', 'deep_burgundy', 'sickly_green'],
      lighting: 'Flickering green wall sconces',
      environment: 'Echo Caverns lower depth'
    }
  },

  // =========================================================================
  // NEUTRAL COLLECTION (+8 cards: 0009..0016 -> 16 total)
  // Flexible staples and 2v2 Tag-Supportive cooperative cards
  // =========================================================================
  {
    id: 'NEU-C-0009',
    name: 'Lanternbearer Apprentice',
    type: 'creature',
    subtype: 'human_initiate',
    faction: 'neutral',
    rarity: 'common',
    role: 'support',
    cost: 1,
    attack: 1,
    health: 3,
    keywords: [],
    mechanics: [],
    description: 'On Summon: Restore 2 Vitality to your Leader (or Team Vitality in 2v2 Tag Duels).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'heal', target: 'ally_leader', amount: 2 }]
      }
    ],
    lore: 'First-week initiates carry the Aether lanterns that mark legal duel boundaries.',
    archetypes: ['neutral_curve', 'tag_support'],
    weaknesses: ['low_attack'],
    complexity: 'beginner',
    art: {
      subject: 'Young apprentice holding up a warm brass lantern in Arrival Square',
      silhouette: 'Slender youth with lantern pole',
      palette: ['warm_gold', 'sapphire_blue', 'parchment_cream'],
      lighting: 'Warm golden lantern glow',
      environment: 'Lumenport Arrival Square'
    }
  },
  {
    id: 'NEU-C-0010',
    name: 'Market Alley Mechanic',
    type: 'creature',
    subtype: 'human_tinker',
    faction: 'neutral',
    rarity: 'common',
    role: 'trickster',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ['shield'],
    mechanics: [],
    description: 'Shield (1). On Summon: Grant an allied creature +1/+0.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 0 }]
      }
    ],
    lore: 'She calibrates card-casters from all eight factions at her stall behind the fish market.',
    archetypes: ['neutral_curve', 'equipment_tempo'],
    weaknesses: ['modest_stats'],
    complexity: 'beginner',
    art: {
      subject: 'Street mechanic tuning a wrist-mounted card projector with a glowing screwdriver',
      silhouette: 'Aproned tinker with magnifying visor',
      palette: ['brass', 'leather_brown', 'cyan_crystal'],
      lighting: 'Blue spark from the card device',
      environment: 'Central Card Market alley'
    }
  },
  {
    id: 'NEU-C-0011',
    name: 'Independent Duelist',
    type: 'creature',
    subtype: 'human_challenger',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ['swift'],
    mechanics: [],
    description: 'Swift. Can attack on the turn it is summoned.',
    abilities: [],
    lore: 'Bound to no guild or choir, he fights purely for tournament Crowns and glory.',
    archetypes: ['tempo', 'aggro_hybrid'],
    weaknesses: ['2_health_fragility'],
    complexity: 'beginner',
    art: {
      subject: 'Dashing duelist leaping forward with an Aether-charged dueling sabre',
      silhouette: 'Dynamic mid-air lunge with fluttering scarf',
      palette: ['sapphire_blue', 'warm_gold', 'steel_gray'],
      lighting: 'Golden blade trail',
      environment: 'Duelist Plaza'
    }
  },
  {
    id: 'NEU-C-0012',
    name: 'Accord Peacekeeper',
    type: 'creature',
    subtype: 'human_arbiter',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'controller',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ['guard', 'silence'],
    mechanics: [],
    description: 'Guard. On Summon: Silence an enemy creature in this lane.',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [{ operation: 'silence', target: 'enemy_in_lane' }]
      }
    ],
    lore: 'Authorized by the Accord Institute to shut down illegal Echo projections on sight.',
    archetypes: ['universal_counterplay', 'defensive_midrange'],
    weaknesses: ['low_attack'],
    complexity: 'intermediate',
    art: {
      subject: 'Accord officer raising a brass seal-staff that projects a golden dampening ring',
      silhouette: 'Upright uniformed arbiter with shoulder cape',
      palette: ['sapphire_blue', 'warm_gold', 'white'],
      lighting: 'Golden law-rune ring',
      environment: 'Accord Institute plaza'
    }
  },
  {
    id: 'NEU-C-0013',
    name: 'Banneret of the Twin Accord',
    type: 'creature',
    subtype: 'human_commander',
    faction: 'neutral',
    rarity: 'rare',
    role: 'summoner',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: ['shield'],
    mechanics: [],
    description: 'Shield (1). On Summon: Summon a 2/2 Accord Squire token with Guard into an open slot (supports 1v1 and 2v2 Tag teams).',
    abilities: [
      {
        trigger: 'on_summon',
        conditions: [],
        effects: [
          {
            operation: 'summon_token',
            target: 'open_ally_slot',
            token_name: 'Accord Squire',
            attack: 2,
            health: 2,
            keywords: ['guard']
          }
        ]
      }
    ],
    lore: 'Trained specifically for 2v2 Tag Convergence Duels, she coordinates two partners as one.',
    archetypes: ['tag_support', 'defensive_midrange'],
    weaknesses: ['board_space_limits'],
    complexity: 'intermediate',
    art: {
      subject: 'Commander planting a twin-crested gold banner beside an armored squire',
      silhouette: 'Tall standard-bearer with wide double-pennant flag',
      palette: ['warm_gold', 'sapphire_blue', 'steel_gray'],
      lighting: 'Bright banner glow',
      environment: 'Grand Tournament Hall'
    }
  },
  {
    id: 'NEU-T-0014',
    name: 'Tactical Reposition',
    type: 'tactic',
    subtype: 'quick',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: ['shield'],
    mechanics: [],
    description: 'Quick Tactic. Move an allied creature to an open adjacent lane slot, grant it Shield (1), and draw 1 card.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'move_lane', target: 'ally_creature_in_lane_or_any', direction: 'adjacent' },
          { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield' },
          { operation: 'draw', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: 'Shifting one lane left at the right second turns a losing trade into a flank.',
    archetypes: ['universal_defense', 'tag_support'],
    weaknesses: ['anchor', 'full_board'],
    complexity: 'beginner',
    art: {
      subject: 'Glowing golden tactical arrows shifting a creature projection across lane tiles',
      silhouette: 'Curved golden movement arrow',
      palette: ['warm_gold', 'sapphire_blue', 'cyan_crystal'],
      lighting: 'Holographic grid highlight',
      environment: 'Convergence tabletop'
    }
  },
  {
    id: 'NEU-R-0015',
    name: 'Veteran’s Gauntlet',
    type: 'relic',
    subtype: 'equipment',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: [],
    description: 'Relic. On Play: Grant your strongest creature +2/+1.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [{ operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 2, health_delta: 1 }]
      }
    ],
    lore: 'Passed down through three generations of Lumenport tournament champions.',
    archetypes: ['neutral_curve', 'tempo'],
    weaknesses: ['empty_board'],
    complexity: 'beginner',
    art: {
      subject: 'Polished steel-and-brass dueling gauntlet resting on a velvet cushion',
      silhouette: 'Armored gauntlet with glowing Aether socket',
      palette: ['steel_gray', 'warm_gold', 'sapphire_blue'],
      lighting: 'Warm spotlight on burnished metal',
      environment: 'Tournament trophy case'
    }
  },
  {
    id: 'NEU-E-0016',
    name: 'Wandering Tournament Pavilion',
    type: 'environment',
    subtype: 'festival_arena',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: [],
    description: 'Environment. On Play: Draw 1 card and grant all allied creatures +0/+1.',
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'draw', target: 'ally_leader', amount: 1 },
          { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 0, health_delta: 1 }
        ]
      }
    ],
    lore: 'Canvas pavilions pitch wherever festival challengers gather along the coast.',
    archetypes: ['universal_value', 'tag_support'],
    weaknesses: ['environment_replacement'],
    complexity: 'beginner',
    art: {
      subject: 'Colorful blue-and-gold striped tournament pavilion tent pitched in a bustling plaza',
      silhouette: 'Peaked festival tent with fluttering pennants',
      palette: ['sapphire_blue', 'warm_gold', 'parchment_cream'],
      lighting: 'Festive string lanterns in warm daylight',
      environment: 'Lumenport Festival Grounds'
    }
  }
];
