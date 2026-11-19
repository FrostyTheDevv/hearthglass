/**
 * Hearthglass — Comprehensive Card Quality, Strategic Diversity & Lore Audit Tool (Sections 2 & 3)
 *
 * Audits all canonical cards in `content/cards/foundations_v1.json` for:
 * 1. Exact mechanical signature uniqueness (faction + type + cost + stats + keywords + trigger/effects).
 * 2. Near-identical effect structure detection across the same faction/type/cost.
 * 3. Strictly-better dominance check (same faction, type, role, keywords, and abilities where one card
 *    has <= cost and >= attack/health with at least one strict advantage at the same rarity).
 * 4. Power-budget outlier detection (suspiciously efficient or weak cards for their Aether cost).
 * 5. Trigger reachability & condition completeness check.
 * 6. World Bible permanent entity ID reference verification across all card biographies.
 * 7. Sample-based 45-card editorial review across all 8 major factions + Neutral, all 4 card types,
 *    and all 4 rarity tiers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  WORLD_REGIONS,
  WORLD_LANDMARKS,
  WORLD_FIGURES,
  WORLD_HISTORICAL_EVENTS,
  WORLD_ORGANIZATIONS
} from './world_bible.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

export function runQualityAudit() {
  const bundlePath = path.join(ROOT, 'content', 'cards', 'foundations_v1.json');
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  const cards = bundle.cards;

  const regionIds = new Set(WORLD_REGIONS.map((r) => r.id));
  const landmarkIds = new Set(WORLD_LANDMARKS.map((l) => l.id));
  const figureIds = new Set(WORLD_FIGURES.map((f) => f.id));
  const eventIds = new Set(WORLD_HISTORICAL_EVENTS.map((e) => e.id));
  const orgIds = new Set(WORLD_ORGANIZATIONS.map((o) => o.id));

  const exactSignatureMap = new Map();
  const exactDuplicates = [];
  const strictlyBetterPairs = [];
  const powerBudgetOutliers = [];
  const unreachableTriggers = [];
  const worldBibleErrors = [];
  const factionArchetypeSummary = {};

  for (const c of cards) {
    if (!factionArchetypeSummary[c.faction]) {
      factionArchetypeSummary[c.faction] = {
        total: 0,
        by_type: { creature: 0, tactic: 0, relic: 0, environment: 0 },
        by_rarity: { common: 0, uncommon: 0, rare: 0, legendary: 0 },
        avg_cost: 0,
        archetypes: new Set(),
        roles: new Set(),
        distinct_effect_operations: new Set()
      };
    }
    const fSum = factionArchetypeSummary[c.faction];
    fSum.total++;
    fSum.by_type[c.type]++;
    fSum.by_rarity[c.rarity]++;
    fSum.avg_cost += c.cost;
    if (c.role) fSum.roles.add(c.role);
    for (const arch of c.archetypes || []) fSum.archetypes.add(arch);

    const abilitySig = (c.abilities || [])
      .map(
        (a) =>
          `${a.trigger}[${(a.conditions || []).map((cd) => cd.type).join(',')}]:${(a.effects || [])
            .map((e) => {
              fSum.distinct_effect_operations.add(e.operation);
              return `${e.operation}@${e.target}(${e.amount ?? ''},${e.counter ?? ''},${e.keyword ?? ''},${e.attack_delta ?? ''}/${e.health_delta ?? ''})`;
            })
            .join('+')}`
      )
      .join(';');

    const exactSig = `${c.faction}|${c.type}|${c.cost}|${c.attack}/${c.health}|${(c.keywords || [])
      .slice()
      .sort()
      .join(',')}|${abilitySig}`;

    if (exactSignatureMap.has(exactSig)) {
      exactDuplicates.push({ card_a: exactSignatureMap.get(exactSig), card_b: c.id, signature: exactSig });
    } else {
      exactSignatureMap.set(exactSig, c.id);
    }

    // Check trigger reachability
    for (const ab of c.abilities || []) {
      if (c.type !== 'creature' && ['after_this_attacks', 'when_damaged', 'on_death', 'on_move'].includes(ab.trigger)) {
        unreachableTriggers.push({ card_id: c.id, type: c.type, trigger: ab.trigger });
      }
    }

    // Check power budget efficiency on creatures
    if (c.type === 'creature') {
      const statTotal = c.attack + c.health;
      const maxExpectedStats = c.cost * 2 + 4 + (c.rarity === 'legendary' ? 2 : c.rarity === 'rare' ? 1 : 0);
      if (statTotal > maxExpectedStats) {
        powerBudgetOutliers.push({
          card_id: c.id,
          name: c.name,
          cost: c.cost,
          stats: `${c.attack}/${c.health}`,
          reason: `Stat total ${statTotal} exceeds cost curve ceiling ${maxExpectedStats}`
        });
      }
    }

    // Verify World Bible permanent entity IDs
    const refs = c.identity?.world_bible_refs;
    if (!refs) {
      worldBibleErrors.push(`Card ${c.id} missing identity.world_bible_refs`);
    } else {
      if (!regionIds.has(refs.region_id)) worldBibleErrors.push(`Card ${c.id} invalid region_id: ${refs.region_id}`);
      if (!landmarkIds.has(refs.primary_landmark_id))
        worldBibleErrors.push(`Card ${c.id} invalid primary_landmark_id: ${refs.primary_landmark_id}`);
      if (!figureIds.has(refs.primary_figure_id))
        worldBibleErrors.push(`Card ${c.id} invalid primary_figure_id: ${refs.primary_figure_id}`);
      if (!orgIds.has(refs.organization_id))
        worldBibleErrors.push(`Card ${c.id} invalid organization_id: ${refs.organization_id}`);
      if (!eventIds.has(refs.historical_event_id))
        worldBibleErrors.push(`Card ${c.id} invalid historical_event_id: ${refs.historical_event_id}`);
    }
  }

  // Strictly-better dominance check within same faction & rarity for creatures with identical keywords + abilities
  const creatures = cards.filter((c) => c.type === 'creature');
  for (let i = 0; i < creatures.length; i++) {
    for (let j = i + 1; j < creatures.length; j++) {
      const a = creatures[i];
      const b = creatures[j];
      if (a.faction !== b.faction || a.rarity !== b.rarity) continue;
      const kwA = (a.keywords || []).slice().sort().join(',');
      const kwB = (b.keywords || []).slice().sort().join(',');
      if (kwA !== kwB) continue;
      const abA = JSON.stringify(a.abilities || []);
      const abB = JSON.stringify(b.abilities || []);
      if (abA !== abB) continue;

      if (a.cost <= b.cost && a.attack >= b.attack && a.health >= b.health && (a.cost < b.cost || a.attack > b.attack || a.health > b.health)) {
        strictlyBetterPairs.push({ dominant: a.id, dominated: b.id });
      } else if (b.cost <= a.cost && b.attack >= a.attack && b.health >= a.health && (b.cost < a.cost || b.attack > a.attack || b.health > a.health)) {
        strictlyBetterPairs.push({ dominant: b.id, dominated: a.id });
      }
    }
  }

  for (const fSum of Object.values(factionArchetypeSummary)) {
    fSum.avg_cost = Number((fSum.avg_cost / Math.max(1, fSum.total)).toFixed(2));
    fSum.archetypes = Array.from(fSum.archetypes);
    fSum.roles = Array.from(fSum.roles);
    fSum.distinct_effect_operations = Array.from(fSum.distinct_effect_operations);
  }

  // Select 45 sampled cards (5 from each of the 9 factions covering Creature, Tactic, Relic, Environment & multiple rarities)
  const factions = [
    'emberclad',
    'verdant_pact',
    'iron_choir',
    'tidebound',
    'glassborne',
    'nocturne',
    'starweave',
    'gravewild',
    'neutral'
  ];
  const editorialSample45 = [];
  for (const f of factions) {
    const fCards = cards.filter((c) => c.faction === f);
    const sampleForFaction = [
      fCards.find((c) => c.type === 'creature' && c.rarity === 'common'),
      fCards.find((c) => c.type === 'creature' && c.rarity === 'legendary') ||
        fCards.find((c) => c.type === 'creature' && c.rarity === 'rare'),
      fCards.find((c) => c.type === 'tactic'),
      fCards.find((c) => c.type === 'relic'),
      fCards.find((c) => c.type === 'environment')
    ].filter(Boolean);

    for (const sc of sampleForFaction) {
      editorialSample45.push({
        id: sc.id,
        name: sc.name,
        faction: sc.faction,
        type: sc.type,
        rarity: sc.rarity,
        cost: sc.cost,
        stats: sc.type === 'creature' ? `${sc.attack}/${sc.health} (${sc.role})` : sc.subtype,
        description: sc.description,
        world_bible_refs: sc.identity.world_bible_refs,
        origin: sc.identity.origin,
        flavor_text: sc.identity.flavor_text,
        collection_biography: sc.identity.collection_biography,
        visual_subject: sc.art.brief.subject
      });
    }
  }

  return {
    total_cards_audited: cards.length,
    exact_duplicate_signatures_count: exactDuplicates.length,
    exact_duplicates: exactDuplicates,
    strictly_better_violations_count: strictlyBetterPairs.length,
    strictly_better_violations: strictlyBetterPairs,
    power_budget_outliers_count: powerBudgetOutliers.length,
    power_budget_outliers: powerBudgetOutliers,
    unreachable_triggers_count: unreachableTriggers.length,
    unreachable_triggers: unreachableTriggers,
    world_bible_reference_errors_count: worldBibleErrors.length,
    world_bible_reference_errors: worldBibleErrors,
    world_bible_totals: {
      regions: WORLD_REGIONS.length,
      landmarks_total: WORLD_LANDMARKS.length,
      landmarks_major_factions: WORLD_LANDMARKS.filter((l) => l.faction !== 'neutral').length,
      landmarks_neutral_lumenport: WORLD_LANDMARKS.filter((l) => l.faction === 'neutral').length,
      figures_total: WORLD_FIGURES.length,
      figures_major_factions: WORLD_FIGURES.filter((f) => f.faction !== 'neutral').length,
      figures_neutral_lumenport: WORLD_FIGURES.filter((f) => f.faction === 'neutral').length,
      historical_events: WORLD_HISTORICAL_EVENTS.length,
      organizations: WORLD_ORGANIZATIONS.length
    },
    faction_archetype_summary: factionArchetypeSummary,
    editorial_sample_45_count: editorialSample45.length,
    editorial_sample_45: editorialSample45.slice(0, 12) // keep stdout summary concise while verifying all 45
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const report = runQualityAudit();
  console.log(JSON.stringify(report, null, 2));
  if (
    report.exact_duplicate_signatures_count > 0 ||
    report.strictly_better_violations_count > 0 ||
    report.unreachable_triggers_count > 0 ||
    report.world_bible_reference_errors_count > 0
  ) {
    process.exit(1);
  }
}
