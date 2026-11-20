import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateWorldContent } from '../../../tools/card-validator/world_validator.mjs';
import { classifyCardComparison, CANONICAL_EFFECT_ASSERTED_CARDS_MAPPING, EXCLUDED_TEST_CARDS_AUDIT, validateTestProvenCardSources } from '../../../tools/card-validator/reconcile_cards.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');

const readJson = (relPath) => JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));

test('Hearthglass World Content & Card Staging Canonical Validation Suite', async (t) => {
  await t.test('1. Validates canonical 640-card catalogue distribution and 0 Epic rarity', () => {
    const res = validateWorldContent();
    assert.equal(res.valid, true, `Validation failed with errors: ${res.errors.join('; ')}`);
    assert.equal(res.canonicalCardCatalogue, 640);
    assert.deepEqual(res.typeCounts, {
      creature: 368,
      tactic: 136,
      relic: 88,
      environment: 48
    });
    assert.deepEqual(res.rarityCounts, {
      common: 320,
      uncommon: 192,
      rare: 96,
      legendary: 32,
      epic: 0
    });
  });

  await t.test('2. Validates isolated 160-card staging catalogue and verification levels', () => {
    const res = validateWorldContent();
    assert.equal(res.stagedExpansionCards, 160);
    assert.equal(res.rustVerificationCounts.level_1_schema_valid, 160);
    assert.equal(res.rustVerificationCounts.level_2_baseline_compatible, 140);
    assert.equal(res.rustVerificationCounts.level_2_baseline_gaps, 20);
    assert.equal(res.rustVerificationCounts.level_2_pr5_compatible, 160);
    assert.equal(res.rustVerificationCounts.level_2_pr5_gaps, 0);
    // Honest Level 3 Accounting: source test-proven assertions only
    assert.equal(res.rustVerificationCounts.level_3_broad_execution_tested, 160);
    assert.equal(res.rustVerificationCounts.level_3_deep_behavioral_asserted, 0);
    assert.equal(res.rustVerificationCounts.level_3_deep_assertion_pending, 160);
    assert.equal(res.rustVerificationCounts.level_3_behavioral_verified, 0);
    // Canonical 640 under merged PR #5 (ca73a75 / 8273cf8)
    assert.equal(res.rustVerificationCounts.canonical_640_pr5_compatible, 640);
    assert.equal(res.rustVerificationCounts.canonical_640_pr5_gaps, 0);
    assert.equal(res.rustVerificationCounts.canonical_640_deep_behavioral_asserted, 14);
    assert.equal(res.rustVerificationCounts.canonical_640_deep_assertion_pending, 626);
    assert.equal(res.rustVerificationCounts.canonical_excluded_deck_and_generic_tested, 15);
  });

  await t.test('2.1. Validates automated test-proven source verification for 14 effect-asserted cards and 15 exclusions', () => {
    assert.equal(CANONICAL_EFFECT_ASSERTED_CARDS_MAPPING.length, 14);
    assert.equal(EXCLUDED_TEST_CARDS_AUDIT.length, 15);
    const sourceVal = validateTestProvenCardSources();
    assert.equal(sourceVal.all_verified, true, `Source validation failed for cards: ${sourceVal.details.filter(d => !d.verified).map(d => d.card_id).join(', ')}`);
    assert.equal(sourceVal.verified_count, 14);
    assert.equal(sourceVal.excluded_count, 15);
  });

  await t.test('3. Validates complete 12-chapter campaign across 4 canonical regions', () => {
    const res = validateWorldContent();
    assert.equal(res.campaignChapters, 12);
  });

  await t.test('4. Validates 80 named NPCs distributed 20 per canonical region', () => {
    const res = validateWorldContent();
    assert.equal(res.namedNpcs, 80);
  });

  await t.test('5. Validates 120 original side quests distributed 30 per canonical region', () => {
    const res = validateWorldContent();
    assert.equal(res.sideQuests, 120);
  });

  await t.test('6. Validates 16 dungeons distributed 4 per canonical region', () => {
    const res = validateWorldContent();
    assert.equal(res.dungeons, 16);
  });

  await t.test('7. Validates 8 regional and grand tournaments', () => {
    const res = validateWorldContent();
    assert.equal(res.tournaments, 8);
  });

  await t.test('8. Validates 24 companion stories across 8 major companions', () => {
    const res = validateWorldContent();
    assert.equal(res.companionStories, 24);
  });

  await t.test('9. Validates 32 secrets distributed 8 per canonical region', () => {
    const res = validateWorldContent();
    assert.equal(res.secrets, 32);
  });

  await t.test('10. Validates 20 elite encounters distributed 5 per canonical region', () => {
    const res = validateWorldContent();
    assert.equal(res.eliteEncounters, 20);
    assert.equal(res.errorsCount, 0);
  });
});

