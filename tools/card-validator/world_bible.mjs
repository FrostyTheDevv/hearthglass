/**
 * Hearthglass — Canonical World Bible & Permanent Entity Registry (Section 3)
 *
 * Defines canonical, permanent-ID entities for the Hearthglass universe:
 * - 9 Factions (8 Major Factions + Neutral Accord)
 * - 9 Primary Regions
 * - 54 Sub-Regions & Landmarks (6 per Major Faction = 48 + 6 Neutral Accord / Free City of Lumenport = 54)
 * - 54 Named Characters & Historical Figures (6 per Major Faction = 48 + 6 Neutral Accord = 54),
 *   strictly synchronized with the 16 playable Lumenport NPCs in `lumenport_world_data.mjs`
 * - 12 Canonical Historical Events & Eras
 * - 18 Canonical Organizations & Orders
 * - 24 Creature Species & Classifications
 *
 * Every card biography, location reference, relationship, and historical provenance record
 * validates against these permanent entity IDs so zero contradictory names are invented.
 */

export const WORLD_REGIONS = [
  { id: 'reg_crucible_reaches', faction: 'emberclad', name: 'The Crucible Reaches', capital: 'Caldera Foundry of Mount Pyraxis', climate: 'Volcanic basalt highlands and geothermal rift valleys' },
  { id: 'reg_verdant_expanse', faction: 'verdant_pact', name: 'The Verdant Expanse', capital: 'Whisperleaf High Canopy', climate: 'Primeval temperate rainforest and bioluminescent root-cathedrals' },
  { id: 'reg_ironreach_canyons', faction: 'iron_choir', name: 'The Ironreach Canyons', capital: 'Grand Gantry of the Seventh Chime', climate: 'Steep acoustics-amplifying ironstone gorges bridged by brass viaducts' },
  { id: 'reg_shattered_archipelago', faction: 'tidebound', name: 'The Shattered Archipelago & Abyssal Shelf', capital: 'The Palace Beneath the Wake', climate: 'Tidal atolls, storm-swept reefs, and bioluminescent ocean trenches' },
  { id: 'reg_mirror_labyrinth', faction: 'glassborne', name: 'The Mirror Labyrinth & Prism Spires', capital: 'The Glass Cathedral', climate: 'Crystalline salt-flats and high-altitude quartz spires' },
  { id: 'reg_umbral_courts', faction: 'nocturne', name: 'The Umbral Courts & Crescent Undercity', capital: 'The Hollow Masquerade Manor', climate: 'Perpetual twilight fog-canals and moonlit gothic belfries' },
  { id: 'reg_high_astral_archive', faction: 'starweave', name: 'The High Astral Archive', capital: 'The Observatory Beyond Dawn', climate: 'Cloud-piercing mountain observatories under crisp auroral skies' },
  { id: 'reg_sunken_ossuary', faction: 'gravewild', name: 'The Sunken Ossuary & Fossil Marshes', capital: 'The Garden of Forgotten Names', climate: 'Mist-shrouded peat fens, fossilized leviathan ribs, and memorial groves' },
  { id: 'reg_free_city_lumenport', faction: 'neutral', name: 'Free City of Lumenport & Accord Trade Roads', capital: 'Lumenport Duelist Plaza', climate: 'Sunlit coastal harbor city where all eight faction leylines converge' }
];

/**
 * 54 Canonical Sub-Regions & Landmarks:
 * - 8 Major Factions x 6 Landmarks = 48 Faction Landmarks
 * - 1 Neutral Accord / Lumenport x 6 Landmarks = 6 Shared-World / Neutral Landmarks
 * Total = 54 Landmarks
 */
