import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { WebSocket } from 'ws';
import { createServer } from '../src/server.mjs';
import { ArtProductionPipeline } from '../src/art_pipeline.mjs';

function makeTempPgDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'hearthglass-secauth-test-'));
}

async function withAuthServer(fn) {
  const dataDir = makeTempPgDir();
  const ctx = await createServer({ dataDir });
  await new Promise((resolve) => ctx.server.listen(0, '127.0.0.1', resolve));
  const { port } = ctx.server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const wsUrl = `ws://127.0.0.1:${port}/v1/ws`;

  // Create standard player session and admin session
  const adminLogin = await fetch(`${baseUrl}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Aerin_Vanguard',
      password: 'hearthglass_default_password'
    })
  });
  const adminAuth = await adminLogin.json();

  const playerReg = await fetch(`${baseUrl}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'CasualDuelist',
      email: 'casual@hearthglass.local',
      password: 'casual_password'
    })
  });
  const playerAuth = await playerReg.json();

  const victimReg = await fetch(`${baseUrl}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'VictimPlayer',
      email: 'victim@hearthglass.local',
      password: 'victim_password'
    })
  });
  const victimAuth = await victimReg.json();

  try {
    await fn({
      baseUrl,
      wsUrl,
      dataDir,
      adminAuth,
      playerAuth,
      victimAuth,
      ...ctx
    });
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

test('SECURITY: Missing, invalid, and forged authentication tokens fail closed with HTTP 401', async () => {
  await withAuthServer(async ({ baseUrl }) => {
    // 1. Missing Authorization header
    const noAuthRes = await fetch(`${baseUrl}/v1/profile`);
    assert.equal(noAuthRes.status, 401, 'Unauthenticated request must return 401');

    // 2. Empty Authorization header
    const emptyAuthRes = await fetch(`${baseUrl}/v1/collection`, {
      headers: { Authorization: '' }
    });
    assert.equal(emptyAuthRes.status, 401, 'Empty authorization header must return 401');

    // 3. Forged / invalid Bearer token
    const fakeAuthRes = await fetch(`${baseUrl}/v1/decks`, {
      headers: { Authorization: 'Bearer hg_forged_token_0000000000000000000000' }
    });
    assert.equal(fakeAuthRes.status, 401, 'Invalid Bearer token must return 401');

    // 4. Decks POST without auth
    const saveNoAuth = await fetch(`${baseUrl}/v1/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hacked Deck' })
    });
    assert.equal(saveNoAuth.status, 401, 'Deck creation without auth must return 401');
  });
});

test('SECURITY: Cross-account tampering and user_id impersonation fail closed with HTTP 403', async () => {
  await withAuthServer(async ({ baseUrl, playerAuth, victimAuth }) => {
    // 1. Attacker attempts to inspect victim profile by passing victim user_id
    const crossProfileRes = await fetch(`${baseUrl}/v1/profile?user_id=${victimAuth.user_id}`, {
      headers: { Authorization: `Bearer ${playerAuth.token}` }
    });
    assert.equal(crossProfileRes.status, 403, 'Cross-account profile access must be forbidden');

    // 2. Attacker attempts to modify victim deck by injecting user_id in body
    const crossDeckRes = await fetch(`${baseUrl}/v1/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerAuth.token}`
      },
      body: JSON.stringify({
        user_id: victimAuth.user_id,
        name: 'Injected Deck',
        cards: []
      })
    });
    assert.equal(crossDeckRes.status, 403, 'Cross-account deck creation must be forbidden');

    // 3. Attacker attempts to drain victim wallet via shop purchase
    const crossShopRes = await fetch(`${baseUrl}/v1/shop/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerAuth.token}`
      },
      body: JSON.stringify({
        user_id: victimAuth.user_id,
        pack_id: 'pack_foundations'
      })
    });
    assert.equal(crossShopRes.status, 403, 'Cross-account shop purchase must be forbidden');
  });
});

