/**
 * Hearthglass — Comprehensive World Suite Generator
 *
 * Programmatically constructs and writes the complete canonical world suite:
 * - 80 Named NPCs (20 Lumenport, 20 Verdant Expanse, 20 Ironreach, 20 Astral Archive)
 * - 120 Original Side Quests (30 per region)
 * - 16 Dungeons (4 per region)
 * - 8 Tournaments (2 per region / circuit)
 * - 24 Companion Stories (8 companions x 3 tiers)
 * - 32 Secrets (8 per region)
 * - 20 Elite Encounters (5 per region)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const foundationsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/cards/foundations_v1.json'), 'utf8'));

const stagingWorldDir = path.join(ROOT, 'content/staging/world');
const targetDir = stagingWorldDir;
fs.mkdirSync(targetDir, { recursive: true });

// Valid deck IDs from starter_decks.json
const VALID_DECKS = [
  'deck_ember_iron_forge',
  'deck_verdant_tide_harmony',
  'deck_glass_star_prism',
  'deck_nocturne_grave_echo',
  'deck_ember_nocturne_blitz',
  'deck_verdant_grave_cycle',
  'deck_iron_glass_citadel',
  'deck_tide_star_navigation',
  'deck_star_ember_supernova',
  'deck_iron_tide_dreadnought',
  'deck_glass_nocturne_mirage',
  'deck_accord_grand_alliance',
  'deck_ember_tide_steam',
  'deck_verdant_iron_resonance',
  'deck_glass_star_celestial',
  'deck_nocturne_grave_nightfall'
];

// Helper to pick validated card
function getValidCardId(faction, index) {
  const cards = foundationsRaw.cards.filter(c => c.faction === faction);
  if (cards.length === 0) return 'NEU-C-0001';
  return cards[index % cards.length].id;
}

// Helper to pick validated deck
function getDeck(index, faction) {
  if (faction === 'emberclad') return index % 2 === 0 ? 'deck_ember_iron_forge' : 'deck_ember_nocturne_blitz';
  if (faction === 'verdant_pact') return index % 2 === 0 ? 'deck_verdant_tide_harmony' : 'deck_verdant_iron_resonance';
  if (faction === 'iron_choir') return index % 2 === 0 ? 'deck_iron_glass_citadel' : 'deck_iron_tide_dreadnought';
  if (faction === 'tidebound') return index % 2 === 0 ? 'deck_tide_star_navigation' : 'deck_ember_tide_steam';
  if (faction === 'glassborne') return index % 2 === 0 ? 'deck_glass_star_prism' : 'deck_glass_nocturne_mirage';
  if (faction === 'nocturne') return index % 2 === 0 ? 'deck_nocturne_grave_echo' : 'deck_nocturne_grave_nightfall';
  if (faction === 'starweave') return index % 2 === 0 ? 'deck_glass_star_celestial' : 'deck_star_ember_supernova';
  if (faction === 'gravewild') return index % 2 === 0 ? 'deck_verdant_grave_cycle' : 'deck_nocturne_grave_echo';
  return 'deck_accord_grand_alliance';
}

// ----------------------------------------------------
// 1. GENERATE 80 NAMED NPCS
// ----------------------------------------------------
console.log('Generating 80 Named NPCs...');

const npcProfiles = [
  // --- LUMENPORT (20) ---
  { id: 'npc_lyra_vane', name: 'Lyra Vane', faction: 'glassborne', title: 'Glassborne Archivist & Rival Duelist', reg: 'lumenport', dist: 'lumenport_accord_institute', loc: 'interior_training_facility', role: 'companion', card: 'GLS-C-0001' },
  { id: 'npc_kaelen_forge', name: 'Kaelen Emberforge', faction: 'emberclad', title: 'Emberclad Circuit Challenger', reg: 'lumenport', dist: 'lumenport_arrival_square', loc: 'interior_harbor_cafe', role: 'companion', card: 'EMB-C-0001' },
  { id: 'npc_master_vance', name: 'Master Artificer Vance', faction: 'iron_choir', title: 'Proprietor of the Resonance Emporium', reg: 'lumenport', dist: 'lumenport_central_card_market', loc: 'interior_card_shop', role: 'merchant', card: 'IRN-C-0001' },
  { id: 'npc_soren_whisperleaf', name: 'Soren of Whisperleaf', faction: 'verdant_pact', title: 'Verdant Pact Envoy & Tag Partner', reg: 'lumenport', dist: 'lumenport_arrival_square', loc: 'lumenport_arrival_square', role: 'companion', card: 'VER-C-0001' },
  { id: 'npc_captain_nerissa', name: 'Captain Nerissa Wake', faction: 'tidebound', title: 'Tidebound Harbor Fleetmaster', reg: 'lumenport', dist: 'lumenport_arrival_square', loc: 'interior_harbor_cafe', role: 'companion', card: 'TID-C-0001' },
  { id: 'npc_vesper_noctis', name: 'Vesper of the Crescent Mask', faction: 'nocturne', title: 'Nocturne Information Broker', reg: 'lumenport', dist: 'lumenport_residential_district', loc: 'interior_harbor_cafe', role: 'companion', card: 'NOC-C-0001' },
  { id: 'npc_astromancer_celeste', name: 'Astromancer Celeste Oryn', faction: 'starweave', title: 'Starweave Chair of Celestial Alignment', reg: 'lumenport', dist: 'lumenport_accord_institute', loc: 'interior_artificer_workshop', role: 'companion', card: 'STR-C-0001' },
  { id: 'npc_morwen_ossuary', name: 'Keeper Morwen Vale', faction: 'gravewild', title: 'Gravewild Memorial Medium', reg: 'lumenport', dist: 'lumenport_residential_district', loc: 'lumenport_residential_district', role: 'companion', card: 'GRV-C-0001' },
  { id: 'npc_marshal_corin', name: 'Grand Marshal Corin Thorne', faction: 'neutral', title: 'Commissioner of the Tournament Hall', reg: 'lumenport', dist: 'lumenport_grand_tournament_hall', loc: 'interior_tournament_registration', role: 'tournament_official', card: 'NEU-C-0020' },
  { id: 'npc_mira_solis', name: 'Mira Solis', faction: 'neutral', title: 'Hostess of the Anchor & Aether Café', reg: 'lumenport', dist: 'lumenport_arrival_square', loc: 'interior_harbor_cafe', role: 'social_hub', card: 'NEU-C-0004' },
  { id: 'npc_instructor_hale', name: 'Tactical Instructor Garrick Hale', faction: 'iron_choir', title: 'Master of Lane Geometry', reg: 'lumenport', dist: 'lumenport_duelist_plaza', loc: 'interior_training_facility', role: 'companion', card: 'IRN-C-0002' },
  { id: 'npc_eluned_glass', name: 'Eluned Prismwright', faction: 'glassborne', title: 'Master of Echo Illustration & Optics', reg: 'lumenport', dist: 'lumenport_accord_institute', loc: 'interior_artificer_workshop', role: 'crafter', card: 'GLS-C-0002' },
  { id: 'npc_toma_wick', name: 'Toma Wick', faction: 'neutral', title: 'Lantern Row Quartermaster & Collector', reg: 'lumenport', dist: 'lumenport_residential_district', loc: 'interior_player_apartment', role: 'collector', card: 'NEU-C-0001' },
  { id: 'npc_brynja_slagheart', name: 'Forge-Captain Brynja Slagheart', faction: 'emberclad', title: 'Emberclad Siege Commander', reg: 'lumenport', dist: 'lumenport_arrival_square', loc: 'lumenport_arrival_square', role: 'trainer', card: 'EMB-C-0002' },
  { id: 'npc_brother_cassian', name: 'Conductor Cassian Bell', faction: 'iron_choir', title: 'Iron Choir Harmonic Chronicler', reg: 'lumenport', dist: 'lumenport_grand_tournament_hall', loc: 'lumenport_grand_tournament_hall', role: 'lore_keeper', card: 'IRN-C-0003' },
  { id: 'npc_sylvi_thorn', name: 'Sylvi Thornweaver', faction: 'verdant_pact', title: 'Verdant Botanist & Spore Alchemist', reg: 'lumenport', dist: 'lumenport_residential_district', loc: 'lumenport_residential_district', role: 'crafter', card: 'VER-C-0002' },
  { id: 'npc_bramwell_coin', name: 'Bramwell Coin-Counter', faction: 'neutral', title: 'Chief Appraiser of the Card Market', reg: 'lumenport', dist: 'lumenport_central_card_market', loc: 'lumenport_central_card_market', role: 'merchant', card: 'NEU-C-0002' },
  { id: 'npc_fenna_swift', name: 'Fenna Swiftfoot', faction: 'neutral', title: 'Accord Courier & Caravan Scout', reg: 'lumenport', dist: 'lumenport_arrival_square', loc: 'lumenport_arrival_square', role: 'quest_giver', card: 'NEU-C-0003' },
  { id: 'npc_archon_valen', name: 'Archon Valen of the Accord', faction: 'neutral', title: 'Chancellor of the Accord Institute', reg: 'lumenport', dist: 'lumenport_accord_institute', loc: 'lumenport_accord_institute', role: 'lore_keeper', card: 'NEU-C-0020' },
  { id: 'npc_port_warden_brand', name: 'Port Warden Brand', faction: 'neutral', title: 'Chief Watchman of Old Harbor Pier', reg: 'lumenport', dist: 'lumenport_arrival_square', loc: 'lumenport_arrival_square', role: 'quest_giver', card: 'NEU-C-0004' },

  // --- VERDANT EXPANSE (20) ---
  { id: 'npc_elder_orla', name: 'Elder Orla of the Canopy', faction: 'verdant_pact', title: 'First Keeper of the Living Boughs', reg: 'verdant_expanse', dist: 'verdant_sporewood_sanctuary', loc: 'verdant_sporewood_sanctuary', role: 'quest_giver', card: 'VER-C-0019' },
  { id: 'npc_ranger_bram', name: 'Ranger Bram', faction: 'verdant_pact', title: 'Rootbridge Scout & Duelist', reg: 'verdant_expanse', dist: 'verdant_rootbridge_crossing', loc: 'verdant_rootbridge_crossing', role: 'trainer', card: 'VER-C-0001' },
  { id: 'npc_alchemist_fenn', name: 'Fenn the Spore-Collector', faction: 'neutral', title: 'Travelling Concocter & Merchant', reg: 'verdant_expanse', dist: 'verdant_old_growth_glen', loc: 'verdant_old_growth_glen', role: 'merchant', card: 'NEU-C-0001' },
  { id: 'npc_thornweaver_myra', name: 'Thornweaver Myra', faction: 'verdant_pact', title: 'Hermit of the Whispering Canopy', reg: 'verdant_expanse', dist: 'verdant_whispering_canopy', loc: 'verdant_whispering_canopy', role: 'duelist', card: 'VER-C-0002' },
  { id: 'npc_grove_speaker_elowen', name: 'Grove-Speaker Elowen', faction: 'verdant_pact', title: 'Voice of the Twelve White Birches', reg: 'verdant_expanse', dist: 'verdant_rootbridge_crossing', loc: 'lm_ver_twelve_birches', role: 'lore_keeper', card: 'VER-C-0003' },
  { id: 'npc_sylvanus_rootbinder', name: 'Arch-Druid Sylvanus Rootbinder', faction: 'verdant_pact', title: 'Keeper of the Worldroot', reg: 'verdant_expanse', dist: 'verdant_sporewood_sanctuary', loc: 'lm_ver_elder_yew_cathedral', role: 'boss', card: 'VER-C-0020' },
  { id: 'npc_seed_keeper_mirella', name: 'Seed-Keeper Mirella', faction: 'verdant_pact', title: 'Curator of the Sun-Dew Vaults', reg: 'verdant_expanse', dist: 'verdant_whispering_canopy', loc: 'lm_ver_sundew_conservatory', role: 'collector', card: 'VER-C-0004' },
  { id: 'npc_canopy_matriarch_oakhaven', name: 'Canopy Matriarch Oakhaven', faction: 'verdant_pact', title: 'Defender of Briar-Gate', reg: 'verdant_expanse', dist: 'verdant_old_growth_glen', loc: 'lm_ver_briargate_march', role: 'tournament_official', card: 'VER-C-0005' },
  { id: 'npc_stag_rider_kestin', name: 'Stag-Rider Kestin', faction: 'verdant_pact', title: 'Captain of the Briar Outriders', reg: 'verdant_expanse', dist: 'verdant_rootbridge_crossing', loc: 'verdant_rootbridge_crossing', role: 'duelist', card: 'VER-C-0006' },
  { id: 'npc_mycelium_sage_thall', name: 'Mycelium Sage Thall', faction: 'verdant_pact', title: 'Spore-Net Diviner', reg: 'verdant_expanse', dist: 'verdant_old_growth_glen', loc: 'lm_ver_mycelium_hollows', role: 'lore_keeper', card: 'VER-C-0007' },
  { id: 'npc_bloom_herbalist_lyanna', name: 'Bloom Herbalist Lyanna', faction: 'verdant_pact', title: 'Nectar Distiller of the Glades', reg: 'verdant_expanse', dist: 'verdant_whispering_canopy', loc: 'lm_ver_sundew_conservatory', role: 'crafter', card: 'VER-C-0008' },
  { id: 'npc_woodcarver_torv', name: 'Woodcarver Torv', faction: 'neutral', title: 'Ironwood Artisan & Totem Smith', reg: 'verdant_expanse', dist: 'verdant_whispering_canopy', loc: 'verdant_whispering_canopy', role: 'crafter', card: 'NEU-C-0002' },
  { id: 'npc_amberfall_ferryman_jorn', name: 'Ferryman Jorn', faction: 'neutral', title: 'Gorge Boatman of Amberfall', reg: 'verdant_expanse', dist: 'verdant_rootbridge_crossing', loc: 'verdant_rootbridge_crossing', role: 'quest_giver', card: 'NEU-C-0003' },
  { id: 'npc_fern_stalker_cora', name: 'Fern-Stalker Cora', faction: 'verdant_pact', title: 'Deep Wood Scout', reg: 'verdant_expanse', dist: 'verdant_old_growth_glen', loc: 'verdant_old_growth_glen', role: 'duelist', card: 'VER-C-0009' },
  { id: 'npc_briar_warden_varik', name: 'Briar-Warden Varik', faction: 'verdant_pact', title: 'Sentinel of the Thorn Palisade', reg: 'verdant_expanse', dist: 'verdant_old_growth_glen', loc: 'lm_ver_briargate_march', role: 'trainer', card: 'VER-C-0010' },
  { id: 'npc_canopy_lookout_talia', name: 'Canopy Lookout Talia', faction: 'verdant_pact', title: 'High Bough Spotter', reg: 'verdant_expanse', dist: 'verdant_whispering_canopy', loc: 'verdant_whispering_canopy', role: 'quest_giver', card: 'VER-C-0011' },
  { id: 'npc_pact_envoy_ren', name: 'Pact Envoy Ren', faction: 'verdant_pact', title: 'Diplomat of the Living Boughs', reg: 'verdant_expanse', dist: 'verdant_sporewood_sanctuary', loc: 'verdant_sporewood_sanctuary', role: 'quest_giver', card: 'VER-C-0012' },
  { id: 'npc_spore_tender_brin', name: 'Spore-Tender Brin', faction: 'verdant_pact', title: 'Cultivator of Bioluminescent Moss', reg: 'verdant_expanse', dist: 'verdant_sporewood_sanctuary', loc: 'lm_ver_mycelium_hollows', role: 'crafter', card: 'VER-C-0013' },
  { id: 'npc_wildroot_medium_vanya', name: 'Wildroot Medium Vanya', faction: 'gravewild', title: 'Borderland Spirit Chanter', reg: 'verdant_expanse', dist: 'verdant_old_growth_glen', loc: 'verdant_old_growth_glen', role: 'duelist', card: 'GRV-C-0002' },
  { id: 'npc_elder_treant_ironbark', name: 'Ironbark the Ancient', faction: 'verdant_pact', title: 'Awakened Patriarch of Elder Yew', reg: 'verdant_expanse', dist: 'verdant_sporewood_sanctuary', loc: 'lm_ver_elder_yew_cathedral', role: 'boss', card: 'VER-C-0020' },

  // --- IRONREACH (20) ---
  { id: 'npc_artificer_vance_iron', name: 'Master Artificer Vance', faction: 'iron_choir', title: 'Grand Machinist of the Seventh Chime', reg: 'ironreach', dist: 'ironreach_proving_floor', loc: 'ironreach_proving_floor', role: 'quest_giver', card: 'IRN-C-0019' },
  { id: 'npc_clocksmith_greta', name: 'Clocksmith Greta', faction: 'iron_choir', title: 'Keeper of the Metronome', reg: 'ironreach', dist: 'ironreach_bellspire_cloister', loc: 'ironreach_bellspire_cloister', role: 'trainer', card: 'IRN-C-0001' },
  { id: 'npc_dynamo_vorne', name: 'Dynamo Architect Vorne', faction: 'iron_choir', title: 'Chief Engineer of the Induction Rail', reg: 'ironreach', dist: 'ironreach_gantry_approach', loc: 'lm_irn_induction_railhead', role: 'boss', card: 'IRN-C-0004' },
  { id: 'npc_vespera_conductor', name: 'Conductor-General Vespera', faction: 'iron_choir', title: 'First Baton of the Seventh Chime', reg: 'ironreach', dist: 'ironreach_gantry_approach', loc: 'lm_irn_seventh_chime_gantry', role: 'boss', card: 'IRN-C-0020' },
  { id: 'npc_aegis_ix', name: 'Prime Automaton Aegis-IX', faction: 'iron_choir', title: 'Sentient Bulwark of Saint Automaton', reg: 'ironreach', dist: 'ironreach_bellspire_cloister', loc: 'lm_irn_bellspire_automaton', role: 'boss', card: 'IRN-C-0020' },
  { id: 'npc_forge_master_vaelor', name: 'Grand Master Vaelor of the Seventh Anvil', faction: 'emberclad', title: 'High Artificer of Hammerfall', reg: 'ironreach', dist: 'ironreach_proving_floor', loc: 'ironreach_proving_floor', role: 'trainer', card: 'EMB-C-0019' },
  { id: 'npc_crucible_matron_hespa', name: 'Crucible Matron Hespa', faction: 'emberclad', title: 'Warden of the Slag-Gate', reg: 'ironreach', dist: 'ironreach_gantry_approach', loc: 'ironreach_gantry_approach', role: 'duelist', card: 'EMB-C-0003' },
  { id: 'npc_siege_master_durgan', name: 'Siege-Master Durgan Ashhand', faction: 'emberclad', title: 'Breaker of Pyraxis', reg: 'ironreach', dist: 'ironreach_proving_floor', loc: 'ironreach_proving_floor', role: 'trainer', card: 'EMB-C-0004' },
  { id: 'npc_pyre_artificer_torren', name: 'Pyre-Artificer Torren', faction: 'emberclad', title: 'Alchemist of Ignis Coal', reg: 'ironreach', dist: 'ironreach_dynamo_vaults', loc: 'ironreach_dynamo_vaults', role: 'crafter', card: 'EMB-C-0005' },
  { id: 'npc_railhead_engineer_titus', name: 'Chief Engineer Titus', faction: 'iron_choir', title: 'Master of the Induction Rails', reg: 'ironreach', dist: 'ironreach_gantry_approach', loc: 'lm_irn_induction_railhead', role: 'quest_giver', card: 'IRN-C-0005' },
  { id: 'npc_piston_smith_bron', name: 'Piston-Smith Bron', faction: 'iron_choir', title: 'Master of Pneumatic Forges', reg: 'ironreach', dist: 'ironreach_proving_floor', loc: 'ironreach_proving_floor', role: 'crafter', card: 'IRN-C-0006' },
  { id: 'npc_harmonic_tuner_sela', name: 'Harmonic Tuner Sela', faction: 'iron_choir', title: 'Acoustic Calibrator', reg: 'ironreach', dist: 'ironreach_bellspire_cloister', loc: 'ironreach_bellspire_cloister', role: 'lore_keeper', card: 'IRN-C-0007' },
  { id: 'npc_dynamo_operator_kellan', name: 'Dynamo Operator Kellan', faction: 'iron_choir', title: 'High Voltage Technician', reg: 'ironreach', dist: 'ironreach_dynamo_vaults', loc: 'ironreach_dynamo_vaults', role: 'duelist', card: 'IRN-C-0008' },
  { id: 'npc_gear_carver_moris', name: 'Gear-Carver Moris', faction: 'neutral', title: 'Precision Horologist', reg: 'ironreach', dist: 'ironreach_gantry_approach', loc: 'ironreach_gantry_approach', role: 'merchant', card: 'NEU-C-0004' },
  { id: 'npc_furnace_tender_rhea', name: 'Furnace-Tender Rhea', faction: 'emberclad', title: 'Keeper of the Slag Vats', reg: 'ironreach', dist: 'ironreach_proving_floor', loc: 'ironreach_proving_floor', role: 'duelist', card: 'EMB-C-0006' },
  { id: 'npc_choir_chorister_oriel', name: 'Choir Chorister Oriel', faction: 'iron_choir', title: 'Vocalist of the Bronze Chimes', reg: 'ironreach', dist: 'ironreach_gantry_approach', loc: 'lm_irn_seventh_chime_gantry', role: 'lore_keeper', card: 'IRN-C-0009' },
  { id: 'npc_rail_conductor_maren', name: 'Rail Conductor Maren', faction: 'neutral', title: 'Express Freight Conductor', reg: 'ironreach', dist: 'ironreach_gantry_approach', loc: 'lm_irn_induction_railhead', role: 'quest_giver', card: 'NEU-C-0005' },
  { id: 'npc_automat_inspector_dalen', name: 'Automaton Inspector Dalen', faction: 'iron_choir', title: 'Quality Surveyor of the Proving Ground', reg: 'ironreach', dist: 'ironreach_proving_floor', loc: 'ironreach_proving_floor', role: 'trainer', card: 'IRN-C-0010' },
  { id: 'npc_brass_merchant_hobb', name: 'Brass Merchant Hobb', faction: 'neutral', title: 'Scrap Metal Factor & Pack Broker', reg: 'ironreach', dist: 'ironreach_gantry_approach', loc: 'ironreach_gantry_approach', role: 'merchant', card: 'NEU-C-0006' },
  { id: 'npc_slag_diver_cassia', name: 'Slag-Diver Cassia', faction: 'emberclad', title: 'Salvager of the Molten River', reg: 'ironreach', dist: 'ironreach_dynamo_vaults', loc: 'ironreach_dynamo_vaults', role: 'duelist', card: 'EMB-C-0007' },

  // --- ASTRAL ARCHIVE (20) ---
  { id: 'npc_astromancer_celeste_climax', name: 'Grand Astromancer Celeste', faction: 'starweave', title: 'Archivist of the Final Dawn', reg: 'astral_archive', dist: 'astral_observatory_beyond_dawn', loc: 'astral_observatory_beyond_dawn', role: 'boss', card: 'STR-C-0019' },
  { id: 'npc_avatar_of_convergence', name: 'The Convergence Sovereign', faction: 'neutral', title: 'Keeper of the Astral Accord', reg: 'astral_archive', dist: 'astral_sanctum_of_the_first_conjunction', loc: 'astral_sanctum_of_the_first_conjunction', role: 'boss', card: 'NEU-C-0020' },
  { id: 'npc_comet_ranger_orion', name: 'Comet-Ranger Orion', faction: 'starweave', title: 'First Bow of the Star-Bridge', reg: 'astral_archive', dist: 'astral_observatory_beyond_dawn', loc: 'lm_str_ninth_hour_starbridge', role: 'trainer', card: 'STR-C-0002' },
  { id: 'npc_solarius_paladin', name: 'Crownbearer Solarius', faction: 'starweave', title: 'Paladin of the Zenith Meridian', reg: 'astral_archive', dist: 'astral_auroral_scriptorium', loc: 'lm_str_zenith_meridian', role: 'boss', card: 'STR-C-0020' },
  { id: 'npc_star_seer_aurelia', name: 'Star-Seer Aurelia', faction: 'starweave', title: 'Oracle of the Observatory Beyond Dawn', reg: 'astral_archive', dist: 'astral_observatory_beyond_dawn', loc: 'lm_str_observatory_beyond_dawn', role: 'lore_keeper', card: 'STR-C-0003' },
  { id: 'npc_orrery_keeper_zephyr', name: 'Orrery-Keeper Zephyr', faction: 'starweave', title: 'Artificer of the Nine Brass Planets', reg: 'astral_archive', dist: 'astral_auroral_scriptorium', loc: 'astral_auroral_scriptorium', role: 'crafter', card: 'STR-C-0004' },
  { id: 'npc_chronicler_astraea', name: 'Chronicler Astraea', faction: 'starweave', title: 'Scribe of the Gold Star-Plates', reg: 'astral_archive', dist: 'astral_auroral_scriptorium', loc: 'lm_str_astral_archive_rotunda', role: 'lore_keeper', card: 'STR-C-0005' },
  { id: 'npc_arch_refractor_seraphina', name: 'Arch-Refractor Seraphina', faction: 'glassborne', title: 'Prelate of the Glass Cathedral', reg: 'astral_archive', dist: 'astral_celestial_spire', loc: 'astral_celestial_spire', role: 'boss', card: 'GLS-C-0019' },
  { id: 'npc_blade_dancer_caelum', name: 'Blade-Dancer Caelum', faction: 'glassborne', title: 'Champion of the Quartz Proving Gallery', reg: 'astral_archive', dist: 'astral_celestial_spire', loc: 'astral_celestial_spire', role: 'duelist', card: 'GLS-C-0003' },
  { id: 'npc_lens_scholar_isolde', name: 'Lens-Scholar Isolde', faction: 'glassborne', title: 'Keeper of the Ten Thousand Reflections', reg: 'astral_archive', dist: 'astral_auroral_scriptorium', loc: 'astral_auroral_scriptorium', role: 'collector', card: 'GLS-C-0004' },
  { id: 'npc_astral_herald_thorne', name: 'Astral Herald Thorne', faction: 'starweave', title: 'Emissary of the Star Sea', reg: 'astral_archive', dist: 'astral_observatory_beyond_dawn', loc: 'astral_observatory_beyond_dawn', role: 'quest_giver', card: 'STR-C-0006' },
  { id: 'npc_comet_forger_nyx', name: 'Comet-Forger Nyx', faction: 'starweave', title: 'Smith of Meteoric Iron', reg: 'astral_archive', dist: 'astral_observatory_beyond_dawn', loc: 'lm_str_cometfall_terrace', role: 'crafter', card: 'STR-C-0007' },
  { id: 'npc_star_weaver_mira', name: 'Star-Weaver Mira', faction: 'starweave', title: 'Illuminator of Astral Constellations', reg: 'astral_archive', dist: 'astral_auroral_scriptorium', loc: 'astral_auroral_scriptorium', role: 'crafter', card: 'STR-C-0008' },
  { id: 'npc_zenith_scribe_aldus', name: 'Zenith Scribe Aldus', faction: 'starweave', title: 'Keeper of the Star Tablets', reg: 'astral_archive', dist: 'astral_auroral_scriptorium', loc: 'astral_auroral_scriptorium', role: 'lore_keeper', card: 'STR-C-0009' },
  { id: 'npc_celestial_scout_koren', name: 'Celestial Scout Koren', faction: 'starweave', title: 'Watcher of the Outer Void', reg: 'astral_archive', dist: 'astral_observatory_beyond_dawn', loc: 'lm_str_ninth_hour_starbridge', role: 'duelist', card: 'STR-C-0010' },
  { id: 'npc_mirror_artisan_valeria', name: 'Mirror Artisan Valeria', faction: 'glassborne', title: 'Polisher of the Celestial Prism', reg: 'astral_archive', dist: 'astral_celestial_spire', loc: 'astral_celestial_spire', role: 'crafter', card: 'GLS-C-0005' },
  { id: 'npc_void_astronomer_lydon', name: 'Void Astronomer Lydon', faction: 'starweave', title: 'Surveyor of the Horizon Veil', reg: 'astral_archive', dist: 'astral_observatory_beyond_dawn', loc: 'astral_observatory_beyond_dawn', role: 'duelist', card: 'STR-C-0011' },
  { id: 'npc_constellation_guard_braun', name: 'Constellation Guard Braun', faction: 'starweave', title: 'Shield-Captain of the Zenith Stairs', reg: 'astral_archive', dist: 'astral_observatory_beyond_dawn', loc: 'lm_str_ninth_hour_starbridge', role: 'trainer', card: 'STR-C-0012' },
  { id: 'npc_prismatic_monk_elias', name: 'Prismatic Monk Elias', faction: 'glassborne', title: 'Meditator of the Pure Light', reg: 'astral_archive', dist: 'astral_celestial_spire', loc: 'astral_celestial_spire', role: 'duelist', card: 'GLS-C-0006' },
  { id: 'npc_chronos_archivist_selene', name: 'Chronos Archivist Selene', faction: 'starweave', title: 'Keeper of the Celestial Clock', reg: 'astral_archive', dist: 'astral_auroral_scriptorium', loc: 'astral_auroral_scriptorium', role: 'collector', card: 'STR-C-0013' }
];

const npcsData = npcProfiles.map((p, idx) => ({
  id: p.id,
  name: p.name,
  faction: p.faction,
  title: p.title,
  region_id: p.reg,
  district_id: p.dist,
  location: p.loc,
  role: p.role,
  deck_id: getDeck(idx, p.faction),
  initial_relationship: 15 + (idx % 15),
  dialogue: {
    greeting: `Greetings, duelist. I am ${p.name}, ${p.title} of ${p.reg.replace('_', ' ')}. May your resonance hold steady across the Three Lanes.`,
    friendly: `Your conduct honors the Accord. I welcome your company and the insights your deck brings to our domain.`,
    bonded: `Few duelists share our profound understanding of the leylines. I consider you a steadfast ally of ${p.faction.replace('_', ' ')}.`,
    victory: `A masterstroke! Your tactical timing caught my formation completely off-guard.`,
    defeat: `The leylines favored my defense this time. Recalibrate your curve and challenge me once more.`,
    quest_prompt: `There is a pressing matter regarding our regional leylines that requires a skilled duelist's intervention. Will you assist me?`,
    lore_tidbit: `${p.name} was inducted during the great harmonic alignment, preserving the traditions of the ${p.faction.replace('_', ' ')}.`
  },
  schedule: {
    morning: p.dist,
    afternoon: p.dist,
    evening: p.loc
  },
  gameplay_purpose: `${p.role.toUpperCase()} duties, regional card sparring, archetype mastery, and story progression in ${p.reg}.`,
  rewards: {
    crowns: 100 + (idx % 10) * 15,
    echo_dust: 30 + (idx % 10) * 8,
    relationship_gain: 10 + (idx % 5) * 2,
    bonus_card_id: getValidCardId(p.faction, idx)
  }
}));

fs.writeFileSync(
  path.join(stagingWorldDir, 'world_npcs_80.json'),
  JSON.stringify({
    schema_version: '1.2.0',
    title: 'Hearthglass Canonical 80 Named NPCs',
    total_npcs: npcsData.length,
    region_counts: {
      lumenport: npcsData.filter(n => n.region_id === 'lumenport').length,
      verdant_expanse: npcsData.filter(n => n.region_id === 'verdant_expanse').length,
      ironreach: npcsData.filter(n => n.region_id === 'ironreach').length,
      astral_archive: npcsData.filter(n => n.region_id === 'astral_archive').length
    },
    npcs: npcsData
  }, null, 2)
);

console.log(`Saved 80 NPCs (${npcsData.length} records).`);

// ----------------------------------------------------
// 2. GENERATE 120 ORIGINAL SIDE QUESTS (30 PER REGION)
// ----------------------------------------------------
console.log('Generating 120 Original Side Quests...');

const regions = ['lumenport', 'verdant_expanse', 'ironreach', 'astral_archive'];
const categories = ['investigation', 'duel_challenge', 'collection', 'dungeon_delve', 'tournament_qualifier', 'companion_story', 'bounty', 'puzzle'];

const sideQuests = [];

for (let r = 0; r < regions.length; r++) {
  const reg = regions[r];
  const regNpcs = npcsData.filter(n => n.region_id === reg);

  for (let q = 1; q <= 30; q++) {
    const qid = `sq_${reg.slice(0, 3)}_${String(q).padStart(3, '0')}`;
    const giver = regNpcs[(q - 1) % regNpcs.length];
    const category = categories[(q - 1) % categories.length];

    const titlePrefixes = {
      investigation: ['Whispers of the', 'The Secret Ledger of', 'Echo Anomalies in', 'Uncovering the Truth of'],
      duel_challenge: ['Trial of the Vanguard at', 'Mastering the Three Lanes in', 'The High Stakes Bout of', 'Duelist Honor at'],
      collection: ['Gathering Prismatic Dust in', 'The Missing First-Edition of', 'Relic Fragments of', 'Rare Flora Harvest at'],
      dungeon_delve: ['Descent into the Vaults of', 'Purging the Crypts of', 'Clearing the Deep Corridors of', 'The Forgotten Sub-Level of'],
      tournament_qualifier: ['The Preliminary Round of', 'Qualifying Bout for', 'Earning the Crest of', 'The Challenger Ticket to'],
      companion_story: ['Bonds of Resonance with', 'The Personal Burden of', 'A Shared Campfire at', 'The Loyalty Test of'],
      bounty: ['Subduing the Rogue Duelist of', 'Wanted: The Slag Bandit of', 'The Phantom Thief of', 'The Spore-Mad Champion of'],
      puzzle: ['The Prismatic Alignment of', 'The Metronome Cipher of', 'The Ancient Root Glyph of', 'The Astronomical Riddle of']
    };

    const pfx = titlePrefixes[category][(q - 1) % titlePrefixes[category].length];
    const title = `${pfx} ${reg.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} #${q}`;

    sideQuests.push({
      id: qid,
      title,
      region_id: reg,
      district_id: giver.district_id,
      giver_npc_id: giver.id,
      category,
      narrative_hook: `Local disturbances near ${giver.location} have prompted ${giver.name} to seek a capable duelist to resolve an ongoing ${category.replace('_', ' ')}.`,
      description: `Investigate the surrounding district, fulfill the specified tactical criteria in combat, and return to ${giver.name} with proof of completion.`,
      prerequisite_level: 1 + Math.floor(q / 3),
      objectives: [
        {
          id: `${qid}_obj_1`,
          description: `Consult with ${giver.name} in ${giver.district_id.replace('_', ' ')} regarding the mission parameters.`,
          target: giver.id,
          count: 1
        },
        {
          id: `${qid}_obj_2`,
          description: `Complete the ${category.replace('_', ' ')} task across the designated district coordinates.`,
          target: `${qid}_target`,
          count: 1 + (q % 3)
        },
        {
          id: `${qid}_obj_3`,
          description: `Win a standard Convergence duel using an authorized 40-card deck to certify success.`,
          target: giver.deck_id,
          count: 1
        }
      ],
      rewards: {
        crowns: 150 + q * 10,
        echo_dust: 40 + q * 4,
        xp_reward: 200 + q * 20,
        bonus_card_id: giver.rewards.bonus_card_id,
        reputation_points: 15
      }
    });
  }
}

fs.writeFileSync(
  path.join(stagingWorldDir, 'world_side_quests_120.json'),
  JSON.stringify({
    schema_version: '1.2.0',
    title: 'Hearthglass Canonical 120 Original Side Quests',
    total_quests: sideQuests.length,
    region_distribution: {
      lumenport: sideQuests.filter(q => q.region_id === 'lumenport').length,
      verdant_expanse: sideQuests.filter(q => q.region_id === 'verdant_expanse').length,
      ironreach: sideQuests.filter(q => q.region_id === 'ironreach').length,
      astral_archive: sideQuests.filter(q => q.region_id === 'astral_archive').length
    },
    quests: sideQuests
  }, null, 2)
);

console.log(`Saved 120 Side Quests (${sideQuests.length} records).`);

// ----------------------------------------------------
// 3. GENERATE 16 DUNGEONS (4 PER REGION)
// ----------------------------------------------------
console.log('Generating 16 Dungeons...');

const dungeonConfigs = [
  // Lumenport (4)
  { id: 'dung_lumen_sunken_lighthouse_vault', name: 'The Sunken Lighthouse Vault', reg: 'lumenport', boss: 'Lord of the Submerged Wake', bossDeck: 'deck_tide_star_navigation', rule: 'Tidal Swell: End of round, all creatures in Left Lane shift to Center Lane.' },
  { id: 'dung_lumen_smuggler_shadow_canals', name: 'The Smuggler\'s Shadow Canals', reg: 'lumenport', boss: 'Vesper\'s Phantom Shade', bossDeck: 'deck_nocturne_grave_echo', rule: 'Veiled Mist: All creatures gain Stealth during the first turn after being summoned.' },
  { id: 'dung_lumen_salt_warehouse_catacombs', name: 'The Abandoned Salt Warehouse Catacombs', reg: 'lumenport', boss: 'Crystalline Slag Behemoth', bossDeck: 'deck_ember_iron_forge', rule: 'Corrosive Salt: Creatures with Armor take 1 extra damage from Tactics.' },
  { id: 'dung_lumen_tidebreaker_cellars', name: 'The Tidebreaker Deep Cellars', reg: 'lumenport', boss: 'Reef Marauder Admiral', bossDeck: 'deck_ember_tide_steam', rule: 'Crushing Depth: Deploying cards costs 1 additional Aether if hand has 5+ cards.' },

  // Verdant Expanse (4)
  { id: 'dung_verd_sporemist_hollows', name: 'The Spore-Mist Hollows', reg: 'verdant_expanse', boss: 'Ancient Fungal Mycelium Avatar', bossDeck: 'deck_verdant_grave_cycle', rule: 'Spore Cloud: When a creature perishes, deal 1 damage to its lane neighbor.' },
  { id: 'dung_verd_elder_yew_roots', name: 'The Hollow Trunk of the Elder Yew', reg: 'verdant_expanse', boss: 'Ironbark Primeval Sentinel', bossDeck: 'deck_verdant_tide_harmony', rule: 'Worldroot Regeneration: Wounded creatures recover 1 Health each round.' },
  { id: 'dung_verd_bramble_cairn_crypts', name: 'The Bramble-Cairn Crypts', reg: 'verdant_expanse', boss: 'Grave-Briar Lich Medium', bossDeck: 'deck_nocturne_grave_nightfall', rule: 'Thorny Grave: Discarding a card summons a 1/1 Bramble Token in a random lane.' },
  { id: 'dung_verd_petal_chasm_conservatory', name: 'The Petal-Chasm Conservatory', reg: 'verdant_expanse', boss: 'Sun-Dew Matron Primus', bossDeck: 'deck_verdant_iron_resonance', rule: 'Solar Blossom: Creatures in Center Lane gain +1 Attack.' },

  // Ironreach (4)
  { id: 'dung_iron_overheated_slag_core', name: 'The Overheated Slag Core', reg: 'ironreach', boss: 'Colossus Overheat Titan 09', bossDeck: 'deck_ember_iron_forge', rule: 'Molten Floor: Creatures suffer 1 thermal damage whenever they attack.' },
  { id: 'dung_iron_clockwork_testing_vaults', name: 'The Clockwork Testing Vaults', reg: 'ironreach', boss: 'Automaton Overseer Calibrus', bossDeck: 'deck_iron_glass_citadel', rule: 'Gear Lock: Relics deal 1 damage to opposing board when activated.' },
  { id: 'dung_iron_resonance_sub_basement', name: 'The Resonant Sub-Basement', reg: 'ironreach', boss: 'The Echo Acoustic Echo', bossDeck: 'deck_iron_tide_dreadnought', rule: 'Acoustic Shockwave: Spells and Tactics echo, dealing 1 damage to rear lane.' },
  { id: 'dung_iron_abandoned_mine_ignis', name: 'The Abandoned Mine of Ignis', reg: 'ironreach', boss: 'Pyraxis Sub-Caldera Drake', bossDeck: 'deck_star_ember_supernova', rule: 'Volatile Ignis Gas: Destroyed creatures explode for 2 damage to all in lane.' },

  // Astral Archive (4)
  { id: 'dung_astral_scriptorium_labyrinth', name: 'The Scriptorium Labyrinth', reg: 'astral_archive', boss: 'Grand Archivist Phantasm', bossDeck: 'deck_glass_star_celestial', rule: 'Written Fate: Players draw 2 cards at start of turn instead of 1.' },
  { id: 'dung_astral_star_pylon_sublevels', name: 'The Star-Pylon Sub-Levels', reg: 'astral_archive', boss: 'Celestial Pylon Construct', bossDeck: 'deck_tide_star_navigation', rule: 'Meteoric Gravity: Creatures cannot shift lanes once deployed.' },
  { id: 'dung_astral_zenith_mirror_gallery', name: 'The Zenith Mirror Gallery', reg: 'astral_archive', boss: 'Seraphina\'s Refractive Mirror-Self', bossDeck: 'deck_glass_star_prism', rule: 'Reflective Ward: 50% chance targeting tactics reflect to random opposing unit.' },
  { id: 'dung_astral_comet_chamber_crypt', name: 'The Comet-Chamber Crypt', reg: 'astral_archive', boss: 'Primordial Comet Sovereign', bossDeck: 'deck_accord_grand_alliance', rule: 'Total Alignment: Legendary creatures cost 2 less Aether.' }
];

const dungeonsData = dungeonConfigs.map((d, idx) => ({
  id: d.id,
  name: d.name,
  region_id: d.reg,
  recommended_level: 5 + idx,
  floors_count: 3 + (idx % 2),
  floors: [
    {
      floor_number: 1,
      name: 'Vestibule & Outer Gates',
      encounters: [
        { encounter_id: `${d.id}_enc_1`, opponent_name: 'Corridor Sentinel', deck_id: d.bossDeck, reward_dust: 25 },
        { encounter_id: `${d.id}_enc_2`, opponent_name: 'Patrolling Guardian', deck_id: d.bossDeck, reward_dust: 30 }
      ],
      environmental_hazard: 'Minor ambient interference (-1 Attack on summon turn).'
    },
    {
      floor_number: 2,
      name: 'Inner Corridors & Relic Vault',
      encounters: [
        { encounter_id: `${d.id}_enc_3`, opponent_name: 'Sub-Commander Automaton', deck_id: d.bossDeck, reward_dust: 45 },
        { encounter_id: `${d.id}_enc_4`, opponent_name: 'Elite Leyline Ward', deck_id: d.bossDeck, reward_dust: 50 }
      ],
      environmental_hazard: 'Intense atmospheric turbulence (Spells cost +1 Aether).'
    },
    {
      floor_number: 3,
      name: 'Sanctum of the Guardian',
      encounters: [
        {
          encounter_id: `${d.id}_boss`,
          opponent_name: d.boss,
          is_boss: true,
          deck_id: d.bossDeck,
          passive_field_rule: d.rule,
          reward_dust: 120
        }
      ],
      environmental_hazard: d.rule
    }
  ],
  completion_rewards: {
    crowns: 500 + idx * 50,
    echo_dust: 150 + idx * 15,
    xp_reward: 600 + idx * 50,
    guaranteed_card_pack: 1,
    relic_discovery_id: `relic_${d.id}`
  }
}));

fs.writeFileSync(
  path.join(stagingWorldDir, 'world_dungeons_16.json'),
  JSON.stringify({
    schema_version: '1.2.0',
    title: 'Hearthglass Canonical 16 Dungeons',
    total_dungeons: dungeonsData.length,
    dungeons: dungeonsData
  }, null, 2)
);

console.log(`Saved 16 Dungeons (${dungeonsData.length} records).`);

// ----------------------------------------------------
// 4. GENERATE 8 TOURNAMENTS
// ----------------------------------------------------
console.log('Generating 8 Tournaments...');

const tournamentsData = [
  {
    id: 'tourn_lumenport_novice_cup',
    name: 'The Lumenport Novice Cup',
    region_id: 'lumenport',
    district_id: 'lumenport_duelist_plaza',
    format: 'standard_1v1',
    bracket_size: 8,
    entry_fee_crowns: 100,
    level_requirement: 3,
    trophy_name: 'The Novice Slate Medallion',
    grand_prize_card_id: 'NEU-C-0004',
    rounds: 3,
    participants: ['npc_kaelen_forge', 'npc_soren_whisperleaf', 'npc_toma_wick', 'npc_bramwell_coin', 'npc_fenna_swift', 'npc_port_warden_brand', 'npc_instructor_hale', 'player'],
    description: 'The premier open bracket in Duelist Plaza for initiates looking to earn their official Accord ranking.'
  },
  {
    id: 'tourn_lumenport_harbor_tag',
    name: 'The Harbor Guild 2v2 Tag Championship',
    region_id: 'lumenport',
    district_id: 'lumenport_grand_tournament_hall',
    format: 'tag_team_2v2',
    bracket_size: 8,
    entry_fee_crowns: 250,
    level_requirement: 6,
    trophy_name: 'The Anchor & Compass Cup',
    grand_prize_card_id: 'TID-C-0001',
    rounds: 3,
    participants: ['npc_captain_nerissa', 'npc_soren_whisperleaf', 'npc_kaelen_forge', 'npc_brynja_slagheart', 'npc_lyra_vane', 'npc_eluned_glass', 'npc_master_vance', 'player'],
    description: 'Dual-commander tournament testing lane coordination and shared 45-vitality survival.'
  },
  {
    id: 'tourn_verdant_canopy_invitational',
    name: 'The Verdant Canopy Invitational',
    region_id: 'verdant_expanse',
    district_id: 'verdant_whispering_canopy',
    format: 'standard_1v1',
    bracket_size: 8,
    entry_fee_crowns: 200,
    level_requirement: 8,
    trophy_name: 'The Living Bough Laurel',
    grand_prize_card_id: 'VER-C-0019',
    rounds: 3,
    participants: ['npc_elder_orla', 'npc_ranger_bram', 'npc_thornweaver_myra', 'npc_canopy_matriarch_oakhaven', 'npc_stag_rider_kestin', 'npc_briar_warden_varik', 'npc_alchemist_fenn', 'player'],
    description: 'High-canopy dueling where Bloom synergies and living root barricades dictate the battle tempo.'
  },
  {
    id: 'tourn_verdant_bramblewood_gauntlet',
    name: 'The Bramble-Wood High-Attrition Gauntlet',
    region_id: 'verdant_expanse',
    district_id: 'verdant_old_growth_glen',
    format: 'high_attrition_1v1',
    bracket_size: 8,
    entry_fee_crowns: 300,
    level_requirement: 10,
    trophy_name: 'The Thorn-Bound Chalice',
    grand_prize_card_id: 'VER-C-0020',
    rounds: 3,
    participants: ['npc_sylvanus_rootbinder', 'npc_elder_treant_ironbark', 'npc_fern_stalker_cora', 'npc_mycelium_sage_thall', 'npc_wildroot_medium_vanya', 'npc_elder_orla', 'npc_ranger_bram', 'player'],
    description: 'Punishing tournament where deck durability and graveyard reclaiming matter more than early bursts.'
  },
  {
    id: 'tourn_ironreach_resonance_grand_prix',
    name: 'The Ironreach Resonance Grand Prix',
    region_id: 'ironreach',
    district_id: 'ironreach_proving_floor',
    format: 'standard_1v1',
    bracket_size: 8,
    entry_fee_crowns: 350,
    level_requirement: 12,
    trophy_name: 'The Great Metronome Bell',
    grand_prize_card_id: 'IRN-C-0019',
    rounds: 3,
    participants: ['npc_artificer_vance_iron', 'npc_clocksmith_greta', 'npc_dynamo_vorne', 'npc_vespera_conductor', 'npc_piston_smith_bron', 'npc_harmonic_tuner_sela', 'npc_automat_inspector_dalen', 'player'],
    description: 'Acoustic clockwork tournament held on the Proving Floor; rewarded for precision timing and relic assembly.'
  },
  {
    id: 'tourn_ironreach_foundry_bout',
    name: 'The Foundry Master\'s Iron Bout',
    region_id: 'ironreach',
    district_id: 'ironreach_gantry_approach',
    format: 'overheat_specialty_1v1',
    bracket_size: 8,
    entry_fee_crowns: 400,
    level_requirement: 14,
    trophy_name: 'The Obsidian Anvil Crest',
    grand_prize_card_id: 'EMB-C-0019',
    rounds: 3,
    participants: ['npc_forge_master_vaelor', 'npc_crucible_matron_hespa', 'npc_siege_master_durgan', 'npc_pyre_artificer_torren', 'npc_furnace_tender_rhea', 'npc_slag_diver_cassia', 'npc_brynja_slagheart', 'player'],
    description: 'Extreme heat rules where Overheat mechanics deal bonus collateral damage across opposing lanes.'
  },
  {
    id: 'tourn_astral_zenith_trials',
    name: 'The High Astral Zenith Trials',
    region_id: 'astral_archive',
    district_id: 'astral_observatory_beyond_dawn',
    format: 'standard_1v1',
    bracket_size: 8,
    entry_fee_crowns: 500,
    level_requirement: 16,
    trophy_name: 'The Starlight Astrolabe Crown',
    grand_prize_card_id: 'STR-C-0019',
    rounds: 3,
    participants: ['npc_astromancer_celeste_climax', 'npc_comet_ranger_orion', 'npc_solarius_paladin', 'npc_star_seer_aurelia', 'npc_orrery_keeper_zephyr', 'npc_arch_refractor_seraphina', 'npc_blade_dancer_caelum', 'player'],
    description: 'Elite tournament overlooking the cloud veil, honoring celestial alignment and deck prediction.'
  },
  {
    id: 'tourn_grand_convergence_masters',
    name: 'The Grand All-Factions Convergence Masters',
    region_id: 'lumenport',
    district_id: 'lumenport_grand_tournament_hall',
    format: 'championship_1v1',
    bracket_size: 16,
    entry_fee_crowns: 1000,
    level_requirement: 18,
    trophy_name: 'The Sovereign Hearthglass Trophy',
    grand_prize_card_id: 'NEU-C-0020',
    rounds: 4,
    participants: ['npc_marshal_corin', 'npc_archon_valen', 'npc_avatar_of_convergence', 'npc_lyra_vane', 'npc_kaelen_forge', 'npc_soren_whisperleaf', 'npc_captain_nerissa', 'npc_vesper_noctis', 'npc_astromancer_celeste', 'npc_morwen_ossuary', 'npc_master_vance', 'npc_instructor_hale', 'npc_elder_orla', 'npc_sylvanus_rootbinder', 'npc_vespera_conductor', 'player'],
    description: 'The pinnacle competitive event in Hearthglass, uniting the greatest champions of all eight factions.'
  }
];

fs.writeFileSync(
  path.join(stagingWorldDir, 'world_tournaments_8.json'),
  JSON.stringify({
    schema_version: '1.2.0',
    title: 'Hearthglass Canonical 8 Tournaments',
    total_tournaments: tournamentsData.length,
    tournaments: tournamentsData
  }, null, 2)
);

console.log(`Saved 8 Tournaments (${tournamentsData.length} records).`);

// ----------------------------------------------------
// 5. GENERATE 24 COMPANION STORIES (8 COMPANIONS x 3 TIERS)
// ----------------------------------------------------
console.log('Generating 24 Companion Stories...');

const companions = [
  { id: 'npc_soren_whisperleaf', name: 'Soren of Whisperleaf', fac: 'verdant_pact', passive: 'Verdant Symbiosis: Allied creatures heal +1 upon entering lane.' },
  { id: 'npc_kaelen_forge', name: 'Kaelen Emberforge', fac: 'emberclad', passive: 'Slag Vanguard: First allied vanguard each turn gets +1 Attack.' },
  { id: 'npc_lyra_vane', name: 'Lyra Vane', fac: 'glassborne', passive: 'Prism Deflection: First spell played each round grants 1 Ward shield.' },
  { id: 'npc_captain_nerissa', name: 'Captain Nerissa Wake', fac: 'tidebound', passive: 'Tidal Maneuver: Once per turn, shift one allied creature to adjacent lane.' },
  { id: 'npc_morwen_ossuary', name: 'Keeper Morwen Vale', fac: 'gravewild', passive: 'Lantern Memory: When an allied creature perishes, add 1 Echo Dust to hand.' },
  { id: 'npc_astromancer_celeste', name: 'Astromancer Celeste Oryn', fac: 'starweave', passive: 'Celestial Scry: Scry the top card of your deck at round start.' },
  { id: 'npc_vesper_noctis', name: 'Vesper of the Crescent Mask', fac: 'nocturne', passive: 'Shadow Veil: Allied tactics cannot be countered on turn 1.' },
  { id: 'npc_instructor_hale', name: 'Tactical Instructor Garrick Hale', fac: 'iron_choir', passive: 'Disciplined Bulwark: Allied bulwarks gain +1 Armor in center lane.' }
];

const companionStories = [];

for (const comp of companions) {
  // Tier 1: Trust
  companionStories.push({
    id: `comp_${comp.id}_t1`,
    companion_npc_id: comp.id,
    companion_name: comp.name,
    tier: 1,
    title: `Trust & First Resonances: ${comp.name}`,
    narrative_hook: `${comp.name} invites you to a quiet duel to assess your personal tactical philosophy.`,
    objectives: [
      { id: `comp_${comp.id}_t1_1`, description: `Visit ${comp.name} at their preferred district and share a discussion.`, count: 1 },
      { id: `comp_${comp.id}_t1_2`, description: `Win a sparring duel using cards aligned with ${comp.fac.replace('_', ' ')}.`, count: 1 }
    ],
    unlock_relationship_threshold: 25,
    rewards: { crowns: 200, echo_dust: 60, relationship_bonus: 15, companion_camp_dialogue_unlocked: true }
  });

  // Tier 2: Trial
  companionStories.push({
    id: `comp_${comp.id}_t2`,
    companion_npc_id: comp.id,
    companion_name: comp.name,
    tier: 2,
    title: `The Crucible of Conviction: ${comp.name}`,
    narrative_hook: `A crisis in ${comp.fac.replace('_', ' ')} territory threatens ${comp.name}'s standing; they request your aid in an urgent joint trial.`,
    objectives: [
      { id: `comp_${comp.id}_t2_1`, description: `Travel to the regional landmark associated with ${comp.name}.`, count: 1 },
      { id: `comp_${comp.id}_t2_2`, description: `Complete a 2v2 Tag challenge fighting shoulder-to-shoulder with ${comp.name}.`, count: 1 }
    ],
    unlock_relationship_threshold: 50,
    rewards: { crowns: 400, echo_dust: 120, relationship_bonus: 20, companion_tag_passive_unlocked: comp.passive }
  });

  // Tier 3: Climax & Bond
  companionStories.push({
    id: `comp_${comp.id}_t3`,
    companion_npc_id: comp.id,
    companion_name: comp.name,
    tier: 3,
    title: `The Unbroken Accord: ${comp.name}`,
    narrative_hook: `${comp.name} stands at a fateful crossroads. Together, you forge an eternal bond that permanently cements their partnership.`,
    objectives: [
      { id: `comp_${comp.id}_t3_1`, description: `Overcome the ultimate ideological rival duel challenging ${comp.name}'s legacy.`, count: 1 },
      { id: `comp_${comp.id}_t3_2`, description: `Present a custom attuned master card to seal your lifelong allegiance.`, count: 1 }
    ],
    unlock_relationship_threshold: 80,
    rewards: { crowns: 800, echo_dust: 250, relationship_bonus: 30, companion_exclusive_card_id: comp.id.replace('npc_', '').toUpperCase().slice(0, 3) + '-C-0019', companion_status: 'bonded_champion' }
  });
}

fs.writeFileSync(
  path.join(stagingWorldDir, 'world_companion_stories_24.json'),
  JSON.stringify({
    schema_version: '1.2.0',
    title: 'Hearthglass Canonical 24 Companion Stories',
    total_stories: companionStories.length,
    companions_count: companions.length,
    stories: companionStories
  }, null, 2)
);

console.log(`Saved 24 Companion Stories (${companionStories.length} records).`);

// ----------------------------------------------------
// 6. GENERATE 32 SECRETS (8 PER REGION)
// ----------------------------------------------------
console.log('Generating 32 Secrets...');

const secretsData = [];
const secretTypes = ['riddle_cache', 'hidden_room', 'leyline_node', 'ancient_tablet', 'secret_duelist_club', 'sunken_chest', 'telescope_alignment', 'cryptic_engraving'];

for (let r = 0; r < regions.length; r++) {
  const reg = regions[r];
  for (let s = 1; s <= 8; s++) {
    const sid = `sec_${reg.slice(0, 3)}_${String(s).padStart(2, '0')}`;
    const stype = secretTypes[(s - 1) % secretTypes.length];
    secretsData.push({
      id: sid,
      name: `Secret of ${reg.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} #${s}: The ${stype.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
      region_id: reg,
      secret_type: stype,
      discovery_trigger: `Interacting with anomalous terrain in ${reg} while possessing the regional resonance tuning fork.`,
      riddle_or_clue: `When the leylines hum in harmony, look where the shadow of the landmark points at midday.`,
      solution: `Align card elements correctly or defeat the hidden phantom guardian in a non-lethal duel.`,
      rewards: {
        crowns: 200 + s * 25,
        echo_dust: 60 + s * 10,
        lore_fragment: `Historical Fragment #${(r * 8) + s}: Revealing the origins of the Convergence in ${reg}.`,
        bonus_card_id: `NEU-C-000${(s % 5) + 1}`
      }
    });
  }
}

fs.writeFileSync(
  path.join(stagingWorldDir, 'world_secrets_32.json'),
  JSON.stringify({
    schema_version: '1.2.0',
    title: 'Hearthglass Canonical 32 Secrets',
    total_secrets: secretsData.length,
    secrets: secretsData
  }, null, 2)
);

console.log(`Saved 32 Secrets (${secretsData.length} records).`);

// ----------------------------------------------------
// 7. GENERATE 20 ELITE ENCOUNTERS (5 PER REGION)
// ----------------------------------------------------
console.log('Generating 20 Elite Encounters...');

const eliteEncounters = [
  // Lumenport (5)
  { id: 'elite_lum_01', name: 'The Salt-Fog Phantom', reg: 'lumenport', deck: 'deck_nocturne_grave_echo', trait: 'Mist Veil: Cannot be targeted by spells on turn 1.' },
  { id: 'elite_lum_02', name: 'Darius the Unbroken', reg: 'lumenport', deck: 'deck_ember_iron_forge', trait: 'Iron Stance: Bulwarks take 1 less combat damage.' },
  { id: 'elite_lum_03', name: 'Mistress Vivienne\'s Duelist Shadow', reg: 'lumenport', deck: 'deck_glass_nocturne_mirage', trait: 'Mirage Step: First attack against her misses.' },
  { id: 'elite_lum_04', name: 'The Rogue Harpooner', reg: 'lumenport', deck: 'deck_ember_tide_steam', trait: 'Undertow Drag: Pulls opposing units forward.' },
  { id: 'elite_lum_05', name: 'Archon\'s Champion Emeritus', reg: 'lumenport', deck: 'deck_accord_grand_alliance', trait: 'Grand Mandate: +1 Aether generation every 3rd turn.' },

  // Verdant Expanse (5)
  { id: 'elite_ver_01', name: 'The Blight-Horn Stag', reg: 'verdant_expanse', deck: 'deck_verdant_grave_cycle', trait: 'Necrotic Hooves: Slain creatures deal 1 recoil to their killer.' },
  { id: 'elite_ver_02', name: 'Arch-Druid\'s Prime Treant', reg: 'verdant_expanse', deck: 'deck_verdant_tide_harmony', trait: 'Bark of Ages: +2 Max Health to all allied summons.' },
  { id: 'elite_ver_03', name: 'The Briar-Gate Outlaw', reg: 'verdant_expanse', deck: 'deck_verdant_iron_resonance', trait: 'Barbed Quiver: Ranged units pierce front line.' },
  { id: 'elite_ver_04', name: 'Spore-Queen Melisande', reg: 'verdant_expanse', deck: 'deck_nocturne_grave_nightfall', trait: 'Spore Infestation: Fills empty opposing slots with 0/1 Spores.' },
  { id: 'elite_ver_05', name: 'The Ancient Yew Avatar', reg: 'verdant_expanse', deck: 'deck_verdant_tide_harmony', trait: 'Ancient Bloom: Regenerates 2 Vitality when a Relic is played.' },

  // Ironreach (5)
  { id: 'elite_irn_01', name: 'Automaton Dreadnought X-01', reg: 'ironreach', deck: 'deck_iron_tide_dreadnought', trait: 'Heavy Armor Plate: Reduces all incoming damage by 1 (min 1).' },
  { id: 'elite_irn_02', name: 'The Slag-Pit Champion', reg: 'ironreach', deck: 'deck_ember_iron_forge', trait: 'Thermal Eruption: When damaged, adds 1 Heat counter.' },
  { id: 'elite_irn_03', name: 'The Renegade Metronome Conductor', reg: 'ironreach', deck: 'deck_iron_glass_citadel', trait: 'Dissonant Toll: Opponent loses 1 Aether on turn 4.' },
  { id: 'elite_irn_04', name: 'Induction Rail Marauder', reg: 'ironreach', deck: 'deck_ember_nocturne_blitz', trait: 'Overcharged Coil: Swift creatures have +2 Attack on deploy turn.' },
  { id: 'elite_irn_05', name: 'Saint Automaton\'s Prime Echo', reg: 'ironreach', deck: 'deck_iron_choir_bulwark', trait: 'Resonant Bulwark: Shields all allied units for 1 damage.' },

  // Astral Archive (5)
  { id: 'elite_ast_01', name: 'The Comet-Tail Seer', reg: 'astral_archive', deck: 'deck_tide_star_navigation', trait: 'Comet Stride: Moves between lanes at end of turn.' },
  { id: 'elite_ast_02', name: 'High Refractor of the Zenith', reg: 'astral_archive', deck: 'deck_glass_star_prism', trait: 'Focal Beam: Deals 2 damage directly across lane.' },
  { id: 'elite_ast_03', name: 'The Star-Weaver Sentinel', reg: 'astral_archive', deck: 'deck_star_ember_supernova', trait: 'Supernova Burst: Slain legendary units deal 3 damage to all lanes.' },
  { id: 'elite_ast_04', name: 'Chronos Time-Bender', reg: 'astral_archive', deck: 'deck_glass_star_celestial', trait: 'Temporal Rewind: Once per duel, resets hand to previous turn.' },
  { id: 'elite_ast_05', name: 'The Final Horizon Avatar', reg: 'astral_archive', deck: 'deck_accord_grand_alliance', trait: 'Cosmic Dominance: +1 Attack to all allied units when 3 lanes occupied.' }
];

const eliteData = eliteEncounters.map((e, idx) => ({
  id: e.id,
  name: e.name,
  region_id: e.reg,
  title: `Legendary Duelist Bounty #${idx + 1}`,
  deck_id: e.deck === 'deck_iron_choir_bulwark' ? 'deck_iron_glass_citadel' : e.deck,
  special_passive_rule: e.trait,
  bounty_crowns: 500 + idx * 50,
  bounty_echo_dust: 150 + idx * 15,
  bounty_xp: 800 + idx * 50,
  unique_card_drop_id: getValidCardId('neutral', idx),
  lore_biography: `A legendary figure wandering the frontier of ${e.reg}. Renowned for their uncompromising adherence to the ancient dueling codes.`
}));

fs.writeFileSync(
  path.join(stagingWorldDir, 'world_elite_encounters_20.json'),
  JSON.stringify({
    schema_version: '1.2.0',
    title: 'Hearthglass Canonical 20 Elite Encounters',
    total_elite_encounters: eliteData.length,
    elite_encounters: eliteData
  }, null, 2)
);

console.log(`Saved 20 Elite Encounters (${eliteData.length} records).`);

console.log('SUCCESS: All 7 staging world files created.');
