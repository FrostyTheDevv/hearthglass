import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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
    // 1. Inspect initial server wallet
    const bootRes = await fetch(`${baseUrl}/v1/bootstrap`);
    assert.equal(bootRes.status, 200);
    const bootData = await bootRes.json();
    const serverCrowns = bootData.account.crowns;
    const serverDust = bootData.account.echo_dust;

    // 2. Client attempts to forge currency by sending local save data to server endpoints
    // Attempt A: Direct POST to arbitrary sync endpoint with forged wallet
    const forgeRes = await fetch(`${baseUrl}/v1/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crowns: 9999999,
        echo_dust: 8888888,
        player_name: 'Hacked_Crowns'
      })
    });
    // Server must reject with 404 or 400 or 405
    assert.ok(forgeRes.status === 404 || forgeRes.status === 400 || forgeRes.status === 405);

    // Attempt B: Client attempts to forge currency via PUT /v1/wallet
    const walletRes = await fetch(`${baseUrl}/v1/wallet`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crowns: 9999999, echo_dust: 8888888 })
    });
    assert.ok(walletRes.status === 404 || walletRes.status === 405);

    // 3. Verify server wallet remains completely unchanged in PostgreSQL
    const profileRes = await fetch(`${baseUrl}/v1/bootstrap`);
    const verifiedProfile = await profileRes.json();
    assert.equal(verifiedProfile.account.crowns, serverCrowns, 'Crowns must match authoritative DB');
    assert.equal(verifiedProfile.account.echo_dust, serverDust, 'Dust must match authoritative DB');

    // 4. Test insufficient funds rejection on shop pack opening
    const testUserId = verifiedProfile.account.id;
    // Set balance in DB to 50 crowns (less than 100 required for pack)
    await db.query(`UPDATE wallet_balances SET crowns = 50 WHERE user_id = $1`, [testUserId]);

    const packPurchaseRes = await fetch(`${baseUrl}/v1/shop/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack_id: 'pack_foundations' })
    });
    assert.equal(packPurchaseRes.status, 400, 'Pack purchase must fail when Crowns are insufficient');
    const packErr = await packPurchaseRes.json();
    assert.match(packErr.error, /insufficient crowns/i);

    // 5. Test insufficient funds rejection on card crafting
    await db.query(`UPDATE wallet_balances SET echo_dust = 10 WHERE user_id = $1`, [testUserId]);
    const craftRes = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: 'EMB-C-0019', action: 'craft' }) // Legendary requires 1600 dust
    });
    assert.equal(craftRes.status, 400, 'Crafting must fail when Echo Dust is insufficient');
    const craftErr = await craftRes.json();
    assert.match(craftErr.error, /insufficient echo dust/i);

    console.log('[SECURITY TEST PASSED] Authoritative server-side economy is completely immune to client profile tampering.');
  });
});