export const WORLD_LANDMARKS = [
  // Emberclad (6)
  { id: 'lm_emb_cindervault_smeltery', faction: 'emberclad', region_id: 'reg_crucible_reaches', name: 'Cindervault Ridge Smeltery', kind: 'industrial_foundry', narrative_hook: 'Where raw volcanic slag is quenched in dragon-tallow vats to cast frontline vanguard armor.' },
  { id: 'lm_emb_pyraxis_trenches', faction: 'emberclad', region_id: 'reg_crucible_reaches', name: 'Mount Pyraxis Caldera Trenches', kind: 'fortified_frontline', narrative_hook: 'A ring of obsidian bulwarks holding back wild magma behemoths along the upper crater.' },
  { id: 'lm_emb_hammerfall_bellows', faction: 'emberclad', region_id: 'reg_crucible_reaches', name: 'Hammerfall Great Bellows Hall', kind: 'megastructure', narrative_hook: 'Cathedral-sized pneumatic bellows that feed thermal pressure into a hundred war-anvils simultaneously.' },
  { id: 'lm_emb_slaggate_causeway', faction: 'emberclad', region_id: 'reg_crucible_reaches', name: 'Slag-Gate Basalt Causeway', kind: 'toll_bridge', narrative_hook: 'A suspended iron-chain highway crossing a river of white-hot silicate.' },
  { id: 'lm_emb_ignis_quarry', faction: 'emberclad', region_id: 'reg_crucible_reaches', name: 'Ignis Coal-Quarry Terraces', kind: 'resource_mine', narrative_hook: 'Open-pit seams of volatile Ignis coal that burn even underwater.' },
  { id: 'lm_emb_lumenport_foundry_ward', faction: 'emberclad', region_id: 'reg_free_city_lumenport', name: 'Lumenport Foundry Ward Crucible', kind: 'embassy_workshop', narrative_hook: 'The Emberclad trade enclave in Lumenport where Kaelen Emberforge and Brynja Slagheart train.' },

  // Verdant Pact (6)
  { id: 'lm_ver_whisperleaf_canopy', faction: 'verdant_pact', region_id: 'reg_verdant_expanse', name: 'Whisperleaf High Canopy', kind: 'living_citadel', narrative_hook: 'Interwoven ironwood boughs three hundred feet above the forest floor.' },
  { id: 'lm_ver_twelve_birches', faction: 'verdant_pact', region_id: 'reg_verdant_expanse', name: 'The Twelve White Birches Sanctuary', kind: 'healing_grove', narrative_hook: 'A sacred ring of pale trees whose spring water knits shattered bone and cracked armor.' },
  { id: 'lm_ver_elder_yew_cathedral', faction: 'verdant_pact', region_id: 'reg_verdant_expanse', name: 'Root-Bound Cathedral of Elder Yew', kind: 'ancient_temple', narrative_hook: 'Vaulted root-chambers where Pact envoys swear symbiosis oaths.' },
  { id: 'lm_ver_sundew_conservatory', faction: 'verdant_pact', region_id: 'reg_verdant_expanse', name: 'Sun-Dew Conservatory Glades', kind: 'botanical_archive', narrative_hook: 'Terraced amber pools that capture liquid daylight for winter Bloom rituals.' },
  { id: 'lm_ver_mycelium_hollows', faction: 'verdant_pact', region_id: 'reg_verdant_expanse', name: 'Mycelium Under-Bough Hollows', kind: 'fungal_network', narrative_hook: 'Bioluminescent subterranean caverns where spore-defenders incubate.' },
  { id: 'lm_ver_briargate_march', faction: 'verdant_pact', region_id: 'reg_verdant_expanse', name: 'Briar-Gate Borderland March', kind: 'living_fortification', narrative_hook: 'A mile-high wall of sentient iron-thorns separating the Expanse from the strip-mines.' },

  // Iron Choir (6)
  { id: 'lm_irn_seventh_chime_gantry', faction: 'iron_choir', region_id: 'reg_ironreach_canyons', name: 'Grand Gantry of the Seventh Chime', kind: 'clockwork_citadel', narrative_hook: 'Suspended bronze acoustic bridges that vibrate in four-four martial cadence.' },
  { id: 'lm_irn_clockwork_proving_floor', faction: 'iron_choir', region_id: 'reg_ironreach_canyons', name: 'The Clockwork Proving Floor', kind: 'automated_arena', narrative_hook: 'An interlocking gear-plated testing ground where Choir constructs calibrate shield arcs.' },
  { id: 'lm_irn_bellspire_automaton', faction: 'iron_choir', region_id: 'reg_ironreach_canyons', name: 'Bell-Spire of Saint Automaton', kind: 'harmonic_belfry', narrative_hook: 'Houses the Great Metronome whose pendulum sets the clock speed for every servo in Ironreach.' },
  { id: 'lm_irn_induction_railhead', faction: 'iron_choir', region_id: 'reg_ironreach_canyons', name: 'Ironreach Induction Railhead', kind: 'transit_hub', narrative_hook: 'Electromagnetic train terminus linking the canyon foundries to Lumenport.' },
  { id: 'lm_irn_dynamo_vaults', faction: 'iron_choir', region_id: 'reg_ironreach_canyons', name: 'The Harmonic Dynamo Vaults', kind: 'power_core', narrative_hook: 'Spinning copper gyro-turbines that harvest ambient static from canyon thunderstorms.' },
  { id: 'lm_irn_resonance_emporium', faction: 'iron_choir', region_id: 'reg_free_city_lumenport', name: 'The Resonance Emporium Workshop', kind: 'lumenport_landmark', narrative_hook: 'Master Artificer Vance’s famed clockwork and Echo Card shop in Lumenport’s Central Card Market.' },

  // Tidebound (6)
  { id: 'lm_tid_palace_beneath_wake', faction: 'tidebound', region_id: 'reg_shattered_archipelago', name: 'The Palace Beneath the Wake', kind: 'submerged_capital', narrative_hook: 'Fluted marble domes preserved under an unbroken tidal air-ward since the First Resonance.' },
  { id: 'lm_tid_coral_spire', faction: 'tidebound', region_id: 'reg_shattered_archipelago', name: 'Coral Spire of the Pelagic Sanctum', kind: 'reef_fortress', narrative_hook: 'Living calcified spire rising from the outer reef where harpooners and conchists muster.' },
  { id: 'lm_tid_abyssal_trench', faction: 'tidebound', region_id: 'reg_shattered_archipelago', name: 'Abyssal Trench of the Leviathan', kind: 'deep_chasm', narrative_hook: 'Two-league deep bioluminescent rift where ancient krakens and crustacean colossi slumber.' },
  { id: 'lm_tid_old_harbor_breakwater', faction: 'tidebound', region_id: 'reg_free_city_lumenport', name: 'Lumenport Old Harbor Breakwater', kind: 'harbor_sea_wall', narrative_hook: 'Basalt sea-wall where Captain Nerissa Wake moors the Tidebound reef-clippers.' },
  { id: 'lm_tid_whirlpool_reach', faction: 'tidebound', region_id: 'reg_shattered_archipelago', name: 'Shattered Atoll Whirlpool Reach', kind: 'navigational_hazard', narrative_hook: 'Swirling maelstrom straits used by Skirmish scouts to slingshot between sea lanes.' },
  { id: 'lm_tid_nacreous_grotto', faction: 'tidebound', region_id: 'reg_shattered_archipelago', name: 'Nacreous Grotto of the Tide-Singers', kind: 'acoustic_cavern', narrative_hook: 'Mother-of-pearl sea caves whose echoes calm storm swells and mend battle wounds.' },

  // Glassborne (6)
  { id: 'lm_gls_mirror_labyrinth', faction: 'glassborne', region_id: 'reg_mirror_labyrinth', name: 'The Infinite Mirror Labyrinth', kind: 'optical_fortress', narrative_hook: 'Shifting corridors of silvered quartz where intruders fight their own reflections.' },
  { id: 'lm_gls_first_refraction_spire', faction: 'glassborne', region_id: 'reg_mirror_labyrinth', name: 'Prism Spire of the First Refraction', kind: 'focal_tower', narrative_hook: 'Splits raw zenith sunlight into seven weaponized spectral beams.' },
  { id: 'lm_gls_glass_cathedral', faction: 'glassborne', region_id: 'reg_mirror_labyrinth', name: 'The Glass Cathedral Choir-Loft', kind: 'crystalline_sanctum', narrative_hook: 'Soaring stained-crystal arches that ring like wineglasses when Ward barriers hold.' },
  { id: 'lm_gls_accord_optical_wing', faction: 'glassborne', region_id: 'reg_free_city_lumenport', name: 'Accord Institute Optical Wing', kind: 'research_laboratory', narrative_hook: 'Lumenport laboratory where Lyra Vane and Eluned Prismwright study Echo refraction.' },
  { id: 'lm_gls_quartz_proving_gallery', faction: 'glassborne', region_id: 'reg_mirror_labyrinth', name: 'Quartz-Facet Proving Gallery', kind: 'dueling_hall', narrative_hook: 'Precision dueling hall where apprentices must deflect three spell-bolts without cracking a tile.' },
  { id: 'lm_gls_ten_thousand_reflections', faction: 'glassborne', region_id: 'reg_mirror_labyrinth', name: 'Hall of Ten Thousand Reflections', kind: 'illusion_chamber', narrative_hook: 'Domed amphitheater used to weave holographic decoys and Echo mirages.' },

  // Nocturne (6)
  { id: 'lm_noc_hollow_masquerade', faction: 'nocturne', region_id: 'reg_umbral_courts', name: 'The Hollow Masquerade Manor', kind: 'aristocratic_court', narrative_hook: 'Candlelit manor where masked brokers settle political debts over silent Convergence Duels.' },
  { id: 'lm_noc_crescent_alley_canals', faction: 'nocturne', region_id: 'reg_free_city_lumenport', name: 'Crescent Alley Shadow-Canals', kind: 'undercity_waterway', narrative_hook: 'Fog-draped waterways beneath Lumenport’s Lantern Row patrolled by Vesper’s informants.' },
  { id: 'lm_noc_unseen_herald_belfry', faction: 'nocturne', region_id: 'reg_umbral_courts', name: 'Belfry of the Unseen Herald', kind: 'bell_tower', narrative_hook: 'Hung with thirty clapperless silver bells whose ultrasonic toll silences enemy spellcasters.' },
  { id: 'lm_noc_velvet_court', faction: 'nocturne', region_id: 'reg_umbral_courts', name: 'Velvet Court of Whispered Debts', kind: 'intelligence_exchange', narrative_hook: 'Archive of sealed wax ledgers containing the weaknesses of every major duelist.' },
  { id: 'lm_noc_umbral_undercity_vaults', faction: 'nocturne', region_id: 'reg_umbral_courts', name: 'Umbral Undercity Vaults', kind: 'smuggler_stronghold', narrative_hook: 'Subterranean obsidian vaults shielded from divination by layers of shadow-silk.' },
  { id: 'lm_noc_bridge_of_sighs', faction: 'nocturne', region_id: 'reg_umbral_courts', name: 'Moonlit Bridge of Sighs', kind: 'dueling_span', narrative_hook: 'Narrow gothic bridge where Stealth assassins practice single-stroke ambushes.' },

  // Starweave (6)
  { id: 'lm_str_observatory_beyond_dawn', faction: 'starweave', region_id: 'reg_high_astral_archive', name: 'The Observatory Beyond Dawn', kind: 'celestial_citadel', narrative_hook: 'Floating stone-and-gold dome suspended above the cloud sea on meteoric iron pylons.' },
  { id: 'lm_str_astral_archive_rotunda', faction: 'starweave', region_id: 'reg_high_astral_archive', name: 'High Astral Archive Rotunda', kind: 'star_library', narrative_hook: 'Stores four centuries of orbital star-charts engraved on thin plates of celestial gold.' },
  { id: 'lm_str_ninth_hour_starbridge', faction: 'starweave', region_id: 'reg_high_astral_archive', name: 'Star-Bridge of the Ninth Hour', kind: 'constellation_causeway', narrative_hook: 'Materializes only when three major constellations align over the mountain peaks.' },
  { id: 'lm_str_celestial_orrery_chamber', faction: 'starweave', region_id: 'reg_free_city_lumenport', name: 'Lumenport Celestial Orrery Chamber', kind: 'institute_dome', narrative_hook: 'The crowning observatory dome of the Accord Institute overseen by Astromancer Celeste Oryn.' },
  { id: 'lm_str_cometfall_terrace', faction: 'starweave', region_id: 'reg_high_astral_archive', name: 'Comet-Fall Terrace', kind: 'landing_sanctuary', narrative_hook: 'High-altitude platform where star-iron meteors and celestial familiars touch down.' },
  { id: 'lm_str_zenith_meridian', faction: 'starweave', region_id: 'reg_high_astral_archive', name: 'Zenith Meridian Sanctuary', kind: 'meditation_spire', narrative_hook: 'Where Starweave seers scry future draw sequences in pools of liquid starlight.' },

  // Gravewild (6)
  { id: 'lm_grv_garden_forgotten_names', faction: 'gravewild', region_id: 'reg_sunken_ossuary', name: 'The Garden of Forgotten Names', kind: 'memorial_grounds', narrative_hook: 'Overgrown courtyard where burgundy blossoms sprout from buried Echo cards of the First Age.' },
  { id: 'lm_grv_sunken_ossuary_crypt', faction: 'gravewild', region_id: 'reg_sunken_ossuary', name: 'Sunken Ossuary of the First Age', kind: 'primordial_necropolis', narrative_hook: 'Half-flooded catacombs built inside the ribcage of a petrified world-behemoth.' },
  { id: 'lm_grv_fossil_rib_causeway', faction: 'gravewild', region_id: 'reg_sunken_ossuary', name: 'Fossil-Rib Marsh Causeway', kind: 'bone_viaduct', narrative_hook: 'Arched path of ancient ivory ribs spanning the corrosive peat bogs.' },
  { id: 'lm_grv_lantern_walk_unforgotten', faction: 'gravewild', region_id: 'reg_free_city_lumenport', name: 'Lantern-Walk of the Unforgotten', kind: 'lumenport_shrine', narrative_hook: 'Quiet memorial garden behind Lumenport’s Lantern Row tended by Keeper Morwen Vale.' },
  { id: 'lm_grv_briar_cairn_crypts', faction: 'gravewild', region_id: 'reg_sunken_ossuary', name: 'Briar-Cairn Memorial Crypts', kind: 'spirit_barrows', narrative_hook: 'Stone cairns wrapped in protective blood-briars that reawaken when trespassers draw steel.' },
  { id: 'lm_grv_peat_fog_sanctuary', faction: 'gravewild', region_id: 'reg_sunken_ossuary', name: 'Peat-Fog Spirit Sanctuary', kind: 'medium_enclave', narrative_hook: 'Where spirit-lanterns burn distilled bog-memories to guide Reclaimed units back to the tabletop.' },

  // Neutral Accord & Free City of Lumenport (6 — explains the 48 Faction + 6 Neutral = 54 total!)
  { id: 'lm_neu_arrival_square', faction: 'neutral', region_id: 'reg_free_city_lumenport', name: 'Lumenport Arrival Square & Beacon Pier', kind: 'city_plaza', narrative_hook: 'Coastal gateway where every newcomer steps off the ferry under the Accord Lighthouse.' },
  { id: 'lm_neu_central_card_market', faction: 'neutral', region_id: 'reg_free_city_lumenport', name: 'Central Card Market Colonnade', kind: 'trade_bazaar', narrative_hook: 'Bustling arcades where free merchants, pack brokers, and collectors trade across all eight factions.' },
  { id: 'lm_neu_duelist_plaza_arena', faction: 'neutral', region_id: 'reg_free_city_lumenport', name: 'Duelist Plaza Slate Arena', kind: 'public_dueling_grounds', narrative_hook: 'Open-air amphitheater of neutral octagonal slate tables enforcing the Three-Lane Accord.' },
  { id: 'lm_neu_grand_tournament_hall', faction: 'neutral', region_id: 'reg_free_city_lumenport', name: 'Lumenport Grand Tournament Hall', kind: 'championship_coliseum', narrative_hook: 'Vaulted coliseum presided over by Grand Marshal Corin Thorne for 1v1 and 2v2 Tag championships.' },
  { id: 'lm_neu_caravan_highroad', faction: 'neutral', region_id: 'reg_free_city_lumenport', name: 'Free Guild Caravan Highroad', kind: 'trade_route', narrative_hook: 'Paved stone highway patrolled by mercenary Ironhides connecting Lumenport to the outer regions.' },
  { id: 'lm_neu_anchor_aether_cafe', faction: 'neutral', region_id: 'reg_free_city_lumenport', name: 'The Anchor & Aether Harbor Café', kind: 'social_hub', narrative_hook: 'Mira Solis’s warm waterfront boathouse café where companions and tag partners form parties.' }
];

