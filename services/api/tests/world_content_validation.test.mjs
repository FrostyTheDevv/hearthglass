import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateWorldContent } from '../../../tools/card-validator/world_validator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');

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

  await t.test('2. Validates isolated 160-card staging catalogue', () => {
    const res = validateWorldContent();
    assert.equal(res.stagedExpansionCards, 160);
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

test('Hearthglass Content Validator — Deep Negative & Integrity Enforcement Suite', async (t) => {
  const readJson = (relPath) => JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));

  await t.test('N1. Fails closed on duplicate NPC ID collision', () => {
    const npcs = readJson('content/staging/world/world_npcs_80.json');
    npcs.npcs[1].id = npcs.npcs[0].id; // force duplicate ID
    const res = validateWorldContent({ overrides: { npcs } });
    assert.equal(res.valid, false, 'Expected validation to fail on duplicate NPC ID');
    assert.ok(res.errors.some(e => e.includes('Duplicate NPC ID')), `Missing duplicate NPC error: ${res.errors.join('; ')}`);
  });

  await t.test('N2. Fails closed on invalid progression prerequisites in campaign', () => {
    const campaign = readJson('content/staging/world/campaign_twelve_chapters.json');
    campaign.chapters[2].prerequisites = ['invalid_flag_nonexistent'];
    const res = validateWorldContent({ overrides: { campaign } });
    assert.equal(res.valid, false, 'Expected validation to fail on invalid campaign prerequisites');
    assert.ok(res.errors.some(e => e.includes('missing expected prerequisite flag')), `Missing prerequisite error: ${res.errors.join('; ')}`);
  });

  await t.test('N3. Fails closed on unreachable quest objective (count <= 0)', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    sideQuests.quests[0].objectives[0].count = 0; // count must be > 0
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false, 'Expected validation to fail on unreachable quest objective');
    assert.ok(res.errors.some(e => e.includes('is unreachable')), `Missing unreachable objective error: ${res.errors.join('; ')}`);
  });

  await t.test('N4. Fails closed on circular mandatory quest dependencies', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    const q1 = sideQuests.quests[0].id;
    const q2 = sideQuests.quests[1].id;
    sideQuests.quests[0].prerequisite_quest_id = q2;
    sideQuests.quests[1].prerequisite_quest_id = q1;
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false, 'Expected validation to fail on circular quest dependency');
    assert.ok(res.errors.some(e => e.includes('Circular mandatory quest dependency detected')), `Missing cycle error: ${res.errors.join('; ')}`);
  });

  await t.test('N5. Fails closed on missing or negative reward definitions', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    sideQuests.quests[0].rewards.crowns = -100; // negative currency
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false, 'Expected validation to fail on negative reward crowns');
    assert.ok(res.errors.some(e => e.includes('negative crowns reward')), `Missing negative reward error: ${res.errors.join('; ')}`);
  });

  await t.test('N6. Fails closed on inaccessible dungeon requirements (level > 50)', () => {
    const dungeons = readJson('content/staging/world/world_dungeons_16.json');
    dungeons.dungeons[0].recommended_level = 99; // invalid level
    const res = validateWorldContent({ overrides: { dungeons } });
    assert.equal(res.valid, false, 'Expected validation to fail on out-of-range dungeon level');
    assert.ok(res.errors.some(e => e.includes('inaccessible recommended_level')), `Missing inaccessible level error: ${res.errors.join('; ')}`);
  });

  await t.test('N7. Fails closed on invalid encounter deck configurations', () => {
    const dungeons = readJson('content/staging/world/world_dungeons_16.json');
    dungeons.dungeons[0].floors[0].encounters[0].deck_id = 'deck_non_existent_abyss';
    const res = validateWorldContent({ overrides: { dungeons } });
    assert.equal(res.valid, false, 'Expected validation to fail on invalid deck_id');
    assert.ok(res.errors.some(e => e.includes('references invalid deck_id')), `Missing invalid deck error: ${res.errors.join('; ')}`);
  });

  await t.test('N8. Fails closed on NPC schedule collisions', () => {
    const npcs = readJson('content/staging/world/world_npcs_80.json');
    // Assign two conflicting locations at the exact same time
    npcs.npcs[0].schedule = [
      { time: '10:00', location: 'lumenport_arrival_square', activity: 'activity_a' },
      { time: '10:00', location: 'lumenport_duelist_plaza', activity: 'activity_b' }
    ];
    const res = validateWorldContent({ overrides: { npcs } });
    assert.equal(res.valid, false, 'Expected validation to fail on NPC schedule collision');
    assert.ok(res.errors.some(e => e.includes('NPC schedule collision')), `Missing schedule collision error: ${res.errors.join('; ')}`);
  });

  await t.test('N9. Fails closed on region unlock contradictions', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    const lumenQuest = sideQuests.quests.find(q => q.region_id === 'lumenport');
    const astralQuest = sideQuests.quests.find(q => q.region_id === 'astral_archive');
    lumenQuest.prerequisite_quest_id = astralQuest.id; // Tier 1 quest requiring Tier 4 quest
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false, 'Expected validation to fail on region unlock contradiction');
    assert.ok(res.errors.some(e => e.includes('Region unlock contradiction')), `Missing region unlock contradiction error: ${res.errors.join('; ')}`);
  });

  await t.test('N10. Fails closed on unsupported quest objective types', () => {
    const sideQuests = readJson('content/staging/world/world_side_quests_120.json');
    sideQuests.quests[0].objectives[0].type = 'hyperjump_into_rift'; // unsupported type
    const res = validateWorldContent({ overrides: { sideQuests } });
    assert.equal(res.valid, false, 'Expected validation to fail on unsupported objective type');
    assert.ok(res.errors.some(e => e.includes('unsupported objective type')), `Missing unsupported objective type error: ${res.errors.join('; ')}`);
  });

  await t.test('N11. Fails closed on card definitions incompatible with Rust engine', () => {
    const stagedCards = readJson('content/staging/cards/expansion_160_staging_catalogue.json');
    stagedCards.cards[0].mechanic_test_specification.trigger = 'on_mouse_hover_hyperclick'; // unsupported Rust trigger
    const res = validateWorldContent({ overrides: { stagedCards } });
    assert.equal(res.valid, false, 'Expected validation to fail on unsupported Rust trigger');
    assert.ok(res.errors.some(e => e.includes('unsupported Rust trigger')), `Missing Rust compatibility error: ${res.errors.join('; ')}`);
  });

  await t.test('N12. Fails closed on silent overwrite of canonical combat fields', () => {
    const stagedCards = readJson('content/staging/cards/expansion_160_staging_catalogue.json');
    stagedCards.cards[0].attack = 99; // tampered combat stat
    const res = validateWorldContent({ overrides: { stagedCards } });
    assert.equal(res.valid, false, 'Expected validation to fail on silent overwrite of canonical field');
    assert.ok(res.errors.some(e => e.includes('Silent overwrite violation')), `Missing silent overwrite violation error: ${res.errors.join('; ')}`);
  });
});
