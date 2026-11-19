/**
 * Hearthglass — Automated Card Lore, Visual Identity & Art-Prompt Compiler (Sections 3, 4, 5, 6, 8)
 *
 * Uses the Canonical World Bible (`world_bible.mjs`) with permanent entity IDs for:
 * - Regions (`WORLD_REGIONS`)
 * - 54 Sub-Regions & Landmarks (`WORLD_LANDMARKS`: 48 Major Faction + 6 Neutral Accord)
 * - 54 Named Characters & Historical Figures (`WORLD_FIGURES`: 48 Major Faction + 6 Neutral Accord)
 * - 10 Historical Eras (`WORLD_HISTORICAL_EVENTS`)
 * - 18 Organizations (`WORLD_ORGANIZATIONS`)
 *
 * Synthesizes multi-template, editorially varied biographies across 10 narrative structures
 * so cards never read like lightly rearranged single-template mad-libs.
 *
 * IMPORTANT: Never mutates authoritative gameplay statistics (`cost`, `attack`, `health`,
 * `keywords`, `mechanics`, `abilities`).
 */

import {
  WORLD_REGIONS,
  WORLD_LANDMARKS,
  WORLD_FIGURES,
  WORLD_HISTORICAL_EVENTS,
  WORLD_ORGANIZATIONS
} from './world_bible.mjs';

export const MASTER_ART_STYLE_GUIDE = {
  style_id: 'hearthglass_stylized_handpainted_v1',
  name: 'Hearthglass Hand-Painted Prismatic Fantasy',
  aspect_ratio: '3:4',
  target_resolution: '768x1024',
  core_aesthetic:
    'Rich stylized hand-painted fantasy illustration, tactile painterly brushwork, luminous Aether crystal accents, clear readable silhouette at tabletop card scale, dramatic atmospheric depth, cohesive material rendering.',
  strict_exclusions: [
    'NO text, NO numbers, NO numerals, NO letters, NO watermarks, NO signatures',
    'NO card borders, NO stat boxes, NO mana crystals, NO UI overlays, NO badges',
    'NO photorealistic stock photos, NO generic 3D renders, NO anime chibi distortion',
    'NO copyrighted characters or recognizable external franchise designs'
  ]
};

