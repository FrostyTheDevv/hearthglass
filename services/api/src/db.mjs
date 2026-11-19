import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

const COPY_LIMITS = { common: 3, uncommon: 3, rare: 2, legendary: 1 };
const CRAFT_COSTS = { common: 40, uncommon: 100, rare: 400, legendary: 1600 };
const DISENCHANT_YIELDS = { common: 10, uncommon: 25, rare: 100, legendary: 400 };
const DEFAULT_USER_ID = '00000000-0000-4000-8000-000000000001';

export const SHOP_PACK_CATALOGUE = [
  {
    id: 'pack_foundations',
    name: 'Foundations Echo Pack (5 Cards)',
    description: 'Contains 5 cards across all 8 Convergence factions and Neutral (3 Common, 1 Uncommon, 1 Rare/Legendary).',
    cost_crowns: 100,
    factions: ['all']
  },
  {
    id: 'pack_emberclad',
    name: 'Emberclad Forge Pack (5 Cards)',
    description: 'Focused on Emberclad Overheat & Iron Choir Assembly cards plus Neutral staples.',
    cost_crowns: 100,
    factions: ['emberclad', 'iron_choir', 'neutral']
  },
  {
    id: 'pack_verdant',
    name: 'Verdant Awakening Pack (5 Cards)',
    description: 'Focused on Verdant Pact Bloom & Tidebound Current cards plus Neutral staples.',
    cost_crowns: 100,
    factions: ['verdant_pact', 'tidebound', 'neutral']
  },
  {
    id: 'pack_glassborne',
    name: 'Glassborne Reflections Pack (5 Cards)',
    description: 'Focused on Glassborne Refraction & Starweave Alignment cards plus Neutral staples.',
    cost_crowns: 100,
    factions: ['glassborne', 'starweave', 'neutral']
  },
  {
    id: 'pack_nocturne_grave',
    name: 'Twilight & Bramble Pack (5 Cards)',
    description: 'Focused on Nocturne Veil & Gravewild Reclaim cards plus Neutral staples.',
    cost_crowns: 100,
    factions: ['nocturne', 'gravewild', 'neutral']
  }
];

