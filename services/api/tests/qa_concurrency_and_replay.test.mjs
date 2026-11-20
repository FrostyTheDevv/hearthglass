import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { WebSocket } from 'ws';
import { createServer } from '../src/server.mjs';
import { RustBattleEngineBridge } from '../src/rust_bridge.mjs';

function makeTempPgDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'hearthglass-qa-concurrency-'));
}

async function withQaServer(fn) {
  const dataDir = makeTempPgDir();
  const ctx = await createServer({ dataDir });
  await new Promise((resolve) => ctx.server.listen(0, '127.0.0.1', resolve));
  const { port } = ctx.server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const wsUrl = `ws://127.0.0.1:${port}/v1/ws`;

  try {
    await fn({ baseUrl, wsUrl, dataDir, ...ctx });
  } finally {
    await ctx.closeServer();
    try {
      fs.rmSync(dataDir, { recursive: true, force: true });
    } catch {}
  }
}

function connectWs(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const inbox = [];
    const waiters = [];

    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString('utf8'));
      for (let i = 0; i < waiters.length; i++) {
        if (waiters[i].predicate(parsed)) {
          const { resolve: res } = waiters.splice(i, 1)[0];
          res(parsed);
          return;
        }
      }
      inbox.push(parsed);
    });

    function waitForMessage(predicate, timeoutMs = 6000) {
      for (let i = 0; i < inbox.length; i++) {
        if (predicate(inbox[i])) {
          return Promise.resolve(inbox.splice(i, 1)[0]);
        }
      }
      return new Promise((res, rej) => {
        const timer = setTimeout(() => {
          rej(
            new Error(
              `Timed out waiting for WebSocket message. Inbox had: ${JSON.stringify(
                inbox.map((m) => m.type)
              )}`
            )
          );
        }, timeoutMs);
        waiters.push({
          predicate,
          resolve: (msg) => {
            clearTimeout(timer);
            res(msg);
          }
        });
      });
    }

    ws.on('open', () => resolve({ ws, waitForMessage, inbox }));
    ws.on('error', reject);
  });
}

// =========================================================================
// 1. CONCURRENT DATABASE MUTATIONS & RACE CONDITIONS
// =========================================================================

test('QA CONCURRENCY: Rapid concurrent shop pack purchases never allow double-spending or negative balances', async () => {
  await withQaServer(async ({ baseUrl, db }) => {
    // 1. Register a fresh player
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ConcurrentShopper',
        email: 'shopper@hearthglass.local',
        password: 'secure_password_123'
      })
    });
    assert.equal(regRes.status, 201);
    const { token, user_id: userId } = await regRes.json();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // 2. Authoritatively set crowns balance to exactly 100 (cost of 1 pack)
    await db.query(`UPDATE wallet_balances SET crowns = 100 WHERE user_id = $1`, [userId]);

    // 3. Fire 5 concurrent pack purchases simultaneously
    const purchasePromises = Array.from({ length: 5 }, (_, i) =>
      fetch(`${baseUrl}/v1/shop/purchase`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pack_id: 'pack_foundations'
        })
      }).then(async (res) => ({
        status: res.status,
        body: await res.json()
      }))
    );

    const results = await Promise.all(purchasePromises);
    const successes = results.filter((r) => r.status === 200);
    const failures = results.filter((r) => r.status !== 200);

    // EXACTLY 1 purchase may succeed; the other 4 must fail!
    assert.equal(
      successes.length,
      1,
      `Expected exactly 1 successful pack purchase with 100 Crowns, got ${successes.length}`
    );
    assert.equal(failures.length, 4, 'Remaining concurrent requests must fail');

    // 4. Verify authoritative database wallet is exactly 0, never negative
    const walletRes = await db.query(
      `SELECT crowns, echo_dust FROM wallet_balances WHERE user_id = $1`,
      [userId]
    );
    const finalCrowns = Number(walletRes.rows[0].crowns);
    assert.equal(finalCrowns, 0, 'Crowns must be exactly 0 after 1 purchase');
    assert.ok(finalCrowns >= 0, 'Wallet balance must never be negative');
  });
});