export const FACTION_VISUAL_GUIDES = {
  emberclad: {
    faction_id: 'emberclad',
    display_name: 'Emberclad',
    region_id: 'reg_crucible_reaches',
    region: 'The Crucible Reaches',
    materials: ['hammered obsidian plate', 'dark forge-iron', 'molten brass rivets', 'glowing slag-glass vents'],
    armor_and_gear: 'Heavy riveted furnace-plate, heat-vented pauldrons, piston warhammers, and slag-forged shields',
    palette: ['crimson', 'molten_amber', 'charcoal_black', 'volcanic_orange'],
    environment_motifs: 'Volcanic forge-foundries, basalt anvil causeways, lava conduits, and ember-lit crucibles',
    lighting_style: 'Intense under-lit magma glow with sharp amber rim-lighting and drifting cinder sparks',
    origin_culture: 'Guild-artificers and frontline crucible wardens of the volcanic Caldera Forges',
    habitat: 'The Crucible Reaches and the Foundry Ward of Lumenport'
  },
  verdant_pact: {
    faction_id: 'verdant_pact',
    display_name: 'Verdant Pact',
    region_id: 'reg_verdant_expanse',
    region: 'The Verdant Expanse',
    materials: ['living ironwood', 'braided sun-vines', 'emerald amber', 'moss-woven linen'],
    armor_and_gear: 'Carved heartwood breastplates, living vine-bucklers, amber-tipped staves, and spore lanterns',
    palette: ['emerald', 'moss_green', 'muted_gold', 'deep_bark_brown'],
    environment_motifs: 'Cathedral banyan roots, sun-dappled sacred groves, bioluminescent moss sanctuaries',
    lighting_style: 'Warm golden sunbeams filtering through high canopy foliage with emerald pollen motes',
    origin_culture: 'Symbiotic grove-keepers, ancient treants, and oath-bound wardens of Whisperleaf',
    habitat: 'The Verdant Expanse and the Botanical Terraces of Lumenport'
  },
  iron_choir: {
    faction_id: 'iron_choir',
    display_name: 'Iron Choir',
    region_id: 'reg_ironreach_canyons',
    region: 'The Ironreach Canyons',
    materials: ['polished clockwork brass', 'tempered steel', 'copper induction coils', 'blue Aether glass'],
    armor_and_gear: 'Articulated gear-driven plate, acoustic tuning halberds, rotating cog-bucklers, and arc-dynamos',
    palette: ['steel_gray', 'brass', 'electric_blue', 'dark_iron'],
    environment_motifs: 'Monumental clockwork cathedrals, planetary gear-trains, brass bell-towers, and gantry foundries',
    lighting_style: 'Crisp electric-blue arc illumination against warm burnished brass and rising steam',
    origin_culture: 'Harmonic engineers and synchronized clockwork automata of the Seventh Chime',
    habitat: 'Ironreach Canyons and the Resonance Emporium workshops in Lumenport'
  },
  tidebound: {
    faction_id: 'tidebound',
    display_name: 'Tidebound',
    region_id: 'reg_shattered_archipelago',
    region: 'The Shattered Archipelago & Abyssal Shelf',
    materials: ['iridescent mother-of-pearl', 'living reef-coral', 'abyssal sea-glass', 'woven kelp-silk'],
    armor_and_gear: 'Scalloped nacre lamellar, hydro-fan blades, twin-pronged coral tridents, and tidal astrolabes',
    palette: ['azure', 'turquoise', 'seafoam', 'pearl_white'],
    environment_motifs: 'Submerged marble temples, storm-lashed breakwaters, bioluminescent abyssal trenches',
    lighting_style: 'Dynamic caustic water reflections, translucent backlit wave crests, and deep-sea bioluminescence',
    origin_culture: 'Pelagic navigators, reef-wardens, and abyssal oracles of the Sunken Wake',
    habitat: 'Lumenport Old Harbor and the Palace Beneath the Wake'
  },
  glassborne: {
    faction_id: 'glassborne',
    display_name: 'Glassborne',
    region_id: 'reg_mirror_labyrinth',
    region: 'The Mirror Labyrinth & Prism Spires',
    materials: ['faceted resonant quartz', 'silver filigree', 'prismatic mirror-glass', 'iridescent silk'],
    armor_and_gear: 'Geometric crystal pauldrons, refractive rapiers, floating prism lenses, and mirror-shields',
    palette: ['violet', 'silver', 'translucent_cyan', 'iridescent_white'],
    environment_motifs: 'Infinite mirror galleries, soaring stained-crystal cathedrals, optical observatory halls',
    lighting_style: 'Sharp prismatic light dispersion, rainbow spectral caustics, and clean specular highlights',
    origin_culture: 'Precision duelists, optical scholars, and crystal archons of the Mirror Galleries',
    habitat: 'The Glass Cathedral and the Accord Institute Optical Wing'
  },
  nocturne: {
    faction_id: 'nocturne',
    display_name: 'Nocturne',
    region_id: 'reg_umbral_courts',
    region: 'The Umbral Courts & Crescent Undercity',
    materials: ['midnight velvet', 'tarnished sterling silver', 'smoked obsidian glass', 'shadow-steeped silk'],
    armor_and_gear: 'Porcelain masquerade masks, crescent daggers, clapperless silver bells, and smoke-woven cloaks',
    palette: ['midnight_blue', 'indigo', 'silver', 'restrained_crimson'],
    environment_motifs: 'Moonlit gothic belfries, fog-shrouded canal bridges, candlelit masquerade ballrooms',
    lighting_style: 'High-contrast pale moonlight rim-lighting, deep indigo shadows, and silver candle glints',
    origin_culture: 'Information brokers, masked duelists, and phantom archivists of the Unseen Herald',
    habitat: 'Crescent Alley and the Hollow Masquerade manor in Lumenport'
  },
  starweave: {
    faction_id: 'starweave',
    display_name: 'Starweave',
    region_id: 'reg_high_astral_archive',
    region: 'The High Astral Archive',
    materials: ['celestial gold', 'meteoric iron', 'nebula-woven damask', 'starlight crystal'],
    armor_and_gear: 'Constellation-inlaid plate, brass armillary spheres, astral longbows, and floating solar crowns',
    palette: ['midnight_purple', 'gold', 'celestial_blue', 'brilliant_white'],
    environment_motifs: 'Floating cloud-top observatories, golden orrery domes, star-bridge sanctuaries',
    lighting_style: 'Radiant golden starlight nodes connected by luminous constellation lines against deep cosmos purple',
    origin_culture: 'Astromancers, fate-charting seers, and cosmic paladins of the Ninth Hour',
    habitat: 'The Observatory Beyond Dawn and Lumenport Observatory District'
  },
  gravewild: {
    faction_id: 'gravewild',
    display_name: 'Gravewild',
    region_id: 'reg_sunken_ossuary',
    region: 'The Sunken Ossuary & Fossil Marshes',
    materials: ['fossilized bone', 'petrified bog-oak', 'burgundy briar-vines', 'verdigris swamp-iron'],
    armor_and_gear: 'Carved rib-plate armor, bone-framed spirit lanterns, moss-draped halberds, and memorial steles',
    palette: ['bone_white', 'deep_burgundy', 'moss_black', 'sickly_green'],
    environment_motifs: 'Overgrown memorial gardens, fossilized leviathan ribs, mist-shrouded cairns and ossuaries',
    lighting_style: 'Eerie spectral green memory-glow emerging from hollow bone and twilight marsh fog',
    origin_culture: 'Memorial keepers, spirit mediums, and risen fossil-remnants of the Forgotten Names',
    habitat: 'The Garden of Forgotten Names and the Old Catacomb Walks'
  },
  neutral: {
    faction_id: 'neutral',
    display_name: 'Neutral Accord',
    region_id: 'reg_free_city_lumenport',
    region: 'Free City of Lumenport & Accord Trade Roads',
    materials: ['weathered bronze', 'boiled caravan leather', 'travertine stone', 'sapphire Aether glass'],
    armor_and_gear: 'Practical mercenary brigandine, Accord wayfinder compasses, repeater crossbows, and slate wardstones',
    palette: ['warm_bronze', 'steel_gray', 'warm_gold', 'sapphire_blue'],
    environment_motifs: 'Lumenport cobblestone plazas, harbor docks, clocktower balconies, and open trade roads',
    lighting_style: 'Natural coastal daylight or warm harbor lantern light with clear readable contrast',
    origin_culture: 'Free guild mercenaries, traveling archivists, and Accord peacekeepers of Lumenport',
    habitat: 'Lumenport Arrival Square, Central Card Market, and Duelist Plaza'
  }
};

