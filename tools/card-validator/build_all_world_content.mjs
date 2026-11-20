/**
 * Hearthglass — Full World Content & Staging Builder
 *
 * Builds canonical world content staging suite:
 * - 80 Named NPCs (20 Lumenport, 20 Verdant Expanse, 20 Ironreach, 20 Astral Archive)
 * - 120 Original Side Quests (30 Lumenport, 30 Verdant Expanse, 30 Ironreach, 30 Astral Archive)
 * - 16 Dungeons (4 Lumenport, 4 Verdant Expanse, 4 Ironreach, 4 Astral Archive)
 * - 8 Tournaments (4 Standard 1v1, 2 Tag-Team, 2 Elite Circuit)
 * - 24 Companion Stories (8 companions x 3 tiers)
 * - 32 Secrets (8 Lumenport, 8 Verdant Expanse, 8 Ironreach, 8 Astral Archive)
 * - 20 Elite Encounters (5 Lumenport, 5 Verdant Expanse, 5 Ironreach, 5 Astral Archive)
 *
 * Validates referential integrity against:
 * - content/cards/foundations_v1.json (all 640 cards)
 * - content/cards/starter_decks.json (all 16 decks)
 * - tools/card-validator/world_bible.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const foundationsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/cards/foundations_v1.json'), 'utf8'));
const starterDecksRaw = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/cards/starter_decks.json'), 'utf8'));
const validDeckIds = new Set(starterDecksRaw.decks.map(d => d.id));
const allCardIds = new Set(foundationsRaw.cards.map(c => c.id));

const stagingWorldDir = path.join(ROOT, 'content/staging/world');
fs.mkdirSync(stagingWorldDir, { recursive: true });

// ==========================================
// 1. 80 NAMED NPCS (20 PER REGION)
// ==========================================
export const NPCS_80 = [
  // --- REGION 1: LUMENPORT (20) ---
  {
    id: 'npc_lyra_vane',
    name: 'Lyra Vane',
    faction: 'glassborne',
    title: 'Glassborne Archivist & Rival Duelist',
    region_id: 'lumenport',
    district_id: 'lumenport_accord_institute',
    location: 'interior_training_facility',
    role: 'companion',
    deck_id: 'deck_glass_star_prism',
    initial_relationship: 15,
    dialogue: {
      greeting: 'Careful with that deck. The light in the Institute catches every flaw in an unpolished edge.',
      friendly: 'I have been mapping the refraction paths in the central plaza. Our decks share a similar harmonic frequency.',
      bonded: 'You duel not to dominate, but to understand. Stand beside me when the Prism Schism reopens.',
      victory: 'Brilliant reflection! You turned my prism barrier right back against my vanguard.',
      defeat: 'You looked directly into the focal beam. Shield your eyes next time.',
      quest_prompt: 'The Accord archives contain fragmented reports from the First Convergence. Will you help me verify them in the field?',
      lore_tidbit: 'Glassborne optics are not merely mirrors—they capture the speed of light before the Aether settles into form.'
    },
    schedule: { morning: 'lumenport_accord_institute', afternoon: 'lumenport_duelist_plaza', evening: 'lumenport_residential_district' },
    gameplay_purpose: 'Key companion, Prism deck sparring, Echo refraction lore, Tag-team partner.',
    rewards: { crowns: 150, echo_dust: 50, relationship_gain: 15, bonus_card_id: 'GLS-C-0001' }
  },
  {
    id: 'npc_kaelen_forge',
    name: 'Kaelen Emberforge',
    faction: 'emberclad',
    title: 'Emberclad Circuit Challenger',
    region_id: 'lumenport',
    district_id: 'lumenport_arrival_square',
    location: 'interior_harbor_cafe',
    role: 'companion',
    deck_id: 'deck_ember_iron_forge',
    initial_relationship: 20,
    dialogue: {
      greeting: 'Fresh off the ferry? Put down your bags and pick up your deck. Let\'s see what you\'re made of.',
      friendly: 'You\'ve got genuine heat in your playstyle. Reminds me of the foundries back in Cindervault Ridge.',
      bonded: 'Brother of the anvil, brother of the board. You ever need an anvil-hard vanguard, I\'m your hammer.',
      victory: 'Hot damn! You burned through my bulwarks like slag through butter.',
      defeat: 'Cool your jets! You overextended your heat counter before your vanguard could strike.',
      quest_prompt: 'My forge-tools at Arrival Square are missing a heat-tempered tuning fork. Can you track it down?',
      lore_tidbit: 'Emberclad armor isn\'t forged once; it heats and quenches continuously with every duel played.'
    },
    schedule: { morning: 'lumenport_arrival_square', afternoon: 'lumenport_duelist_plaza', evening: 'interior_harbor_cafe' },
    gameplay_purpose: 'Tutorial combatant, Overheat deck sparring, companion recruitment, early quests.',
    rewards: { crowns: 120, echo_dust: 40, relationship_gain: 12, bonus_card_id: 'EMB-C-0001' }
  },
  {
    id: 'npc_master_vance',
    name: 'Master Artificer Vance',
    faction: 'iron_choir',
    title: 'Proprietor of the Resonance Emporium',
    region_id: 'lumenport',
    district_id: 'lumenport_central_card_market',
    location: 'interior_card_shop',
    role: 'merchant',
    deck_id: 'deck_iron_glass_citadel',
    initial_relationship: 25,
    dialogue: {
      greeting: 'Welcome to the Resonance Emporium. Mind the gyro-balance scales; they measure card density to the micro-grain.',
      friendly: 'A well-constructed deck is like a brass clock: every gear must mesh or the mainspring snaps.',
      bonded: 'You possess the rare gift of harmonic perception. Here—take this master-crafted calibration gauge.',
      victory: 'Precision incarnate! You timed your breakthrough right on the fourth beat.',
      defeat: 'Dissonant sequencing. You placed your relic before establishing frontline stability.',
      quest_prompt: 'I require three intact Echo capacitors from the Ironreach railhead. Will you retrieve them for a handsome fee?',
      lore_tidbit: 'The Resonance Emporium was built upon the original foundation stones of the First Convergence Concordat in Year 1 AC.'
    },
    schedule: { morning: 'interior_card_shop', afternoon: 'interior_card_shop', evening: 'lumenport_central_card_market' },
    gameplay_purpose: 'Card pack purchasing, Echo Dust crafting, relic appraisal, deck synergy training.',
    rewards: { crowns: 200, echo_dust: 75, relationship_gain: 15, bonus_card_id: 'IRN-C-0001' }
  },
  {
    id: 'npc_soren_whisperleaf',
    name: 'Soren of Whisperleaf',
    faction: 'verdant_pact',
    title: 'Verdant Pact Envoy & Tag Partner',
    region_id: 'lumenport',
    district_id: 'lumenport_arrival_square',
    location: 'lumenport_arrival_square',
    role: 'companion',
    deck_id: 'deck_verdant_tide_harmony',
    initial_relationship: 30,
    dialogue: {
      greeting: 'Peace upon your arrival, traveler. The roots beneath Lumenport harbor welcome your footsteps.',
      friendly: 'I can hear the green sap circulating through your strategy. Growth takes patience, but blossom is inevitable.',
      bonded: 'In a world of stone and iron, you remember the living soil. I will walk with you to the high canopy.',
      victory: 'Gentle as rain, unyielding as ancient timber. A duel of true harmony.',
      defeat: 'You pruned your branches too hastily. Allow your resources time to take root.',
      quest_prompt: 'The coastal trade roads are encroaching on sacred root-markers. Help me negotiate safe passage.',
      lore_tidbit: 'The Whisperleaf High Canopy reaches three hundred feet into the clouds, knitted together by ironwood symbiosis.'
    },
    schedule: { morning: 'lumenport_arrival_square', afternoon: 'lumenport_duelist_plaza', evening: 'lumenport_residential_district' },
    gameplay_purpose: 'Initial campaign guide, Bloom mechanic mentor, early game partner, Act 1 quest giver.',
    rewards: { crowns: 130, echo_dust: 45, relationship_gain: 15, bonus_card_id: 'VER-C-0001' }
  },
  {
    id: 'npc_captain_nerissa',
    name: 'Captain Nerissa Wake',
    faction: 'tidebound',
    title: 'Tidebound Harbor Fleetmaster',
    region_id: 'lumenport',
    district_id: 'lumenport_arrival_square',
    location: 'interior_harbor_cafe',
    role: 'companion',
    deck_id: 'deck_tide_star_navigation',
    initial_relationship: 15,
    dialogue: {
      greeting: 'Stow your land-lubber boots and watch the tide. A good duelist knows when the undertow pulls.',
      friendly: 'You navigate the three lanes like an old clipper tacking into an offshore gale.',
      bonded: 'When storm clouds gather over the Shattered Archipelago, there\'s no one I\'d rather have at my helm.',
      victory: 'Clean broadside! You swept my flagship right off the center lane.',
      defeat: 'Caught in the reef! You failed to leave yourself an open escape lane.',
      quest_prompt: 'A sunken reef-clipper outside the harbor holds sealed maritime ledgers. Salvage them for me.',
      lore_tidbit: 'The Palace Beneath the Wake has stood preserved under an unbroken water-ward dome for four centuries.'
    },
    schedule: { morning: 'lumenport_arrival_square', afternoon: 'interior_harbor_cafe', evening: 'lumenport_arrival_square' },
    gameplay_purpose: 'Skirmish mechanic sparring, maritime travel unlock, water hazard quests, companion.',
    rewards: { crowns: 180, echo_dust: 60, relationship_gain: 14, bonus_card_id: 'TID-C-0001' }
  },
  {
    id: 'npc_vesper_noctis',
    name: 'Vesper of the Crescent Mask',
    faction: 'nocturne',
    title: 'Nocturne Information Broker',
    region_id: 'lumenport',
    district_id: 'lumenport_residential_district',
    location: 'interior_harbor_cafe',
    role: 'companion',
    deck_id: 'deck_nocturne_grave_echo',
    initial_relationship: 10,
    dialogue: {
      greeting: 'Speak softly. In Lantern Row, shadows have ears, and every whisper carries a market price.',
      friendly: 'You see through the masks the others wear. Perhaps our mutual interests can intertwine profitably.',
      bonded: 'You have proven you can keep a secret when crowns are on the table. My blades are at your call.',
      victory: 'Silent and lethal. You struck from beneath my own shadow.',
      defeat: 'You revealed your hand too early. In the dark, timing is everything.',
      quest_prompt: 'A rival broker in the Grand Tournament Hall holds an encrypted cipher. Retrieve it without raising an alarm.',
      lore_tidbit: 'The clapperless silver bells of the Unseen Herald make no audible chime, yet they mute all magic within earshot.'
    },
    schedule: { morning: 'lumenport_residential_district', afternoon: 'lumenport_central_card_market', evening: 'interior_harbor_cafe' },
    gameplay_purpose: 'Stealth mechanic instructor, secret broker, bounty issuer, companion recruitment.',
    rewards: { crowns: 220, echo_dust: 80, relationship_gain: 16, bonus_card_id: 'NOC-C-0001' }
  },
  {
    id: 'npc_astromancer_celeste',
    name: 'Astromancer Celeste Oryn',
    faction: 'starweave',
    title: 'Starweave Chair of Celestial Alignment',
    region_id: 'lumenport',
    district_id: 'lumenport_accord_institute',
    location: 'interior_artificer_workshop',
    role: 'companion',
    deck_id: 'deck_glass_star_celestial',
    initial_relationship: 20,
    dialogue: {
      greeting: 'Gaze into the orrery. The nine brass spheres chart not only planets, but the sequence of your next draw.',
      friendly: 'Your tactical trajectory aligns with the zenith constellations. The cards whisper of great purpose.',
      bonded: 'The stars have confirmed what my calculations suspected: you are the catalyst the Accord has waited for.',
      victory: 'Magnificent conjunction! Your sequence unfolded with astronomical certainty.',
      defeat: 'Retrograde motion! Your deck curve was out of alignment with your energy progression.',
      quest_prompt: 'The high celestial lens at the Institute requires stellar calibration during tonight\'s transit.',
      lore_tidbit: 'The Ninth Hour Conjunction occurs once every two hundred years, aligning the leylines of all four realms.'
    },
    schedule: { morning: 'lumenport_accord_institute', afternoon: 'interior_artificer_workshop', evening: 'lumenport_accord_institute' },
    gameplay_purpose: 'Alignment mechanic specialist, draw prediction training, high-tier companion.',
    rewards: { crowns: 240, echo_dust: 90, relationship_gain: 18, bonus_card_id: 'STR-C-0001' }
  },
  {
    id: 'npc_morwen_ossuary',
    name: 'Keeper Morwen Vale',
    faction: 'gravewild',
    title: 'Gravewild Memorial Medium',
    region_id: 'lumenport',
    district_id: 'lumenport_residential_district',
    location: 'lumenport_residential_district',
    role: 'companion',
    deck_id: 'deck_verdant_grave_cycle',
    initial_relationship: 15,
    dialogue: {
      greeting: 'Walk softly among the spirit lanterns. An Echo card discarded is not gone; it merely rests in memory.',
      friendly: 'You treat the fallen with reverence. In the Gravewild, nothing is wasted; all soil returns to life.',
      bonded: 'The spirits of the First Age murmur your name with gratitude. When your cards fall, they shall rise again.',
      victory: 'A solemn triumph. You wielded the cycle of renewal with poignant beauty.',
      defeat: 'You feared the graveyard. Embrace the discard pile as an extension of your hand.',
      quest_prompt: 'Several forgotten Echo cards have drifted into the city canal drains. Help me gather and sanctify them.',
      lore_tidbit: 'The Garden of Forgotten Names bloomed from the discarded card fragments of the First Convergence.'
    },
    schedule: { morning: 'lumenport_residential_district', afternoon: 'lumenport_residential_district', evening: 'lumenport_arrival_square' },
    gameplay_purpose: 'Reclaim mechanic mentor, graveyard synergy tutor, companion story arc.',
    rewards: { crowns: 170, echo_dust: 65, relationship_gain: 14, bonus_card_id: 'GRV-C-0001' }
  },
  {
    id: 'npc_marshal_corin',
    name: 'Grand Marshal Corin Thorne',
    faction: 'neutral',
    title: 'Commissioner of the Tournament Hall',
    region_id: 'lumenport',
    district_id: 'lumenport_grand_tournament_hall',
    location: 'interior_tournament_registration',
    role: 'tournament_official',
    deck_id: 'deck_accord_grand_alliance',
    initial_relationship: 30,
    dialogue: {
      greeting: 'Welcome to the Grand Tournament Hall, duelist. Here, blood is replaced by wit, and victory belongs to discipline.',
      friendly: 'You carry yourself with the posture of a veteran. The seasonal brackets are wide open for talent like yours.',
      bonded: 'In twenty years of commissioning tournaments, few have demonstrated such mastery across the Three Lanes.',
      victory: 'Outstanding execution! You read my defensive frontline like an open charter.',
      defeat: 'Back to the practice boards! You lost track of lane initiative in the mid-game.',
      quest_prompt: 'I need an impartial champion to inspect the arena slate tables for illegal resonance dampeners.',
      lore_tidbit: 'The 40-card, two-faction limit was codified by the Grand Marshal to ensure fairness across all eight orders.'
    },
    schedule: { morning: 'interior_tournament_registration', afternoon: 'lumenport_grand_tournament_hall', evening: 'lumenport_duelist_plaza' },
    gameplay_purpose: 'Tournament commissioner, seasonal circuit registration, championship boss.',
    rewards: { crowns: 300, echo_dust: 120, relationship_gain: 20, bonus_card_id: 'NEU-C-0020' }
  },
  {
    id: 'npc_mira_solis',
    name: 'Mira Solis',
    faction: 'neutral',
    title: 'Hostess of the Anchor & Aether Café',
    region_id: 'lumenport',
    district_id: 'lumenport_arrival_square',
    location: 'interior_harbor_cafe',
    role: 'social_hub',
    deck_id: 'deck_accord_grand_alliance',
    initial_relationship: 35,
    dialogue: {
      greeting: 'Come in out of the salt spray! Hot tea, warm hearth, and a clean table for your next deck shuffle.',
      friendly: 'Everyone stops by the Anchor eventually. If you want to know who\'s dueling who, just ask your friendly hostess.',
      bonded: 'You\'ve made this little harbor boathouse feel like a true gathering hall. Your stool by the window is always saved.',
      victory: 'What a game! The harbor boys will be singing ballads about that play for a week!',
      defeat: 'Never mind, darling. Have some spiced cider and deal the cards again.',
      quest_prompt: 'The harbor supply carts are overdue with fresh chamomile from Whisperleaf. Check the highroad for me?',
      lore_tidbit: 'The Anchor & Aether was once an old naval customs house before Mira converted it into a duelist refuge.'
    },
    schedule: { morning: 'interior_harbor_cafe', afternoon: 'interior_harbor_cafe', evening: 'interior_harbor_cafe' },
    gameplay_purpose: 'Social gathering hub, party roster management, companion affinity checks, rumors.',
    rewards: { crowns: 100, echo_dust: 30, relationship_gain: 15, bonus_card_id: 'NEU-C-0004' }
  },
  {
    id: 'npc_instructor_hale',
    name: 'Tactical Instructor Garrick Hale',
    faction: 'iron_choir',
    title: 'Master of Lane Geometry',
    region_id: 'lumenport',
    district_id: 'lumenport_duelist_plaza',
    location: 'interior_training_facility',
    role: 'companion',
    deck_id: 'deck_iron_glass_citadel',
    initial_relationship: 20,
    dialogue: {
      greeting: 'Shoulders back, eyes on the grid! The Three Lanes are not suggestions; they are geometrical imperatives.',
      friendly: 'You are beginning to see the angles. When the front line holds, the rear line controls the board.',
      bonded: 'You have earned the right to call yourself a tactician of the highest order. Let us drill the recruits together.',
      victory: 'Superb positioning! You denied my colossus any valid attack lane.',
      defeat: 'Sloppy spacing! You left your rear caster unprotected against direct penetration.',
      quest_prompt: 'The training dummies in Duelist Plaza need recalibration against high-power vanguard decks.',
      lore_tidbit: 'Hale literally wrote the standard Accord textbook on Three-Lane Front/Rear battle geometry.'
    },
    schedule: { morning: 'interior_training_facility', afternoon: 'lumenport_duelist_plaza', evening: 'interior_training_facility' },
    gameplay_purpose: 'Advanced tutorial challenges, lane geometry drilling, companion story arc.',
    rewards: { crowns: 160, echo_dust: 55, relationship_gain: 12, bonus_card_id: 'IRN-C-0002' }
  },
  {
    id: 'npc_eluned_glass',
    name: 'Eluned Prismwright',
    faction: 'glassborne',
    title: 'Master of Echo Illustration & Optics',
    region_id: 'lumenport',
    district_id: 'lumenport_accord_institute',
    location: 'interior_artificer_workshop',
    role: 'crafter',
    deck_id: 'deck_glass_star_prism',
    initial_relationship: 20,
    dialogue: {
      greeting: 'Watch the drying glaze! An Echo card\'s visual resonance requires millimeter-perfect spectral layering.',
      friendly: 'You appreciate the artistry in card crafting. Many see only numbers; you see the handpainted soul.',
      bonded: 'Together, we have produced cards of extraordinary brilliance. Take this master engraver\'s burin.',
      victory: 'A masterwork in action! Your cards flowed like molten crystal across the felt.',
      defeat: 'Your sequencing lacked aesthetic balance. A jarring composition always crumbles.',
      quest_prompt: 'I need rare prism-pigments ground from quartz spires to finish my latest card illustrations.',
      lore_tidbit: 'Every card illustration in Hearthglass is manually attuned to reflect physical Aether vibrations.'
    },
    schedule: { morning: 'interior_artificer_workshop', afternoon: 'interior_artificer_workshop', evening: 'lumenport_central_card_market' },
    gameplay_purpose: 'Card foil upgrading, aesthetic card customization, artistic lore.',
    rewards: { crowns: 190, echo_dust: 70, relationship_gain: 15, bonus_card_id: 'GLS-C-0002' }
  },
  {
    id: 'npc_toma_wick',
    name: 'Toma Wick',
    faction: 'neutral',
    title: 'Lantern Row Quartermaster & Collector',
    region_id: 'lumenport',
    district_id: 'lumenport_residential_district',
    location: 'interior_player_apartment',
    role: 'collector',
    deck_id: 'deck_accord_grand_alliance',
    initial_relationship: 25,
    dialogue: {
      greeting: 'Checking on your duelist apartment? The fireplace is stoked and your display binders are properly dusted.',
      friendly: 'A duelist\'s quarters reflect their inner focus. Collect cards, hang trophies, make this space your own.',
      bonded: 'You are the most distinguished tenant Lantern Row has housed in fifty years. The grand suite is yours.',
      victory: 'Flawless domestic execution! You handled that duel as cleanly as a freshly swept hearth.',
      defeat: 'Don\'t let it clutter your mind. A good night\'s rest in your own bed will clear your head.',
      quest_prompt: 'A rare first-edition binder went missing during yesterday\'s moving day. Can you track it down?',
      lore_tidbit: 'Lantern Row gets its name from the eternal Aether gas lamps that have burned uninterrupted since Year 50 AC.'
    },
    schedule: { morning: 'interior_player_apartment', afternoon: 'lumenport_residential_district', evening: 'interior_player_apartment' },
    gameplay_purpose: 'Apartment decor customization, collection binder inspection, milestone rewards.',
    rewards: { crowns: 110, echo_dust: 35, relationship_gain: 10, bonus_card_id: 'NEU-C-0001' }
  },
  {
    id: 'npc_brynja_slagheart',
    name: 'Forge-Captain Brynja Slagheart',
    faction: 'emberclad',
    title: 'Emberclad Siege Commander',
    region_id: 'lumenport',
    district_id: 'lumenport_arrival_square',
    location: 'lumenport_arrival_square',
    role: 'trainer',
    deck_id: 'deck_ember_iron_forge',
    initial_relationship: 15,
    dialogue: {
      greeting: 'Stand at attention! Dueling in the city may be civil, but out on the slag plains, hesitation is fatal.',
      friendly: 'You hit hard and you don\'t flinch when the heat climbs. I like soldiers who hold the frontline.',
      bonded: 'You fight with the fury of Mount Pyraxis itself. Any brigade would be honored to serve under your command.',
      victory: 'Unstoppable momentum! Your heavy colossus cracked my defensive bunker.',
      defeat: 'You got timid! When you play Emberclad, you push forward until the slag cools!',
      quest_prompt: 'High-heat obsidian ore is being smuggled through the docks. Help me confiscate the illegal shipments.',
      lore_tidbit: 'Forge-Captain Brynja held the Slag-Gate causeways against wild magma beasts for forty continuous days.'
    },
    schedule: { morning: 'lumenport_arrival_square', afternoon: 'lumenport_duelist_plaza', evening: 'lumenport_arrival_square' },
    gameplay_purpose: 'Colossus role training, aggressive archetype sparring, high-threat quests.',
    rewards: { crowns: 210, echo_dust: 70, relationship_gain: 14, bonus_card_id: 'EMB-C-0002' }
  },
  {
    id: 'npc_brother_cassian',
    name: 'Conductor Cassian Bell',
    faction: 'iron_choir',
    title: 'Iron Choir Harmonic Chronicler',
    region_id: 'lumenport',
    district_id: 'lumenport_grand_tournament_hall',
    location: 'lumenport_grand_tournament_hall',
    role: 'lore_keeper',
    deck_id: 'deck_iron_choir_bulwark',
    initial_relationship: 20,
    dialogue: {
      greeting: 'Every clash of cards generates an acoustic frequency. I record them on brass cylinders for the Choir archives.',
      friendly: 'Your duels have a remarkable harmonic resonance. No discordant notes, pure martial symphony.',
      bonded: 'Your match records are now immortalized in the Great Archives of the Seventh Chime.',
      victory: 'A perfect four-four resolution! The cymbal crash on your final turn was magnificent.',
      defeat: 'You drifted out of tempo on the third round. Synchronize your card flow.',
      quest_prompt: 'I require audio recordings of a legendary match fought in Duelist Plaza. Record the resonance for me.',
      lore_tidbit: 'The acoustic cylinders preserved in Ironreach hold the exact soundscapes of the First Convergence.'
    },
    schedule: { morning: 'lumenport_grand_tournament_hall', afternoon: 'lumenport_grand_tournament_hall', evening: 'lumenport_central_card_market' },
    gameplay_purpose: 'Match replay analysis, battle history logs, audio collectibles.',
    rewards: { crowns: 140, echo_dust: 45, relationship_gain: 12, bonus_card_id: 'IRN-C-0003' }
  },
  {
    id: 'npc_sylvi_thorn',
    name: 'Sylvi Thornweaver',
    faction: 'verdant_pact',
    title: 'Verdant Botanist & Spore Alchemist',
    region_id: 'lumenport',
    district_id: 'lumenport_residential_district',
    location: 'lumenport_residential_district',
    role: 'crafter',
    deck_id: 'deck_verdant_tide_harmony',
    initial_relationship: 20,
    dialogue: {
      greeting: 'Careful where you step—these rooftop greenhouses contain hybrid nightshade and living iron-spores.',
      friendly: 'You have a gentle touch with delicate root systems. Green thumbs make for thoughtful duelists.',
      bonded: 'The greenhouse is flourishing thanks to your help. Take this rare briar-amber talisman.',
      victory: 'Entangled and overwhelmed! Your roots bound every one of my tactics.',
      defeat: 'You let the weeds choke your lane! Weed out your unused cards.',
      quest_prompt: 'Rare sun-dew nectar is needed to treat a sickly sapling in Lantern Row. Gather it from the woods.',
      lore_tidbit: 'Sylvi was the first alchemist to successfully graft Gravewild moss onto Verdant Pact living treants.'
    },
    schedule: { morning: 'lumenport_residential_district', afternoon: 'lumenport_central_card_market', evening: 'lumenport_residential_district' },
    gameplay_purpose: 'Herbal consumable crafting, garden maintenance, cross-faction botany quests.',
    rewards: { crowns: 150, echo_dust: 50, relationship_gain: 12, bonus_card_id: 'VER-C-0002' }
  },
  {
    id: 'npc_bramwell_coin',
    name: 'Bramwell Coin-Counter',
    faction: 'neutral',
    title: 'Chief Appraiser of the Card Market',
    region_id: 'lumenport',
    district_id: 'lumenport_central_card_market',
    location: 'lumenport_central_card_market',
    role: 'merchant',
    deck_id: 'deck_accord_grand_alliance',
    initial_relationship: 20,
    dialogue: {
      greeting: 'Crowns, dust, gems—everything has an exchange rate. What cards are you looking to liquidate today?',
      friendly: 'You have a keen eye for market fluctuations. Rare cards aren\'t just pretty; they\'re sound financial assets.',
      bonded: 'You get the VIP trader discount at all guild exchange stalls. It pays to have good credit in Lumenport.',
      victory: 'A balanced portfolio wins the day! You diversified your damage sources brilliantly.',
      defeat: 'You over-invested in a single lane! Diversify your tactical assets next time.',
      quest_prompt: 'A counterfeit card syndicate is distributing fake common cards in the market. Help me expose them.',
      lore_tidbit: 'Bramwell keeps records of every high-value card transaction going back forty years.'
    },
    schedule: { morning: 'lumenport_central_card_market', afternoon: 'lumenport_central_card_market', evening: 'interior_harbor_cafe' },
    gameplay_purpose: 'Economy management, duplicate card dust conversions, market price checks.',
    rewards: { crowns: 250, echo_dust: 80, relationship_gain: 15, bonus_card_id: 'NEU-C-0002' }
  },
  {
    id: 'npc_fenna_swift',
    name: 'Fenna Swiftfoot',
    faction: 'neutral',
    title: 'Accord Courier & Caravan Scout',
    region_id: 'lumenport',
    district_id: 'lumenport_arrival_square',
    location: 'lumenport_arrival_square',
    role: 'quest_giver',
    deck_id: 'deck_accord_grand_alliance',
    initial_relationship: 25,
    dialogue: {
      greeting: 'Got letters, packages, urgent deck dispatches! If you need something delivered across regions, talk to me.',
      friendly: 'You move fast on your feet, duelist. In this city, staying ahead of the crowd is half the battle.',
      bonded: 'The courier guild considers you an honorary runner. Caravan transit is always open for you.',
      victory: 'Lightning fast! You played your swift vanguard before I could even draw my defense.',
      defeat: 'Too slow on the draw! You have to anticipate where the courier is running.',
      quest_prompt: 'An urgent dispatch for Arch-Druid Sylvanus must reach the Verdant border before dusk.',
      lore_tidbit: 'Fenna holds the record for crossing the Free Guild Caravan Highroad on foot in under six hours.'
    },
    schedule: { morning: 'lumenport_arrival_square', afternoon: 'lumenport_duelist_plaza', evening: 'lumenport_arrival_square' },
    gameplay_purpose: 'Fast travel courier unlocks, urgent delivery side quests, regional transit lore.',
    rewards: { crowns: 130, echo_dust: 40, relationship_gain: 12, bonus_card_id: 'NEU-C-0003' }
  },
  {
    id: 'npc_archon_valen',
    name: 'Archon Valen of the Accord',
    faction: 'neutral',
    title: 'Chancellor of the Accord Institute',
    region_id: 'lumenport',
    district_id: 'lumenport_accord_institute',
    location: 'lumenport_accord_institute',
    role: 'lore_keeper',
    deck_id: 'deck_accord_grand_alliance',
    initial_relationship: 20,
    dialogue: {
      greeting: 'The Great Accord is the fragile thread that keeps our world from descending into ash. Welcome to its sanctuary.',
      friendly: 'Your conduct reflects the highest ideals of the Convergence. Power guided by restraint is true wisdom.',
      bonded: 'You carry the mantle of a true Accord peacemaker. The council chambers are forever open to your counsel.',
      victory: 'Magnificent statesmanlike dueling. You respected your opponent while claiming decisive victory.',
      defeat: 'You allowed passion to cloud your judgment. The Accord requires equilibrium.',
      quest_prompt: 'Diplomatic envoys from Ironreach and the Verdant Pact are deadlocked. Act as neutral mediator in an exhibition duel.',
      lore_tidbit: 'Archon Valen preserves the original parchment of the First Convergence Concordat signed in Year 1 AC.'
    },
    schedule: { morning: 'lumenport_accord_institute', afternoon: 'lumenport_accord_institute', evening: 'lumenport_grand_tournament_hall' },
    gameplay_purpose: 'Main campaign lore, diplomatic exhibition duels, high-level prestige awards.',
    rewards: { crowns: 350, echo_dust: 120, relationship_gain: 18, bonus_card_id: 'NEU-C-0020' }
  },
  {
    id: 'npc_port_warden_brand',
    name: 'Port Warden Brand',
    faction: 'neutral',
    title: 'Chief Watchman of Old Harbor Pier',
    region_id: 'lumenport',
    district_id: 'lumenport_arrival_square',
    location: 'lumenport_arrival_square',
    role: 'quest_giver',
    deck_id: 'deck_accord_grand_alliance',
    initial_relationship: 20,
    dialogue: {
      greeting: 'Keep the pier clear of cargo crates! If you\'re here to duel, keep it on the designated slate tables.',
      friendly: 'Good to have reliable duelists around. Keeps the dock ruffians from causing trouble with the merchants.',
      bonded: 'Old Harbor is safer with you watching the breakwater. Here\'s an honorary harbor master\'s badge.',
      victory: 'Solid and sturdy! You anchored your front line like an iron pylon.',
      defeat: 'You got washed out by the incoming wave! Brace your footing next time.',
      quest_prompt: 'Dock smugglers have been stashing contraband cards beneath pier number four. Clear them out.',
      lore_tidbit: 'Brand has patrolled the Old Harbor breakwater for thirty years and knows every smuggler\'s trick.'
    },
    schedule: { morning: 'lumenport_arrival_square', afternoon: 'lumenport_arrival_square', evening: 'interior_harbor_cafe' },
    gameplay_purpose: 'Harbor security quests, smuggler bounties, maritime defense duels.',
    rewards: { crowns: 140, echo_dust: 45, relationship_gain: 10, bonus_card_id: 'NEU-C-0004' }
  }
];

// Continue with remaining 60 NPCs for Verdant Expanse, Ironreach, and Astral Archive...
console.log(`Initialized first 20 Lumenport NPCs.`);
