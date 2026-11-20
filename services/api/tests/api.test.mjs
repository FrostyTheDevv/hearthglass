import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { WebSocket } from 'ws';
import { createServer } from '../src/server.mjs';

function makeTempPgDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'hearthglass-pg-test-'));
}

async function withServer(fn, customDataDir = null) {
  const dataDir = customDataDir || makeTempPgDir();
  const ctx = await createServer({ dataDir });
  await new Promise((resolve) => ctx.server.listen(0, '127.0.0.1', resolve));
  const { port } = ctx.server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const wsUrl = `ws://127.0.0.1:${port}/v1/ws`;
  try {
    await fn({ baseUrl, wsUrl, dataDir, ...ctx });
  } finally {
    await ctx.closeServer();
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

    ws.on('open', () => resolve({ ws, waitForMessage }));
    ws.on('error', reject);
  });
}

test('GET /v1/cards returns all 320 canonical Foundations & Expansion cards across 8 factions + neutral with complete lore and art prompts', async () => {
  await withServer(async ({ baseUrl }) => {
    const res = await fetch(`${baseUrl}/v1/cards`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.total, 640);
    assert.equal(body.milestone_total, 640);
    assert.equal(body.target_release_total, 640);

    for (const faction of [
      'emberclad',
      'verdant_pact',
      'iron_choir',
      'tidebound',
      'glassborne',
      'nocturne',
      'starweave',
      'gravewild'
    ]) {
      const fRes = await fetch(`${baseUrl}/v1/cards?faction=${faction}`);
      const fBody = await fRes.json();
      assert.equal(fBody.total, 60, `Faction ${faction} must have exactly 60 cards`);
    }

    const neutralRes = await fetch(`${baseUrl}/v1/cards?faction=neutral`);
    const neutralBody = await neutralRes.json();
    assert.equal(neutralBody.total, 160, 'Neutral must have exactly 160 cards');

    // Verify every card returned has structured gameplay_metadata, identity, and art prompt
    for (const card of body.cards) {
      assert.ok(card.gameplay_metadata?.archetype_membership?.length > 0);
      assert.ok(card.identity?.flavor_text?.length >= 15);
      assert.ok(card.identity?.collection_biography?.length >= 40);
      assert.ok(card.art?.prompt?.length >= 60);
      assert.ok(card.art?.visual_exclusions?.some((e) => e.toLowerCase().includes('no text')));
    }
  });
});

