import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createServer } from '../src/server.mjs';

function makeTempPgDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'hearthglass-sec-test-'));
}

async function withTestServer(fn) {
  const dataDir = makeTempPgDir();
  const ctx = await createServer({ dataDir });
  await new Promise((resolve) => ctx.server.listen(0, '127.0.0.1', resolve));
  const { port } = ctx.server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn({ baseUrl, dataDir, ...ctx });
  } finally {
    await ctx.closeServer();
    try {
      fs.rmSync(dataDir, { recursive: true, force: true });
    } catch {}
  }
}

test('SECURITY: Client-supplied local profile cannot forge or alter authoritative PostgreSQL economy', async () => {
  await withTestServer(async ({ baseUrl, db }) => {
    // 0. Verify unauthenticated bootstrap fails with 401
    const unauthBoot = await fetch(`${baseUrl}/v1/bootstrap`);
    assert.equal(unauthBoot.status, 401, 'Unauthenticated bootstrap must return 401');

    // Register a valid user session
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'EconomyAuditor',
        email: 'auditor@hearthglass.local',
        password: 'secure_auditor_password'
      })
    });
    assert.equal(regRes.status, 201);
    const { token, user_id: testUserId } = await regRes.json();
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 1. Inspect initial server wallet via authenticated bootstrap
    const bootRes = await fetch(`${baseUrl}/v1/bootstrap`, { headers: authHeaders });
    assert.equal(bootRes.status, 200);
    const bootData = await bootRes.json();
    const serverCrowns = bootData.account.crowns;
    const serverDust = bootData.account.echo_dust;

    // 2. Client attempts to forge currency by sending local save data to server endpoints
    const forgeRes = await fetch(`${baseUrl}/v1/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        crowns: 9999999,
        echo_dust: 8888888,
        player_name: 'Hacked_Crowns'
      })
    });
    assert.ok(forgeRes.status === 404 || forgeRes.status === 400 || forgeRes.status === 405);

    const walletRes = await fetch(`${baseUrl}/v1/wallet`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ crowns: 9999999, echo_dust: 8888888 })
    });
    assert.ok(walletRes.status === 404 || walletRes.status === 405);

    // 3. Verify server wallet remains completely unchanged in PostgreSQL
    const profileRes = await fetch(`${baseUrl}/v1/bootstrap`, { headers: authHeaders });
    const verifiedProfile = await profileRes.json();
    assert.equal(verifiedProfile.account.crowns, serverCrowns, 'Crowns must match authoritative DB');
    assert.equal(verifiedProfile.account.echo_dust, serverDust, 'Dust must match authoritative DB');

    // 4. Test insufficient funds rejection on shop pack opening
    await db.query(`UPDATE wallet_balances SET crowns = 50 WHERE user_id = $1`, [testUserId]);

    const packPurchaseRes = await fetch(`${baseUrl}/v1/shop/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ pack_id: 'pack_foundations' })
    });
    assert.equal(packPurchaseRes.status, 400, 'Pack purchase must fail when Crowns are insufficient');
    const packErr = await packPurchaseRes.json();
    assert.match(packErr.error, /insufficient crowns/i);

    // 5. Test insufficient funds rejection on card crafting
    await db.query(`UPDATE player_card_ownership SET quantity = 0 WHERE user_id = $1 AND card_id = 'EMB-E-0008'`, [testUserId]);
    await db.query(`UPDATE wallet_balances SET echo_dust = 10 WHERE user_id = $1`, [testUserId]);
    const craftRes = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ card_id: 'EMB-E-0008', action: 'craft' })
    });
    assert.equal(craftRes.status, 400, 'Crafting must fail when Echo Dust is insufficient');
    const craftErr = await craftRes.json();
    assert.match(craftErr.error, /insufficient echo dust/i);

    console.log('[SECURITY TEST PASSED] Authoritative server-side economy is completely immune to client profile tampering.');
  });
});

