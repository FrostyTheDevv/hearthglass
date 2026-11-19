import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const VALID_FACTIONS = new Set([
  'emberclad',
  'verdant_pact',
  'iron_choir',
  'tidebound',
  'glassborne',
  'nocturne',
  'starweave',
  'gravewild',
  'neutral'
]);

const VALID_TYPES = new Set(['creature', 'tactic', 'relic', 'environment']);

const VALID_RARITIES = new Set(['common', 'uncommon', 'rare', 'legendary']);

const VALID_ROLES = new Set([
  'vanguard',
  'bulwark',
  'assassin',
  'marksman',
  'caster',
  'support',
  'trickster',
  'summoner',
  'controller',
  'colossus'
]);

const VALID_KEYWORDS = new Set([
  'guard',
  'swift',
  'reach',
  'pierce',
  'ward',
  'stealth',
  'drain',
  'anchor',
  'skirmish',
  'rebirth',
  'burn',
  'growth',
  'shield',
  'exhaust',
  'silence',
  'awaken',
  'resonate',
  'recall',
  'corrode',
  'echo'
]);

const VALID_TRIGGERS = new Set([
  'on_summon',
  'on_play',
  'after_this_attacks',
  'when_damaged',
  'on_death',
  'on_move',
  'turn_start',
  'turn_end'
]);

const VALID_OPERATIONS = new Set([
  'deal_damage',
  'heal',
  'draw',
  'discard',
  'summon_token',
  'destroy',
  'return_to_hand',
  'move_lane',
  'add_counter',
  'remove_counter',
  'modify_stats',
  'grant_keyword',
  'silence',
  'gain_aether',
  'reclaim_from_discard',
  'scry_top_deck'
]);

const VALID_TARGETS = new Set([
  'self',
  'ally_leader',
  'enemy_leader',
  'enemy_in_lane',
  'target_enemy_creature',
  'all_enemy_creatures',
  'all_ally_creatures',
  'ally_creature_in_lane_or_any',
  'strongest_ally_creature',
  'open_ally_slot',
  'event_source'
]);

const COPY_LIMITS = {
  common: 3,
  uncommon: 3,
  rare: 2,
  legendary: 1
};

// Full 640-card release ceiling per faction/type & rarity (Section 3)
const RELEASE_640_TYPE_CAPS = {
  major_faction: { creature: 36, tactic: 12, relic: 8, environment: 4, total: 60 },
  neutral: { creature: 80, tactic: 40, relic: 24, environment: 16, total: 160 }
};

const RELEASE_640_RARITY_CAPS = {
  common: 320,
  uncommon: 192,
  rare: 96,
  legendary: 32
};

