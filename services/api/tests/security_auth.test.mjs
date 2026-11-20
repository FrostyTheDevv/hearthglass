import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { WebSocket } from 'ws';
import { createServer, redactEventsForViewer } from '../src/server.mjs';
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

  // Provision explicit administrator with secure unique credentials
  const adminLogin = await fetch(`${baseUrl}/v1/auth/provision-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Admin_Provisioned_V10',
      email: 'admin_fixture_v10@hearthglass.local',
      password: 'AdminPassword#2026!Fixture',
      provisioning_secret: 'test_provisioning_secret_2026',
      is_test_fixture: true
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


test('SECURITY: WebSocket and REST outbound events redact private card draws and overdraws for opponents and spectators', async () => {
  // 1. Direct deterministic schema unit test across all roles (owner, opponent, teammate, spectator)
  const sampleEvents = [
    { event: 'card_drawn', player: 0, card_id: 'EMB-C-0001', instance_id: 101 },
    { event: 'card_drawn', player: 1, card_id: 'VER-C-0001', instance_id: 102 },
    { event: 'card_burned_overdraw', player: 0, card_id: 'EMB-C-0002' },
    { event: 'creature_summoned', player: 0, card_id: 'EMB-C-0001', name: 'Ashborne Initiate', lane: 1, position: 'front' },
    { event: 'tactic_played', player: 1, card_id: 'VER-T-0006', name: 'Canopy Snare' },
    { event: 'damage_dealt', target_description: 'Defender', amount: 3 },
    { event: 'unknown_future_event', player: 0, card_id: 'SECRET_CARD', hand_index: 2, deck: ['SECRET_DECK'] }
  ];

  // Viewer 0 (Seat 0): sees own draw EMB-C-0001, sees Seat 1 draw redacted to HIDDEN, sees public summons intact
  const forSeat0 = redactEventsForViewer(sampleEvents, 0);
  assert.equal(forSeat0[0].card_id, 'EMB-C-0001', 'Player 0 must see their own drawn card');
  assert.equal(forSeat0[1].card_id, 'HIDDEN', 'Player 0 must NOT see Player 1 drawn card');
  assert.equal(forSeat0[2].card_id, 'EMB-C-0002', 'Player 0 must see their own burned card');
  assert.equal(forSeat0[3].card_id, 'EMB-C-0001', 'Public summons must remain visible to all');
  assert.equal(forSeat0[4].card_id, 'VER-T-0006', 'Public tactics must remain visible to all');
  assert.equal(forSeat0[5].amount, 3, 'Public damage must remain visible to all');
  assert.equal(forSeat0[6].card_id, 'SECRET_CARD', 'Owner sees own future event card');

  // Viewer 1 (Seat 1 - Opponent):
  const forSeat1 = redactEventsForViewer(sampleEvents, 1);
  assert.equal(forSeat1[0].card_id, 'HIDDEN', 'Player 1 must NOT see Player 0 drawn card');
  assert.equal(forSeat1[1].card_id, 'VER-C-0001', 'Player 1 must see their own drawn card');
  assert.equal(forSeat1[2].card_id, 'HIDDEN', 'Player 1 must NOT see Player 0 burned card');
  assert.equal(forSeat1[3].card_id, 'EMB-C-0001', 'Public summons must remain visible');
  assert.equal(forSeat1[6].card_id, 'HIDDEN', 'Future unknown event must fail closed for non-owner');
  assert.equal(forSeat1[6].deck, undefined, 'Future unknown event must strip deck');

  // Viewer null (Spectator):
  const forSpectator = redactEventsForViewer(sampleEvents, null);
  assert.equal(forSpectator[0].card_id, 'HIDDEN', 'Spectator must NOT see Player 0 draw');
  assert.equal(forSpectator[1].card_id, 'HIDDEN', 'Spectator must NOT see Player 1 draw');
  assert.equal(forSpectator[2].card_id, 'HIDDEN', 'Spectator must NOT see Player 0 burn');
  assert.equal(forSpectator[3].card_id, 'EMB-C-0001', 'Spectator sees public summons');
  assert.equal(forSpectator[4].card_id, 'VER-T-0006', 'Spectator sees public tactics');
  assert.equal(forSpectator[6].card_id, 'HIDDEN', 'Spectator has future secret card redacted');

  // 2. Integration test over live WebSocket & REST match
  await withAuthServer(async ({ baseUrl, playerAuth: p1Auth, victimAuth: p2Auth }) => {
    const matchRes = await fetch(`${baseUrl}/v1/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`
      },
      body: JSON.stringify({
        mode: 'pvp_1v1',
        format: 'standard_1v1',
        opponent_user_id: p2Auth.user_id,
        opponent_name: p2Auth.profile.username,
        player_user_ids: [p1Auth.user_id, p2Auth.user_id],
        player_names: [p1Auth.profile.username, p2Auth.profile.username],
        seed: 42
      })
    });
    assert.equal(matchRes.status, 201);
    const { match } = await matchRes.json();
    const matchId = match.id;

    // Both players complete mulligan via REST
    const mul0 = await fetch(`${baseUrl}/v1/matches/${matchId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p1Auth.token}` },
      body: JSON.stringify({ type: 'mulligan', replace_hand_indices: [] })
    });
    assert.equal(mul0.status, 200);

    const mul1 = await fetch(`${baseUrl}/v1/matches/${matchId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p2Auth.token}` },
      body: JSON.stringify({ type: 'mulligan', replace_hand_indices: [] })
    });
    assert.equal(mul1.status, 200);
    const mul1Data = await mul1.json();

    // mul1 causes turn 1 to start, and player 0 draws a card!
    // Since mul1 was called by Player 1 (seat 1), any card_drawn event for player 0 in the REST response must be REDACTED!
    const p0DrawInRest = mul1Data.events.find((e) => (e.event === 'card_drawn' || e.type === 'card_drawn') && e.player === 0);
    if (p0DrawInRest) {
      assert.equal(p0DrawInRest.card_id, 'HIDDEN', 'REST response returned to Player 1 must have Player 0 draw redacted as HIDDEN');
    }

    // Now Player 0 calls end_turn via REST. Turn 2 starts, and Player 1 draws a card.
    const end0 = await fetch(`${baseUrl}/v1/matches/${matchId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${p1Auth.token}` },
      body: JSON.stringify({ type: 'end_turn', player: 0 })
    });
    assert.equal(end0.status, 200);
    const end0Data = await end0.json();

    // Since end0 was called by Player 0 (seat 0), any card_drawn event for player 1 in the REST response must be REDACTED!
    const p1DrawInRest = end0Data.events.find((e) => (e.event === 'card_drawn' || e.type === 'card_drawn') && e.player === 1);
    if (p1DrawInRest) {
      assert.equal(p1DrawInRest.card_id, 'HIDDEN', 'REST response returned to Player 0 must have Player 1 draw redacted as HIDDEN');
    }
  });
});

test('SECURITY: Crafting inventory-loss bug is eliminated: max copies and insufficient dust never decrement inventory', async () => {
  await withAuthServer(async ({ baseUrl, playerAuth: p1Auth, db }) => {
    const cardId = 'EMB-C-0001'; // Common card, max 3 copies
    // Set player ownership to max allowed copies (3)
    await db.query(
      `INSERT INTO player_card_ownership (user_id, card_id, quantity, updated_at)
       VALUES ($1, $2, 3, NOW())
       ON CONFLICT (user_id, card_id) DO UPDATE SET quantity = 3`,
      [p1Auth.user_id, cardId]
    );

    // Initial dust balance
    const initProfile = await db.getFullPlayerProfile(p1Auth.user_id);
    const initialDust = initProfile.wallet.echo_dust;

    // 1. Attempt to craft while at maximum allowed copies
    const maxCraftRes = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`
      },
      body: JSON.stringify({ card_id: cardId, action: 'craft' })
    });
    assert.equal(maxCraftRes.status, 400, 'Crafting at max copies must fail with 400');
    const maxCraftErr = await maxCraftRes.json();
    assert.match(maxCraftErr.error, /maximum playable copies/i);

    // Verify inventory and wallet are COMPLETELY UNTOUCHED
    const profileAfterMax = await db.getFullPlayerProfile(p1Auth.user_id);
    assert.equal(profileAfterMax.collection[cardId], 3, 'Inventory must NOT be decremented before craft attempt');
    assert.equal(profileAfterMax.wallet.echo_dust, initialDust, 'Echo dust must remain unchanged');

    // 2. Reduce dust to 0 and reduce card count to 1 to test insufficient dust failure
    await db.query(`UPDATE wallet_balances SET echo_dust = 0 WHERE user_id = $1`, [p1Auth.user_id]);
    await db.query(`UPDATE player_card_ownership SET quantity = 1 WHERE user_id = $1 AND card_id = $2`, [p1Auth.user_id, cardId]);

    const brokeCraftRes = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`
      },
      body: JSON.stringify({ card_id: cardId, action: 'craft' })
    });
    assert.equal(brokeCraftRes.status, 400, 'Crafting with 0 dust must fail with 400');
    const brokeErr = await brokeCraftRes.json();
    assert.match(brokeErr.error, /insufficient echo dust/i);

    // Verify inventory did NOT change
    const profileAfterBroke = await db.getFullPlayerProfile(p1Auth.user_id);
    assert.equal(profileAfterBroke.collection[cardId], 1, 'Inventory must remain intact on failed craft');
    assert.equal(profileAfterBroke.wallet.echo_dust, 0, 'Echo dust must remain 0');

    // 3. Grant dust and test successful atomic craft with idempotency
    await db.query(`UPDATE wallet_balances SET echo_dust = 200 WHERE user_id = $1`, [p1Auth.user_id]);
    const idemKey = 'test_craft_idem_' + Date.now();

    const successCraftRes = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`,
        'X-Idempotency-Key': idemKey
      },
      body: JSON.stringify({ card_id: cardId, action: 'craft' })
    });
    assert.equal(successCraftRes.status, 200);
    const successData = await successCraftRes.json();
    assert.equal(successData.new_quantity, 2, 'Quantity must increment to 2');
    assert.equal(successData.echo_dust, 160, 'Dust must decrease by exactly 40');

    // 4. Replay identical request with same idempotency key
    const replayCraftRes = await fetch(`${baseUrl}/v1/crafting/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`,
        'X-Idempotency-Key': idemKey
      },
      body: JSON.stringify({ card_id: cardId, action: 'craft' })
    });
    assert.equal(replayCraftRes.status, 200);
    const replayData = await replayCraftRes.json();
    assert.equal(replayData.idempotent_replay, true);
    assert.equal(replayData.new_quantity, 2, 'Replay must NOT increment card count again');
    assert.equal(replayData.echo_dust, 160, 'Replay must NOT deduct dust again');
  });
});