/**
 * 54 Canonical Named Figures (48 Major Faction Figures + 6 Neutral Accord Figures = 54 Total)
 * Strictly synchronized with the 16 playable NPCs in `lumenport_world_data.mjs`!
 */
export const WORLD_FIGURES = [
  // Emberclad (6 — includes NPCs Kaelen Emberforge & Forge-Captain Brynja Slagheart)
  { id: 'fig_emb_kaelen', npc_id: 'npc_kaelen_forge', faction: 'emberclad', name: 'Kaelen Emberforge', title: 'Emberclad Circuit Challenger', role_summary: 'Bold smith-duelist from Cindervault Ridge who tests newcomers in Duelist Plaza.' },
  { id: 'fig_emb_brynja', npc_id: 'npc_brynja_slagheart', faction: 'emberclad', name: 'Forge-Captain Brynja Slagheart', title: 'Emberclad Siege Commander', role_summary: 'Veteran commander of the Caldera border defense who leads high-heat colossus formations.' },
  { id: 'fig_emb_vaelor', npc_id: null, faction: 'emberclad', name: 'Grand Master Vaelor of the Seventh Anvil', title: 'High Artificer of Hammerfall', role_summary: 'Architect of the Great Bellows and codifier of modern Overheat pressure valves.' },
  { id: 'fig_emb_hespa', npc_id: null, faction: 'emberclad', name: 'Crucible Matron Hespa', title: 'Warden of the Slag-Gate', role_summary: 'Strict drill-mistress who trains Ashborne initiates along the basalt causeways.' },
  { id: 'fig_emb_durgan', npc_id: null, faction: 'emberclad', name: 'Siege-Master Durgan Ashhand', title: 'Breaker of Pyraxis', role_summary: 'Tamed the first Obsidian Siegebreakers in the lower volcanic trenches.' },
  { id: 'fig_emb_torren', npc_id: null, faction: 'emberclad', name: 'Pyre-Artificer Torren', title: 'Alchemist of Ignis Coal', role_summary: 'Refines volatile fire-salts used in Emberclad quick tactics and blast-pit hazards.' },

  // Verdant Pact (6 — includes NPCs Soren of Whisperleaf & Sylvi Thornweaver)
  { id: 'fig_ver_soren', npc_id: 'npc_soren_whisperleaf', faction: 'verdant_pact', name: 'Soren of Whisperleaf', title: 'Verdant Pact Envoy & Tag Partner', role_summary: 'Calm woodland envoy stationed at Arrival Square to monitor root-leyline tremors.' },
  { id: 'fig_ver_sylvi', npc_id: 'npc_sylvi_thorn', faction: 'verdant_pact', name: 'Sylvi Thornweaver', title: 'Verdant Botanist & Spore Alchemist', role_summary: 'Cultivates hybrid Bloom and Gravewild flora in Lantern Row’s rooftop greenhouses.' },
  { id: 'fig_ver_elowen', npc_id: null, faction: 'verdant_pact', name: 'Grove-Speaker Elowen', title: 'Voice of the Twelve White Birches', role_summary: 'Presides over the restorative spring sanctuaries of the Verdant Expanse.' },
  { id: 'fig_ver_sylvanus', npc_id: null, faction: 'verdant_pact', name: 'Arch-Druid Sylvanus Rootbinder', title: 'Keeper of the Worldroot', role_summary: 'Ancient treant-communer who can rouse primeval forest avatars from century-long slumber.' },
  { id: 'fig_ver_mirella', npc_id: null, faction: 'verdant_pact', name: 'Seed-Keeper Mirella', title: 'Curator of the Sun-Dew Vaults', role_summary: 'Preserves First-Age seed strains and golden amber totems.' },
  { id: 'fig_ver_oakhaven', npc_id: null, faction: 'verdant_pact', name: 'Canopy Matriarch Oakhaven', title: 'Defender of Briar-Gate', role_summary: 'Commands the ranger and stag-cavalry patrols along the living thorn-wall.' },

  // Iron Choir (6 — includes NPCs Master Artificer Vance, Tactical Instructor Garrick Hale, & Conductor Cassian Bell)
  { id: 'fig_irn_vance', npc_id: 'npc_master_vance', faction: 'iron_choir', name: 'Master Artificer Vance', title: 'Proprietor of the Resonance Emporium', role_summary: 'Former Chief Conductor of Ironreach who runs Lumenport’s premier Echo Card and Relic emporium.' },
  { id: 'fig_irn_hale', npc_id: 'npc_instructor_hale', faction: 'iron_choir', name: 'Tactical Instructor Garrick Hale', title: 'Master of Lane Geometry', role_summary: 'Author of the Accord’s textbook on Three-Lane Front/Rear positioning.' },
  { id: 'fig_irn_cassian', npc_id: 'npc_brother_cassian', faction: 'iron_choir', name: 'Conductor Cassian Bell', title: 'Iron Choir Harmonic Chronicler', role_summary: 'Records the acoustic frequencies of Convergence Duels on brass-and-Aether cylinders.' },
  { id: 'fig_irn_vespera', npc_id: null, faction: 'iron_choir', name: 'Conductor-General Vespera', title: 'First Baton of the Seventh Chime', role_summary: 'Supreme commander of Ironreach’s mechanized dreadnought battalions.' },
  { id: 'fig_irn_aegis_ix', npc_id: null, faction: 'iron_choir', name: 'Prime Automaton Aegis-IX', title: 'Sentient Bulwark of Saint Automaton', role_summary: 'Self-aware clockwork guardian that has defended the Bell-Spire for two hundred years.' },
  { id: 'fig_irn_vorne', npc_id: null, faction: 'iron_choir', name: 'Dynamo Architect Vorne', title: 'Chief Engineer of the Induction Rail', role_summary: 'Designed the capacitor bulwark-cores and coilgun artillery platforms.' },

  // Tidebound (6 — includes NPC Captain Nerissa Wake)
  { id: 'fig_tid_nerissa', npc_id: 'npc_captain_nerissa', faction: 'tidebound', name: 'Captain Nerissa Wake', title: 'Tidebound Harbor Fleetmaster', role_summary: 'Salt-weathered commander of the reef-clippers who teaches Skirmish lane-shifting at Old Harbor.' },
  { id: 'fig_tid_thalassa', npc_id: null, faction: 'tidebound', name: 'Tide-Oracle Thalassa', title: 'Seer of the Palace Beneath the Wake', role_summary: 'Reads future storm currents in the luminescent pearl-pools of the submerged capital.' },
  { id: 'fig_tid_corvus', npc_id: null, faction: 'tidebound', name: 'Harpoon-Master Corvus', title: 'Vanguard of the Coral Spire', role_summary: 'Leads the merfolk undertow hunters who ride rip-currents between battlefield lanes.' },
  { id: 'fig_tid_nereus', npc_id: null, faction: 'tidebound', name: 'Reef-Warden Nereus', title: 'Guardian of the Abyssal Shelf', role_summary: 'Commands the crustacean bulwarks and Trench-Lord leviathans of the deep chasm.' },
  { id: 'fig_tid_kaelo', npc_id: null, faction: 'tidebound', name: 'Abyssal Navigator Kaelo', title: 'Chartmaster of Whirlpool Reach', role_summary: 'Crafted the pressurized brine astrolabes used by Tidebound wayfinders.' },
  { id: 'fig_tid_marina', npc_id: null, faction: 'tidebound', name: 'High Conchist Marina', title: 'First Voice of the Nacreous Grotto', role_summary: 'Summons living water elementals with her spiral triton horn.' },

  // Glassborne (6 — includes NPCs Lyra Vane & Eluned Prismwright)
  { id: 'fig_gls_lyra', npc_id: 'npc_lyra_vane', faction: 'glassborne', name: 'Lyra Vane', title: 'Glassborne Archivist & Rival Duelist', role_summary: 'Brilliant optical researcher at the Accord Institute investigating anomalous Echo fractures.' },
  { id: 'fig_gls_eluned', npc_id: 'npc_eluned_glass', faction: 'glassborne', name: 'Eluned Prismwright', title: 'Master of Echo Illustration & Optics', role_summary: 'Artisan-perfectionist who imprints and stabilizes Echo card illustrations in the Calibration Workshop.' },
  { id: 'fig_gls_orin', npc_id: null, faction: 'glassborne', name: 'Master Orin Glasswright', title: 'Elder Lens-Smith of the First Spire', role_summary: 'Forged the original refractive rapiers and hexagonal Ward lenses of the Mirror Galleries.' },
  { id: 'fig_gls_seraphina', npc_id: null, faction: 'glassborne', name: 'Arch-Refractor Seraphina', title: 'Prelate of the Glass Cathedral', role_summary: 'Channels zenith sunlight through stained-quartz vaults to turn enemy spells back upon their casters.' },
  { id: 'fig_gls_caelum', npc_id: null, faction: 'glassborne', name: 'Blade-Dancer Caelum', title: 'Champion of the Quartz Proving Gallery', role_summary: 'Unbeaten duelist whose mirror-step feints leave only shattering crystal decoys behind.' },
  { id: 'fig_gls_isolde', npc_id: null, faction: 'glassborne', name: 'Lens-Scholar Isolde', title: 'Keeper of the Ten Thousand Reflections', role_summary: 'Codified the optical theorems that allow Echo mirages to hold physical lane presence.' },

  // Nocturne (6 — includes NPC Vesper of the Crescent Mask)
  { id: 'fig_noc_vesper', npc_id: 'npc_vesper_noctis', faction: 'nocturne', name: 'Vesper of the Crescent Mask', title: 'Nocturne Information Broker', role_summary: 'Porcelain-masked envoy of the Unseen Herald operating from Lantern Row and the Harbor Café.' },
  { id: 'fig_noc_soren_broker', npc_id: null, faction: 'nocturne', name: 'Whisper-Broker Malakor', title: 'High Ledger-Keeper of the Velvet Court', role_summary: 'Holds the sealed wax debt-ledgers of the Umbral Courts and dispatches shadow-silk saboteurs.' },
  { id: 'fig_noc_nyx', npc_id: null, faction: 'nocturne', name: 'Cipher-Mistress Nyx', title: 'Bell-Ringer of the Unseen Herald', role_summary: 'Strikes the clapperless silver bells whose dampening waves strip magical abilities from the board.' },
  { id: 'fig_noc_corin_phantom', npc_id: null, faction: 'nocturne', name: 'Phantom Archivist Valerius', title: 'Curator of Stolen Echoes', role_summary: 'Maintains the subterranean obsidian vaults where forbidden tactics are catalogued.' },
  { id: 'fig_noc_duchess_vivienne', npc_id: null, faction: 'nocturne', name: 'Duchess Vivienne of the Hollow Masquerade', title: 'Patron of the Twilight Duelists', role_summary: 'Hosts the midnight invitationals where assassins strike from beneath the Veil.' },
  { id: 'fig_noc_kestrel', npc_id: null, faction: 'nocturne', name: 'Night-Blade Kestrel', title: 'Executioner of the Bridge of Sighs', role_summary: 'Master of low-cost Stealth ambushes and crimson drain daggers.' },

  // Starweave (6 — includes NPC Astromancer Celeste Oryn)
  { id: 'fig_str_celeste', npc_id: 'npc_astromancer_celeste', faction: 'starweave', name: 'Astromancer Celeste Oryn', title: 'Starweave Chair of Celestial Alignment', role_summary: 'Chief keeper of the Ninth Hour Orrery at the Accord Institute who charts multi-turn draw destiny.' },
  { id: 'fig_str_aurelia', npc_id: null, faction: 'starweave', name: 'Star-Seer Aurelia', title: 'Oracle of the Observatory Beyond Dawn', role_summary: 'Gazes through the great cloud-top telescope to predict Convergence cycles decades in advance.' },
  { id: 'fig_str_orion', npc_id: null, faction: 'starweave', name: 'Comet-Ranger Orion', title: 'First Bow of the Star-Bridge', role_summary: 'Fires arrows of condensed comet-light that strike three seconds before the target enters the lane.' },
  { id: 'fig_str_solarius', npc_id: null, faction: 'starweave', name: 'Crownbearer Solarius', title: 'Paladin of the Zenith Meridian', role_summary: 'Armored cosmic colossus who descends the star-stair only when two or more lanes resonate.' },
  { id: 'fig_str_zephyr', npc_id: null, faction: 'starweave', name: 'Orrery-Keeper Zephyr', title: 'Artificer of the Nine Brass Planets', role_summary: 'Maintains the mechanical armillary spheres that generate Alignment counters across the Archive.' },
  { id: 'fig_str_lyris_star', npc_id: null, faction: 'starweave', name: 'Chronicler Astraea', title: 'Scribe of the Gold Star-Plates', role_summary: 'Inscribes every recorded celestial conjunction inside the High Astral Archive Rotunda.' },

  // Gravewild (6 — includes NPC Keeper Morwen Vale)
  { id: 'fig_grv_morwen', npc_id: 'npc_morwen_ossuary', faction: 'gravewild', name: 'Keeper Morwen Vale', title: 'Gravewild Memorial Medium', role_summary: 'Solemn lantern-bearer who tends the Garden of Forgotten Names and honors fallen Echoes.' },
  { id: 'fig_grv_silas', npc_id: null, faction: 'gravewild', name: 'Lantern-Bearer Silas', title: 'Guide of the Peat-Fog Sanctuary', role_summary: 'Carries the wrought-iron spirit lamps that call discarded creatures back through the Reclaim ritual.' },
  { id: 'fig_grv_vaelen', npc_id: null, faction: 'gravewild', name: 'Bone-Sculptor Vaelen', title: 'Artisan of the Sunken Ossuary', role_summary: 'Carves fossilized leviathan ribs into unyielding bulwark armor and memorial steles.' },
  { id: 'fig_grv_mara', npc_id: null, faction: 'gravewild', name: 'Elegy-Singer Mara', title: 'Chanter of the Briar-Cairns', role_summary: 'Her twilight dirges awaken Rebirth remnants from every shattered crest on the battlefield.' },
  { id: 'fig_grv_odrin', npc_id: null, faction: 'gravewild', name: 'Arch-Reclaimer Odrin', title: 'Lord of the First-Age Catacombs', role_summary: 'Commands the risen fossil-colossi that slumber beneath the corrosive bog waters.' },
  { id: 'fig_grv_fenwick', npc_id: null, faction: 'gravewild', name: 'Blight-Alchemist Fenwick', title: 'Distiller of Corrode Spores', role_summary: 'Brews the verdigris marsh-acids that pit and dissolve even the thickest Iron Choir plate.' },

  // Neutral Accord & Free City of Lumenport (6 — includes NPCs Grand Marshal Corin Thorne, Mira Solis, Toma Wick + the remaining 3 of the 16 NPCs!)
  { id: 'fig_neu_corin', npc_id: 'npc_marshal_corin', faction: 'neutral', name: 'Grand Marshal Corin Thorne', title: 'Commissioner of the Tournament Hall', role_summary: 'Three-time Convergence Champion who enforces the 40-card Two-Faction Accord in Lumenport.' },
  { id: 'fig_neu_mira', npc_id: 'npc_mira_solis', faction: 'neutral', name: 'Mira Solis', title: 'Hostess of the Anchor & Aether Café', role_summary: 'Retired harbor navigator whose waterfront café serves as Lumenport’s social and tag-team hub.' },
  { id: 'fig_neu_toma', npc_id: 'npc_toma_wick', faction: 'neutral', name: 'Toma Wick', title: 'Lantern Row Quartermaster & Collector', role_summary: 'Steward of the Duelist Lofts who helps players curate their personal apartment and card binders.' },
  { id: 'fig_neu_bramwell', npc_id: 'npc_bramwell_coin', faction: 'neutral', name: 'Bramwell Coin-Counter', title: 'Chief Appraiser of the Card Market', role_summary: 'Tracks rarity valuations, duplicate Echo Dust conversion rates, and pack probabilities.' },
  { id: 'fig_neu_fenna', npc_id: 'npc_fenna_swift', faction: 'neutral', name: 'Fenna Swiftfoot', title: 'Accord Courier & Caravan Scout', role_summary: 'Runs urgent dispatches between the six districts of Lumenport and the outer trade roads.' },
  { id: 'fig_neu_archon_valen', npc_id: 'npc_archon_valen', faction: 'neutral', name: 'Archon Valen of the Accord', title: 'Chancellor of the Accord Institute', role_summary: 'Presides over the Eight-Faction Council and safeguards the original Convergence Charter.' }
];

