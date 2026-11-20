import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWorldContent } from '../../../tools/card-validator/world_validator.mjs';

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
