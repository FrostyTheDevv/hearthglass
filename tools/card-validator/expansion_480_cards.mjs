// Canonical Phase 4 Expansion: 320 -> 480 Original Cards (Section 10)
// Adds 16 cards per major faction (0033..0048: 9 Creatures, 3 Tactics, 3 Relics, 1 Environment) = 128 faction cards
// Adds 32 Neutral cards (0065..0096: 18 Creatures, 8 Tactics, 4 Relics, 2 Environments) = 32 neutral cards
// Total new cards: 160 (Cumulative total: 480 cards: 48 per major faction, 96 Neutral)
// Respects the 640-card release ceiling per faction/type & rarity.

const PHASE_4_MAJOR_FACTION_PACKS = [
  {
    prefix: 'EMB',
    faction: 'emberclad',
    mechanic: 'heat',
    archetypes: ['overheat_aggro', 'burn_midrange', 'forge_relics'],
    weaknesses: ['high_health_guards', 'silence'],
    palette: ['molten_orange', 'charcoal_black', 'volcanic_red'],
    lighting: 'Intense magma under-lighting and flying forge sparks',
    environment: 'Cindervault Ridge Smeltery',
    creatures: [
      { num: '0033', name: 'Cinder-Vane Outrider', subtype: 'human_scout', rarity: 'common', role: 'vanguard', cost: 1, attack: 2, health: 1, keywords: ['swift'], op: 'add_counter', target: 'enemy_in_lane', counter: 'burn', amount: 1, trigger: 'on_summon', desc: 'Swift. On Summon: Inflict 1 Burn counter on an enemy creature in this lane.', lore: 'He rides a sulfur-skiff ahead of the main foundry column, marking enemy shields with white-hot flares.', subj: 'Agile Emberclad outrider hurling a magnesium flare from a basalt ridge', sil: 'Low lunging scout with streaming ember cloak' },
      { num: '0034', name: 'Furnace-Door Phalanx', subtype: 'forged_infantry', rarity: 'common', role: 'bulwark', cost: 2, attack: 1, health: 5, keywords: ['guard'], op: 'add_counter', target: 'self', counter: 'heat', amount: 1, trigger: 'when_damaged', desc: 'Guard. When damaged, gain 1 Heat counter (+1 Attack).', lore: 'Their interlocked shields were cast from the dismantled blast doors of Old Hammerfall.', subj: 'Wall of heavy iron-clad infantry locking glowing furnace-door shields', sil: 'Solid rectangular phalanx wall with glowing vents' },
      { num: '0035', name: 'Ash-Glass Cutthroat', subtype: 'human_rogue', rarity: 'common', role: 'assassin', cost: 3, attack: 4, health: 2, keywords: ['pierce'], op: 'deal_damage', target: 'enemy_leader', amount: 1, trigger: 'after_this_attacks', desc: 'Pierce. After this attacks, deal 1 damage to the enemy Leader.', lore: 'Knives chipped from volcanic obsidian leave splinters that smolder inside armor seams.', subj: 'Dual-dagger volcanic rogue vaulting through a curtain of black furnace smoke', sil: 'Sharp X-shaped dual-blade strike' },
      { num: '0036', name: 'Slag-Mortar Bombardier', subtype: 'dwarf_cannoneer', rarity: 'common', role: 'marksman', cost: 4, attack: 3, health: 4, keywords: ['reach'], op: 'add_counter', target: 'enemy_in_lane', counter: 'burn', amount: 1, trigger: 'after_this_attacks', desc: 'Reach. After this attacks, inflict 1 Burn counter on an enemy creature in this lane.', lore: 'His portable bronze mortar lobs hollow clay shells filled with liquid crucible dross.', subj: 'Stout bombardier bracing a smoking shoulder-mortar on a slag heap', sil: 'Stocky cannoneer with angled mortar tube' },
      { num: '0037', name: 'Pyraxis Flame-Weaver', subtype: 'human_pyromancer', rarity: 'uncommon', role: 'caster', cost: 3, attack: 3, health: 3, keywords: ['burn'], op: 'deal_damage', target: 'all_enemy_creatures', amount: 1, trigger: 'on_summon', desc: 'On Summon: Deal 1 damage to all enemy creatures.', lore: 'She twists rising chimney drafts into whipping ribbons of disciplined fire.', subj: 'Emberclad pyromancer spinning twin ribbons of molten fire above an anvil', sil: 'Sweeping S-curve of flame framing a robed caster' },
      { num: '0038', name: 'Crucible Tallow-Matron', subtype: 'human_smith', rarity: 'uncommon', role: 'support', cost: 3, attack: 2, health: 4, keywords: [], op: 'remove_counter', target: 'ally_creature_in_lane_or_any', counter: 'heat', amount: 1, op2: { operation: 'heal', target: 'ally_creature_in_lane_or_any', amount: 3 }, trigger: 'on_summon', desc: 'On Summon: Remove 1 Heat counter from an allied creature and restore 3 Health to it.', lore: 'A ladle of dragon-tallow quench cools white-hot armor before the wearer cooks inside it.', subj: 'Veteran forge-matron dousing a glowing breastplate with smoking quenching oil', sil: 'Broad aproned matron raising a steaming ladle' },
      { num: '0039', name: 'Cinder-Chain Harrier', subtype: 'human_skirmisher', rarity: 'uncommon', role: 'trickster', cost: 2, attack: 2, health: 3, keywords: ['skirmish'], op: 'add_counter', target: 'self', counter: 'heat', amount: 1, trigger: 'on_move', desc: 'Skirmish. When this moves lanes, gain 1 Heat counter.', lore: 'Swinging from overhead foundry cranes on red-hot chains, he drops into whichever lane lags behind.', subj: 'Acrobatic forge fighter swinging across a lava chute on a glowing iron chain', sil: 'Pendulum arc silhouette above molten metal' },
      { num: '0040', name: 'Smeltery Warden-Captain', subtype: 'human_commander', rarity: 'rare', role: 'controller', cost: 5, attack: 4, health: 5, keywords: ['guard', 'shield'], op: 'add_counter', target: 'all_ally_creatures', counter: 'heat', amount: 1, trigger: 'on_summon', desc: 'Guard, Shield (1). On Summon: Grant all allied creatures 1 Heat counter.', lore: 'When his whistle sounds across Cindervault Ridge, every furnace opens its dampers to full draft.', subj: 'Armored foundry captain raising a glowing war-hammer before a row of blast furnaces', sil: 'Commanding armored leader with high vented collar' },
      { num: '0041', name: 'Vulkanos, Heart of the Seventh Anvil', subtype: 'primordial_avatar', rarity: 'legendary', role: 'colossus', cost: 8, attack: 8, health: 7, keywords: ['pierce', 'shield'], op: 'deal_damage', target: 'all_enemy_creatures', amount: 2, op2: { operation: 'add_counter', target: 'self', counter: 'heat', amount: 2 }, trigger: 'on_summon', desc: 'Pierce, Shield (1). On Summon: Deal 2 damage to all enemy creatures and gain 2 Heat counters.', lore: 'Forged by Grand Master Vaelor during the Year 412 eruption, Vulkanos walks only when the Caldera itself goes to war.', subj: 'Titanic living forge-colossus with an anvil chest and magma rivers pouring from its shoulders', sil: 'Monumental volcano-shouldered titan dwarfing foundry towers' }
    ],
    tactics: [
      { num: '0042', name: 'White-Hot Temper', subtype: 'quick', rarity: 'common', cost: 1, keywords: [], op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'heat', amount: 1, op2: { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 2, health_delta: 0 }, desc: 'Quick Tactic. Grant an allied creature 1 Heat counter and +2 Attack.', lore: 'Strike before the cherry-red glow fades from the edge.', subj: 'Close-up of a warhammer striking a glowing blade in an explosion of sparks', sil: 'Radial burst of white-hot sparks' },
      { num: '0043', name: 'Cinder- Vent Eruption', subtype: 'standard', rarity: 'uncommon', cost: 3, keywords: ['burn'], op: 'deal_damage', target: 'all_enemy_creatures', amount: 1, op2: { operation: 'add_counter', target: 'target_enemy_creature', counter: 'burn', amount: 2 }, desc: 'Standard Tactic. Deal 1 damage to all enemy creatures and inflict 2 Burn counters on a target enemy creature.', lore: 'Pressure builds beneath the basalt floorplates until the entire lane vents skyward.', subj: 'Geyser of volcanic flame erupting through cracked arena stone', sil: 'Vertical column of fire and basalt shards' },
      { num: '0044', name: 'Melt the Gates', subtype: 'standard', rarity: 'rare', cost: 5, keywords: [], op: 'deal_damage', target: 'target_enemy_creature', amount: 5, op2: { operation: 'deal_damage', target: 'enemy_leader', amount: 3 }, desc: 'Standard Tactic. Deal 5 damage to an enemy creature and 3 damage to the enemy Leader.', lore: 'Thermite-grade Ignis paste reduces three-inch iron plate to dripping slag.', subj: 'Armored fortress gate melting into liquid metal under a white-hot chemical blaze', sil: 'Collapsing archway glowing white-orange' }
    ],
    relics: [
      { num: '0045', name: 'Bellows-Piston Gauntlet', subtype: 'weapon_relic', rarity: 'common', cost: 2, keywords: [], trigger: 'turn_start', op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'heat', amount: 1, desc: 'Relic. At the start of your turn, grant an allied creature 1 Heat counter.', lore: 'Each punch compresses air into a miniature firebox along the knuckles.', subj: 'Heavy articulated iron gauntlet with brass steam pistons and glowing coal vents', sil: 'Clenched mechanical fist radiating heat' },
      { num: '0046', name: 'Dragon-Tallow Quench Vat', subtype: 'forge_relic', rarity: 'uncommon', cost: 2, keywords: [], trigger: 'turn_end', op: 'heal', target: 'strongest_ally_creature', amount: 2, desc: 'Relic. At the end of your turn, restore 2 Health to your strongest allied creature.', lore: 'Steaming oil mixed with ash-herbs hardens dented plate in seconds.', subj: 'Iron cauldron of steaming amber oil surrounded by hung tongs and hammers', sil: 'Round riveted vat with rising vapor plumes' },
      { num: '0047', name: 'Crown of Mount Pyraxis', subtype: 'command_relic', rarity: 'rare', cost: 4, keywords: [], trigger: 'turn_start', op: 'deal_damage', target: 'enemy_leader', amount: 2, op2: { operation: 'add_counter', target: 'strongest_ally_creature', counter: 'heat', amount: 1 }, desc: 'Relic. At the start of your turn, deal 2 damage to the enemy Leader and grant your strongest allied creature 1 Heat counter.', lore: 'Cast from the first meteoric iron pulled from the Pyraxis crater.', subj: 'Jagged iron-and-obsidian circlet hovering above a pedestal of live coals', sil: 'Spiked volcanic crown ringed by floating embers' }
    ],
    environments: [
      { num: '0048', name: 'Slag-Gate Basalt Causeway', subtype: 'volcanic_bridge', rarity: 'uncommon', cost: 2, keywords: [], trigger: 'turn_start', op: 'add_counter', target: 'strongest_ally_creature', counter: 'heat', amount: 1, desc: 'Environment. At the start of your turn, grant your strongest allied creature 1 Heat counter.', lore: 'Suspended on massive iron links above a river of molten silicate, its air shimmers with perpetual heat.', subj: 'Massive chain-suspended basalt bridge spanning a glowing river of lava', sil: 'Dramatic diagonal bridge span over molten orange chasm' }
    ]
  },
  {
    prefix: 'VER',
    faction: 'verdant_pact',
    mechanic: 'growth',
    archetypes: ['bloom_ramp', 'living_bulwark', 'symbiotic_swarm'],
    weaknesses: ['corrode_decay', 'sweeping_burn'],
    palette: ['emerald_green', 'amber_sap', 'bark_brown'],
    lighting: 'Dappled golden canopy sunbeams and glowing emerald pollen',
    environment: 'Whisperleaf High Canopy',
    creatures: [
      { num: '0033', name: 'Sun-Vine Runner', subtype: 'sylvan_scout', rarity: 'common', role: 'vanguard', cost: 1, attack: 1, health: 3, keywords: ['swift'], op: 'add_counter', target: 'self', counter: 'growth', amount: 1, trigger: 'on_summon', desc: 'Swift. On Summon: Gain 1 Growth counter (+1/+1).', lore: 'Leaping along braided lianas, she reaches the front line already sheathed in living bark.', subj: 'Nimble forest scout swinging from a sunlit vine with an ironwood spear', sil: 'Dynamic airborne runner framed by trailing leaves' },
      { num: '0034', name: 'Ironwood Root-Wall', subtype: 'living_barrier', rarity: 'common', role: 'bulwark', cost: 2, attack: 1, health: 5, keywords: ['guard', 'anchor'], op: 'heal', target: 'self', amount: 1, trigger: 'turn_end', desc: 'Guard, Anchor. At the end of your turn, restore 1 Health to this creature.', lore: 'Coaxed from dormant roots beneath the arena tiles, it drinks deep and refuses to yield.', subj: 'Interwoven wall of thick ironwood roots blooming with white birch leaves', sil: 'Broad knotted wooden barrier anchored to the stone' },
      { num: '0035', name: 'ambush Mantis-Stalker', subtype: 'insectoid_beast', rarity: 'common', role: 'assassin', cost: 3, attack: 4, health: 2, keywords: ['stealth'], op: 'add_counter', target: 'self', counter: 'growth', amount: 1, trigger: 'after_this_attacks', desc: 'Stealth. After this attacks, gain 1 Growth counter (+1/+1).', lore: 'Motionless among the broad fern fronds until its serrated forelimbs flash like green scythes.', subj: 'Giant leaf-camouflaged praying mantis poised to strike from canopy shadows', sil: 'Angular folded-scythe predator silhouette' },
      { num: '0036', name: 'Amber-Bow Longshot', subtype: 'sylvan_archer', rarity: 'common', role: 'marksman', cost: 3, attack: 2, health: 4, keywords: ['reach'], op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'growth', amount: 1, trigger: 'after_this_attacks', desc: 'Reach. After this attacks, grant an allied creature 1 Growth counter (+1/+1).', lore: 'His arrows carry dormant pollen capsules that burst into restorative moss wherever they land.', subj: 'High-canopy archer drawing a recurve yew bow tipped with glowing amber', sil: 'Tall archer standing on a massive tree bough' },
      { num: '0037', name: 'Birch-Spring Druid', subtype: 'human_druid', rarity: 'uncommon', role: 'caster', cost: 3, attack: 2, health: 4, keywords: [], op: 'heal', target: 'all_ally_creatures', amount: 2, trigger: 'on_summon', desc: 'On Summon: Restore 2 Health to all allied creatures.', lore: 'Trained by Grove-Speaker Elowen at the Twelve White Birches, she calls cool spring water from dry slate.', subj: 'Druidess in white-bark robes raising a staff that fountains emerald water', sil: 'Graceful caster encircled by a rising water-and-leaf ribbon' },
      { num: '0038', name: 'Nectar-Gourd Apothecary', subtype: 'dryad_healer', rarity: 'uncommon', role: 'support', cost: 4, attack: 2, health: 5, keywords: [], op: 'heal', target: 'ally_leader', amount: 4, op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'growth', amount: 1 }, trigger: 'on_summon', desc: 'On Summon: Restore 4 Vitality to your Leader and grant an allied creature 1 Growth counter.', lore: 'Each gourd hangs in the Sun-Dew Conservatory for seven summers before its cordial is uncorked.', subj: 'Dryad healer offering a glowing golden gourd overflowing withvitality motes', sil: 'Serene healer with floating amber lanterns' },
      { num: '0039', name: 'Canopy Glider-Fox', subtype: 'forest_beast', rarity: 'uncommon', role: 'trickster', cost: 2, attack: 2, health: 3, keywords: ['skirmish'], op: 'heal', target: 'ally_leader', amount: 2, trigger: 'on_move', desc: 'Skirmish. When this moves lanes, restore 2 Vitality to your Leader.', lore: 'Spreading mossy wing-membranes, it glides between lanes on warm updrafts.', subj: 'Red-and-emerald flying fox gliding between giant forest branches', sil: 'Spread-winged gliding mammal trailing golden pollen' },
      { num: '0040', name: 'Briar-Gate Warden', subtype: 'treant_guardian', rarity: 'rare', role: 'controller', cost: 5, attack: 3, health: 6, keywords: ['guard'], op: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust', trigger: 'on_summon', desc: 'Guard. On Summon: Exhaust an enemy creature in this lane.', lore: 'Appointed by Canopy Matriarch Oakhaven, his word commands the border thorns to lock any intruder in place.', subj: 'Ancient ironwood treant extending heavy thorn-coils across a forest archway', sil: 'Broad-crowned arboreal sentinel blocking a gate' },
      { num: '0041', name: 'Oakhaven, Matriarch of the Elder Bough', subtype: 'ancient_treant', rarity: 'legendary', role: 'colossus', cost: 8, attack: 6, health: 9, keywords: ['guard', 'anchor'], op: 'add_counter', target: 'all_ally_creatures', counter: 'growth', amount: 2, op2: { operation: 'heal', target: 'ally_leader', amount: 4 }, trigger: 'on_summon', desc: 'Guard, Anchor. On Summon: Grant all allied creatures 2 Growth counters (+2/+2) and restore 4 Vitality to your Leader.', lore: 'Her roots cradle the northern wall of Whisperleaf; when she awakens, the entire forest marches with her.', subj: 'Colossal ancient treant matriarch carrying a sunlit sanctuary shrine in her crown', sil: 'Cathedral-scale living tree titan with glowing amber heart' }
    ],
    tactics: [
      { num: '0042', name: 'Burst of New Growth', subtype: 'quick', rarity: 'common', cost: 1, keywords: ['growth'], op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'growth', amount: 1, op2: { operation: 'heal', target: 'ally_creature_in_lane_or_any', amount: 2 }, desc: 'Quick Tactic. Grant an allied creature 1 Growth counter (+1/+1) and restore 2 Health to it.', lore: 'Fresh ironwood bark seals the rent before the blade even pulls free.', subj: 'Glowing green vines rapidly knitting across a cracked wooden shield', sil: 'Swirling emerald leaf-shield burst' },
      { num: '0043', name: 'Entangling Root-Surge', subtype: 'standard', rarity: 'uncommon', cost: 3, keywords: ['exhaust'], op: 'grant_keyword', target: 'all_enemy_creatures', keyword: 'exhaust', desc: 'Standard Tactic. Exhaust all enemy creatures.', lore: 'Beneath the slate floor, the roots of the Whisperleaf Compact still remember how to hold fast.', subj: 'Massive roots erupting across all three lanes to bind an entire enemy line', sil: 'Wide horizontal wave of grasping wooden roots' },
      { num: '0044', name: 'Convergence of the Great Canopy', subtype: 'standard', rarity: 'rare', cost: 5, keywords: ['growth'], op: 'add_counter', target: 'all_ally_creatures', counter: 'growth', amount: 2, op2: { operation: 'draw', target: 'ally_leader', amount: 2 }, desc: 'Standard Tactic. Grant all allied creatures 2 Growth counters (+2/+2) and draw 2 cards.', lore: 'When the high boughs interlock, every warrior below drinks from the same boundless well of Aether.', subj: 'Soaring forest canopy weaving together into a glowing golden-green dome', sil: 'Radiant overarching tree-crown mandala' }
    ],
    relics: [
      { num: '0045', name: 'Whisperleaf Acorn-Chime', subtype: 'druidic_relic', rarity: 'common', cost: 1, keywords: [], trigger: 'turn_start', op: 'heal', target: 'ally_leader', amount: 1, desc: 'Relic. At the start of your turn, restore 1 Vitality to your Leader.', lore: 'Hollowed from an ironwood nut, its soft chime carries the scent of summer rain.', subj: 'Cluster of carved wooden acorns and amber beads hanging from a living branch', sil: 'Delicate hanging chime with glowing dewdrop' },
      { num: '0046', name: 'Chalice of the Twelve Birches', subtype: 'healing_relic', rarity: 'uncommon', cost: 3, keywords: [], trigger: 'turn_end', op: 'heal', target: 'all_ally_creatures', amount: 1, desc: 'Relic. At the end of your turn, restore 1 Health to all allied creatures.', lore: 'Filled from Grove-Speaker Elowen’s sanctuary spring, its water never runs dry.', subj: 'White-birch and silver chalice overflowing with luminescent spring water', sil: 'Fluted wooden goblet on a mossy stone' },
      { num: '0047', name: 'Heartseed of the Worldroot', subtype: 'growth_relic', rarity: 'rare', cost: 4, keywords: ['growth'], trigger: 'turn_start', op: 'add_counter', target: 'all_ally_creatures', counter: 'growth', amount: 1, desc: 'Relic. At the start of your turn, grant all allied creatures 1 Growth counter (+1/+1).', lore: 'Preserved by Seed-Keeper Mirella since the First Age, its pulse accelerates all living growth around it.', subj: 'Giant pulsing golden seed suspended inside a cradle of braided ironwood roots', sil: 'Luminous heart-shaped seed in a root reliquary' }
    ],
    environments: [
      { num: '0048', name: 'Root-Bound Cathedral of Elder Yew', subtype: 'ancient_temple', rarity: 'uncommon', cost: 2, keywords: ['growth'], trigger: 'turn_end', op: 'add_counter', target: 'strongest_ally_creature', counter: 'growth', amount: 1, desc: 'Environment. At the end of your turn, grant your strongest allied creature 1 Growth counter (+1/+1).', lore: 'Living yew pillars arch overhead like cathedral ribs, empowering those who stand beneath their shade.', subj: 'Vast forest interior formed by living arched yew trunks and golden sun-shafts', sil: 'Gothic arches of living tree trunks' }
    ]
  },
  {
    prefix: 'IRN',
    faction: 'iron_choir',
    mechanic: 'assembly',
    archetypes: ['assembly_constructs', 'harmonic_bastion', 'dynamo_artillery'],
    weaknesses: ['corrode_effects', 'silence_disruption'],
    palette: ['steel_gray', 'brass', 'electric_blue'],
    lighting: 'Crisp electric-blue arc light and burnished brass reflections',
    environment: 'Grand Gantry of the Seventh Chime',
    creatures: [
      { num: '0033', name: 'Chime-Step Scout', subtype: 'construct_scout', rarity: 'common', role: 'vanguard', cost: 1, attack: 1, health: 2, keywords: ['shield'], op: 'add_counter', target: 'self', counter: 'assembly', amount: 1, trigger: 'on_summon', desc: 'Shield (1). On Summon: Gain 1 Assembly counter.', lore: 'Its spring-steel legs advance in exact synchronization with the Seventh Chime metronome.', subj: 'Compact brass clockwork scout advancing with a blue hard-light buckler', sil: 'Streamlined bipedal construct with glowing buckler' },
      { num: '0034', name: 'Gantry Bulwark-Automaton', subtype: 'construct_guardian', rarity: 'common', role: 'bulwark', cost: 2, attack: 2, health: 4, keywords: ['guard'], op: 'add_counter', target: 'self', counter: 'assembly', amount: 1, trigger: 'on_summon', desc: 'Guard. On Summon: Gain 1 Assembly counter.', lore: 'Stationed along the Ironreach viaducts, its gyro-stabilized feet never slip on wet brass.', subj: 'Broad-shouldered steel automaton locking a heavy cog-rimmed tower shield', sil: 'Square industrial guardian with gear pauldrons' },
      { num: '0035', name: 'Induction-Edge Striker', subtype: 'construct_duelist', rarity: 'common', role: 'assassin', cost: 3, attack: 4, health: 2, keywords: ['swift'], op: 'add_counter', target: 'self', counter: 'assembly', amount: 1, trigger: 'after_this_attacks', desc: 'Swift. After this attacks, gain 1 Assembly counter.', lore: 'Each slash winds its internal mainspring tighter for the follow-up lunge.', subj: 'Slender clockwork duelist lunging with twin blue-hot induction sabers', sil: 'Forward-leaning fencer with electric blade arcs' },
      { num: '0036', name: 'Railhead Harp-Gunner', subtype: 'human_artillerist', rarity: 'common', role: 'marksman', cost: 3, attack: 3, health: 3, keywords: ['reach'], op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'assembly', amount: 1, trigger: 'on_summon', desc: 'Reach. On Summon: Grant an allied creature 1 Assembly counter.', lore: 'Her acoustic rifle pluck-fires steel flechettes at the exact frequency that charges Choir servos.', subj: 'Choir marksman aiming a multi-stringed brass rail-rifle from a gantry catwalk', sil: 'Kneeling rifleman with harp-shaped barrel' },
      { num: '0037', name: 'Dynamo Resonance-Caster', subtype: 'human_engineer', rarity: 'uncommon', role: 'caster', cost: 3, attack: 2, health: 4, keywords: [], op: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield', op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'assembly', amount: 1 }, trigger: 'on_summon', desc: 'On Summon: Grant an allied creature Shield (1) and 1 Assembly counter.', lore: 'With a twist of his tuning baton, stray static crystallizes into an impenetrable hard-light shell.', subj: 'Iron Choir conductor projecting a hexagonal blue energy shield from a brass staff', sil: 'Robed engineer surrounded by spinning copper rings' },
      { num: '0038', name: 'Seventh-Chime Bellringer', subtype: 'human_chorister', rarity: 'uncommon', role: 'support', cost: 4, attack: 2, health: 5, keywords: ['guard'], op: 'modify_stats', target: 'all_ally_creatures', attack_delta: 0, health_delta: 1, op2: { operation: 'add_counter', target: 'all_ally_creatures', counter: 'assembly', amount: 1 }, trigger: 'on_summon', desc: 'Guard. On Summon: Grant all allied creatures +0/+1 and 1 Assembly counter.', lore: 'When the portable sanctuary bell tolls, every construct on the line locks plates in unison.', subj: 'Armored chorister striking a shoulder-mounted bronze bell with a glowing mallet', sil: 'Sturdy bell-bearer framed by concentric sonic waves' },
      { num: '0039', name: 'Monorail Shunt-Drone', subtype: 'clockwork_drone', rarity: 'uncommon', role: 'trickster', cost: 2, attack: 2, health: 3, keywords: ['skirmish', 'shield'], op: 'add_counter', target: 'self', counter: 'assembly', amount: 1, trigger: 'on_move', desc: 'Skirmish, Shield (1). When this moves lanes, gain 1 Assembly counter.', lore: 'Gliding on magnetic rollers, it slides laterally across the arena to plug sudden gaps.', subj: 'Wheeled brass defensive drone sliding sideways along a glowing magnetic track', sil: 'Compact gyro-wheeled construct with angled shield' },
      { num: '0040', name: 'Harmonic Adjudicator', subtype: 'construct_arbiter', rarity: 'rare', role: 'controller', cost: 5, attack: 4, health: 5, keywords: ['guard', 'shield'], op: 'silence', target: 'enemy_in_lane', trigger: 'on_summon', desc: 'Guard, Shield (1). On Summon: Silence an enemy creature in this lane.', lore: 'Its null-frequency chime cancels wild magic while leaving clockwork precision untouched.', subj: 'Tall brass-and-steel arbiter construct holding a tuning-fork halberd that projects a silence sphere', sil: 'Symmetrical judicial automaton with halo of brass chimes' },
      { num: '0041', name: 'Aegis-IX, Prime Sentinel of the Bell-Spire', subtype: 'sentient_colossus', rarity: 'legendary', role: 'colossus', cost: 8, attack: 7, health: 8, keywords: ['guard', 'shield', 'anchor'], op: 'grant_keyword', target: 'all_ally_creatures', keyword: 'shield', op2: { operation: 'add_counter', target: 'all_ally_creatures', counter: 'assembly', amount: 2 }, trigger: 'on_summon', desc: 'Guard, Shield (1), Anchor. On Summon: Grant all allied creatures Shield (1) and 2 Assembly counters.', lore: 'For two centuries Aegis-IX has stood watch over Saint Automaton’s belfry, its sentient core humming in unbroken harmony.', subj: 'Colossal brass-and-blue-glass guardian angel construct with wings of interlocking shield plates', sil: 'Monumental winged clockwork sentinel' }
    ],
    tactics: [
      { num: '0042', name: 'Harmonic Overclock', subtype: 'quick', rarity: 'common', cost: 1, keywords: [], op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'assembly', amount: 2, desc: 'Quick Tactic. Grant an allied creature 2 Assembly counters.', lore: 'Shunting reserve capacitor current into the drive gears doubles output in a single beat.', subj: 'Blue lightning surging through a brass gear-train inside an open armor chestplate', sil: 'Concentrated electric arc inside interlocking cogs' },
      { num: '0043', name: 'Broadside Rail-Volley', subtype: 'standard', rarity: 'uncommon', cost: 3, keywords: [], op: 'deal_damage', target: 'target_enemy_creature', amount: 3, op2: { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield' }, desc: 'Standard Tactic. Deal 3 damage to an enemy creature and grant an allied creature Shield (1).', lore: 'Recoil energy from the railgun battery is immediately recycled into frontline barrier projectors.', subj: 'Twin electromagnetic cannons firing blue slugs while projecting a forward energy wall', sil: 'Dual rail-beams piercing forward from a shield dome' },
      { num: '0044', name: 'Grand Symphony of the Seventh Chime', subtype: 'standard', rarity: 'rare', cost: 5, keywords: ['shield'], op: 'grant_keyword', target: 'all_ally_creatures', keyword: 'shield', op2: { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 2 }, desc: 'Standard Tactic. Grant all allied creatures Shield (1) and +1/+2.', lore: 'When Conductor-General Vespera raises the First Baton, every bell in Ironreach rings as a single fortress.', subj: 'Conductor on a high brass podium surrounded by hundreds of glowing shielded constructs', sil: 'Grand cathedral orchestra of illuminated war-constructs' }
    ],
    relics: [
      { num: '0045', name: 'Mainspring Winder', subtype: 'clockwork_relic', rarity: 'common', cost: 1, keywords: [], trigger: 'turn_start', op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'assembly', amount: 1, desc: 'Relic. At the start of your turn, grant an allied creature 1 Assembly counter.', lore: 'A simple brass key that keeps frontline servos from losing torque.', subj: 'Ornate T-shaped brass winding key hovering over a glowing clockface', sil: 'Crisp symmetrical key silhouette with gear teeth' },
      { num: '0046', name: 'Induction Barrier Pylon', subtype: 'defense_relic', rarity: 'uncommon', cost: 3, keywords: ['shield'], trigger: 'turn_start', op: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield', desc: 'Relic. At the start of your turn, grant an allied creature Shield (1).', lore: 'Planted behind the Front slot, it weaves a fresh kinetic screen every sixty seconds.', subj: 'Three-pronged copper-and-glass pylon projecting a dome of blue hexagons', sil: 'Vertical tripod pylon with energy halo' },
      { num: '0047', name: 'The Great Brass Metronome', subtype: 'command_relic', rarity: 'rare', cost: 4, keywords: [], trigger: 'turn_end', op: 'add_counter', target: 'all_ally_creatures', counter: 'assembly', amount: 1, op2: { operation: 'heal', target: 'ally_leader', amount: 2 }, desc: 'Relic. At the end of your turn, grant all allied creatures 1 Assembly counter and restore 2 Vitality to your Leader.', lore: 'Replica of the master timepiece in the Bell-Spire; its steady tick orders the entire battlefield.', subj: 'Monumental golden metronome encased in blue Aether glass on a marble plinth', sil: 'Tall obelisk metronome with radiant pendulum' }
    ],
    environments: [
      { num: '0048', name: 'Ironreach Induction Railhead', subtype: 'transit_hub', rarity: 'uncommon', cost: 2, keywords: [], trigger: 'turn_start', op: 'add_counter', target: 'strongest_ally_creature', counter: 'assembly', amount: 1, desc: 'Environment. At the start of your turn, grant your strongest allied creature 1 Assembly counter.', lore: 'Overhead copper catenaries feed continuous current into every construct standing on the platform.', subj: 'Vaulted iron-and-glass railway terminal with glowing blue induction tracks', sil: 'Arched train shed perspective with converging glowing rails' }
    ]
  },
  {
    prefix: 'TID',
    faction: 'tidebound',
    mechanic: 'current',
    archetypes: ['current_tempo', 'recall_control', 'deepwater_midrange'],
    weaknesses: ['anchor_locks', 'wide_board_clears'],
    palette: ['azure', 'turquoise', 'seafoam'],
    lighting: 'Luminous underwater caustics and crashing seafoam spray',
    environment: 'The Palace Beneath the Wake',
    creatures: [
      { num: '0033', name: 'Rip-Tide Skimmer', subtype: 'merfolk_scout', rarity: 'common', role: 'vanguard', cost: 1, attack: 2, health: 2, keywords: ['skirmish'], op: 'add_counter', target: 'self', counter: 'current', amount: 1, trigger: 'on_move', desc: 'Skirmish. When this moves lanes, gain 1 Current counter.', lore: 'She planes across the shallow harbor swell on carved whalebone fins.', subj: 'Agile merfolk scout hydroplaning on a turquoise wave crest with a coral spear', sil: 'Low streamlined surfer silhouette' },
      { num: '0034', name: 'Reef-Anchor Crab', subtype: 'crustacean_beast', rarity: 'common', role: 'bulwark', cost: 2, attack: 1, health: 5, keywords: ['guard'], op: 'heal', target: 'self', amount: 1, trigger: 'on_move', desc: 'Guard. When this moves lanes, restore 1 Health to this creature.', lore: 'Scuttling sideways between lanes, it digs its calcified claws into the slate to block incoming charges.', subj: 'Heavily armored turquoise reef crab raising twin nacre shield-pincers', sil: 'Wide low crustacean with interlocking front claws' },
      { num: '0035', name: 'Barracuda Darter', subtype: 'pelagic_hunter', rarity: 'common', role: 'assassin', cost: 3, attack: 4, health: 2, keywords: ['swift', 'skirmish'], op: 'deal_damage', target: 'enemy_in_lane', amount: 1, trigger: 'on_move', desc: 'Swift, Skirmish. When this moves lanes, deal 1 damage to an enemy creature in the destination lane.', lore: 'A flash of silver scales in the side-current is the only warning before the strike.', subj: 'Silver-armored sea hunter lunging out of a spinning water vortex with twin harpoon blades', sil: 'Torpedo-like horizontal lunge' },
      { num: '0036', name: 'Breakwater Hydro-Sniper', subtype: 'tide_marksman', rarity: 'common', role: 'marksman', cost: 3, attack: 2, health: 4, keywords: ['reach', 'skirmish'], op: 'add_counter', target: 'self', counter: 'current', amount: 1, trigger: 'after_this_attacks', desc: 'Reach, Skirmish. After this attacks, gain 1 Current counter.', lore: 'Compressed brine jets propel silent sea-glass needles across two hundred yards of surf.', subj: 'Marksman crouched on a wet basalt seawall aiming a pressurized water-Crossbow', sil: 'Perched coastal sniper with glowing brine tank' },
      { num: '0037', name: 'Whirlpool Weaver', subtype: 'tide_mage', rarity: 'uncommon', role: 'caster', cost: 3, attack: 2, health: 4, keywords: [], op: 'move_lane', target: 'ally_creature_in_lane_or_any', direction: 'adjacent', op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'current', amount: 1 }, trigger: 'on_summon', desc: 'On Summon: Move an allied creature to an open slot in an adjacent lane and grant it 1 Current counter.', lore: 'With a sweep of her kelp-silk sleeves, she redirects the harbor current to carry allies out of ambush.', subj: 'Tidebound hydromancer conducting two spiraling ribbons of glowing ocean water', sil: 'Flowing caster framed by figure-eight water currents' },
      { num: '0038', name: 'Nacreous Grotto Cantor', subtype: 'coral_priestess', rarity: 'uncommon', role: 'support', cost: 4, attack: 2, health: 5, keywords: [], op: 'heal', target: 'ally_leader', amount: 3, op2: { operation: 'heal', target: 'all_ally_creatures', amount: 1 }, trigger: 'on_summon', desc: 'On Summon: Restore 3 Vitality to your Leader and 1 Health to all allied creatures.', lore: 'Trained by High Conchist Marina, her resonant pearl-song washes fatigue from the entire line.', subj: 'Priestess in mother-of-pearl robes singing beside a giant iridescent giant clam shell', sil: 'Graceful cantor backed by an open pearl shell halo' },
      { num: '0039', name: 'Jetstream Acrobat', subtype: 'pelagic_duelist', rarity: 'uncommon', role: 'trickster', cost: 2, attack: 2, health: 3, keywords: ['skirmish'], op: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 1, trigger: 'on_move', desc: 'Skirmish. When this moves lanes, gain +1/+1.', lore: 'Every lateral leap builds momentum until his hydro-fans cut like diamond saws.', subj: 'Acrobatic duelist flipping over a wave crest with twin turquoise water-fans', sil: 'Mid-air somersault with crescent fan trails' },
      { num: '0040', name: 'Abyssal Undertow-Caller', subtype: 'deep_oracle', rarity: 'rare', role: 'controller', cost: 5, attack: 3, health: 6, keywords: ['guard', 'skirmish'], op: 'move_lane', target: 'enemy_in_lane', direction: 'adjacent', op2: { operation: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust' }, trigger: 'on_summon', desc: 'Guard, Skirmish. On Summon: Move an enemy creature in this lane to an adjacent lane and Exhaust it.', lore: 'He opens a localized trench current that drags enemy bulwarks away from the unit they were guarding.', subj: 'Deep-sea oracle in bioluminescent robes gesturing as a dark whirlpool drags an armored foe sideways', sil: 'Tall robed figure over a yawning abyssal vortex' },
      { num: '0041', name: 'Thalassa, Sovereign of the Sunken Wake', subtype: 'pelagic_archon', rarity: 'legendary', role: 'colossus', cost: 8, attack: 6, health: 8, keywords: ['skirmish', 'ward'], op: 'add_counter', target: 'all_ally_creatures', counter: 'current', amount: 2, op2: { operation: 'draw', target: 'ally_leader', amount: 2 }, trigger: 'on_summon', desc: 'Skirmish, Ward. On Summon: Grant all allied creatures 2 Current counters and draw 2 cards.', lore: 'From her pearl throne in the Palace Beneath the Wake, Thalassa commands the seven currents that encircle the world.', subj: 'Majestic sea-sovereign rising on a throne of living coral and luminous water dragons', sil: 'Regal aquatic archon crowned by a towering wave crest' }
    ],
    tactics: [
      { num: '0042', name: 'Riptide Pivot', subtype: 'quick', rarity: 'common', cost: 1, keywords: [], op: 'move_lane', target: 'ally_creature_in_lane_or_any', direction: 'adjacent', op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'current', amount: 1 }, desc: 'Quick Tactic. Move an allied creature to an open slot in an adjacent lane and grant it 1 Current counter.', lore: 'Step into the side-wash and let the sea carry you past their shield wall.', subj: 'Sudden turquoise current sweeping a vanguard warrior into an open flank', sil: 'Sharp lateral water-hook curve' },
      { num: '0043', name: 'Abyssal Pressure-Crush', subtype: 'standard', rarity: 'uncommon', cost: 4, keywords: [], op: 'deal_damage', target: 'target_enemy_creature', amount: 3, op2: { operation: 'return_to_hand', target: 'target_enemy_creature' }, desc: 'Standard Tactic. Deal 3 damage to a target enemy creature and return it to its owner hand.', lore: 'The weight of two leagues of dark ocean water collapses upon a single point.', subj: 'Sphere of dark bioluminescent deep-sea water imploding around an enemy construct', sil: 'Imploding dark-blue sphere with cyan pressure rings' },
      { num: '0044', name: 'Maelstrom of the Shattered Atoll', subtype: 'standard', rarity: 'rare', cost: 5, keywords: [], op: 'deal_damage', target: 'all_enemy_creatures', amount: 2, op2: { operation: 'add_counter', target: 'all_ally_creatures', counter: 'current', amount: 1 }, desc: 'Standard Tactic. Deal 2 damage to all enemy creatures and grant all allied creatures 1 Current counter.', lore: 'When the Atoll whirlpool spins to full fury, only Tidebound keels know how to ride its rim.', subj: 'Colossal ocean whirlpool engulfing the battlefield while Tidebound warriors surf its glowing rim', sil: 'Giant spiral vortex filling the frame' }
    ],
    relics: [
      { num: '0045', name: 'Kelp-Silk Tide-Pennant', subtype: 'navigation_relic', rarity: 'common', cost: 1, keywords: [], trigger: 'turn_start', op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'current', amount: 1, desc: 'Relic. At the start of your turn, grant an allied creature 1 Current counter.', lore: 'Stitched by Captain Nerissa’s riggers, it streams toward whichever lane holds the fastest slipstream.', subj: 'Iridescent turquoise pennant banner fluttering on a carved whalebone mast', sil: 'Flowing swallowtail banner on a curved spar' },
      { num: '0046', name: 'Pearl-Chime Bilge Pump', subtype: 'tide_relic', rarity: 'uncommon', cost: 2, keywords: [], trigger: 'on_move', op: 'add_counter', target: 'ally_leader', counter: 'current', amount: 1, desc: 'Relic. Whenever an allied creature moves lanes, gain 1 Current counter on your Leader.', lore: 'Filters brackish harbor water through seven layers of living nacre into pure restorative draughts.', subj: 'Mother-of-pearl and brass alembic fountain cycling glowing seafoam water', sil: 'Spiral shell fountain on a coral base' },
      { num: '0047', name: 'Triton Horn of the Pelagic Sanctum', subtype: 'command_relic', rarity: 'rare', cost: 4, keywords: ['skirmish'], trigger: 'turn_start', op: 'add_counter', target: 'all_ally_creatures', counter: 'current', amount: 1, desc: 'Relic. At the start of your turn, grant all allied creatures 1 Current counter.', lore: 'Sounded by High Conchist Marina when the reef-fleets transition from defense to full pursuit.', subj: 'Giant spiral conch horn inlaid with gold and glowing abyssal pearls', sil: 'Monumental spiral sea-horn radiating water rings' }
    ],
    environments: [
      { num: '0048', name: 'Shattered Atoll Whirlpool Reach', subtype: 'navigational_hazard', rarity: 'uncommon', cost: 2, keywords: ['skirmish'], trigger: 'turn_end', op: 'add_counter', target: 'strongest_ally_creature', counter: 'current', amount: 1, desc: 'Environment. At the end of your turn, grant your strongest allied creature 1 Current counter.', lore: 'Basalt sea-stacks ring a churning turquoise eddy that rewards constant motion.', subj: 'Ring of jagged sea-stacks surrounding a luminous spinning ocean eddy', sil: 'Circular sea-stack horizon around a glowing whirlpool' }
    ]
  },
  {
    prefix: 'GLS',
    faction: 'glassborne',
    mechanic: 'refraction',
    archetypes: ['prism_ward_tempo', 'mirror_control', 'refraction_burn'],
    weaknesses: ['multi_hit_tokens', 'unblockable_pierce'],
    palette: ['violet', 'silver', 'translucent_cyan'],
    lighting: 'Razor-sharp prismatic light beams and rainbow spectral caustics',
    environment: 'The Glass Cathedral Choir-Loft',
    creatures: [
      { num: '0033', name: 'Facet-Edge Fencer', subtype: 'crystal_duelist', rarity: 'common', role: 'vanguard', cost: 1, attack: 2, health: 1, keywords: ['ward'], op: 'add_counter', target: 'self', counter: 'refraction', amount: 1, trigger: 'on_summon', desc: 'Ward. On Summon: Gain 1 Refraction counter.', lore: 'Trained in the Quartz Proving Gallery to parry the first spell-bolt before his boot touches the tile.', subj: 'Agile fencer in silvered crystal armor lunging behind a hexagonal Ward lens', sil: 'Slender duelist with glowing geometric rapier' },
      { num: '0034', name: 'Silvered-Quartz Sentinel', subtype: 'crystal_construct', rarity: 'common', role: 'bulwark', cost: 2, attack: 1, health: 4, keywords: ['guard', 'ward'], op: 'add_counter', target: 'self', counter: 'refraction', amount: 1, trigger: 'when_damaged', desc: 'Guard, Ward. When damaged, gain 1 Refraction counter.', lore: 'Its mirror-polished breastplate bounces hostile Aether harmlessly toward the vaulted ceiling.', subj: 'Faceted quartz sentinel planting a tall hexagonal mirror-shield', sil: 'Angular geometric guardian with reflective plane shield' },
      { num: '0035', name: 'Refraction-Step Blade', subtype: 'human_assassin', rarity: 'common', role: 'assassin', cost: 3, attack: 4, health: 2, keywords: ['swift'], op: 'grant_keyword', target: 'self', keyword: 'ward', trigger: 'after_this_attacks', desc: 'Swift. After this attacks, gain Ward.', lore: 'Following Blade-Dancer Caelum’s technique, her lunge leaves a blinding prism flare that deflects counter-spells.', subj: 'Glassborne blade-dancer slicing through a rainbow prism beam with twin crystal stilettos', sil: 'Dynamic leaping dancer split by spectral light rays' },
      { num: '0036', name: 'Optical-Lens Arbalest', subtype: 'human_marksman', rarity: 'common', role: 'marksman', cost: 4, attack: 3, health: 3, keywords: ['reach', 'ward'], op: 'deal_damage', target: 'enemy_leader', amount: 2, trigger: 'on_summon', desc: 'Reach, Ward (1). On Summon: Deal 2 damage to the enemy Leader.', lore: 'Three aligned quartz lenses focus a standard Aether bolt into a hair-thin cutting laser.', subj: 'Marksman sighting down a silver crossbow fitted with three glowing magnifying lenses', sil: 'Precision shooter with multi-lens barrel' },
      { num: '0037', name: 'Chromatic Spectrum-Weaver', subtype: 'crystal_scholar', rarity: 'uncommon', role: 'caster', cost: 3, attack: 2, health: 4, keywords: ['ward'], op: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'ward', trigger: 'on_summon', desc: 'Ward. On Summon: Grant an allied creature Ward.', lore: 'Graduates of the Accord Optical Wing can spin a protective hexagonal lattice around any lane-mate.', subj: 'Glassborne scholar weaving floating hexagonal prism lenses around an ally', sil: 'Robed optician encircled by orbiting crystal hexagons' },
      { num: '0038', name: 'Cathedral Choir-Cantor', subtype: 'crystal_acolyte', rarity: 'uncommon', role: 'support', cost: 4, attack: 2, health: 5, keywords: [], op: 'add_counter', target: 'all_ally_creatures', counter: 'refraction', amount: 1, op2: { operation: 'heal', target: 'ally_leader', amount: 2 }, trigger: 'on_summon', desc: 'On Summon: Grant all allied creatures 1 Refraction counter and restore 2 Vitality to your Leader.', lore: 'When she rubs the rims of the great quartz chalices, their pure harmonic pitch fortifies every Ward on the board.', subj: 'Acolyte playing a set of glowing crystalline glass-harps in a stained-quartz loft', sil: 'Serene musician behind a rack of luminous crystal goblets' },
      { num: '0039', name: 'Mirage-Double Illusionist', subtype: 'human_illusionist', rarity: 'uncommon', role: 'trickster', cost: 2, attack: 2, health: 3, keywords: ['skirmish', 'ward'], op: 'add_counter', target: 'self', counter: 'refraction', amount: 1, trigger: 'on_move', desc: 'Skirmish, Ward. When this moves lanes, gain 1 Refraction counter.', lore: 'Is the real duelist in the Left Lane or the Center? By the time you strike, the glass shatters.', subj: 'Illusionist stepping sideways through a floating full-length mirror leaving a glowing double', sil: 'Twin overlapping silhouettes divided by a mirror frame' },
      { num: '0040', name: 'Null-Prism Inquisitor', subtype: 'crystal_archon', rarity: 'rare', role: 'controller', cost: 5, attack: 4, health: 5, keywords: ['ward'], op: 'silence', target: 'enemy_in_lane', op2: { operation: 'deal_damage', target: 'enemy_in_lane', amount: 2 }, trigger: 'on_summon', desc: 'Ward. On Summon: Silence an enemy creature in this lane and deal 2 damage to it.', lore: 'His smoky quartz monolith absorbs hostile enchantments and discharges them as raw kinetic shards.', subj: 'Stern archon lowering a dark violet quartz obelisk that shatters enemy spell runes', sil: 'Tall armored figure flanked by floating prism monoliths' },
      { num: '0041', name: 'Seraphina, Arch-Refractor of the First Spire', subtype: 'crystal_paragon', rarity: 'legendary', role: 'colossus', cost: 8, attack: 7, health: 7, keywords: ['ward', 'reach'], op: 'grant_keyword', target: 'all_ally_creatures', keyword: 'ward', op2: { operation: 'deal_damage', target: 'all_enemy_creatures', amount: 2 }, trigger: 'on_summon', desc: 'Ward, Reach. On Summon: Grant all allied creatures Ward and deal 2 damage to all enemy creatures.', lore: 'High Prelate of the Glass Cathedral; she focuses the noon sun through the First Spire to blind whole armies.', subj: 'Radiant paragon floating before a stained-crystal rose window with wings of prismatic light', sil: 'Soaring crystalline figure backed by a giant geometric sun-wheel' }
    ],
    tactics: [
      { num: '0042', name: 'Refraction Lattice', subtype: 'quick', rarity: 'common', cost: 1, keywords: ['ward'], op: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'ward', op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'refraction', amount: 1 }, desc: 'Quick Tactic. Grant an allied creature Ward and 1 Refraction counter.', lore: 'Tilt the lens forty-five degrees and their fireball becomes a harmless rainbow on the wall.', subj: 'Hexagonal crystal barrier snapping into place to split an incoming fireball into rainbow beams', sil: 'Hexagonal shield refracting a beam at a sharp angle' },
      { num: '0043', name: 'Shattering Focal Beam', subtype: 'standard', rarity: 'uncommon', cost: 3, keywords: [], op: 'deal_damage', target: 'target_enemy_creature', amount: 3, op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'refraction', amount: 1 }, desc: 'Standard Tactic. Deal 3 damage to an enemy creature and grant an allied creature 1 Refraction counter.', lore: 'Three floating lenses align down the lane, concentrating ambient light into a lance of white fire.', subj: 'Beam of violet-white light magnifying through three floating crystal rings to strike a target', sil: 'Stepped laser beam passing through three concentric rings' },
      { num: '0044', name: 'Hall of Ten Thousand Reflections', subtype: 'standard', rarity: 'rare', cost: 5, keywords: ['ward'], op: 'grant_keyword', target: 'all_ally_creatures', keyword: 'ward', op2: { operation: 'draw', target: 'ally_leader', amount: 2 }, desc: 'Standard Tactic. Grant all allied creatures Ward and draw 2 cards.', lore: 'Every ally is multiplied across a hundred silvered facets, leaving the enemy no true target to strike.', subj: 'Entire allied warband reflected infinitely across a dome of floating crystal mirrors', sil: 'Kaleidoscopic array of mirrored arches and warriors' }
    ],
    relics: [
      { num: '0045', name: 'Pocket Spectroscope', subtype: 'optical_relic', rarity: 'common', cost: 1, keywords: [], trigger: 'turn_start', op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'refraction', amount: 1, desc: 'Relic. At the start of your turn, grant an allied creature 1 Refraction counter.', lore: 'Standard issue for Lyra Vane’s research assistants in the Accord Optical Wing.', subj: 'Folding silver-and-quartz monocle resting on an engraved optical chart', sil: 'Compact brass-and-violet lens assembly' },
      { num: '0046', name: 'Mirror-Polished Aegis', subtype: 'ward_relic', rarity: 'uncommon', cost: 3, keywords: ['ward'], trigger: 'turn_end', op: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'ward', desc: 'Relic. At the end of your turn, grant your strongest allied creature Ward.', lore: 'Crafted by Master Orin Glasswright, its surface self-heals hairline fractures between turns.', subj: 'Levitating diamond-shaped mirror shield rimmed in silver filigree', sil: 'Floating geometric diamond shield' },
      { num: '0047', name: 'Crowning Lens of the First Spire', subtype: 'command_relic', rarity: 'rare', cost: 4, keywords: [], trigger: 'turn_start', op: 'add_counter', target: 'all_ally_creatures', counter: 'refraction', amount: 1, op2: { operation: 'deal_damage', target: 'enemy_in_lane', amount: 1 }, desc: 'Relic. At the start of your turn, grant all allied creatures 1 Refraction counter and deal 1 damage to an enemy creature.', lore: 'Harvests stray skylight and focuses a warning burn onto the opposing frontline every dawn.', subj: 'Giant spinning crystal lens assembly mounted in a silver astrolabe cradle', sil: 'Monumental circular lens radiating spectral spokes' }
    ],
    environments: [
      { num: '0048', name: 'Quartz-Facet Proving Gallery', subtype: 'dueling_hall', rarity: 'uncommon', cost: 2, keywords: ['ward'], trigger: 'turn_start', op: 'add_counter', target: 'strongest_ally_creature', counter: 'refraction', amount: 1, desc: 'Environment. At the start of your turn, grant your strongest allied creature 1 Refraction counter.', lore: 'Angled crystal walls bounce friendly Aether sigils back onto the duelist’s lead champion.', subj: 'Long crystalline dueling corridor with faceted mirror walls and violet light beams', sil: 'Perspective hall of geometric crystal facets' }
    ]
  },
  {
    prefix: 'NOC',
    faction: 'nocturne',
    mechanic: 'veil',
    archetypes: ['stealth_ambush', 'silence_control', 'crimson_drain'],
    weaknesses: ['area_of_effect_clears', 'wide_token_guards'],
    palette: ['midnight_blue', 'indigo', 'silver', 'restrained_crimson'],
    lighting: 'High-contrast silver moonlight and deep velvet shadows',
    environment: 'The Hollow Masquerade Manor',
    creatures: [
      { num: '0033', name: 'Crescent-Alley Cutpurse', subtype: 'human_rogue', rarity: 'common', role: 'vanguard', cost: 1, attack: 2, health: 1, keywords: ['stealth'], op: 'add_counter', target: 'self', counter: 'veil', amount: 1, trigger: 'on_summon', desc: 'Stealth. On Summon: Gain 1 Veil counter.', lore: 'He lifts a duelist’s spare Aether vial before their boot finishes stepping off the canal gondola.', subj: 'Masked canal rogue crouching on a moonlit parapet with a silver dagger', sil: 'Low crouched silhouette with fluttering shadow cloak' },
      { num: '0034', name: 'Velvet-Court Bodyguard', subtype: 'masked_sentinel', rarity: 'common', role: 'bulwark', cost: 2, attack: 2, health: 4, keywords: ['guard'], op: 'add_counter', target: 'self', counter: 'veil', amount: 1, trigger: 'on_summon', desc: 'Guard. On Summon: Gain 1 Veil counter.', lore: 'Behind his blank porcelain mask, his eyes never leave the hands of his patron’s rivals.', subj: 'Tall bodyguard in midnight-blue velvet greatcoat and silver mask holding a parrying cane-sword', sil: 'Upright aristocratic sentinel in long coat' },
      { num: '0035', name: 'Bridge-of-Sighs Executioner', subtype: 'human_assassin', rarity: 'common', role: 'assassin', cost: 3, attack: 4, health: 2, keywords: ['stealth', 'drain'], op: 'heal', target: 'ally_leader', amount: 1, trigger: 'after_this_attacks', desc: 'Stealth, Drain. After this attacks, restore 1 Vitality to your Leader.', lore: 'Trained by Night-Blade Kestrel to end a duel in the space between two foghorn blasts.', subj: 'Porcelain-masked assassin dropping from a gothic arch with crimson-etched twin blades', sil: 'Vertical descending strike framed by a full moon' },
      { num: '0036', name: 'Belfry Needle-Thrower', subtype: 'human_marksman', rarity: 'common', role: 'marksman', cost: 3, attack: 3, health: 3, keywords: ['reach', 'stealth'], op: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1, trigger: 'after_this_attacks', desc: 'Reach, Stealth. After this attacks, inflict 1 Corrode counter (-1/-1) on an enemy creature in this lane.', lore: 'From the shadows of the Unseen Herald’s belfry, her silver darts carry numbing nightshade.', subj: 'Masked sharpshooter perched inside a gothic bell-window flicking silver throwing needles', sil: 'Framed silhouette inside a pointed gothic arch' },
      { num: '0037', name: 'Clapperless Bell-Cantor', subtype: 'shadow_caster', rarity: 'uncommon', role: 'caster', cost: 3, attack: 2, health: 4, keywords: ['silence'], op: 'silence', target: 'enemy_in_lane', trigger: 'on_summon', desc: 'On Summon: Silence an enemy creature in this lane.', lore: 'Trained by Cipher-Mistress Nyx, he rings a bell that emits no sound—only an abrupt absence of magic.', subj: 'Nocturne caster raising a tarnished silver bell that radiates dark indigo silence ripples', sil: 'Robed figure holding an inverted silver bell' },
      { num: '0038', name: 'Ledger-Keeper of Whispered Debts', subtype: 'human_broker', rarity: 'uncommon', role: 'support', cost: 4, attack: 2, health: 5, keywords: ['drain'], op: 'draw', target: 'ally_leader', amount: 1, op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'veil', amount: 1 }, trigger: 'on_summon', desc: 'Drain. On Summon: Draw 1 card and grant an allied creature 1 Veil counter.', lore: 'Every favor owed in Crescent Alley is recorded in her wax-sealed folio—and called due at the worst moment.', subj: 'Aristocratic broker in silverhalf-mask reading from a glowing crimson-sealed ledger', sil: 'Poised scholar with open ledger and quill' },
      { num: '0039', name: 'Canal-Fog Phantom', subtype: 'shadow_spirit', rarity: 'uncommon', role: 'trickster', cost: 2, attack: 2, health: 3, keywords: ['skirmish', 'stealth'], op: 'add_counter', target: 'self', counter: 'veil', amount: 1, trigger: 'on_move', desc: 'Skirmish, Stealth. When this moves lanes, gain 1 Veil counter.', lore: 'It drifts from lane to lane like harbor mist, solidifying only when an unguarded flank appears.', subj: 'Translucent masked phantom dissolving into midnight fog as it glides across canal stones', sil: 'Wisp-tailed wraith slipping between stone bollards' },
      { num: '0040', name: 'Velvet-Court Blackmailer', subtype: 'human_controller', rarity: 'rare', role: 'controller', cost: 5, attack: 4, health: 5, keywords: ['stealth'], op: 'silence', target: 'enemy_in_lane', op2: { operation: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust' }, trigger: 'on_summon', desc: 'Stealth. On Summon: Silence and Exhaust an enemy creature in this lane.', lore: 'One whispered sentence from Whisper-Broker Malakor’s files is enough to make a veteran captain lower his sword.', subj: 'Masked courtier presenting a sealed black envelope that binds an enemy knight in shadow ribbons', sil: 'Composed aristocrat extending a single sealed letter' },
      { num: '0041', name: 'Duchess Vivienne of the Hollow Masquerade', subtype: 'umbral_sovereign', rarity: 'legendary', role: 'colossus', cost: 7, attack: 6, health: 6, keywords: ['stealth', 'drain'], op: 'grant_keyword', target: 'all_ally_creatures', keyword: 'stealth', op2: { operation: 'deal_damage', target: 'enemy_leader', amount: 3 }, trigger: 'on_summon', desc: 'Stealth, Drain. On Summon: Grant all allied creatures Stealth and deal 3 damage to the enemy Leader.', lore: 'At the stroke of midnight in the Hollow Masquerade, the candles snuff out and every blade in the ballroom belongs to Vivienne.', subj: 'Regal duchess in midnight velvet gown and silver swan-mask descending a grand candlelit staircase', sil: 'Sweeping gothic gown silhouette surrounded by floating masks' }
    ],
    tactics: [
      { num: '0042', name: 'Slip Beneath the Veil', subtype: 'quick', rarity: 'common', cost: 1, keywords: ['stealth'], op: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'stealth', op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'veil', amount: 1 }, desc: 'Quick Tactic. Grant an allied creature Stealth and 1 Veil counter.', lore: 'A pinch of smoked obsidian powder turns a charging warrior into an untargetable shadow.', subj: 'Swirl of indigo velvet smoke wrapping around a duelist as an enemy arrow passes through empty air', sil: 'Ascending spiral of dark smoke and silver sparks' },
      { num: '0043', name: 'Toll of the Clapperless Bell', subtype: 'standard', rarity: 'uncommon', cost: 3, keywords: ['silence'], op: 'silence', target: 'target_enemy_creature', op2: { operation: 'deal_damage', target: 'target_enemy_creature', amount: 2 }, desc: 'Standard Tactic. Silence a target enemy creature and deal 2 damage to it.', lore: 'You feel the vibration in your teeth a split second before your Aether sigils wink out.', subj: 'Giant silver belfry bell radiating a dark indigo shockwave that shatters glowing runes', sil: 'Hanging gothic bell with expanding dark ring' },
      { num: '0044', name: 'Midnight Debt Collection', subtype: 'standard', rarity: 'rare', cost: 4, keywords: ['drain'], op: 'deal_damage', target: 'target_enemy_creature', amount: 4, op2: { operation: 'heal', target: 'ally_leader', amount: 4 }, desc: 'Standard Tactic. Deal 4 damage to an enemy creature and restore 4 Vitality to your Leader.', lore: 'The Unseen Herald always collects principal and interest in the same stroke.', subj: 'Crimson ribbons of stolen vitality flowing from a stricken foe into a silver masquerade chalice', sil: 'S-curve of crimson energy linking blade and chalice' }
    ],
    relics: [
      { num: '0045', name: 'Porcelain Half-Mask', subtype: 'masquerade_relic', rarity: 'common', cost: 1, keywords: [], trigger: 'turn_start', op: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'veil', amount: 1, desc: 'Relic. At the start of your turn, grant an allied creature 1 Veil counter.', lore: 'Worn by Vesper’s couriers along Lantern Row to conceal both identity and intent.', subj: 'Filigreed silver-and-porcelain half-mask resting on midnight velvet', sil: 'Crescent masquerade mask profile' },
      { num: '0046', name: 'Censer of Umbral Silk', subtype: 'stealth_relic', rarity: 'uncommon', cost: 3, keywords: ['stealth'], trigger: 'turn_end', op: 'grant_keyword', target: 'strongest_ally_creature', keyword: 'stealth', desc: 'Relic. At the end of your turn, grant your strongest allied creature Stealth.', lore: 'Burns pressed night-bloom petals whose heavy smoke clings to friendly armor.', subj: 'Swinging sterling-silver thurible trailing thick indigo shadow-smoke', sil: 'Ornate hanging censer with dense smoke plume' },
      { num: '0047', name: 'Black Ledger of the Velvet Court', subtype: 'command_relic', rarity: 'rare', cost: 4, keywords: [], trigger: 'turn_start', op: 'deal_damage', target: 'enemy_leader', amount: 1, op2: { operation: 'heal', target: 'ally_leader', amount: 1 }, desc: 'Relic. At the start of your turn, drain 1 Vitality from the enemy Leader and restore 1 Vitality to your Leader.', lore: 'Bound in shadow-steeped leather and locked with Whisper-Broker Malakor’s personal signet.', subj: 'Open obsidian-bound ledger with glowing crimson ink entries and silver chains', sil: 'Floating chained book radiating crimson script' }
    ],
    environments: [
      { num: '0048', name: 'Moonlit Bridge of Sighs', subtype: 'dueling_span', rarity: 'uncommon', cost: 2, keywords: ['stealth'], trigger: 'turn_start', op: 'add_counter', target: 'strongest_ally_creature', counter: 'veil', amount: 1, desc: 'Environment. At the start of your turn, grant your strongest allied creature 1 Veil counter.', lore: 'High gothic arches cast deep bands of shadow across the canal where assassins slip past unseen.', subj: 'Covered gothic stone bridge spanning a fog-shrouded canal under a giant silver moon', sil: 'Arched canal bridge silhouetted against a full moon' }
    ]
  },
  {
    prefix: 'STR',
    faction: 'starweave',
    mechanic: 'alignment',
    archetypes: ['alignment_combo', 'prediction_control', 'celestial_midrange'],
    weaknesses: ['hyper_aggro_blitz', 'hand_disruption'],
    palette: ['midnight_purple', 'gold', 'celestial_blue'],
    lighting: 'Radiant golden constellation lines against deep cosmic purple',
    environment: 'The Observatory Beyond Dawn',
    creatures: [
      { num: '0033', name: 'Zenith-Steps Acolyte', subtype: 'astral_initiate', rarity: 'common', role: 'vanguard', cost: 1, attack: 1, health: 2, keywords: [], op: 'scry_top_deck', target: 'ally_leader', amount: 1, op2: { operation: 'add_counter', target: 'self', counter: 'alignment', amount: 1 }, trigger: 'on_summon', desc: 'On Summon: Scry 1 and gain 1 Alignment counter.', lore: 'Before taking her stance in the lane, she checks the brass sextant at her belt.', subj: 'Young Starweave initiate holding a glowing brass sextant on a cloud-top stair', sil: 'Poised acolyte with floating star-glyph' },
      { num: '0034', name: 'Meteoric-Iron Sentinel', subtype: 'cosmic_guard', rarity: 'common', role: 'bulwark', cost: 2, attack: 2, health: 4, keywords: ['guard'], op: 'add_counter', target: 'self', counter: 'alignment', amount: 1, trigger: 'on_summon', desc: 'Guard. On Summon: Gain 1 Alignment counter.', lore: 'Forged from meteorites gathered on Comet-Fall Terrace, his shield still hums with orbital gravity.', subj: 'Armored sentinel in purple-and-gold plate planting a star-chart tower shield', sil: 'Broad sentinel with constellation-engraved shield' },
      { num: '0035', name: 'Shooting-Star Lancer', subtype: 'astral_cavalier', rarity: 'common', role: 'assassin', cost: 3, attack: 4, health: 2, keywords: ['swift'], op: 'add_counter', target: 'self', counter: 'alignment', amount: 1, trigger: 'after_this_attacks', desc: 'Swift. After this attacks, gain 1 Alignment counter.', lore: 'He charges down the Star-Bridge at the speed of a falling meteor.', subj: 'Astral lancer diving forward with a spear of condensed golden starlight', sil: 'Diagonal comet-like lance charge' },
      { num: '0036', name: 'Meridian Longbowman', subtype: 'astral_archer', rarity: 'common', role: 'marksman', cost: 3, attack: 2, health: 4, keywords: ['reach'], op: 'scry_top_deck', target: 'ally_leader', amount: 1, trigger: 'after_this_attacks', desc: 'Reach. After this attacks, Scry 1.', lore: 'Trained under Comet-Ranger Orion, each loosed arrow charts the trajectory of the next card in the deck.', subj: 'Archer on an observatory balcony firing a golden constellation arrow into the twilight', sil: 'Tall bowman framed by an armillary ring' },
      { num: '0037', name: 'Orrery Chart-Caller', subtype: 'astromancer', rarity: 'uncommon', role: 'caster', cost: 3, attack: 2, health: 4, keywords: [], op: 'draw', target: 'ally_leader', amount: 1, op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'alignment', amount: 1 }, trigger: 'on_summon', desc: 'On Summon: Draw 1 card and grant an allied creature 1 Alignment counter.', lore: 'Working under Astromancer Celeste Oryn, he rotates the brass planetary rings to bring needed allies to the top of the draw.', subj: 'Astromancer manipulating a floating golden planetary orrery above an open star-atlas', sil: 'Robed scholar surrounded by orbiting brass planets' },
      { num: '0038', name: 'Dawn-Dome Harmonist', subtype: 'celestial_cleric', rarity: 'uncommon', role: 'support', cost: 4, attack: 2, health: 5, keywords: ['resonate'], op: 'add_counter', target: 'all_ally_creatures', counter: 'alignment', amount: 1, op2: { operation: 'heal', target: 'ally_leader', amount: 3 }, trigger: 'on_summon', desc: 'Resonate. On Summon: Grant all allied creatures 1 Alignment counter and restore 3 Vitality to your Leader.', lore: 'Her chime-harp translates the slow music of the nine spheres into soothing golden light.', subj: 'Celestial cleric playing a golden starlight lyre beneath an open observatory dome', sil: 'Radiant support figure with constellation harp' },
      { num: '0039', name: 'Eclipse-Phase Shifter', subtype: 'astral_duelist', rarity: 'uncommon', role: 'trickster', cost: 2, attack: 2, health: 3, keywords: ['skirmish'], op: 'add_counter', target: 'self', counter: 'alignment', amount: 1, trigger: 'on_move', desc: 'Skirmish. When this moves lanes, gain 1 Alignment counter.', lore: 'Stepping from sunlight into lunar shadow, he reappears in the adjacent lane one heartbeat ahead of schedule.', subj: 'Duelist mid-stride between a golden sun disc and a purple lunar eclipse ring', sil: 'Dynamic runner flanked by twin celestial discs' },
      { num: '0040', name: 'Ninth-Hour Arbiter', subtype: 'cosmic_templar', rarity: 'rare', role: 'controller', cost: 5, attack: 4, health: 5, keywords: ['ward', 'resonate'], op: 'grant_keyword', target: 'enemy_in_lane', keyword: 'exhaust', op2: { operation: 'scry_top_deck', target: 'ally_leader', amount: 2 }, trigger: 'on_summon', desc: 'Ward, Resonate. On Summon: Exhaust an enemy creature in this lane and Scry 2.', lore: 'He freezes disorderly foes in temporal starlight until their appointed turn in the ephemeris arrives.', subj: 'Cosmic templar raising a golden hourglass staff that locks an enemy in constellation lines', sil: 'Authoritative armored templar with floating star-clock' },
      { num: '0041', name: 'Aurelia, Oracle of the Ninth Conjunction', subtype: 'astral_sovereign', rarity: 'legendary', role: 'colossus', cost: 8, attack: 6, health: 8, keywords: ['ward', 'resonate', 'awaken'], op: 'add_counter', target: 'all_ally_creatures', counter: 'alignment', amount: 2, op2: { operation: 'draw', target: 'ally_leader', amount: 2 }, trigger: 'on_summon', desc: 'Ward, Resonate, Awaken. On Summon: Grant all allied creatures 2 Alignment counters and draw 2 cards.', lore: 'From the zenith platform of the Observatory Beyond Dawn, Aurelia sees the final turn of the duel before the opening hand is mulliganed.', subj: 'Transcendent star-oracle levitating inside a giant golden armillary sphere against a nebula sky', sil: 'Crowned oracle inside concentric celestial rings' }
    ],
    tactics: [
      { num: '0042', name: 'Astrolabe Gaze', subtype: 'quick', rarity: 'common', cost: 1, keywords: [], op: 'scry_top_deck', target: 'ally_leader', amount: 2, op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'alignment', amount: 1 }, desc: 'Quick Tactic. Scry 2 and grant an allied creature 1 Alignment counter.', lore: 'Measure the angle of the pole star twice, and your next draw will never surprise you.', subj: 'Golden dividers and compass tracing glowing constellation lines across a dark star chart', sil: 'Geometric compass triangle over glowing stars' },
      { num: '0043', name: 'Meteor-Shower Barrage', subtype: 'standard', rarity: 'uncommon', cost: 3, keywords: [], op: 'deal_damage', target: 'target_enemy_creature', amount: 3, op2: { operation: 'scry_top_deck', target: 'ally_leader', amount: 1 }, desc: 'Standard Tactic. Deal 3 damage to an enemy creature and Scry 1.', lore: 'Called down from Comet-Fall Terrace, a cluster of burning star-iron slams into the opposing lane.', subj: 'Three golden-blue meteors streaking down from a purple night sky to impact the arena', sil: 'Three parallel diagonal meteor streaks' },
      { num: '0044', name: 'Grand Conjunction of the Nine Spheres', subtype: 'standard', rarity: 'rare', cost: 5, keywords: ['resonate'], op: 'add_counter', target: 'all_ally_creatures', counter: 'alignment', amount: 2, op2: { operation: 'draw', target: 'ally_leader', amount: 2 }, desc: 'Standard Tactic. Grant all allied creatures 2 Alignment counters and draw 2 cards.', lore: 'Once in four centuries all nine brass planets lock into a single radiant line across the dome.', subj: 'Nine glowing golden planets aligning in a vertical beam of cosmic light above the tabletop', sil: 'Vertical alignment of nine luminous spheres' }
    ],
    relics: [
      { num: '0045', name: 'Brass Planisphere', subtype: 'astrology_relic', rarity: 'common', cost: 1, keywords: [], trigger: 'turn_start', op: 'scry_top_deck', target: 'ally_leader', amount: 1, desc: 'Relic. At the start of your turn, Scry 1.', lore: 'A rotating pocket star-disc used by every initiate entering the High Astral Archive.', subj: 'Engraved golden planisphere disc glowing with blue constellation pinpoints', sil: 'Circular rotating star-dial' },
      { num: '0046', name: 'Pendulum of the Zenith Meridian', subtype: 'alignment_relic', rarity: 'uncommon', cost: 3, keywords: [], trigger: 'turn_end', op: 'add_counter', target: 'strongest_ally_creature', counter: 'alignment', amount: 1, desc: 'Relic. At the end of your turn, grant your strongest allied creature 1 Alignment counter.', lore: 'Traces a slow golden ellipse in the sand, marking the exact moment two lanes enter Resonance.', subj: 'Meteoric-iron pendulum swinging above a sand-table etched with glowing star patterns', sil: 'Suspended conical plumb-bob over a glowing circle' },
      { num: '0047', name: 'Telescope of the Unseen Horizon', subtype: 'command_relic', rarity: 'rare', cost: 4, keywords: [], trigger: 'turn_start', op: 'draw', target: 'ally_leader', amount: 1, op2: { operation: 'add_counter', target: 'ally_creature_in_lane_or_any', counter: 'alignment', amount: 1 }, desc: 'Relic. At the start of your turn, draw 1 card and grant an allied creature 1 Alignment counter.', lore: 'Ground by Orrery-Keeper Zephyr from fallen star-glass, its lens looks three turns ahead.', subj: 'Grand brass-and-crystal refracting telescope mounted on an ornate equatorial tripod', sil: 'Angled astronomical telescope pointing skyward' }
    ],
    environments: [
      { num: '0048', name: 'Comet-Fall Terrace', subtype: 'landing_sanctuary', rarity: 'uncommon', cost: 2, keywords: [], trigger: 'turn_start', op: 'add_counter', target: 'strongest_ally_creature', counter: 'alignment', amount: 1, desc: 'Environment. At the start of your turn, grant your strongest allied creature 1 Alignment counter.', lore: 'High marble terrace strewn with warm meteoric iron that charges friendly armor with starlight.', subj: 'Cloud-top marble terrace dotted with glowing golden meteor craters under an aurora', sil: 'High mountain balcony beneath streaking comets' }
    ]
  },
  {
    prefix: 'GRV',
    faction: 'gravewild',
    mechanic: 'reclaim',
    archetypes: ['reclaim_value', 'sacrifice_swarm', 'decay_control'],
    weaknesses: ['transform_silences', 'fast_pierce_damage'],
    palette: ['bone_white', 'deep_burgundy', 'sickly_green'],
    lighting: 'Spectral green spirit-lantern glow through twilight bog mist',
    environment: 'The Garden of Forgotten Names',
    creatures: [
      { num: '0033', name: 'Cairn-Moss Crawler', subtype: 'ossuary_beast', rarity: 'common', role: 'vanguard', cost: 1, attack: 2, health: 1, keywords: ['rebirth'], op: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1, trigger: 'on_death', desc: 'Rebirth. On Death: Inflict 1 Corrode counter (-1/-1) on an enemy creature in this lane.', lore: 'Even when crushed under a warhammer, its spore-infused carapace reknits from the peat.', subj: 'Skeletal bog-beetle draped in burgundy briars emerging from marsh mud', sil: 'Low horned carapace wreathed in green mist' },
      { num: '0034', name: 'Fossil-Rib Bulwark', subtype: 'risen_construct', rarity: 'common', role: 'bulwark', cost: 2, attack: 1, health: 4, keywords: ['guard', 'rebirth'], op: 'heal', target: 'ally_leader', amount: 1, trigger: 'on_death', desc: 'Guard, Rebirth. On Death: Restore 1 Vitality to your Leader.', lore: 'Carved by Bone-Sculptor Vaelen from leviathan ribs, it stands a second watch as an Echo Remnant.', subj: 'Guardian assembled from giant fossilized ribs and bog-oak holding a memorial stele shield', sil: 'Broad rib-framed guardian with stone tablet shield' },
      { num: '0035', name: 'Briar-Crypt Stalker', subtype: 'spirit_predator', rarity: 'common', role: 'assassin', cost: 3, attack: 4, health: 2, keywords: ['drain'], op: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1, trigger: 'after_this_attacks', desc: 'Drain. After this attacks, inflict 1 Corrode counter (-1/-1) on an enemy creature in this lane.', lore: 'Thorny blood-briars wind through its hollow wolves’ jaws, drinking the strength of anything they bite.', subj: 'Spectral hound of braided bone and burgundy thorns lunging through cemetery fog', sil: 'Leaping skeletal wolf with glowing green eyes' },
      { num: '0036', name: 'Marsh-Gas Slingman', subtype: 'bog_ranger', rarity: 'common', role: 'marksman', cost: 3, attack: 2, health: 4, keywords: ['reach', 'corrode'], op: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1, trigger: 'on_summon', desc: 'Reach. On Summon: Inflict 1 Corrode counter (-1/-1) on an enemy creature in this lane.', lore: 'His clay flasks hold Blight-Alchemist Fenwick’s marsh distillate, pitting steel plate on impact.', subj: 'Hooded marsh ranger hurling a glowing green glasscenser from a fossil causeway', sil: 'Ranged slinger with trailing green vapor arc' },
      { num: '0037', name: 'Elegy-Chanter of the Cairns', subtype: 'spirit_medium', rarity: 'uncommon', role: 'caster', cost: 3, attack: 2, health: 4, keywords: [], op: 'reclaim_from_discard', target: 'ally_leader', amount: 1, trigger: 'on_summon', desc: 'On Summon: Reclaim 1 non-reclaimed card from your discard pile to your hand.', lore: 'Trained by Elegy-Singer Mara, she speaks the forgotten name on a broken card and draws its spirit home.', subj: 'Veiled medium kneeling beside a moss-covered cairn as a glowing card spirit rises into her hands', sil: 'Kneeling medium with ascending emerald spirit ribbon' },
      { num: '0038', name: 'Lantern-Walk Keeper', subtype: 'memorial_cleric', rarity: 'uncommon', role: 'support', cost: 4, attack: 2, health: 5, keywords: ['rebirth'], op: 'heal', target: 'ally_leader', amount: 3, op2: { operation: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 1, health_delta: 2 }, trigger: 'on_summon', desc: 'Rebirth. On Summon: Restore 3 Vitality to your Leader and grant an allied creature +1/+2.', lore: 'Walking the quiet paths behind Lantern Row with Keeper Morwen Vale, his lamp bolsters both living and risen.', subj: 'Solemn lantern-keeper raising a bone-framed green spirit lamp over allied warriors', sil: 'Tall cloaked keeper with high-held hexagonal lantern' },
      { num: '0039', name: 'Peat-Mist Wraith', subtype: 'bog_specter', rarity: 'uncommon', role: 'trickster', cost: 2, attack: 2, health: 3, keywords: ['skirmish', 'rebirth'], op: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1, trigger: 'on_move', desc: 'Skirmish, Rebirth. When this moves lanes, inflict 1 Corrode counter (-1/-1) on an enemy creature in the destination lane.', lore: 'Drifting across the marsh causeways, its chill wake leaves verdigris rust on enemy weapons.', subj: 'Floating spirit draped in tattered burgundy moss gliding sideways over dark bog water', sil: 'Hovering spectral figure trailing green mist' },
      { num: '0040', name: 'Ossuary Tomb-Warden', subtype: 'risen_commander', rarity: 'rare', role: 'controller', cost: 5, attack: 4, health: 5, keywords: ['guard', 'rebirth'], op: 'add_counter', target: 'all_enemy_creatures', counter: 'corrode', amount: 1, trigger: 'on_summon', desc: 'Guard, Rebirth. On Summon: Inflict 1 Corrode counter (-1/-1) on all enemy creatures.', lore: 'When the Sunken Ossuary gates open, a wave of ancient bog-miasma saps the vigor of every trespasser.', subj: 'Armored bone-plate commander striking the ground with a verdigris halberd to release a green decay wave', sil: 'Imposing skeletal knight in burgundy mantle' },
      { num: '0041', name: 'Odrin, Arch-Reclaimer of the First Age', subtype: 'primordial_lich', rarity: 'legendary', role: 'colossus', cost: 8, attack: 7, health: 8, keywords: ['guard', 'rebirth', 'drain'], op: 'reclaim_from_discard', target: 'ally_leader', amount: 2, op2: { operation: 'add_counter', target: 'all_enemy_creatures', counter: 'corrode', amount: 1 }, trigger: 'on_summon', desc: 'Guard, Rebirth, Drain. On Summon: Reclaim 2 cards from your discard pile and inflict 1 Corrode counter (-1/-1) on all enemy creatures.', lore: 'First Keeper of the Forgotten Names; no Echo truly perishes while Odrin’s great censer burns in the catacombs.', subj: 'Monumental bone-crowned arch-medium seated on a walking throne of fossilized leviathan ribs', sil: 'Towering ossuary sovereign surrounded by rising spirit lanterns' }
    ],
    tactics: [
      { num: '0042', name: 'Whisper the Forgotten Name', subtype: 'quick', rarity: 'common', cost: 1, keywords: [], op: 'reclaim_from_discard', target: 'ally_leader', amount: 1, op2: { operation: 'heal', target: 'ally_leader', amount: 1 }, desc: 'Quick Tactic. Reclaim 1 card from your discard pile and restore 1 Vitality to your Leader.', lore: 'Speak the inscription aloud, and the shattered Echo reforms in your palm.', subj: 'Green spirit-fire reassembling broken card fragments above an open palm', sil: 'Rising vortex of glowing fragments forming a card' },
      { num: '0043', name: 'Verdigris Bog-Rot', subtype: 'standard', rarity: 'uncommon', cost: 3, keywords: ['corrode'], op: 'add_counter', target: 'target_enemy_creature', counter: 'corrode', amount: 2, op2: { operation: 'deal_damage', target: 'target_enemy_creature', amount: 2 }, desc: 'Standard Tactic. Inflict 2 Corrode counters (-2/-2) on a target enemy creature and deal 2 damage to it.', lore: 'Centuries of acidic marsh-water reduce tempered steel to flaking green powder in moments.', subj: 'Cloud of acid-green spores dissolving an enemy breastplate and shield', sil: 'Corrosive spore cloud enveloping armor' },
      { num: '0044', name: 'Awakening of the Sunken Ossuary', subtype: 'standard', rarity: 'rare', cost: 5, keywords: ['rebirth'], op: 'reclaim_from_discard', target: 'ally_leader', amount: 2, op2: { operation: 'summon_token', target: 'open_ally_slot', token_name: 'Risen Ossuary Guard', attack: 2, health: 3, keywords: ['guard', 'rebirth'] }, desc: 'Standard Tactic. Reclaim 2 cards from your discard pile and summon a 2/3 Risen Ossuary Guard token with Guard and Rebirth.', lore: 'When the memorial bells toll beneath the marsh, the First-Age vanguard rises to hold the lanes once more.', subj: 'Legions of glowing green spirit-warriors rising from flooded bone catacombs', sil: 'Procession of risen guardians emerging from mist' }
    ],
    relics: [
      { num: '0045', name: 'Briar-Woven Memorial Wreath', subtype: 'memorial_relic', rarity: 'common', cost: 1, keywords: [], trigger: 'turn_end', op: 'heal', target: 'ally_leader', amount: 1, desc: 'Relic. At the end of your turn, restore 1 Vitality to your Leader.', lore: 'Laid upon the cairns by Keeper Morwen’s acolytes, its burgundy blossoms never wilt.', subj: 'Circular wreath of dark burgundy roses and white bone-charms resting on a stone', sil: 'Ornate ring of thorns and blossoms' },
      { num: '0046', name: 'Censer of Corrosive Peat', subtype: 'decay_relic', rarity: 'uncommon', cost: 3, keywords: ['corrode'], trigger: 'turn_start', op: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1, desc: 'Relic. At the start of your turn, inflict 1 Corrode counter (-1/-1) on an enemy creature.', lore: 'Distilled by Blight-Alchemist Fenwick, its fumes steadily eat away opposing frontline armor.', subj: 'Hanging verdigris bronze censer dripping glowing green acid droplets', sil: 'Spiked swamp-iron censer with green vapor' },
      { num: '0047', name: 'Stele of the Unforgotten Vanguard', subtype: 'reclaim_relic', rarity: 'rare', cost: 4, keywords: [], trigger: 'turn_end', op: 'reclaim_from_discard', target: 'ally_leader', amount: 1, desc: 'Relic. At the end of your turn, Reclaim 1 non-reclaimed card from your discard pile to your hand.', lore: 'Engraved with the true names of a thousand fallen Echoes, ensuring none are lost to the dark.', subj: 'Tall moss-draped stone obelisk glowing with hundreds of emerald spirit names', sil: 'Monolithic memorial stele wreathed in spirit lanterns' }
    ],
    environments: [
      { num: '0048', name: 'Fossil-Rib Marsh Causeway', subtype: 'bone_viaduct', rarity: 'uncommon', cost: 2, keywords: ['corrode'], trigger: 'turn_end', op: 'add_counter', target: 'enemy_in_lane', counter: 'corrode', amount: 1, desc: 'Environment. At the end of your turn, inflict 1 Corrode counter (-1/-1) on an enemy creature.', lore: 'Trespassers who step off the fossil ribs sink ankle-deep into armor-eating bog mire.', subj: 'Winding bone-rib bridge arching across a glowing green corrosive swamp', sil: 'Ribbed arch causeway over misty marsh' }
    ]
  }
];