// Populate sub_regions and notable_figures on FACTION_VISUAL_GUIDES from the canonical World Bible
for (const [factionKey, guide] of Object.entries(FACTION_VISUAL_GUIDES)) {
  const landmarks = WORLD_LANDMARKS.filter((l) => l.faction === factionKey);
  const figures = WORLD_FIGURES.filter((f) => f.faction === factionKey);
  const orgs = WORLD_ORGANIZATIONS.filter((o) => o.faction === factionKey);
  guide.sub_regions = landmarks.map((l) => l.name);
  guide.landmark_entities = landmarks;
  guide.notable_figures = figures.map((f) => f.name);
  guide.figure_entities = figures;
  guide.organizations = orgs;
}

const ROLE_VISUAL_PROFILES = {
  vanguard: {
    combat_posture: 'Forward-leaning aggressive combat stance at the front of the lane',
    camera_angle: 'Dynamic eye-level three-quarter action shot',
    equipment_emphasis: 'Practical frontline melee weapon and agile vanguard armor',
    strategic_strengths: ['Early lane pressure', 'Efficient Aether-to-stat tempo', 'Frontline trading'],
    counterplay_options: ['High-health Bulwark guards', 'Quick removal tactics']
  },
  bulwark: {
    combat_posture: 'Planted, immovable defensive stance anchoring the Front slot',
    camera_angle: 'Slightly low-angle heroic framing emphasizing mass and protection',
    equipment_emphasis: 'Heavy tower shield, reinforced pauldrons, or protective barrier field',
    strategic_strengths: ['Protects fragile Rear support and caster units', 'Absorbs multi-hit aggression'],
    counterplay_options: ['Pierce damage', 'Corrode stat reduction', 'Silence effects']
  },
  assassin: {
    combat_posture: 'Coiled, low-profile strike posture emerging from cover or shadow',
    camera_angle: 'Dutch-angle dynamic close-up with sharp foreground/background contrast',
    equipment_emphasis: 'Twin precision blades, concealed cloak, and lightweight silent gear',
    strategic_strengths: ['High burst damage', 'Eliminating Rear backline threats'],
    counterplay_options: ['Guard units in the Front slot', 'Area-of-effect tactics', 'Shield counters']
  },
  marksman: {
    combat_posture: 'Poised long-range aiming stance from an elevated Rear vantage point',
    camera_angle: 'Medium shot looking along the line of fire with depth-of-field target focus',
    equipment_emphasis: 'Ranged bow, arcane rifle, harp-bow, or precision ballista',
    strategic_strengths: ['Reach targeting past unguarded Front units', 'Safe backline damage projection'],
    counterplay_options: ['Dive assassins with Reach or Skirmish', 'Direct damage tactics']
  },
  caster: {
    combat_posture: 'Expressive gesture channeling structured Aether glyphs and elemental energy',
    camera_angle: 'Centered medium portrait framed by swirling magical geometry',
    equipment_emphasis: 'Runed staff, floating grimoire, astrolabe, or focusing crystal lenses',
    strategic_strengths: ['Card advantage', 'Lane-wide status manipulation and spell synergy'],
    counterplay_options: ['Silence disruption', 'High-tempo aggressive vanguards']
  },
  support: {
    combat_posture: 'Uplifted protective posture radiating restorative aura outward to allies',
    camera_angle: 'Warm balanced medium shot with open inviting composition',
    equipment_emphasis: 'Restorative censer, tuning baton, banner, or sanctuary lantern',
    strategic_strengths: ['Sustains injured allies', 'Multiplies team stats across lanes'],
    counterplay_options: ['Eliminating the Support unit before its engine snowballs']
  },
  trickster: {
    combat_posture: 'Acrobatic mid-motion pivot, feint, or lane-shifting flourish',
    camera_angle: 'Dynamic wide-angle action framing capturing motion trails',
    equipment_emphasis: 'Grappling tethers, hydro-fans, illusion mirrors, or smoke vials',
    strategic_strengths: ['Repositioning units between lanes', 'Tempo disruption and surprise swaps'],
    counterplay_options: ['Anchor units immune to movement', 'Predictable lane locking']
  },
  summoner: {
    combat_posture: 'Commanding invocation pose surrounded by newly manifested Echo companions',
    camera_angle: 'Wider ensemble framing showing both the summoner and their emerging tokens',
    equipment_emphasis: 'Summoning totem, seed-lantern, drone-controller, or constellation whistle',
    strategic_strengths: ['Populates multiple slots from a single card', 'Triggers wide-board Resonance'],
    counterplay_options: ['Multi-target sweeping tactics', 'Pierce colossi']
  },
  controller: {
    combat_posture: 'Authoritative, composed stance projecting a field of restriction or silence',
    camera_angle: 'Symmetrical dramatic portrait with strong vertical architectural lines',
    equipment_emphasis: 'Dampening bell, binding chains, null-prism, or judicial seal',
    strategic_strengths: ['Neutralizes enemy buffs and triggers', 'Locks down key opposing lanes'],
    counterplay_options: ['Raw high-stat creatures that do not rely on triggered abilities']
  },
  colossus: {
    combat_posture: 'Monumental, ground-shaking stride dominating the entire battlefield lane',
    camera_angle: 'Dramatic low-angle worm’s-eye view with scale markers in the environment',
    equipment_emphasis: 'Massive siege weaponry, monolithic armor plating, and glowing Aether core',
    strategic_strengths: ['Late-game lane breaker', 'Massive stat presence and game-ending keywords'],
    counterplay_options: ['Hard removal tactics', 'Chump-blocking with Shield or Ward']
  }
};