test('SECURITY: Match authorization rejects seat impersonation and unauthorized commands', async () => {
  await withAuthServer(async ({ baseUrl, adminAuth, playerAuth, victimAuth }) => {
    // 1. Player creates an authoritative match (Player 0 is playerAuth.user_id)
    const createMatchRes = await fetch(`${baseUrl}/v1/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerAuth.token}`
      },
      body: JSON.stringify({
        opponent_user_id: victimAuth.user_id,
        opponent_name: 'VictimPlayer'
      })
    });
    assert.equal(createMatchRes.status, 201);
    const { match } = await createMatchRes.json();
    const matchId = match.id;

    // 2. Third-party (adminAuth) attempts to submit a command for a match they are not part of -> 403
    const unauthorizedCmdRes = await fetch(`${baseUrl}/v1/matches/${matchId}/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAuth.token}`
      },
      body: JSON.stringify({
        type: 'end_turn',
        player: 0
      })
    });
    assert.equal(unauthorizedCmdRes.status, 403, 'Non-participant cannot send match commands');

    // 3. Unauthenticated command submission -> 401
    const noAuthCmdRes = await fetch(`${baseUrl}/v1/matches/${matchId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'end_turn' })
    });
    assert.equal(noAuthCmdRes.status, 401, 'Unauthenticated command must return 401');

    // 4. Spectator privacy: third-party spectator inspects match -> all player hands must be redacted
    const specRes = await fetch(`${baseUrl}/v1/matches/${matchId}?viewer=spectator`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` }
    });
    assert.equal(specRes.status, 200);
    const specBody = await specRes.json();
    assert.ok(
      specBody.match.players[0].hand.every((c) => c.card_id === 'HIDDEN'),
      'Spectator must not see Player 0 hand'
    );
    assert.ok(
      specBody.match.players[1].hand.every((c) => c.card_id === 'HIDDEN'),
      'Spectator must not see Player 1 hand'
    );
  });
});

test('SECURITY: WebSocket authentication enforces token validation, seat binding, and rejects command spoofing', async () => {
  await withAuthServer(async ({ baseUrl, wsUrl, playerAuth, victimAuth }) => {
    // 1. Connect without auth and attempt to queue -> rejected with UNAUTHORIZED
    const rawClient = await connectWs(wsUrl);
    rawClient.ws.send(JSON.stringify({ type: 'queue_1v1' }));
    const unauthErr = await rawClient.waitForMessage((m) => m.type === 'error');
    assert.equal(unauthErr.code, 'UNAUTHORIZED');
    rawClient.ws.close();

    // 2. Attempt auth with invalid token -> rejected
    const badClient = await connectWs(wsUrl);
    badClient.ws.send(JSON.stringify({ type: 'auth', token: 'invalid_token_123' }));
    const badAuthErr = await badClient.waitForMessage((m) => m.type === 'error');
    assert.ok(badAuthErr.error.includes('Invalid or expired'));
    badClient.ws.close();

    // 3. Authenticate valid player and create a match
    const clientA = await connectWs(wsUrl);
    clientA.ws.send(JSON.stringify({ type: 'auth', token: playerAuth.token }));
    await clientA.waitForMessage((m) => m.type === 'authenticated');

    const clientB = await connectWs(wsUrl);
    clientB.ws.send(JSON.stringify({ type: 'auth', token: victimAuth.token }));
    await clientB.waitForMessage((m) => m.type === 'authenticated');

    // Queue both players into PvP match
    clientA.ws.send(JSON.stringify({ type: 'queue_1v1' }));
    await clientA.waitForMessage((m) => m.type === 'queued');

    clientB.ws.send(JSON.stringify({ type: 'queue_1v1' }));
    const matchFoundA = await clientA.waitForMessage((m) => m.type === 'match_found');
    const matchFoundB = await clientB.waitForMessage((m) => m.type === 'match_found');
    assert.equal(matchFoundA.match_id, matchFoundB.match_id);

    // 4. Client B (Seat 1) attempts to submit a command claiming to be Player 0 -> Server forces Player 1 and rejects
    clientB.ws.send(
      JSON.stringify({
        type: 'submit_command',
        match_id: matchFoundA.match_id,
        command: { type: 'end_turn', player: 0 } // Spoof attempt
      })
    );
    const rejMsg = await clientB.waitForMessage((m) => m.type === 'command_rejected');
    assert.ok(rejMsg, 'Spoofed seat command must be rejected by authoritative engine');

    clientA.ws.close();
    clientB.ws.close();
  });
});

