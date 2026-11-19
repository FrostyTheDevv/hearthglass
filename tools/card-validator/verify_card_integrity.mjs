import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const bundlePath = path.join(ROOT, 'content/cards/foundations_v1.json');
const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
const cards = bundle.cards;

console.log('=== HEARTHGLASS CARD CATALOGUE INTEGRITY VERIFIER ===');
console.log(`Loaded ${cards.length} cards from foundations_v1.json`);

// 1. Verify Unique IDs
const idSet = new Set();
const duplicates = [];
for (const card of cards) {
  if (idSet.has(card.id)) {
    duplicates.push(card.id);
  }
  idSet.add(card.id);
}

if (duplicates.length > 0) {
  console.error(`FAILURE: Found ${duplicates.length} duplicate IDs:`, duplicates);
  process.exit(1);
}
console.log('✔ All card IDs are globally unique.');

// 2. Verify Card-Type Distribution
const byType = { creature: 0, tactic: 0, relic: 0, environment: 0 };
const byFaction = {};
const factionTypes = {};

for (const card of cards) {
  if (!byType[card.type] && byType[card.type] !== 0) {
    console.error(`Unknown card type: ${card.type} on card ${card.id}`);
    process.exit(1);
  }
  byType[card.type]++;
  
  byFaction[card.faction] = (byFaction[card.faction] || 0) + 1;
  if (!factionTypes[card.faction]) factionTypes[card.faction] = {};
  factionTypes[card.faction][card.type] = (factionTypes[card.faction][card.type] || 0) + 1;
}

console.log('Current Type Distribution:', byType);
console.log('Current Faction Distribution:', byFaction);

// Check 480 milestone invariants
if (cards.length === 480) {
  const expectedTypes = { creature: 274, tactic: 94, relic: 70, environment: 42 };
  for (const [t, exp] of Object.entries(expectedTypes)) {
    if (byType[t] !== exp) {
      console.error(`Type mismatch for ${t}: expected ${exp}, got ${byType[t]}`);
      process.exit(1);
    }
  }
  console.log('✔ 480-card exact type distribution matches canonical specification.');

  // Check 8 major factions: 28 Creatures, 9 Tactics, 7 Relics, 4 Environments each = 48
  const majorFactions = ['emberclad', 'verdant_pact', 'iron_choir', 'tidebound', 'glassborne', 'nocturne', 'starweave', 'gravewild'];
  for (const f of majorFactions) {
    const ft = factionTypes[f] || {};
    if (ft.creature !== 28 || ft.tactic !== 9 || ft.relic !== 7 || ft.environment !== 4) {
      console.error(`Faction ${f} has invalid allocation:`, ft);
      process.exit(1);
    }
  }
  console.log('✔ All 8 major factions have exactly 28 Creatures, 9 Tactics, 7 Relics, 4 Environments (48 each).');

  // Check Neutral: 50 Creatures, 22 Tactics, 14 Relics, 10 Environments = 96
  const nt = factionTypes['neutral'] || {};
  if (nt.creature !== 50 || nt.tactic !== 22 || nt.relic !== 14 || nt.environment !== 10) {
    console.error(`Neutral has invalid allocation:`, nt);
    process.exit(1);
  }
  console.log('✔ Neutral has exactly 50 Creatures, 22 Tactics, 14 Relics, 10 Environments (96 total).');
}

console.log('✔ CARD CATALOGUE INTEGRITY VERIFICATION COMPLETE: 100% PASS.');