function buildMajorFactionPhase4Cards() {
  const out = [];
  for (const pack of PHASE_4_MAJOR_FACTION_PACKS) {
    for (const c of pack.creatures) {
      const effects = [
        {
          operation: c.op,
          target: c.target,
          ...(c.amount !== undefined ? { amount: c.amount } : {}),
          ...(c.counter ? { counter: c.counter } : {}),
          ...(c.attack_delta !== undefined ? { attack_delta: c.attack_delta, health_delta: c.health_delta } : {}),
          ...(c.keyword ? { keyword: c.keyword } : {}),
          ...(c.token_name ? { token_name: c.token_name, attack: c.attack, health: c.health, keywords: c.keywords } : {}),
          ...(c.direction ? { direction: c.direction } : {})
        }
      ];
      if (c.op2) effects.push(c.op2);

      out.push({
        id: `${pack.prefix}-C-${c.num}`,
        name: c.name,
        type: 'creature',
        subtype: c.subtype,
        faction: pack.faction,
        rarity: c.rarity,
        role: c.role,
        cost: c.cost,
        attack: c.attack,
        health: c.health,
        keywords: c.keywords,
        mechanics: [pack.mechanic],
        description: c.desc,
        abilities: [
          {
            trigger: c.trigger,
            conditions: c.conditions || [],
            effects
          }
        ],
        lore: c.lore,
        archetypes: pack.archetypes,
        weaknesses: pack.weaknesses,
        complexity: c.rarity === 'common' ? 'beginner' : c.rarity === 'uncommon' ? 'intermediate' : 'advanced',
        art: {
          subject: c.subj,
          silhouette: c.sil,
          palette: pack.palette,
          lighting: pack.lighting,
          environment: pack.environment
        }
      });
    }

    for (const t of pack.tactics) {
      const effects = [
        {
          operation: t.op,
          target: t.target,
          ...(t.amount !== undefined ? { amount: t.amount } : {}),
          ...(t.counter ? { counter: t.counter } : {}),
          ...(t.attack_delta !== undefined ? { attack_delta: t.attack_delta, health_delta: t.health_delta } : {}),
          ...(t.keyword ? { keyword: t.keyword } : {}),
          ...(t.direction ? { direction: t.direction } : {})
        }
      ];
      if (t.op2) effects.push(t.op2);

      out.push({
        id: `${pack.prefix}-T-${t.num}`,
        name: t.name,
        type: 'tactic',
        subtype: t.subtype,
        faction: pack.faction,
        rarity: t.rarity,
        role: null,
        cost: t.cost,
        attack: 0,
        health: 0,
        keywords: t.keywords,
        mechanics: [pack.mechanic],
        description: t.desc,
        abilities: [
          {
            trigger: 'on_play',
            conditions: [],
            effects
          }
        ],
        lore: t.lore,
        archetypes: pack.archetypes,
        weaknesses: ['ward', 'counter_timing'],
        complexity: t.rarity === 'common' ? 'beginner' : 'intermediate',
        art: {
          subject: t.subj,
          silhouette: t.sil,
          palette: pack.palette,
          lighting: pack.lighting,
          environment: pack.environment
        }
      });
    }

    for (const r of pack.relics) {
      const effects = [
        {
          operation: r.op,
          target: r.target,
          ...(r.amount !== undefined ? { amount: r.amount } : {}),
          ...(r.counter ? { counter: r.counter } : {}),
          ...(r.attack_delta !== undefined ? { attack_delta: r.attack_delta, health_delta: r.health_delta } : {}),
          ...(r.keyword ? { keyword: r.keyword } : {})
        }
      ];
      if (r.op2) effects.push(r.op2);

      out.push({
        id: `${pack.prefix}-R-${r.num}`,
        name: r.name,
        type: 'relic',
        subtype: r.subtype,
        faction: pack.faction,
        rarity: r.rarity,
        role: null,
        cost: r.cost,
        attack: 0,
        health: 0,
        keywords: r.keywords,
        mechanics: [pack.mechanic],
        description: r.desc,
        abilities: [
          {
            trigger: r.trigger,
            conditions: [],
            effects
          }
        ],
        lore: r.lore,
        archetypes: pack.archetypes,
        weaknesses: ['relic_slot_limit'],
        complexity: 'intermediate',
        art: {
          subject: r.subj,
          silhouette: r.sil,
          palette: pack.palette,
          lighting: pack.lighting,
          environment: pack.environment
        }
      });
    }

    for (const e of pack.environments) {
      const effects = [
        {
          operation: e.op,
          target: e.target,
          ...(e.amount !== undefined ? { amount: e.amount } : {}),
          ...(e.counter ? { counter: e.counter } : {}),
          ...(e.attack_delta !== undefined ? { attack_delta: e.attack_delta, health_delta: e.health_delta } : {})
        }
      ];
      if (e.op2) effects.push(e.op2);

      out.push({
        id: `${pack.prefix}-E-${e.num}`,
        name: e.name,
        type: 'environment',
        subtype: e.subtype,
        faction: pack.faction,
        rarity: e.rarity,
        role: null,
        cost: e.cost,
        attack: 0,
        health: 0,
        keywords: e.keywords,
        mechanics: [pack.mechanic],
        description: e.desc,
        abilities: [
          {
            trigger: e.trigger,
            conditions: [],
            effects
          }
        ],
        lore: e.lore,
        archetypes: pack.archetypes,
        weaknesses: ['environment_replacement'],
        complexity: 'intermediate',
        art: {
          subject: e.subj,
          silhouette: e.sil,
          palette: pack.palette,
          lighting: pack.lighting,
          environment: e.name
        }
      });
    }
  }
  return out;
}