test('Hearthglass Content Validator — Deep Negative & World Integrity Enforcement Suite', async (t) => {
  await t.test('W1. Fails closed on duplicate NPC ID collision', () => {
    const npcs = readJson('content/staging/world/world_npcs_80.json');
    npcs.npcs[1].id = npcs.npcs[0].id;
    const res = validateWorldContent({ overrides: { npcs } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Duplicate NPC ID')));
  });

  await t.test('W2. Fails closed on invalid progression prerequisites in campaign', () => {
    const campaign = readJson('content/staging/world/campaign_twelve_chapters.json');
    campaign.chapters[2].prerequisites = ['invalid_flag_nonexistent'];
    const res = validateWorldContent({ overrides: { campaign } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('missing expected prerequisite flag')));
  });

  await t.test('W3. Fails closed on unreachable quest objective (count <= 0)', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    sideQuests.quests[0].objectives[0].count = 0;
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('is unreachable')));
  });

  await t.test('W4. Fails closed on circular mandatory quest dependencies', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    const q1 = sideQuests.quests[0].id;
    const q2 = sideQuests.quests[1].id;
    sideQuests.quests[0].prerequisite_quest_id = q2;
    sideQuests.quests[1].prerequisite_quest_id = q1;
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Circular mandatory quest dependency detected')));
  });

  await t.test('W5. Fails closed on missing or negative reward definitions', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    sideQuests.quests[0].rewards.crowns = -100;
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('negative crowns reward')));
  });

  await t.test('W6. Fails closed on inaccessible dungeon requirements (level > 50)', () => {
    const dungeons = readJson('content/staging/world/world_dungeons_16.json');
    dungeons.dungeons[0].recommended_level = 99;
    const res = validateWorldContent({ overrides: { dungeons } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('inaccessible recommended_level')));
  });

  await t.test('W7. Fails closed on invalid encounter deck configurations', () => {
    const dungeons = readJson('content/staging/world/world_dungeons_16.json');
    dungeons.dungeons[0].floors[0].encounters[0].deck_id = 'deck_non_existent_abyss';
    const res = validateWorldContent({ overrides: { dungeons } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('references invalid deck_id')));
  });

  await t.test('W8. Fails closed on NPC schedule collisions', () => {
    const npcs = readJson('content/staging/world/world_npcs_80.json');
    npcs.npcs[0].schedule = [
      { time: '10:00', location: 'lumenport_arrival_square', activity: 'activity_a' },
      { time: '10:00', location: 'lumenport_duelist_plaza', activity: 'activity_b' }
    ];
    const res = validateWorldContent({ overrides: { npcs } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('NPC schedule collision')));
  });

  await t.test('W9. Fails closed on region unlock contradictions', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    const lumenQuest = sideQuests.quests.find(q => q.region_id === 'lumenport');
    const astralQuest = sideQuests.quests.find(q => q.region_id === 'astral_archive');
    lumenQuest.prerequisite_quest_id = astralQuest.id;
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Region unlock contradiction')));
  });

  await t.test('W10. Fails closed on unsupported quest objective types', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    sideQuests.quests[0].objectives[0].type = 'hyperjump_into_rift';
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('unsupported objective type')));
  });
});