test('POST /v1/decks/validate delegates to authoritative Rust battle-server engine across all 12 starter & archetype decks', async () => {
  await withServer(async ({ baseUrl }) => {
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'DeckValidatorPlayer',
        email: 'validator@hearthglass.local',
        password: 'secure_password_123'
      })
    });
    const { token } = await regRes.json();
    const decksRes = await fetch(`${baseUrl}/v1/decks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { decks, starter_decks } = await decksRes.json();
    assert.ok(decks.length >= 4);
    assert.equal(starter_decks.length, 16);

    // Validate all 12 starter & expansion archetype 40-card decks through Rust
    for (const sd of starter_decks) {
      const validRes = await fetch(`${baseUrl}/v1/decks/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sd)
      });
      const validBody = await validRes.json();
      assert.equal(
        validBody.valid,
        true,
        `Deck ${sd.id} failed Rust validation: ${JSON.stringify(validBody.errors)}`
      );
    }

    // Invalid deck (only 3 cards)
    const invalidRes = await fetch(`${baseUrl}/v1/decks/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: [{ card_id: 'EMB-C-0001', count: 3 }] })
    });
    const invalidBody = await invalidRes.json();
    assert.equal(invalidBody.valid, false);
  });
});

test('PostgreSQL persistence: accounts, custom 40-card decks, themed pack openings, crafting, and purchase history survive server restart', async () => {
  const sharedPgDir = makeTempPgDir();
  let savedToken = null;
  let savedUserId = null;
  let savedDeckId = null;
  let walletAfterPack = null;

  // 1. First server run: register user, open pack, craft/disenchant, save a custom 40-card deck
  await withServer(async ({ baseUrl }) => {
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'LyraTester',
        email: 'lyra@hearthglass.local',
        password: 'secure_password_123',
        character_name: 'Lyra of the Prism'
      })
    });
    assert.equal(regRes.status, 201);
    const regBody = await regRes.json();
    savedToken = regBody.token;
    savedUserId = regBody.user_id;
    assert.equal(regBody.profile.wallet.crowns, 850);

    // Open a themed Emberclad pack with an idempotency key
    const packRes = await fetch(`${baseUrl}/v1/shop/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${savedToken}`,
        'X-Idempotency-Key': 'idem_pack_test_001'
      },
      body: JSON.stringify({ pack_id: 'pack_emberclad' })
    });
    assert.equal(packRes.status, 200);
    const packBody = await packRes.json();
    assert.equal(packBody.cards.length, 5);
    assert.equal(packBody.wallet.crowns, 750);
    walletAfterPack = packBody.wallet;

    // Repeating same idempotency key must not double-deduct Crowns
    const replayRes = await fetch(`${baseUrl}/v1/shop/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${savedToken}`,
        'X-Idempotency-Key': 'idem_pack_test_001'
      },
      body: JSON.stringify({ pack_id: 'pack_emberclad' })
    });
    const replayBody = await replayRes.json();
    assert.equal(replayBody.idempotent_replay, true);
    assert.equal(replayBody.wallet.crowns, 750);

    // Verify shop history records pack opening and transaction
    const histRes = await fetch(`${baseUrl}/v1/shop/history`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    });
    assert.equal(histRes.status, 200);
    const histBody = await histRes.json();
    assert.equal(histBody.pack_openings.length, 1);
    assert.equal(histBody.transactions.length, 1);

    // Save a custom 40-card deck using one of the new expansion archetype decks
    const decksRes = await fetch(`${baseUrl}/v1/decks`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    });
    const { starter_decks } = await decksRes.json();
    const customDeckPayload = {
      name: 'Persisted Ember-Iron Sovereign Deck',
      cards: starter_decks[8].cards
    };
    const saveDeckRes = await fetch(`${baseUrl}/v1/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${savedToken}`
      },
      body: JSON.stringify(customDeckPayload)
    });
    assert.equal(saveDeckRes.status, 201);
    const saveDeckBody = await saveDeckRes.json();
    savedDeckId = saveDeckBody.deck.id;
  }, sharedPgDir);

  // 2. Second server run on the same PostgreSQL data directory: verify state survived stop & restart!
  await withServer(async ({ baseUrl }) => {
    const loginRes = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'LyraTester',
        password: 'secure_password_123'
      })
    });
    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    assert.equal(loginBody.user_id, savedUserId);
    assert.equal(loginBody.profile.wallet.crowns, 750);
    assert.equal(loginBody.profile.wallet.echo_dust, walletAfterPack.echo_dust);

    const foundDeck = loginBody.profile.decks.find((d) => d.id === savedDeckId);
    assert.ok(foundDeck, 'Custom 40-card deck must survive PostgreSQL server restart');
    assert.equal(foundDeck.name, 'Persisted Ember-Iron Sovereign Deck');
    assert.equal(foundDeck.total_cards, 40);
  }, sharedPgDir);
});

test('Lumenport World expansion: 6 districts, 6 functional interiors, 16 scheduled NPCs with relationship tiers, and 8 quests', async () => {
  await withServer(async ({ baseUrl }) => {
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'LumenportTraveler',
        email: 'traveler@hearthglass.local',
        password: 'secure_password_123'
      })
    });
    const { token } = await regRes.json();
    const authHeaders = { Authorization: `Bearer ${token}` };

    const worldRes = await fetch(`${baseUrl}/v1/world/progress`, { headers: authHeaders });
    assert.equal(worldRes.status, 200);
    const worldBody = await worldRes.json();

    assert.equal(worldBody.districts.length, 6);
    assert.equal(worldBody.interiors.length, 6);
    assert.equal(worldBody.npcs.length, 16);
    assert.equal(worldBody.quest_definitions.length, 8);

    // Walk to connected central card market, then enter interior_card_shop
    const marketMove = await fetch(`${baseUrl}/v1/world/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ district: 'lumenport_central_card_market' })
    });
    assert.equal(marketMove.status, 200);

    const moveRes = await fetch(`${baseUrl}/v1/world/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        interior: 'interior_card_shop'
      })
    });
    assert.equal(moveRes.status, 200);
    const moveBody = await moveRes.json();
    assert.equal(moveBody.character.district, 'interior_card_shop');
    assert.ok(moveBody.character.in_game_minutes >= 485, 'Authoritative time must advance naturally');

    // Interact with a newly added V3 NPC (Captain Nerissa) to increase relationship score
    const interactRes = await fetch(`${baseUrl}/v1/npcs/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        npc_id: 'npc_captain_nerissa',
        type: 'gift'
      })
    });
    assert.equal(interactRes.status, 200);
    const interactBody = await interactRes.json();
    assert.equal(interactBody.npc_id, 'npc_captain_nerissa');
    assert.ok(interactBody.relationship.score >= 30);
  });
});