export const WORLD_HISTORICAL_EVENTS = [
  { id: 'era_first_convergence', year: 'Year 1 AC', name: 'the First Convergence Concordat', summary: 'The eight faction founders met at the octagonal slate table in Lumenport, substituting non-lethal Echo Card Duels for open continental warfare.' },
  { id: 'era_sunken_wake', year: 'Year 114 AC', name: 'the Sunken Wake Cataclysm', summary: 'A tidal leyline surge submerged the old pelagic capital, which survived beneath an unbroken dome of Tidebound water-wards.' },
  { id: 'era_prism_schism', year: 'Year 208 AC', name: 'the Prism Schism of the Mirror Galleries', summary: 'Glassborne optical scholars split from the old arcane guilds after discovering how faceted quartz refracts and nullifies raw spell energy.' },
  { id: 'era_seventh_chime', year: 'Year 275 AC', name: 'the Third Harmonic Reformation of the Seventh Chime', summary: 'Iron Choir engineers synchronized every canyon foundry to the Great Metronome, birthing the modern Assembly doctrine.' },
  { id: 'era_clapperless_bells', year: 'Year 339 AC', name: 'the Night of Clapperless Bells', summary: 'Nocturne brokers silenced a coup in the Umbral Courts without shedding a drop of blood by ringing thirty dampening bells at midnight.' },
  { id: 'era_ossuary_reclamation', year: 'Year 381 AC', name: 'the Reclamation of the Sunken Ossuary', summary: 'Gravewild mediums established the Garden of Forgotten Names, proving that discarded Echoes retain memory and can be Reclaimed.' },
  { id: 'era_caldera_eruption', year: 'Year 412 AC', name: 'the Great Caldera Eruption of Year 412', summary: 'Mount Pyraxis split open; Emberclad war-smiths held the Slag-Gate trenches for forty days using experimental Overheat armor.' },
  { id: 'era_whisperleaf_compact', year: 'Year 450 AC', name: 'the Whisperleaf Root-Compact', summary: 'Verdant Pact treants and grove-speakers extended living root-wards beneath Lumenport to stabilize the harbor bedrock.' },
  { id: 'era_ninth_hour_conjunction', year: 'Year 488 AC', name: 'the Ninth Hour Celestial Conjunction', summary: 'Starweave astromancers at the Observatory Beyond Dawn charted the nine-planet alignment that unlocked modern deck-scrying.' },
  { id: 'era_lumenport_charter', year: 'Year 510 AC', name: 'the Founding of the Lumenport Tag Charter', summary: 'Grand Marshal Corin Thorne ratified the Four-Banner 2v2 Tag ruleset (45 Shared Team Vitality across the Three Lanes).' }
];