test('QA CONCURRENCY: Concurrent card crafting with shared Echo Dust maintains strict balance integrity', async () => {
  await withQaServer(async ({ baseUrl, db }) => {
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ConcurrentCrafter',
        email: 'crafter@hearthglass.local',
        password: 'secure_password_123'
      })
    });
    const { token, user_id: userId } = await regRes.json();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // Common card costs 40 Echo Dust. Give player 100 Echo Dust (enough for exactly 2 common cards: 2 x 40 = 80)
    await db.query(`UPDATE wallet_balances SET echo_dust = 100 WHERE user_id = $1`, [userId]);
    await db.query(
      `INSERT INTO player_card_ownership (user_id, card_id, quantity) VALUES ($1, 'EMB-C-0001', 0) ON CONFLICT (user_id, card_id) DO UPDATE SET quantity = 0`,
      [userId]
    );

    // Fire 4 concurrent crafting requests for EMB-C-0001 (cost 40 dust each)
    const craftPromises = Array.from({ length: 4 }, () =>
      fetch(`${baseUrl}/v1/crafting/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          card_id: 'EMB-C-0001',
          action: 'craft'
        })
      }).then(async (res) => ({
        status: res.status,
        body: await res.json()
      }))
    );

    const results = await Promise.all(craftPromises);
    const successes = results.filter((r) => r.status === 200);

    // With 100 Echo Dust and 40 cost each, at most 2 operations can succeed
    assert.ok(
      successes.length <= 2,
      `At most 2 crafts could succeed with 100 dust, got ${successes.length}`
    );

    const walletRes = await db.query(
      `SELECT echo_dust FROM wallet_balances WHERE user_id = $1`,
      [userId]
    );
    const finalDust = Number(walletRes.rows[0].echo_dust);
    assert.equal(finalDust, 100 - successes.length * 40);
    assert.ok(finalDust >= 0, 'Echo Dust balance must remain non-negative');
  });
});

// =========================================================================
// 2. CLIENT/SERVER RPC SERIALIZATION COMPATIBILITY
// =========================================================================

test('QA SERIALIZATION: Rust Battle Engine RPC stdio bridge round-trip compatibility across all 8 RPC operations', async () => {
  const bridge = new RustBattleEngineBridge();
  try {
    // 1. validate_deck
    const decksFile = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'content/cards/starter_decks.json'), 'utf8')
    );
    const validRes = await bridge.validateDeck(decksFile.decks[0]);
    assert.equal(validRes.valid, true);

    // 2. create_match1v1
    const match1v1 = await bridge.createMatch1v1(decksFile.decks[0], decksFile.decks[1], 123456);
    assert.ok(match1v1.state);
    assert.ok(match1v1.checksum > 0);
    assert.equal(match1v1.state.format, 'standard1v1');

    // 3. create_match2v2
    const match2v2 = await bridge.createMatch2v2(
      [decksFile.decks[0], decksFile.decks[1], decksFile.decks[2], decksFile.decks[3]],
      654321
    );
    assert.ok(match2v2.state);
    assert.equal(match2v2.state.format, 'tag2v2');
    assert.equal(match2v2.state.players.length, 4);

    // 4. legal_commands
    const legalRes = await bridge.getLegalCommands(match1v1.state);
    assert.ok(Array.isArray(legalRes.commands));
    assert.ok(legalRes.commands.length > 0);

    // 5. choose_ai_command
    const aiCmd = await bridge.chooseAiCommand(match1v1.state, 'skilled');
    assert.ok(aiCmd.command);

    // 6. apply_command
    const applyRes = await bridge.applyCommand(match1v1.state, {
      type: 'end_turn',
      player: 0
    });
    assert.equal(applyRes.result.accepted, true);
    assert.equal(applyRes.state.active_player, 1);

    // 7. redact_state
    const redactedState = await bridge.redactState(applyRes.state, 0);
    assert.equal(redactedState.state.players[1].hand[0].card_id, 'HIDDEN');

    // 8. redact_events
    const redactedEvents = await bridge.redactEvents(applyRes.result.events, 1);
    assert.ok(Array.isArray(redactedEvents.events));
  } finally {
    bridge.close();
  }
});

// =========================================================================
// 3. MULTIPLAYER WEBSOCKET RECONNECT RECOVERY
// =========================================================================

test('QA MULTIPLAYER: Disconnected client can reconnect, authenticate, and resume match with updated snapshot', async () => {
  await withQaServer(async ({ baseUrl, wsUrl }) => {
    // Register Player 0 and Player 1
    const reg0 = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ReconnectP0',
        email: 'rec0@hearthglass.local',
        password: 'password123'
      })
    });
    const { token: t0 } = await reg0.json();

    const reg1 = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ReconnectP1',
        email: 'rec1@hearthglass.local',
        password: 'password123'
      })
    });
    const { token: t1 } = await reg1.json();

    // 1. Connect Client 0 and Client 1
    const c0 = await connectWs(wsUrl);
    const c1 = await connectWs(wsUrl);

    // Authenticate both
    c0.ws.send(JSON.stringify({ type: 'auth', token: t0 }));
    await c0.waitForMessage((m) => m.type === 'authenticated');

    c1.ws.send(JSON.stringify({ type: 'auth', token: t1 }));
    await c1.waitForMessage((m) => m.type === 'authenticated');

    // Both queue for casual 1v1
    c0.ws.send(JSON.stringify({ type: 'queue_1v1', seed: 777888 }));
    await c0.waitForMessage((m) => m.type === 'queued');

    c1.ws.send(JSON.stringify({ type: 'queue_1v1', seed: 777888 }));

    const startMsg0 = await c0.waitForMessage((m) => m.type === 'match_found');
    const startMsg1 = await c1.waitForMessage((m) => m.type === 'match_found');
    assert.equal(startMsg0.match_id, startMsg1.match_id);
    const matchId = startMsg0.match_id;

    // 2. Client 0 simulates an unexpected network drop: close socket
    c0.ws.close();

    // 3. Client 0 reconnects via new socket
    const c0_reconnected = await connectWs(wsUrl);
    c0_reconnected.ws.send(JSON.stringify({ type: 'auth', token: t0 }));
    await c0_reconnected.waitForMessage((m) => m.type === 'authenticated');

    // Client 0 requests reconnection to active match
    c0_reconnected.ws.send(JSON.stringify({ type: 'reconnect_match', match_id: matchId }));
    const reconMsg = await c0_reconnected.waitForMessage(
      (m) => m.type === 'match_joined'
    );
    assert.ok(reconMsg, 'Reconnected player must receive state upon reconnecting');
    assert.equal(reconMsg.match_id, matchId);
    assert.ok(reconMsg.match, 'Reconnected state must include redacted match payload');

    c0_reconnected.ws.close();
    c1.ws.close();
  });
});