// 32 New Neutral Accord Cards (0065..0096: 18 Creatures, 8 Tactics, 4 Relics, 2 Environments)
const PHASE_4_NEUTRAL_CARDS = [
  // 18 Creatures (0065..0082)
  { num: '0065', name: 'Harbor Customs Inspector', type: 'creature', subtype: 'human_official', rarity: 'common', role: 'vanguard', cost: 1, attack: 1, health: 3, keywords: ['guard'], trigger: 'on_summon', op: 'scry_top_deck', target: 'ally_leader', amount: 1, desc: 'Guard. On Summon: Scry 1.', lore: 'Nothing crosses Beacon Pier without his brass stamp and a quick peek at the manifest.', subj: 'Stern harbor customs officer holding a brass manifest clipboard and lantern on Beacon Pier', sil: 'Upright uniformed inspector with lantern' },
  { num: '0066', name: 'Lumenport Dock-Brawler', type: 'creature', subtype: 'human_bruiser', rarity: 'common', role: 'vanguard', cost: 2, attack: 3, health: 2, keywords: ['swift'], trigger: 'after_this_attacks', op: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 0, desc: 'Swift. After this attacks, gain +1 Attack.', lore: 'He learned lane control loading hundred-pound Aether crates onto rolling cargo barges.', subj: 'Muscular dockworker swinging a heavy bronze cargo hook on the harbor wharf', sil: 'Broad-shouldered brawler in mid-swing' },
  { num: '0067', name: 'Lantern-Row Nightwatch', type: 'creature', subtype: 'human_guard', rarity: 'common', role: 'bulwark', cost: 2, attack: 1, health: 4, keywords: ['guard', 'shield'], trigger: 'on_summon', op: 'heal', target: 'ally_leader', amount: 1, desc: 'Guard, Shield (1). On Summon: Restore 1 Vitality to your Leader.', lore: 'Patrolling the canal bridges under Toma Wick’s direction, his halberd keeps midnight duels civil.', subj: 'City watchman in bronze breastplate holding a lantern-halberd on a canal bridge', sil: 'Sturdy watchman with glowing polearm lantern' },
  { num: '0068', name: 'Caravan Pike-Sergeant', type: 'creature', subtype: 'human_veteran', rarity: 'common', role: 'bulwark', cost: 3, attack: 2, health: 5, keywords: ['guard', 'reach'], trigger: 'on_summon', op: 'modify_stats', target: 'ally_creature_in_lane_or_any', attack_delta: 0, health_delta: 1, desc: 'Guard, Reach. On Summon: Grant an allied creature +0/+1.', lore: 'Ten years on the Free Guild Highroad taught her how to brace against both bandits and wyverns.', subj: 'Veteran sergeant bracing a long steel pike beside an armored trade wagon', sil: 'Planted pikeman with long diagonal spear' },
  { num: '0069', name: 'Rooftop Courier-Blade', type: 'creature', subtype: 'human_runner', rarity: 'common', role: 'assassin', cost: 2, attack: 3, health: 1, keywords: ['swift', 'skirmish'], trigger: 'on_move', op: 'deal_damage', target: 'enemy_leader', amount: 1, desc: 'Swift, Skirmish. When this moves lanes, deal 1 damage to the enemy Leader.', lore: 'Trained by Fenna Swiftfoot, she vaults across slate eaves faster than street guards can turn a corner.', subj: 'Agile courier leaping between Lumenport slate rooftops with a short sword', sil: 'Airborne runner silhouetted against clocktowers' },
  { num: '0070', name: 'Back-Alley Duelist', type: 'creature', subtype: 'human_fencer', rarity: 'common', role: 'assassin', cost: 3, attack: 4, health: 2, keywords: ['pierce'], trigger: 'on_summon', op: 'deal_damage', target: 'enemy_in_lane', amount: 1, desc: 'Pierce. On Summon: Deal 1 damage to an enemy creature in this lane.', lore: 'Unregistered with the Tournament Hall, he plays for hard Crowns behind the market stalls.', subj: 'Unruly fencer in weathered leather lunging with a heavy basket-hilted rapier', sil: 'Low aggressive fencing lunge' },
  { num: '0071', name: 'Beacon-Tower Spotter', type: 'creature', subtype: 'human_marksman', rarity: 'common', role: 'marksman', cost: 2, attack: 2, health: 3, keywords: ['reach'], trigger: 'on_summon', op: 'scry_top_deck', target: 'ally_leader', amount: 1, desc: 'Reach. On Summon: Scry 1.', lore: 'Stationed atop the Arrival Square lighthouse, her brass telescope spots incoming fleets three leagues out.', subj: 'Lighthouse spotter with a long brass spyglass and slung repeater crossbow', sil: 'Lookout leaning against a lighthouse railing' },
  { num: '0072', name: 'Highroad Crossbowman', type: 'creature', subtype: 'human_mercenary', rarity: 'common', role: 'marksman', cost: 4, attack: 3, health: 4, keywords: ['reach', 'pierce'], trigger: 'on_summon', op: 'deal_damage', target: 'enemy_in_lane', amount: 1, desc: 'Reach, Pierce. On Summon: Deal 1 damage to an enemy creature in this lane.', lore: 'His steel-prod arbalest punches cleanly through caravan raiders’ bucklers.', subj: 'Mercenary crossbowman cranking a heavy steel arbalest behind a pavise shield', sil: 'Archer behind a tall planted pavise' },
  { num: '0073', name: 'Accord Lexicon-Scribe', type: 'creature', subtype: 'human_scholar', rarity: 'uncommon', role: 'caster', cost: 2, attack: 1, health: 3, keywords: [], trigger: 'on_summon', op: 'draw', target: 'ally_leader', amount: 1, desc: 'On Summon: Draw 1 card.', lore: 'Translates ancient Echo inscriptions from all eight regions into standard Accord notation.', subj: 'Institute scribe writing glowing blue runes onto a floating parchment scroll', sil: 'Seated scholar surrounded by floating scrolls' },
  { num: '0074', name: 'Leyline Surveyor', type: 'creature', subtype: 'human_arcanist', rarity: 'uncommon', role: 'caster', cost: 3, attack: 2, health: 4, keywords: ['resonate'], trigger: 'on_summon', op: 'gain_aether', target: 'ally_leader', amount: 1, desc: 'Resonate. On Summon: Gain 1 temporary Aether this turn.', lore: 'Her bronze theodolite measures the exact Aether pressure flowing beneath Duelist Plaza.', subj: 'Arcanist adjusting a glowing crystal surveyor’s tripod on a cobblestone plaza', sil: 'Surveyor beside a three-legged optical instrument' },
  { num: '0075', name: 'Harbor-Café Sommelier', type: 'creature', subtype: 'human_artisan', rarity: 'common', role: 'support', cost: 2, attack: 1, health: 4, keywords: [], trigger: 'on_summon', op: 'heal', target: 'ally_creature_in_lane_or_any', amount: 2, desc: 'On Summon: Restore 2 Health to an allied creature.', lore: 'Serving Mira Solis’s signature spiced Aether-roast, he puts fresh vigor into battered vanguards.', subj: 'Cheerful café steward pouring steaming golden tea from a copper samovar', sil: 'Steward carrying a tray with a glowing samovar' },
  { num: '0076', name: 'Plaza Medic-Banneret', type: 'creature', subtype: 'human_medic', rarity: 'uncommon', role: 'support', cost: 4, attack: 2, health: 5, keywords: ['guard'], trigger: 'on_summon', op: 'heal', target: 'ally_leader', amount: 3, op2: { operation: 'heal', target: 'all_ally_creatures', amount: 1 }, desc: 'Guard. On Summon: Restore 3 Vitality to your Leader and 1 Health to all allied creatures.', lore: 'Attends every sanctioned qualifier in Duelist Plaza with a kit of Verdant salves and Choir splints.', subj: 'Accord medic raising a white-and-gold caduceus banner over a dueling table', sil: 'Armored medic with tall fluttering banner' },
  { num: '0077', name: 'Market-Stall Acrobat', type: 'creature', subtype: 'human_performer', rarity: 'common', role: 'trickster', cost: 1, attack: 1, health: 2, keywords: ['skirmish'], trigger: 'on_move', op: 'modify_stats', target: 'self', attack_delta: 1, health_delta: 0, desc: 'Skirmish. When this moves lanes, gain +1 Attack.', lore: 'Tumbling between canvas awnings in the Central Card Market, he draws a crowd and strikes from behind.', subj: 'Street acrobat vaulting over a colorful market stall canopy with twin batons', sil: 'Handstand vault silhouette over market canopies' },
  { num: '0078', name: 'Gondola Pole-Vaulter', type: 'creature', subtype: 'human_skirmisher', rarity: 'uncommon', role: 'trickster', cost: 3, attack: 3, health: 3, keywords: ['skirmish', 'reach'], trigger: 'on_move', op: 'heal', target: 'self', amount: 1, desc: 'Skirmish, Reach. When this moves lanes, restore 1 Health to this creature.', lore: 'Using a twelve-foot ironwood gondola pole, he vaults cleanly from the Left Lane to the Center.', subj: 'Canal boatman pole-vaulting across a narrow stone waterway with a reinforced staff', sil: 'High vaulting figure on a long vertical pole' },
  { num: '0079', name: 'Aether-Post Herald', type: 'creature', subtype: 'human_handler', rarity: 'uncommon', role: 'support', cost: 4, attack: 3, health: 4, keywords: [], trigger: 'on_summon', op: 'draw', target: 'ally_leader', amount: 1, desc: 'On Summon: Draw 1 card from your deck.', lore: 'His trained brass-winged hawks carry match results from the Tournament Hall across the continent.', subj: 'Falconer on a high clocktower loft releasing a flock of brass-feathered hawks', sil: 'Handler with outstretched arm and rising birds' },
  { num: '0080', name: 'Mercenary Captain of the Highroad', type: 'creature', subtype: 'human_commander', rarity: 'rare', role: 'summoner', cost: 5, attack: 3, health: 5, keywords: ['guard'], trigger: 'on_summon', op: 'summon_token', target: 'open_ally_slot', token_name: 'Free Guild Pikeman', attack: 2, health: 2, keywords: ['guard'], desc: 'Guard. On Summon: Summon a 2/2 Free Guild Pikeman token with Guard.', lore: 'When his horn blows along the Caravan Highroad, a second file of hired pikes steps up to lock the lane.', subj: 'Seasoned mercenary captain in bronze-and-fur armor rallying pikemen around a guild standard', sil: 'Commander and banner flanked by raised pikes' },
  { num: '0081', name: 'Tournament Hall Arbiter', type: 'creature', subtype: 'human_judge', rarity: 'rare', role: 'controller', cost: 4, attack: 3, health: 5, keywords: ['guard', 'ward'], trigger: 'on_summon', op: 'silence', target: 'enemy_in_lane', desc: 'Guard, Ward. On Summon: Silence an enemy creature in this lane.', lore: 'Deputized by Grand Marshal Corin Thorne to penalize illegal enchantments on the championship floor.', subj: 'Robed tournament referee striking a bronze gavel that projects a golden rule-seal', sil: 'Symmetrical judge holding a glowing gavel and scroll' },
  { num: '0082', name: 'Archon Valen, Chancellor of the Accord', type: 'creature', subtype: 'human_paragon', rarity: 'legendary', role: 'colossus', cost: 7, attack: 6, health: 7, keywords: ['guard', 'ward', 'resonate'], trigger: 'on_summon', op: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 1, op2: { operation: 'draw', target: 'ally_leader', amount: 2 }, desc: 'Guard, Ward, Resonate. On Summon: Grant all allied creatures +1/+1 and draw 2 cards.', lore: 'Keeper of the First Convergence Charter; when Archon Valen takes the field, all eight factions remember their oath.', subj: 'Venerable chancellor in bronze-and-sapphire ceremonial armor holding the glowing Accord Charter staff', sil: 'Majestic statesman-warrior under an eight-spoked halo' },

  // 8 Tactics (0083..0090)
  { num: '0083', name: 'Harbor Signal Flare', type: 'tactic', subtype: 'quick', rarity: 'common', cost: 1, keywords: [], op: 'draw', target: 'ally_leader', amount: 1, op2: { operation: 'heal', target: 'ally_leader', amount: 1 }, desc: 'Quick Tactic. Draw 1 card and restore 1 Vitality to your Leader.', lore: 'A single sapphire flare over Arrival Square brings immediate harbour watch reinforcements.', subj: 'Brilliant blue flare bursting above the harbor lighthouse at dusk', sil: 'Ascending light trail and starburst over harbor roofs' },
  { num: '0084', name: 'Caravan Shield-Wall', type: 'tactic', subtype: 'quick', rarity: 'common', cost: 2, keywords: ['guard', 'shield'], op: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'guard', op2: { operation: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'shield' }, desc: 'Quick Tactic. Grant an allied creature Guard and Shield (1).', lore: 'Lock wagon wheels and raise oak bucklers—nothing gets past the lead team.', subj: 'Mercenary guards locking iron-rimmed shields in front of a treasure wagon', sil: 'Semicircular wall of overlapping round shields' },
  { num: '0085', name: 'Pincer Formation', type: 'tactic', subtype: 'quick', rarity: 'common', cost: 2, keywords: ['guard'], op: 'grant_keyword', target: 'all_ally_creatures', keyword: 'guard', desc: 'Quick Tactic. Grant all allied creatures Guard until end of turn.', lore: 'Tactical Instructor Hale’s first rule: never fight a Bulwark head-on when the adjacent lane stands open.', subj: 'Duelist piece sliding diagonally across a glowing three-lane tactical slate', sil: 'Curved golden arrow bypassing a blocked lane' },
  { num: '0086', name: 'Appraiser’s Audit', type: 'tactic', subtype: 'standard', rarity: 'uncommon', cost: 2, keywords: [], op: 'scry_top_deck', target: 'ally_leader', amount: 2, op2: { operation: 'draw', target: 'ally_leader', amount: 1 }, desc: 'Standard Tactic. Scry 2 and draw 1 card.', lore: 'Bramwell Coin-Counter never buys a pack without weighing the top three cards on his jeweler’s scale.', subj: 'Merchant appraiser inspecting three glowing Echo cards through a brass magnifying glass', sil: 'Balanced brass scales holding luminous cards' },
  { num: '0087', name: 'Sanctioned Disqualification', type: 'tactic', subtype: 'standard', rarity: 'uncommon', cost: 3, keywords: ['silence', 'exhaust'], op: 'silence', target: 'target_enemy_creature', op2: { operation: 'grant_keyword', target: 'target_enemy_creature', keyword: 'exhaust' }, desc: 'Standard Tactic. Silence and Exhaust a target enemy creature.', lore: 'A single blow of the Marshal’s whistle suspends an unruly combatant for the remainder of the round.', subj: 'Golden referee seal clamping shut around a rampaging beast on the arena floor', sil: 'Octagonal golden seal binding a silhouette' },
  { num: '0088', name: 'Resonance Surge of the Plaza', type: 'tactic', subtype: 'standard', rarity: 'uncommon', cost: 3, keywords: [], op: 'gain_aether', target: 'ally_leader', amount: 2, op2: { operation: 'modify_stats', target: 'all_ally_creatures', attack_delta: 1, health_delta: 0 }, desc: 'Standard Tactic. Gain 2 temporary Aether this turn and grant all allied creatures +1 Attack.', lore: 'When two lanes lock into Resonance, the slate table itself hums with surplus power.', subj: 'Octagonal duel table erupting with twin beams of sapphire-and-gold leyline energy', sil: 'Twin vertical leyline columns rising from a table' },
  { num: '0089', name: 'Heavy Ballista Bolt', type: 'tactic', subtype: 'standard', rarity: 'common', cost: 4, keywords: ['pierce'], op: 'deal_damage', target: 'target_enemy_creature', amount: 5, desc: 'Standard Tactic. Pierce. Deal 5 damage to a target enemy creature.', lore: 'Mounted on every Harbor Watch cutter to deter overly ambitious sea monsters.', subj: 'Iron-tipped ballista bolt punching through a wooden target in a shower of splinters', sil: 'Heavy horizontal bolt with kinetic shockwave' },
  { num: '0090', name: 'Decree of the Eight-Faction Council', type: 'tactic', subtype: 'standard', rarity: 'rare', cost: 5, keywords: [], op: 'heal', target: 'ally_leader', amount: 4, op2: { operation: 'draw', target: 'ally_leader', amount: 2 }, desc: 'Standard Tactic. Restore 4 Vitality to your Leader and draw 2 cards.', lore: 'Signed beneath the great dome of the Accord Institute, reaffirming the peace of Lumenport.', subj: 'Eight faction banners hanging around a glowing golden charter scroll in a marble rotunda', sil: 'Circle of eight banners around an illuminated scroll' },

  // 4 Relics (0091..0094)
  { num: '0091', name: 'Courier’s Wayfinder Boots', type: 'relic', subtype: 'gear_relic', rarity: 'common', cost: 1, keywords: ['skirmish'], trigger: 'on_play', op: 'grant_keyword', target: 'ally_creature_in_lane_or_any', keyword: 'skirmish', desc: 'Relic. On Play: Grant an allied creature Skirmish.', lore: 'Cobbled with spring-leather soles for Fenna Swiftfoot’s district runners.', subj: 'Pair of winged bronze-buckled leather boots resting on a cobblestone step', sil: 'Sturdy traveler boots with glowing heel runes' },
  { num: '0092', name: 'Merchant’s Crown-Strongbox', type: 'relic', subtype: 'economy_relic', rarity: 'uncommon', cost: 3, keywords: [], trigger: 'turn_end', op: 'draw', target: 'ally_leader', amount: 1, desc: 'Relic. At the end of your turn, draw 1 card.', lore: 'Triple-locked iron chest from the Central Card Market whose ward-sigils steady its owner’s nerves.', subj: 'Riveted bronze-and-iron strongbox glowing with sapphire lock runes', sil: 'Heavy banded treasure chest on a velvet cushion' },
  { num: '0093', name: 'Tactical Lane-Telemetry Slate', type: 'relic', subtype: 'training_relic', rarity: 'uncommon', cost: 3, keywords: [], trigger: 'turn_start', op: 'scry_top_deck', target: 'ally_leader', amount: 1, op2: { operation: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 0, health_delta: 1 }, desc: 'Relic. At the start of your turn, Scry 1 and grant your strongest allied creature +0/+1.', lore: 'Designed by Tactical Instructor Garrick Hale to display real-time Front-to-Rear protection odds.', subj: 'Brass-framed slate tablet projecting a glowing three-lane grid hologram', sil: 'Angled tactical tablet with holographic lane grid' },
  { num: '0094', name: 'Championship Trophy of Lumenport', type: 'relic', subtype: 'prestige_relic', rarity: 'rare', cost: 4, keywords: [], trigger: 'turn_end', op: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 1, desc: 'Relic. At the end of your turn, grant your strongest allied creature +1/+1.', lore: 'Presented by Grand Marshal Corin Thorne to the victor of the seasonal Grand Tournament circuit.', subj: 'Gleaming golden cup cradling a levitating prismatic Aether crystal', sil: 'Two-handled championship chalice with glowing gem' },

  // 2 Environments (0095..0096)
  { num: '0095', name: 'Central Card Market Colonnade', type: 'environment', subtype: 'trade_bazaar', rarity: 'uncommon', cost: 2, keywords: [], trigger: 'turn_start', op: 'scry_top_deck', target: 'ally_leader', amount: 1, desc: 'Environment. At the start of your turn, Scry 1.', lore: 'Under the colorful market canopies, a keen-eyed duelist can always spot the exact card they need next.', subj: 'Sunlit stone colonnade lined with bustling card merchant stalls and hanging faction banners', sil: 'Arched bazaar walkway with colourful awnings' },
  { num: '0096', name: 'Lumenport Grand Tournament Hall', type: 'environment', subtype: 'championship_coliseum', rarity: 'rare', cost: 3, keywords: [], trigger: 'turn_end', op: 'modify_stats', target: 'strongest_ally_creature', attack_delta: 1, health_delta: 1, desc: 'Environment. At the end of your turn, grant your strongest allied creature +1/+1.', lore: 'Roaring crowds in the vaulted coliseum tiers inspire lead champions to legendary feats.', subj: 'Monumental circular coliseum arena with an octagonal slate duel table at center stage', sil: 'Grand coliseum interior lit by skylights and banners' }
];

