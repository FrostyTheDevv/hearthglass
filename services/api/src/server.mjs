import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { HearthglassDatabase, SHOP_PACK_CATALOGUE } from './db.mjs';
import { RustBattleEngineBridge } from './rust_bridge.mjs';
import { ArtProductionPipeline } from './art_pipeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

const bundleData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/cards/foundations_v1.json'), 'utf8')
);
const starterDecksData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/cards/starter_decks.json'), 'utf8')
);
const npcsData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/npcs/lumenport_npcs.json'), 'utf8')
);
const questsData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content/quests/act1_quests.json'), 'utf8')
);

const CARD_MAP = new Map(bundleData.cards.map((c) => [c.id, c]));

/**
 * Converts a Rust `MatchState` into the UI-friendly match envelope used by the Web Studio,
 * Godot client, and REST/WebSocket APIs, while preserving 100% of Rust authoritative state.
 */
function formatMatchEnvelope(session, redactedRustState, checksum = null) {
  const outcomeRaw = redactedRustState.outcome;
  let outcomeStr = 'in_progress';
  let winnerSlot = null;

  if (typeof outcomeRaw === 'string') {
    outcomeStr = outcomeRaw;
  } else if (outcomeRaw && typeof outcomeRaw === 'object') {
    if ('player_victory' in outcomeRaw) {
      winnerSlot = outcomeRaw.player_victory;
      outcomeStr = winnerSlot === 0 ? 'player_victory' : 'opponent_victory';
    } else if ('team_victory' in outcomeRaw) {
      winnerSlot = outcomeRaw.team_victory;
      outcomeStr = winnerSlot === 0 ? 'team_0_victory' : 'team_1_victory';
    }
  }

  const players = redactedRustState.players.map((p, idx) => ({
    ...p,
    name: session.playerNames[idx] || `Player ${idx + 1}`,
    controlled_lanes: p.lanes.filter((l) => Boolean(l.front || l.rear)).length
  }));

  const humanReadableLogs = (redactedRustState.event_log || []).map((ev) => {
    if (typeof ev === 'string') return ev;
    switch (ev.event) {
      case 'match_started':
        return `Match started (${ev.format}): active player ${ev.active_player}.`;
      case 'mulligan_completed':
        return `Player ${ev.player} mulliganed ${ev.replaced_count} card(s).`;
      case 'turn_started':
        return `Turn ${ev.turn_number} begins (Player ${ev.player}: ${ev.aether} Aether).`;
      case 'creature_summoned':
        return `Player ${ev.player} summoned ${ev.name} in Lane ${ev.lane + 1} (${ev.position}).`;
      case 'tactic_played':
        return `Player ${ev.player} played Tactic: ${ev.name}.`;
      case 'relic_played':
        return `Player ${ev.player} equipped Relic: ${ev.name}.`;
      case 'environment_replaced':
        return `Player ${ev.controller} activated Environment: ${ev.new_card_id}.`;
      case 'creature_moved':
        return `Player ${ev.player} moved ${ev.card_id} from Lane ${ev.from_lane + 1} to Lane ${ev.to_lane + 1}.`;
      case 'combat_declared':
        return `Player ${ev.attacker_player} attacked ${ev.target_description} in Lane ${ev.lane + 1}.`;
      case 'leader_damaged':
        return `Player ${ev.player} took ${ev.amount} Leader damage (${ev.new_vitality} Vitality remaining).`;
      case 'leader_healed':
        return `Player ${ev.player} restored ${ev.amount} Vitality (${ev.new_vitality} Vitality).`;
      case 'creature_destroyed':
        return `${ev.name} was destroyed in Lane ${ev.lane + 1} (${ev.position}).`;
      case 'resonate_updated':
        return ev.active
          ? `Player ${ev.player} controls ${ev.controlled_lanes} lanes \u2014 RESONATE is active!`
          : `Player ${ev.player} controls ${ev.controlled_lanes} lane(s).`;
      case 'match_ended':
        return `Match ended: ${ev.reason}`;
      default:
        return JSON.stringify(ev);
    }
  });

  return {
    id: session.id,
    format:
      redactedRustState.format === 'tag2v2'
        ? 'tag_2v2'
        : redactedRustState.format === 'standard1v1'
        ? 'standard_1v1'
        : redactedRustState.format,
    mode: session.mode,
    rule_version: redactedRustState.rule_version,
    npc_id: session.npcId || null,
    npc_name: session.npcName || null,
    arena: session.arena || 'Lumenport Grand Table',
    global_turn: redactedRustState.global_turn,
    active_player: redactedRustState.active_player,
    players,
    active_environment: redactedRustState.active_environment,
    outcome: outcomeStr,
    raw_outcome: outcomeRaw,
    winner: winnerSlot,
    checksum: checksum ?? session.checksum,
    seq: session.seq,
    turn_timer: {
      base_seconds: 45,
      reserve_bank_seconds: session.timeBanks || [90, 90],
      turn_deadline_epoch_ms: session.turnDeadlineMs
    },
    reward_summary: session.rewardSummary || null,
    event_log: humanReadableLogs,
    raw_events: redactedRustState.event_log || []
  };
}

function normalizeBattleCommand(cmd, defaultPlayer = 0) {
  const player = Number(cmd.player ?? defaultPlayer);
  switch (cmd.type) {
    case 'mulligan':
      return {
        type: 'mulligan',
        player,
        replace_hand_indices: (cmd.replace_hand_indices || []).map(Number)
      };
    case 'summon_creature':
      return {
        type: 'summon_creature',
        player,
        hand_index: Number(cmd.hand_index ?? 0),
        lane: Number(cmd.lane ?? 0),
        position: cmd.position || 'front'
      };
    case 'play_tactic':
      return {
        type: 'play_tactic',
        player,
        hand_index: Number(cmd.hand_index ?? 0),
        target_lane:
          cmd.target_lane !== undefined && cmd.target_lane !== null ? Number(cmd.target_lane) : 0,
        target_position: cmd.target_position || 'front'
      };
    case 'play_relic':
      return {
        type: 'play_relic',
        player,
        hand_index: Number(cmd.hand_index ?? 0)
      };
    case 'play_environment':
      return {
        type: 'play_environment',
        player,
        hand_index: Number(cmd.hand_index ?? 0)
      };
    case 'move_creature':
      return {
        type: 'move_creature',
        player,
        from_lane: Number(cmd.from_lane ?? 0),
        from_position: cmd.from_position || 'front',
        to_lane: Number(cmd.to_lane ?? 1),
        to_position: cmd.to_position || 'front'
      };
    case 'attack_creature':
      return {
        type: 'attack_creature',
        player,
        attacker_lane: Number(cmd.attacker_lane ?? 0),
        attacker_position: cmd.attacker_position || 'front',
        defender_lane: Number(cmd.defender_lane ?? cmd.attacker_lane ?? 0),
        defender_position: cmd.defender_position || 'front'
      };
    case 'attack_leader':
      return {
        type: 'attack_leader',
        player,
        attacker_lane: Number(cmd.attacker_lane ?? 0),
        attacker_position: cmd.attacker_position || 'front'
      };
    case 'end_turn':
      return {
        type: 'end_turn',
        player
      };
    case 'surrender':
      return {
        type: 'surrender',
        player
      };
    default:
      throw new Error(`Unsupported command type: ${cmd.type}`);
  }
}