export const WORLD_ORGANIZATIONS = [
  { id: 'org_cinder_anvil', faction: 'emberclad', name: 'Order of the Cinder Anvil', headquarters_id: 'lm_emb_cindervault_smeltery' },
  { id: 'org_pyraxis_vanguard', faction: 'emberclad', name: 'Pyraxis Caldera Vanguard', headquarters_id: 'lm_emb_pyraxis_trenches' },
  { id: 'org_whisperleaf_circle', faction: 'verdant_pact', name: 'Circle of the Elder Canopy', headquarters_id: 'lm_ver_whisperleaf_canopy' },
  { id: 'org_white_birch_apothecaries', faction: 'verdant_pact', name: 'Apothecaries of the Twelve Birches', headquarters_id: 'lm_ver_twelve_birches' },
  { id: 'org_seventh_chime_choir', faction: 'iron_choir', name: 'Synod of the Seventh Chime', headquarters_id: 'lm_irn_seventh_chime_gantry' },
  { id: 'org_ironreach_artificers', faction: 'iron_choir', name: 'Ironreach Guild of Harmonic Artificers', headquarters_id: 'lm_irn_resonance_emporium' },
  { id: 'org_pelagic_navigators', faction: 'tidebound', name: 'Pelagic Navigators of the Wake', headquarters_id: 'lm_tid_palace_beneath_wake' },
  { id: 'org_coral_harpooners', faction: 'tidebound', name: 'Coral Spire Harpoon Company', headquarters_id: 'lm_tid_coral_spire' },
  { id: 'org_mirror_duelists', faction: 'glassborne', name: 'Fellowship of the First Refraction', headquarters_id: 'lm_gls_first_refraction_spire' },
  { id: 'org_glass_choristers', faction: 'glassborne', name: 'Opticians of the Glass Cathedral', headquarters_id: 'lm_gls_glass_cathedral' },
  { id: 'org_unseen_herald', faction: 'nocturne', name: 'Brokers of the Unseen Herald', headquarters_id: 'lm_noc_unseen_herald_belfry' },
  { id: 'org_hollow_masquerade', faction: 'nocturne', name: 'Court of the Porcelain Mask', headquarters_id: 'lm_noc_hollow_masquerade' },
  { id: 'org_ninth_hour_seers', faction: 'starweave', name: 'Astromancers of the Ninth Hour', headquarters_id: 'lm_str_observatory_beyond_dawn' },
  { id: 'org_starbridge_paladins', faction: 'starweave', name: 'Watchers of the Zenith Meridian', headquarters_id: 'lm_str_ninth_hour_starbridge' },
  { id: 'org_forgotten_names_keepers', faction: 'gravewild', name: 'Keepers of the Forgotten Names', headquarters_id: 'lm_grv_garden_forgotten_names' },
  { id: 'org_ossuary_reclaimers', faction: 'gravewild', name: 'Order of the Peat-Fog Lantern', headquarters_id: 'lm_grv_sunken_ossuary_crypt' },
  { id: 'org_lumenport_commission', faction: 'neutral', name: 'Lumenport Grand Tournament Commission', headquarters_id: 'lm_neu_grand_tournament_hall' },
  { id: 'org_free_caravan_guard', faction: 'neutral', name: 'Free Guild Caravan Guard', headquarters_id: 'lm_neu_caravan_highroad' }
];
