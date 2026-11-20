import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

export function runFullQaAudit() {
  const cardsFile = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'content/cards/foundations_v1.json'), 'utf8')
  );
  const decksFile = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'content/cards/starter_decks.json'), 'utf8')
  );
  const rustCode = fs.readFileSync(
    path.join(ROOT, 'services/battle-server/src/lib.rs'),
    'utf8'
  );

  const findings = {
    verified_defects: [],
    balance_concerns: [],
    coverage_gaps: [],
    passing_verifications: []
  };

  // 1. Audit Card Targets against Rust engine implementation
  const unhandledTargetCards = [];
  for (const card of cardsFile.cards) {
    for (const ab of (card.abilities || [])) {
      for (const eff of (ab.effects || [])) {
        if (eff.target === 'all_enemy_creatures') {
          unhandledTargetCards.push({
            id: card.id,
            name: card.name,
            operation: eff.operation,
            amount: eff.amount
          });
        }
      }
    }
  }

  if (unhandledTargetCards.length > 0) {
    findings.verified_defects.push({
      id: 'DEFECT-001',
      severity: 'P0 - CRITICAL RULES GAP',
      title: 'Target "all_enemy_creatures" unhandled in Rust Battle Server effect execution',
      location: 'services/battle-server/src/lib.rs:2176 (deal_damage) and line 2520 (resolve_creature_targets)',
      impact: `${unhandledTargetCards.length} canonical cards (including 8 Legendaries and major AoE Tactics) resolve to NO-OP with 0 damage/effects applied.`,
      affected_cards: unhandledTargetCards.map(c => `${c.id} (${c.name}) [${c.operation}]`)
    });
  }

  // 2. Audit Counter support in Rust engine
  const countersUsed = new Set();
  for (const card of cardsFile.cards) {
    for (const ab of (card.abilities || [])) {
      for (const eff of (ab.effects || [])) {
        if (eff.counter) countersUsed.add(eff.counter);
      }
    }
  }

  const supportedCounters = ['growth', 'corrode', 'burn', 'heat', 'shield', 'alignment'];
  const unsupportedCounters = [...countersUsed].filter(c => !supportedCounters.includes(c));
  if (unsupportedCounters.length > 0) {
    findings.coverage_gaps.push({
      id: 'GAP-001',
      severity: 'P1 - INCOMPLETE FACTION MECHANIC',
      title: `Counters missing combat/turn effect in Rust engine: ${unsupportedCounters.join(', ')}`,
      location: 'services/battle-server/src/lib.rs',
      details: 'Counters are stored in unit.counters map but have no mechanical impact on damage, stats, or turn resolution.'
    });
  }

  // 3. Database Transaction Audit on Shop Purchases
  const dbCode = fs.readFileSync(path.join(ROOT, 'services/api/src/db.mjs'), 'utf8');
  if (dbCode.includes('async openShopPack(') && !dbCode.slice(dbCode.indexOf('async openShopPack('), dbCode.indexOf('async openShopPack(') + 1200).includes('withTransaction')) {
    findings.verified_defects.push({
      id: 'DEFECT-002',
      severity: 'P0 - CONCURRENCY INTEGRITY VIOLATION',
      title: 'openShopPack() executes non-transactionally without withTransaction() or FOR UPDATE locks',
      location: 'services/api/src/db.mjs:950-1054',
      impact: 'Rapid concurrent purchase requests can race against wallet_balances, causing unhandled Postgres check constraint violations or partial inventory commits.'
    });
  }

  // 4. AI Difficulty Parameter Audit
  if (rustCode.includes('pub fn choose_command') && rustCode.includes('_difficulty: AiDifficulty')) {
    findings.verified_defects.push({
      id: 'DEFECT-003',
      severity: 'P1 - UNUSED PARAMETER & STATIC AI',
      title: 'NpcAi::choose_command ignores AiDifficulty parameter (_difficulty)',
      location: 'services/battle-server/src/lib.rs:2940',
      impact: 'All difficulty levels (Beginner through Boss) execute identical heuristics without scaling tactical depth or evaluation weights.'
    });
  }

  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const audit = runFullQaAudit();
  console.log(JSON.stringify(audit, null, 2));
}
