import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null || typeof a !== 'object') return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i]) return false;
    if (!deepEqual(a[keysA[i]], b[keysB[i]])) return false;
  }
  return true;
}

/**
 * Validates catalogue integrity against schema, distributions, and historical versioned baseline.
 */
export function verifyCardIntegrity({
  cataloguePath = path.join(ROOT, 'content/cards/foundations_v1.json'),
  baselinePath = path.join(ROOT, 'content/cards/baseline_320_snapshot.json'),
  migrationsPath = path.join(ROOT, 'content/cards/card_migrations.json'),
  checkDistributions = true,
  quiet = false
} = {}) {
  const log = (...args) => {
    if (!quiet) console.log(...args);
  };
  const errorLog = (...args) => {
    if (!quiet) console.error(...args);
  };

  log('=== HEARTHGLASS CARD CATALOGUE INTEGRITY VERIFIER ===');

  if (!fs.existsSync(cataloguePath)) {
    throw new Error(`Catalogue file missing at ${cataloguePath}`);
  }
  const bundle = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
  const cards = bundle.cards;
  log(`Loaded ${cards.length} cards from ${path.basename(cataloguePath)}`);

  const errors = [];
  const violations = [];

  // 1. Verify Unique IDs
  const idMap = new Map();
  const duplicateIds = [];
  for (const card of cards) {
    if (idMap.has(card.id)) {
      duplicateIds.push(card.id);
    }
    idMap.set(card.id, card);
  }

  if (duplicateIds.length > 0) {
    const msg = `FAILURE: Found ${duplicateIds.length} duplicate IDs: ${duplicateIds.join(', ')}`;
    errorLog(msg);
    errors.push(msg);
  } else {
    log('✔ All card IDs are globally unique.');
  }

  // 2. Verify Card-Type Distribution & Milestones (if enabled)
  if (checkDistributions) {
    const byType = { creature: 0, tactic: 0, relic: 0, environment: 0 };
    const byFaction = {};
    const factionTypes = {};
    const byRarity = { common: 0, uncommon: 0, rare: 0, legendary: 0 };

    for (const card of cards) {
      if (byType[card.type] === undefined) {
        errors.push(`Unknown card type: ${card.type} on card ${card.id}`);
      } else {
        byType[card.type]++;
      }
      byFaction[card.faction] = (byFaction[card.faction] || 0) + 1;
      if (!factionTypes[card.faction]) factionTypes[card.faction] = {};
      factionTypes[card.faction][card.type] = (factionTypes[card.faction][card.type] || 0) + 1;

      if (byRarity[card.rarity] !== undefined) {
        byRarity[card.rarity]++;
      }
    }

    // Check 480 milestone invariants
    if (cards.length === 480) {
      const expectedTypes = { creature: 274, tactic: 94, relic: 70, environment: 42 };
      for (const [t, exp] of Object.entries(expectedTypes)) {
        if (byType[t] !== exp) {
          errors.push(`Type distribution mismatch for ${t}: expected ${exp}, got ${byType[t]}`);
        }
      }

      const majorFactions = [
        'emberclad',
        'verdant_pact',
        'iron_choir',
        'tidebound',
        'glassborne',
        'nocturne',
        'starweave',
        'gravewild'
      ];
      for (const f of majorFactions) {
        const ft = factionTypes[f] || {};
        if (ft.creature !== 28 || ft.tactic !== 9 || ft.relic !== 7 || ft.environment !== 4) {
          errors.push(`Faction ${f} has invalid allocation: ${JSON.stringify(ft)}`);
        }
      }
    }

    // Check 640 milestone invariants if expanded
    if (cards.length === 640) {
      const expectedTypes640 = { creature: 368, tactic: 136, relic: 88, environment: 48 };
      for (const [t, exp] of Object.entries(expectedTypes640)) {
        if (byType[t] !== exp) {
          errors.push(`640 milestone type mismatch for ${t}: expected ${exp}, got ${byType[t]}`);
        }
      }
      const expectedRarity640 = { common: 320, uncommon: 192, rare: 96, legendary: 32 };
      for (const [r, exp] of Object.entries(expectedRarity640)) {
        if (byRarity[r] !== exp) {
          errors.push(`640 milestone rarity mismatch for ${r}: expected ${exp}, got ${byRarity[r]}`);
        }
      }
    }
  }

  // 3. Historical Baseline Comparison (P1 Requirement)
  if (!fs.existsSync(baselinePath)) {
    const msg = `Historical snapshot missing: Historical equivalence cannot be proven. Expected baseline file at ${baselinePath}`;
    errorLog(msg);
    errors.push(msg);
    return { valid: false, errors, violations: [] };
  }

  const baselineData = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const baselineCards = baselineData.cards || {};
  log(`Loaded historical baseline snapshot with ${Object.keys(baselineCards).length} approved cards.`);

  let approvedMigrations = [];
  if (fs.existsSync(migrationsPath)) {
    try {
      const migData = JSON.parse(fs.readFileSync(migrationsPath, 'utf8'));
      approvedMigrations = migData.approved_migrations || [];
    } catch {
      // Empty migrations
    }
  }

  for (const [cardId, baseCard] of Object.entries(baselineCards)) {
    const curCard = idMap.get(cardId);
    if (!curCard) {
      violations.push({
        card_id: cardId,
        field: 'existence',
        error: `Historical baseline card ${cardId} ('${baseCard.name}') is missing from the active catalogue.`
      });
      continue;
    }

    const checkField = (fieldName, baseVal, curVal, formatter = (v) => JSON.stringify(v)) => {
      if (!deepEqual(baseVal, curVal)) {
        // Check for an explicit approved migration record
        const migration = approvedMigrations.find(
          (m) => m.card_id === cardId && m.field === fieldName && m.approved === true
        );
        if (!migration) {
          violations.push({
            card_id: cardId,
            card_name: baseCard.name,
            field: fieldName,
            baseline: baseVal,
            current: curVal,
            error: `Unauthorized change on ${cardId} ('${baseCard.name}'): field '${fieldName}' was changed from ${formatter(baseVal)} to ${formatter(curVal)} without an approved migration record.`
          });
        }
      }
    };

    // Compare permanent core fields
    checkField('name', baseCard.name, curCard.name);
    checkField('faction', baseCard.faction, curCard.faction);
    checkField('type', baseCard.type, curCard.type);
    checkField('rarity', baseCard.rarity, curCard.rarity);
    checkField('cost', baseCard.cost, curCard.cost);

    if (baseCard.type === 'creature') {
      checkField('attack', baseCard.attack, curCard.attack ?? null);
      checkField('health', baseCard.health, curCard.health ?? null);
    }

    const baseKeywords = Array.isArray(baseCard.keywords) ? [...baseCard.keywords].sort() : [];
    const curKeywords = Array.isArray(curCard.keywords) ? [...curCard.keywords].sort() : [];
    checkField('keywords', baseKeywords, curKeywords);

    // Effect AST comparison
    const baseAbilities = Array.isArray(baseCard.abilities) ? baseCard.abilities : [];
    const curAbilities = Array.isArray(curCard.abilities) ? curCard.abilities : [];
    checkField('abilities', baseAbilities, curAbilities);

    // Timing restrictions & targeting rules
    const baseTiming = baseCard.timing_restrictions || '';
    const curTiming = curCard.gameplay_metadata?.timing_restrictions || '';
    checkField('timing_restrictions', baseTiming, curTiming);

    const baseTargeting = baseCard.targeting_rules || '';
    const curTargeting = curCard.gameplay_metadata?.legal_targeting_rules || '';
    checkField('targeting_rules', baseTargeting, curTargeting);
  }

  if (violations.length > 0) {
    errorLog(`\n❌ INTEGRITY VIOLATION: Found ${violations.length} unauthorized card changes:`);
    for (const v of violations) {
      errorLog(`  - [${v.card_id}] ${v.error}`);
    }
  }

  const isValid = errors.length === 0 && violations.length === 0;
  if (isValid) {
    log(`✔ All ${Object.keys(baselineCards).length} baseline cards match historical snapshot with zero unauthorized drift.`);
    log('✔ CARD CATALOGUE INTEGRITY VERIFICATION COMPLETE: 100% PASS.');
  }

  return {
    valid: isValid,
    errors: [...errors, ...violations.map((v) => v.error)],
    violations
  };
}

// CLI runner if executed directly
if (process.argv[1] && process.argv[1].endsWith('verify_card_integrity.mjs')) {
  const result = verifyCardIntegrity();
  if (!result.valid) {
    process.exit(1);
  }
}