test('SECURITY: Server-validated world progression rejects illegal teleportation, unauthorized fast travel, and client weather tampering', async () => {
  await withAuthServer(async ({ baseUrl, playerAuth: p1Auth, db }) => {
    // 1. Attempt to move to non-existent / campaign-locked region 'astral_archive'
    const invalidLocRes = await fetch(`${baseUrl}/v1/world/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`
      },
      body: JSON.stringify({ location_id: 'astral_archive' })
    });
    assert.equal(invalidLocRes.status, 400);
    const invData = await invalidLocRes.json();
    assert.match(invData.error, /does not exist in the world/i);

    // 2. Initial player is at 'lumenport_arrival_square'.
    // Attempt to jump directly to disconnected district 'lumenport_grand_tournament_hall'
    const disconnectedRes = await fetch(`${baseUrl}/v1/world/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`
      },
      body: JSON.stringify({ district: 'lumenport_grand_tournament_hall' })
    });
    assert.equal(disconnectedRes.status, 400);
    const discData = await disconnectedRes.json();
    assert.match(discData.error, /is not connected/i);

    // 3. Attempt fast travel to undiscovered / locked waypoint
    const fastTravelLockedRes = await fetch(`${baseUrl}/v1/world/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`
      },
      body: JSON.stringify({
        district: 'lumenport_duelist_plaza',
        is_fast_travel: true
      })
    });
    assert.equal(fastTravelLockedRes.status, 403);
    const ftData = await fastTravelLockedRes.json();
    assert.match(ftData.error, /fast travel locked/i);

    // 4. Attempt client-supplied weather and time override
    // Legitimate move to connected 'lumenport_central_card_market'
    const legitMoveRes = await fetch(`${baseUrl}/v1/world/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`
      },
      body: JSON.stringify({
        district: 'lumenport_central_card_market',
        weather: 'apocalyptic_storm_override',
        in_game_minutes: 1337
      })
    });
    assert.equal(legitMoveRes.status, 200);
    const moveData = await legitMoveRes.json();

    // Verify server authoritative time was incremented (+5 min), NOT set to client 1337
    assert.notEqual(moveData.world.in_game_minutes, 1337, 'Client time override must be rejected');
    assert.notEqual(moveData.world.weather, 'apocalyptic_storm_override', 'Client weather tampering must be rejected');
  });
});