const KEYWORD_VISUAL_CUES = {
  guard: 'interlocking defensive barrier aura and planted shield stance',
  swift: 'kinetic wind-streaks and blurred forward momentum',
  reach: 'elevated trajectory lines and extended targeting focus',
  pierce: 'armor-shattering kinetic impact spike',
  ward: 'translucent hexagonal prismatic spell-ward halo',
  stealth: 'wisps of concealing twilight mist and shadow refraction',
  drain: 'siphoning ribbons of vital crimson-emerald energy',
  anchor: 'heavy gravity runes locking the base to the stone floorplates',
  skirmish: 'fluid side-stepping water or wind trail',
  rebirth: 'emerging spectral phoenix-seed or lingering Echo core',
  burn: 'searing embers and scorching heat-haze distortion',
  growth: 'sprouting emerald leaves and golden vitality rings',
  shield: 'form-fitting hard-light Aether forcefield shell',
  exhaust: 'crackling electromagnetic or temporal stasis chains',
  silence: 'sound-absorbing indigo null-sphere',
  awaken: 'blazing full-power Aether resonance crest',
  resonate: 'harmonic dual-lane leyline beams connecting beneath the feet',
  recall: 'swirling return-portal eddy',
  corrode: 'pitting acid-green decay spores and rust wisps',
  echo: 'secondary translucent afterimage projection'
};

const DISPOSITION_TRAITS = [
  'Fiercely territorial yet bound by ancient oath',
  'Methodical and calculating under battlefield pressure',
  'Zealously devoted to the harmonic purity of their order',
  'Wary of outsiders but unshakably loyal to lane-mates',
  'Recklessly bold when channeling peak Aether resonance',
  'Serene and patient, waiting for the exact moment of convergence',
  'Battle-scarred, pragmatic, and disdainful of ornamental flourish',
  'Curious, perceptive, and attuned to subtle leyline shifts',
  'Grimly resolute, carrying the memory of fallen predecessors',
  'Proud, disciplined, and relentless in pursuit of tactical superiority',
  'Quicksilver-tempered and fond of misdirection',
  'Stoic and unyielding even when outnumbered across all three lanes'
];

function deterministicHash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Multi-template editorial biography composer.
 * Uses 10 distinct narrative structures (for creatures) and 6 distinct provenance structures
 * (for tactics, relics, and environments) so cards have genuinely distinct voices, openings,
 * closings, and storytelling angles while referencing verified permanent World Bible entity IDs.
 */
