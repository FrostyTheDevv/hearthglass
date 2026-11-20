import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { runFullQaAudit, main, auditCatalogueTargets, auditDatabaseIntegrity } from '../../../tools/qa/qa_defect_audit.mjs';

describe('QA Release Gate Runner & CLI Verification Suite', () => {

  test('Scenario 1: Confirmed P0 defect results in BLOCKED status and exit code 1', () => {
    const mockRunner = () => ({
      status: 'ASSERTION_FAILURE',
      verified: false,
      exitCode: 1,
      failure_reason: 'assertion failed: left == right (3 != 2)'
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    assert.equal(audit.release_gate_status, 'BLOCKED');
    assert.equal(audit.active_release_blockers.length, 1);
    assert.equal(audit.active_release_blockers[0].id, 'DEFECT-001');

    // Test CLI exit code behavior
    // Simulate main() using the audit logic
    const hasBlockers = audit.active_release_blockers.length > 0 || audit.process_errors.length > 0;
    const exitCode = hasBlockers ? 1 : 0;
    assert.equal(exitCode, 1, 'Confirmed P0 must produce exit code 1');
  });

  test('Scenario 2: All 7 focused AoE P0 tests passing results in PASSED status and exit code 0', () => {
    const mockRunner = () => ({
      status: 'PASSED',
      verified: true,
      exitCode: 0,
      passed_tests: [
        'test_aoe_enemy_board_coverage',
        'test_aoe_front_rear_positional_resolution',
        'test_aoe_friendly_fire_immunity',
        'test_aoe_ward_absorption',
        'test_aoe_shield_absorption',
        'test_aoe_rebirth_death_trigger',
        'test_aoe_2v2_shared_board_non_duplication'
      ]
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    assert.equal(audit.release_gate_status, 'PASSED');
    assert.equal(audit.active_release_blockers.length, 0);
    assert.ok(audit.resolved_defects.some((d) => d.id === 'DEFECT-001'));

    const hasBlockers = audit.active_release_blockers.length > 0 || audit.process_errors.length > 0;
    const exitCode = hasBlockers ? 1 : 0;
    assert.equal(exitCode, 0, 'Passing all 7 focused P0 tests must produce exit code 0');
  });

  test('Scenario 2b: Broken Shield test blocks release even when basic enemy-board coverage passes', () => {
    const mockRunner = () => ({
      status: 'ASSERTION_FAILURE',
      verified: false,
      exitCode: 1,
      passed_tests: ['test_aoe_enemy_board_coverage', 'test_aoe_friendly_fire_immunity'],
      failed_tests: ['test_aoe_shield_absorption'],
      failure_reason: 'Failed 1 of 7 focused AoE tests: test_aoe_shield_absorption'
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    assert.equal(audit.release_gate_status, 'BLOCKED');
    assert.equal(audit.active_release_blockers.length, 1);
    assert.equal(audit.active_release_blockers[0].id, 'DEFECT-001');

    const hasBlockers = audit.active_release_blockers.length > 0 || audit.process_errors.length > 0;
    assert.equal(hasBlockers ? 1 : 0, 1, 'Shield failure must block release with exit code 1');
  });

  test('Scenario 2c: Broken Rebirth death trigger blocks release even when basic coverage passes', () => {
    const mockRunner = () => ({
      status: 'ASSERTION_FAILURE',
      verified: false,
      exitCode: 1,
      passed_tests: ['test_aoe_enemy_board_coverage', 'test_aoe_shield_absorption'],
      failed_tests: ['test_aoe_rebirth_death_trigger'],
      failure_reason: 'Failed 1 of 7 focused AoE tests: test_aoe_rebirth_death_trigger'
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    assert.equal(audit.release_gate_status, 'BLOCKED');
    assert.equal(audit.active_release_blockers.length, 1);
    assert.equal(audit.active_release_blockers[0].id, 'DEFECT-001');
  });

  test('Scenario 2d: Broken 2v2 shared-board test blocks release even when 1v1 coverage passes', () => {
    const mockRunner = () => ({
      status: 'ASSERTION_FAILURE',
      verified: false,
      exitCode: 1,
      passed_tests: ['test_aoe_enemy_board_coverage', 'test_aoe_front_rear_positional_resolution'],
      failed_tests: ['test_aoe_2v2_shared_board_non_duplication'],
      failure_reason: 'Failed 1 of 7 focused AoE tests: test_aoe_2v2_shared_board_non_duplication'
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    assert.equal(audit.release_gate_status, 'BLOCKED');
    assert.equal(audit.active_release_blockers.length, 1);
    assert.equal(audit.active_release_blockers[0].id, 'DEFECT-001');
  });

  test('Scenario 3: Rust test process crash results in nonzero exit code and process error', () => {
    const mockRunner = () => ({
      status: 'PROCESS_CRASH',
      error: 'SIGSEGV: segmentation violation in rules engine',
      exitCode: 139
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    assert.equal(audit.release_gate_status, 'BLOCKED');
    assert.equal(audit.process_errors.length, 1);
    assert.equal(audit.process_errors[0].id, 'DEFECT-001-EXEC');
    assert.equal(audit.process_errors[0].status, 'PROCESS_CRASH');

    const hasBlockers = audit.active_release_blockers.length > 0 || audit.process_errors.length > 0;
    const exitCode = hasBlockers ? 1 : 0;
    assert.equal(exitCode, 1, 'Process crash must block the gate with exit code 1');
  });

  test('Scenario 4: Missing Rust executable results in nonzero exit code', () => {
    const mockRunner = () => ({
      status: 'MISSING_EXECUTABLE',
      error: 'Cargo executable not found: cargo.exe',
      exitCode: 127
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    assert.equal(audit.release_gate_status, 'BLOCKED');
    assert.equal(audit.process_errors.length, 1);
    assert.equal(audit.process_errors[0].status, 'MISSING_EXECUTABLE');
  });

  test('Scenario 5: Malformed test output results in nonzero exit code', () => {
    const mockRunner = () => ({
      status: 'MALFORMED_OUTPUT',
      error: 'Unrecognized test runner output format',
      exitCode: 1
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    assert.equal(audit.release_gate_status, 'BLOCKED');
    assert.equal(audit.process_errors.length, 1);
    assert.equal(audit.process_errors[0].status, 'MALFORMED_OUTPUT');
  });

  test('Scenario 6: Diagnostic-only flag produces exit code 0 even with known defects', () => {
    // Calling main with ['--diagnostic-only']
    const code = main(['--diagnostic-only']);
    assert.equal(code, 0, '--diagnostic-only must exit with code 0 regardless of active defects');
  });

  test('Scenario 7: Invalid command-line argument produces usage error and exit code 2', () => {
    const code = main(['--unsupported-flag-xyz']);
    assert.equal(code, 2, 'Unrecognized flags must produce exit code 2');
  });

  test('Scenario 8: P1 warning without P0 does not block the release gate', () => {
    const mockRunner = () => ({
      status: 'PASSED',
      verified: true,
      exitCode: 0,
      output: 'test result: ok'
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    // P1 concerns exist (e.g. GAP-001 or DEFECT-003)
    assert.ok(audit.p1_quality_and_balance_concerns.length > 0, 'Audit must include P1 concerns');
    assert.ok(audit.p1_quality_and_balance_concerns.some((c) => c.id === 'GAP-001' || c.id === 'DEFECT-003'));
    assert.equal(audit.active_release_blockers.length, 0);
    assert.equal(audit.release_gate_status, 'PASSED');

    const hasBlockers = audit.active_release_blockers.length > 0 || audit.process_errors.length > 0;
    const exitCode = hasBlockers ? 1 : 0;
    assert.equal(exitCode, 0, 'P1 concerns alone must not block release gate (exit code 0)');
  });

  test('Scenario 9: A corrected AoE implementation removes DEFECT-001 from active blockers', () => {
    const mockRunner = () => ({
      status: 'PASSED',
      verified: true,
      exitCode: 0,
      output: 'test test_aoe_enemy_board_coverage ... ok'
    });

    const audit = runFullQaAudit({ testRunner: mockRunner });
    const isDefect001Active = audit.active_release_blockers.some((b) => b.id === 'DEFECT-001');
    const isDefect001Resolved = audit.resolved_defects.some((d) => d.id === 'DEFECT-001');

    assert.equal(isDefect001Active, false, 'DEFECT-001 must not be active when test passes');
    assert.equal(isDefect001Resolved, true, 'DEFECT-001 must be in resolved_defects when test passes');
  });

  test('Scenario 10: Database integrity scanner accurately verifies V10-B transactional openPack', () => {
    const validDbCode = `
      async openPack(userId, idempotencyKey = null, packId = 'pack_foundations') {
        return this.withTransaction(async (tx) => {
          const ex = await tx('SELECT id FROM currency_transactions WHERE idempotency_key = $1 LIMIT 1');
          const w = await tx('SELECT crowns FROM wallet_balances WHERE user_id = $1 FOR UPDATE');
          const upd = await tx('UPDATE wallet_balances SET crowns = crowns - $2 WHERE user_id = $1 AND crowns >= $2');
        });
      }
    `;

    const brokenDbCode = `
      async openShopPack(userId, packId) {
        const w = await this.query('SELECT crowns FROM wallet_balances WHERE user_id = $1');
        await this.query('UPDATE wallet_balances SET crowns = crowns - 100 WHERE user_id = $1');
      }
    `;

    const validResult = auditDatabaseIntegrity(validDbCode);
    assert.equal(validResult.isResolved, true, 'Valid V10-B code must be marked resolved');

    const brokenResult = auditDatabaseIntegrity(brokenDbCode);
    assert.equal(brokenResult.isResolved, false, 'Legacy non-transactional code must fail');
  });
});