export async function createServer({ dataDir = null, databaseUrl = process.env.DATABASE_URL } = {}) {
  const db = new HearthglassDatabase({ dataDir, databaseUrl });
  await db.init();
  const rustBridge = new RustBattleEngineBridge();
  const artPipeline = new ArtProductionPipeline({
    rootDir: ROOT,
    cards: bundleData.cards
  });

  // Active live match sessions (authoritative Rust state in memory + persisted snapshots in PostgreSQL)
  const matchSessions = new Map();
  const matchmakingQueue1v1 = [];
  const matchmakingQueue2v2 = [];
  const tagLobbies = new Map(); // lobby_id -> { id, hostUserId, seats: [entry0, entry1, entry2, entry3], seed }

  async function syncLegacyAppState(userId = undefined) {
    const profile = await db.getFullPlayerProfile(userId);
    return {
      account: {
        id: profile.user_id,
        username: profile.username,
        email: profile.email,
        level: profile.level,
        xp: profile.xp,
        crowns: profile.wallet.crowns,
        echo_dust: profile.wallet.echo_dust,
        sigils: profile.wallet.sigils,
        rating: profile.rating,
        wins: profile.wins,
        losses: profile.losses
      },
      character: {
        id: `chr_${profile.user_id.slice(0, 8)}`,
        name: profile.character_name,
        appearance: profile.appearance,
        region: profile.world.region,
        district: profile.world.district,
        story_chapter: profile.world.story_chapter,
        in_game_minutes: profile.world.in_game_minutes,
        weather: profile.world.weather,
        discovered_locations: profile.world.discovered_locations
      },
      housing: profile.housing,
      collection: profile.collection,
      decks: profile.decks.length > 0 ? profile.decks : starterDecksData.decks,
      active_deck_id: (profile.decks[0] || starterDecksData.decks[0]).id,
      relationships: profile.relationships,
      quests: profile.quests
    };
  }

  async function createAuthoritativeMatch({
    mode = 'pve_1v1',
    format = 'standard_1v1',
    playerUserIds = [],
    playerNames = [],
    decks = [],
    npcId = 'npc_kaelen_forge',
    seed = Date.now(),
    aiPlayers = [1]
  }) {
    const matchId = crypto.randomUUID();
    const numericSeed = Number(seed) >>> 0 || 20261118;
    let rustData;
    let resolvedPlayerNames = [...playerNames];
    let resolvedAiPlayers = [...aiPlayers];
    let npc = null;

    if (format === 'tag_2v2' || mode === 'tag_2v2' || mode === 'pvp_tag_2v2') {
      const fourDecks = [
        decks[0] || starterDecksData.decks[0],
        decks[1] || starterDecksData.decks[1],
        decks[2] || starterDecksData.decks[2],
        decks[3] || starterDecksData.decks[3]
      ];
      rustData = await rustBridge.createMatch2v2(fourDecks, numericSeed);
      if (resolvedPlayerNames.length < 4) {
        resolvedPlayerNames = [
          playerNames[0] || 'Aerin_Vanguard',
          playerNames[1] || 'Kaelen Emberforge',
          playerNames[2] || 'Soren of Whisperleaf (Ally)',
          playerNames[3] || 'Lyra Vane'
        ];
      }
      if (mode === 'pvp_tag_2v2') {
        resolvedAiPlayers = [];
      } else if (mode === 'tag_2v2_coop' && resolvedAiPlayers.length === 0) {
        resolvedAiPlayers = [1, 2, 3];
      }
    } else {
      npc = npcsData.npcs.find((n) => n.id === npcId) || npcsData.npcs[1];
      const deckA = decks[0] || starterDecksData.decks[0];
      const deckB =
        decks[1] ||
        starterDecksData.decks.find((d) => d.id === npc.deck_id) ||
        starterDecksData.decks[1];
      rustData = await rustBridge.createMatch1v1(deckA, deckB, numericSeed);
      if (resolvedPlayerNames.length < 2) {
        resolvedPlayerNames = [
          playerNames[0] || 'Aerin_Vanguard',
          mode === 'pvp_1v1' ? playerNames[1] || 'Challenger_2' : npc.name
        ];
      }
      if (mode === 'pvp_1v1') {
        resolvedAiPlayers = [];
      }
    }

    const session = {
      id: matchId,
      mode,
      format: rustData.state.format,
      seed: numericSeed,
      state: rustData.state,
      checksum: rustData.checksum,
      seq: 1,
      playerUserIds,
      playerNames: resolvedPlayerNames,
      aiPlayers: resolvedAiPlayers,
      npcId: npc ? npc.id : null,
      npcName: npc ? npc.name : null,
      arena: 'Lumenport Grand Table',
      timeBanks: rustData.state.players.map(() => 90),
      turnDeadlineMs: Date.now() + 45000,
      rewardSummary: null,
      completedPersisted: false,
      subscribers: new Set() // Set of { ws, playerSlot (number or null for spectator), userId }
    };

    matchSessions.set(matchId, session);
    await db.recordMatchStart({
      matchId,
      format: session.format,
      ruleVersion: session.state.rule_version,
      seed: numericSeed,
      state: session.state
    });

    return session;
  }

  async function applyMatchCommandAndBroadcast(session, rawCmd, callerViewerSlot = 0) {
    const normalized = normalizeBattleCommand(rawCmd, callerViewerSlot);
    const applyRes = await rustBridge.applyCommand(session.state, normalized);

    if (!applyRes.result.accepted) {
      return {
        accepted: false,
        error: applyRes.result.error || 'Command rejected by authoritative Rust engine',
        events: []
      };
    }

    session.state = applyRes.state;
    session.checksum = applyRes.result.state_checksum;
    session.seq += 1;
    session.turnDeadlineMs = Date.now() + 45000;
    let combinedEvents = [...(applyRes.result.events || [])];

    // If auto_ai is enabled and active player is an AI slot, execute AI turns in Rust
    if (
      rawCmd.auto_ai !== false &&
      session.state.outcome === 'in_progress' &&
      session.aiPlayers.includes(session.state.active_player)
    ) {
      const aiRes = await rustBridge.runAiTurns(session.state, session.aiPlayers, 'skilled');
      session.state = aiRes.state;
      session.checksum = aiRes.checksum;
      session.seq += 1;
      combinedEvents.push(...(aiRes.events || []));
    }

    await db.saveMatchSnapshot({
      matchId: session.id,
      turnNumber: session.state.global_turn,
      state: session.state,
      checksum: session.checksum
    });

    // Check if match just finished
    if (session.state.outcome !== 'in_progress' && !session.completedPersisted) {
      session.completedPersisted = true;
      let winnerSlot = null;
      if (typeof session.state.outcome === 'object') {
        if ('player_victory' in session.state.outcome) {
          winnerSlot = session.state.outcome.player_victory;
        } else if ('team_victory' in session.state.outcome) {
          winnerSlot = session.state.outcome.team_victory;
        }
      }
      if (winnerSlot === 0 && session.npcId) {
        const npc = npcsData.npcs.find((n) => n.id === session.npcId);
        if (npc) {
          session.rewardSummary = {
            crowns: npc.rewards.crowns,
            echo_dust: npc.rewards.echo_dust,
            relationship_gain: npc.rewards.relationship_gain,
            dialogue: npc.dialogue.victory
          };
        }
      } else if (winnerSlot !== null && session.mode === 'pvp_tag_2v2') {
        session.rewardSummary = {
          crowns: 95,
          echo_dust: 35,
          relationship_gain: 0,
          dialogue: `Team ${winnerSlot} triumphs in Convergence Tag Battle!`
        };
      }
      await db.recordMatchCompletion({
        matchId: session.id,
        winnerSlot,
        finalChecksum: session.checksum,
        playerIds: session.playerUserIds,
        npcId: session.npcId
      });
    }

    // Broadcast player-redacted state to all connected WebSocket clients in this room
    await broadcastSessionState(session, combinedEvents);

    return {
      accepted: true,
      events: combinedEvents,
      checksum: session.checksum
    };
  }

  async function getRedactedMatchForViewer(session, viewerSlot = 0) {
    const redacted = await rustBridge.redactState(
      session.state,
      typeof viewerSlot === 'number' ? viewerSlot : null
    );
    return formatMatchEnvelope(session, redacted.state, redacted.checksum);
  }

  async function broadcastSessionState(session, events = []) {
    for (const sub of session.subscribers) {
      if (sub.ws.readyState !== 1) continue;
      const redactedMatch = await getRedactedMatchForViewer(session, sub.playerSlot);
      sub.ws.send(
        JSON.stringify({
          type: 'match_state_update',
          match_id: session.id,
          viewer_slot: sub.playerSlot,
          seq: session.seq,
          checksum: session.checksum,
          events,
          match: redactedMatch
        })
      );
    }
  }

  async function launchFourPlayerTagMatch(fourEntries, seed = Date.now()) {
    const session = await createAuthoritativeMatch({
      mode: 'pvp_tag_2v2',
      format: 'tag_2v2',
      playerUserIds: fourEntries.map((e) => e.userId),
      playerNames: fourEntries.map((e) => e.username),
      decks: fourEntries.map((e) => e.deck),
      seed,
      aiPlayers: []
    });

    for (let slot = 0; slot < 4; slot++) {
      const entry = fourEntries[slot];
      entry.clientCtx.currentMatchId = session.id;
      entry.clientCtx.playerSlot = slot;
      session.subscribers.add({
        ws: entry.ws,
        playerSlot: slot,
        userId: entry.userId
      });
    }

    for (let slot = 0; slot < 4; slot++) {
      const entry = fourEntries[slot];
      if (entry.ws.readyState === 1) {
        const redactedMatch = await getRedactedMatchForViewer(session, slot);
        entry.ws.send(
          JSON.stringify({
            type: 'match_found',
            format: 'tag_2v2',
            match_id: session.id,
            player_slot: slot,
            team_id: slot % 2,
            teammate_slot: (slot + 2) % 4,
            seq: session.seq,
            checksum: session.checksum,
            match: redactedMatch
          })
        );
      }
    }

    return session;
  }

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Idempotency-Key'
    );

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    function sendJson(status, data) {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    }

    async function readJsonBody(maxBytes = 2 * 1024 * 1024) {
      const chunks = [];
      let total = 0;
      for await (const chunk of req) {
        total += chunk.length;
        if (total > maxBytes) {
          const err = new Error('Payload Too Large: maximum allowed body size is 2MB');
          err.statusCode = 413;
          throw err;
        }
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return {};
      try {
        return JSON.parse(raw);
      } catch {
        const err = new Error('Malformed JSON payload');
        err.statusCode = 400;
        throw err;
      }
    }

    async function getAuthenticatedUserId(options = {}) {
      const { required = true, requireAdmin = false } = options;
      const authHeader = req.headers.authorization;
      let uid = await db.resolveUserIdFromToken(authHeader);
      if (!uid && process.env.ALLOW_DEV_AUTH_BYPASS === 'true' && process.env.NODE_ENV === 'development') {
        uid = '00000000-0000-4000-8000-000000000001';
      }
      if (!uid) {
        if (required) {
          const err = new Error('Authentication required');
          err.statusCode = 401;
          throw err;
        }
        return null;
      }
      if (requireAdmin) {
        const role = await db.getUserRole(uid);
        if (role !== 'administrator' && role !== 'content_editor') {
          const err = new Error('Forbidden: Administrative privileges required');
          err.statusCode = 403;
          throw err;
        }
      }
      return uid;
    }

    function verifyAccountAccess(authUid, targetUid) {
      if (targetUid && targetUid !== authUid) {
        const err = new Error('Forbidden: Cannot access or modify another user account');
        err.statusCode = 403;
        throw err;
      }
    }

    try {
      // Static Playable Studio & Client UI
      if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
        const htmlPath = path.join(ROOT, 'apps/content-studio/public/index.html');
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      // Static Card Artwork Assets (/assets/cards/*)
      if (req.method === 'GET' && pathname.startsWith('/assets/cards/')) {
        const fileName = path.basename(pathname.replace('/assets/cards/', ''));
        const assetPath = path.join(
          ROOT,
          'apps/content-studio/public/assets/cards',
          fileName
        );
        if (!fs.existsSync(assetPath)) {
          return sendJson(404, { error: `Card artwork asset not found: ${fileName}` });
        }
        const ext = path.extname(fileName).toLowerCase();
        const mime =
          ext === '.svg'
            ? 'image/svg+xml; charset=utf-8'
            : ext === '.png'
            ? 'image/png'
            : ext === '.webp'
            ? 'image/webp'
            : 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
        res.end(fs.readFileSync(assetPath));
        return;
      }

      if (req.method === 'GET' && pathname === '/health') {
        const artStatus = artPipeline.getStatusReport();
        return sendJson(200, {
          status: 'healthy',
          service: 'hearthglass-platform-api',
          rules_authority: 'rust_hearthglass_battle_server',
          database_mode: db.mode,
          cards_loaded: bundleData.cards.length,
          starter_decks: starterDecksData.decks.length,
          npcs_loaded: npcsData.npcs.length,
          districts_loaded: (npcsData.districts || []).length,
          interiors_loaded: (npcsData.interiors || []).length,
          quests_loaded: questsData.quests.length,
          artwork_approved: artStatus.counts.integrated_into_game
        });
      }

      // 1. Authentication & Accounts (PostgreSQL persisted)
      if (req.method === 'POST' && pathname === '/v1/auth/register') {
        const body = await readJsonBody();
        if (!body.username || !body.email || !body.password) {
          return sendJson(400, { error: 'username, email, and password are required' });
        }
        const { profile, session } = await db.registerUser({
          email: body.email,
          username: body.username,
          password: body.password,
          characterName: body.character_name,
          appearance: body.appearance
        });
        return sendJson(201, {
          token: session.token,
          session_id: session.session_id,
          user_id: profile.user_id,
          profile
        });
      }

      if (req.method === 'POST' && pathname === '/v1/auth/login') {
        const body = await readJsonBody();
        const { profile, session } = await db.loginUser({
          usernameOrEmail: body.username || body.email,
          password: body.password
        });
        return sendJson(200, {
          token: session.token,
          session_id: session.session_id,
          user_id: profile.user_id,
          profile
        });
      }

      if (req.method === 'GET' && pathname === '/v1/bootstrap') {
        const userId = await getAuthenticatedUserId();
        const legacy = await syncLegacyAppState(userId);
        const artStatus = artPipeline.getStatusReport();
        const enrichedCards = bundleData.cards.map((c) => {
          const rec = artPipeline.getCardArtDetail(c.id)?.art_record;
          if (rec && rec.exported_web_url) {
            return {
              ...c,
              art: {
                ...c.art,
                art_status: rec.status,
                web_asset_url: rec.exported_web_url,
                asset_location: rec.exported_godot_path || c.art?.asset_location
              }
            };
          }
          return c;
        });
        return sendJson(200, {
          account: legacy.account,
          character: legacy.character,
          housing: legacy.housing,
          collection: legacy.collection,
          decks: legacy.decks,
          starter_decks: starterDecksData.decks,
          active_deck_id: legacy.active_deck_id,
          relationships: Object.values(legacy.relationships),
          quests: Object.values(legacy.quests),
          quest_definitions: questsData.quests,
          npcs: npcsData.npcs,
          districts: npcsData.districts || [],
          interiors: npcsData.interiors || [],
          shop_packs: SHOP_PACK_CATALOGUE,
          art_status: artStatus,
          cards: enrichedCards
        });
      }

      if (req.method === 'GET' && pathname === '/v1/profile') {
        const userId = await getAuthenticatedUserId();
        verifyAccountAccess(userId, url.searchParams.get('user_id'));
        const profile = await db.getFullPlayerProfile(userId);
        return sendJson(200, { profile });
      }

      // 2. Cards & Collection
      if (req.method === 'GET' && pathname === '/v1/cards') {
        const faction = url.searchParams.get('faction');
        const type = url.searchParams.get('type');
        const rarity = url.searchParams.get('rarity');
        const role = url.searchParams.get('role');
        const keyword = url.searchParams.get('keyword');
        const q = (url.searchParams.get('q') || '').toLowerCase();

        let cards = bundleData.cards;
        if (faction) cards = cards.filter((c) => c.faction === faction);
        if (type) cards = cards.filter((c) => c.type === type);
        if (rarity) cards = cards.filter((c) => c.rarity === rarity);
        if (role) cards = cards.filter((c) => c.role === role);
        if (keyword) cards = cards.filter((c) => (c.keywords || []).includes(keyword));
        if (q) {
          cards = cards.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q) ||
              (c.subtype || '').toLowerCase().includes(q) ||
              c.keywords.some((k) => k.includes(q))
          );
        }
        return sendJson(200, {
          total: cards.length,
          milestone_total: bundleData.cards.length,
          target_release_total: 640,
          cards
        });
      }

      if (req.method === 'GET' && pathname.startsWith('/v1/cards/')) {
        const cardId = pathname.replace('/v1/cards/', '');
        const card = CARD_MAP.get(cardId);
        if (!card) return sendJson(404, { error: 'Card not found' });
        return sendJson(200, { card, art_detail: artPipeline.getCardArtDetail(cardId) });
      }

      if (req.method === 'GET' && pathname === '/v1/collection') {
        const userId = await getAuthenticatedUserId();
        verifyAccountAccess(userId, url.searchParams.get('user_id'));
        const profile = await db.getFullPlayerProfile(userId);
        return sendJson(200, {
          ownership: profile.collection,
          unique_owned: Object.keys(profile.collection).length,
          total_implemented: bundleData.cards.length
        });
      }

      // 3. Decks & Authoritative Rust Validation
      if (req.method === 'GET' && pathname === '/v1/decks') {
        const userId = await getAuthenticatedUserId();
        verifyAccountAccess(userId, url.searchParams.get('user_id'));
        const profile = await db.getFullPlayerProfile(userId);
        const decks = profile.decks.length > 0 ? profile.decks : starterDecksData.decks;
        return sendJson(200, {
          active_deck_id: decks[0].id,
          decks,
          starter_decks: starterDecksData.decks
        });
      }

      if (req.method === 'POST' && pathname === '/v1/decks/validate') {
        const body = await readJsonBody();
        const total = (body.cards || []).reduce((acc, c) => acc + Number(c.count || 0), 0);
        const validation = await rustBridge.validateDeck({
          id: body.id || 'temp_validate',
          name: body.name || 'Validation Deck',
          description: body.description || '',
          factions: body.factions || [],
          total_cards: total,
          cards: body.cards || []
        });
        return sendJson(200, {
          valid: validation.valid,
          total_cards: total,
          errors: validation.errors
        });
      }

      if (req.method === 'POST' && pathname === '/v1/decks') {
        const userId = await getAuthenticatedUserId();
        const body = await readJsonBody();
        verifyAccountAccess(userId, body.user_id);
        const saved = await db.saveCustomDeck(userId, body, rustBridge);
        if (!saved.valid) {
          return sendJson(400, { error: 'Invalid 40-card deck', details: saved.errors });
        }
        return sendJson(201, { deck: saved.deck, validation: { valid: true, errors: [] } });
      }

      // 4. World, Districts, Interiors, Quests & NPCs
      if (req.method === 'GET' && pathname === '/v1/world/progress') {
        const userId = await getAuthenticatedUserId();
        const legacy = await syncLegacyAppState(userId);
        return sendJson(200, {
          character: legacy.character,
          housing: legacy.housing,
          districts: npcsData.districts || [],
          interiors: npcsData.interiors || [],
          npcs: npcsData.npcs,
          relationships: Object.values(legacy.relationships),
          quests: Object.values(legacy.quests),
          quest_definitions: questsData.quests
        });
      }

      if (req.method === 'POST' && pathname === '/v1/world/move') {
        const userId = await getAuthenticatedUserId();
        const body = await readJsonBody();
        const targetLoc = body.district || body.interior || body.location_id;
        if (targetLoc) {
          await db.query(
            `UPDATE player_characters SET current_district = $2 WHERE user_id = $1`,
            [userId, targetLoc]
          );
          await db.query(
            `INSERT INTO discovered_locations (user_id, location_id, fast_travel_unlocked)
             VALUES ($1, $2, TRUE) ON CONFLICT DO NOTHING`,
            [userId, targetLoc]
          );
          await db.advanceQuestObjective(userId, 'visit_location', targetLoc);
        }
        if (body.in_game_minutes !== undefined) {
          await db.query(
            `UPDATE player_world_progress SET in_game_minutes = $2::int, updated_at = NOW() WHERE user_id = $1`,
            [userId, Number(body.in_game_minutes) % 1440]
          );
        }
        if (body.weather) {
          await db.query(
            `UPDATE player_world_progress SET current_weather = $2, updated_at = NOW() WHERE user_id = $1`,
            [userId, body.weather]
          );
        }
        const legacy = await syncLegacyAppState(userId);
        return sendJson(200, {
          character: legacy.character,
          quests: legacy.quests
        });
      }

      if (req.method === 'GET' && pathname === '/v1/npcs') {
        const userId = await getAuthenticatedUserId();
        const profile = await db.getFullPlayerProfile(userId);
        return sendJson(200, {
          npcs: npcsData.npcs,
          districts: npcsData.districts || [],
          interiors: npcsData.interiors || [],
          relationships: profile.relationships
        });
      }

      if (req.method === 'POST' && pathname === '/v1/npcs/interact') {
        const userId = await getAuthenticatedUserId();
        const body = await readJsonBody();
        const result = await db.interactWithNpc(userId, body.npc_id, body.type || 'talk');
        return sendJson(200, result);
      }

      if (req.method === 'GET' && pathname === '/v1/relationships') {
        const userId = await getAuthenticatedUserId();
        const profile = await db.getFullPlayerProfile(userId);
        return sendJson(200, { relationships: Object.values(profile.relationships) });
      }

      // 5. Shop & Crafting (PostgreSQL transactional with idempotency)
      if (req.method === 'GET' && pathname === '/v1/shop/catalogue') {
        return sendJson(200, {
          packs: SHOP_PACK_CATALOGUE
        });
      }

      if (req.method === 'GET' && pathname === '/v1/shop/history') {
        const userId = await getAuthenticatedUserId();
        const history = await db.getShopHistory(userId);
        return sendJson(200, history);
      }

      if (req.method === 'POST' && pathname === '/v1/shop/purchase') {
        const userId = await getAuthenticatedUserId();
        const body = await readJsonBody();
        verifyAccountAccess(userId, body.user_id);
        const idemKey =
          req.headers['x-idempotency-key'] || body.idempotency_key || null;
        try {
          const result = await db.openPack(
            userId,
            idemKey,
            body.pack_id || 'pack_foundations'
          );
          return sendJson(200, {
            pack_id: result.pack_id || body.pack_id || 'pack_foundations',
            cards: result.pack_cards || [],
            duplicate_echo_dust_gained: result.duplicate_dust_gained || 0,
            idempotent_replay: Boolean(result.idempotent_replay),
            wallet: result.wallet
          });
        } catch (err) {
          return sendJson(400, { error: err.message });
        }
      }

      if (req.method === 'POST' && pathname === '/v1/crafting/create') {
        const userId = await getAuthenticatedUserId();
        const body = await readJsonBody();
        verifyAccountAccess(userId, body.user_id);
        if (!CARD_MAP.has(body.card_id)) {
          return sendJson(404, { error: 'Card not found' });
        }
        try {
          const action = body.action || 'craft';
          const profileBefore = await db.getFullPlayerProfile(userId);
          const card = CARD_MAP.get(body.card_id);
          const maxCopies = { common: 3, uncommon: 3, rare: 2, legendary: 1 }[card.rarity];
          if (action === 'craft' && (profileBefore.collection[body.card_id] || 0) >= maxCopies) {
            await db.query(
              `UPDATE player_card_ownership SET quantity = GREATEST(0, quantity - 1) WHERE user_id = $1 AND card_id = $2`,
              [userId, body.card_id]
            );
          }
          const result = await db.craftOrDisenchantCard(userId, {
            card_id: body.card_id,
            action
          });
          return sendJson(200, {
            card_id: result.card_id,
            new_quantity: result.new_quantity,
            echo_dust: result.wallet.echo_dust,
            wallet: result.wallet
          });
        } catch (err) {
          return sendJson(400, { error: err.message });
        }
      }

      // 6. AI Card-Art Production Pipeline & Content Studio Endpoints (/v1/art/*)
      if (req.method === 'GET' && pathname === '/v1/art/status') {
        return sendJson(200, artPipeline.getStatusReport());
      }

      if (req.method === 'GET' && pathname === '/v1/art/providers') {
        return sendJson(200, {
          providers: artPipeline.getProviderStatuses(),
          budget: artPipeline.state.budget
        });
      }

      if (req.method === 'GET' && pathname.startsWith('/v1/art/cards/')) {
        const cardId = pathname.replace('/v1/art/cards/', '');
        const detail = artPipeline.getCardArtDetail(cardId);
        if (!detail) return sendJson(404, { error: `Card ${cardId} not found` });
        return sendJson(200, detail);
      }

      if (req.method === 'POST' && pathname === '/v1/art/prompt') {
        await getAuthenticatedUserId({ required: true, requireAdmin: true });
        const body = await readJsonBody();
        try {
          const updated = artPipeline.updateCardPrompt(body.card_id, body.prompt);
          return sendJson(200, { art_record: updated });
        } catch (err) {
          return sendJson(400, { error: err.message });
        }
      }

      if (req.method === 'POST' && pathname === '/v1/art/generate') {
        await getAuthenticatedUserId({ required: true, requireAdmin: true });
        const body = await readJsonBody();
        try {
          // Authoritative server-side budget verification
          const serverBudget = Number(artPipeline.state.budget_limit_usd || 0);
          const requestedBudget = Number(body.authorized_budget_usd || 0);
          if (requestedBudget > serverBudget) {
            return sendJson(400, {
              error: `Requested budget (${requestedBudget}) exceeds authoritative server budget limit (${serverBudget})`
            });
          }
          const jobResult = await artPipeline.enqueueAndRunGeneration({
            cardIds: body.card_ids || (body.card_id ? [body.card_id] : []),
            faction: body.faction || null,
            missingOnly: Boolean(body.missing_only),
            providerId: body.provider_id || 'studio_stylized_svg',
            variantCount: Number(body.variant_count || 1),
            authorizedBudgetUsd: requestedBudget
          });
          return sendJson(200, jobResult);
        } catch (err) {
          return sendJson(400, { error: err.message });
        }
      }

      if (req.method === 'POST' && pathname === '/v1/art/approve') {
        const userId = await getAuthenticatedUserId({ required: true, requireAdmin: true });
        const profile = await db.getFullPlayerProfile(userId);
        const body = await readJsonBody();
        try {
          const approved = artPipeline.approveCandidate(body.card_id, body.candidate_id, {
            ...body,
            approved_by: profile.username || userId,
            approval_type: body.approval_type || (body.production_approved || body.final_production_approved ? 'production' : undefined),
            visual_review_passed: body.visual_review_passed ?? true,
            visual_quality_confirmed: body.visual_quality_confirmed ?? true,
            notes: body.notes || 'Approved via Content Studio API'
          });
          return sendJson(200, approved);
        } catch (err) {
          return sendJson(400, { error: err.message });
        }
      }

      if (req.method === 'POST' && pathname === '/v1/art/reject') {
        await getAuthenticatedUserId({ required: true, requireAdmin: true });
        const body = await readJsonBody();
        try {
          const rejected = artPipeline.rejectCandidate(
            body.card_id,
            body.candidate_id,
            body.reason || 'Does not match faction silhouette'
          );
          return sendJson(200, { art_record: rejected });
        } catch (err) {
          return sendJson(400, { error: err.message });
        }
      }

      if (req.method === 'POST' && pathname === '/v1/art/export-batch') {
        await getAuthenticatedUserId({ required: true, requireAdmin: true });
        const body = await readJsonBody();
        const exported = artPipeline.exportBatchPrompts({
          faction: body.faction || null,
          missingOnly: Boolean(body.missing_only),
          outputFilename: body.output_filename || body.outputFilename
        });
        return sendJson(200, exported);
      }

      // 7. Authoritative Rust Match Endpoints (1v1 PvE, 1v1 PvP, and 2v2 Tag)
      if (req.method === 'POST' && pathname === '/v1/matches') {
        const userId = await getAuthenticatedUserId();
        const profile = await db.getFullPlayerProfile(userId);
        const body = await readJsonBody();
        const playerDecks = profile.decks.length > 0 ? profile.decks : starterDecksData.decks;
        const chosenDeck =
          playerDecks.find((d) => d.id === body.deck_id) ||
          starterDecksData.decks.find((d) => d.id === body.deck_id) ||
          playerDecks[0];

        const format = body.format || 'standard_1v1';
        const mode =
          body.mode || (format === 'tag_2v2' ? 'tag_2v2_coop' : 'pve_1v1');

        let decks = [chosenDeck];
        let playerUserIds = [userId];
        let playerNames = [profile.username];

        if (format === 'tag_2v2') {
          decks = [
            chosenDeck,
            starterDecksData.decks[1],
            starterDecksData.decks[2],
            starterDecksData.decks[3]
          ];
          playerUserIds = [userId, 'ai_tag_seat_1', 'ai_tag_seat_2', 'ai_tag_seat_3'];
          playerNames = [profile.username, 'Ally AI', 'Opponent AI 1', 'Opponent AI 2'];
        } else if (body.opponent_deck_id) {
          const oppDeck =
            starterDecksData.decks.find((d) => d.id === body.opponent_deck_id) ||
            starterDecksData.decks[1];
          decks.push(oppDeck);
          playerUserIds.push(body.opponent_user_id || 'ai_opponent_slot_1');
          playerNames.push(body.opponent_name || 'Opponent AI');
        }

        const session = await createAuthoritativeMatch({
          mode,
          format,
          playerUserIds,
          playerNames,
          decks,
          npcId: body.npc_id || 'npc_kaelen_forge',
          seed: body.seed || Date.now(),
          aiPlayers:
            body.ai_players !== undefined
              ? body.ai_players
              : mode === 'pvp_1v1' || mode === 'pvp_tag_2v2'
              ? []
              : format === 'tag_2v2'
              ? [1, 2, 3]
              : [1]
        });

        // The match creator is authoritatively seated at Slot 0
        const viewerSlot = 0;
        const match = await getRedactedMatchForViewer(session, viewerSlot);
        return sendJson(201, { match });
      }

      if (req.method === 'GET' && pathname.startsWith('/v1/matches/')) {
        const matchId = pathname.replace('/v1/matches/', '');
        const session = matchSessions.get(matchId);
        if (!session) return sendJson(404, { error: 'Match not found' });
        
        const userId = await getAuthenticatedUserId({ required: false });
        let viewerSlot = null;
        if (userId && session.playerUserIds.includes(userId)) {
          viewerSlot = session.playerUserIds.indexOf(userId);
        } else {
          // Verify spectator policy
          if (session.allowSpectators === false) {
            return sendJson(403, { error: 'Spectating is not permitted for this match' });
          }
          viewerSlot = null; // Spectator gets all private hands redacted
        }
        const match = await getRedactedMatchForViewer(session, viewerSlot);
        return sendJson(200, { match });
      }

      if (
        req.method === 'POST' &&
        pathname.endsWith('/command') &&
        pathname.startsWith('/v1/matches/')
      ) {
        const matchId = pathname.replace('/v1/matches/', '').replace('/command', '');
        const session = matchSessions.get(matchId);
        if (!session) return sendJson(404, { error: 'Match not found' });

        // Authenticate requesting user first
        const userId = await getAuthenticatedUserId();
        
        // Confirm membership in match
        const seat = session.playerUserIds.indexOf(userId);
        if (seat < 0) {
          return sendJson(403, { error: 'Forbidden: You are not an authorized player in this match' });
        }

        // Force command player to authoritative seat, overriding client-supplied player
        const cmd = await readJsonBody();
        const authorizedCmd = { ...cmd, player: seat };

        const execResult = await applyMatchCommandAndBroadcast(session, authorizedCmd, seat);
        const match = await getRedactedMatchForViewer(session, seat);
        if (!execResult.accepted) {
          return sendJson(400, { accepted: false, error: execResult.error, match });
        }
        const legacy = await syncLegacyAppState(userId);
        return sendJson(200, {
          accepted: true,
          events: execResult.events,
          checksum: execResult.checksum,
          match,
          account: legacy.account
        });
      }

      return sendJson(404, { error: `Route not found: ${req.method} ${pathname}` });
    } catch (err) {
      if (err.statusCode) {
        return sendJson(err.statusCode, { error: err.message });
      }
      return sendJson(500, { error: err.message });
    }
  });

  // =========================================================================
  // Real-Time Authoritative WebSocket Server (/v1/ws)
  // Supports:
  // - auth (session token or user_id)
  // - queue_1v1 / queue_2v2 / create_tag_lobby / join_tag_lobby
  // - join_match / reconnect_match / spectate_match
  // - submit_command (validated & executed in Rust, broadcasts player-redacted snapshots)
  // =========================================================================
  const wss = new WebSocketServer({ server, path: '/v1/ws' });

  wss.on('connection', (ws) => {
    const clientCtx = {
      ws,
      authenticated: false,
      userId: null,
      username: null,
      currentMatchId: null,
      playerSlot: null
    };

    ws.on('message', async (rawBuf) => {
      let msg;
      try {
        msg = JSON.parse(rawBuf.toString('utf8'));
      } catch {
        ws.send(JSON.stringify({ type: 'error', error: 'Invalid JSON WebSocket message' }));
        return;
      }

      try {
        if (msg.type === 'auth') {
          let uid = await db.resolveUserIdFromToken(msg.token);
          if (!uid && process.env.ALLOW_DEV_AUTH_BYPASS === 'true' && process.env.NODE_ENV === 'development' && msg.user_id) {
            uid = msg.user_id;
          }
          if (!uid) {
            ws.send(JSON.stringify({ type: 'error', error: 'Invalid or expired session token' }));
            return;
          }
          const profile = await db.getFullPlayerProfile(uid);
          clientCtx.authenticated = true;
          clientCtx.userId = profile.user_id;
          clientCtx.username = profile.username;
          ws.send(
            JSON.stringify({
              type: 'authenticated',
              user_id: clientCtx.userId,
              username: clientCtx.username
            })
          );
          return;
        }

        // All subsequent actions require authentication
        if (!clientCtx.authenticated) {
          ws.send(JSON.stringify({ type: 'error', code: 'UNAUTHORIZED', error: 'Authentication required' }));
          return;
        }

        if (msg.type === 'queue_1v1') {
          const profile = await db.getFullPlayerProfile(clientCtx.userId);
          const chosenDeck =
            profile.decks.find((d) => d.id === msg.deck_id) ||
            starterDecksData.decks.find((d) => d.id === msg.deck_id) ||
            profile.decks[0] ||
            starterDecksData.decks[0];

          const waitingIdx = matchmakingQueue1v1.findIndex(
            (entry) => entry.ws.readyState === 1 && entry.userId !== clientCtx.userId
          );

          if (waitingIdx >= 0) {
            const opponentEntry = matchmakingQueue1v1.splice(waitingIdx, 1)[0];
            const session = await createAuthoritativeMatch({
              mode: 'pvp_1v1',
              format: 'standard_1v1',
              playerUserIds: [opponentEntry.userId, clientCtx.userId],
              playerNames: [opponentEntry.username, clientCtx.username],
              decks: [opponentEntry.deck, chosenDeck],
              seed: msg.seed || Date.now(),
              aiPlayers: []
            });

            const sub0 = {
              ws: opponentEntry.ws,
              playerSlot: 0,
              userId: opponentEntry.userId
            };
            const sub1 = {
              ws,
              playerSlot: 1,
              userId: clientCtx.userId
            };
            opponentEntry.clientCtx.currentMatchId = session.id;
            opponentEntry.clientCtx.playerSlot = 0;
            clientCtx.currentMatchId = session.id;
            clientCtx.playerSlot = 1;

            session.subscribers.add(sub0);
            session.subscribers.add(sub1);

            const matchFor0 = await getRedactedMatchForViewer(session, 0);
            const matchFor1 = await getRedactedMatchForViewer(session, 1);

            opponentEntry.ws.send(
              JSON.stringify({
                type: 'match_found',
                match_id: session.id,
                player_slot: 0,
                seq: session.seq,
                checksum: session.checksum,
                match: matchFor0
              })
            );
            ws.send(
              JSON.stringify({
                type: 'match_found',
                match_id: session.id,
                player_slot: 1,
                seq: session.seq,
                checksum: session.checksum,
                match: matchFor1
              })
            );
          } else {
            matchmakingQueue1v1.push({
              ws,
              clientCtx,
              userId: clientCtx.userId,
              username: clientCtx.username,
              deck: chosenDeck
            });
            ws.send(JSON.stringify({ type: 'queued', format: 'standard_1v1' }));
          }
          return;
        }

        // Four-Client Online 2v2 Tag Matchmaking Queue
        if (msg.type === 'queue_2v2') {
          const profile = await db.getFullPlayerProfile(clientCtx.userId);
          const chosenDeck =
            profile.decks.find((d) => d.id === msg.deck_id) ||
            starterDecksData.decks.find((d) => d.id === msg.deck_id) ||
            profile.decks[0] ||
            starterDecksData.decks[0];

          // Remove any stale or duplicate entry for this ws
          for (let i = matchmakingQueue2v2.length - 1; i >= 0; i--) {
            if (matchmakingQueue2v2[i].ws.readyState !== 1 || matchmakingQueue2v2[i].ws === ws) {
              matchmakingQueue2v2.splice(i, 1);
            }
          }

          matchmakingQueue2v2.push({
            ws,
            clientCtx,
            userId: clientCtx.userId,
            username: clientCtx.username,
            deck: chosenDeck,
            seed: msg.seed
          });

          if (matchmakingQueue2v2.length >= 4) {
            const fourEntries = matchmakingQueue2v2.splice(0, 4);
            const matchSeed =
              fourEntries.find((e) => e.seed !== undefined)?.seed || Date.now();
            await launchFourPlayerTagMatch(fourEntries, matchSeed);
          } else {
            ws.send(
              JSON.stringify({
                type: 'queued',
                format: 'tag_2v2',
                players_in_queue: matchmakingQueue2v2.length,
                players_needed: 4
              })
            );
          }
          return;
        }

        // Private 2v2 Tag Battle Lobbies (Party / Custom Seat Assignment)
        if (msg.type === 'create_tag_lobby') {
          const profile = await db.getFullPlayerProfile(clientCtx.userId);
          const chosenDeck =
            profile.decks.find((d) => d.id === msg.deck_id) ||
            starterDecksData.decks.find((d) => d.id === msg.deck_id) ||
            profile.decks[0] ||
            starterDecksData.decks[0];

          const lobbyId = msg.lobby_id || `tag_${crypto.randomBytes(4).toString('hex')}`;
          const seat = Number(msg.preferred_seat ?? 0) % 4;
          const lobby = {
            id: lobbyId,
            hostUserId: clientCtx.userId,
            seed: msg.seed || Date.now(),
            seats: [null, null, null, null]
          };
          lobby.seats[seat] = {
            ws,
            clientCtx,
            userId: clientCtx.userId,
            username: clientCtx.username,
            deck: chosenDeck
          };
          tagLobbies.set(lobbyId, lobby);

          ws.send(
            JSON.stringify({
              type: 'tag_lobby_created',
              lobby_id: lobbyId,
              assigned_seat: seat,
              team_id: seat % 2,
              occupied_seats: [seat]
            })
          );
          return;
        }

        if (msg.type === 'join_tag_lobby') {
          const lobby = tagLobbies.get(msg.lobby_id);
          if (!lobby) {
            ws.send(JSON.stringify({ type: 'error', error: '2v2 Tag Lobby not found' }));
            return;
          }
          const profile = await db.getFullPlayerProfile(clientCtx.userId);
          const chosenDeck =
            profile.decks.find((d) => d.id === msg.deck_id) ||
            starterDecksData.decks.find((d) => d.id === msg.deck_id) ||
            profile.decks[0] ||
            starterDecksData.decks[0];

          let targetSeat =
            typeof msg.preferred_seat === 'number' && !lobby.seats[msg.preferred_seat]
              ? msg.preferred_seat
              : lobby.seats.findIndex((s) => s === null);

          if (targetSeat < 0 || targetSeat > 3) {
            ws.send(JSON.stringify({ type: 'error', error: '2v2 Tag Lobby is already full' }));
            return;
          }

          lobby.seats[targetSeat] = {
            ws,
            clientCtx,
            userId: clientCtx.userId,
            username: clientCtx.username,
            deck: chosenDeck
          };

          const occupiedSeats = lobby.seats
            .map((s, idx) => (s ? idx : null))
            .filter((idx) => idx !== null);

          for (const seatEntry of lobby.seats) {
            if (seatEntry && seatEntry.ws.readyState === 1) {
              seatEntry.ws.send(
                JSON.stringify({
                  type: 'tag_lobby_updated',
                  lobby_id: lobby.id,
                  occupied_seats: occupiedSeats
                })
              );
            }
          }

          if (occupiedSeats.length === 4) {
            tagLobbies.delete(lobby.id);
            await launchFourPlayerTagMatch(lobby.seats, lobby.seed);
          }
          return;
        }

        // Spectator Join (All 4 player hands redacted)
        if (msg.type === 'spectate_match') {
          const session = matchSessions.get(msg.match_id);
          if (!session) {
            ws.send(JSON.stringify({ type: 'error', error: 'Match session not found' }));
            return;
          }
          clientCtx.currentMatchId = session.id;
          clientCtx.playerSlot = null;

          session.subscribers.add({
            ws,
            playerSlot: null,
            userId: clientCtx.userId
          });

          const redactedMatch = await getRedactedMatchForViewer(session, null);
          ws.send(
            JSON.stringify({
              type: 'match_spectating',
              match_id: session.id,
              viewer_slot: null,
              seq: session.seq,
              checksum: session.checksum,
              match: redactedMatch
            })
          );
          return;
        }

        if (msg.type === 'join_match' || msg.type === 'reconnect_match') {
          const session = matchSessions.get(msg.match_id);
          if (!session) {
            ws.send(JSON.stringify({ type: 'error', error: 'Match session not found' }));
            return;
          }
          // Derive player slot authoritatively from session.playerUserIds!
          const slot = session.playerUserIds.indexOf(clientCtx.userId);
          if (slot < 0) {
            ws.send(JSON.stringify({ type: 'error', error: 'User is not an authorized participant in this match' }));
            return;
          }

          clientCtx.currentMatchId = session.id;
          clientCtx.playerSlot = slot;

          for (const existing of Array.from(session.subscribers)) {
            if (
              existing.ws === ws ||
              (existing.userId === clientCtx.userId && existing.playerSlot === slot)
            ) {
              session.subscribers.delete(existing);
            }
          }
          session.subscribers.add({
            ws,
            playerSlot: slot,
            userId: clientCtx.userId
          });

          const redactedMatch = await getRedactedMatchForViewer(session, slot);
          ws.send(
            JSON.stringify({
              type: 'match_joined',
              match_id: session.id,
              player_slot: slot,
              team_id: session.format === 'tag2v2' ? slot % 2 : slot,
              seq: session.seq,
              checksum: session.checksum,
              match: redactedMatch
            })
          );
          return;
        }

        if (msg.type === 'submit_command') {
          const matchId = msg.match_id || clientCtx.currentMatchId;
          const session = matchSessions.get(matchId);
          if (!session) {
            ws.send(JSON.stringify({ type: 'error', error: 'Active match not found' }));
            return;
          }
          if (clientCtx.playerSlot === null) {
            ws.send(
              JSON.stringify({
                type: 'command_rejected',
                match_id: session.id,
                error: 'Spectators cannot submit gameplay commands'
              })
            );
            return;
          }
          const authorizedSlot = session.playerUserIds.indexOf(clientCtx.userId);
          if (authorizedSlot < 0 || authorizedSlot !== clientCtx.playerSlot) {
            ws.send(
              JSON.stringify({
                type: 'command_rejected',
                match_id: session.id,
                error: 'Unauthorized command: You are not the registered player for this seat'
              })
            );
            return;
          }
          // Server overrides any client-supplied player identifier with authorized seat
          const cmdPayload = { ...msg.command, player: authorizedSlot };
          const result = await applyMatchCommandAndBroadcast(session, cmdPayload, authorizedSlot);
          if (!result.accepted) {
            ws.send(
              JSON.stringify({
                type: 'command_rejected',
                match_id: session.id,
                req_seq: msg.req_seq ?? null,
                error: result.error,
                checksum: session.checksum
              })
            );
          }
          return;
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', error: err.message }));
      }
    });

    ws.on('close', () => {
      const qIdx1 = matchmakingQueue1v1.findIndex((e) => e.ws === ws);
      if (qIdx1 >= 0) matchmakingQueue1v1.splice(qIdx1, 1);
      const qIdx2 = matchmakingQueue2v2.findIndex((e) => e.ws === ws);
      if (qIdx2 >= 0) matchmakingQueue2v2.splice(qIdx2, 1);

      if (clientCtx.currentMatchId) {
        const session = matchSessions.get(clientCtx.currentMatchId);
        if (session) {
          for (const sub of Array.from(session.subscribers)) {
            if (sub.ws === ws) session.subscribers.delete(sub);
          }
        }
      }
    });
  });

  async function closeServer() {
    for (const client of wss.clients) {
      try {
        client.terminate();
      } catch {}
    }
    await new Promise((resolve) => wss.close(resolve));
    if (server.listening) {
      await new Promise((resolve) => server.close(resolve));
    }
    rustBridge.close();
    await db.close();
  }

  const appState = await syncLegacyAppState();
  return { server, wss, db, rustBridge, artPipeline, appState, closeServer };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
) {
  const port = Number(process.env.PORT || 4173);
  const { server, db } = await createServer();
  server.listen(port, () => {
    console.log(
      `[Hearthglass Authoritative Platform API (${db.mode} + Rust Battle Engine)] Listening on http://localhost:${port}`
    );
  });
}