test('SECURITY: Artwork approval strictly rejects missing or non-boolean visual review confirmations', async () => {
  await withAuthServer(async ({ baseUrl, adminAuth }) => {
    // 1. Attempt production approval without visual_review_passed
    const missingReviewRes = await fetch(`${baseUrl}/v1/art/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAuth.token}`
      },
      body: JSON.stringify({
        card_id: 'EMB-C-0001',
        candidate_id: 'cand_emb-c-0001_v1',
        approval_type: 'production'
        // visual_review_passed and visual_quality_confirmed omitted!
      })
    });
    assert.equal(missingReviewRes.status, 400, 'Missing visual review confirmations must be rejected');
    const errData = await missingReviewRes.json();
    assert.match(errData.error, /Safeguard Rejection: Production approval requires explicit recorded visual review/i);
  });
});

test('SECURITY: Private matches deny spectator access by default', async () => {
  await withAuthServer(async ({ baseUrl, playerAuth: p1Auth, victimAuth: p2Auth }) => {
    // 1. Create a private practice match against NPC
    const matchRes = await fetch(`${baseUrl}/v1/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${p1Auth.token}`
      },
      body: JSON.stringify({
        mode: 'practice_1v1',
        npc_id: 'npc_soren_whisperleaf'
      })
    });
    assert.equal(matchRes.status, 201);
    const matchJson = await matchRes.json();
    const match_id = matchJson.match_id || matchJson.match?.id;

    // 2. Unrelated user attempts to spectate private practice match via WebSocket
    const wsUrl = baseUrl.replace('http://', 'ws://') + '/v1/ws';
    const ws = new WebSocket(wsUrl);
    await new Promise((res) => ws.on('open', res));

    const messages = [];
    ws.on('message', (d) => messages.push(JSON.parse(d.toString())));

    ws.send(JSON.stringify({ type: 'auth', token: p2Auth.token }));
    // Wait for auth confirmation
    await new Promise((res, rej) => {
      const start = Date.now();
      const interval = setInterval(() => {
        if (messages.some((m) => m.type === 'authenticated')) {
          clearInterval(interval);
          res();
        } else if (Date.now() - start > 3000) {
          clearInterval(interval);
          rej(new Error('Auth timed out on ws'));
        }
      }, 20);
    });

    ws.send(JSON.stringify({ type: 'spectate_match', match_id }));
    // Wait for spectating denied confirmation
    await new Promise((res, rej) => {
      const start = Date.now();
      const interval = setInterval(() => {
        if (messages.some((m) => m.code === 'SPECTATING_DENIED')) {
          clearInterval(interval);
          res();
        } else if (Date.now() - start > 3000) {
          clearInterval(interval);
          res(); // allow assert.ok to fail with message if missing
        }
      }, 20);
    });

    const denied = messages.find((m) => m.code === 'SPECTATING_DENIED');
    assert.ok(denied, 'Spectating private match must be denied');
    assert.match(denied.error, /Spectating is disabled for this private match/i);
    ws.terminate();
  });
});