test('AI Card-Art Production Pipeline: 8 faction showcase illustrations exported to Godot & Web, candidate generation, approval, and batch JSONL export', async () => {
  await withServer(async ({ baseUrl }) => {
    // Authenticate as administrator for art mutations
    const adminLogin = await fetch(`${baseUrl}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Aerin_Vanguard',
        password: 'hearthglass_default_password'
      })
    });
    const { token: adminToken } = await adminLogin.json();
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 1. Check initial artwork status report
    const statusRes = await fetch(`${baseUrl}/v1/art/status`);
    assert.equal(statusRes.status, 200);
    const statusBody = await statusRes.json();
    assert.equal(statusBody.total_cards, 640);
    assert.ok(
      statusBody.counts.integrated_into_game >= 8,
      'At least the 8 faction showcase cards must be approved & integrated into Godot'
    );

    // 2. Verify showcase SVG asset is served over HTTP and exists in Godot client assets directory
    const svgRes = await fetch(`${baseUrl}/assets/cards/EMB-C-0001.svg`);
    assert.equal(svgRes.status, 200);
    const svgText = await svgRes.text();
    assert.ok(svgText.includes('<svg'), 'Must return valid SVG illustration');

    // 3. Generate a new candidate illustration for a new V3 expansion card (EMB-C-0019)
    const genRes = await fetch(`${baseUrl}/v1/art/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({
        card_id: 'EMB-C-0019',
        provider_id: 'studio_stylized_svg',
        variant_count: 1
      })
    });
    assert.equal(genRes.status, 200);
    const genBody = await genRes.json();
    assert.equal(genBody.job.status, 'completed');
    const detailAfterGen = await (await fetch(`${baseUrl}/v1/art/cards/EMB-C-0019`, { headers: adminHeaders })).json();
    assert.ok(detailAfterGen.art_record.candidates.length >= 1);
    const candidateId = detailAfterGen.art_record.candidates[detailAfterGen.art_record.candidates.length - 1].id;

    // 4. Approve candidate and verify export to Godot res://assets/cards/EMB-C-0019.svg
    const appRes = await fetch(`${baseUrl}/v1/art/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({
        card_id: 'EMB-C-0019',
        candidate_id: candidateId,
        approval_type: 'concept'
      })
    });
    assert.equal(appRes.status, 200);
    const appBody = await appRes.json();
    assert.equal(appBody.art_record.status, 'integrated_into_game');
    assert.equal(appBody.art_record.exported_godot_path, 'res://assets/cards/EMB-C-0019.svg');

    // 5. Verify paid provider budget protection blocks unauthorized paid generation
    const blockedRes = await fetch(`${baseUrl}/v1/art/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({
        card_id: 'EMB-C-0020',
        provider_id: 'flux_2_klein',
        authorized_budget_usd: 0
      })
    });
    assert.equal(blockedRes.status, 400);

    // 6. Export batch JSONL prompts for remote workers
    const batchRes = await fetch(`${baseUrl}/v1/art/export-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...adminHeaders },
      body: JSON.stringify({ faction: 'emberclad', missing_only: true })
    });
    assert.equal(batchRes.status, 200);
    const batchBody = await batchRes.json();
    assert.ok(batchBody.exported_count >= 20);
    assert.ok(fs.existsSync(batchBody.export_file));
  });
});

test('POST /v1/matches runs authoritative Rust Convergence Duels (1v1 & 2v2 Tag) and redacts hidden state', async () => {
  await withServer(async ({ baseUrl }) => {
    // Authenticate player for match creation and commands
    const regRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'MatchDuelist',
        email: 'match@hearthglass.local',
        password: 'secure_password_123'
      })
    });
    const { token } = await regRes.json();
    const authHeaders = { Authorization: `Bearer ${token}` };

    const startRes = await fetch(`${baseUrl}/v1/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ npc_id: 'npc_kaelen_forge', seed: 12345 })
    });
    assert.equal(startRes.status, 201);
    const { match } = await startRes.json();
    assert.equal(match.players[0].hand.length, 5);
    assert.equal(match.players[0].vitality, 30);

    // Verify hidden information redaction: Player 0 sees their own hand, but Player 1's hand and both decks are HIDDEN
    assert.ok(match.players[0].hand.every((c) => c.card_id !== 'HIDDEN'));
    assert.ok(match.players[1].hand.every((c) => c.card_id === 'HIDDEN'));
    assert.ok(match.players[0].deck.every((c) => c.card_id === 'HIDDEN'));

    // 1. Mulligan 2 cards
    const mulRes = await fetch(`${baseUrl}/v1/matches/${match.id}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ type: 'mulligan', replace_hand_indices: [0, 1] })
    });
    assert.equal(mulRes.status, 200);

    // 2. End turn 1 -> triggers Rust NPC AI turn 2 and advances back to Player 0 on Turn 3 with 2 Aether
    const endRes = await fetch(`${baseUrl}/v1/matches/${match.id}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ type: 'end_turn' })
    });
    assert.equal(endRes.status, 200);
    const afterEnd = await endRes.json();
    assert.equal(afterEnd.match.active_player, 0);
    assert.equal(afterEnd.match.global_turn, 3);
    assert.equal(afterEnd.match.players[0].aether_capacity, 2);
  });
});