function buildEditorialCreatureBiography({
  rawCard,
  subtypeLabel,
  landmark,
  secondaryLandmark,
  primaryFigure,
  secondaryFigure,
  organization,
  era,
  brief,
  templateIdx
}) {
  const subjectText = brief.subject || rawCard.name;
  const kwList = (rawCard.keywords || []).length > 0 ? rawCard.keywords.join(', ') : 'focused lane presence';

  switch (templateIdx % 10) {
    case 0:
      return `${rawCard.lore} Within the ranks of the ${organization.name}, ${rawCard.name} is remembered from the records of ${era.name} at ${landmark.name}. ${primaryFigure.name} (${primaryFigure.title}) still deploys this ${subtypeLabel} whenever a ${rawCard.cost}-Aether ${rawCard.role} is needed to anchor the Front-to-Rear geometry with ${rawCard.attack} Attack and ${rawCard.health} Health.`;
    case 1:
      return `At ${landmark.name} — where ${landmark.narrative_hook.charAt(0).toLowerCase() + landmark.narrative_hook.slice(1)} — ${rawCard.name} earned a lasting reputation among the ${organization.name}. ${rawCard.lore} In Convergence Duels, ${primaryFigure.name} pairs it with ${secondaryFigure.name}'s formations to leverage ${kwList} across contested lanes.`;
    case 2:
      return `"${rawCard.lore}" — field annotation by ${primaryFigure.name}. First documented during ${era.name} (${era.year}), ${rawCard.name} exemplifies how the ${organization.name} adapts to high-pressure three-lane duels between ${landmark.name} and ${secondaryLandmark.name}.`;
    case 3:
      return `Few sights along ${landmark.name} are as unmistakable as ${subjectText.charAt(0).toLowerCase() + subjectText.slice(1)}. ${rawCard.lore} Sworn to the ${organization.name} since ${era.name}, this ${rawCard.rarity} ${subtypeLabel} answers ${primaryFigure.name}'s call as a ${rawCard.attack}/${rawCard.health} ${rawCard.role}.`;
    case 4:
      return `During ${era.name}, the ${organization.name} relied on specialists capable of holding ${landmark.name} against overwhelming odds. ${rawCard.name} emerged from that crucible: ${rawCard.lore} Today, duelists studying under ${primaryFigure.name} prize its ${rawCard.cost}-Aether tempo and ${kwList}.`;
    case 5:
      return `${primaryFigure.name} often warns initiates at ${landmark.name} never to misjudge ${rawCard.name}. ${rawCard.lore} Whether patrolling ${secondaryLandmark.name} for the ${organization.name} or manifesting on the Convergence slate, its ${rawCard.attack} Attack and ${rawCard.health} Health punish careless lane positioning.`;
    case 6:
      return `Born of the traditions that shaped ${landmark.name} after ${era.name}, ${rawCard.name} serves the ${organization.name} as a dedicated ${rawCard.role}. ${rawCard.lore} Even ${secondaryFigure.name} acknowledges the tactical leverage its ${kwList} brings to a forty-card deck.`;
    case 7:
      return `The archives of the ${organization.name} at ${landmark.name} preserve the original Echo impression of ${rawCard.name}, dated to ${era.year} (${era.name}). ${rawCard.lore} On the tabletop, ${primaryFigure.name} uses its ${rawCard.cost}-Aether profile (${rawCard.attack}/${rawCard.health}) to swing two-lane Resonance.`;
    case 8:
      return `Where ordinary ${subtypeLabel} units falter, ${rawCard.name} thrives amidst the hazards of ${landmark.name}. ${rawCard.lore} Trained under the doctrine of ${primaryFigure.name} and the ${organization.name}, it turns every skirmish near ${secondaryLandmark.name} into a display of ${kwList}.`;
    default:
      return `Chronicles of ${era.name} recount how ${primaryFigure.name} and ${secondaryFigure.name} first encountered ${rawCard.name} guarding the approaches to ${landmark.name}. ${rawCard.lore} Now a mainstay of the ${organization.name}, this ${rawCard.cost}-Aether ${rawCard.role} rewards disciplined resource timing.`;
  }
}

function buildEditorialNonCreatureBiography({
  rawCard,
  subtypeLabel,
  landmark,
  secondaryLandmark,
  primaryFigure,
  secondaryFigure,
  organization,
  era,
  templateIdx
}) {
  switch (templateIdx % 6) {
    case 0:
      return `${rawCard.lore} Codified by ${primaryFigure.name} (${primaryFigure.title}) for the ${organization.name} during ${era.name}, ${rawCard.name} channels the resonant signature of ${landmark.name} into a ${rawCard.cost}-Aether ${rawCard.type}.`;
    case 1:
      return `At ${landmark.name}, ${landmark.narrative_hook} ${rawCard.name} draws directly upon that legacy: ${rawCard.lore} Preserved by the ${organization.name} since ${era.year}, it remains a signature ${subtypeLabel} tool in ${primaryFigure.name}'s repertoire.`;
    case 2:
      return `"${rawCard.lore}" — treatise by ${primaryFigure.name} of the ${organization.name}. Originating at ${landmark.name} during ${era.name}, this ${rawCard.rarity} ${rawCard.type} allows duelists to reshape lane momentum at ${rawCard.cost} Aether.`;
    case 3:
      return `When ${era.name} tested the defenses of ${landmark.name}, the ${organization.name} unveiled ${rawCard.name}. ${rawCard.lore} Both ${primaryFigure.name} and ${secondaryFigure.name} still regard it as a benchmark of ${subtypeLabel} design.`;
    case 4:
      return `Few artifacts or doctrines from ${landmark.name} carry as much history as ${rawCard.name}. ${rawCard.lore} Guarded by the ${organization.name} and studied at ${secondaryLandmark.name}, its ${rawCard.cost}-Aether effect (${rawCard.description}) rewards precise timing.`;
    default:
      return `Inscribed into the ledgers of the ${organization.name} at ${landmark.name} during ${era.name} (${era.year}), ${rawCard.name} captures a decisive moment of faction history: ${rawCard.lore} ${primaryFigure.name} recommends it for decks seeking reliable ${subtypeLabel} leverage.`;
  }
}