export function hashPassword(password, salt = null) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), actualSalt, 64).toString('hex');
  return `scrypt:${actualSalt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('scrypt:')) return false;
  const [, salt, expected] = storedHash.split(':');
  const actual = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

/**
 * PostgreSQL persistence adapter supporting both remote PostgreSQL (`DATABASE_URL` via `pg.Pool`)
 * and embedded disk-persisted PostgreSQL 16 (`@electric-sql/pglite` at `data/pgdata`).
 */
export class HearthglassDatabase {
  constructor({ dataDir = null, databaseUrl = process.env.DATABASE_URL } = {}) {
    this.databaseUrl = databaseUrl || null;
    this.dataDir = dataDir || path.join(ROOT, 'data', 'pgdata');
    this.pool = null;
    this.pglite = null;
    this.mode = null;
    this.cardById = new Map();
    this.starterDecks = [];
    this.npcs = [];
    this.districts = [];
    this.interiors = [];
    this.quests = [];
  }

  async init() {
    if (this.databaseUrl) {
      this.pool = new pg.Pool({ connectionString: this.databaseUrl });
      this.mode = 'pg_pool';
    } else {
      fs.mkdirSync(path.dirname(this.dataDir), { recursive: true });
      this.pglite = await PGlite.create(this.dataDir);
      this.mode = 'pglite_postgres_16';
    }

    // 1. Run canonical schema migration
    const migrationSql = fs.readFileSync(
      path.join(ROOT, 'infra', 'migrations', '001_initial_schema.sql'),
      'utf8'
    );
    await this.exec(migrationSql);

    // 2. Load canonical JSON content and seed reference tables
    const bundle = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'content', 'cards', 'foundations_v1.json'), 'utf8')
    );
    const decksFile = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'content', 'cards', 'starter_decks.json'), 'utf8')
    );
    const npcsFile = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'content', 'npcs', 'lumenport_npcs.json'), 'utf8')
    );
    const questsFile = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'content', 'quests', 'act1_quests.json'), 'utf8')
    );

    this.cardById.clear();
    for (const card of bundle.cards) {
      this.cardById.set(card.id, card);
    }
    this.starterDecks = decksFile.decks;
    this.npcs = npcsFile.npcs;
    this.districts = npcsFile.districts || [];
    this.interiors = npcsFile.interiors || [];
    this.quests = questsFile.quests;

    await this.seedReferenceData(bundle.cards, this.npcs, this.quests);

    // 3. Ensure default pioneer account exists so local studio & default client work seamlessly
    await this.ensureUserAccount({
      userId: DEFAULT_USER_ID,
      email: 'pioneer@hearthglass.local',
      username: 'Aerin_Vanguard',
      password: 'hearthglass_default_password'
    });
  }

  async exec(sql) {
    if (this.pool) {
      await this.pool.query(sql);
    } else {
      await this.pglite.exec(sql);
    }
  }

  async query(sql, params = []) {
    if (this.pool) {
      return this.pool.query(sql, params);
    }
    return this.pglite.query(sql, params);
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    if (this.pglite) {
      await this.pglite.close();
      this.pglite = null;
    }
  }

  async seedReferenceData(cards, npcs, quests) {
    for (const c of cards) {
      await this.query(
        `INSERT INTO card_definitions (id, name, card_type, faction, rarity, release_set)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           card_type = EXCLUDED.card_type,
           faction = EXCLUDED.faction,
           rarity = EXCLUDED.rarity`,
        [c.id, c.name, c.type, c.faction, c.rarity, c.release_set || 'foundations']
      );
      await this.query(
        `INSERT INTO card_versions (card_id, revision, balance_version, definition_json)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (card_id, revision) DO UPDATE SET
           balance_version = EXCLUDED.balance_version,
           definition_json = EXCLUDED.definition_json`,
        [c.id, c.revision || 1, c.balance_version || 'base_001', JSON.stringify(c)]
      );
    }

    for (const n of npcs) {
      await this.query(
        `INSERT INTO npc_definitions (id, name, category, faction_affinity, profile_json)
         VALUES ($1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           faction_affinity = EXCLUDED.faction_affinity,
           profile_json = EXCLUDED.profile_json`,
        [n.id, n.name, n.category, n.faction_affinity, JSON.stringify(n)]
      );
    }

    for (const q of quests) {
      await this.query(
        `INSERT INTO quest_definitions (id, chapter, title, definition_json)
         VALUES ($1, $2, $3, $4::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           chapter = EXCLUDED.chapter,
           title = EXCLUDED.title,
           definition_json = EXCLUDED.definition_json`,
        [q.id, q.chapter, q.title, JSON.stringify(q)]
      );
    }
  }

  async ensureUserAccount({ userId = null, email, username, password, characterName = null, appearance = null }) {
    const existing = await this.query(
      `SELECT id, email, username FROM users WHERE email = $1 OR username = $2 OR ($3::uuid IS NOT NULL AND id = $3::uuid) LIMIT 1`,
      [email, username, userId]
    );
    if (existing.rows.length > 0) {
      const uid = existing.rows[0].id;
      // Ensure any newly added cards, NPCs, or quests from V3 expansion are also seeded for existing accounts
      for (const c of this.cardById.values()) {
        const qty = COPY_LIMITS[c.rarity] || 3;
        await this.query(
          `INSERT INTO player_card_ownership (user_id, card_id, quantity)
           VALUES ($1, $2, $3) ON CONFLICT (user_id, card_id) DO NOTHING`,
          [uid, c.id, qty]
        );
      }
      for (const npc of this.npcs) {
        const score = npc.initial_relationship || 20;
        await this.query(
          `INSERT INTO npc_relationships (user_id, npc_id, score, companion_unlocked)
           VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
          [uid, npc.id, score, score >= 40]
        );
      }
      for (const q of this.quests) {
        const initProgress = {};
        for (const obj of q.objectives) {
          initProgress[obj.id] = 0;
        }
        await this.query(
          `INSERT INTO player_quests (user_id, quest_id, status, progress_json)
           VALUES ($1, $2, 'active', $3::jsonb) ON CONFLICT DO NOTHING`,
          [uid, q.id, JSON.stringify(initProgress)]
        );
      }
      return this.getFullPlayerProfile(uid);
    }

    const uid = userId || crypto.randomUUID();
    const pwdHash = hashPassword(password || 'default_pass');

    await this.query(
      `INSERT INTO users (id, email, username, status) VALUES ($1, $2, $3, 'active')`,
      [uid, email, username]
    );
    await this.query(
      `INSERT INTO authentication_identities (id, user_id, provider, password_hash, last_login_at)
       VALUES ($1, $2, 'password', $3, NOW())`,
      [crypto.randomUUID(), uid, pwdHash]
    );
    await this.query(`INSERT INTO account_settings (user_id) VALUES ($1)`, [uid]);
    await this.query(`INSERT INTO player_profiles (user_id) VALUES ($1)`, [uid]);
    await this.query(
      `INSERT INTO player_characters (id, user_id, character_name, appearance_json, current_region, current_district)
       VALUES ($1, $2, $3, $4::jsonb, 'lumenport', 'lumenport_arrival_square')`,
      [
        crypto.randomUUID(),
        uid,
        characterName || username,
        JSON.stringify(
          appearance || {
            body_type: 'adventurer_a',
            hair_style: 'windswept_short',
            outfit: 'lumenport_coat_gold'
          }
        )
      ]
    );
    await this.query(
      `INSERT INTO wallet_balances (user_id, crowns, echo_dust, sigils) VALUES ($1, 850, 360, 2)`,
      [uid]
    );
    await this.query(
      `INSERT INTO player_world_progress (user_id, story_chapter, in_game_minutes, current_weather)
       VALUES ($1, 1, 600, 'clear')`,
      [uid]
    );
    await this.query(
      `INSERT INTO player_housing (user_id, room_theme, layout_json)
       VALUES ($1, 'lumenport_harbor_loft', $2::jsonb)`,
      [
        uid,
        JSON.stringify([
          { item_id: 'trophy_first_echo', slot: 'desk_left' },
          { item_id: 'banner_accord_initiate', slot: 'north_wall' },
          { item_id: 'relic_cabinet_tier1', slot: 'east_corner' }
        ])
      ]
    );

    // Seed discovered locations across all 6 districts and 6 interiors
    const allLocIds = [
      'lumenport_arrival_square',
      'lumenport_central_card_market',
      'lumenport_duelist_plaza',
      'lumenport_residential_district',
      'lumenport_tournament_hall',
      'lumenport_accord_institute',
      'lumenport_observatory_district',
      'lumenport_old_harbor',
      'interior_prism_card_shop',
      'interior_lantern_drip_cafe',
      'interior_player_harbor_loft',
      'interior_tournament_registration',
      'interior_aether_training_facility',
      'interior_choir_relic_workshop'
    ];
    for (const loc of allLocIds) {
      await this.query(
        `INSERT INTO discovered_locations (user_id, location_id, fast_travel_unlocked)
         VALUES ($1, $2, TRUE) ON CONFLICT DO NOTHING`,
        [uid, loc]
      );
    }

    // Seed starter card ownership (max playable copies of all 320 cards for seamless deckbuilding & testing)
    for (const c of this.cardById.values()) {
      const qty = COPY_LIMITS[c.rarity] || 3;
      await this.query(
        `INSERT INTO player_card_ownership (user_id, card_id, quantity)
         VALUES ($1, $2, $3) ON CONFLICT (user_id, card_id) DO NOTHING`,
        [uid, c.id, qty]
      );
    }

    // Seed the first 4 starter decks for this account
    for (const sd of this.starterDecks.slice(0, 4)) {
      const deckUuid = crypto.randomUUID();
      await this.query(
        `INSERT INTO decks (id, user_id, name, factions, format, revision)
         VALUES ($1, $2, $3, $4::jsonb, 'standard_1v1', 1)`,
        [deckUuid, uid, sd.name, JSON.stringify(sd.factions)]
      );
      for (const entry of sd.cards) {
        await this.query(
          `INSERT INTO deck_cards (deck_id, card_id, quantity) VALUES ($1, $2, $3)`,
          [deckUuid, entry.card_id, entry.count]
        );
      }
    }

    // Seed NPC relationships for all 16 named NPCs
    for (const npc of this.npcs) {
      const score = npc.initial_relationship || 20;
      await this.query(
        `INSERT INTO npc_relationships (user_id, npc_id, score, companion_unlocked)
         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
        [uid, npc.id, score, score >= 40]
      );
    }

    // Seed quests
    for (const q of this.quests) {
      const initProgress = {};
      for (const obj of q.objectives) {
        initProgress[obj.id] = 0;
      }
      await this.query(
        `INSERT INTO player_quests (user_id, quest_id, status, progress_json)
         VALUES ($1, $2, 'active', $3::jsonb) ON CONFLICT DO NOTHING`,
        [uid, q.id, JSON.stringify(initProgress)]
      );
    }

    // Seed initial ranking
    await this.query(
      `INSERT INTO rankings (user_id, season_id, format, rating, rating_deviation, wins, losses)
       VALUES ($1, 'season_1_foundations', 'standard_1v1', 1500.00, 350.00, 0, 0)
       ON CONFLICT DO NOTHING`,
      [uid]
    );

    return this.getFullPlayerProfile(uid);
  }

  async registerUser({ email, username, password, characterName = null, appearance = null }) {
    const check = await this.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)`,
      [email, username]
    );
    if (check.rows.length > 0) {
      throw new Error('Email or username is already registered');
    }
    const profile = await this.ensureUserAccount({
      email,
      username,
      password,
      characterName,
      appearance
    });
    const session = await this.createSession(profile.user_id);
    return { profile, session };
  }

  async loginUser({ usernameOrEmail, password }) {
    const res = await this.query(
      `SELECT u.id, u.username, u.email, a.password_hash
       FROM users u
       JOIN authentication_identities a ON a.user_id = u.id AND a.provider = 'password'
       WHERE LOWER(u.email) = LOWER($1) OR LOWER(u.username) = LOWER($1)
       LIMIT 1`,
      [usernameOrEmail]
    );
    if (res.rows.length === 0) {
      throw new Error('Invalid username/email or password');
    }
    const row = res.rows[0];
    if (!verifyPassword(password, row.password_hash)) {
      throw new Error('Invalid username/email or password');
    }
    await this.query(
      `UPDATE authentication_identities SET last_login_at = NOW() WHERE user_id = $1`,
      [row.id]
    );
    const session = await this.createSession(row.id);
    const profile = await this.getFullPlayerProfile(row.id);
    return { profile, session };
  }

  async createSession(userId) {
    const token = `hg_${crypto.randomBytes(24).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const sessionId = crypto.randomUUID();
    await this.query(
      `INSERT INTO sessions (id, user_id, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [sessionId, userId, tokenHash]
    );
    return { session_id: sessionId, token, user_id: userId };
  }

  async resolveUserIdFromToken(token) {
    if (!token) return DEFAULT_USER_ID;
    const clean = token.replace(/^Bearer\s+/i, '').trim();
    if (!clean) return DEFAULT_USER_ID;
    const tokenHash = crypto.createHash('sha256').update(clean).digest('hex');
    const res = await this.query(
      `SELECT user_id FROM sessions WHERE refresh_token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1`,
      [tokenHash]
    );
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0].user_id;
  }

  async getFullPlayerProfile(userId = DEFAULT_USER_ID) {
    const uRes = await this.query(
      `SELECT u.id, u.email, u.username,
              p.account_level, p.account_xp, p.active_title,
              c.character_name, c.appearance_json, c.current_region, c.current_district,
              w.crowns, w.echo_dust, w.sigils,
              wp.story_chapter, wp.in_game_minutes, wp.current_weather,
              h.room_theme, h.layout_json
       FROM users u
       LEFT JOIN player_profiles p ON p.user_id = u.id
       LEFT JOIN player_characters c ON c.user_id = u.id
       LEFT JOIN wallet_balances w ON w.user_id = u.id
       LEFT JOIN player_world_progress wp ON wp.user_id = u.id
       LEFT JOIN player_housing h ON h.user_id = u.id
       WHERE u.id = $1 LIMIT 1`,
      [userId]
    );
    if (uRes.rows.length === 0) {
      throw new Error(`User ${userId} not found`);
    }
    const row = uRes.rows[0];

    const colRes = await this.query(
      `SELECT card_id, quantity FROM player_card_ownership WHERE user_id = $1`,
      [userId]
    );
    const collection = {};
    for (const r of colRes.rows) {
      collection[r.card_id] = Number(r.quantity);
    }

    const decksRes = await this.query(
      `SELECT id, name, factions, format, revision FROM decks WHERE user_id = $1 ORDER BY created_at ASC`,
      [userId]
    );
    const decks = [];
    for (const d of decksRes.rows) {
      const cardsRes = await this.query(
        `SELECT card_id, quantity FROM deck_cards WHERE deck_id = $1 ORDER BY card_id ASC`,
        [d.id]
      );
      const cards = cardsRes.rows.map((c) => ({
        card_id: c.card_id,
        count: Number(c.quantity)
      }));
      const total = cards.reduce((acc, c) => acc + c.count, 0);
      decks.push({
        id: d.id,
        name: d.name,
        description: `Saved custom deck (rev ${d.revision})`,
        factions: Array.isArray(d.factions) ? d.factions : JSON.parse(d.factions || '[]'),
        total_cards: total,
        cards
      });
    }

    const relRes = await this.query(
      `SELECT npc_id, score, companion_unlocked FROM npc_relationships WHERE user_id = $1`,
      [userId]
    );
    const relationships = {};
    for (const r of relRes.rows) {
      relationships[r.npc_id] = {
        score: Number(r.score),
        tier: this.computeRelationshipTier(Number(r.score)),
        companion_unlocked: Boolean(r.companion_unlocked)
      };
    }

    const qRes = await this.query(
      `SELECT quest_id, status, progress_json FROM player_quests WHERE user_id = $1`,
      [userId]
    );
    const quests = {};
    for (const q of qRes.rows) {
      quests[q.quest_id] = {
        status: q.status,
        progress:
          typeof q.progress_json === 'object'
            ? q.progress_json
            : JSON.parse(q.progress_json || '{}')
      };
    }

    const locRes = await this.query(
      `SELECT location_id FROM discovered_locations WHERE user_id = $1 ORDER BY discovered_at ASC`,
      [userId]
    );

    const rankRes = await this.query(
      `SELECT rating, wins, losses FROM rankings WHERE user_id = $1 AND format = 'standard_1v1' LIMIT 1`,
      [userId]
    );
    const rank = rankRes.rows[0] || { rating: 1500, wins: 0, losses: 0 };

    return {
      user_id: row.id,
      email: row.email,
      username: row.username,
      character_name: row.character_name || row.username,
      appearance: row.appearance_json || {},
      title: row.active_title || 'Lumenport Newcomer',
      level: Number(row.account_level || 1),
      xp: Number(row.account_xp || 0),
      rating: Number(rank.rating || 1500),
      wins: Number(rank.wins || 0),
      losses: Number(rank.losses || 0),
      wallet: {
        crowns: Number(row.crowns ?? 500),
        echo_dust: Number(row.echo_dust ?? 150),
        sigils: Number(row.sigils ?? 0)
      },
      world: {
        region: row.current_region || 'lumenport',
        district: row.current_district || 'lumenport_arrival_square',
        story_chapter: Number(row.story_chapter || 1),
        in_game_minutes: Number(row.in_game_minutes || 600),
        weather: row.current_weather || 'clear',
        discovered_locations: locRes.rows.map((l) => l.location_id)
      },
      housing: {
        room_theme: row.room_theme || 'lumenport_harbor_loft',
        placed_items: Array.isArray(row.layout_json) ? row.layout_json : []
      },
      collection,
      decks,
      relationships,
      quests
    };
  }

  computeRelationshipTier(score) {
    if (score >= 85) return 'Bonded';
    if (score >= 65) return 'Trusted';
    if (score >= 40) return 'Friendly';
    if (score >= 20) return 'Acquaintance';
    return 'Stranger';
  }

  async saveCustomDeck(userId, deckDef, rustBridge) {
    // Authoritative validation via Rust rules engine
    const validation = await rustBridge.validateDeck({
      id: deckDef.id || 'custom_deck',
      name: deckDef.name || 'Custom Deck',
      description: deckDef.description || 'Custom 40-card deck',
      factions: deckDef.factions || [],
      total_cards: (deckDef.cards || []).reduce((acc, c) => acc + Number(c.count || 0), 0),
      cards: deckDef.cards || []
    });

    if (!validation.valid) {
      return { valid: false, errors: validation.errors };
    }

    // Check collection ownership in PostgreSQL
    const colRes = await this.query(
      `SELECT card_id, quantity FROM player_card_ownership WHERE user_id = $1`,
      [userId]
    );
    const ownedMap = new Map(colRes.rows.map((r) => [r.card_id, Number(r.quantity)]));
    const ownershipErrors = [];
    const majorFactions = new Set();

    for (const entry of deckDef.cards) {
      const card = this.cardById.get(entry.card_id);
      if (card && card.faction !== 'neutral') {
        majorFactions.add(card.faction);
      }
      const owned = ownedMap.get(entry.card_id) || 0;
      if (owned < entry.count) {
        ownershipErrors.push(
          `Insufficient owned copies of ${entry.card_id}: own ${owned}, need ${entry.count}`
        );
      }
    }

    if (ownershipErrors.length > 0) {
      return { valid: false, errors: ownershipErrors };
    }

    const isUuid =
      deckDef.id &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deckDef.id);
    const deckId = isUuid ? deckDef.id : crypto.randomUUID();
    const factions = Array.from(majorFactions);

    await this.query(
      `INSERT INTO decks (id, user_id, name, factions, format, revision, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, 'standard_1v1', 1, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         factions = EXCLUDED.factions,
         revision = decks.revision + 1,
         updated_at = NOW()`,
      [deckId, userId, deckDef.name || 'Custom Convergence Deck', JSON.stringify(factions)]
    );

    await this.query(`DELETE FROM deck_cards WHERE deck_id = $1`, [deckId]);
    for (const entry of deckDef.cards) {
      await this.query(
        `INSERT INTO deck_cards (deck_id, card_id, quantity) VALUES ($1, $2, $3)`,
        [deckId, entry.card_id, entry.count]
      );
    }

    await this.query(
      `INSERT INTO deck_revisions (id, deck_id, revision, cards_snapshot)
       VALUES ($1, $2, 1, $3::jsonb)`,
      [crypto.randomUUID(), deckId, JSON.stringify(deckDef.cards)]
    );

    await this.advanceQuestObjective(userId, 'validate_legal_deck', 'any_40_card_deck');

    return {
      valid: true,
      errors: [],
      deck: {
        id: deckId,
        name: deckDef.name || 'Custom Convergence Deck',
        description: deckDef.description || 'Player-saved 40-card deck',
        factions,
        total_cards: 40,
        cards: deckDef.cards
      }
    };
  }

  async openPack(userId, idempotencyKey = null, packId = 'pack_foundations') {
    const packMeta =
      SHOP_PACK_CATALOGUE.find((p) => p.id === packId) || SHOP_PACK_CATALOGUE[0];
    const PACK_COST_CROWNS = packMeta.cost_crowns || 100;
    const idemKey = idempotencyKey || `pack_${crypto.randomUUID()}`;

    const existingTx = await this.query(
      `SELECT id FROM currency_transactions WHERE idempotency_key = $1 LIMIT 1`,
      [idemKey]
    );
    if (existingTx.rows.length > 0) {
      const profile = await this.getFullPlayerProfile(userId);
      return { idempotent_replay: true, wallet: profile.wallet };
    }

    const wRes = await this.query(
      `SELECT crowns, echo_dust FROM wallet_balances WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    const crowns = Number(wRes.rows[0]?.crowns || 0);
    if (crowns < PACK_COST_CROWNS) {
      throw new Error(`Insufficient Crowns (requires ${PACK_COST_CROWNS} Crowns)`);
    }

    await this.query(
      `UPDATE wallet_balances SET crowns = crowns - $2, updated_at = NOW() WHERE user_id = $1`,
      [userId, PACK_COST_CROWNS]
    );
    await this.query(
      `INSERT INTO currency_transactions (id, user_id, idempotency_key, currency, amount_delta, reason)
       VALUES ($1, $2, $3, 'crowns', $4, $5)`,
      [crypto.randomUUID(), userId, idemKey, -PACK_COST_CROWNS, `pack_purchase_${packMeta.id}`]
    );

    const allCards = Array.from(this.cardById.values());
    const poolCards =
      packMeta.factions.includes('all')
        ? allCards
        : allCards.filter((c) => packMeta.factions.includes(c.faction));
    const sourcePool = poolCards.length >= 10 ? poolCards : allCards;

    const commons = sourcePool.filter((c) => c.rarity === 'common');
    const uncommons = sourcePool.filter((c) => c.rarity === 'uncommon');
    const raresOrLegendaries = sourcePool.filter(
      (c) => c.rarity === 'rare' || c.rarity === 'legendary'
    );
    const pick = (arr, fallback) =>
      arr.length > 0
        ? arr[Math.floor(Math.random() * arr.length)]
        : fallback[Math.floor(Math.random() * fallback.length)];

    const drawn = [
      pick(commons, allCards),
      pick(commons, allCards),
      pick(commons, allCards),
      pick(uncommons, allCards),
      pick(raresOrLegendaries, allCards)
    ];

    let duplicateDustConverted = 0;
    const packResults = [];

    for (const card of drawn) {
      const ownRes = await this.query(
        `SELECT quantity FROM player_card_ownership WHERE user_id = $1 AND card_id = $2`,
        [userId, card.id]
      );
      const currentOwned = Number(ownRes.rows[0]?.quantity || 0);
      const maxPlayable = COPY_LIMITS[card.rarity];
      if (currentOwned >= maxPlayable) {
        const dust = DISENCHANT_YIELDS[card.rarity];
        duplicateDustConverted += dust;
        packResults.push({
          card_id: card.id,
          name: card.name,
          faction: card.faction,
          rarity: card.rarity,
          converted_to_dust: dust
        });
      } else {
        await this.query(
          `INSERT INTO player_card_ownership (user_id, card_id, quantity, updated_at)
           VALUES ($1, $2, 1, NOW())
           ON CONFLICT (user_id, card_id) DO UPDATE SET
             quantity = player_card_ownership.quantity + 1,
             updated_at = NOW()`,
          [userId, card.id]
        );
        packResults.push({
          card_id: card.id,
          name: card.name,
          faction: card.faction,
          rarity: card.rarity,
          converted_to_dust: 0
        });
      }
    }

    if (duplicateDustConverted > 0) {
      await this.query(
        `UPDATE wallet_balances SET echo_dust = echo_dust + $2, updated_at = NOW() WHERE user_id = $1`,
        [userId, duplicateDustConverted]
      );
    }

    await this.query(
      `INSERT INTO pack_openings (id, user_id, pack_type, cards_granted)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [crypto.randomUUID(), userId, packMeta.id, JSON.stringify(packResults)]
    );

    const updatedProfile = await this.getFullPlayerProfile(userId);
    return {
      pack_id: packMeta.id,
      pack_cards: packResults,
      duplicate_dust_gained: duplicateDustConverted,
      wallet: updatedProfile.wallet
    };
  }

  async getShopHistory(userId) {
    const packsRes = await this.query(
      `SELECT id, pack_type, cards_granted, opened_at FROM pack_openings WHERE user_id = $1 ORDER BY opened_at DESC LIMIT 25`,
      [userId]
    );
    const txRes = await this.query(
      `SELECT id, currency, amount_delta, reason, created_at FROM currency_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 25`,
      [userId]
    );
    return {
      pack_openings: packsRes.rows,
      transactions: txRes.rows
    };
  }

  async craftOrDisenchantCard(userId, { card_id, action }) {
    const card = this.cardById.get(card_id);
    if (!card) {
      throw new Error(`Unknown card_id: ${card_id}`);
    }

    const ownRes = await this.query(
      `SELECT quantity FROM player_card_ownership WHERE user_id = $1 AND card_id = $2`,
      [userId, card_id]
    );
    const owned = Number(ownRes.rows[0]?.quantity || 0);
    const wRes = await this.query(
      `SELECT echo_dust FROM wallet_balances WHERE user_id = $1`,
      [userId]
    );
    const echoDust = Number(wRes.rows[0]?.echo_dust || 0);
    const maxCopies = COPY_LIMITS[card.rarity];

    if (action === 'disenchant') {
      if (owned <= 0) {
        throw new Error('You do not own any copies to disenchant');
      }
      const yieldDust = DISENCHANT_YIELDS[card.rarity];
      await this.query(
        `UPDATE player_card_ownership SET quantity = quantity - 1, updated_at = NOW() WHERE user_id = $1 AND card_id = $2`,
        [userId, card_id]
      );
      await this.query(
        `UPDATE wallet_balances SET echo_dust = echo_dust + $2, updated_at = NOW() WHERE user_id = $1`,
        [userId, yieldDust]
      );
      await this.query(
        `INSERT INTO crafting_transactions (id, user_id, action_type, card_id, echo_dust_delta)
         VALUES ($1, $2, 'disenchant', $3, $4)`,
        [crypto.randomUUID(), userId, card_id, yieldDust]
      );
    } else {
      const costDust = CRAFT_COSTS[card.rarity];
      if (owned >= maxCopies) {
        throw new Error(`Already own maximum playable copies (${maxCopies}) of ${card.name}`);
      }
      if (echoDust < costDust) {
        throw new Error(`Insufficient Echo Dust (requires ${costDust})`);
      }
      await this.query(
        `UPDATE wallet_balances SET echo_dust = echo_dust - $2, updated_at = NOW() WHERE user_id = $1`,
        [userId, costDust]
      );
      await this.query(
        `INSERT INTO player_card_ownership (user_id, card_id, quantity, updated_at)
         VALUES ($1, $2, 1, NOW())
         ON CONFLICT (user_id, card_id) DO UPDATE SET
           quantity = player_card_ownership.quantity + 1,
           updated_at = NOW()`,
        [userId, card_id]
      );
      await this.query(
        `INSERT INTO crafting_transactions (id, user_id, action_type, card_id, echo_dust_delta)
         VALUES ($1, $2, 'craft', $3, $4)`,
        [crypto.randomUUID(), userId, card_id, -costDust]
      );
      await this.advanceQuestObjective(userId, 'craft_card', 'any_card');
    }

    const updated = await this.getFullPlayerProfile(userId);
    return {
      card_id,
      new_quantity: updated.collection[card_id] || 0,
      wallet: updated.wallet
    };
  }

  async interactWithNpc(userId, npcId, interactionType = 'talk') {
    const npc = this.npcs.find((n) => n.id === npcId);
    if (!npc) {
      throw new Error(`Unknown NPC: ${npcId}`);
    }
    const relRes = await this.query(
      `SELECT score FROM npc_relationships WHERE user_id = $1 AND npc_id = $2`,
      [userId, npcId]
    );
    const oldScore = Number(relRes.rows[0]?.score ?? (npc.initial_relationship || 20));
    const gain = interactionType === 'gift' ? 8 : 3;
    const newScore = Math.min(100, oldScore + gain);
    const unlocked = newScore >= 40;

    await this.query(
      `INSERT INTO npc_relationships (user_id, npc_id, score, companion_unlocked, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, npc_id) DO UPDATE SET
         score = EXCLUDED.score,
         companion_unlocked = EXCLUDED.companion_unlocked,
         updated_at = NOW()`,
      [userId, npcId, newScore, unlocked]
    );

    await this.advanceQuestObjective(userId, 'talk_to_npc', npcId);
    await this.advanceQuestObjective(userId, 'visit_location', npc.home_location);

    const profile = await this.getFullPlayerProfile(userId);
    const tier = profile.relationships[npc.id]?.tier || 'Acquaintance';
    let dialogueLine = npc.dialogue.greeting;
    if (tier === 'Bonded' && npc.dialogue.bonded) {
      dialogueLine = npc.dialogue.bonded;
    } else if ((tier === 'Trusted' || tier === 'Bonded') && npc.dialogue.trusted) {
      dialogueLine = npc.dialogue.trusted;
    } else if (tier === 'Friendly' && npc.dialogue.friendly) {
      dialogueLine = npc.dialogue.friendly;
    }

    return {
      npc_id: npc.id,
      dialogue: dialogueLine,
      relationship: profile.relationships[npc.id],
      quests: profile.quests
    };
  }

  async advanceQuestObjective(userId, type, target) {
    for (const q of this.quests) {
      const pqRes = await this.query(
        `SELECT status, progress_json FROM player_quests WHERE user_id = $1 AND quest_id = $2`,
        [userId, q.id]
      );
      if (pqRes.rows.length === 0) continue;
      const row = pqRes.rows[0];
      if (row.status === 'completed') continue;

      const progress =
        typeof row.progress_json === 'object'
          ? { ...row.progress_json }
          : JSON.parse(row.progress_json || '{}');
      let changed = false;

      for (const obj of q.objectives) {
        if (
          obj.type === type &&
          (obj.target === target ||
            obj.target === 'any_40_card_deck' ||
            obj.target === 'any_duel' ||
            obj.target === 'any_card')
        ) {
          const cur = Number(progress[obj.id] || 0);
          const next = Math.min(obj.required, cur + 1);
          if (next !== cur) {
            progress[obj.id] = next;
            changed = true;
          }
        }
      }

      if (changed) {
        const allDone = q.objectives.every((obj) => (progress[obj.id] || 0) >= obj.required);
        const newStatus = allDone ? 'completed' : 'active';
        await this.query(
          `UPDATE player_quests SET status = $3::varchar, progress_json = $4::jsonb, claimed_at = CASE WHEN $3::varchar = 'completed' THEN NOW() ELSE claimed_at END
           WHERE user_id = $1 AND quest_id = $2`,
          [userId, q.id, newStatus, JSON.stringify(progress)]
        );
        if (allDone) {
          await this.query(
            `UPDATE wallet_balances SET crowns = crowns + $2, echo_dust = echo_dust + $3, updated_at = NOW() WHERE user_id = $1`,
            [userId, q.rewards.crowns || 0, q.rewards.echo_dust || 0]
          );
          await this.query(
            `UPDATE player_world_progress SET story_chapter = GREATEST(story_chapter, $2::int), updated_at = NOW() WHERE user_id = $1`,
            [userId, q.chapter + 1]
          );
        }
      }
    }
  }

  async recordMatchStart({ matchId, format, ruleVersion, seed, state }) {
    await this.query(
      `INSERT INTO matches (id, format, rule_version, seed, status, started_at)
       VALUES ($1, $2, $3, $4, 'in_progress', NOW())
       ON CONFLICT (id) DO NOTHING`,
      [matchId, format, ruleVersion || '1.0.0', seed]
    );
    await this.saveMatchSnapshot({
      matchId,
      turnNumber: state.global_turn || 1,
      state,
      checksum: 'initial'
    });
  }

  async saveMatchSnapshot({ matchId, turnNumber, state, checksum }) {
    await this.query(
      `INSERT INTO match_snapshots (match_id, turn_number, state_json, checksum)
       VALUES ($1, $2, $3::jsonb, $4)
       ON CONFLICT (match_id, turn_number) DO UPDATE SET
         state_json = EXCLUDED.state_json,
         checksum = EXCLUDED.checksum`,
      [matchId, turnNumber, JSON.stringify(state), String(checksum)]
    );
  }

  async recordMatchCompletion({ matchId, winnerSlot, finalChecksum, playerIds = [], npcId = null }) {
    await this.query(
      `UPDATE matches SET status = 'completed', winner_slot = $2::smallint, final_checksum = $3::varchar, completed_at = NOW()
       WHERE id = $1`,
      [matchId, winnerSlot, String(finalChecksum)]
    );

    const isTag2v2 = playerIds.length === 4;

    for (let slot = 0; slot < playerIds.length; slot++) {
      const uid = playerIds[slot];
      if (!uid) continue;
      const isWinner =
        winnerSlot !== null &&
        (isTag2v2 ? winnerSlot === slot % 2 : winnerSlot === slot);

      if (isWinner) {
        const npc = npcId ? this.npcs.find((n) => n.id === npcId) : null;
        const crownsGain = npc ? npc.rewards.crowns : isTag2v2 ? 95 : 75;
        const dustGain = npc ? npc.rewards.echo_dust : isTag2v2 ? 35 : 25;

        await this.query(
          `UPDATE wallet_balances SET crowns = crowns + $2, echo_dust = echo_dust + $3, updated_at = NOW() WHERE user_id = $1`,
          [uid, crownsGain, dustGain]
        );
        await this.query(
          `UPDATE player_profiles SET account_xp = account_xp + 120, account_level = 1 + ((account_xp + 120) / 500)::int WHERE user_id = $1`,
          [uid]
        );
        await this.query(
          `UPDATE rankings SET wins = wins + 1, rating = rating + 18.5 WHERE user_id = $1 AND format = 'standard_1v1'`,
          [uid]
        );
        if (npc) {
          await this.interactWithNpc(uid, npc.id, 'gift');
          await this.advanceQuestObjective(uid, 'win_duel', npc.id);
        }
        if (isTag2v2) {
          await this.advanceQuestObjective(uid, 'win_duel', 'tag_2v2');
        }
        await this.advanceQuestObjective(uid, 'win_duel', 'any_duel');
      } else if (winnerSlot !== null) {
        await this.query(
          `UPDATE rankings SET losses = losses + 1, rating = GREATEST(1000, rating - 14.0) WHERE user_id = $1 AND format = 'standard_1v1'`,
          [uid]
        );
      }
    }
  }
}