test('SECURITY: Content Studio art mutations require administrator role and enforce server budget limits', async () => {
  await withAuthServer(async ({ baseUrl, playerAuth, adminAuth }) => {
    // 1. Unauthenticated prompt mutation -> 401
    const unauthPrompt = await fetch(`${baseUrl}/v1/art/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: 'EMB-C-0001', prompt: 'New Prompt' })
    });
    assert.equal(unauthPrompt.status, 401);

    // 2. Standard player attempts art mutation -> 403 Forbidden
    const forbiddenPrompt = await fetch(`${baseUrl}/v1/art/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerAuth.token}`
      },
      body: JSON.stringify({ card_id: 'EMB-C-0001', prompt: 'Hacked Prompt' })
    });
    assert.equal(forbiddenPrompt.status, 403);

    const origDetail = await (await fetch(`${baseUrl}/v1/art/cards/EMB-C-0001`)).json();
    const origPrompt = origDetail.art_record?.custom_prompt || '';

    // 3. Admin user authorized to update prompt -> 200
    const adminPrompt = await fetch(`${baseUrl}/v1/art/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAuth.token}`
      },
      body: JSON.stringify({ card_id: 'EMB-C-0001', prompt: 'Sanctioned Art Prompt' })
    });
    assert.equal(adminPrompt.status, 200);

    // Restore original prompt so working tree remains pristine
    await fetch(`${baseUrl}/v1/art/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAuth.token}`
      },
      body: JSON.stringify({ card_id: 'EMB-C-0001', prompt: origPrompt })
    });

    // 4. Client body attempts to authorize budget ($500) exceeding server limit ($0) -> rejected with 400
    const budgetBypassRes = await fetch(`${baseUrl}/v1/art/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAuth.token}`
      },
      body: JSON.stringify({
        card_id: 'EMB-C-0020',
        provider_id: 'flux_2_klein',
        authorized_budget_usd: 500
      })
    });
    assert.equal(budgetBypassRes.status, 400);
    const budgetErr = await budgetBypassRes.json();
    assert.ok(budgetErr.error.includes('budget'));
  });
});

test('SECURITY: Malformed JSON and oversized payloads are rejected with HTTP 400 / 413', async () => {
  await withAuthServer(async ({ baseUrl, adminAuth }) => {
    // 1. Malformed JSON payload
    const malformedRes = await fetch(`${baseUrl}/v1/decks/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"cards\": [unclosed-json'
    });
    assert.equal(malformedRes.status, 400, 'Malformed JSON must return 400');

    // 2. Oversized payload (> 2MB)
    const giantPayload = JSON.stringify({ data: 'A'.repeat(2.5 * 1024 * 1024) });
    const oversizedRes = await fetch(`${baseUrl}/v1/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAuth.token}`
      },
      body: giantPayload
    });
    assert.equal(oversizedRes.status, 413, 'Oversized payload must return 413 Payload Too Large');
  });
});

test('INTEGRITY: Approved production artwork remains intact across ArtProductionPipeline restarts', async () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hearthglass-art-restart-'));
  try {
    const cardId = 'EMB-C-0001'; // Faction showcase card
    const testCards = [{ id: cardId, name: 'Ashborne Initiate', faction: 'emberclad' }];
    const pipeline1 = new ArtProductionPipeline({ rootDir: tmpRoot, cards: testCards });

    // 1. Generate real sample PNG (1x1 red pixel PNG)
    const samplePng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );

    // 2. Add candidate raster asset via ingestRasterCandidate
    const { candidate } = pipeline1.ingestRasterCandidate({
      card_id: cardId,
      buffer: samplePng,
      original_filename: 'showcase_ashborne_master.png',
      provider_id: 'flux_2_klein',
      model_id: 'flux-2-klein-v1'
    });

    // 3. Complete authorized production review
    const approveResult = pipeline1.approveCandidate(cardId, candidate.candidate_id, {
      approval_type: 'production',
      approved_by: 'LeadArtDirector',
      visual_review_passed: true,
      visual_quality_confirmed: true,
      allow_overwrite: true
    });
    assert.equal(approveResult.art_record.final_production_approved, true);
    assert.equal(approveResult.art_record.approved, true);

    const savedCand = approveResult.art_record.candidates.find(
      (c) => (c.candidate_id || c.id) === approveResult.art_record.preferred_candidate_id
    );
    const savedHash = savedCand.asset_hash;
    assert.ok(savedHash);

    // 4. Simulate server restart by instantiating new ArtProductionPipeline on same directory
    const pipeline2 = new ArtProductionPipeline({ rootDir: tmpRoot, cards: testCards });
    const restartedRecord = pipeline2.getCardArtRecord(cardId);

    // 5. Verify production approval and raster asset remained byte-identical and were not overwritten by SVG concepts
    assert.equal(restartedRecord.final_production_approved, true, 'Approval status must survive restart');
    assert.equal(restartedRecord.art_tier, 'final_production_illustration');
    assert.equal(restartedRecord.status, 'production_approved');

    const exportedGodotFile = path.join(tmpRoot, 'apps/game-client/assets/cards/EMB-C-0001.png');
    assert.ok(fs.existsSync(exportedGodotFile), 'Exported PNG must exist on disk after restart');
    const restartedBytes = fs.readFileSync(exportedGodotFile);
    assert.equal(restartedBytes.length, samplePng.length, 'File size must remain byte-identical');
    const restartedHash = crypto.createHash('sha256').update(restartedBytes).digest('hex');
    assert.equal(restartedHash, savedHash, 'Asset hash must remain stable across restarts');

    // 6. Verify in-game requires evidence
    const inGameRes = pipeline2.verifyInGame(cardId, { client_render_test: 'passed_godot_import' });
    assert.equal(inGameRes.art_record.verified_in_game, true);
  } finally {
    try {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    } catch {}
  }
});