/**
 * Compiles structured gameplay metadata, World-Bible-linked character/item/location lore,
 * and a deterministic visual specification + hosted AI image prompt for a card.
 */
export function compileCardLoreAndArt(rawCard) {
  const factionGuide = FACTION_VISUAL_GUIDES[rawCard.faction] || FACTION_VISUAL_GUIDES.neutral;
  const roleProfile = rawCard.role ? ROLE_VISUAL_PROFILES[rawCard.role] : null;
  const brief = rawCard.art || {};
  const h = deterministicHash(`${rawCard.id}:${rawCard.name}:${rawCard.lore}`);

  // 1. Gameplay Metadata (Section 4.2)
  const operations = (rawCard.abilities || []).flatMap((a) => (a.effects || []).map((e) => e.operation));
  const effectTargets = Array.from(
    new Set((rawCard.abilities || []).flatMap((a) => (a.effects || []).map((e) => e.target)))
  );

  const timingRestrictions =
    rawCard.type === 'tactic'
      ? rawCard.subtype === 'quick' || rawCard.subtype === 'counter'
        ? 'Main Phase or Quick Response Window'
        : 'Active Player Main Phase'
      : 'Active Player Main Phase (requires open lane/zone slot)';

  const statusInteractions = [
    ...(rawCard.keywords || []),
    ...(rawCard.mechanics || []),
    ...operations.filter((op) => ['add_counter', 'grant_keyword', 'silence'].includes(op))
  ];

  const resourceInteractions = [];
  if (operations.includes('gain_aether')) resourceInteractions.push('Generates temporary Aether');
  if (operations.includes('draw')) resourceInteractions.push('Draws cards from deck');
  if (operations.includes('reclaim_from_discard')) resourceInteractions.push('Recovers non-reclaimed cards from discard pile');
  if (operations.includes('scry_top_deck')) resourceInteractions.push('Manipulates top card of deck');
  if (resourceInteractions.length === 0) resourceInteractions.push(`Standard ${rawCard.cost} Aether deployment`);

  const strategicStrengths = roleProfile
    ? [...roleProfile.strategic_strengths]
    : rawCard.type === 'tactic'
      ? ['Immediate tactical tempo swing', 'Direct spell interaction']
      : rawCard.type === 'relic'
        ? ['Persistent turn-over-turn Relic zone value', 'Synergy engine for faction mechanic']
        : ['Global battlefield rule modification', 'Rewards multi-lane positioning'];

  const counterplayOptions = roleProfile
    ? [...roleProfile.counterplay_options]
    : rawCard.type === 'tactic'
      ? ['Ward spell protection', 'Counter-tactics and Shield buffers']
      : rawCard.type === 'relic'
        ? ['High-tempo lane pressure to punish Relic setup turn']
        : ['Replacing the active Environment with your own Environment card'];

  const legalTargetingRules =
    effectTargets.length > 0
      ? `Resolves against: ${effectTargets.join(', ')}`
      : rawCard.type === 'creature'
        ? 'Deploys to an open Front or Rear slot in any of the 3 lanes; attacks Front opposing units unless Reach/Stealth applies.'
        : 'Deploys directly to its designated tabletop zone.';

  // 2. Canonical World Bible Entity Links (Section 3)
  const subtypeLabel = (rawCard.subtype || 'entity').replace(/_/g, ' ');
  const isCreature = rawCard.type === 'creature';

  const landmarks = factionGuide.landmark_entities;
  const figures = factionGuide.figure_entities;
  const orgs = factionGuide.organizations;

  const primaryLandmark = landmarks[h % landmarks.length];
  const secondaryLandmark = landmarks[(h + 3) % landmarks.length];
  const primaryFigure = figures[h % figures.length];
  const secondaryFigure = figures[(h + 2) % figures.length];
  const organization = orgs[h % orgs.length];
  const historicalEra = WORLD_HISTORICAL_EVENTS[h % WORLD_HISTORICAL_EVENTS.length];
  const disposition = DISPOSITION_TRAITS[h % DISPOSITION_TRAITS.length];

  const scaleDescriptor =
    rawCard.cost <= 2
      ? 'nimble, quick-deploying'
      : rawCard.cost <= 4
        ? 'battle-tested mid-weight'
        : 'towering, high-Aether';

  const keywordNarrative =
    (rawCard.keywords || []).length > 0
      ? `exhibiting ${(rawCard.keywords || []).map((k) => KEYWORD_VISUAL_CUES[k] || k).join(' and ')}`
      : `attuned to ${factionGuide.display_name} Aether discipline`;

  const identity = isCreature
    ? {
        entity_kind: 'creature',
        original_name: rawCard.name,
        species_or_classification: subtypeLabel,
        world_bible_refs: {
          region_id: factionGuide.region_id,
          primary_landmark_id: primaryLandmark.id,
          secondary_landmark_id: secondaryLandmark.id,
          primary_figure_id: primaryFigure.id,
          secondary_figure_id: secondaryFigure.id,
          organization_id: organization.id,
          historical_event_id: historicalEra.id
        },
        origin: `${primaryLandmark.name}, ${factionGuide.region}`,
        physical_appearance: `${brief.subject || rawCard.name} — a ${scaleDescriptor} ${subtypeLabel} (${brief.silhouette || 'distinctive combat silhouette'}) clad in ${factionGuide.materials[h % factionGuide.materials.length]} and ${factionGuide.materials[(h + 1) % factionGuide.materials.length]}, ${keywordNarrative}.`,
        personality_or_disposition: `${disposition}. Operates as a ${rawCard.role} (${rawCard.attack} Attack / ${rawCard.health} Health) affiliated with the ${organization.name} at ${primaryLandmark.name}.`,
        history: `${rawCard.lore} First recorded during ${historicalEra.name} (${historicalEra.year}) when ${primaryFigure.name} mobilized the ${organization.name} at ${primaryLandmark.name}.`,
        faction_allegiance: `${factionGuide.display_name} (${organization.name})`,
        important_relationships: `Serves alongside ${primaryFigure.name} (${primaryFigure.title}) at ${primaryLandmark.name} and coordinates three-lane maneuvers with ${secondaryFigure.name}.`,
        habitats: [brief.environment || primaryLandmark.name, secondaryLandmark.name, factionGuide.region],
        world_abilities: `Channels ${factionGuide.display_name} resonance (${(rawCard.mechanics || ['aether_focus']).join(', ')}) to manifest: ${rawCard.description}`,
        narrative_importance:
          rawCard.rarity === 'legendary'
            ? `Pivotal named figure in the Convergence Chronicles of ${primaryLandmark.name}, counselled directly by ${primaryFigure.name}.`
            : rawCard.rarity === 'rare'
              ? `Renowned specialist of the ${organization.name} sought after by veteran tournament duelists in Lumenport.`
              : `Dependable ${subtypeLabel} forming the field backbone of the ${organization.name} across ${primaryLandmark.name}.`,
        flavor_text: rawCard.lore,
        collection_biography: buildEditorialCreatureBiography({
          rawCard,
          subtypeLabel,
          landmark: primaryLandmark,
          secondaryLandmark,
          primaryFigure,
          secondaryFigure,
          organization,
          era: historicalEra,
          brief,
          templateIdx: h
        })
      }
    : {
        entity_kind: rawCard.type,
        original_name: rawCard.name,
        classification: `${factionGuide.display_name} ${rawCard.type} (${subtypeLabel})`,
        world_bible_refs: {
          region_id: factionGuide.region_id,
          primary_landmark_id: primaryLandmark.id,
          secondary_landmark_id: secondaryLandmark.id,
          primary_figure_id: primaryFigure.id,
          secondary_figure_id: secondaryFigure.id,
          organization_id: organization.id,
          historical_event_id: historicalEra.id
        },
        origin: `${primaryLandmark.name} (${factionGuide.region})`,
        historical_provenance: `${rawCard.lore} Established during ${historicalEra.name} (${historicalEra.year}) by ${primaryFigure.name} and the ${organization.name} at ${primaryLandmark.name}.`,
        mechanism_of_action: `At ${rawCard.cost} Aether, projects the resonant imprint of ${primaryLandmark.name}: ${rawCard.description}`,
        faction_allegiance: `${factionGuide.display_name} (${organization.name})`,
        associated_locations: [brief.environment || primaryLandmark.name, secondaryLandmark.name, factionGuide.region],
        narrative_importance:
          rawCard.type === 'environment'
            ? `A real physical landmark within ${primaryLandmark.name} (${factionGuide.region}) that envoys can study and project onto the three-lane Convergence tabletop.`
            : rawCard.type === 'relic'
              ? `An enduring artifact of the ${organization.name}, forged during ${historicalEra.name} and safeguarded by ${primaryFigure.name}.`
              : `A codified ${subtypeLabel} tactic perfected by ${primaryFigure.name} and the ${organization.name} at ${primaryLandmark.name}.`,
        flavor_text: rawCard.lore,
        collection_biography: buildEditorialNonCreatureBiography({
          rawCard,
          subtypeLabel,
          landmark: primaryLandmark,
          secondaryLandmark,
          primaryFigure,
          secondaryFigure,
          organization,
          era: historicalEra,
          templateIdx: h
        })
      };

  // 3. Visual Specification & Deterministic Art Prompt Compiler (Sections 4.5, 5, 8)
  const keywordCues = (rawCard.keywords || [])
    .map((kw) => KEYWORD_VISUAL_CUES[kw])
    .filter(Boolean);

  const materials = factionGuide.materials;
  const palette = Array.isArray(brief.palette) && brief.palette.length > 0 ? brief.palette : factionGuide.palette;
  const cameraComposition =
    rawCard.rarity === 'legendary'
      ? 'Epic cinematic composition with grand architectural framing and multi-layered depth'
      : roleProfile
        ? roleProfile.camera_angle
        : rawCard.type === 'environment'
          ? 'Wide atmospheric establishing shot with strong foreground framing and deep perspective'
          : rawCard.type === 'relic'
            ? 'Heroic centered object focus on an ornate pedestal with dramatic rim-lighting'
            : 'Dynamic spell-action mid-shot capturing energy motion and clear focal impact';

  const pose = roleProfile
    ? roleProfile.combat_posture
    : rawCard.type === 'environment'
      ? 'Expansive architectural vista with subtle ambient motion'
      : rawCard.type === 'relic'
        ? 'Suspended or mounted in active Aether resonance'
        : 'High-energy kinetic spell release';

  const visualEffects =
    keywordCues.length > 0
      ? keywordCues.join('; ')
      : `Subtle ${factionGuide.display_name} Aether particles and resonant light motes`;

  const mood =
    rawCard.faction === 'emberclad'
      ? 'Fierce, industrial, and incandescent'
      : rawCard.faction === 'verdant_pact'
        ? 'Serene, ancient, and flourishing'
        : rawCard.faction === 'iron_choir'
          ? 'Precise, disciplined, and harmonic'
          : rawCard.faction === 'tidebound'
            ? 'Fluid, mysterious, and surging'
            : rawCard.faction === 'glassborne'
              ? 'Luminous, crystalline, and razor-sharp'
              : rawCard.faction === 'nocturne'
                ? 'Enigmatic, nocturnal, and aristocratic'
                : rawCard.faction === 'starweave'
                  ? 'Cosmic, prophetic, and transcendent'
                  : rawCard.faction === 'gravewild'
                    ? 'Melancholic, primordial, and hauntingly resilient'
                    : 'Adventurous, grounded, and heroic';

  const compiledPrompt = [
    `${MASTER_ART_STYLE_GUIDE.core_aesthetic}`,
    `Subject: ${brief.subject || rawCard.name}.`,
    `Faction Style (${factionGuide.display_name} — ${primaryLandmark.name}): ${factionGuide.armor_and_gear}, crafted from ${materials.join(', ')}.`,
    `Silhouette & Pose: ${brief.silhouette || 'Distinctive readable silhouette'}; ${pose}.`,
    `Camera & Composition: ${cameraComposition}, vertical 3:4 card illustration framing.`,
    `Environment & Background: ${brief.environment || primaryLandmark.name} in ${factionGuide.region} (${factionGuide.environment_motifs}).`,
    `Lighting & Color Palette: ${brief.lighting || factionGuide.lighting_style}; dominant colors ${palette.join(', ')}.`,
    `Visual Effects & Mood: ${visualEffects}. Mood: ${mood}.`,
    `Full-bleed illustration only — strictly no text, no numbers, no card frame, no UI elements.`
  ].join(' ');

  return {
    gameplay_metadata: {
      effect_targets: effectTargets,
      timing_restrictions: timingRestrictions,
      status_interactions: statusInteractions,
      resource_interactions: resourceInteractions,
      archetype_membership: rawCard.archetypes || [],
      strategic_strengths: strategicStrengths,
      weaknesses: rawCard.weaknesses || [],
      counterplay_options: counterplayOptions,
      legal_targeting_rules: legalTargetingRules,
      synergy_references: (rawCard.mechanics || []).concat(rawCard.archetypes || []),
      balance_metadata: {
        cost_curve_tier: rawCard.cost <= 2 ? 'early' : rawCard.cost <= 4 ? 'mid' : 'late',
        power_budget_score:
          rawCard.type === 'creature'
            ? rawCard.attack + rawCard.health + (rawCard.keywords || []).length
            : rawCard.cost * 2 + (rawCard.abilities || []).length
      }
    },
    identity,
    art_specification: {
      subject: brief.subject || rawCard.name,
      silhouette: brief.silhouette || 'Readable fantasy silhouette',
      materials,
      clothing_or_armor: roleProfile ? roleProfile.equipment_emphasis : factionGuide.armor_and_gear,
      weapons_or_equipment: factionGuide.armor_and_gear,
      palette,
      background: `${brief.environment || primaryLandmark.name} (${factionGuide.region})`,
      lighting: brief.lighting || factionGuide.lighting_style,
      camera_composition: cameraComposition,
      pose,
      visual_effects: visualEffects,
      mood,
      prompt: compiledPrompt,
      visual_exclusions: MASTER_ART_STYLE_GUIDE.strict_exclusions,
      reference_style_id: MASTER_ART_STYLE_GUIDE.style_id
    }
  };
}