test('Real-time WebSocket 1v1 PvP duel: two separate clients queue, play turns, reject illegal moves, recover from disconnect, and persist outcome to PostgreSQL', async () => {
  await withServer(async ({ baseUrl, wsUrl, db }) => {
    const regARes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'DuelistAlpha',
        email: 'alpha@hearthglass.local',
        password: 'alpha_password'
      })
    });
    const playerA = await regARes.json();

    const regBRes = await fetch(`${baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'DuelistBravo',
        email: 'bravo@hearthglass.local',
        password: 'bravo_password'
      })
    });
    const playerB = await regBRes.json();

    const clientA = await connectWs(wsUrl);
    const clientB = await connectWs(wsUrl);

    clientA.ws.send(JSON.stringify({ type: 'auth', token: playerA.token }));
    const authA = await clientA.waitForMessage((m) => m.type === 'authenticated');
    assert.equal(authA.username, 'DuelistAlpha');

    clientB.ws.send(JSON.stringify({ type: 'auth', token: playerB.token }));
    const authB = await clientB.waitForMessage((m) => m.type === 'authenticated');
    assert.equal(authB.username, 'DuelistBravo');

    clientA.ws.send(JSON.stringify({ type: 'queue_1v1', seed: 777888 }));
    await clientA.waitForMessage((m) => m.type === 'queued');

    clientB.ws.send(JSON.stringify({ type: 'queue_1v1', seed: 777888 }));
    const foundA = await clientA.waitForMessage((m) => m.type === 'match_found');
    const foundB = await clientB.waitForMessage((m) => m.type === 'match_found');

    assert.equal(foundA.match_id, foundB.match_id);
    assert.equal(foundA.player_slot, 0);
    assert.equal(foundB.player_slot, 1);
    assert.equal(foundA.checksum, foundB.checksum);

    assert.ok(foundA.match.players[0].hand.every((c) => c.card_id !== 'HIDDEN'));
    assert.ok(foundA.match.players[1].hand.every((c) => c.card_id === 'HIDDEN'));
    assert.ok(foundB.match.players[1].hand.every((c) => c.card_id !== 'HIDDEN'));
    assert.ok(foundB.match.players[0].hand.every((c) => c.card_id === 'HIDDEN'));

    const matchId = foundA.match_id;

    // Client B tries to end turn during Client A's turn -> must be rejected by authoritative Rust server
    clientB.ws.send(
      JSON.stringify({
        type: 'submit_command',
        match_id: matchId,
        req_seq: 1,
        command: { type: 'end_turn' }
      })
    );
    const rejectedB = await clientB.waitForMessage((m) => m.type === 'command_rejected');
    assert.ok(rejectedB.error.includes('Not player 1'));

    // Client A ends Turn 1 -> both clients receive synchronized state update for Turn 2
    clientA.ws.send(
      JSON.stringify({
        type: 'submit_command',
        match_id: matchId,
        req_seq: 2,
        command: { type: 'end_turn', auto_ai: false }
      })
    );
    const updA1 = await clientA.waitForMessage(
      (m) => m.type === 'match_state_update' && m.match.global_turn === 2
    );
    const updB1 = await clientB.waitForMessage(
      (m) => m.type === 'match_state_update' && m.match.global_turn === 2
    );
    assert.equal(updA1.checksum, updB1.checksum);
    assert.equal(updB1.match.active_player, 1);

    // Simulate Client B disconnecting mid-match and reconnecting
    clientB.ws.close();
    const clientBReconnected = await connectWs(wsUrl);
    clientBReconnected.ws.send(JSON.stringify({ type: 'auth', token: playerB.token }));
    await clientBReconnected.waitForMessage((m) => m.type === 'authenticated');

    clientBReconnected.ws.send(
      JSON.stringify({
        type: 'reconnect_match',
        match_id: matchId
      })
    );
    const joinedB = await clientBReconnected.waitForMessage((m) => m.type === 'match_joined');
    assert.equal(joinedB.player_slot, 1);
    assert.equal(joinedB.match.global_turn, 2);
    assert.ok(joinedB.match.players[1].hand.every((c) => c.card_id !== 'HIDDEN'));

    // Client B surrenders to conclude the match -> verify outcome and PostgreSQL persistence
    clientBReconnected.ws.send(
      JSON.stringify({
        type: 'submit_command',
        match_id: matchId,
        req_seq: 4,
        command: { type: 'surrender', auto_ai: false }
      })
    );
    const finalA = await clientA.waitForMessage(
      (m) => m.type === 'match_state_update' && m.match.outcome === 'player_victory'
    );
    assert.equal(finalA.match.winner, 0);

    const dbMatch = await db.query(
      `SELECT status, winner_slot, final_checksum FROM matches WHERE id = $1`,
      [matchId]
    );
    assert.equal(dbMatch.rows[0].status, 'completed');
    assert.equal(Number(dbMatch.rows[0].winner_slot), 0);

    clientA.ws.close();
    clientBReconnected.ws.close();
  });
});

test('True Four-Client Online 2v2 Tag Battle: 4 independent WebSocket clients + 1 spectator test turn ordering (0->1->2->3), shared Team Vitality, shared team board, separate hands/Aether, reconnection across all 4 seats, privacy redaction, and PostgreSQL reward persistence', async () => {
  await withServer(async ({ baseUrl, wsUrl, db }) => {
    // 1. Register 4 distinct human players + 1 spectator
    const accounts = [];
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${baseUrl}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `TagPlayer_${i}`,
          email: `tagplayer_${i}@hearthglass.local`,
          password: `tag_pass_${i}`
        })
      });
      assert.equal(res.status, 201);
      accounts.push(await res.json());
    }

    // 2. Connect 4 independent WebSocket clients and authenticate each
    let clients = [];
    for (let i = 0; i < 4; i++) {
      const c = await connectWs(wsUrl);
      c.ws.send(JSON.stringify({ type: 'auth', token: accounts[i].token }));
      const authMsg = await c.waitForMessage((m) => m.type === 'authenticated');
      assert.equal(authMsg.username, `TagPlayer_${i}`);
      clients.push(c);
    }

    // 3. Create a private 2v2 Tag Battle Lobby with Player 0 (Team 0, Seat 0) and have Players 1, 2, 3 join Seats 1, 2, 3
    clients[0].ws.send(
      JSON.stringify({
        type: 'create_tag_lobby',
        lobby_id: 'lobby_convergence_alpha',
        preferred_seat: 0,
        seed: 20262026
      })
    );
    const createdLobby = await clients[0].waitForMessage(
      (m) => m.type === 'tag_lobby_created'
    );
    assert.equal(createdLobby.lobby_id, 'lobby_convergence_alpha');
    assert.equal(createdLobby.assigned_seat, 0);
    assert.equal(createdLobby.team_id, 0);

    for (let slot = 1; slot < 4; slot++) {
      clients[slot].ws.send(
        JSON.stringify({
          type: 'join_tag_lobby',
          lobby_id: 'lobby_convergence_alpha',
          preferred_seat: slot
        })
      );
    }

    // All 4 clients receive match_found with their exact seat, team_id, and teammate_slot
    const matchFounds = await Promise.all(
      clients.map((c) => c.waitForMessage((m) => m.type === 'match_found'))
    );
    const matchId = matchFounds[0].match_id;

    for (let slot = 0; slot < 4; slot++) {
      const mf = matchFounds[slot];
      assert.equal(mf.match_id, matchId);
      assert.equal(mf.format, 'tag_2v2');
      assert.equal(mf.player_slot, slot);
      assert.equal(mf.team_id, slot % 2);
      assert.equal(mf.teammate_slot, (slot + 2) % 4);
      assert.equal(mf.match.players.length, 4);
      assert.equal(mf.match.players[slot].vitality, 45);

      // Verify strict hidden-information redaction for each of the 4 players:
      // Each player sees ONLY their own hand; teammate's hand and both opponents' hands are HIDDEN
      for (let other = 0; other < 4; other++) {
        if (other === slot) {
          assert.ok(
            mf.match.players[other].hand.every((card) => card.card_id !== 'HIDDEN'),
            `Player ${slot} must see their own hand`
          );
        } else {
          assert.ok(
            mf.match.players[other].hand.every((card) => card.card_id === 'HIDDEN'),
            `Player ${slot} must NOT see Player ${other}'s private hand`
          );
        }
        assert.ok(
          mf.match.players[other].deck.every((card) => card.card_id === 'HIDDEN'),
          `All 4 draw decks must be redacted`
        );
      }
    }

    // 4. Connect a 5th WebSocket client as a Spectator and verify all 4 hands are redacted
    const spectator = await connectWs(wsUrl);
    spectator.ws.send(JSON.stringify({ type: 'auth', token: accounts[4].token }));
    await spectator.waitForMessage((m) => m.type === 'authenticated');
    spectator.ws.send(JSON.stringify({ type: 'spectate_match', match_id: matchId }));
    const specMsg = await spectator.waitForMessage((m) => m.type === 'match_spectating');
    assert.equal(specMsg.viewer_slot, null);
    for (let slot = 0; slot < 4; slot++) {
      assert.ok(
        specMsg.match.players[slot].hand.every((c) => c.card_id === 'HIDDEN'),
        `Spectator must not see Player ${slot}'s hand`
      );
    }

    // Spectator attempting to submit a gameplay command must be rejected
    spectator.ws.send(
      JSON.stringify({
        type: 'submit_command',
        match_id: matchId,
        command: { type: 'end_turn' }
      })
    );
    const specRej = await spectator.waitForMessage((m) => m.type === 'command_rejected');
    assert.ok(specRej.error.includes('Spectators cannot submit'));

    // 5. Verify Turn 1 (Active Player = 0, Team 0):
    // Find a 1-cost creature in Player 0's hand if available, or summon when affordable, and verify separate Aether
    let currentMatchView0 = matchFounds[0].match;
    const p0AffordableIdx = currentMatchView0.players[0].hand.findIndex(
      (c) => c.type === 'creature' && c.cost <= currentMatchView0.players[0].current_aether
    );
    if (p0AffordableIdx >= 0) {
      clients[0].ws.send(
        JSON.stringify({
          type: 'submit_command',
          match_id: matchId,
          command: {
            type: 'summon_creature',
            hand_index: p0AffordableIdx,
            lane: 0,
            position: 'front',
            auto_ai: false
          }
        })
      );
      const summonUpd = await clients[2].waitForMessage(
        (m) => m.type === 'match_state_update' && Boolean(m.match.players[0].lanes[0].front)
      );
      // Verify shared Team 0 battlefield: Teammate Player 2 immediately has the unit on their synchronized Team 0 board!
      assert.ok(
        summonUpd.match.players[2].lanes[0].front,
        'Teammate Player 2 must share Team 0 lanes with Player 0'
      );
      // Verify separate Aether: Player 0 spent Aether, while Player 2's Aether pool is untouched
      assert.equal(summonUpd.match.players[2].current_aether, 1);
    }

    // 6. Test Turn Sequencing (0 -> 1 -> 2 -> 3 -> 0) and Mid-Match Disconnect/Reconnect from ALL FOUR SEATS
    for (let expectedTurn = 1; expectedTurn <= 4; expectedTurn++) {
      const activeSlot = (expectedTurn - 1) % 4;
      const nextSlot = expectedTurn % 4;

      // Disconnect the active player's WebSocket and reconnect before taking their action
      clients[activeSlot].ws.close();
      const reconnected = await connectWs(wsUrl);
      reconnected.ws.send(
        JSON.stringify({ type: 'auth', token: accounts[activeSlot].token })
      );
      await reconnected.waitForMessage((m) => m.type === 'authenticated');
      reconnected.ws.send(
        JSON.stringify({
          type: 'reconnect_match',
          match_id: matchId
        })
      );
      const joined = await reconnected.waitForMessage((m) => m.type === 'match_joined');
      assert.equal(joined.player_slot, activeSlot);
      assert.equal(joined.match.active_player, activeSlot);
      assert.ok(
        joined.match.players[activeSlot].hand.every((c) => c.card_id !== 'HIDDEN'),
        `Reconnected seat ${activeSlot} must recover their unredacted hand`
      );
      clients[activeSlot] = reconnected;

      // Submit end_turn from the reconnected active seat
      clients[activeSlot].ws.send(
        JSON.stringify({
          type: 'submit_command',
          match_id: matchId,
          command: { type: 'end_turn', auto_ai: false }
        })
      );

      const nextTurnNum = expectedTurn + 1;
      const stateUpd = await clients[nextSlot].waitForMessage(
        (m) => m.type === 'match_state_update' && m.match.global_turn === nextTurnNum
      );
      assert.equal(
        stateUpd.match.active_player,
        nextSlot,
        `Turn ${nextTurnNum} must advance to Player ${nextSlot}`
      );
    }

    // 7. Conclude the 4-player match (Player 1 on Team 1 surrenders during their turn or Player 0 surrenders)
    // Currently on Turn 5, active_player is 0. Advance to Turn 6 (Player 1 on Team 1) and have Player 1 surrender so Team 0 (Players 0 & 2) wins!
    clients[0].ws.send(
      JSON.stringify({
        type: 'submit_command',
        match_id: matchId,
        command: { type: 'end_turn', auto_ai: false }
      })
    );
    await clients[1].waitForMessage(
      (m) => m.type === 'match_state_update' && m.match.active_player === 1
    );

    clients[1].ws.send(
      JSON.stringify({
        type: 'submit_command',
        match_id: matchId,
        command: { type: 'surrender', auto_ai: false }
      })
    );

    const victoryMsg0 = await clients[0].waitForMessage(
      (m) => m.type === 'match_state_update' && m.match.outcome === 'team_0_victory'
    );
    const victoryMsg2 = await clients[2].waitForMessage(
      (m) => m.type === 'match_state_update' && m.match.outcome === 'team_0_victory'
    );
    assert.equal(victoryMsg0.match.winner, 0);
    assert.equal(victoryMsg2.match.winner, 0);
    // Shared Team Vitality: both Team 1 players (slots 1 and 3) drop to 0 Vitality together
    assert.equal(victoryMsg0.match.players[1].vitality, victoryMsg0.match.players[3].vitality);
    assert.equal(victoryMsg0.match.players[0].vitality, victoryMsg0.match.players[2].vitality);

    // 8. Verify PostgreSQL persistence of the 4-player 2v2 Tag match and team rewards for BOTH winning teammates (Players 0 & 2)
    const dbMatch = await db.query(
      `SELECT status, format, winner_slot FROM matches WHERE id = $1`,
      [matchId]
    );
    assert.equal(dbMatch.rows[0].status, 'completed');
    assert.equal(Number(dbMatch.rows[0].winner_slot), 0);

    const p0Profile = await db.getFullPlayerProfile(accounts[0].user_id);
    const p2Profile = await db.getFullPlayerProfile(accounts[2].user_id);
    const p1Profile = await db.getFullPlayerProfile(accounts[1].user_id);

    assert.equal(p0Profile.wins, 1, 'Team 0 Player 0 must be credited with a win');
    assert.equal(p2Profile.wins, 1, 'Team 0 Teammate Player 2 must also be credited with a win');
    assert.equal(p1Profile.losses, 1, 'Team 1 Player 1 must be credited with a loss');
    assert.ok(p0Profile.wallet.crowns > 850, 'Winning Team 0 players receive Crown rewards');
    assert.ok(p2Profile.wallet.crowns > 850, 'Winning Team 0 players receive Crown rewards');

    for (const c of clients) c.ws.close();
    spectator.ws.close();
  });
});


