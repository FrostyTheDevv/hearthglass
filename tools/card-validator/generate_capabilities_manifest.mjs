import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const VALID_OPERATIONS = [
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
];

const VALID_TARGETS = [
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
];

const cardsFile = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/cards/foundations_v1.json'), 'utf8'));

// Extract canonical usages
const canonicalUsage = {};
for (const card of cardsFile.cards) {
  for (const ab of (card.abilities || [])) {
    for (const eff of (ab.effects || [])) {
      const key = `${eff.operation}:::${eff.target}`;
      if (!canonicalUsage[key]) {
        canonicalUsage[key] = { count: 0, sample_cards: [] };
      }
      canonicalUsage[key].count++;
      if (canonicalUsage[key].sample_cards.length < 5) {
        canonicalUsage[key].sample_cards.push(card.id);
      }
    }
  }
}

// Function to classify any combination
function classify(op, target) {
  const usage = canonicalUsage[`${op}:::${target}`];
  const count = usage ? usage.count : 0;
  const sample_cards = usage ? usage.sample_cards : [];

  // Special context-dependent canonical cards
  if (op === 'deal_damage' && target === 'event_source') {
    return {
      status: 'context_dependent',
      canonical_card_count: count,
      sample_cards,
      description: 'Deals damage to triggering creature (requires reactive combat trigger such as when_damaged).'
    };
  }
  if (op === 'add_counter' && target === 'event_source') {
    return {
      status: 'context_dependent',
      canonical_card_count: count,
      sample_cards,
      description: 'Adds counter to triggering creature (requires reactive event trigger).'
    };
  }
  if (op === 'add_counter' && target === 'ally_leader') {
    return {
      status: 'context_dependent',
      canonical_card_count: count,
      sample_cards,
      description: 'Adds resource counter to ally leader state (requires leader counter tracking).'
    };
  }

  // Canonical active combinations are supported in Rust engine
  if (count > 0) {
    return {
      status: 'supported',
      canonical_card_count: count,
      sample_cards,
      description: `Fully supported by Rust battle server with ${count} canonical card references.`
    };
  }

  // Check valid but unimplemented combinations vs invalid
  const leaderOnlyOps = new Set(['draw', 'gain_aether', 'reclaim_from_discard', 'scry_top_deck']);
  const leaderTargets = new Set(['ally_leader', 'enemy_leader']);
  const creatureTargets = new Set([
    'self', 'enemy_in_lane', 'target_enemy_creature', 'all_enemy_creatures',
    'all_ally_creatures', 'ally_creature_in_lane_or_any', 'strongest_ally_creature', 'event_source'
  ]);

  if (leaderOnlyOps.has(op)) {
    if (leaderTargets.has(target)) {
      return {
        status: 'unsupported',
        canonical_card_count: 0,
        sample_cards: [],
        description: 'Semantically valid player operation reserved for future expansions but not used in Foundations v1.'
      };
    }
    return {
      status: 'invalid',
      canonical_card_count: 0,
      sample_cards: [],
      description: `Operation '${op}' requires a player leader target, but received creature/slot target '${target}'.`
    };
  }

  if (op === 'summon_token') {
    if (target === 'open_ally_slot') {
      return {
        status: 'supported',
        canonical_card_count: count,
        sample_cards,
        description: 'Summons token into open lane slot.'
      };
    }
    return {
      status: 'invalid',
      canonical_card_count: 0,
      sample_cards: [],
      description: `Operation 'summon_token' requires 'open_ally_slot' destination; cannot target '${target}'.`
    };
  }

  if (op === 'discard') {
    if (leaderTargets.has(target)) {
      return {
        status: 'unsupported',
        canonical_card_count: 0,
        sample_cards: [],
        description: 'Hand discard operation reserved for future disruption archetypes.'
      };
    }
    return {
      status: 'invalid',
      canonical_card_count: 0,
      sample_cards: [],
      description: `Operation 'discard' operates on player hands, not creature target '${target}'.`
    };
  }

  // Creature-only operations
  const creatureOnlyOps = new Set([
    'destroy', 'modify_stats', 'grant_keyword', 'silence',
    'return_to_hand', 'move_lane', 'remove_counter'
  ]);

  if (creatureOnlyOps.has(op)) {
    if (leaderTargets.has(target) || target === 'open_ally_slot') {
      return {
        status: 'invalid',
        canonical_card_count: 0,
        sample_cards: [],
        description: `Operation '${op}' can only target creatures, not '${target}'.`
      };
    }
    return {
      status: 'unsupported',
      canonical_card_count: 0,
      sample_cards: [],
      description: `Creature-targeting operation '${op}' with target '${target}' is valid in rules but has 0 canonical card definitions.`
    };
  }

  // deal_damage and heal
  if (op === 'deal_damage') {
    if (target === 'open_ally_slot') {
      return {
        status: 'invalid',
        canonical_card_count: 0,
        sample_cards: [],
        description: `Cannot deal damage to an empty board slot '${target}'.`
      };
    }
    return {
      status: 'unsupported',
      canonical_card_count: 0,
      sample_cards: [],
      description: `Damage to target '${target}' is semantically plausible but has 0 canonical cards in Foundations v1.`
    };
  }

  if (op === 'heal') {
    if (target === 'open_ally_slot' || target === 'enemy_leader') {
      return {
        status: 'invalid',
        canonical_card_count: 0,
        sample_cards: [],
        description: `Healing target '${target}' is not supported by standard rules.`
      };
    }
    return {
      status: 'unsupported',
      canonical_card_count: 0,
      sample_cards: [],
      description: `Healing target '${target}' has 0 canonical card definitions in Foundations v1.`
    };
  }

  if (op === 'add_counter') {
    if (target === 'open_ally_slot') {
      return {
        status: 'invalid',
        canonical_card_count: 0,
        sample_cards: [],
        description: `Cannot place counters on an unoccupied board slot '${target}'.`
      };
    }
    return {
      status: 'unsupported',
      canonical_card_count: 0,
      sample_cards: [],
      description: `Counter addition to target '${target}' has 0 canonical card definitions.`
    };
  }

  return {
    status: 'unsupported',
    canonical_card_count: 0,
    sample_cards: [],
    description: 'Unclassified combination.'
  };
}

const matrix = {};
const summary = {
  total_combinations: VALID_OPERATIONS.length * VALID_TARGETS.length,
  canonical_combinations_in_use: 0,
  supported: 0,
  context_dependent: 0,
  unsupported: 0,
  invalid: 0
};

for (const op of VALID_OPERATIONS) {
  matrix[op] = {};
  for (const target of VALID_TARGETS) {
    const res = classify(op, target);
    matrix[op][target] = res;
    summary[res.status]++;
    if (res.canonical_card_count > 0) {
      summary.canonical_combinations_in_use++;
    }
  }
}

const manifest = {
  manifest_version: '1.0.0',
  updated_at: new Date().toISOString(),
  engine: 'Rust hearthglass-battle-server v0.1.0',
  description: 'Authoritative battle-engine ability execution and capability manifest for Foundations v1.',
  valid_operations: VALID_OPERATIONS,
  valid_targets: VALID_TARGETS,
  summary,
  matrix
};

fs.mkdirSync(path.join(ROOT, 'content/engine'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'content/engine/effect_capabilities.json'), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(ROOT, 'tools/card-validator/effect_capabilities.json'), JSON.stringify(manifest, null, 2));

console.log('Capabilities manifest generated successfully:');
console.log(JSON.stringify(summary, null, 2));
