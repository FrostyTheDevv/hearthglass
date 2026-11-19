/**
 * Hearthglass — Lumenport Districts, Interiors, 16 Named NPCs & Quests Expansion (Sections 11, 12, 13)
 */

export const LUMENPORT_DISTRICTS = [
  {
    id: 'lumenport_arrival_square',
    name: 'Arrival Square & Old Harbor',
    description: 'Bustling coastal stone plaza where ferry passengers disembark beneath the Accord beacon tower.',
    ambient_theme: 'harbor_breeze_and_gulls',
    connected_districts: ['lumenport_central_card_market', 'lumenport_duelist_plaza'],
    interiors: ['interior_harbor_cafe'],
    fast_travel_unlocked: true,
    coordinates: { x: 260, y: 540 }
  },
  {
    id: 'lumenport_central_card_market',
    name: 'Central Card Market',
    description: 'Canopied bazaar of Echo collectors, pack merchants, and Aether-Dynamo artisans.',
    ambient_theme: 'market_chatter_and_chimes',
    connected_districts: ['lumenport_arrival_square', 'lumenport_duelist_plaza', 'lumenport_residential_district'],
    interiors: ['interior_card_shop', 'interior_artificer_workshop'],
    fast_travel_unlocked: true,
    coordinates: { x: 540, y: 270 }
  },
  {
    id: 'lumenport_duelist_plaza',
    name: 'Duelist Plaza',
    description: 'Open-air amphitheater arranged around octagonal slate Convergence tables and lane banners.',
    ambient_theme: 'aether_hum_and_cheering',
    connected_districts: [
      'lumenport_arrival_square',
      'lumenport_central_card_market',
      'lumenport_grand_tournament_hall',
      'lumenport_accord_institute'
    ],
    interiors: ['interior_training_facility'],
    fast_travel_unlocked: true,
    coordinates: { x: 930, y: 400 }
  },
  {
    id: 'lumenport_residential_district',
    name: 'Lantern Row Residential District',
    description: 'Tiered canal-side townhouses, duelist boarding lodges, and quiet evening courtyards.',
    ambient_theme: 'canal_water_and_lute',
    connected_districts: ['lumenport_central_card_market', 'lumenport_accord_institute'],
    interiors: ['interior_player_apartment'],
    fast_travel_unlocked: true,
    coordinates: { x: 380, y: 170 }
  },
  {
    id: 'lumenport_grand_tournament_hall',
    name: 'Grand Tournament Hall',
    description: 'Monumental vaulted coliseum hosting regional circuits, 2v2 Tag brackets, and seasonal trials.',
    ambient_theme: 'brass_fanfare_and_echoes',
    connected_districts: ['lumenport_duelist_plaza', 'lumenport_accord_institute'],
    interiors: ['interior_tournament_registration'],
    fast_travel_unlocked: true,
    coordinates: { x: 1180, y: 240 }
  },
  {
    id: 'lumenport_accord_institute',
    name: 'The Accord Institute & Observatory',
    description: 'High spire complex dedicated to Echo resonance research, prismatic optics, and celestial charting.',
    ambient_theme: 'orrery_clockwork_and_wind',
    connected_districts: [
      'lumenport_duelist_plaza',
      'lumenport_residential_district',
      'lumenport_grand_tournament_hall'
    ],
    interiors: ['interior_artificer_workshop', 'interior_training_facility'],
    fast_travel_unlocked: true,
    coordinates: { x: 960, y: 150 }
  }
];

export const LUMENPORT_INTERIORS = [
  {
    id: 'interior_card_shop',
    name: 'The Resonance Emporium (Card Shop)',
    district_id: 'lumenport_central_card_market',
    service_type: 'card_shop_and_crafting',
    proprietor_npc_id: 'npc_master_vance',
    description: 'Polished brass display counters stocked with themed faction packs, singles, and an Echo Dust condenser.',
    interactables: ['pack_counter', 'echo_dust_condenser', 'rare_singles_case', 'shop_duel_table']
  },
  {
    id: 'interior_harbor_cafe',
    name: 'The Anchor & Aether Café',
    district_id: 'lumenport_arrival_square',
    service_type: 'social_and_companion_hub',
    proprietor_npc_id: 'npc_mira_solis',
    description: 'Warm lantern-lit harbor café where off-duty duelists trade deck lists, rumors, and tag-battle invitations.',
    interactables: ['espresso_bar', 'companion_notice_board', 'casual_corner_table']
  },
  {
    id: 'interior_player_apartment',
    name: 'Duelist Loft Apartment',
    district_id: 'lumenport_residential_district',
    service_type: 'player_housing_and_deck_study',
    proprietor_npc_id: 'npc_toma_wick',
    description: 'Your personal canal-view quarters featuring a deck-tuning desk, trophy shelf, and card display frames.',
    interactables: ['personal_deck_desk', 'trophy_display_shelf', 'showcase_card_easel', 'rest_bed']
  },
  {
    id: 'interior_tournament_registration',
    name: 'Tournament Registration Rotunda',
    district_id: 'lumenport_grand_tournament_hall',
    service_type: 'ranked_and_tag_matchmaking',
    proprietor_npc_id: 'npc_marshal_corin',
    description: 'Marble rotunda with live bracket boards for 1v1 Ranked circuits and 2v2 Tag Convergence lobbies.',
    interactables: ['ranked_1v1_desk', 'tag_2v2_lobby_board', 'hall_of_champions_ledger']
  },
  {
    id: 'interior_training_facility',
    name: 'Accord Tactical Training Hall',
    district_id: 'lumenport_duelist_plaza',
    service_type: 'practice_and_puzzle_trials',
    proprietor_npc_id: 'npc_instructor_hale',
    description: 'Instrumented Convergence tables equipped with lane-telemetry overlays and AI practice sparring constructs.',
    interactables: ['lane_positioning_simulator', 'deck_test_dummy', 'mechanic_codex_lectern']
  },
  {
    id: 'interior_artificer_workshop',
    name: 'Choir & Prism Calibration Workshop',
    district_id: 'lumenport_central_card_market',
    service_type: 'relic_tuning_and_art_archive',
    proprietor_npc_id: 'npc_eluned_glass',
    description: 'Optical lenses and clockwork presses used to stabilize newly discovered Echo illustrations and card frames.',
    interactables: ['prismatic_imprinter', 'relic_calibration_bench', 'echo_archive_vault']
  }
];