test('V10-B: Transactional pack purchase, duplicate conversion, and concurrent race protection', async () => {
  await withTestServer(async ({ baseUrl, db }) => {
    // 1. Register test user
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'PackConcurTester',
        email: 'pack.tester@hearthglass.local',
        password: 'secure_auditor_password'
      })
    });
    assert.equal(regRes.status, 201);
    const { token, user_id: userId } = await regRes.json();
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Set crowns to exactly 100 (enough for exactly ONE pack purchase)
    await db.query('UPDATE wallet_balances SET crowns = 100, echo_dust = 0 WHERE user_id = $1', [userId]);

    // 3. Pre-seed max copies for several common cards to test duplicate conversion
    const commonCards = ['EMB-C-0001', 'EMB-C-0002', 'VER-C-0001', 'IRN-C-0001', 'NEU-C-0001'];
    for (const cid of commonCards) {
      await db.query(
        `INSERT INTO player_card_ownership (user_id, card_id, quantity)
         VALUES ($1, $2, 3)
         ON CONFLICT (user_id, card_id) DO UPDATE SET quantity = 3`,
        [userId, cid]
      );
    }

    // 4. Fire 5 concurrent pack purchase requests simultaneously
    const promises = Array.from({ length: 5 }).map(() =>
      fetch(`${baseUrl}/v1/shop/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ pack_id: 'pack_foundations' })
      })
    );

    const responses = await Promise.all(promises);
    const statusCodes = responses.map((r) => r.status);
    const successes = statusCodes.filter((s) => s === 200).length;
    const failures = statusCodes.filter((s) => s === 400).length;

    // Under atomic database locking, exactly 1 request succeeds and remaining 4 fail
    assert.equal(successes, 1, 'Exactly one concurrent purchase must succeed with 100 crowns');
    assert.equal(failures, 4, 'Remaining concurrent requests must fail closed with 400');

    // 5. Verify wallet balance ended at exactly 0 crowns, never negative
    const profile = await db.getFullPlayerProfile(userId);
    assert.equal(profile.wallet.crowns, 0, 'Crowns balance must be exactly 0, never negative');

    // 6. Check transactions table recorded the pack purchase
    const shopHistory = await db.getShopHistory(userId);
    assert.equal(shopHistory.pack_openings.length, 1, 'Exactly one pack opening record must exist');
    assert.ok(shopHistory.transactions.length >= 1, 'Currency transaction record must be persisted');
  });
});

test('V10-B: Transactional crafting and disenchanting atomicity and copy limits', async () => {
  await withTestServer(async ({ baseUrl, db }) => {
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'CraftDisenchantTester',
        email: 'craft.tester@hearthglass.local',
        password: 'secure_auditor_password'
      })
    });
    const { token, user_id: userId } = await regRes.json();
    const authHeaders = { Authorization: `Bearer ${token}` };

    // Give player 200 Echo Dust
    await db.query('UPDATE wallet_balances SET echo_dust = 200 WHERE user_id = $1', [userId]);
    // Ensure player owns 0 copies of common card NEU-C-0010
    await db.query('DELETE FROM player_card_ownership WHERE user_id = $1 AND card_id = $2', [userId, 'NEU-C-0010']);

    // 1. Craft 1 copy of NEU-C-0010 (costs 40 dust for common)
    const craftRes1 = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ card_id: 'NEU-C-0010', action: 'craft' })
    });
    assert.equal(craftRes1.status, 200);
    const craftJson1 = await craftRes1.json();
    assert.equal(craftJson1.new_quantity, 1);
    assert.equal(craftJson1.wallet.echo_dust, 160);

    // 2. Disenchant that copy (yields 10 dust)
    const disRes = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ card_id: 'NEU-C-0010', action: 'disenchant' })
    });
    assert.equal(disRes.status, 200);
    const disJson = await disRes.json();
    assert.equal(disJson.new_quantity, 0);
    assert.equal(disJson.wallet.echo_dust, 170);

    // 3. Attempting to disenchant when quantity is 0 fails closed
    const disFailRes = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ card_id: 'NEU-C-0010', action: 'disenchant' })
    });
    assert.equal(disFailRes.status, 400);
    const disFailJson = await disFailRes.json();
    assert.match(disFailJson.error, /do not own any copies/i);

    // 4. Test max copy limit enforcement on crafting
    // Seed 3 copies (common cap)
    await db.query(
      `INSERT INTO player_card_ownership (user_id, card_id, quantity)
       VALUES ($1, $2, 3)
       ON CONFLICT (user_id, card_id) DO UPDATE SET quantity = 3`,
      [userId, 'NEU-C-0010']
    );

    const craftMaxRes = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ card_id: 'NEU-C-0010', action: 'craft' })
    });
    assert.equal(craftMaxRes.status, 400);
    const craftMaxJson = await craftMaxRes.json();
    assert.match(craftMaxJson.error, /maximum playable copies/i);
    // Dust must not have been deducted
    const pAfter = await db.getFullPlayerProfile(userId);
    assert.equal(pAfter.wallet.echo_dust, 170);
  });
});

test('V10-B: Forced transaction rollback leaves zero partial mutations across wallet and cards', async () => {
  await withTestServer(async ({ db }) => {
    // Register account directly in DB
    const profile = await db.ensureUserAccount({
      email: 'rollback.test@hearthglass.local',
      username: 'RollbackTester',
      password: 'Complex#AdminPass987!'
    });
    const uid = profile.user_id;

    // Initial state: 500 crowns, 150 dust
    const initialCrowns = profile.wallet.crowns;
    const initialDust = profile.wallet.echo_dust;

    // Simulate a failing multi-mutation transaction
    await assert.rejects(
      async () => {
        await db.withTransaction(async (tx) => {
          // Mutation 1: debit crowns
          await tx('UPDATE wallet_balances SET crowns = crowns - 200 WHERE user_id = $1', [uid]);
          // Mutation 2: insert card
          await tx(
            `INSERT INTO player_card_ownership (user_id, card_id, quantity)
             VALUES ($1, 'IRN-E-0008', 1)
             ON CONFLICT (user_id, card_id) DO UPDATE SET quantity = 1`,
            [uid]
          );
          // Mutation 3: deliberate crash / constraint violation / simulated failure
          throw new Error('Simulated crash during payment processor callback');
        });
      },
      /Simulated crash/
    );

    // Verify complete rollback: crowns and card ownership must be 100% restored
    const verified = await db.getFullPlayerProfile(uid);
    assert.equal(verified.wallet.crowns, initialCrowns, 'Crowns must not have been deducted');
    assert.equal(verified.wallet.echo_dust, initialDust, 'Dust must remain untouched');
    assert.equal(verified.collection['IRN-E-0008'] || 0, 0, 'Card ownership must NOT be granted');
  });
});

test('V10-B: Idempotent match completion prevents double reward payout', async () => {
  await withTestServer(async ({ db }) => {
    const p1 = await db.ensureUserAccount({
      email: 'match.p1@hearthglass.local',
      username: 'MatchPlayer1',
      password: 'Complex#AdminPass987!'
    });
    const p2 = await db.ensureUserAccount({
      email: 'match.p2@hearthglass.local',
      username: 'MatchPlayer2',
      password: 'Complex#AdminPass987!'
    });

    const matchId = crypto.randomUUID();
    await db.query(
      `INSERT INTO matches (id, format, rule_version, seed, status, started_at)
       VALUES ($1, 'standard_1v1', '1.0.0', 12345, 'in_progress', NOW())`,
      [matchId]
    );

    const initialCrowns = p1.wallet.crowns;

    // First completion call (Player 1 wins)
    const comp1 = await db.recordMatchCompletion({
      matchId,
      winnerSlot: 0,
      finalChecksum: 'checksum_1',
      playerIds: [p1.user_id, p2.user_id],
      npcId: null
    });
    assert.equal(comp1.completed, true);

    const p1After1 = await db.getFullPlayerProfile(p1.user_id);
    const expectedCrowns = initialCrowns + 75;
    assert.equal(p1After1.wallet.crowns, expectedCrowns, 'Winner receives 75 crowns');

    // Second completion call with same matchId (simulating duplicate network event or replay)
    const comp2 = await db.recordMatchCompletion({
      matchId,
      winnerSlot: 0,
      finalChecksum: 'checksum_1',
      playerIds: [p1.user_id, p2.user_id],
      npcId: null
    });
    assert.equal(comp2.already_completed, true);

    // Verify rewards were NOT doubled
    const p1After2 = await db.getFullPlayerProfile(p1.user_id);
    assert.equal(p1After2.wallet.crowns, expectedCrowns, 'Winner balance must NOT double on replay');
  });
});
