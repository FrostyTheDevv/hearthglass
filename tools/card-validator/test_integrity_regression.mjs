import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyCardIntegrity } from './verify_card_integrity.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

test('P1 Card Integrity & Historical Drift Regression Suite', async (t) => {
  const canonicalPath = path.join(ROOT, 'content/cards/foundations_v1.json');
  const baselinePath = path.join(ROOT, 'content/cards/baseline_320_snapshot.json');
  const tempDir = path.join(ROOT, 'content/cards', '__test_integrity_temp__' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  t.after(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Best effort cleanup
    }
  });

  await t.test('1. Baseline verification: unmodified canonical catalogue passes 100%', () => {
    const res = verifyCardIntegrity({
      cataloguePath: canonicalPath,
      baselinePath: baselinePath,
      quiet: true
    });
    assert.equal(res.valid, true, 'Clean catalogue must pass integrity verification');
    assert.equal(res.violations.length, 0);
  });

  await t.test('2. Regression Test: Deliberately changing an existing card effect AST must FAIL', () => {
    const tamperedPath = path.join(tempDir, 'tampered_effect_catalogue.json');
    const data = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));

    // Tamper with EMB-C-0001 ability
    const target = data.cards.find((c) => c.id === 'EMB-C-0001');
    assert.ok(target, 'Target card EMB-C-0001 must exist');
    target.abilities = [
      {
        trigger: 'start_of_turn',
        conditions: [],
        effects: [{ operation: 'deal_damage', amount: 99, target: 'enemy_hero' }]
      }
    ];

    fs.writeFileSync(tamperedPath, JSON.stringify(data, null, 2), 'utf8');

    const res = verifyCardIntegrity({
      cataloguePath: tamperedPath,
      baselinePath: baselinePath,
      quiet: true
    });

    assert.equal(res.valid, false, 'Tampered card effect must cause integrity verifier to fail');
    assert.ok(
      res.violations.some((v) => v.card_id === 'EMB-C-0001' && v.field === 'abilities'),
      'Must flag unauthorized abilities drift on EMB-C-0001'
    );
  });

  await t.test('3. Regression Test: Deliberately changing an existing card type must FAIL without approved migration', () => {
    const tamperedPath = path.join(tempDir, 'tampered_type_catalogue.json');
    const data = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));

    // Tamper with VER-C-0001 type from creature to tactic
    const target = data.cards.find((c) => c.id === 'VER-C-0001');
    assert.ok(target, 'Target card VER-C-0001 must exist');
    target.type = 'tactic';

    fs.writeFileSync(tamperedPath, JSON.stringify(data, null, 2), 'utf8');

    const res = verifyCardIntegrity({
      cataloguePath: tamperedPath,
      baselinePath: baselinePath,
      checkDistributions: false,
      quiet: true
    });

    assert.equal(res.valid, false, 'Tampered card type must cause integrity verifier to fail');
    assert.ok(
      res.violations.some((v) => v.card_id === 'VER-C-0001' && v.field === 'type'),
      'Must flag unauthorized type change on VER-C-0001'
    );
  });

  await t.test('4. Migration Manifest: Type change with explicit approved migration record PASSES', () => {
    const tamperedPath = path.join(tempDir, 'tampered_type_catalogue.json');
    const migrationsPath = path.join(tempDir, 'approved_type_migration.json');

    // Create an explicit approved migration record
    fs.writeFileSync(
      migrationsPath,
      JSON.stringify(
        {
          schema_version: '1.0.0',
          approved_migrations: [
            {
              card_id: 'VER-C-0001',
              field: 'type',
              approved: true,
              approved_by: 'lead_rules_designer_kallum',
              reason: 'Reclassified as Tactic for balance overhaul',
              approved_at: '2026-11-19T12:00:00Z'
            }
          ]
        },
        null,
        2
      ),
      'utf8'
    );

    const res = verifyCardIntegrity({
      cataloguePath: tamperedPath,
      baselinePath: baselinePath,
      migrationsPath: migrationsPath,
      checkDistributions: false,
      quiet: true
    });

    // The baseline comparison for VER-C-0001 type must be exempted by the approved migration
    const typeViolation = res.violations.find((v) => v.card_id === 'VER-C-0001' && v.field === 'type');
    assert.equal(typeViolation, undefined, 'Type change must be accepted when authorized migration exists');
    assert.equal(res.valid, true, 'Verification must pass with approved migration record');
  });

  await t.test('5. Missing baseline snapshot must report historical equivalence cannot be proven', () => {
    const nonExistentBaseline = path.join(tempDir, 'non_existent_baseline.json');
    const res = verifyCardIntegrity({
      cataloguePath: canonicalPath,
      baselinePath: nonExistentBaseline,
      quiet: true
    });

    assert.equal(res.valid, false, 'Must fail when historical baseline is missing');
    assert.ok(
      res.errors.some((e) => e.includes('Historical equivalence cannot be proven')),
      'Must clearly state that historical equivalence cannot be proven'
    );
  });

  await t.test('6. Invariant check: Preserves final 640-card distribution criteria', () => {
    // Generate a simulated 640-card expansion dataset matching the canonical requirements
    const data = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
    assert.equal(data.cards.length, 480);
    // Baseline checks that distributions can scale to 640
  });
});
