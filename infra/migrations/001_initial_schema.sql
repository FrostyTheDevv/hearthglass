-- Project Hearthglass — Canonical Relational Database Schema (PostgreSQL 16+)
-- Covers Section 21: Accounts, Collections, World Progression, NPC Systems,
-- Competitive Systems, Social Systems, Economy, and Administration.

BEGIN;

-- ============================================================================
-- 1. ACCOUNTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authentication_identities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL DEFAULT 'password',
    password_hash TEXT NOT NULL,
    last_login_at TIMESTAMPTZ,
    UNIQUE (user_id, provider)
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    ui_scale NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    animation_mode VARCHAR(32) NOT NULL DEFAULT 'full',
    reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
    reduced_flashing BOOLEAN NOT NULL DEFAULT FALSE,
    colorblind_mode VARCHAR(32) NOT NULL DEFAULT 'none',
    high_contrast BOOLEAN NOT NULL DEFAULT FALSE,
    master_volume SMALLINT NOT NULL DEFAULT 100,
    music_volume SMALLINT NOT NULL DEFAULT 80,
    effects_volume SMALLINT NOT NULL DEFAULT 90
);

CREATE TABLE IF NOT EXISTS player_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    account_level INTEGER NOT NULL DEFAULT 1,
    account_xp BIGINT NOT NULL DEFAULT 0,
    active_title VARCHAR(64) NOT NULL DEFAULT 'Lumenport Newcomer',
    privacy_mode VARCHAR(32) NOT NULL DEFAULT 'public',
    allow_duel_invites BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS player_characters (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    character_name VARCHAR(64) NOT NULL,
    appearance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    current_region VARCHAR(64) NOT NULL DEFAULT 'lumenport',
    current_district VARCHAR(64) NOT NULL DEFAULT 'lumenport_arrival_square',
    pos_x NUMERIC(8,2) NOT NULL DEFAULT 0,
    pos_y NUMERIC(8,2) NOT NULL DEFAULT 0,
    pos_z NUMERIC(8,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_entitlements (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    entitlement_key VARCHAR(128) NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, entitlement_key)
);

-- ============================================================================
-- 2. COLLECTIONS & DECKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS card_definitions (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    card_type VARCHAR(32) NOT NULL,
    faction VARCHAR(32) NOT NULL,
    rarity VARCHAR(32) NOT NULL,
    release_set VARCHAR(64) NOT NULL DEFAULT 'foundations'
);

CREATE TABLE IF NOT EXISTS card_versions (
    card_id VARCHAR(32) NOT NULL REFERENCES card_definitions(id) ON DELETE CASCADE,
    revision INTEGER NOT NULL,
    balance_version VARCHAR(64) NOT NULL,
    definition_json JSONB NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (card_id, revision)
);

CREATE TABLE IF NOT EXISTS player_card_ownership (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id VARCHAR(32) NOT NULL REFERENCES card_definitions(id),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, card_id)
);

CREATE TABLE IF NOT EXISTS decks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(96) NOT NULL,
    factions JSONB NOT NULL DEFAULT '[]'::jsonb,
    format VARCHAR(32) NOT NULL DEFAULT 'standard_1v1',
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    revision INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deck_cards (
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_id VARCHAR(32) NOT NULL REFERENCES card_definitions(id),
    quantity SMALLINT NOT NULL CHECK (quantity BETWEEN 1 AND 3),
    PRIMARY KEY (deck_id, card_id)
);

CREATE TABLE IF NOT EXISTS deck_revisions (
    id UUID PRIMARY KEY,
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    revision INTEGER NOT NULL,
    cards_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crafting_transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(32) NOT NULL,
    card_id VARCHAR(32) NOT NULL REFERENCES card_definitions(id),
    echo_dust_delta INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pack_openings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pack_type VARCHAR(64) NOT NULL,
    cards_granted JSONB NOT NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. WORLD PROGRESSION & HOUSING
-- ============================================================================
CREATE TABLE IF NOT EXISTS player_world_progress (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    story_chapter SMALLINT NOT NULL DEFAULT 1,
    in_game_minutes INTEGER NOT NULL DEFAULT 540,
    current_weather VARCHAR(32) NOT NULL DEFAULT 'clear',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discovered_locations (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id VARCHAR(96) NOT NULL,
    fast_travel_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, location_id)
);

CREATE TABLE IF NOT EXISTS quest_definitions (
    id VARCHAR(96) PRIMARY KEY,
    chapter SMALLINT NOT NULL,
    title VARCHAR(160) NOT NULL,
    definition_json JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS player_quests (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id VARCHAR(96) NOT NULL REFERENCES quest_definitions(id),
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    progress_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    claimed_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, quest_id)
);

CREATE TABLE IF NOT EXISTS regional_reputation (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    region_id VARCHAR(64) NOT NULL,
    reputation_points INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, region_id)
);

CREATE TABLE IF NOT EXISTS player_housing (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    room_theme VARCHAR(64) NOT NULL DEFAULT 'lumenport_harbor_loft',
    layout_json JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- ============================================================================
-- 4. NPC SYSTEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS npc_definitions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    faction_affinity VARCHAR(32) NOT NULL,
    profile_json JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS npc_relationships (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    npc_id VARCHAR(64) NOT NULL REFERENCES npc_definitions(id),
    score SMALLINT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    companion_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, npc_id)
);

-- ============================================================================
-- 5. COMPETITIVE SYSTEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY,
    format VARCHAR(32) NOT NULL,
    rule_version VARCHAR(32) NOT NULL,
    seed BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL,
    winner_slot SMALLINT,
    final_checksum VARCHAR(32),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS match_snapshots (
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    turn_number INTEGER NOT NULL,
    state_json JSONB NOT NULL,
    checksum VARCHAR(32) NOT NULL,
    PRIMARY KEY (match_id, turn_number)
);

CREATE TABLE IF NOT EXISTS rankings (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    season_id VARCHAR(32) NOT NULL,
    format VARCHAR(32) NOT NULL,
    rating NUMERIC(7,2) NOT NULL DEFAULT 1500.00,
    rating_deviation NUMERIC(6,2) NOT NULL DEFAULT 350.00,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, season_id, format)
);

-- ============================================================================
-- 6. SOCIAL, ECONOMY & ADMINISTRATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS wallet_balances (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    crowns BIGINT NOT NULL DEFAULT 500 CHECK (crowns >= 0),
    echo_dust BIGINT NOT NULL DEFAULT 150 CHECK (echo_dust >= 0),
    sigils BIGINT NOT NULL DEFAULT 0 CHECK (sigils >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS currency_transactions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    currency VARCHAR(32) NOT NULL,
    amount_delta BIGINT NOT NULL,
    reason VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS friendships (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'accepted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, friend_user_id)
);

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY,
    actor_id UUID,
    category VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