export const LUMENPORT_NPCS = [
  // Preserved original 4 NPCs (upgraded with richer relationship tiers, appearance, background, and companion AI profile)
  {
    id: 'npc_lyra_vane',
    name: 'Lyra Vane',
    title: 'Glassborne Archivist & Rival Duelist',
    category: 'major_story_character',
    faction_affinity: 'glassborne',
    secondary_faction: 'starweave',
    duel_difficulty: 'skilled',
    deck_id: 'deck_glass_star_prism',
    home_location: 'lumenport_accord_institute',
    interior_id: 'interior_artificer_workshop',
    initial_relationship: 25,
    can_recruit_companion: true,
    companion_ai_profile: 'defensive_ward_counterplay',
    appearance: 'Slender archivist in silver-trimmed violet vestments wearing a floating prismatic monocle.',
    background: 'Graduated top of her class at the Accord Institute; investigates anomalous Echo fractures around Lumenport.',
    personality: ['analytical', 'curious', 'honorable'],
    schedule: [
      { time: '07:00', location: 'lumenport_residential_district', activity: 'morning_study' },
      { time: '09:00', location: 'lumenport_accord_institute', activity: 'echo_research' },
      { time: '13:00', location: 'lumenport_duelist_plaza', activity: 'available_for_duel' },
      { time: '18:00', location: 'interior_harbor_cafe', activity: 'socializing' },
      { time: '21:00', location: 'lumenport_accord_institute', activity: 'star_charting' }
    ],
    relationship_milestones: {
      acquaintance: 20,
      friendly: 40,
      trusted: 65,
      bonded: 85
    },
    rewards: { crowns: 120, echo_dust: 35, relationship_gain: 8, bonus_card_id: 'GLS-C-0004' },
    side_quest_id: 'quest_side_prism_calibration',
    dialogue: {
      greeting: 'Your Echo Card resonance is unusually steady for a newcomer to Lumenport. Care to test your positioning at the Plaza table?',
      friendly: 'I’ve been logging your lane transitions. If we pair my Glassborne Wards with your frontline, no 2v2 team in the Plaza can breach us.',
      bonded: 'Take my personal Prism archive key. Whatever waits in the Convergence chamber, we face it as full partners.',
      victory: 'Impressive lane discipline! Even my Refraction wards couldn’t hold two lanes at once.',
      defeat: 'Watch how Front units shield the Rear slot—and never ignore an active Ward.'
    }
  },
  {
    id: 'npc_kaelen_forge',
    name: 'Kaelen Emberforge',
    title: 'Emberclad Circuit Challenger',
    category: 'rival_duelist',
    faction_affinity: 'emberclad',
    secondary_faction: 'iron_choir',
    duel_difficulty: 'casual',
    deck_id: 'deck_ember_iron_forge',
    home_location: 'lumenport_duelist_plaza',
    interior_id: 'interior_training_facility',
    initial_relationship: 20,
    can_recruit_companion: true,
    companion_ai_profile: 'aggressive_overheat_tempo',
    appearance: 'Broad-shouldered smith-duelist in crimson forge-leather with glowing slag-glass gauntlets.',
    background: 'Apprenticed in the Crucible Reaches before traveling to Lumenport to qualify for the Grand Tournament circuit.',
    personality: ['bold', 'competitive', 'generous'],
    schedule: [
      { time: '07:00', location: 'lumenport_arrival_square', activity: 'conditioning' },
      { time: '10:00', location: 'lumenport_duelist_plaza', activity: 'available_for_duel' },
      { time: '15:00', location: 'lumenport_central_card_market', activity: 'browsing_relics' },
      { time: '19:00', location: 'lumenport_grand_tournament_hall', activity: 'sparring' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 40, trusted: 65, bonded: 85 },
    rewards: { crowns: 90, echo_dust: 25, relationship_gain: 10, bonus_card_id: 'EMB-C-0001' },
    side_quest_id: 'quest_ch1_first_echo',
    dialogue: {
      greeting: 'Fresh off the harbor ferry? Let’s see if your starter deck can handle Emberclad Overheat!',
      friendly: 'You hit like a furnace hammer! Next time you queue for a 2v2 Tag battle, call me in to crack their Front line.',
      bonded: 'We forged our skills on the same anvil, friend. My Crucible deck is yours whenever the stakes get high.',
      victory: 'Ha! You weathered the Crucible and swung right back. Take these Crowns—you earned them.',
      defeat: 'When an Emberclad unit builds Heat, drop a Guard in its lane before it breaches your Leader!'
    }
  },
  {
    id: 'npc_master_vance',
    name: 'Master Artificer Vance',
    title: 'Proprietor of the Resonance Emporium',
    category: 'merchant',
    faction_affinity: 'iron_choir',
    secondary_faction: 'emberclad',
    duel_difficulty: 'veteran',
    deck_id: 'deck_iron_glass_citadel',
    home_location: 'lumenport_central_card_market',
    interior_id: 'interior_card_shop',
    initial_relationship: 30,
    can_recruit_companion: false,
    companion_ai_profile: 'fortified_assembly_control',
    appearance: 'Silver-bearded master horologist wearing a multi-lens jeweler’s loupe and brass-threaded waistcoat.',
    background: 'Former Chief Conductor of Ironreach’s Third Foundry; founded Lumenport’s premier Echo Card emporium.',
    personality: ['craftsman', 'mentoring', 'observant'],
    schedule: [
      { time: '08:00', location: 'interior_card_shop', activity: 'shop_open' },
      { time: '14:00', location: 'lumenport_central_card_market', activity: 'appraising_relics' },
      { time: '20:00', location: 'interior_harbor_cafe', activity: 'evening_tea' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 45, trusted: 70, bonded: 90 },
    rewards: { crowns: 150, echo_dust: 50, relationship_gain: 6, bonus_card_id: 'IRN-R-0007' },
    side_quest_id: 'quest_ch2_market_resonance',
    dialogue: {
      greeting: 'Welcome to the Resonance Emporium! Whether you need Foundations packs, Echo Dust crafting, or a tune-up duel, my counter is open.',
      friendly: 'For a regular customer with an eye for fine clockwork, I keep my specialty faction packs right on the top shelf.',
      bonded: 'You understand the harmony between machine and Echo better than any apprentice I’ve trained in thirty years.',
      victory: 'Splendid calibration! Here is an extra Aether-Dynamo component for your collection.',
      defeat: 'A well-built 40-card deck balances creatures, tactics, and relics along a smooth Aether curve.'
    }
  },
  {
    id: 'npc_soren_whisperleaf',
    name: 'Soren of Whisperleaf',
    title: 'Verdant Pact Envoy & Tag Partner',
    category: 'faction_mentor',
    faction_affinity: 'verdant_pact',
    secondary_faction: 'tidebound',
    duel_difficulty: 'skilled',
    deck_id: 'deck_verdant_tide_harmony',
    home_location: 'lumenport_arrival_square',
    interior_id: 'interior_harbor_cafe',
    initial_relationship: 40,
    can_recruit_companion: true,
    companion_ai_profile: 'supportive_bloom_healer',
    appearance: 'Tall woodland envoy wearing a cloak of living ironwood leaves and carrying a sunstone seed-lantern.',
    background: 'Sent by the Elder Canopy of Whisperleaf to monitor Aether root-tremors beneath Lumenport’s harbor.',
    personality: ['calm', 'protective', 'cooperative'],
    schedule: [
      { time: '07:00', location: 'lumenport_arrival_square', activity: 'guiding_newcomers' },
      { time: '12:00', location: 'lumenport_duelist_plaza', activity: 'tag_partner_available' },
      { time: '17:00', location: 'lumenport_accord_institute', activity: 'reporting_anomalies' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 40, trusted: 60, bonded: 80 },
    rewards: { crowns: 110, echo_dust: 30, relationship_gain: 10, bonus_card_id: 'VER-C-0002' },
    side_quest_id: 'quest_ch1_first_echo',
    dialogue: {
      greeting: 'The roots in the Verdant Expanse are restless. Stand with me in a Convergence Duel, and I will teach you how lane Resonance turns the tide.',
      friendly: 'Our decks grow stronger together. In 2v2 Tag battles, my Bloom heal effects can sustain your frontline indefinitely.',
      bonded: 'Whisperleaf names you Root-Friend. Call upon me whenever you need a steadfast shield in the convergence.',
      victory: 'You feel it, don’t you? Hold two lanes at turn’s end and the Resonance answers.',
      defeat: 'Patience. Let Growth counters accumulate behind a sturdy Bulwark.'
    }
  },

  // 12 New Named NPCs (bringing total to 16 meaningfully implemented characters across all 8 factions & all districts)
  {
    id: 'npc_captain_nerissa',
    name: 'Captain Nerissa Wake',
    title: 'Tidebound Harbor Fleetmaster',
    category: 'faction_mentor',
    faction_affinity: 'tidebound',
    secondary_faction: 'starweave',
    duel_difficulty: 'veteran',
    deck_id: 'deck_tide_star_navigation',
    home_location: 'lumenport_arrival_square',
    interior_id: 'interior_harbor_cafe',
    initial_relationship: 25,
    can_recruit_companion: true,
    companion_ai_profile: 'mobile_current_skirmisher',
    appearance: 'Salt-weathered sea captain in mother-of-pearl lamellar armor carrying a glowing liquid-Aether astrolabe.',
    background: 'Commands the reef-clippers patrolling the Shattered Archipelago and runs tactical lane-shifting drills at the harbor.',
    personality: ['decisive', 'witty', 'daring'],
    schedule: [
      { time: '06:00', location: 'lumenport_arrival_square', activity: 'inspecting_moorings' },
      { time: '11:00', location: 'interior_harbor_cafe', activity: 'charting_tides' },
      { time: '15:00', location: 'lumenport_duelist_plaza', activity: 'available_for_duel' },
      { time: '20:00', location: 'lumenport_arrival_square', activity: 'night_watch' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 45, trusted: 70, bonded: 85 },
    rewards: { crowns: 135, echo_dust: 40, relationship_gain: 9, bonus_card_id: 'TID-C-0019' },
    side_quest_id: 'quest_side_harbor_undertow',
    dialogue: {
      greeting: 'A stagnant duelist sinks like lead! If you leave your creatures anchored in one lane, my Tidebound scouts will dance right around them.',
      friendly: 'You’ve got your sea legs now. Let’s sail into a Tag match and show them how Current shifts win lanes.',
      bonded: 'By the Palace Beneath the Wake, I’d trust you at the helm in a category-five Aether squall!',
      victory: 'Well navigated! You read my lane swaps two turns before the wave crested.',
      defeat: 'Remember: Skirmish lets our units slide into open lanes to trigger Current bonuses.'
    }
  },
  {
    id: 'npc_vesper_noctis',
    name: 'Vesper of the Crescent Mask',
    title: 'Nocturne Information Broker',
    category: 'rival_duelist',
    faction_affinity: 'nocturne',
    secondary_faction: 'gravewild',
    duel_difficulty: 'veteran',
    deck_id: 'deck_nocturne_grave_echo',
    home_location: 'lumenport_residential_district',
    interior_id: 'interior_harbor_cafe',
    initial_relationship: 15,
    can_recruit_companion: true,
    companion_ai_profile: 'stealth_ambush_disruptor',
    appearance: 'Aristocratic figure in midnight velvet and a half-face silver porcelain mask holding a clapperless bell.',
    background: 'Represents the Unseen Herald in Lumenport, trading whispered tournament scout reports for rare Echo cards.',
    personality: ['enigmatic', 'calculative', 'dry_humor'],
    schedule: [
      { time: '08:00', location: 'lumenport_residential_district', activity: 'resting_in_shadows' },
      { time: '14:00', location: 'lumenport_central_card_market', activity: 'gathering_whispers' },
      { time: '18:00', location: 'lumenport_duelist_plaza', activity: 'twilight_duels' },
      { time: '22:00', location: 'interior_harbor_cafe', activity: 'midnight_brokerage' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 45, trusted: 70, bonded: 90 },
    rewards: { crowns: 145, echo_dust: 45, relationship_gain: 8, bonus_card_id: 'NOC-C-0019' },
    side_quest_id: 'quest_side_velvet_cipher',
    dialogue: {
      greeting: 'Keep your voice low. Half the duelists in this plaza broadcast their opening hand by the way they grip their deck case.',
      friendly: 'You move with admirable discretion. Should you require a silent blade in the 2v2 bracket, ring the silver bell.',
      bonded: 'Very few know the face behind the porcelain mask. Consider that secret—and my sharpest Veil deck—entrusted to you.',
      victory: 'Clever. You baited my Stealth assassin into a guarded lane.',
      defeat: 'What you cannot target, you cannot stop. Mind the Veil.'
    }
  },
  {
    id: 'npc_astromancer_celeste',
    name: 'Astromancer Celeste Oryn',
    title: 'Starweave Chair of Celestial Alignment',
    category: 'faction_mentor',
    faction_affinity: 'starweave',
    secondary_faction: 'glassborne',
    duel_difficulty: 'master',
    deck_id: 'deck_star_ember_supernova',
    home_location: 'lumenport_accord_institute',
    interior_id: 'interior_training_facility',
    initial_relationship: 30,
    can_recruit_companion: true,
    companion_ai_profile: 'predictive_alignment_combo',
    appearance: 'Regal astronomer draped in nebula-purple damask with floating golden armillary rings orbiting her shoulders.',
    background: 'Chief keeper of the Ninth Hour Orrery at the Accord Institute; charts the convergence cycles of all eight factions.',
    personality: ['visionary', 'precise', 'serene'],
    schedule: [
      { time: '07:00', location: 'lumenport_accord_institute', activity: 'calibrating_orrery' },
      { time: '11:00', location: 'interior_training_facility', activity: 'lecturing_initiates' },
      { time: '16:00', location: 'lumenport_grand_tournament_hall', activity: 'observing_matches' },
      { time: '21:00', location: 'lumenport_accord_institute', activity: 'deep_sky_alignment' }
    ],
    relationship_milestones: { acquaintance: 25, friendly: 50, trusted: 75, bonded: 90 },
    rewards: { crowns: 170, echo_dust: 55, relationship_gain: 7, bonus_card_id: 'STR-C-0019' },
    side_quest_id: 'quest_side_ninth_hour_conjunction',
    dialogue: {
      greeting: 'Chance is merely an unmapped constellation. When you scry your top card, three turns of destiny fall into alignment.',
      friendly: 'Our orbits converge harmoniously. Together in a Tag duel, we can control the draw cadence of the entire table.',
      bonded: 'The Ninth Hour Orrery predicted your arrival in Lumenport, yet your brilliance still surpasses the chart.',
      victory: 'A remarkable divergence! You broke my constellation sequence before the final conjunction.',
      defeat: 'Every draw was calculated four turns ago. Study the Alignment counters.'
    }
  },
  {
    id: 'npc_morwen_ossuary',
    name: 'Keeper Morwen Vale',
    title: 'Gravewild Memorial Medium',
    category: 'faction_mentor',
    faction_affinity: 'gravewild',
    secondary_faction: 'verdant_pact',
    duel_difficulty: 'veteran',
    deck_id: 'deck_verdant_grave_cycle',
    home_location: 'lumenport_residential_district',
    interior_id: 'interior_artificer_workshop',
    initial_relationship: 25,
    can_recruit_companion: true,
    companion_ai_profile: 'attrition_reclaim_recursion',
    appearance: 'Tall veiled medium in burgundy and bone-white mantle carrying a wrought-iron lantern of green spirit-fire.',
    background: 'Tends the Garden of Forgotten Names outside Lumenport and ensures ancient Echoes are honored rather than exploited.',
    personality: ['solemn', 'empathetic', 'unflinching'],
    schedule: [
      { time: '06:00', location: 'lumenport_residential_district', activity: 'tending_memorial_shrine' },
      { time: '11:00', location: 'lumenport_accord_institute', activity: 'archiving_fallen_echoes' },
      { time: '15:00', location: 'lumenport_duelist_plaza', activity: 'available_for_duel' },
      { time: '19:00', location: 'interior_artificer_workshop', activity: 'restoring_broken_cards' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 45, trusted: 70, bonded: 85 },
    rewards: { crowns: 140, echo_dust: 45, relationship_gain: 8, bonus_card_id: 'GRV-C-0019' },
    side_quest_id: 'quest_side_lantern_of_names',
    dialogue: {
      greeting: 'Novices fear the discard pile as an ending. To the Gravewild, it is rich soil waiting for the Reclaim bell.',
      friendly: 'Your units do not fall in vain when I stand beside you. Every Rebirth token holds the line for our counterattack.',
      bonded: 'The spirits of the Ossuary recognize your voice as kin. Walk with this lantern whenever the dark grows heavy.',
      victory: 'You honored the cycle and outpaced my recursion. A well-earned triumph.',
      defeat: 'Destroy my vanguard once, and its Rebirth remnant finishes the lane. Always plan for the second life.'
    }
  },
  {
    id: 'npc_marshal_corin',
    name: 'Grand Marshal Corin Thorne',
    title: 'Commissioner of the Tournament Hall',
    category: 'tournament_official',
    faction_affinity: 'neutral',
    secondary_faction: 'iron_choir',
    duel_difficulty: 'master',
    deck_id: 'deck_accord_grand_alliance',
    home_location: 'lumenport_grand_tournament_hall',
    interior_id: 'interior_tournament_registration',
    initial_relationship: 30,
    can_recruit_companion: true,
    companion_ai_profile: 'balanced_midrange_tactician',
    appearance: 'Commanding veteran in burnished bronze Accord plate with a crimson commissioner’s cape.',
    background: 'Three-time Lumenport Convergence Champion who now oversees the legal 40-card tournament brackets and 2v2 Tag championships.',
    personality: ['fair', 'disciplined', 'inspiring'],
    schedule: [
      { time: '08:00', location: 'interior_tournament_registration', activity: 'managing_brackets' },
      { time: '13:00', location: 'lumenport_grand_tournament_hall', activity: 'officiating_matches' },
      { time: '17:00', location: 'lumenport_duelist_plaza', activity: 'challenging_contenders' },
      { time: '21:00', location: 'interior_tournament_registration', activity: 'reviewing_replays' }
    ],
    relationship_milestones: { acquaintance: 25, friendly: 50, trusted: 75, bonded: 90 },
    rewards: { crowns: 200, echo_dust: 65, relationship_gain: 7, bonus_card_id: 'NEU-C-0022' },
    side_quest_id: 'quest_ch3_plaza_qualifier',
    dialogue: {
      greeting: 'Every contender entering the Grand Tournament Hall must prove their 40-card deck obeys the Two-Faction Accord and copy limits.',
      friendly: 'Your record in the qualifiers speaks for itself. Register a 2v2 Tag team whenever you’re ready for the Championship stage.',
      bonded: 'Lumenport hasn’t seen a duelist with your tactical clarity in a generation. I would be honored to fight alongside you.',
      victory: 'Championship-caliber play! Your lane control and resource timing were exemplary.',
      defeat: 'Never overcommit three units into a single lane when two lanes win the Resonance bonus.'
    }
  },
  {
    id: 'npc_mira_solis',
    name: 'Mira Solis',
    title: 'Hostess of the Anchor & Aether Café',
    category: 'merchant',
    faction_affinity: 'neutral',
    secondary_faction: 'verdant_pact',
    duel_difficulty: 'casual',
    deck_id: 'deck_verdant_tide_harmony',
    home_location: 'lumenport_arrival_square',
    interior_id: 'interior_harbor_cafe',
    initial_relationship: 35,
    can_recruit_companion: false,
    companion_ai_profile: 'supportive_bloom_healer',
    appearance: 'Warm-smiled café proprietor with copper-braided hair, rolling out fresh spice-pastries beside a brass Aether steamer.',
    background: 'Retired harbor navigator who turned an old customs boathouse into Lumenport’s favorite duelist gathering spot.',
    personality: ['welcoming', 'perceptive', 'connected'],
    schedule: [
      { time: '06:00', location: 'interior_harbor_cafe', activity: 'brewing_morning_roast' },
      { time: '12:00', location: 'interior_harbor_cafe', activity: 'hosting_duelist_social' },
      { time: '16:00', location: 'lumenport_central_card_market', activity: 'buying_spices' },
      { time: '18:00', location: 'interior_harbor_cafe', activity: 'evening_salon' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 40, trusted: 65, bonded: 85 },
    rewards: { crowns: 95, echo_dust: 30, relationship_gain: 10, bonus_card_id: 'NEU-C-0018' },
    side_quest_id: 'quest_side_harbor_undertow',
    dialogue: {
      greeting: 'Pull up a chair at the Anchor & Aether! Every duelist in Lumenport passes through my doors sooner or later.',
      friendly: 'I saved a corner table for you and your companions. Have you tried a friendly tabletop match over roasted harbor tea?',
      bonded: 'You’re family here at the Café. Whenever you need to know who’s dueling where in the city, just ask.',
      victory: 'Haha, wonderful match! The next round of spiced cider is on the house.',
      defeat: 'Don’t underestimate a café keeper’s deck—I hear fifty deck-building debates a day!'
    }
  },
  {
    id: 'npc_instructor_hale',
    name: 'Tactical Instructor Garrick Hale',
    title: 'Master of Lane Geometry',
    category: 'trainer',
    faction_affinity: 'iron_choir',
    secondary_faction: 'glassborne',
    duel_difficulty: 'skilled',
    deck_id: 'deck_iron_glass_citadel',
    home_location: 'lumenport_duelist_plaza',
    interior_id: 'interior_training_facility',
    initial_relationship: 30,
    can_recruit_companion: true,
    companion_ai_profile: 'fortified_assembly_control',
    appearance: 'Crisply uniformed Accord tactician carrying a brass pointer rod and holographic lane slate.',
    background: 'Authored the standard textbook on Three-Lane Front/Rear geometry taught to every Accord academy initiate.',
    personality: ['methodical', 'patient', 'exacting'],
    schedule: [
      { time: '07:00', location: 'interior_training_facility', activity: 'setting_up_puzzles' },
      { time: '10:00', location: 'lumenport_duelist_plaza', activity: 'coaching_matches' },
      { time: '14:00', location: 'interior_training_facility', activity: 'tactical_drills' },
      { time: '19:00', location: 'lumenport_accord_institute', activity: 'faculty_review' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 45, trusted: 70, bonded: 85 },
    rewards: { crowns: 115, echo_dust: 35, relationship_gain: 9, bonus_card_id: 'IRN-C-0019' },
    side_quest_id: 'quest_side_tactical_mastery',
    dialogue: {
      greeting: 'Three lanes. Front and Rear slots. Control two lanes at turn’s end to claim Resonance. Master the geometry, master the duel.',
      friendly: 'Your Front-to-Rear protection ratios have improved markedly. Let us drill a live 2v2 Tag formation.',
      bonded: 'I now use your match transcripts as the gold standard in my advanced academy lectures.',
      victory: 'Textbook execution! You exploited the unguarded Rear lane with surgical Reach damage.',
      defeat: 'You placed a low-health Caster in the Front slot without Guard or Shield. Protect your backline!'
    }
  },
  {
    id: 'npc_eluned_glass',
    name: 'Eluned Prismwright',
    title: 'Master of Echo Illustration & Optics',
    category: 'artisan',
    faction_affinity: 'glassborne',
    secondary_faction: 'iron_choir',
    duel_difficulty: 'skilled',
    deck_id: 'deck_glass_star_prism',
    home_location: 'lumenport_central_card_market',
    interior_id: 'interior_artificer_workshop',
    initial_relationship: 30,
    can_recruit_companion: false,
    companion_ai_profile: 'defensive_ward_counterplay',
    appearance: 'Artisan in iridescent apron wearing crystal light-filtering goggles and holding an Aether engraving stylus.',
    background: 'Leads the Calibration Workshop where raw Echo impressions are crystallized into illustrated tabletop cards.',
    personality: ['artistic', 'perfectionist', 'enthusiastic'],
    schedule: [
      { time: '08:00', location: 'interior_artificer_workshop', activity: 'imprinting_card_art' },
      { time: '13:00', location: 'lumenport_central_card_market', activity: 'sourcing_pigments' },
      { time: '16:00', location: 'interior_artificer_workshop', activity: 'calibrating_frames' },
      { time: '20:00', location: 'lumenport_residential_district', activity: 'sketching_canals' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 45, trusted: 70, bonded: 90 },
    rewards: { crowns: 130, echo_dust: 50, relationship_gain: 9, bonus_card_id: 'GLS-C-0019' },
    side_quest_id: 'quest_side_prism_calibration',
    dialogue: {
      greeting: 'Look closely at an Echo card: the illustration captures the spirit, while our prismatic frame projects live Aether stats!',
      friendly: 'Bring me any uncalibrated card briefs and our workshop lenses will help you render and approve new faction illustrations.',
      bonded: 'With your collection and my optical press, we’ll illuminate all 640 Echoes of the Foundations archive!',
      victory: 'Radiant! Your prism combinations refracted every single attack I launched.',
      defeat: 'Like a hasty brushstroke, an unshielded lunge leaves your flank exposed.'
    }
  },
  {
    id: 'npc_toma_wick',
    name: 'Toma Wick',
    title: 'Lantern Row Quartermaster & Collector',
    category: 'caretaker',
    faction_affinity: 'neutral',
    secondary_faction: 'nocturne',
    duel_difficulty: 'casual',
    deck_id: 'deck_accord_grand_alliance',
    home_location: 'lumenport_residential_district',
    interior_id: 'interior_player_apartment',
    initial_relationship: 35,
    can_recruit_companion: false,
    companion_ai_profile: 'balanced_midrange_tactician',
    appearance: 'Jovial lamp-lighter and building steward carrying a ring of brass apartment keys and a well-worn deck satchel.',
    background: 'Looks after the Duelist Lofts on Lantern Row and helps newcomers organize their deck folders and housing trophies.',
    personality: ['helpful', 'chatty', 'nostalgic'],
    schedule: [
      { time: '07:00', location: 'lumenport_residential_district', activity: 'extinguishing_streetlamps' },
      { time: '10:00', location: 'interior_player_apartment', activity: 'maintaining_lofts' },
      { time: '15:00', location: 'lumenport_central_card_market', activity: 'trading_commons' },
      { time: '19:00', location: 'lumenport_residential_district', activity: 'lighting_lantern_row' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 40, trusted: 65, bonded: 85 },
    rewards: { crowns: 85, echo_dust: 25, relationship_gain: 10, bonus_card_id: 'NEU-C-0017' },
    side_quest_id: 'quest_side_lantern_of_names',
    dialogue: {
      greeting: 'Welcome home to Lantern Row! Your Duelist Loft upstairs has a fresh deck-tuning desk ready for your 320-card collection.',
      friendly: 'I polished the trophy shelf in your apartment. Win a few more plaza duels and we’ll have a proper display!',
      bonded: 'Best tenant Lantern Row has ever had! Take this vintage Accord card from my personal binder.',
      victory: 'Hah! I knew you had champion spark the day I handed you the loft key.',
      defeat: 'Even a humble quartermaster knows how to curve out with Neutral vanguards!'
    }
  },
  {
    id: 'npc_brynja_slagheart',
    name: 'Forge-Captain Brynja Slagheart',
    title: 'Emberclad Siege Commander',
    category: 'faction_mentor',
    faction_affinity: 'emberclad',
    secondary_faction: 'starweave',
    duel_difficulty: 'master',
    deck_id: 'deck_star_ember_supernova',
    home_location: 'lumenport_grand_tournament_hall',
    interior_id: 'interior_tournament_registration',
    initial_relationship: 20,
    can_recruit_companion: true,
    companion_ai_profile: 'aggressive_overheat_tempo',
    appearance: 'Towering commander in blackened obsidian plate with twin magma-vent pauldrons and a rune-etched greathammer.',
    background: 'Led the Crucible vanguard during the Caldera border defense; now tests elite contenders in the Tournament Hall.',
    personality: ['fierce', 'honorable', 'direct'],
    schedule: [
      { time: '08:00', location: 'lumenport_grand_tournament_hall', activity: 'heavy_sparring' },
      { time: '13:00', location: 'interior_tournament_registration', activity: 'scouting_teams' },
      { time: '17:00', location: 'lumenport_duelist_plaza', activity: 'available_for_duel' },
      { time: '21:00', location: 'interior_harbor_cafe', activity: 'drinking_spiced_ale' }
    ],
    relationship_milestones: { acquaintance: 25, friendly: 50, trusted: 75, bonded: 90 },
    rewards: { crowns: 175, echo_dust: 55, relationship_gain: 8, bonus_card_id: 'EMB-C-0025' },
    side_quest_id: 'quest_ch3_plaza_qualifier',
    dialogue: {
      greeting: 'If your shields aren’t bolted down, my Emberclad colossi will melt right through your Front slot!',
      friendly: 'You stand firm under real heat! Queue with me in 2v2 Tag and we’ll hammer their shared Vitality to zero.',
      bonded: 'In the Crucible, we swear blood-and-iron oaths only to those who never flinch. My hammer is yours!',
      victory: 'By the First Furnace, what a clash! You absorbed my Overheat burst and took the counter-swing.',
      defeat: 'Hesitation is defeat against Emberclad. Quench my Heat stacks or brace for the Pierce blow!'
    }
  },
  {
    id: 'npc_brother_cassian',
    name: 'Conductor Cassian Bell',
    title: 'Iron Choir Harmonic Chronicler',
    category: 'rival_duelist',
    faction_affinity: 'iron_choir',
    secondary_faction: 'tidebound',
    duel_difficulty: 'skilled',
    deck_id: 'deck_iron_tide_dreadnought',
    home_location: 'lumenport_central_card_market',
    interior_id: 'interior_card_shop',
    initial_relationship: 25,
    can_recruit_companion: true,
    companion_ai_profile: 'fortified_assembly_control',
    appearance: 'Tall robed engineer with a brass pipe-organ backpack and two hovering clockwork chime-drones.',
    background: 'Travels from Ironreach to record the acoustic frequencies of Convergence Duels on wax-and-Aether cylinders.',
    personality: ['rhythmic', 'courteous', 'focused'],
    schedule: [
      { time: '07:00', location: 'lumenport_central_card_market', activity: 'tuning_chimes' },
      { time: '11:00', location: 'interior_card_shop', activity: 'discussing_constructs' },
      { time: '15:00', location: 'lumenport_duelist_plaza', activity: 'available_for_duel' },
      { time: '19:00', location: 'lumenport_accord_institute', activity: 'harmonic_analysis' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 45, trusted: 70, bonded: 85 },
    rewards: { crowns: 130, echo_dust: 40, relationship_gain: 8, bonus_card_id: 'IRN-C-0023' },
    side_quest_id: 'quest_side_tactical_mastery',
    dialogue: {
      greeting: 'Listen to the cadence of the tabletop. Every Relic and Construct adds another voice to the Iron Choir’s Assembly.',
      friendly: 'Your tempo sits in flawless four-four time. Let us synchronize our decks in a cooperative Tag duel.',
      bonded: 'The Seventh Chime rings in your honor. My constructs will shield your lanes to the last gear.',
      victory: 'A discordant strike right through my Shield array! Brilliantly improvised.',
      defeat: 'When Assembly counters stack across three constructs, the Choir becomes an unstoppable wall of brass.'
    }
  },
  {
    id: 'npc_sylvi_thorn',
    name: 'Sylvi Thornweaver',
    title: 'Verdant Botanist & Spore Alchemist',
    category: 'rival_duelist',
    faction_affinity: 'verdant_pact',
    secondary_faction: 'gravewild',
    duel_difficulty: 'skilled',
    deck_id: 'deck_verdant_grave_cycle',
    home_location: 'lumenport_residential_district',
    interior_id: 'interior_harbor_cafe',
    initial_relationship: 25,
    can_recruit_companion: true,
    companion_ai_profile: 'attrition_reclaim_recursion',
    appearance: 'Spirited botanist with amber spectacles, vine-braided boots, and a satchel of glowing emerald spore flasks.',
    background: 'Cultivates hybrid Whisperleaf and Gravewild flora in the rooftop greenhouses of Lantern Row.',
    personality: ['eccentric', 'cheerful', 'tenacious'],
    schedule: [
      { time: '07:00', location: 'lumenport_residential_district', activity: 'watering_rooftop_grove' },
      { time: '11:00', location: 'lumenport_central_card_market', activity: 'selling_herbal_tonics' },
      { time: '14:00', location: 'lumenport_duelist_plaza', activity: 'available_for_duel' },
      { time: '19:00', location: 'interior_harbor_cafe', activity: 'sharing_botany_notes' }
    ],
    relationship_milestones: { acquaintance: 20, friendly: 40, trusted: 65, bonded: 85 },
    rewards: { crowns: 125, echo_dust: 40, relationship_gain: 9, bonus_card_id: 'VER-C-0019' },
    side_quest_id: 'quest_side_lantern_of_names',
    dialogue: {
      greeting: 'Life and decay are two halves of the same root! My deck blooms on turn two and reclaims from the compost on turn five!',
      friendly: 'Want to team up? My spores weaken their Front line with Corrode while my Bloom herbs keep our Team Vitality topped off!',
      bonded: 'Look! This rare Golden Heartseed only blooms around duelists with genuine resonance. I grew it for your deck!',
      victory: 'Oh, well pruned! You cut through my briar wall before my second Bloom cycle!',
      defeat: 'Between Verdant Growth and Gravewild Rebirth, my garden never truly leaves the board!'
    }
  }
];

export const ACT1_QUESTS = [
  {
    id: 'quest_ch1_first_echo',
    chapter: 1,
    title: 'Chapter 1: Arrival in Lumenport',
    category: 'main_campaign',
    district_id: 'lumenport_arrival_square',
    giver_npc_id: 'npc_soren_whisperleaf',
    description: 'Explore Arrival Square, claim your starter deck from Envoy Soren, and complete your first Convergence Duel against Kaelen Emberforge.',
    objectives: [
      { id: 'obj_speak_soren', description: 'Speak with Soren of Whisperleaf in Arrival Square', target_count: 1 },
      { id: 'obj_duel_kaelen', description: 'Complete a Convergence Duel against Kaelen Emberforge', target_count: 1 }
    ],
    rewards: { crowns: 150, echo_dust: 40, pack_count: 1, card_id: 'NEU-C-0004', reputation_gain: 25 }
  },
  {
    id: 'quest_ch2_market_resonance',
    chapter: 1,
    title: 'Chapter 2: The Resonance Emporium',
    category: 'main_campaign',
    district_id: 'lumenport_central_card_market',
    giver_npc_id: 'npc_master_vance',
    description: 'Visit Master Artificer Vance in the Central Card Market, open a card pack or craft a card, and customize a legal 40-card deck.',
    objectives: [
      { id: 'obj_visit_vance', description: 'Enter the Resonance Emporium and speak with Master Vance', target_count: 1 },
      { id: 'obj_open_pack', description: 'Open 1 Foundations Card Pack or craft 1 card', target_count: 1 },
      { id: 'obj_save_deck', description: 'Validate and save a legal 40-card deck', target_count: 1 }
    ],
    rewards: { crowns: 200, echo_dust: 60, pack_count: 1, card_id: 'IRN-C-0003', reputation_gain: 35 }
  },
  {
    id: 'quest_ch3_plaza_qualifier',
    chapter: 1,
    title: 'Chapter 3: Duelist Plaza Qualifier',
    category: 'main_campaign',
    district_id: 'lumenport_duelist_plaza',
    giver_npc_id: 'npc_marshal_corin',
    description: 'Defeat Lyra Vane in Duelist Plaza and register with Grand Marshal Corin inside the Tournament Hall.',
    objectives: [
      { id: 'obj_defeat_lyra', description: 'Win a Convergence Duel against Lyra Vane in Duelist Plaza', target_count: 1 },
      { id: 'obj_register_corin', description: 'Speak with Grand Marshal Corin in the Tournament Registration Rotunda', target_count: 1 }
    ],
    rewards: { crowns: 300, echo_dust: 100, pack_count: 2, card_id: 'GLS-C-0005', reputation_gain: 50 }
  },
  {
    id: 'quest_ch4_tag_convergence',
    chapter: 2,
    title: 'Chapter 4: The Four-Banner Tag Trial',
    category: 'main_campaign',
    district_id: 'lumenport_grand_tournament_hall',
    giver_npc_id: 'npc_marshal_corin',
    description: 'Recruit a bonded NPC companion or join an online 2v2 Tag lobby and complete a four-duelist Tag Convergence match.',
    objectives: [
      { id: 'obj_recruit_partner', description: 'Reach Friendly (40+) bond with any companion NPC', target_count: 1 },
      { id: 'obj_complete_2v2', description: 'Complete a 2v2 Tag Convergence Duel (Co-op or 4-Client Online)', target_count: 1 }
    ],
    rewards: { crowns: 350, echo_dust: 120, pack_count: 2, card_id: 'STR-C-0026', reputation_gain: 60 }
  },
  {
    id: 'quest_side_prism_calibration',
    chapter: 1,
    title: 'Side Quest: Lenses of the Mirror Spire',
    category: 'side_story',
    district_id: 'lumenport_central_card_market',
    giver_npc_id: 'npc_eluned_glass',
    description: 'Assist Eluned Prismwright and Lyra Vane in the Calibration Workshop by inspecting and approving Echo card artwork.',
    objectives: [
      { id: 'obj_visit_workshop', description: 'Visit the Choir & Prism Calibration Workshop', target_count: 1 },
      { id: 'obj_duel_eluned', description: 'Test Glassborne Refraction in a duel with Eluned Prismwright', target_count: 1 }
    ],
    rewards: { crowns: 140, echo_dust: 55, pack_count: 1, card_id: 'GLS-C-0025', reputation_gain: 20 }
  },
  {
    id: 'quest_side_harbor_undertow',
    chapter: 1,
    title: 'Side Quest: Undertow at the Old Breakwater',
    category: 'side_story',
    district_id: 'lumenport_arrival_square',
    giver_npc_id: 'npc_captain_nerissa',
    description: 'Meet Captain Nerissa Wake at the Anchor & Aether Café and master Tidebound lane-shifting Current mechanics.',
    objectives: [
      { id: 'obj_cafe_briefing', description: 'Speak with Mira Solis and Captain Nerissa inside the Harbor Café', target_count: 1 },
      { id: 'obj_duel_nerissa', description: 'Defeat Captain Nerissa Wake at the harbor table', target_count: 1 }
    ],
    rewards: { crowns: 150, echo_dust: 50, pack_count: 1, card_id: 'TID-C-0025', reputation_gain: 25 }
  },
  {
    id: 'quest_side_velvet_cipher',
    chapter: 2,
    title: 'Side Quest: Whispers on Lantern Row',
    category: 'side_story',
    district_id: 'lumenport_residential_district',
    giver_npc_id: 'npc_vesper_noctis',
    description: 'Uncover the Nocturne cipher in Lantern Row and duel Vesper of the Crescent Mask under twilight rules.',
    objectives: [
      { id: 'obj_inspect_loft', description: 'Inspect your Duelist Loft Apartment with Toma Wick', target_count: 1 },
      { id: 'obj_duel_vesper', description: 'Challenge Vesper of the Crescent Mask', target_count: 1 }
    ],
    rewards: { crowns: 165, echo_dust: 60, pack_count: 1, card_id: 'NOC-C-0025', reputation_gain: 30 }
  },
  {
    id: 'quest_side_ninth_hour_conjunction',
    chapter: 2,
    title: 'Side Quest: The Ninth Hour Conjunction',
    category: 'side_story',
    district_id: 'lumenport_accord_institute',
    giver_npc_id: 'npc_astromancer_celeste',
    description: 'Ascend to the Accord Institute Observatory and test your deck against Astromancer Celeste’s Alignment predictions.',
    objectives: [
      { id: 'obj_visit_observatory', description: 'Speak with Astromancer Celeste at the Accord Institute', target_count: 1 },
      { id: 'obj_duel_celeste', description: 'Complete an Alignment duel against Astromancer Celeste', target_count: 1 }
    ],
    rewards: { crowns: 190, echo_dust: 75, pack_count: 1, card_id: 'STR-C-0025', reputation_gain: 35 }
  }
];