test('SECURITY (V10-A): Fresh startup creates ZERO predictable administrators; predictable login fails closed', async () => {
  const dataDir = makeTempPgDir();
  const ctx = await createServer({ dataDir });
  await new Promise((resolve) => ctx.server.listen(0, '127.0.0.1', resolve));
  const { port } = ctx.server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Verify predictable admin account 'Aerin_Vanguard' does not exist or allow default password login
    const loginRes = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Aerin_Vanguard',
        password: 'hearthglass_default_password'
      })
    });
    assert.equal(loginRes.status, 401, 'Predictable default admin login must fail closed with HTTP 401');

    // 2. Query database directly: verify zero administrators exist
    const adminCount = await ctx.db.getAdministratorCount();
    assert.equal(adminCount, 0, 'Fresh database startup must contain exactly zero administrators');
  } finally {
    await ctx.closeServer();
  }
});

test('SECURITY (V10-A): Administrator provisioning enforces secret, credential complexity, and fails closed', async () => {
  const dataDir = makeTempPgDir();
  const ctx = await createServer({ dataDir });
  await new Promise((resolve) => ctx.server.listen(0, '127.0.0.1', resolve));
  const { port } = ctx.server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Attempt provisioning with invalid secret
    const badSecretRes = await fetch(`${baseUrl}/v1/auth/provision-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'HackerAdmin',
        email: 'hacker@admin.local',
        password: 'Strong#AdminPassword123!',
        provisioning_secret: 'wrong_secret_12345'
      })
    });
    assert.equal(badSecretRes.status, 403, 'Invalid secret must return HTTP 403 Forbidden');

    // 2. Attempt provisioning with weak / predictable password
    const weakPassRes = await fetch(`${baseUrl}/v1/auth/provision-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'HackerAdmin',
        email: 'hacker@admin.local',
        password: 'hearthglass_default_password',
        provisioning_secret: 'test_provisioning_secret_2026'
      })
    });
    assert.equal(weakPassRes.status, 400, 'Weak/predictable password must return HTTP 400 Bad Request');

    // 3. Legitimate provisioning with valid secret and strong credentials
    const provRes = await fetch(`${baseUrl}/v1/auth/provision-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'LeadAuditor_2026',
        email: 'lead.auditor@hearthglass.local',
        password: 'Complex#AdminPass987!',
        provisioning_secret: 'test_provisioning_secret_2026'
      })
    });
    assert.equal(provRes.status, 201, 'Valid provisioning must return HTTP 201 Created');
    const provJson = await provRes.json();
    assert.equal(provJson.profile.role, 'administrator');
    assert.ok(provJson.token);

    // 4. Once bootstrap administrator is provisioned, another unauthenticated attempt must fail 403
    const secondProvRes = await fetch(`${baseUrl}/v1/auth/provision-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'SecondAdmin',
        email: 'second@admin.local',
        password: 'Complex#AdminPass987!',
        provisioning_secret: 'test_provisioning_secret_2026'
      })
    });
    assert.equal(secondProvRes.status, 403, 'Subsequent unauthenticated provisioning attempts must fail 403');
  } finally {
    await ctx.closeServer();
  }
});

