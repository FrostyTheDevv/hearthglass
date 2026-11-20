// Canonical Phase 5 Expansion: 480 -> 640 Original Cards (Milestone 10)
// Adds 12 cards to each of the 8 major factions (0049..0060: 8 Creatures, 3 Tactics, 1 Relic) = 96 cards
// Adds 64 cards to Neutral (0097..0160: 30 Creatures, 18 Tactics, 10 Relics, 6 Environments) = 64 cards
// Total new cards: exactly 160 cards. (Cumulative total: exactly 640 cards)
// Canonical balance:
// - 368 Creatures, 136 Tactics, 88 Relics, 48 Environments
// - 320 Common, 192 Uncommon, 96 Rare, 32 Legendary (Zero Epic)
// - 60 cards per major faction (480 total) + 160 Neutral cards = 640 total

export const EXPANSION_640_CARDS = [
  {
    id: 'EMB-C-0049',
    name: "Ignis Hearth-Scout",
    type: 'creature',
    subtype: 'human_scout',
    faction: 'emberclad',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 1,
    keywords: ["swift"],
    mechanics: ['heat'],
    description: "Swift. After this attacks, gain 1 Heat counter (+1 Attack).",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'self', amount: 1, counter: 'heat' }
      ]
    }],
    lore: "Runs ahead of the magma flows, lighting torch-markers with sparks struck from his knuckles.",
    archetypes: ['heat_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Agile scout leaping across bubbling lava fissure with glowing torch",
      silhouette: "Dynamic leaping runner trailing smoke",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-C-0050',
    name: "Basalt Wall-Breaker",
    type: 'creature',
    subtype: 'dwarf_warrior',
    faction: 'emberclad',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 5,
    keywords: ["guard"],
    mechanics: ['heat'],
    description: "Guard. When damaged, deal 1 damage to the enemy creature in this lane.",
    abilities: [{
      trigger: 'when_damaged',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
      ]
    }],
    lore: "His volcanic basalt buckler shatters incoming weapons and showers the attacker with heated grit.",
    archetypes: ['heat_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Stout dwarven defender hunkered behind a massive basalt slab shield",
      silhouette: "Broad rectangular shield with glowing cracks",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-C-0051',
    name: "Cinder-Dagger Skulker",
    type: 'creature',
    subtype: 'human_rogue',
    faction: 'emberclad',
    rarity: 'common',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ["stealth"],
    mechanics: ['heat'],
    description: "Stealth. On Summon: Inflict 1 Burn counter on the enemy creature in this lane.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'enemy_in_lane', amount: 1, counter: 'burn' }
      ]
    }],
    lore: "A blade dipped in sulfur and quenched in chimney pitch burns long after the puncture.",
    archetypes: ['heat_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Hooded volcanic rogue stepping from furnace steam with red-hot stiletto",
      silhouette: "Slender lunging rogue with streaming daggers",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-C-0052',
    name: "Pyre-Sling Bombardier",
    type: 'creature',
    subtype: 'human_marksman',
    faction: 'emberclad',
    rarity: 'common',
    role: 'marksman',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["reach"],
    mechanics: ['heat'],
    description: "Reach. After this attacks, inflict 1 Burn counter on an enemy creature in this lane.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'enemy_in_lane', amount: 1, counter: 'burn' }
      ]
    }],
    lore: "His bronze-weighted sling lobs clay globes packed with live charcoal.",
    archetypes: ['heat_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Foundry marksman whirling an incendiary sling above a furnace rampart",
      silhouette: "Overhead whirling sling silhouette",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-C-0053',
    name: "Caldera Lava-Shaper",
    type: 'creature',
    subtype: 'human_pyromancer',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: [],
    mechanics: ['heat'],
    description: "On Summon: Deal 1 damage to all enemy creatures.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 1 }
      ]
    }],
    lore: "Channeling subterranean thermal veins, she summons geysers of molten slag across opposing ranks.",
    archetypes: ['heat_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Pyromancer in brass robes raising twin magma plumes with open hands",
      silhouette: "Robed caster framed by twin erupting lava pillars",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-C-0054',
    name: "Foundry Chief Anvil-Master",
    type: 'creature',
    subtype: 'dwarf_smith',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: 'support',
    cost: 4,
    attack: 3,
    health: 5,
    keywords: ["guard"],
    mechanics: ['heat'],
    description: "Guard. At the start of your turn, grant an allied creature +1 Attack.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 0 }
      ]
    }],
    lore: "Every hammer blow on the great forge bellows resonates into the weapons of his guild-brethren.",
    archetypes: ['heat_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Broad-shouldered dwarven smith striking a massive red-hot broadsword on an anvil",
      silhouette: "Broad smith raising heavy hammer above illuminated anvil",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-C-0055',
    name: "Lord Ignacius, Avatar of the Caldera",
    type: 'creature',
    subtype: 'elemental_avatar',
    faction: 'emberclad',
    rarity: 'legendary',
    role: 'colossus',
    cost: 8,
    attack: 8,
    health: 8,
    keywords: ["pierce","shield"],
    mechanics: ['heat'],
    description: "Pierce, Shield (1). On Summon: Deal 3 damage to all enemy creatures and gain 3 Heat counters.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 3 }
        , {"operation":"add_counter","target":"self","counter":"heat","amount":3}
      ]
    }],
    lore: "The molten heart of Mount Pyraxis given flesh and iron crown. When Ignacius steps upon the field, stones melt to slag.",
    archetypes: ['heat_core'],
    weaknesses: ['silence'],
    complexity: 'advanced',
    art: {
      subject: "Titanic magma giant wearing an obsidian crown and striding through a burning caldera",
      silhouette: "Towering horned elemental titan crowned in flame",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-C-0056',
    name: "Ash-Whirl Skirmisher",
    type: 'creature',
    subtype: 'human_skirmisher',
    faction: 'emberclad',
    rarity: 'rare',
    role: 'trickster',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ["skirmish"],
    mechanics: ['heat'],
    description: "Skirmish. When this moves lanes, gain 1 Heat counter.",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'self', amount: 1, counter: 'heat' }
      ]
    }],
    lore: "Vaulting on soot-stained poles over conveyor sluices, he strikes wherever the enemy flanks are exposed.",
    archetypes: ['heat_core'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: "Acrobatic warrior vaulting across an iron foundry sluice with a bladed staff",
      silhouette: "Vaulting pole-fighter in mid-air above glowing embers",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-T-0057',
    name: "Slag-Sparks Flash",
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
    description: "Quick Tactic. Deal 2 damage to an enemy creature in target lane.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }
      ]
    }],
    lore: "A handful of blinding forge-shavings thrown directly into the enemy visor.",
    archetypes: ['heat_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Burst of blinding white-gold spark shower striking an iron visor",
      silhouette: "Explosive radial spray of white sparks",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-T-0058',
    name: "Infernal Resurgence",
    type: 'tactic',
    subtype: 'standard',
    faction: 'emberclad',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['heat'],
    description: "Standard Tactic. Draw 2 cards and grant your strongest allied creature 1 Heat counter.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
        , {"operation":"add_counter","target":"strongest_ally_creature","counter":"heat","amount":1}
      ]
    }],
    lore: "Opening the furnace draft pipes feeds oxygen directly into the duelist’s reserve.",
    archetypes: ['heat_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Massive blast doors opening to reveal a roaring forge firebox",
      silhouette: "Symmetrical open arched furnace doors pouring golden light",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-T-0059',
    name: "Anvil-Shatter Decree",
    type: 'tactic',
    subtype: 'standard',
    faction: 'emberclad',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['heat'],
    description: "Standard Tactic. Destroy a target enemy creature.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'destroy', target: 'target_enemy_creature' }
      ]
    }],
    lore: "The Chief Artificer stamps the reject mark upon the challenger’s armor, condemning it to the smelter.",
    archetypes: ['heat_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Gigantic pneumatic forge piston crushing a steel shield into fragments",
      silhouette: "Vertical hammer slamming down with shockwave ripples",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'EMB-R-0060',
    name: "Crucible Draft-Bellows",
    type: 'relic',
    subtype: 'forge_relic',
    faction: 'emberclad',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['heat'],
    description: "Relic. At the start of your turn, grant your strongest allied creature 1 Heat counter.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'strongest_ally_creature', amount: 1, counter: 'heat' }
      ]
    }],
    lore: "Twin leather bellows that pump sulfurous air through the floor grating of the table.",
    archetypes: ['heat_core'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Heavy brass-banded leather bellows mounted on an iron frame with glowing exhaust vents",
      silhouette: "V-shaped mechanical bellows with smoke vents",
      palette: ["molten_amber","volcanic_red","charcoal_black"],
      lighting: 'Warm metallic highlights and gem sheen',
      environment: 'The Crucible Reaches'
    }
  },
  {
    id: 'VER-C-0049',
    name: "Briar-Weft Seedling",
    type: 'creature',
    subtype: 'sylvan_plant',
    faction: 'verdant_pact',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 1,
    health: 3,
    keywords: ["swift"],
    mechanics: ['growth'],
    description: "Swift. After this attacks, gain 1 Growth counter (+1/+1).",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'self', amount: 1, counter: 'growth' }
      ]
    }],
    lore: "Rooting in stone paving within heartbeats, it draws Aether sap directly from the bedrock.",
    archetypes: ['growth_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Luminous green sapling sprouting thorny tendrils across cracked stone",
      silhouette: "Twisting upright vine seedling with spreading leaf crown",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-C-0050',
    name: "Ironwood Bark-Bulwark",
    type: 'creature',
    subtype: 'treant_guardian',
    faction: 'verdant_pact',
    rarity: 'common',
    role: 'bulwark',
    cost: 3,
    attack: 2,
    health: 5,
    keywords: ["guard","anchor"],
    mechanics: ['growth'],
    description: "Guard, Anchor. At the end of your turn, restore 1 Health to this creature.",
    abilities: [{
      trigger: 'turn_end',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'self', amount: 1 }
      ]
    }],
    lore: "Petrified timber grown under druidic hymns cannot be split by common steel.",
    archetypes: ['growth_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Broad-trunked wooden sentry with braided bark plates and glowing emerald eyes",
      silhouette: "Solid tree-trunk silhouette with rooted base",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-C-0051',
    name: "Thorn-Needle Stalker",
    type: 'creature',
    subtype: 'insectoid_hunter',
    faction: 'verdant_pact',
    rarity: 'common',
    role: 'assassin',
    cost: 4,
    attack: 4,
    health: 3,
    keywords: ["stealth"],
    mechanics: ['growth'],
    description: "Stealth. After this attacks, gain 1 Growth counter (+1/+1).",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'self', amount: 1, counter: 'growth' }
      ]
    }],
    lore: "Silent as falling foliage until its needle-barbed forelegs strike.",
    archetypes: ['growth_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Camouflaged praying mantis poised on a mossy branch in emerald gloom",
      silhouette: "Sharply angled predatory insect silhouette",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-C-0052',
    name: "Canopy Long-Bowman",
    type: 'creature',
    subtype: 'sylvan_archer',
    faction: 'verdant_pact',
    rarity: 'common',
    role: 'marksman',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["reach"],
    mechanics: ['growth'],
    description: "Reach. After this attacks, restore 1 Vitality to your Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Each feathered arrow is fletched with living willow leaves that bloom upon impact.",
    archetypes: ['growth_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Woodland archer in leafy cloak drawing an ornate yew bow",
      silhouette: "Tall archer silhouette framed by canopy boughs",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-C-0053',
    name: "Grove Heart-Weaver",
    type: 'creature',
    subtype: 'human_druid',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: [],
    mechanics: ['growth'],
    description: "On Summon: Restore 2 Health to all allied creatures.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'all_ally_creatures', amount: 2 }
      ]
    }],
    lore: "Weaving strands of living sunlight, she knits splintered shields and wounded flesh alike.",
    archetypes: ['growth_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Druidess surrounded by swirling emerald ribbons of healing pollen",
      silhouette: "Graceful robed figure with raised arms trailing light",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-C-0054',
    name: "Elder Treant Tender",
    type: 'creature',
    subtype: 'dryad_warden',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: 'support',
    cost: 4,
    attack: 2,
    health: 6,
    keywords: ["guard"],
    mechanics: ['growth'],
    description: "Guard. At the start of your turn, grant your strongest allied creature 1 Growth counter.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'strongest_ally_creature', amount: 1, counter: 'growth' }
      ]
    }],
    lore: "Carries vessels of pure spring water drawn from the Roots of Eldra.",
    archetypes: ['growth_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Dryad tending a young treant sapling with glowing water from an earthen jug",
      silhouette: "Gentle dryad silhouette with antler headdress",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-C-0055',
    name: "Yggdrasil-Born Behemoth",
    type: 'creature',
    subtype: 'primordial_treant',
    faction: 'verdant_pact',
    rarity: 'legendary',
    role: 'colossus',
    cost: 8,
    attack: 7,
    health: 9,
    keywords: ["guard","anchor"],
    mechanics: ['growth'],
    description: "Guard, Anchor. On Summon: Grant all allied creatures 2 Growth counters (+2/+2).",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'all_ally_creatures', amount: 2, counter: 'growth' }
      ]
    }],
    lore: "A walking cathedral of emerald foliage and sacred ironwood. Its canopy shelters whole generations of forest kin.",
    archetypes: ['growth_core'],
    weaknesses: ['silence'],
    complexity: 'advanced',
    art: {
      subject: "Monumental ancient treant colossus crowned with an entire glowing woodland canopy",
      silhouette: "Massive multi-trunk titan dwarfing forest trees",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-C-0056',
    name: "Leaf-Stride Harrier",
    type: 'creature',
    subtype: 'sylvan_trickster',
    faction: 'verdant_pact',
    rarity: 'rare',
    role: 'trickster',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["skirmish"],
    mechanics: ['growth'],
    description: "Skirmish. When this moves lanes, restore 3 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 3 }
      ]
    }],
    lore: "Leaps from bough to bough on buoyant updrafts of forest Aether.",
    archetypes: ['growth_core'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: "Swift forest scout vaulting across branches with twin leaf-daggers",
      silhouette: "Agile airborne figure among swirling leaves",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-T-0057',
    name: "Wild-Root Surge",
    type: 'tactic',
    subtype: 'quick',
    faction: 'verdant_pact',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['growth'],
    description: "Quick Tactic. Restore 3 Health to an allied creature.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_creature_in_lane_or_any', amount: 3 }
      ]
    }],
    lore: "Medicinal sap surges through roots to close wounds instantly.",
    archetypes: ['growth_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Glowing green vines wrapping tightly around a cracked wooden shield",
      silhouette: "Spiral tendrils binding a cracked surface",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-T-0058',
    name: "Bountiful Bloom",
    type: 'tactic',
    subtype: 'standard',
    faction: 'verdant_pact',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['growth'],
    description: "Standard Tactic. Draw 2 cards and restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
        , {"operation":"heal","target":"ally_leader","amount":2}
      ]
    }],
    lore: "Springtime arrives early when the Verdant Grove sings its hymn.",
    archetypes: ['growth_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Glade of white lilies bursting into luminous golden bloom at sunrise",
      silhouette: "Cluster of blooming blossoms radiating petals",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-T-0059',
    name: "Canopy Entanglement",
    type: 'tactic',
    subtype: 'standard',
    faction: 'verdant_pact',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['growth'],
    description: "Standard Tactic. Exhaust all enemy creatures.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'all_enemy_creatures', keyword: 'exhaust' }
      ]
    }],
    lore: "Thick creepers drop from high boughs to immobilize the entire opposing vanguard.",
    archetypes: ['growth_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Dense net of thorny brambles snaring heavily armored soldiers",
      silhouette: "Overhead web of tangled vines dropping down",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'VER-R-0060',
    name: "Seed of the First Tree",
    type: 'relic',
    subtype: 'growth_relic',
    faction: 'verdant_pact',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['growth'],
    description: "Relic. At the start of your turn, grant your strongest allied creature 1 Growth counter.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'add_counter', target: 'strongest_ally_creature', amount: 1, counter: 'growth' }
      ]
    }],
    lore: "A golden acorn preserved in clear amber that pulses with gentle emerald warmth.",
    archetypes: ['growth_core'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Glowing golden acorn encased in a polished amber pendant resting on moss",
      silhouette: "Teardrop pendant glowing with an inner seed",
      palette: ["emerald_green","sunlit_amber","moss_brown"],
      lighting: 'Warm metallic highlights and gem sheen',
      environment: 'The Verdant Expanse'
    }
  },
  {
    id: 'IRN-C-0049',
    name: "Clockwork Automaton Scout",
    type: 'creature',
    subtype: 'clockwork_construct',
    faction: 'iron_choir',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 1,
    keywords: ["swift"],
    mechanics: ['assembly'],
    description: "Swift. After this attacks, gain Shield (1).",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'shield' }
      ]
    }],
    lore: "Spring-driven brass courser clicking rhythmically as its optical lenses scan the perimeter.",
    archetypes: ['assembly_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Brass clockwork mechanical hound with exposed gears bounding across cobblestones",
      silhouette: "Angular quadruped construct with gear teeth",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-C-0050',
    name: "Bastion Steel-Warden",
    type: 'creature',
    subtype: 'forged_construct',
    faction: 'iron_choir',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 5,
    keywords: ["guard"],
    mechanics: ['assembly'],
    description: "Guard. On Summon: Gain Shield (1).",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'shield' }
      ]
    }],
    lore: "An immovable pillar of riveted iron plate and hydraulic stabilizer pistons.",
    archetypes: ['assembly_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Towering armored automaton bracing heavy steel pavise against floor rails",
      silhouette: "Monolithic rectangular shield with mechanical legs",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-C-0051',
    name: "Precision Gear-Blade",
    type: 'creature',
    subtype: 'clockwork_assassin',
    faction: 'iron_choir',
    rarity: 'common',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ["pierce"],
    mechanics: ['assembly'],
    description: "Pierce. On Summon: Deal 1 damage to the enemy creature in this lane.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
      ]
    }],
    lore: "Dual rotating circular sawblades whir at twenty thousand revolutions per minute.",
    archetypes: ['assembly_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Sleek brass mechanical assassin deploying spinning circular blades from wrists",
      silhouette: "Sleek robotic silhouette with twin circular blade discs",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-C-0052',
    name: "Pneumatic Crossbow Construct",
    type: 'creature',
    subtype: 'clockwork_marksman',
    faction: 'iron_choir',
    rarity: 'common',
    role: 'marksman',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["reach"],
    mechanics: ['assembly'],
    description: "Reach. After this attacks, deal 1 damage to the enemy Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
      ]
    }],
    lore: "Pressurized steam reservoirs launch tungsten bolts with rhythmic precision.",
    archetypes: ['assembly_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Tripod-mounted brass repeater crossbow firing steam-propelled quarrel",
      silhouette: "Tripod automaton with horizontal crossbow bow",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-C-0053',
    name: "Chorus Resonator-Core",
    type: 'creature',
    subtype: 'clockwork_caster',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: [],
    mechanics: ['assembly'],
    description: "On Summon: Grant all allied creatures Shield (1).",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'shield' }
      ]
    }],
    lore: "Tuned bells inside its bronze thorax harmonize to project protective sonic forcefields.",
    archetypes: ['assembly_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Ornate mechanical automaton with exposed chiming bells inside ribbed brass chest",
      silhouette: "Upright construct with radiating concentric sonic rings",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-C-0054',
    name: "Guild Machinist Overseer",
    type: 'creature',
    subtype: 'human_engineer',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: 'support',
    cost: 4,
    attack: 3,
    health: 5,
    keywords: ["guard"],
    mechanics: ['assembly'],
    description: "Guard. At the start of your turn, restore 2 Health to your strongest allied creature.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'strongest_ally_creature', amount: 2 }
      ]
    }],
    lore: "Carries oil cans, wrenches, and spare rivets to maintain the Choir’s front ranks.",
    archetypes: ['assembly_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Armored engineer repairing an automaton shoulder assembly on the battlefield",
      silhouette: "Engineer holding wrench next to standing robot",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-C-0055',
    name: "The Dreadnought of High Mechanism",
    type: 'creature',
    subtype: 'colossal_automaton',
    faction: 'iron_choir',
    rarity: 'legendary',
    role: 'colossus',
    cost: 8,
    attack: 8,
    health: 8,
    keywords: ["guard","shield"],
    mechanics: ['assembly'],
    description: "Guard, Shield (1). On Summon: Grant all allied creatures Shield (1) and deal 2 damage to all enemy creatures.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'shield' }
        , {"operation":"deal_damage","target":"all_enemy_creatures","amount":2}
      ]
    }],
    lore: "The pinnacle of Choir engineering; a four-story fortress engine walking on articulated iron pistons.",
    archetypes: ['assembly_core'],
    weaknesses: ['silence'],
    complexity: 'advanced',
    art: {
      subject: "Gargantuan walking siege fortress of brass and dark iron venting steam across the battlefield",
      silhouette: "Monumental walking fortress engine with cannon ports",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-C-0056',
    name: "Spring-Loaded Skirmisher",
    type: 'creature',
    subtype: 'clockwork_scout',
    faction: 'iron_choir',
    rarity: 'rare',
    role: 'trickster',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ["skirmish"],
    mechanics: ['assembly'],
    description: "Skirmish. When this moves lanes, gain Shield (1).",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'shield' }
      ]
    }],
    lore: "Coiled steel springs allow it to ricochet between lane boundaries in fractions of a second.",
    archetypes: ['assembly_core'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: "Agile brass construct bounding between stone columns on heavy coiled spring legs",
      silhouette: "Coil-legged mechanical runner bouncing in mid-air",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-T-0057',
    name: "Overclocked Actuators",
    type: 'tactic',
    subtype: 'quick',
    faction: 'iron_choir',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['assembly'],
    description: "Quick Tactic. Grant an allied creature +2 Attack.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 2, health_delta: 0 }
      ]
    }],
    lore: "Dumping steam valves for a single devastating piston punch.",
    archetypes: ['assembly_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Pressure gauge needle spiking into red as steam vents violently from a gauntlet",
      silhouette: "Steam burst radiating from a mechanical fist",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-T-0058',
    name: "Assembly Line Protocol",
    type: 'tactic',
    subtype: 'standard',
    faction: 'iron_choir',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['assembly'],
    description: "Standard Tactic. Draw 2 cards and grant your strongest allied creature Shield (1).",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
        , {"operation":"grant_keyword","target":"strongest_ally_creature","keyword":"shield"}
      ]
    }],
    lore: "Sub-assemblies ship directly from the Ironhold foundries onto the duel table.",
    archetypes: ['assembly_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Conveyor belts carrying freshly stamped brass automaton components",
      silhouette: "Overhead view of rhythmic conveyor tracks",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-T-0059',
    name: "Cataclysmic Discharge",
    type: 'tactic',
    subtype: 'standard',
    faction: 'iron_choir',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['assembly'],
    description: "Standard Tactic. Deal 6 damage to a target enemy creature.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'target_enemy_creature', amount: 6 }
      ]
    }],
    lore: "High-voltage capacitors release their full energy reserve in a blinding blue electric arc.",
    archetypes: ['assembly_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Massive brass capacitor coil arcing brilliant lightning into an armored target",
      silhouette: "Jagged bolt of electricity spanning two points",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'IRN-R-0060',
    name: "Perpetual Clockwork Gyroscope",
    type: 'relic',
    subtype: 'machine_relic',
    faction: 'iron_choir',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['assembly'],
    description: "Relic. At the start of your turn, grant your strongest allied creature Shield (1).",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'shield' }
      ]
    }],
    lore: "Frictionless brass gimbals maintain perfect equilibrium regardless of arena tremor.",
    archetypes: ['assembly_core'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Concentric spinning brass gimbal rings suspended in mid-air above an iron mount",
      silhouette: "Spherical multi-ring gyroscope silhouette",
      palette: ["burnished_brass","steel_grey","cog_gold"],
      lighting: 'Warm metallic highlights and gem sheen',
      environment: 'The Ironhold Bastion'
    }
  },
  {
    id: 'TID-C-0049',
    name: "Tide-Runner Scout",
    type: 'creature',
    subtype: 'merfolk_scout',
    faction: 'tidebound',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 1,
    keywords: ["swift"],
    mechanics: ['current'],
    description: "Swift. After this attacks, restore 1 Vitality to your Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Glides across the surf on fins of spun pearl, spearing foes before they can plant their boots.",
    archetypes: ['current_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Merfolk scout skimming across cresting blue wave with coral-tipped javelin",
      silhouette: "Low-slung hydrodynamic swimmer leaping from wave",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-C-0050',
    name: "Abyssal Shell-Crab",
    type: 'creature',
    subtype: 'crustacean_beast',
    faction: 'tidebound',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 5,
    keywords: ["guard"],
    mechanics: ['current'],
    description: "Guard. When damaged, restore 1 Vitality to your Leader.",
    abilities: [{
      trigger: 'when_damaged',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Carapace forged in the deep oceanic trenches can withstand hydraulic pressure of miles of water.",
    archetypes: ['current_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Massive armored sea crab hunkered among kelp with iridescent blue-black shell",
      silhouette: "Broad flattened dome carapace with heavy claws",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-C-0051',
    name: "Reef-Fang Marauder",
    type: 'creature',
    subtype: 'merfolk_rogue',
    faction: 'tidebound',
    rarity: 'common',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ["drain"],
    mechanics: ['current'],
    description: "Drain. After this attacks, restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Daggers carved from shark-tooth ivory draw the life-tide directly into the sea.",
    archetypes: ['current_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Dual-dagger merfolk raider striking from swirling turquoise undertow",
      silhouette: "Twisting predator silhouette with curved blades",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-C-0052',
    name: "Harpoon Trident Guard",
    type: 'creature',
    subtype: 'merfolk_soldier',
    faction: 'tidebound',
    rarity: 'common',
    role: 'marksman',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["reach"],
    mechanics: ['current'],
    description: "Reach. On Summon: Deal 1 damage to an enemy creature in this lane.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
      ]
    }],
    lore: "Heavy barbed tridents trailing kelp line can drag foes across the arena.",
    archetypes: ['current_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Armored merfolk warrior hurling a barbed silver trident across turbulent water",
      silhouette: "Athletic warrior silhouette with raised three-pronged spear",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-C-0053',
    name: "Surge Siren-Caller",
    type: 'creature',
    subtype: 'merfolk_mage',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: [],
    mechanics: ['current'],
    description: "On Summon: Return an enemy creature in this lane to its owner’s hand.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'return_to_hand', target: 'enemy_in_lane' }
      ]
    }],
    lore: "Her hypnotic song creates whirlpools that wash invaders completely off the field.",
    archetypes: ['current_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Siren floating in a pillar of spiraling sea water with glowing coral crown",
      silhouette: "Graceful swimming siren framed by vertical water vortex",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-C-0054',
    name: "Pearl-Priest of the Deep",
    type: 'creature',
    subtype: 'merfolk_cleric',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: 'support',
    cost: 4,
    attack: 2,
    health: 5,
    keywords: ["guard"],
    mechanics: ['current'],
    description: "Guard. At the start of your turn, restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Chants ancient liturgical hymns of the sunken sunken temples to soothe wounded champions.",
    archetypes: ['current_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Robed sea cleric holding a staff crowned with a giant luminous pearl",
      silhouette: "Eldritch cleric holding glowing spherical pearl staff",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-C-0055',
    name: "Leviathan of the Abyssal Trench",
    type: 'creature',
    subtype: 'colossal_sea_beast',
    faction: 'tidebound',
    rarity: 'legendary',
    role: 'colossus',
    cost: 8,
    attack: 7,
    health: 9,
    keywords: ["drain","anchor"],
    mechanics: ['current'],
    description: "Drain, Anchor. On Summon: Restore 6 Vitality to your Leader and deal 2 damage to all enemy creatures.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 6 }
        , {"operation":"deal_damage","target":"all_enemy_creatures","amount":2}
      ]
    }],
    lore: "The ocean abyss personified; a creature older than the land itself whose surfacing heralds cataclysmic tidal waves.",
    archetypes: ['current_core'],
    weaknesses: ['silence'],
    complexity: 'advanced',
    art: {
      subject: "Immense serpent-headed sea leviathan crashing through storm waves above a sunken city",
      silhouette: "Colossal serpentine ocean titan rising from foam",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-C-0056',
    name: "Current-Rider Skimmer",
    type: 'creature',
    subtype: 'merfolk_skirmisher',
    faction: 'tidebound',
    rarity: 'rare',
    role: 'trickster',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ["skirmish"],
    mechanics: ['current'],
    description: "Skirmish. When this moves lanes, draw 1 card.",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Surfing the undertow between lanes with effortless grace.",
    archetypes: ['current_core'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: "Merfolk riding a luminous blue water-board between stone arena pillars",
      silhouette: "Dynamic wave-riding figure leaning into a turn",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-T-0057',
    name: "Crashing Undertow",
    type: 'tactic',
    subtype: 'quick',
    faction: 'tidebound',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['current'],
    description: "Quick Tactic. Deal 2 damage to an enemy creature in target lane.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }
      ]
    }],
    lore: "A sudden burst of saline water slams the attacker off-balance.",
    archetypes: ['current_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Curling wall of translucent blue sea water crashing onto stone steps",
      silhouette: "Diagonal cresting wave profile",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-T-0058',
    name: "Calm of the Lagoon",
    type: 'tactic',
    subtype: 'standard',
    faction: 'tidebound',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['current'],
    description: "Standard Tactic. Restore 4 Vitality to your Leader and draw 1 card.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 4 }
        , {"operation":"draw","target":"ally_leader","amount":1}
      ]
    }],
    lore: "Gentle tropical swells wash away fatigue and salt-sting.",
    archetypes: ['current_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Serene sunlit shallow lagoon bordered by white sand and pink coral",
      silhouette: "Horizontal calm water horizon with distant palm silhouette",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-T-0059',
    name: "Tidal Wave Cataclysm",
    type: 'tactic',
    subtype: 'standard',
    faction: 'tidebound',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['current'],
    description: "Standard Tactic. Deal 2 damage to all enemy creatures and restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 2 }
        , {"operation":"heal","target":"ally_leader","amount":2}
      ]
    }],
    lore: "A three-story tsunami washes across the arena, scouring the stones clean.",
    archetypes: ['current_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Towering ocean tsunami blotting out the sky as it breaks over the battlefield",
      silhouette: "Massive wave wall curling over arena structures",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'TID-R-0060',
    name: "Conch of the Sunken King",
    type: 'relic',
    subtype: 'ocean_relic',
    faction: 'tidebound',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['current'],
    description: "Relic. At the start of your turn, restore 1 Vitality to your Leader.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Listening to its spiral reveals the rhythmic pulse of oceanic tides.",
    archetypes: ['current_core'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Spiral mother-of-pearl conch shell resting on wet sand, glowing with blue light",
      silhouette: "Coiled conch shell profile",
      palette: ["ocean_sapphire","seafoam_cyan","coral_pearl"],
      lighting: 'Warm metallic highlights and gem sheen',
      environment: 'The Sunken Reach'
    }
  },
  {
    id: 'GLS-C-0049',
    name: "Prism-Shard Initiate",
    type: 'creature',
    subtype: 'glass_construct',
    faction: 'glassborne',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 1,
    keywords: ["swift"],
    mechanics: ['refraction'],
    description: "Swift. On Death: Deal 1 damage to the enemy creature in this lane.",
    abilities: [{
      trigger: 'on_death',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
      ]
    }],
    lore: "Shattering into razor-edged crystalline splinters when struck down.",
    archetypes: ['refraction_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Slender humanoid glass mannequin brandishing a sharp crystal rapier",
      silhouette: "Faceted geometric runner with trailing light refractions",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-C-0050',
    name: "Mirror-Shield Guardian",
    type: 'creature',
    subtype: 'glass_construct',
    faction: 'glassborne',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 5,
    keywords: ["guard","ward"],
    mechanics: ['refraction'],
    description: "Guard, Ward.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'ward' }
      ]
    }],
    lore: "Its tower shield is a flawless silver mirror that bounces hostile spellcraft back to the sender.",
    archetypes: ['refraction_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Heavy faceted glass knight holding a massive mirror-polished shield",
      silhouette: "Rectangular mirror shield reflecting rainbow light",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-C-0051',
    name: "Refracting Stiletto",
    type: 'creature',
    subtype: 'glass_assassin',
    faction: 'glassborne',
    rarity: 'common',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ["pierce"],
    mechanics: ['refraction'],
    description: "Pierce. After this attacks, deal 1 damage to the enemy Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
      ]
    }],
    lore: "Bends ambient light around its body, appearing three feet to the left of where it actually strikes.",
    archetypes: ['refraction_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Translucent crystalline assassin lunging forward through optical distortions",
      silhouette: "Faceted glass rogue striking with twin crystal daggers",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-C-0052',
    name: "Glass-Lens Marksman",
    type: 'creature',
    subtype: 'glass_marksman',
    faction: 'glassborne',
    rarity: 'common',
    role: 'marksman',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["reach"],
    mechanics: ['refraction'],
    description: "Reach. After this attacks, gain Ward.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'ward' }
      ]
    }],
    lore: "Focuses sunlight through telescopic ocular prisms into a searing beam.",
    archetypes: ['refraction_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Glass sniper aiming a brass-and-crystal telescope bow from a high pedestal",
      silhouette: "Sniper aiming long crystal scope weapon",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-C-0053',
    name: "Prism Weaver-Chanter",
    type: 'creature',
    subtype: 'human_arcanist',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: [],
    mechanics: ['refraction'],
    description: "On Summon: Deal 1 damage to all enemy creatures and grant an allied creature Ward.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 1 }
        , {"operation":"grant_keyword","target":"ally_creature_in_lane_or_any","keyword":"ward"}
      ]
    }],
    lore: "Splits white Aether into the seven chromatic harmonies of the Prism Spire.",
    archetypes: ['refraction_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Arcanist weaving floating rainbow glass shards that emit laser-like beams",
      silhouette: "Caster surrounded by orbit of levitating crystal triangles",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-C-0054',
    name: "Lustrous Reflector-Matron",
    type: 'creature',
    subtype: 'glass_artisan',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: 'support',
    cost: 4,
    attack: 2,
    health: 5,
    keywords: ["guard"],
    mechanics: ['refraction'],
    description: "Guard. At the start of your turn, grant your strongest allied creature Ward.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'ward' }
      ]
    }],
    lore: "Polishes the silvered backs of allied armor until every spell glances away harmlessly.",
    archetypes: ['refraction_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Glass artisan woman buffing a glowing silver breastplate on a velvet pedestal",
      silhouette: "Artisan with polishing cloth working on reflective armor",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-C-0055',
    name: "Luminor, Apex of the Seven Facets",
    type: 'creature',
    subtype: 'colossal_glass_titan',
    faction: 'glassborne',
    rarity: 'legendary',
    role: 'colossus',
    cost: 8,
    attack: 8,
    health: 7,
    keywords: ["ward","pierce"],
    mechanics: ['refraction'],
    description: "Ward, Pierce. On Summon: Deal 2 damage to all enemy creatures and grant all allied creatures Ward.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 2 }
        , {"operation":"grant_keyword","target":"all_ally_creatures","keyword":"ward"}
      ]
    }],
    lore: "The apex living prism of the Spire. Its multifaceted gaze refracts reality into impossible prismatic spectrums.",
    archetypes: ['refraction_core'],
    weaknesses: ['silence'],
    complexity: 'advanced',
    art: {
      subject: "Titanic multifaceted diamond-and-glass colossus refracting daylight into blinding rainbows",
      silhouette: "Towering geometric crystal titan with radiant halo",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-C-0056',
    name: "Kaleidoscope Acrobat",
    type: 'creature',
    subtype: 'glass_skirmisher',
    faction: 'glassborne',
    rarity: 'rare',
    role: 'trickster',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ["skirmish"],
    mechanics: ['refraction'],
    description: "Skirmish. When this moves lanes, gain Ward.",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'ward' }
      ]
    }],
    lore: "Dances across mirrors, trading places with optical reflections across lanes.",
    archetypes: ['refraction_core'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: "Acrobatic performer leaping through a shattered mirror archway with silver ribbons",
      silhouette: "Gymnast silhouette framed by floating mirror shards",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-T-0057',
    name: "Blinding Refraction",
    type: 'tactic',
    subtype: 'quick',
    faction: 'glassborne',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['refraction'],
    description: "Quick Tactic. Silence an enemy creature in target lane.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'silence', target: 'enemy_in_lane' }
      ]
    }],
    lore: "A flash of concentrated sunlight burns out enemy runes and temporary enchantments.",
    archetypes: ['refraction_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Blinding white-hot prism beam striking the head of an armored warrior",
      silhouette: "Conical beam of light striking a target",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-T-0058',
    name: "Mirror-Image Mirage",
    type: 'tactic',
    subtype: 'standard',
    faction: 'glassborne',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['refraction'],
    description: "Standard Tactic. Draw 2 cards.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "What appears to be an empty lane is merely an optical illusion concealing reserves.",
    archetypes: ['refraction_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Hall of endless mirrors reflecting identical cards receding to infinity",
      silhouette: "Perspective tunnel of repeated arching mirrors",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-T-0059',
    name: "Shatter-Glass Cataclysm",
    type: 'tactic',
    subtype: 'standard',
    faction: 'glassborne',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['refraction'],
    description: "Standard Tactic. Deal 3 damage to all enemy creatures.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 3 }
      ]
    }],
    lore: "Resonating sound vibrations shatter every crystalline surface across the battlefield.",
    archetypes: ['refraction_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Catastrophic explosion of millions of sharp razor glass shards flying outward",
      silhouette: "Radial starburst of flying geometric shards",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'GLS-R-0060',
    name: "Prismatic Lens of Seraphina",
    type: 'relic',
    subtype: 'crystal_relic',
    faction: 'glassborne',
    rarity: 'common',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['refraction'],
    description: "Relic. At the start of your turn, Scry 2.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Peer through its triangular facets to view the most probable resonance timeline.",
    archetypes: ['refraction_core'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Flawless triangular crystal prism hovering on a silver filigree stand",
      silhouette: "Triangular prism hovering above ornate stand",
      palette: ["prismatic_crystal","mirror_silver","lucent_white"],
      lighting: 'Warm metallic highlights and gem sheen',
      environment: 'The Prismatic Spire'
    }
  },
  {
    id: 'NOC-C-0049',
    name: "Gloom-Blade Initiate",
    type: 'creature',
    subtype: 'shadow_infiltrator',
    faction: 'nocturne',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 1,
    keywords: ["swift","stealth"],
    mechanics: ['veil'],
    description: "Swift, Stealth.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'stealth' }
      ]
    }],
    lore: "Clothed in umbral silk woven from the dark fibers between stars.",
    archetypes: ['veil_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Sleek shadow rogue stepping through purple twilight mist with dual obsidian daggers",
      silhouette: "Crouched assassin silhouette dissolving into smoke",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-C-0050',
    name: "Obsidian Veil-Warden",
    type: 'creature',
    subtype: 'shadow_knight',
    faction: 'nocturne',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 5,
    keywords: ["guard"],
    mechanics: ['veil'],
    description: "Guard. When damaged, gain Stealth.",
    abilities: [{
      trigger: 'when_damaged',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'stealth' }
      ]
    }],
    lore: "Striking his dark plate causes the warrior to melt into pooling ink beneath his boots.",
    archetypes: ['veil_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Armored knight in matte black plate disappearing into pooling shadow at his feet",
      silhouette: "Towering armored knight with blurred shadowy edges",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-C-0051',
    name: "Midnight Stalker",
    type: 'creature',
    subtype: 'human_assassin',
    faction: 'nocturne',
    rarity: 'common',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ["stealth"],
    mechanics: ['veil'],
    description: "Stealth. After this attacks, Silence the enemy creature in this lane.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'silence', target: 'enemy_in_lane' }
      ]
    }],
    lore: "He cuts not only the throat, but the victim’s voice and memory of combat.",
    archetypes: ['veil_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Masked assassin delivering a silent throat strike from behind an enemy pillar",
      silhouette: "Two overlapping silhouettes in sudden close-quarters strike",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-C-0052',
    name: "Umbral Dart-Spitter",
    type: 'creature',
    subtype: 'shadow_scout',
    faction: 'nocturne',
    rarity: 'common',
    role: 'marksman',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["reach"],
    mechanics: ['veil'],
    description: "Reach. On Summon: Deal 1 damage to an enemy creature in this lane.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
      ]
    }],
    lore: "Fires poisoned sleep-darts through hollow ebony blowpipes with silent exhalations.",
    archetypes: ['veil_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Crouched sniper on a dark rooftop aiming a long black blowgun through mist",
      silhouette: "Crouched marksman silhouette with long blowpipe",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-C-0053',
    name: "Veil-Mist Sorceress",
    type: 'creature',
    subtype: 'human_shadow_mage',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: [],
    mechanics: ['veil'],
    description: "On Summon: Grant all allied creatures Stealth.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'all_ally_creatures', keyword: 'stealth' }
      ]
    }],
    lore: "Summons a rolling cloud of lavender smoke that conceals an entire strike wing.",
    archetypes: ['veil_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Sorceress holding an ornate brass censor billowing purple mist across the floor",
      silhouette: "Robed figure holding smoking incense burner",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-C-0054',
    name: "Sanctum Shadow-Keeper",
    type: 'creature',
    subtype: 'shadow_priest',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: 'support',
    cost: 4,
    attack: 2,
    health: 5,
    keywords: ["guard"],
    mechanics: ['veil'],
    description: "Guard. At the start of your turn, draw 1 card.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Reads secret correspondence intercepted from courier pigeons over Lumenport.",
    archetypes: ['veil_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Cloaked priest reading a glowing purple cipher scroll in a candlelit crypt",
      silhouette: "Seated cloaked figure leaning over glowing scroll",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-C-0055',
    name: "Vespera, Empress of the Obsidian Void",
    type: 'creature',
    subtype: 'shadow_avatar',
    faction: 'nocturne',
    rarity: 'legendary',
    role: 'colossus',
    cost: 8,
    attack: 7,
    health: 8,
    keywords: ["stealth","pierce"],
    mechanics: ['veil'],
    description: "Stealth, Pierce. On Summon: Deal 2 damage to and Silence all enemy creatures.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 2 }
        , {"operation":"silence","target":"all_enemy_creatures"}
      ]
    }],
    lore: "The sovereign monarch of the unlighted realms. When Vespera unveils her visage, all magic withers in terror.",
    archetypes: ['veil_core'],
    weaknesses: ['silence'],
    complexity: 'advanced',
    art: {
      subject: "Regal shadow empress with vast raven wings and a crown of black stars towering over mist",
      silhouette: "Majestic winged empress with floating starlight crown",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-C-0056',
    name: "Dusk-Prowler Trickster",
    type: 'creature',
    subtype: 'shadow_beast',
    faction: 'nocturne',
    rarity: 'rare',
    role: 'trickster',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ["skirmish"],
    mechanics: ['veil'],
    description: "Skirmish. When this moves lanes, deal 1 damage to the enemy Leader.",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
      ]
    }],
    lore: "Stalks the shadows between lanes, nipping at enemy commanders who look the other way.",
    archetypes: ['veil_core'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: "Sleek panther composed of smoke and violet embers leaping between columns",
      silhouette: "Prowling feline silhouette made of smoke",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-T-0057',
    name: "Cloak of Nightfall",
    type: 'tactic',
    subtype: 'quick',
    faction: 'nocturne',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['veil'],
    description: "Quick Tactic. Grant an allied creature Stealth.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'stealth' }
      ]
    }],
    lore: "Pulling the shadow blanket tight over armor removes its gleam entirely.",
    archetypes: ['veil_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Heavy dark velvet cloak billowing around a soldier until only shadows remain",
      silhouette: "Swirling cloak engulfing a humanoid form",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-T-0058',
    name: "Blackmail Network",
    type: 'tactic',
    subtype: 'standard',
    faction: 'nocturne',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['veil'],
    description: "Standard Tactic. Draw 2 cards.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "In Lumenport, what you know about the merchant guilds is worth far more than silver.",
    archetypes: ['veil_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Table scattered with sealed wax letters, a dagger, and piles of gold coins in dark room",
      silhouette: "Overhead composition of desk with letters and dagger",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-T-0059',
    name: "Throat-Cut Ambush",
    type: 'tactic',
    subtype: 'standard',
    faction: 'nocturne',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['veil'],
    description: "Standard Tactic. Destroy a target enemy creature.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'destroy', target: 'target_enemy_creature' }
      ]
    }],
    lore: "No shout, no clash of iron. Only a muffled gasp and a collapsing cape.",
    archetypes: ['veil_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Shadow silhouette clamping a hand over a guard’s mouth from behind a pillar",
      silhouette: "Two struggling silhouettes in dark archway",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'NOC-R-0060',
    name: "Amulet of the Eclipse",
    type: 'relic',
    subtype: 'shadow_relic',
    faction: 'nocturne',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['veil'],
    description: "Relic. At the start of your turn, grant your strongest allied creature Stealth.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'stealth' }
      ]
    }],
    lore: "Black obsidian stone that absorbs candlelight in a ten-foot circle.",
    archetypes: ['veil_core'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Polished black stone disc hanging from a silver chain resting on dark velvet",
      silhouette: "Circular black medallion silhouette",
      palette: ["midnight_indigo","shadow_slate","pale_violet"],
      lighting: 'Warm metallic highlights and gem sheen',
      environment: 'The Shadowed Veil'
    }
  },
  {
    id: 'STR-C-0049',
    name: "Starlight Astrologer Initiate",
    type: 'creature',
    subtype: 'human_astronomer',
    faction: 'starweave',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 1,
    keywords: ["swift"],
    mechanics: ['alignment'],
    description: "Swift. On Summon: Scry 1.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Charts celestial conjunctions before breakfast to anticipate opposing vanguards.",
    archetypes: ['alignment_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Young scholar holding a brass armillary sphere pointing up at starry night sky",
      silhouette: "Scholar silhouette with raised celestial globe",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-C-0050',
    name: "Celestial Pillar Sentinel",
    type: 'creature',
    subtype: 'astral_construct',
    faction: 'starweave',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 5,
    keywords: ["guard"],
    mechanics: ['alignment'],
    description: "Guard, Ward.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'ward' }
      ]
    }],
    lore: "Carved from meteoric granite and inscribed with golden constellations that ward off spells.",
    archetypes: ['alignment_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Heavy stone automaton carved with glowing golden constellation lines",
      silhouette: "Upright granite pillar guardian with glowing runes",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-C-0051',
    name: "Meteor-Shard Skulker",
    type: 'creature',
    subtype: 'astral_scout',
    faction: 'starweave',
    rarity: 'common',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ["pierce"],
    mechanics: ['alignment'],
    description: "Pierce. After this attacks, deal 1 damage to the enemy Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
      ]
    }],
    lore: "Fights with twin sickles forged from fallen star-metal that crackle with cold blue cosmic fire.",
    archetypes: ['alignment_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Astral rogue in dark starry silk leaping downward with glowing crescent sickles",
      silhouette: "Airborne assassin silhouette with curved celestial sickles",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-C-0052',
    name: "Orrery Star-Shooter",
    type: 'creature',
    subtype: 'astral_marksman',
    faction: 'starweave',
    rarity: 'common',
    role: 'marksman',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: ["reach"],
    mechanics: ['alignment'],
    description: "Reach. After this attacks, Scry 1.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Aligns telescopic lenses to guide starlight arrows directly into vulnerable joints.",
    archetypes: ['alignment_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Archon marksman aiming an ornate golden orrery crossbow toward the heavens",
      silhouette: "Arched celestial bowman silhouette",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-C-0053',
    name: "Zenith Star-Caller",
    type: 'creature',
    subtype: 'human_star_mage',
    faction: 'starweave',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: [],
    mechanics: ['alignment'],
    description: "On Summon: Deal 1 damage to all enemy creatures and draw 1 card.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 1 }
        , {"operation":"draw","target":"ally_leader","amount":1}
      ]
    }],
    lore: "Brings down fragments of shooting stars to scatter opposing battle lines.",
    archetypes: ['alignment_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Star mage calling showers of golden meteors down upon the arena table",
      silhouette: "Robed figure with raised hands channeling falling stars",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-C-0054',
    name: "Archival Chrono-Scribe",
    type: 'creature',
    subtype: 'human_scholar',
    faction: 'starweave',
    rarity: 'uncommon',
    role: 'support',
    cost: 4,
    attack: 2,
    health: 5,
    keywords: ["guard"],
    mechanics: ['alignment'],
    description: "Guard. At the start of your turn, Scry 2.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Records tomorrow’s history in illuminated manuscripts bound in astral leather.",
    archetypes: ['alignment_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Venerable scholar in golden robes penning symbols into a levitating golden codex",
      silhouette: "Scholarly figure writing in floating book",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-C-0055',
    name: "Archon Orion, Sovereign of the Constellations",
    type: 'creature',
    subtype: 'celestial_avatar',
    faction: 'starweave',
    rarity: 'legendary',
    role: 'colossus',
    cost: 8,
    attack: 8,
    health: 8,
    keywords: ["ward","reach"],
    mechanics: ['alignment'],
    description: "Ward, Reach. On Summon: Deal 3 damage to all enemy creatures and draw 2 cards.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 3 }
        , {"operation":"draw","target":"ally_leader","amount":2}
      ]
    }],
    lore: "The living manifestation of the celestial vault. His staff aligns the planetary spheres into catastrophic conjunctions.",
    archetypes: ['alignment_core'],
    weaknesses: ['silence'],
    complexity: 'advanced',
    art: {
      subject: "Towering cosmic avatar woven of nebula clouds and golden starlight wielding a constellation staff",
      silhouette: "Colossal starlit titan crowned with spinning astral rings",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-C-0056',
    name: "Orbit-Dancing Skirmisher",
    type: 'creature',
    subtype: 'astral_dancer',
    faction: 'starweave',
    rarity: 'rare',
    role: 'trickster',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ["skirmish"],
    mechanics: ['alignment'],
    description: "Skirmish. When this moves lanes, Scry 1.",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Glides between lanes as though pulled by planetary gravitational tides.",
    archetypes: ['alignment_core'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: "Graceful dancer with flowing starry silk scarves revolving around an arena pedestal",
      silhouette: "Spinning dancer silhouette trailing ribbon curves",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-T-0057',
    name: "Guiding Constellation",
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
    description: "Quick Tactic. Scry 2.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Look to the North Star when the duel table becomes obscured.",
    archetypes: ['alignment_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Golden constellation lines forming the shape of a guiding compass in dark sky",
      silhouette: "Geometric star-map diagram",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-T-0058',
    name: "Planetary Conjunction",
    type: 'tactic',
    subtype: 'standard',
    faction: 'starweave',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['alignment'],
    description: "Standard Tactic. Draw 2 cards and gain 1 temporary Aether this turn.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
        , {"operation":"gain_aether","target":"ally_leader","amount":1}
      ]
    }],
    lore: "When three planets align, the cosmic resonance overflows mortal vessels.",
    archetypes: ['alignment_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Three glowing planets lining up in a brilliant horizontal beam of gold and violet light",
      silhouette: "Three aligned glowing spheres along a horizontal axis",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-T-0059',
    name: "Supernova Burst",
    type: 'tactic',
    subtype: 'standard',
    faction: 'starweave',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['alignment'],
    description: "Standard Tactic. Deal 5 damage to an enemy creature and 2 damage to the enemy Leader.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'target_enemy_creature', amount: 5 }
        , {"operation":"deal_damage","target":"enemy_leader","amount":2}
      ]
    }],
    lore: "A collapsing star releases the energy of ten thousand suns in a fraction of a breath.",
    archetypes: ['alignment_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Blinding white-gold cosmic explosion expanding outward across a star field",
      silhouette: "Radial supernova shockwave",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'STR-R-0060',
    name: "Brass Astrolabe of the Zenith",
    type: 'relic',
    subtype: 'astral_relic',
    faction: 'starweave',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['alignment'],
    description: "Relic. At the start of your turn, Scry 1.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Engraved with the eighteen ancient constellations known to the First Scribes.",
    archetypes: ['alignment_core'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Intricate brass astrolabe with movable discs and sapphire pointers on dark stone",
      silhouette: "Circular astrolabe profile with suspension ring",
      palette: ["cosmic_purple","celestial_gold","starlight_cyan"],
      lighting: 'Warm metallic highlights and gem sheen',
      environment: 'The Astral Archive'
    }
  },
  {
    id: 'GRV-C-0049',
    name: "Grave-Digger Ghoul",
    type: 'creature',
    subtype: 'undead_scavenger',
    faction: 'gravewild',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 1,
    keywords: ["swift","rebirth"],
    mechanics: ['reclaim'],
    description: "Swift, Rebirth (1). On Death: Deal 1 damage to the enemy creature in this lane.",
    abilities: [{
      trigger: 'on_death',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
      ]
    }],
    lore: "Rises from unhallowed dirt with rusted spade in hand, eager for fresh bone.",
    archetypes: ['reclaim_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Gaunt ghoul clambering out of a fresh grave clutching a rusted iron spade",
      silhouette: "Hunched clawed undead silhouette rising from soil",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-C-0050',
    name: "Tomb-Slab Bulwark",
    type: 'creature',
    subtype: 'skeletal_guardian',
    faction: 'gravewild',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 5,
    keywords: ["guard"],
    mechanics: ['reclaim'],
    description: "Guard. When damaged, deal 1 damage to the enemy creature in this lane.",
    abilities: [{
      trigger: 'when_damaged',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
      ]
    }],
    lore: "Shield carved from a five-hundred-year-old mausoleum lintel inscribed with curses.",
    archetypes: ['reclaim_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Heavy skeleton in rusted chainmail bracing an engraved tombstone door",
      silhouette: "Upright rectangular gravestone shield with skeletal limbs",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-C-0051',
    name: "Ossuary Bone-Reaper",
    type: 'creature',
    subtype: 'undead_stalker',
    faction: 'gravewild',
    rarity: 'common',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ["drain"],
    mechanics: ['reclaim'],
    description: "Drain. After this attacks, restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Carries scythes forged of sharpened femur bones dipped in embalming oil.",
    archetypes: ['reclaim_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Hooded skeleton wielding a long bone scythe walking through misty tombstones",
      silhouette: "Grim reaper silhouette with curved bone scythe",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-C-0052',
    name: "Crypt-Bane Archer",
    type: 'creature',
    subtype: 'skeletal_marksman',
    faction: 'gravewild',
    rarity: 'common',
    role: 'marksman',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["reach"],
    mechanics: ['reclaim'],
    description: "Reach. After this attacks, deal 1 damage to the enemy Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
      ]
    }],
    lore: "Draws arrows crafted from human ribs that whistle like dying breath.",
    archetypes: ['reclaim_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Skeletal archer in rotting tattered cape drawing a rib-bone recurve bow",
      silhouette: "Skeletal archer standing atop a crypt roof",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-C-0053',
    name: "Necropolis Lich-Caller",
    type: 'creature',
    subtype: 'undead_necromancer',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: 'caster',
    cost: 4,
    attack: 3,
    health: 4,
    keywords: [],
    mechanics: ['reclaim'],
    description: "On Summon: Deal 1 damage to all enemy creatures and restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 1 }
        , {"operation":"heal","target":"ally_leader","amount":2}
      ]
    }],
    lore: "Raises green spectral flame that drains the life of the living to feed his phylactery.",
    archetypes: ['reclaim_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Skeletal lich in high-collared emerald robes channeling green necromantic fire",
      silhouette: "Tall horned lich silhouette with floating green skulls",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-C-0054',
    name: "Catacomb Embalmer",
    type: 'creature',
    subtype: 'undead_priest',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: 'support',
    cost: 4,
    attack: 2,
    health: 5,
    keywords: ["guard"],
    mechanics: ['reclaim'],
    description: "Guard. At the start of your turn, restore 2 Health to your strongest allied creature.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'strongest_ally_creature', amount: 2 }
      ]
    }],
    lore: "Wraps splintered bone and rotten sinew in sacred linen steeped in natron salts.",
    archetypes: ['reclaim_core'],
    weaknesses: ['silence'],
    complexity: 'beginner',
    art: {
      subject: "Masked embalmer applying embalming linen to a skeleton on a stone table",
      silhouette: "Bent figure wrapping a corpse on a pedestal",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-C-0055',
    name: "Thanatos, Sovereign of the Catacombs",
    type: 'creature',
    subtype: 'undead_avatar',
    faction: 'gravewild',
    rarity: 'legendary',
    role: 'colossus',
    cost: 8,
    attack: 8,
    health: 8,
    keywords: ["drain","rebirth"],
    mechanics: ['reclaim'],
    description: "Drain, Rebirth (1). On Summon: Deal 3 damage to all enemy creatures and restore 4 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 3 }
        , {"operation":"heal","target":"ally_leader","amount":4}
      ]
    }],
    lore: "The primordial death-lord of the sunken ossuary. The dead rise from every paving stone when Thanatos marches.",
    archetypes: ['reclaim_core'],
    weaknesses: ['silence'],
    complexity: 'advanced',
    art: {
      subject: "Colossal armored death king crowned in glowing bone spikes wielding an executioner greatsword",
      silhouette: "Towering skeletal king with spiked crown and massive two-handed sword",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-C-0056',
    name: "Shambling Crypt-Trickster",
    type: 'creature',
    subtype: 'undead_jester',
    faction: 'gravewild',
    rarity: 'rare',
    role: 'trickster',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ["skirmish"],
    mechanics: ['reclaim'],
    description: "Skirmish. When this moves lanes, deal 1 damage to the enemy creature in that lane.",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
      ]
    }],
    lore: "Juggles severed skulls between lanes, laughing with a jaw that has no tongue.",
    archetypes: ['reclaim_core'],
    weaknesses: ['silence'],
    complexity: 'intermediate',
    art: {
      subject: "Skeletal court jester in bells and rags tossing glowing skulls between columns",
      silhouette: "Hunched jester silhouette with three floating spheres",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Atmospheric fantasy lighting with glowing Aether accents',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-T-0057',
    name: "Unhallowed Reanimation",
    type: 'tactic',
    subtype: 'quick',
    faction: 'gravewild',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['reclaim'],
    description: "Quick Tactic. Grant an allied creature +2 Attack.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 2, health_delta: 0 }
      ]
    }],
    lore: "A sudden surge of embalming malice revitalizes dead muscle.",
    archetypes: ['reclaim_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Skeletal hand bursting out of damp cemetery earth grasping a sword hilt",
      silhouette: "Skeletal hand rising from ground with sword",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-T-0058',
    name: "Dark Harvest Feast",
    type: 'tactic',
    subtype: 'standard',
    faction: 'gravewild',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['reclaim'],
    description: "Standard Tactic. Draw 2 cards and restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
        , {"operation":"heal","target":"ally_leader","amount":2}
      ]
    }],
    lore: "The catacomb spirits whisper ancient secrets in exchange for stolen life essence.",
    archetypes: ['reclaim_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Stone crypt altar surrounded by green soul wisps feeding into an iron chalice",
      silhouette: "Chalice on altar surrounded by swirling spirits",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-T-0059',
    name: "Death-Knell Decree",
    type: 'tactic',
    subtype: 'standard',
    faction: 'gravewild',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['reclaim'],
    description: "Standard Tactic. Destroy a target enemy creature.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'destroy', target: 'target_enemy_creature' }
      ]
    }],
    lore: "When the tolling of the graveyard bell echoes through the arena, the target’s doom is sealed.",
    archetypes: ['reclaim_core'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Enormous cracked bronze church bell swinging in a ruined bell tower amidst ravens",
      silhouette: "Massive bell hanging in gothic archway",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Dramatic action flare with atmospheric depth',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'GRV-R-0060',
    name: "Phylactery of the Ossuary",
    type: 'relic',
    subtype: 'undead_relic',
    faction: 'gravewild',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['reclaim'],
    description: "Relic. At the start of your turn, restore 1 Vitality to your Leader.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "A jeweled bone urn that whispers forgotten names into the dark.",
    archetypes: ['reclaim_core'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Ornate ivory and silver urn set with dark emeralds resting on a tomb pedestal",
      silhouette: "Urn silhouette with carved bone handles",
      palette: ["ossuary_bone","tomb_emerald","crypt_black"],
      lighting: 'Warm metallic highlights and gem sheen',
      environment: 'The Sunken Catacombs'
    }
  },
  {
    id: 'NEU-C-0097',
    name: "Lumenport Harbor Courier",
    type: 'creature',
    subtype: 'human_courier',
    faction: 'neutral',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 2,
    health: 1,
    keywords: ["swift"],
    mechanics: ['convergence'],
    description: "Swift. On Summon: Scry 1.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Runs sealed envelopes between the ferry docks and the merchant houses.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Agile young messenger boy with satchel vaulting a harbor mooring bollard",
      silhouette: "Running youth with flying messenger bag",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0098',
    name: "Town Watch Gatekeeper",
    type: 'creature',
    subtype: 'human_guard',
    faction: 'neutral',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 1,
    health: 5,
    keywords: ["guard"],
    mechanics: ['convergence'],
    description: "Guard. Intercepts enemy attacks targeting allied rear units.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'guard' }
      ]
    }],
    lore: "He has stood at the South Iron Gate through twenty winters without letting an unsanctioned cart pass.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Sturdy armored guard in bronze breastplate leaning on heavy halberd at city gate",
      silhouette: "Stoic guard silhouette with tall halberd",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0099',
    name: "Canal Alley Cutpurse",
    type: 'creature',
    subtype: 'human_thief',
    faction: 'neutral',
    rarity: 'common',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ["stealth"],
    mechanics: ['convergence'],
    description: "Stealth. After this attacks, deal 1 damage to the enemy Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
      ]
    }],
    lore: "Slips out of the shadows beneath the canal arches, strikes, and vanishes into the fog.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Cloaked rogue vaulting over a damp canal railing with a coin purse and dagger",
      silhouette: "Vaulting cloaked thief with short blade",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0100',
    name: "Rooftop Crossbowman",
    type: 'creature',
    subtype: 'human_marksman',
    faction: 'neutral',
    rarity: 'common',
    role: 'marksman',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["reach"],
    mechanics: ['convergence'],
    description: "Reach. After this attacks, deal 1 damage to an enemy creature in this lane.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }
      ]
    }],
    lore: "Stationed on the tile roofs of the Market District to discourage smugglers.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Watch crossbowman kneeling on slate roof tiles aiming across city chimneys",
      silhouette: "Kneeling archer on pitched rooftop",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0101',
    name: "Accord Institute Lecturer",
    type: 'creature',
    subtype: 'human_scholar',
    faction: 'neutral',
    rarity: 'common',
    role: 'caster',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: [],
    mechanics: ['convergence'],
    description: "On Summon: Draw 1 card.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Explains the theoretical foundations of leyline resonance to fresh academy initiates.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Stern scholar in sapphire robes gesturing toward a glowing lecture chalkboard",
      silhouette: "Robed lecturer pointing with a wooden pointer",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0102',
    name: "Bazaar Street-Medic",
    type: 'creature',
    subtype: 'human_healer',
    faction: 'neutral',
    rarity: 'common',
    role: 'support',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: [],
    mechanics: ['convergence'],
    description: "On Summon: Restore 3 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 3 }
      ]
    }],
    lore: "Treats bruised duelists and exhausted dockers with equal professional cheer.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Aproned field medic bandaging a soldier’s forearm on a market bench",
      silhouette: "Medic leaning over a seated patient",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0103',
    name: "Canal Gondolier",
    type: 'creature',
    subtype: 'human_boatman',
    faction: 'neutral',
    rarity: 'common',
    role: 'trickster',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ["skirmish"],
    mechanics: ['convergence'],
    description: "Skirmish. When this moves lanes, restore 1 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Poles his narrow skiff through the harbor channels, bypassing gridlocked avenues.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Weathered boatman poling a wooden gondola under an arched stone bridge",
      silhouette: "Standing boatman with long pole on slender boat",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0104',
    name: "Market-Stall Barkeep",
    type: 'creature',
    subtype: 'human_innkeeper',
    faction: 'neutral',
    rarity: 'common',
    role: 'bulwark',
    cost: 2,
    attack: 2,
    health: 4,
    keywords: ["guard"],
    mechanics: ['convergence'],
    description: "Guard. On Summon: Restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Keeps an iron truncheon under the bar and a warm kettle on the hearth.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Brawny innkeeper with rolled sleeves wiping a wooden counter with a rag",
      silhouette: "Stout broad-chested barman behind tavern counter",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0105',
    name: "Duelist Plaza Squire",
    type: 'creature',
    subtype: 'human_squire',
    faction: 'neutral',
    rarity: 'common',
    role: 'vanguard',
    cost: 1,
    attack: 1,
    health: 3,
    keywords: ["swift"],
    mechanics: ['convergence'],
    description: "Swift. After this attacks, gain +1 Attack.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 0 }
      ]
    }],
    lore: "Carries tournament shields for the masters and dreams of entering the arena herself.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Eager young squire carrying two large heraldic shields across arena cobblestones",
      silhouette: "Running youth carrying oversized shields",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0106',
    name: "Archival Archivist Guard",
    type: 'creature',
    subtype: 'human_sentinel',
    faction: 'neutral',
    rarity: 'common',
    role: 'bulwark',
    cost: 3,
    attack: 2,
    health: 5,
    keywords: ["guard"],
    mechanics: ['convergence'],
    description: "Guard. Intercepts enemy attacks in this lane to protect the leader.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'guard' }
      ]
    }],
    lore: "Stationed in the dim corridors of the library to prevent unauthorized book removal.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Stoic guard in polished brass cuirass standing at the foot of massive library shelves",
      silhouette: "Standing guard framed by tall bookshelves",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0107',
    name: "Dockside Crane Operator",
    type: 'creature',
    subtype: 'human_mechanic',
    faction: 'neutral',
    rarity: 'common',
    role: 'support',
    cost: 4,
    attack: 3,
    health: 5,
    keywords: [],
    mechanics: ['convergence'],
    description: "At the start of your turn, grant your strongest allied creature +1 Attack.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 0 }
      ]
    }],
    lore: "Swings steam-powered crane booms to drop cargo crates wherever reinforcement is needed.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Mechanic pulling heavy bronze levers inside a wooden crane cab over water",
      silhouette: "Worker silhouette framed in crane cabin",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0108',
    name: "Free-Guild Pikeman",
    type: 'creature',
    subtype: 'human_soldier',
    faction: 'neutral',
    rarity: 'common',
    role: 'vanguard',
    cost: 2,
    attack: 2,
    health: 3,
    keywords: ["guard"],
    mechanics: ['convergence'],
    description: "Guard. Forms an impenetrable defensive line to protect rear units.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'guard' }
      ]
    }],
    lore: "Hired from the Free Guilds to guard highroad caravans against road-bandits.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Pikeman in leather-and-iron brigandine holding a leveled twelve-foot pike",
      silhouette: "Angular infantryman with long diagonal pike",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0109',
    name: "Wandering Minstrel",
    type: 'creature',
    subtype: 'human_bard',
    faction: 'neutral',
    rarity: 'common',
    role: 'trickster',
    cost: 2,
    attack: 1,
    health: 4,
    keywords: ["skirmish"],
    mechanics: ['convergence'],
    description: "Skirmish. When this moves lanes, draw 1 card.",
    abilities: [{
      trigger: 'on_move',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Sings tales of legendary duels to rally flagging spirits across the marketplace.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Flamboyant bard with lute walking across market plaza surrounded by listeners",
      silhouette: "Bard silhouette with lute under arm",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0110',
    name: "Sanctum Alchemist",
    type: 'creature',
    subtype: 'human_alchemist',
    faction: 'neutral',
    rarity: 'common',
    role: 'caster',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: [],
    mechanics: ['convergence'],
    description: "On Summon: Deal 2 damage to an enemy creature in this lane.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }
      ]
    }],
    lore: "Hurls flasks of volatility-neutralizing acids directly into enemy armor joints.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Alchemist with leather goggles hurling a bubbling amber flask from a wooden tray",
      silhouette: "Caster lunging forward with smoking glass flask",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0111',
    name: "Tournament Field Flag-Bearer",
    type: 'creature',
    subtype: 'human_herald',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'support',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["guard"],
    mechanics: ['convergence'],
    description: "Guard. At the start of your turn, grant all allied creatures +1 Attack.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 0 }
      ]
    }],
    lore: "Raises the Eight-Faction Accord flag to announce the start of championship bouts.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Proud herald waving a giant embroidered silk banner depicting eight faction crests",
      silhouette: "Upright herald holding massive streaming banner",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0112',
    name: "Lumenport Watch Captain",
    type: 'creature',
    subtype: 'human_officer',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'controller',
    cost: 4,
    attack: 3,
    health: 5,
    keywords: ["guard"],
    mechanics: ['convergence'],
    description: "Guard. On Summon: Silence an enemy creature in this lane.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'silence', target: 'enemy_in_lane' }
      ]
    }],
    lore: "A veteran officer whose authoritative presence instantly halts tavern brawls.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Stern officer with plumed bronze helmet and commanding baton in town square",
      silhouette: "Commanding officer raising baton in plaza",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0113',
    name: "Caravan Pack-Behemoth",
    type: 'creature',
    subtype: 'beast_colossus',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'colossus',
    cost: 6,
    attack: 6,
    health: 7,
    keywords: ["guard","anchor"],
    mechanics: ['convergence'],
    description: "Guard, Anchor. On Summon: Gain Shield (1).",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'shield' }
      ]
    }],
    lore: "Massive six-legged woolly beast trained to haul entire trading posts over mountain passes.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Colossal woolly pack beast loaded with stacked pavilions and cargo crates",
      silhouette: "Enormous quadruped beast carrying a village on its back",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0114',
    name: "Free-Blade Mercenary Champion",
    type: 'creature',
    subtype: 'human_champion',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'vanguard',
    cost: 4,
    attack: 5,
    health: 4,
    keywords: ["swift","pierce"],
    mechanics: ['convergence'],
    description: "Swift, Pierce. After this attacks, deal 1 damage to the enemy Leader.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_leader', amount: 1 }
      ]
    }],
    lore: "Fights for whichever duelist deposits the highest purse of Crowns at the registry.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Plate-armored greatsword champion lunging with two-handed broadsword",
      silhouette: "Dynamic greatsword strike silhouette",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0115',
    name: "Accord Senior Arbiter",
    type: 'creature',
    subtype: 'human_judge',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'controller',
    cost: 4,
    attack: 2,
    health: 6,
    keywords: ["guard","ward"],
    mechanics: ['convergence'],
    description: "Guard, Ward. On Summon: Exhaust an enemy creature in this lane.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust' }
      ]
    }],
    lore: "Strikes the bronze gong of the Council to suspend all combat in a dispute.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Elderly magistrate in heavy sapphire robes striking an ornate bronze gong",
      silhouette: "Seated magistrate with raised gong mallet",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0116',
    name: "Caravan Master Trader",
    type: 'creature',
    subtype: 'human_merchant',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'support',
    cost: 3,
    attack: 2,
    health: 5,
    keywords: [],
    mechanics: ['convergence'],
    description: "At the start of your turn, draw 1 card.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Has connections with merchant houses in all eight faction homelands.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Plump cheerful merchant counting gold coins beside an open treasure chest",
      silhouette: "Merchant seated behind account books",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0117',
    name: "Highroad Highwayman",
    type: 'creature',
    subtype: 'human_bandit',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'assassin',
    cost: 3,
    attack: 4,
    health: 2,
    keywords: ["stealth"],
    mechanics: ['convergence'],
    description: "Stealth. On Summon: Deal 2 damage to the enemy Leader.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_leader', amount: 2 }
      ]
    }],
    lore: "Strikes solitary riders when the mountain fog rolls over the Highroad pass.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Bandit leaping from roadside rocks with cocked flintlock and short saber",
      silhouette: "Leaping bandit silhouette with pistol",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0118',
    name: "Observatory Sky-Watcher",
    type: 'creature',
    subtype: 'human_astronomer',
    faction: 'neutral',
    rarity: 'uncommon',
    role: 'marksman',
    cost: 3,
    attack: 2,
    health: 4,
    keywords: ["reach"],
    mechanics: ['convergence'],
    description: "Reach. After this attacks, Scry 1.",
    abilities: [{
      trigger: 'after_this_attacks',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Tracks falling stars to map safe passages through the coastal reefs.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Female astronomer in warm wool coat peering through a brass telescope on tower roof",
      silhouette: "Figure standing beside large angled telescope",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0119',
    name: "Harbor Lighthouse Warden",
    type: 'creature',
    subtype: 'human_warden',
    faction: 'neutral',
    rarity: 'rare',
    role: 'controller',
    cost: 5,
    attack: 4,
    health: 6,
    keywords: ["guard"],
    mechanics: ['convergence'],
    description: "Guard. On Summon: Restore 4 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 4 }
      ]
    }],
    lore: "Maintains the giant prismatic beacon that guides ships home through sea storms.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Grizzled lighthouse keeper stoking the coals beneath a towering sapphire beacon lens",
      silhouette: "Silhouette of man beside monumental glowing lighthouse lamp",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0120',
    name: "Tournament Grand Champion",
    type: 'creature',
    subtype: 'human_paragon',
    faction: 'neutral',
    rarity: 'rare',
    role: 'colossus',
    cost: 6,
    attack: 6,
    health: 6,
    keywords: ["guard","pierce"],
    mechanics: ['convergence'],
    description: "Guard, Pierce. On Summon: Grant all allied creatures +1/+1.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 1 }
      ]
    }],
    lore: "Three-time victor of the seasonal Lumenport Cup, respected by champions of all factions.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Heroic knight in gilded plate armor raising a laurel-wreathed champion sword",
      silhouette: "Victorious champion raising sword to cheering crowds",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0121',
    name: "Grand Marshal’s Bodyguard",
    type: 'creature',
    subtype: 'human_elite_guard',
    faction: 'neutral',
    rarity: 'rare',
    role: 'bulwark',
    cost: 4,
    attack: 2,
    health: 7,
    keywords: ["guard","ward"],
    mechanics: ['convergence'],
    description: "Guard, Ward. On Summon: Gain Shield (1).",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'self', keyword: 'shield' }
      ]
    }],
    lore: "Sworn by blood oath to shield the Accord Councilors from assassin blades.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Elite guard in mirror-polished plate armor standing vigilantly before council doors",
      silhouette: "Broad plate knight holding upright broadsword",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0122',
    name: "Archival Chrono-Guardian",
    type: 'creature',
    subtype: 'astral_golem',
    faction: 'neutral',
    rarity: 'rare',
    role: 'colossus',
    cost: 7,
    attack: 7,
    health: 7,
    keywords: ["guard","ward"],
    mechanics: ['convergence'],
    description: "Guard, Ward. On Summon: Draw 2 cards.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "A living stone statue that animates only when the library archives are threatened.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Massive stone statue with glowing blue glyphs stepping down from a cathedral pedestal",
      silhouette: "Colossal stone sentinel descending from archway",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0123',
    name: "Plaza Shadow-Broker",
    type: 'creature',
    subtype: 'human_broker',
    faction: 'neutral',
    rarity: 'rare',
    role: 'trickster',
    cost: 3,
    attack: 3,
    health: 3,
    keywords: ["stealth"],
    mechanics: ['convergence'],
    description: "Stealth. On Summon: Draw 2 cards.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Trades secret card decklists and matchup intelligence in the tavern corners.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Masked broker passing a sealed wax envelope across an ale table to an unseen patron",
      silhouette: "Two figures whispering in shadows across tavern table",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0124',
    name: "Aether-Infused Colossus",
    type: 'creature',
    subtype: 'primordial_construct',
    faction: 'neutral',
    rarity: 'rare',
    role: 'colossus',
    cost: 8,
    attack: 8,
    health: 8,
    keywords: ["pierce","guard"],
    mechanics: ['convergence'],
    description: "Pierce, Guard. On Summon: Deal 2 damage to all enemy creatures.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 2 }
      ]
    }],
    lore: "Constructed during the Convergence Wars from salvaged battlefield armor and live Aether.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Massive cobbled-together titan of iron plates and glowing blue leyline energy",
      silhouette: "Towering patchwork iron giant radiating light",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0125',
    name: "Grand Librarian of the Archive",
    type: 'creature',
    subtype: 'human_master_scholar',
    faction: 'neutral',
    rarity: 'rare',
    role: 'support',
    cost: 5,
    attack: 3,
    health: 6,
    keywords: ["ward"],
    mechanics: ['convergence'],
    description: "Ward. At the start of your turn, draw 1 card.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Has catalogued every card printed since the founding of the Convergence Duels.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Elderly master librarian with spectacles floating in air surrounded by swirling scrolls",
      silhouette: "Elderly scholar surrounded by spiral cloud of parchment",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-C-0126',
    name: "Free-Cities Vanguard Leader",
    type: 'creature',
    subtype: 'human_warlord',
    faction: 'neutral',
    rarity: 'rare',
    role: 'vanguard',
    cost: 5,
    attack: 5,
    health: 5,
    keywords: ["swift","guard"],
    mechanics: ['convergence'],
    description: "Swift, Guard. On Summon: Grant all allied creatures +1 Attack.",
    abilities: [{
      trigger: 'on_summon',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 0 }
      ]
    }],
    lore: "Commands the combined mercenary brigades of the independent coastal freeports.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['specialized_removal'],
    complexity: 'intermediate',
    art: {
      subject: "Scarred warlord in steel brigandine roaring a battle cry while waving a broadsword",
      silhouette: "Fierce commander shouting forward with raised sword",
      palette: ['lumenport_bronze', 'sapphire_blue', 'cobblestone_grey'],
      lighting: 'Golden hour sunlight over coastal city architecture',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0127',
    name: "Harbor Mist Smoke-Screen",
    type: 'tactic',
    subtype: 'quick',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Quick Tactic. Grant an allied creature Ward.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'ward' }
      ]
    }],
    lore: "Dense fog banks roll off the bay to shield retreating allies.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Thick white harbor fog obscuring stone wharf and ship hulls",
      silhouette: "Rolling cloud of mist across wooden docks",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0128',
    name: "Emergency Rations",
    type: 'tactic',
    subtype: 'quick',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Quick Tactic. Restore 3 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 3 }
      ]
    }],
    lore: "Dried fruit and salted fish keep a duelist sharp through prolonged rounds.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Wooden mess kit with dried rations and a flask of fresh cider",
      silhouette: "Still life of traveler rations and leather canteen",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0129',
    name: "Bazaar Haggling",
    type: 'tactic',
    subtype: 'quick',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Quick Tactic. Scry 2.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "A savvy customer inspects three wares before handing over a single Crown.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Merchant and buyer leaning across market counter inspecting gold coins",
      silhouette: "Two profiles bargaining over a wooden counter",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0130',
    name: "Reinforce the Barricade",
    type: 'tactic',
    subtype: 'quick',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Quick Tactic. Grant an allied creature Guard.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'guard' }
      ]
    }],
    lore: "Heave another timber crate into the doorway before the charge hits.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Soldiers slamming wooden crates and iron bars against wooden double doors",
      silhouette: "Barricaded door reinforced with wooden beams",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0131',
    name: "Market Skirmish Retreat",
    type: 'tactic',
    subtype: 'quick',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Quick Tactic. Restore 2 Vitality to your Leader and draw 1 card.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 2 }
        , {"operation":"draw","target":"ally_leader","amount":1}
      ]
    }],
    lore: "Tumble over produce carts to break line-of-sight and regroup behind the tavern.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Duelist rolling under an awning as wooden crates tumble behind him",
      silhouette: "Acrobatic figure rolling under market stall",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0132',
    name: "Warning Shot",
    type: 'tactic',
    subtype: 'quick',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Quick Tactic. Deal 2 damage to an enemy creature in target lane.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }
      ]
    }],
    lore: "A bolt fired into the paving stones at their toes usually suffices.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Crossbow bolt splintering stone pavers with flying sparks near boots",
      silhouette: "Arrow striking cobblestone with spark impact",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0133',
    name: "Chartered Ferry Passage",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Draw 2 cards.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Tickets stamped by the Ferrymaster guarantee priority transport across the harbor.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Ferry gliding smoothly across tranquil sunlit waters toward distant city spires",
      silhouette: "Wooden ferry silhouette on calm water",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0134',
    name: "Town Cryer’s Announcement",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Grant all allied creatures +1 Attack.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 0 }
      ]
    }],
    lore: "The bell rings three times: all citizens are summoned to the defense of the Accord.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Town cryer in crimson coat ringing brass handbell while reading royal parchment",
      silhouette: "Figure raising bell with scroll in other hand",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0135',
    name: "Confiscate Illegal Goods",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Silence a target enemy creature.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'silence', target: 'target_enemy_creature' }
      ]
    }],
    lore: "The Inspector’s wax seal strips all unsanctioned magical properties from contraband.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Watch officer stamping red wax seal onto a glowing forbidden grimoire",
      silhouette: "Official stamping heavy seal on bound book",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0136',
    name: "Tavern Brawl Diversion",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Deal 1 damage to all enemy creatures.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 1 }
      ]
    }],
    lore: "A flying ale mug escalates into thirty brawlers knocking over every bench.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Chaotic tavern interior with flying tankards, broken chairs, and brawling sailors",
      silhouette: "Silhouette of flying chair and tumbling brawlers",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0137',
    name: "Council Truce Protocol",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Restore 5 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 5 }
      ]
    }],
    lore: "An official envoy raises the white-and-sapphire flag of temporary ceasefire.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Diplomat extending a white flag on the battlefield as weapons are lowered",
      silhouette: "Standing envoy raising white banner between armies",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0138',
    name: "Accord Supply Convoy",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Draw 2 cards and restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 2 }
        , {"operation":"heal","target":"ally_leader","amount":2}
      ]
    }],
    lore: "Heavy draft wagons arrive with barrels of healing salve and fresh weapon bundles.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Line of horse-drawn canvas wagons rolling into town under guard escort",
      silhouette: "Convoy of covered wagons along mountain road",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0139',
    name: "Grand Tournament Fanfare",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Grant all allied creatures +1/+1.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 1 }
      ]
    }],
    lore: "Brass trumpets ring out from the coliseum towers, rousing the combatants to heroics.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Row of heralds blowing long golden fanfare trumpets from coliseum battlements",
      silhouette: "Row of heralds with raised horizontal trumpets",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0140',
    name: "Ballista Battery Volley",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 5,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Deal 2 damage to all enemy creatures.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 2 }
      ]
    }],
    lore: "Coordinated fire from three harbor watchtowers sweeps clean the waterfront approach.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Three fortress ballistas firing heavy iron bolts simultaneously over battlements",
      silhouette: "Multiple horizontal ballistic bolt trajectories",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0141',
    name: "Judicial Banishment",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 5,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Destroy a target enemy creature.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'destroy', target: 'target_enemy_creature' }
      ]
    }],
    lore: "The Council of Eight unanimously votes to expel the offender from the Convergence territory.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Guards escorting a chained and hooded figure out through the great stone city gate",
      silhouette: "Chained figure led out through massive gate",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0142',
    name: "Convergence Leyline Burst",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 5,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Deal 3 damage to all enemy creatures and draw 1 card.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 3 }
        , {"operation":"draw","target":"ally_leader","amount":1}
      ]
    }],
    lore: "A harmonic resonance pulse erupts from the central table foundation, shattering enemy vanguards.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Blinding sapphire shockwave erupting radially from the center of a stone plaza",
      silhouette: "Radial circular shockwave flattening surrounding pillars",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0143',
    name: "Treaty of Perpetual Accord",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 6,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Restore 6 Vitality to your Leader and draw 2 cards.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 6 }
        , {"operation":"draw","target":"ally_leader","amount":2}
      ]
    }],
    lore: "The foundational legal treaty ratified by all eight factions to preserve Lumenport neutrality.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Ornate parchment scroll with eight distinct faction wax seals illuminated by morning sun",
      silhouette: "Unfurled treaty scroll displaying eight circular seals",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-T-0144',
    name: "Siege Mortar Barrage",
    type: 'tactic',
    subtype: 'standard',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 6,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Standard Tactic. Deal 7 damage to a target enemy creature.",
    abilities: [{
      trigger: 'on_play',
      conditions: [],
      effects: [
        { operation: 'deal_damage', target: 'target_enemy_creature', amount: 7 }
      ]
    }],
    lore: "Heavy bronze mortars lob explosive ceramic bombs that reduce even colossi to gravel.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['timing'],
    complexity: 'intermediate',
    art: {
      subject: "Huge siege mortar recoiling in smoke as an explosive shell arcs high into the sky",
      silhouette: "Smoking mortar barrel with soaring parabolic shell",
      palette: ['lumenport_bronze', 'sapphire_blue', 'stone_slate'],
      lighting: 'Bright daylight with rich shadows',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0145',
    name: "Merchant Guild Seal-Ring",
    type: 'relic',
    subtype: 'jewelry_relic',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the start of your turn, Scry 1.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Gold signet ring bearing the scales of fair commerce.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Heavy gold signet ring with engraved scales resting on black velvet",
      silhouette: "Oval signet ring profile",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0146',
    name: "Traveler’s Pocket Sundial",
    type: 'relic',
    subtype: 'instrument_relic',
    faction: 'neutral',
    rarity: 'common',
    role: null,
    cost: 1,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the start of your turn, restore 1 Vitality to your Leader.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Keeps precise time even under the strange multi-hued skies of Lumenport.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Hinged brass pocket sundial with folding gnomon resting on weathered map",
      silhouette: "Circular folding pocket instrument",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0147',
    name: "Harbor Signal Lantern",
    type: 'relic',
    subtype: 'illumination_relic',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the end of your turn, restore 1 Vitality to your Leader.",
    abilities: [{
      trigger: 'turn_end',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Burns whale oil in a sapphire glass chamber that cuts through midnight squalls.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Heavy brass nautical lantern with thick blue-tinted bullseye glass lens",
      silhouette: "Sturdy four-sided storm lantern",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0148',
    name: "Scholar’s Brass Abacus",
    type: 'relic',
    subtype: 'counting_relic',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the start of your turn, draw 1 card.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Beads of polished bone slide smoothly along brass wires to balance the ledger.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Wooden framed abacus with polished bone beads on gleaming brass wires",
      silhouette: "Rectangular counting frame with bead rows",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0149',
    name: "Duelist Plaza War-Horn",
    type: 'relic',
    subtype: 'instrument_relic',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the start of your turn, grant your strongest allied creature +1 Attack.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 0 }
      ]
    }],
    lore: "Carved from an aurochs horn and tipped with silver; its call commands instant attention.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Curved horn with silver bands and leather strap hanging from a stone pillar",
      silhouette: "Curved hunting horn profile",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0150',
    name: "City Watch Captain’s Badge",
    type: 'relic',
    subtype: 'badge_relic',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the start of your turn, grant your strongest allied creature Guard.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'guard' }
      ]
    }],
    lore: "Bestowed by the Council upon officers who maintain order in the Free Districts.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Eight-pointed star badge of cast bronze pinned to indigo wool cloth",
      silhouette: "Eight-pointed star insignia",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0151',
    name: "Aether-Stove Traveling Kettle",
    type: 'relic',
    subtype: 'utility_relic',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the end of your turn, restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'turn_end',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Heats soothing mint tea over a tiny blue Aether crystal in minutes.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Steaming copper tea kettle sitting atop a miniature brass burner glowing blue",
      silhouette: "Round kettle with curling steam plume",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0152',
    name: "Chamber of Commerce Ledger",
    type: 'relic',
    subtype: 'record_relic',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the start of your turn, draw 1 card.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Records tariffs and bond investments from all nine maritime trade routes.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Thick leather-bound ledger with brass lock clasps open on wooden lectern",
      silhouette: "Thick book resting open on an angled wooden stand",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0153',
    name: "Prism-Beacon Focusing Lens",
    type: 'relic',
    subtype: 'optical_relic',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 4,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the start of your turn, grant your strongest allied creature +1/+1.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 1 }
      ]
    }],
    lore: "Calibrated by Master Vance to channel ambient table resonance into the vanguard.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Large convex crystal lens mounted in brass gimbal ring projecting a beam of light",
      silhouette: "Circular lens on gimbal frame casting light beam",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-R-0154',
    name: "The Accord Sovereign Goblet",
    type: 'relic',
    subtype: 'ceremonial_relic',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 5,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Relic. At the end of your turn, restore 3 Vitality to your Leader.",
    abilities: [{
      trigger: 'turn_end',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 3 }
      ]
    }],
    lore: "Passed among the eight faction delegates after each successful peace summit.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['tempo'],
    complexity: 'beginner',
    art: {
      subject: "Two-handled chalice of beaten gold set with eight cabochon gemstones",
      silhouette: "Two-handled ornate chalice on pedestal",
      palette: ['gold', 'sapphire', 'bronze', 'velvet_navy'],
      lighting: 'Tactile showcase lighting on fine artisan metals',
      environment: 'Lumenport Central City'
    }
  },
  {
    id: 'NEU-E-0155',
    name: "Harbor Beacon Esplanade",
    type: 'environment',
    subtype: 'harbor_promenade',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Environment. At the start of your turn, restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "Fresh salt breezes and calling gulls greet travelers arriving on the morning ferries.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['environment_replacement'],
    complexity: 'intermediate',
    art: {
      subject: "Wide paved promenade lined with stone balustrades overlooking the blue harbor at dawn",
      silhouette: "Harbor quay with balustrades and distant ferry",
      palette: ['harbor_blue', 'sandstone_gold', 'white_marble'],
      lighting: 'Panoramic atmospheric sunlight with distant coastal horizons',
      environment: 'Lumenport Metropolitan Region'
    }
  },
  {
    id: 'NEU-E-0156',
    name: "The Resonance Trading Floor",
    type: 'environment',
    subtype: 'mercantile_hall',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Environment. On Play: Draw 1 card. At the start of your turn, Scry 1.",
    abilities: [
      {
        trigger: 'on_play',
        conditions: [],
        effects: [
          { operation: 'draw', target: 'ally_leader', amount: 1 }
        ]
      },
      {
        trigger: 'turn_start',
        conditions: [],
        effects: [
          { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }
        ]
      }
    ],
    lore: "A bustling multi-tiered trading floor where rare singles and sealed packs change hands by the minute.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['environment_replacement'],
    complexity: 'intermediate',
    art: {
      subject: "Vaulted iron-and-glass market hall filled with crowded trading booths and chalkboards",
      silhouette: "Vaulted glass ceiling over bustling tiered bazaar",
      palette: ['harbor_blue', 'sandstone_gold', 'white_marble'],
      lighting: 'Panoramic atmospheric sunlight with distant coastal horizons',
      environment: 'Lumenport Metropolitan Region'
    }
  },
  {
    id: 'NEU-E-0157',
    name: "Old Harbor Sea-Wall",
    type: 'environment',
    subtype: 'coastal_fortress',
    faction: 'neutral',
    rarity: 'uncommon',
    role: null,
    cost: 2,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Environment. At the start of your turn, grant your strongest allied creature Guard.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'guard' }
      ]
    }],
    lore: "Massive granite breakwaters built centuries ago to shield the inner docks from Atlantic gales.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['environment_replacement'],
    complexity: 'intermediate',
    art: {
      subject: "Colossal stone seawall battered by ocean spray with watchtowers in background",
      silhouette: "Heavy curved stone wall with waves breaking over it",
      palette: ['harbor_blue', 'sandstone_gold', 'white_marble'],
      lighting: 'Panoramic atmospheric sunlight with distant coastal horizons',
      environment: 'Lumenport Metropolitan Region'
    }
  },
  {
    id: 'NEU-E-0158',
    name: "The Accord Institute Rotunda",
    type: 'environment',
    subtype: 'scholarly_rotunda',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Environment. At the start of your turn, draw 1 card.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'draw', target: 'ally_leader', amount: 1 }
      ]
    }],
    lore: "Beneath the soaring domed ceiling, scholars and duelists debate the metaphysics of the Braid.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['environment_replacement'],
    complexity: 'intermediate',
    art: {
      subject: "Monumental marble rotunda with towering classical columns and open dome skylight",
      silhouette: "Classical circular domed colonnade interior",
      palette: ['harbor_blue', 'sandstone_gold', 'white_marble'],
      lighting: 'Panoramic atmospheric sunlight with distant coastal horizons',
      environment: 'Lumenport Metropolitan Region'
    }
  },
  {
    id: 'NEU-E-0159',
    name: "Lumenport Duelist Amphitheater",
    type: 'environment',
    subtype: 'open_arena',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Environment. At the start of your turn, grant your strongest allied creature +1 Attack.",
    abilities: [{
      trigger: 'turn_start',
      conditions: [],
      effects: [
        { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 0 }
      ]
    }],
    lore: "Tiered stone amphitheater where spectators cheer on novice duelists under sunny skies.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['environment_replacement'],
    complexity: 'intermediate',
    art: {
      subject: "Semi-circular stone amphitheater seating overlooking an octagonal duel table",
      silhouette: "Stepped tiers of open-air amphitheater",
      palette: ['harbor_blue', 'sandstone_gold', 'white_marble'],
      lighting: 'Panoramic atmospheric sunlight with distant coastal horizons',
      environment: 'Lumenport Metropolitan Region'
    }
  },
  {
    id: 'NEU-E-0160',
    name: "Beacon Tower Summit",
    type: 'environment',
    subtype: 'lighthouse_apex',
    faction: 'neutral',
    rarity: 'rare',
    role: null,
    cost: 3,
    attack: 0,
    health: 0,
    keywords: [],
    mechanics: ['convergence'],
    description: "Environment. At the end of your turn, restore 2 Vitality to your Leader.",
    abilities: [{
      trigger: 'turn_end',
      conditions: [],
      effects: [
        { operation: 'heal', target: 'ally_leader', amount: 2 }
      ]
    }],
    lore: "High above the clouds of Lumenport, the great Aether beacon bathes the entire bay in soothing light.",
    archetypes: ['neutral_convergence'],
    weaknesses: ['environment_replacement'],
    complexity: 'intermediate',
    art: {
      subject: "High stone balcony platform beneath giant glowing blue beacon crystal overlooking sunset coast",
      silhouette: "High balcony with glowing crystal beacon",
      palette: ['harbor_blue', 'sandstone_gold', 'white_marble'],
      lighting: 'Panoramic atmospheric sunlight with distant coastal horizons',
      environment: 'Lumenport Metropolitan Region'
    }
  },
];