test('Hearthglass Card Silent-Overwrite & Modification Negative Enforcement Suite (11 Conditions)', async (t) => {
  const getCleanStaged = () => readJson('content/staging/cards/expansion_160_staging_catalogue.json');
  const foundations = readJson('content/cards/foundations_v1.json');
  const canonMap = new Map(foundations.cards.map(c => [c.id, c]));

  await t.test('C1. Fails closed and flags canonical conflict on modified Card Name', () => {
    const staged = getCleanStaged();
    staged.cards[0].name = 'Tampered Flame Champion';
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'name' changed from canonical")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'canonical_conflict');
  });

  await t.test('C2. Fails closed and flags mechanical change on modified Aether Cost', () => {
    const staged = getCleanStaged();
    staged.cards[0].cost = 9;
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'cost' changed from canonical")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'proposed_mechanical_change');
  });

  await t.test('C3. Fails closed and flags mechanical change on modified Attack', () => {
    const staged = getCleanStaged();
    staged.cards[0].attack = 99;
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'attack' changed from canonical")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'proposed_mechanical_change');
  });

  await t.test('C4. Fails closed and flags mechanical change on modified Health', () => {
    const staged = getCleanStaged();
    staged.cards[0].health = 99;
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'health' changed from canonical")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'proposed_mechanical_change');
  });

  await t.test('C5. Fails closed and flags canonical conflict on modified Faction', () => {
    const staged = getCleanStaged();
    staged.cards[0].faction = 'iron_choir';
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'faction' changed from canonical")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'canonical_conflict');
  });

  await t.test('C6. Fails closed and flags canonical conflict on modified Rarity', () => {
    const staged = getCleanStaged();
    staged.cards[0].rarity = 'legendary';
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'rarity' changed from canonical")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'canonical_conflict');
  });

  await t.test('C7. Fails closed and flags mechanical change on modified Keywords', () => {
    const staged = getCleanStaged();
    staged.cards[0].keywords = ['stealth', 'ward'];
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'keywords' changed from canonical")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'proposed_mechanical_change');
  });

  await t.test('C8. Fails closed and flags mechanical change on modified Ability Trigger', () => {
    const staged = getCleanStaged();
    staged.cards[0].abilities = JSON.parse(JSON.stringify(staged.cards[0].abilities || []));
    if (staged.cards[0].abilities.length > 0) {
      staged.cards[0].abilities[0].trigger = 'when_damaged';
    }
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'abilities' effect AST modified")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'proposed_mechanical_change');
  });

  await t.test('C9. Fails closed and flags mechanical change on modified Effect Operation', () => {
    const staged = getCleanStaged();
    staged.cards[0].abilities = JSON.parse(JSON.stringify(staged.cards[0].abilities || []));
    if (staged.cards[0].abilities[0]?.effects?.length > 0) {
      staged.cards[0].abilities[0].effects[0].operation = 'deal_damage';
    }
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'abilities' effect AST modified")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'proposed_mechanical_change');
  });

  await t.test('C10. Fails closed and flags mechanical change on modified Effect Target', () => {
    const staged = getCleanStaged();
    staged.cards[0].abilities = JSON.parse(JSON.stringify(staged.cards[0].abilities || []));
    if (staged.cards[0].abilities[0]?.effects?.length > 0) {
      staged.cards[0].abilities[0].effects[0].target = 'enemy_leader';
    }
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'abilities' effect AST modified")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'proposed_mechanical_change');
  });

  await t.test('C11. Fails closed and flags mechanical change on modified Ability Amount', () => {
    const staged = getCleanStaged();
    staged.cards[0].abilities = JSON.parse(JSON.stringify(staged.cards[0].abilities || []));
    if (staged.cards[0].abilities[0]?.effects?.length > 0) {
      staged.cards[0].abilities[0].effects[0].amount = 99;
    }
    const res = validateWorldContent({ overrides: { stagedCards: staged } });
    assert.equal(res.valid, false);
    assert.ok(res.errors.some(e => e.includes("Field 'abilities' effect AST modified")));

    const classification = classifyCardComparison(staged.cards[0], canonMap.get(staged.cards[0].id));
    assert.equal(classification.classification, 'proposed_mechanical_change');
  });
});