function buildNeutralPhase4Cards() {
  return PHASE_4_NEUTRAL_CARDS.map((c) => {
    const typeCode = c.type === 'creature' ? 'C' : c.type === 'tactic' ? 'T' : c.type === 'relic' ? 'R' : 'E';
    const effects = [
      {
        operation: c.op,
        target: c.target,
        ...(c.amount !== undefined ? { amount: c.amount } : {}),
        ...(c.counter ? { counter: c.counter } : {}),
        ...(c.attack_delta !== undefined ? { attack_delta: c.attack_delta, health_delta: c.health_delta } : {}),
        ...(c.keyword ? { keyword: c.keyword } : {}),
        ...(c.token_name ? { token_name: c.token_name, attack: c.attack, health: c.health, keywords: c.keywords } : {}),
        ...(c.direction ? { direction: c.direction } : {})
      }
    ];
    if (c.op2) effects.push(c.op2);

    return {
      id: `NEU-${typeCode}-${c.num}`,
      name: c.name,
      type: c.type,
      subtype: c.subtype,
      faction: 'neutral',
      rarity: c.rarity,
      role: c.type === 'creature' ? c.role : null,
      cost: c.cost,
      attack: c.type === 'creature' ? c.attack : 0,
      health: c.type === 'creature' ? c.health : 0,
      keywords: c.keywords,
      mechanics: [],
      description: c.desc,
      abilities: [
        {
          trigger: c.trigger || 'on_play',
          conditions: [],
          effects
        }
      ],
      lore: c.lore,
      archetypes: ['neutral_curve', 'two_faction_bridge'],
      weaknesses: ['specialized_faction_synergy'],
      complexity: c.rarity === 'common' ? 'beginner' : 'intermediate',
      art: {
        subject: c.subj,
        silhouette: c.sil,
        palette: ['warm_bronze', 'steel_gray', 'warm_gold', 'sapphire_blue'],
        lighting: 'Clear coastal daylight and warm harbor lantern glow',
        environment: 'Free City of Lumenport'
      }
    };
  });
}

export const EXPANSION_480_CARDS = [
  ...buildMajorFactionPhase4Cards(),
  ...buildNeutralPhase4Cards()
];