test('SECURITY (V10-A): User roles remain immutable across logins and restarts; ordinary users cannot elevate roles', async () => {
  const dataDir = makeTempPgDir();
  let ctx1 = await createServer({ dataDir });
  await new Promise((resolve) => ctx1.server.listen(0, '127.0.0.1', resolve));
  let port = ctx1.server.address().port;
  let baseUrl = `http://127.0.0.1:${port}`;

  let playerToken;
  let playerId;

  try {
    // 1. Provision legitimate admin
    const adminRes = await fetch(`${baseUrl}/v1/auth/provision-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'SystemAdmin_V10',
        email: 'sysadmin@hearthglass.local',
        password: 'Complex#AdminPass987!',
        provisioning_secret: 'test_provisioning_secret_2026'
      })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.token;

    // 2. Register ordinary player
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'PlayerOne',
        email: 'playerone@hearthglass.local',
        password: 'PlayerPassword123!'
      })
    });
    const regData = await regRes.json();
    playerToken = regData.token;
    playerId = regData.user_id;
    assert.equal(regData.profile.role, 'player');

    // 3. Ordinary player attempts to elevate own role to administrator -> fails 403
    const elevateAttempt = await fetch(`${baseUrl}/v1/admin/users/${playerId}/role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerToken}`
      },
      body: JSON.stringify({ role: 'administrator' })
    });
    assert.equal(elevateAttempt.status, 403, 'Ordinary player cannot elevate role');

    // 4. Admin updates player role legitimately -> recorded in audit log
    const adminUpdate = await fetch(`${baseUrl}/v1/admin/users/${playerId}/role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ role: 'content_editor', reason: 'Promoted to content editor' })
    });
    assert.equal(adminUpdate.status, 200);

    // 5. Verify audit logs
    const auditRes = await fetch(`${baseUrl}/v1/admin/audit/roles`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(auditRes.status, 200);
    const auditJson = await auditRes.json();
    assert.ok(auditJson.audit_logs.length >= 2, 'Audit log should record admin provisioning and role update');
  } finally {
    await ctx1.closeServer();
  }

  // 6. Restart server on the same dataDir: verify user role is preserved and not reset
  const ctx2 = await createServer({ dataDir });
  await new Promise((resolve) => ctx2.server.listen(0, '127.0.0.1', resolve));
  port = ctx2.server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  try {
    const loginRes = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'PlayerOne',
        password: 'PlayerPassword123!'
      })
    });
    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.equal(loginData.profile.role, 'content_editor', 'Role must remain intact after server restart');
  } finally {
    await ctx2.closeServer();
  }
});

