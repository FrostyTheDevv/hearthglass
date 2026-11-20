/**
 * Hearthglass — Card Reconciliation Engine
 *
 * Compares every card in content/staging/cards/expansion_160_staging_catalogue.json
 * against its canonical counterpart in content/cards/foundations_v1.json.
 *
 * Generates:
 * - content/staging/cards/card_reconciliation_report.json
 * - docs/production/CARD_640_RECONCILIATION.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

const foundationsPath = path.join(ROOT, 'content/cards/foundations_v1.json');
const stagingPath = path.join(ROOT, 'content/staging/cards/expansion_160_staging_catalogue.json');

const foundations = JSON.parse(fs.readFileSync(foundationsPath, 'utf8'));
const staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));

const canonicalMap = new Map(foundations.cards.map(c => [c.id, c]));

const reconciliationReport = [];
const classificationCounts = {
  identical: 0,
  metadata_enhancement_only: 0,
  lore_or_artwork_improvement: 0,
  proposed_mechanical_change: 0,
  canonical_conflict: 0,
  missing_or_invalid_record: 0
};

for (const staged of staging.cards) {
  const canonical = canonicalMap.get(staged.id);

  if (!canonical) {
    classificationCounts.missing_or_invalid_record++;
    reconciliationReport.push({
      card_id: staged.id,
      canonical_name: null,
      staged_name: staged.name,
      classification: 'missing_or_invalid_record',
      final_recommended_disposition: 'REJECT: Staged card does not exist in canonical catalogue.'
    });
    continue;
  }

  // Compare fields
  const nameDiff = canonical.name !== staged.name;
  const factionDiff = canonical.faction !== staged.faction;
  const typeDiff = canonical.type !== staged.type;
  const rarityDiff = canonical.rarity !== staged.rarity;
  const costDiff = canonical.cost !== staged.cost;
  const statsDiff = (canonical.attack !== staged.attack) || (canonical.health !== staged.health);

  const canonicalKeywords = (canonical.keywords || []).slice().sort().join(',');
  const stagedKeywords = (staged.keywords || []).slice().sort().join(',');
  const keywordsDiff = canonicalKeywords !== stagedKeywords;

  const canonicalAST = JSON.stringify(canonical.abilities || []);
  const stagedAST = JSON.stringify(staged.abilities || []);
  const effectASTDiff = canonicalAST !== stagedAST;

  const loreDiff = (canonical.lore || '') !== (staged.lore || '');
  const bioDiff = (canonical.identity?.collection_biography || '') !== (staged.identity?.collection_biography || '');
  const artDiff = (canonical.art?.prompt || '') !== (staged.art?.prompt || '');

  const hasMechanicSpec = Boolean(staged.mechanic_test_specification);

  // Classify
  let classification = 'identical';
  let disposition = 'KEEP_CANONICAL: Card is fully identical.';

  if (factionDiff || typeDiff || rarityDiff || costDiff || statsDiff || keywordsDiff || effectASTDiff) {
    if (factionDiff || typeDiff || rarityDiff) {
      classification = 'canonical_conflict';
      disposition = 'FLAG_CONFLICT: Faction, type, or rarity mismatch requires executive review.';
    } else {
      classification = 'proposed_mechanical_change';
      disposition = 'REQUIRES_RUST_QA_APPROVAL: Proposed combat mechanic delta requires rules engine signoff.';
    }
  } else if (loreDiff || bioDiff || artDiff) {
    classification = 'lore_or_artwork_improvement';
    disposition = 'APPLY_EDITORIAL_MIGRATION: Merge enriched lore/visual descriptions into foundations_v1.';
  } else if (hasMechanicSpec) {
    classification = 'metadata_enhancement_only';
    disposition = 'MERGE_METADATA_ENHANCEMENT: Integrate mechanic_test_specification non-destructively.';
  }

  classificationCounts[classification]++;

  reconciliationReport.push({
    card_id: staged.id,
    canonical_name: canonical.name,
    staged_name: staged.name,
    canonical_faction: canonical.faction,
    staged_faction: staged.faction,
    canonical_type: canonical.type,
    staged_type: staged.type,
    canonical_rarity: canonical.rarity,
    staged_rarity: staged.rarity,
    canonical_cost: canonical.cost,
    staged_cost: staged.cost,
    canonical_stats: { attack: canonical.attack, health: canonical.health },
    staged_stats: { attack: staged.attack, health: staged.health },
    canonical_keywords: canonical.keywords || [],
    staged_keywords: staged.keywords || [],
    canonical_effect_ast: canonical.abilities || [],
    staged_effect_ast: staged.abilities || [],
    field_differences: {
      name: nameDiff,
      faction: factionDiff,
      type: typeDiff,
      rarity: rarityDiff,
      cost: costDiff,
      stats: statsDiff,
      keywords: keywordsDiff,
      effect_ast: effectASTDiff,
      lore: loreDiff,
      biography: bioDiff,
      artwork_brief: artDiff
    },
    additional_metadata_in_staging: {
      has_mechanic_test_specification: hasMechanicSpec,
      mechanic_test_specification: staged.mechanic_test_specification || null
    },
    classification,
    final_recommended_disposition: disposition
  });
}

const outputPath = path.join(ROOT, 'content/staging/cards/card_reconciliation_report.json');
fs.writeFileSync(outputPath, JSON.stringify({
  schema_version: '1.2.0',
  audit_timestamp: new Date().toISOString(),
  canonical_catalogue_file: 'content/cards/foundations_v1.json',
  staged_catalogue_file: 'content/staging/cards/expansion_160_staging_catalogue.json',
  total_cards_audited: reconciliationReport.length,
  classification_counts: classificationCounts,
  records: reconciliationReport
}, null, 2));

console.log(`Saved reconciliation report to ${outputPath}`);
console.log('Classification summary:', classificationCounts);