export function validateCardCatalogue() {
  const bundlePath = path.join(ROOT, 'content', 'cards', 'foundations_v1.json');
  const decksPath = path.join(ROOT, 'content', 'cards', 'starter_decks.json');
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  const decksFile = JSON.parse(fs.readFileSync(decksPath, 'utf8'));

  const errors = [];
  const qualityWarnings = [];
  const seenIds = new Set();
  const seenNames = new Set();
  const seenFlavorTexts = new Set();
  const seenBiographies = new Set();
  const cardById = new Map();
  const factionCounts = {};
  const factionTypeMatrix = {};
  const typeCounts = { creature: 0, tactic: 0, relic: 0, environment: 0 };
  const rarityCounts = { common: 0, uncommon: 0, rare: 0, legendary: 0 };
  const roleCoverage = new Set();
  const mechanicalSignatures = new Map();

  let cardsWithCompleteLore = 0;
  let cardsWithCompiledArtPrompt = 0;
  let cardsWithConceptIllustrationsIntegrated = 0;
  let cardsWithFinalProductionArtworkApproved = 0;

  for (const faction of VALID_FACTIONS) {
    factionTypeMatrix[faction] = { creature: 0, tactic: 0, relic: 0, environment: 0 };
  }

  for (const card of bundle.cards) {
    if (!card.id || typeof card.id !== 'string') {
      errors.push(`Card missing valid ID: ${JSON.stringify(card)}`);
      continue;
    }
    if (seenIds.has(card.id)) {
      errors.push(`Duplicate card ID: ${card.id}`);
    }
    seenIds.add(card.id);
    cardById.set(card.id, card);

    if (!card.name || seenNames.has(card.name)) {
      errors.push(`Missing or duplicate card name on ${card.id}: ${card.name}`);
    }
    seenNames.add(card.name);

    if (!VALID_FACTIONS.has(card.faction)) {
      errors.push(`Invalid faction on ${card.id}: ${card.faction}`);
    }
    factionCounts[card.faction] = (factionCounts[card.faction] || 0) + 1;

    if (!VALID_TYPES.has(card.type)) {
      errors.push(`Invalid type on ${card.id}: ${card.type}`);
    } else {
      typeCounts[card.type]++;
      if (factionTypeMatrix[card.faction]) {
        factionTypeMatrix[card.faction][card.type]++;
      }
    }

    if (!VALID_RARITIES.has(card.rarity)) {
      errors.push(`Invalid rarity on ${card.id}: ${card.rarity}`);
    } else {
      rarityCounts[card.rarity]++;
    }

    if (typeof card.cost !== 'number' || card.cost < 0 || card.cost > 10) {
      errors.push(`Invalid Aether cost on ${card.id}: ${card.cost}`);
    }

    if (!card.description || typeof card.description !== 'string' || card.description.trim().length < 8) {
      errors.push(`Card ${card.id} is missing a meaningful ability description`);
    }

    if (!card.name_key || !card.description_key) {
      errors.push(`Card ${card.id} is missing localization keys`);
    }

    if (card.type === 'creature') {
      if (!VALID_ROLES.has(card.role)) {
        errors.push(`Creature ${card.id} has invalid role: ${card.role}`);
      } else {
        roleCoverage.add(card.role);
      }
      if (typeof card.attack !== 'number' || card.attack < 0 || typeof card.health !== 'number' || card.health < 1) {
        errors.push(`Creature ${card.id} has invalid stats: ${card.attack}/${card.health}`);
      }
    } else if (card.attack !== 0 || card.health !== 0) {
      errors.push(`Non-creature ${card.id} (${card.type}) has non-zero creature stats: ${card.attack}/${card.health}`);
    }

    for (const kw of card.keywords || []) {
      if (!VALID_KEYWORDS.has(kw)) {
        errors.push(`Card ${card.id} has unknown keyword: ${kw}`);
      }
    }

    for (const ab of card.abilities || []) {
      if (!VALID_TRIGGERS.has(ab.trigger)) {
        errors.push(`Card ${card.id} has invalid trigger: ${ab.trigger}`);
      }
      for (const eff of ab.effects || []) {
        if (!VALID_OPERATIONS.has(eff.operation)) {
          errors.push(`Card ${card.id} has invalid effect operation: ${eff.operation}`);
        }
        if (eff.target && !VALID_TARGETS.has(eff.target)) {
          errors.push(`Card ${card.id} has invalid effect target: ${eff.target}`);
        }
      }
    }

    // Lore & Identity completeness and uniqueness check (Section 4)
    if (
      card.lore &&
      card.identity &&
      card.identity.origin &&
      card.identity.flavor_text &&
      card.identity.collection_biography &&
      card.gameplay_metadata &&
      card.gameplay_metadata.timing_restrictions
    ) {
      if (seenFlavorTexts.has(card.identity.flavor_text)) {
        errors.push(`Duplicate flavor_text detected on ${card.id}`);
      }
      seenFlavorTexts.add(card.identity.flavor_text);

      if (seenBiographies.has(card.identity.collection_biography)) {
        errors.push(`Duplicate collection_biography detected on ${card.id}`);
      }
      seenBiographies.add(card.identity.collection_biography);

      cardsWithCompleteLore++;
    } else {
      errors.push(`Card ${card.id} is missing complete lore, character/item identity, or gameplay metadata`);
    }

    // Art brief & compiled prompt check (Sections 4.5, 5, 8)
    if (
      card.art &&
      card.art.brief &&
      card.art.brief.subject &&
      card.art.prompt &&
      card.art.prompt.includes('no text') &&
      Array.isArray(card.art.visual_exclusions) &&
      card.art.visual_exclusions.length > 0 &&
      card.art.style_id
    ) {
      cardsWithCompiledArtPrompt++;
    } else {
      errors.push(`Card ${card.id} is missing compiled art prompt, visual exclusions, or style ID`);
    }

    if (card.art && card.art.concept_approved) {
      cardsWithConceptIllustrationsIntegrated++;
    }
    if (card.art && card.art.final_production_approved) {
      cardsWithFinalProductionArtworkApproved++;
    }

    // Similarity detection signature within same faction
    const sig = [
      card.faction,
      card.type,
      card.cost,
      card.attack,
      card.health,
      (card.keywords || []).slice().sort().join(','),
      (card.abilities || [])
        .map((a) => `${a.trigger}:${(a.effects || []).map((e) => `${e.operation}@${e.target}`).join('+')}`)
        .join(';')
    ].join('|');
    if (mechanicalSignatures.has(sig)) {
      qualityWarnings.push(`Cards ${mechanicalSignatures.get(sig)} and ${card.id} share identical faction+stats+effects signature`);
    } else {
      mechanicalSignatures.set(sig, card.id);
    }
  }

  // Verify Milestone requirement: supports 320 cards or 480 expansion milestone
  const expectedTotal = bundle.milestone === 'phase_4_expansion_480' || bundle.cards.length === 480 ? 480 : 320;
  const expectedMajor = expectedTotal === 480 ? 48 : 32;
  const expectedNeutral = expectedTotal === 480 ? 96 : 64;

  if (bundle.cards.length !== expectedTotal) {
    errors.push(`Milestone requires ${expectedTotal} implemented cards, found ${bundle.cards.length}`);
  }
  for (const faction of VALID_FACTIONS) {
    const requiredCount = faction === 'neutral' ? expectedNeutral : expectedMajor;
    if ((factionCounts[faction] || 0) !== requiredCount) {
      errors.push(`Faction ${faction} has ${factionCounts[faction] || 0} cards instead of required ${requiredCount}`);
    }

    // Verify no faction/type exceeds the 640-card release ceiling
    const caps = faction === 'neutral' ? RELEASE_640_TYPE_CAPS.neutral : RELEASE_640_TYPE_CAPS.major_faction;
    for (const type of VALID_TYPES) {
      const actual = factionTypeMatrix[faction][type];
      if (actual > caps[type]) {
        errors.push(`Faction ${faction} type ${type} count (${actual}) exceeds full-release cap (${caps[type]})`);
      }
    }
  }

  // Verify no rarity exceeds the 640-card release ceiling
  for (const [rarity, count] of Object.entries(rarityCounts)) {
    if (count > RELEASE_640_RARITY_CAPS[rarity]) {
      errors.push(`Rarity ${rarity} count (${count}) exceeds full-release 640-card cap (${RELEASE_640_RARITY_CAPS[rarity]})`);
    }
  }

  // Validate starter & archetype decks against Section 5.9 rules
  for (const deck of decksFile.decks) {
    let totalCards = 0;
    const majorFactions = new Set();
    for (const entry of deck.cards) {
      const card = cardById.get(entry.card_id);
      if (!card) {
        errors.push(`Deck ${deck.id} references unknown card ${entry.card_id}`);
        continue;
      }
      totalCards += entry.count;
      if (card.faction !== 'neutral') {
        majorFactions.add(card.faction);
      }
      const limit = COPY_LIMITS[card.rarity];
      if (entry.count < 1 || entry.count > limit) {
        errors.push(`Deck ${deck.id} has ${entry.count} copies of ${card.id} (${card.rarity}, limit ${limit})`);
      }
    }
    if (totalCards !== 40) {
      errors.push(`Deck ${deck.id} has ${totalCards} cards instead of exact 40`);
    }
    if (majorFactions.size > 2) {
      errors.push(`Deck ${deck.id} contains ${majorFactions.size} major factions (max 2 allowed)`);
    }
  }

  return {
    valid: errors.length === 0,
    milestone: bundle.milestone || 'phase_3_foundations_320',
    totalCards: bundle.cards.length,
    targetReleaseCards: 640,
    cardsWithCompleteLore,
    uniqueFlavorTexts: seenFlavorTexts.size,
    uniqueBiographies: seenBiographies.size,
    cardsWithCompiledArtPrompt,
    cardsWithConceptIllustrationsIntegrated,
    cardsWithFinalProductionArtworkApproved,
    cardsWithApprovedArtwork: cardsWithFinalProductionArtworkApproved,
    factionCounts,
    factionTypeMatrix,
    typeCounts,
    rarityCounts,
    rolesCovered: Array.from(roleCoverage),
    decksValidated: decksFile.decks.length,
    qualityWarningsCount: qualityWarnings.length,
    qualityWarnings: qualityWarnings.slice(0, 10),
    errors
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const report = validateCardCatalogue();
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) {
    process.exit(1);
  }
}