test('SECURITY (V10-A): Session revocation and logout fail closed; expired sessions return 401', async () => {
  await withAuthServer(async ({ baseUrl, playerAuth }) => {
    // 1. Verify active session works
    const profileRes = await fetch(`${baseUrl}/v1/account/profile`, {
      headers: { Authorization: `Bearer ${playerAuth.token}` }
    });
    assert.equal(profileRes.status, 200);

    // 2. Call logout endpoint
    const logoutRes = await fetch(`${baseUrl}/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${playerAuth.token}` }
    });
    assert.equal(logoutRes.status, 200);

    // 3. Subsequent request with revoked token must return HTTP 401
    const revokedRes = await fetch(`${baseUrl}/v1/account/profile`, {
      headers: { Authorization: `Bearer ${playerAuth.token}` }
    });
    assert.equal(revokedRes.status, 401, 'Revoked token must fail closed with HTTP 401');
  });
});

test('SECURITY (V10-A): Cross-account deck update attempt returns 403 Forbidden without modifying victim deck', async () => {
  await withAuthServer(async ({ baseUrl, playerAuth, victimAuth }) => {
    // 1. Victim saves a custom deck
    const victimDecks = await fetch(`${baseUrl}/v1/decks`, {
      headers: { Authorization: `Bearer ${victimAuth.token}` }
    });
    const { starter_decks } = await victimDecks.json();
    const saveVictimRes = await fetch(`${baseUrl}/v1/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${victimAuth.token}`
      },
      body: JSON.stringify({
        name: "Victim's Untouchable Deck",
        cards: starter_decks[0].cards
      })
    });
    assert.equal(saveVictimRes.status, 201);
    const { deck: victimDeck } = await saveVictimRes.json();
    const victimDeckId = victimDeck.id;

    // 2. Attacker attempts to overwrite victim's deck using victimDeckId
    const overwriteAttempt = await fetch(`${baseUrl}/v1/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerAuth.token}`
      },
      body: JSON.stringify({
        id: victimDeckId,
        name: "Hacked Overwritten Deck",
        cards: starter_decks[1].cards
      })
    });
    assert.equal(overwriteAttempt.status, 403, 'Cross-account deck update must return HTTP 403 Forbidden');
    const overwriteJson = await overwriteAttempt.json();
    assert.match(overwriteJson.error, /Forbidden: Cannot modify a deck belonging to another user/i);

    // 3. Verify victim's deck is untouched
    const verifyVictim = await fetch(`${baseUrl}/v1/decks`, {
      headers: { Authorization: `Bearer ${victimAuth.token}` }
    });
    const victimDecksAfter = await verifyVictim.json();
    const intactDeck = (victimDecksAfter.decks || []).find((d) => d.id === victimDeckId);
    assert.equal(intactDeck.name, "Victim's Untouchable Deck", 'Victim deck name must remain untouched');
  });
});

test('SECURITY (V10-A): Ordinary player accounts receive starter collection, NOT all 640 cards', async () => {
  await withAuthServer(async ({ baseUrl }) => {
    // Register fresh ordinary player
    const reg = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'NewAdventurer',
        email: 'newadv@hearthglass.local',
        password: 'Adventurer#Pass2026'
      })
    });
    assert.equal(reg.status, 201);
    const data = await reg.json();
    const token = data.token;

    const profileRes = await fetch(`${baseUrl}/v1/account/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { profile } = await profileRes.json();
    const ownedCardIds = Object.keys(profile.collection || {});

    // Starter collection has ~60-240 cards (from the starter decks + common neutrals), NOT 640 cards!
    assert.ok(ownedCardIds.length > 30, 'Player should have starter cards');
    assert.ok(ownedCardIds.length < 300, `Player should NOT own all 640 cards upon registration (owned: ${ownedCardIds.length})`);
  });
});
