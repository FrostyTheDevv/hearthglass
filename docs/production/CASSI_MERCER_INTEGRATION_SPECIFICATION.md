# Hearthglass — Cassi Mercer Integration Specification & Contracts

**Document Version:** 2.0.0  
**Status:** Integration-Ready Specification & Runtime Contract  
**Branch:** `feat/cards-world-content`  
**Governing Subsystems:** Godot Client (`apps/game-client`), API Backend (`services/api`), Battle Server (`services/battle-server`)

---

## 1. Overview & Objective

This specification provides the exact, schema-accurate integration contract for the **Cassi Mercer Playable Content Increment** (`content/staging/world/playable_content_increment.json`).

It serves as the formal handoff contract between:
1. **The GODOT Agent:** Client-side 3D world loading (`res://scenes/world/lumenport_hub.tscn`), spatial positioning, dialogue interaction via `POST /v1/npcs/interact`, and battle transitions to `tabletop_arena.tscn`.
2. **The MAIN Agent:** Server-side database seeding (`npc_definitions`, `quest_definitions`), server-authoritative objective progression (`services/api/src/db.mjs`), duel outcome verification, and atomic one-time reward issuance.
3. **The QA Agent & Coordinator:** End-to-end multi-agent integration verification, anti-exploit enforcement, and save/reload continuity validation.

---

## 2. GODOT Client Integration Contract (`apps/game-client`)

### 2.1 Explorable 3D World Scene & World Transform
- **Authoritative Scene:** `res://scenes/world/lumenport_hub.tscn` (script: `res://scripts/world/lumenport_hub.gd`).
- **Scene Note:** There is no separate `arrival_square.tscn`. Arrival Square is an architectural district building block within `lumenport_hub.tscn`.
- **World Transform & Coordinate Placement:**
  - **Arrival Square & Harbor Cafe Quay:** `Vector3(-12.0, 2.0, 10.0)` (District Mesh size: `Vector3(7, 4, 6)`, Color: `Color(0.24, 0.62, 0.56)`).
  - **Duelist Plaza Amphitheater:** `Vector3(0.0, 0.7, 0.0)` (District Mesh size: `Vector3(6, 1.4, 6)`, Color: `Color(0.45, 0.36, 0.68)`).
- **NPC Dynamic Spawning:**
  - Handled in `lumenport_hub.gd` via `_spawn_lumenport_npcs()`, which iterates over `GameState.npcs`.
  - When `npc_cassi_mercer` is present in `GameState.npcs`, she spawns with an interaction prompt triggered when the player's `CharacterBody3D` is within 3.0 units.

### 2.2 Authoritative Godot Compatibility Matrix

```
+------------------------------------+---------------------------------------+-------------------------------------------------------------+
| Component / Resource               | Subsystem / Path                      | Integration Status & Contract Role                          |
+------------------------------------+---------------------------------------+-------------------------------------------------------------+
| Explorable 3D City Scene           | res://scenes/world/lumenport_hub.tscn | Existing runtime resource (isometric camera, WASD, lighting)|
| Hub Controller Script              | res://scripts/world/lumenport_hub.gd  | Existing runtime resource (spawns GameState.npcs, HUD, duel)|
| Global State Autoload              | res://scripts/autoload/game_state.gd  | Existing runtime resource (holds profile, quests, npcs)     |
| 3D Duel Tabletop Arena             | res://scenes/battle/tabletop_arena.tscn| Existing runtime resource (standard 1v1 battle viewport)    |
| Content Fixture Increment          | content/staging/world/playable_...    | New content fixture introduced on this branch               |
| World NPCs Dataset (80)            | content/staging/world/world_npcs_80...| New content fixture introduced on this branch               |
| World Quests Dataset (120)         | content/staging/world/world_side_...  | New content fixture introduced on this branch               |
| Scene Addition: Cassi Spatial Node | res://scenes/world/lumenport_hub.tscn | Required scene addition: bind to Vector3(-12, 2.0, 10)      |
| Backend Route: NPC Interaction     | POST /v1/npcs/interact                | Existing published route in services/api/src/server.mjs     |
| Backend Progression Hooks          | services/api/src/db.mjs               | Existing database engine (advanceQuestObjective)            |
| Environmental Rule: Center Lane +1 | services/battle-server/src/lib.rs     | PENDING Rust engine; fallback to standard 1v1 Convergence   |
+------------------------------------+---------------------------------------+-------------------------------------------------------------+
```

### 2.3 Battle Encounter Launch & Environmental Fallback
- **Encounter Mode:** Standard 1v1 Convergence Duel against NPC Cassi Mercer.
- **Deck Profile:** `deck_glass_star_prism` (Legal 40-card starter deck from `content/cards/starter_decks.json`).
- **Environmental Rule Status:**
  - Special rule: `"Crystal Refraction: Center Lane +1 Health on summon"`.
  - Implementation status: `pending_rust_engine_implementation` (requires ambient lane modifier hook in `services/battle-server/src/lib.rs`).
  - **Graceful Fallback:** Godot battle client initiates the duel using standard 1v1 Convergence rules without crashing or blocking.

---

## 3. MAIN Backend Integration Contract (`services/api`)

### 3.1 Published Route & Payload Schemas
The backend exposes the standard NPC interaction endpoint in `services/api/src/server.mjs`:

```http
POST /v1/npcs/interact
Content-Type: application/json
Authorization: Bearer <session_token>
```

#### Request Payload Schema
```json
{
  "npc_id": "npc_cassi_mercer",
  "type": "talk"
}
```
- `npc_id` *(string, required)*: Permanent identifier of the NPC (`"npc_cassi_mercer"`).
- `type` *(string, optional)*: Interaction type: `"talk"` (default) or `"gift"`.

#### Response Payload Schema (HTTP 200 OK)
```json
{
  "npc_id": "npc_cassi_mercer",
  "dialogue": "Careful where you step on the wet flagstones! The harbor tide isn't just moving water today—the Glassborne leylines under the quay are humming at 440 megahertz.",
  "relationship": {
    "score": 18,
    "tier": "Acquaintance",
    "companion_unlocked": false
  },
  "quests": [
    {
      "id": "quest_playable_glass_survey",
      "status": "active",
      "progress": {
        "obj_speak_cassi": 1,
        "obj_survey_arrival": 1,
        "obj_duel_cassi": 0
      }
    }
  ]
}
```

### 3.2 Server-Side Schedule & Proximity Validation
- **NPC Schedule:**
  - `08:00–12:00`: `lumenport_arrival_square` (`Vector3(-12, 2.0, 10)`) — Calibrating theodolite.
  - `12:00–16:00`: `interior_harbor_cafe` — Chart cross-referencing.
  - `16:00–21:00`: `lumenport_duelist_plaza` (`Vector3(0, 0.7, 0)`) — Tactical sparring.
- **Server Proximity Check:**
  - Server confirms player coordinates match the NPC's active scheduled district. Interactions attempted outside schedule radius return `403 Forbidden`.

### 3.3 Server-Owned Relationship & Progression Engine
In `services/api/src/db.mjs` (`interactWithNpc`):
1. **Relationship Delta:**
   - `"talk"`: `+3` score.
   - `"gift"` / Duel Victory: `+8` score.
   - Score is capped at 100. When `score >= 40`, `companion_unlocked` is set to `true`.
   - Relationship Tiers: `Acquaintance` (<25), `Friendly` (25–49), `Trusted` (50–74), `Bonded` (75–100).
2. **Authoritative Objective Advancement:**
   Calling `interactWithNpc` triggers server-side progression hooks:
   - `await this.advanceQuestObjective(userId, 'talk_to_npc', 'npc_cassi_mercer');` -> Satisfies `obj_speak_cassi`.
   - `await this.advanceQuestObjective(userId, 'visit_location', 'lumenport_arrival_square');` -> Satisfies `obj_survey_arrival`.
3. **Duel Verification Hook:**
   When the player wins the duel against Cassi Mercer, the battle server records match completion in `db.recordMatchEnd` (line 1328):
   - `await this.interactWithNpc(uid, 'npc_cassi_mercer', 'gift');`
   - `await this.advanceQuestObjective(uid, 'win_duel', 'npc_cassi_mercer');` -> Satisfies `obj_duel_cassi`.

### 3.4 Database Seeding Specification
MAIN executes the following idempotent PostgreSQL migration:

```sql
-- 1. Register Cassi Mercer NPC Definition
INSERT INTO npc_definitions (id, region_id, name, title, home_location, deck_id, definition_json)
VALUES (
  'npc_cassi_mercer',
  'lumenport',
  'Cassi Mercer',
  'Glassborne Field Cartographer',
  'lumenport_arrival_square',
  'deck_glass_star_prism',
  '{"id": "npc_cassi_mercer", "name": "Cassi Mercer", "category": "scholar", "faction_affinity": "glassborne", "initial_relationship": 15, "dialogue": {"greeting": "Careful where you step on the wet flagstones! The harbor tide isn''t just moving water today—the Glassborne leylines under the quay are humming at 440 megahertz.", "friendly": "The theodolite readings are stabilizing nicely.", "trusted": "I trust your eye for leylines more than the Institute''s senior fellows.", "bonded": "Whenever you need a field cartographer by your side, my compass is yours."}}'::jsonb
) ON CONFLICT (id) DO UPDATE SET definition_json = EXCLUDED.definition_json;

-- 2. Register Quest Definition
INSERT INTO quest_definitions (id, chapter, title, definition_json)
VALUES (
  'quest_playable_glass_survey',
  1,
  'The Glass Cartographer''s Survey',
  '{
    "id": "quest_playable_glass_survey",
    "chapter": 1,
    "giver_npc_id": "npc_cassi_mercer",
    "rewards": { "crowns": 250, "echo_dust": 75, "xp_reward": 300, "bonus_card_id": "GLS-C-0004", "reputation_gain": 30 },
    "objectives": [
      { "id": "obj_speak_cassi", "type": "talk_to_npc", "target": "npc_cassi_mercer", "required": 1 },
      { "id": "obj_survey_arrival", "type": "visit_location", "target": "lumenport_arrival_square", "required": 1 },
      { "id": "obj_duel_cassi", "type": "win_duel", "target": "npc_cassi_mercer", "required": 1 }
    ]
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET definition_json = EXCLUDED.definition_json;
```

---

## 4. Anti-Exploit, Rewards & Idempotency Guarantees

### 4.1 Strict Ledger Separation
To prevent double-claiming or conflating repeatable sparring rewards with one-time story milestone rewards:
1. **Transaction A: Duel Payout Ledger (`tx_duel_npc_cassi_mercer`):**
   - Rewards: 100 Crowns, 30 Echo Dust, +10 Relationship.
   - Frequency: Repeatable sparring duel (governed by daily match limits).
2. **Transaction B: Quest Completion Ledger (`tx_quest_glass_survey_completion`):**
   - Rewards: 250 Crowns, 75 Echo Dust, 300 XP, Card `GLS-C-0004`, +30 Glassborne Reputation.
   - Frequency: **Strictly One-Time Only**.
   - Issued in an atomic database transaction only when all 3 objectives are verified.

### 4.2 Idempotency & Duplicate Claim Rejection
```sql
-- Atomic transition enforcing single-claim guarantee:
UPDATE player_quests
SET status = 'completed', claimed_at = NOW()
WHERE user_id = $1
  AND quest_id = 'quest_playable_glass_survey'
  AND status = 'active';

-- If 0 rows are updated, claim attempt was duplicate; returns HTTP 409 Conflict.
```

### 4.3 Standard HTTP Error Codes
- **`400 Bad Request`**: Missing required `npc_id`, unsupported `type` parameter, or malformed JSON.
- **`401 Unauthorized`**: Missing or invalid Bearer authentication token.
- **`403 Forbidden`**: Player does not meet prerequisites (Level 1, `quest_ch1_first_echo`), or attempted interaction outside scheduled location.
- **`404 Not Found`**: NPC ID not present in registered definitions (`Unknown NPC: ${npcId}`).
- **`409 Conflict`**: Duplicate quest reward claim attempt or concurrent modification collision.

---

## 5. Save/Reload Continuity

1. **State Persistence:**
   Player quest progress is stored in `player_quests.progress_json` (`{"obj_speak_cassi": 1, "obj_survey_arrival": 1, "obj_duel_cassi": 0}`).
2. **Session Restoration:**
   Upon login, `GET /v1/relationships` and `POST /v1/npcs/interact` return the exact server-authoritative state.
   The Godot client automatically renders the active or completed dialogue state based on server-returned quest status.

---

## 6. Runtime Boundaries & Documentation / Staging Fixture Disclosures

To prevent false assumptions regarding runtime deployment, all assets and mechanics are explicitly demarcated:

### 6.1 Documentation & Staging Fixtures (Pending Runtime Import)
1. **Database Seeding (`npc_definitions` & `quest_definitions`):**
   - The SQL migrations in Section 3.4 for `npc_cassi_mercer` and `quest_playable_glass_survey` are specification fixtures.
   - The production PostgreSQL database has not yet executed these migrations; seeding is owned by the MAIN backend agent.
2. **Client Scene Node Placement:**
   - The Arrival Square district mesh exists in `res://scenes/world/lumenport_hub.tscn` at `Vector3(-12.0, 2.0, 10.0)`.
   - The explicit interactable character node for Cassi Mercer is not hard-coded in the `.tscn` file; client dynamic spawning depends on `GameState.npcs` or dedicated scene node binding by the GODOT agent.
3. **Environmental Combat Rule ("Crystal Refraction"):**
   - The special rule `"Crystal Refraction: Center Lane +1 Health on summon"` is a narrative specification not yet implemented in `services/battle-server/src/lib.rs`.
   - Combat encounters with Cassi Mercer safely execute under standard 1v1 Convergence rules without crashing or blocking.
4. **World Staging Datasets (`content/staging/world/*`):**
   - Datasets `world_npcs_80_canonical.json`, `world_side_quests_120_canonical.json`, `world_dungeons_16_canonical.json`, `world_tournaments_8_canonical.json`, `world_companion_stories_24_canonical.json`, `world_campaign_12_chapters.json`, and `playable_content_increment.json` are staging fixtures isolated on branch `feat/cards-world-content`.
   - They are validated against schemas but not yet ingested into production runtime tables.

### 6.2 Active & Verified Runtime Implementations
1. **API Endpoint:** `POST /v1/npcs/interact` is published and active in `services/api/src/server.mjs`.
2. **Database Engine:** `db.interactWithNpc` and `db.advanceQuestObjective` hooks are active in `services/api/src/db.mjs`.
3. **Explorable 3D Hub Scene:** `res://scenes/world/lumenport_hub.tscn` and `res://scripts/world/lumenport_hub.gd` are active in `apps/game-client`.
4. **Combat Arena:** `res://scenes/battle/tabletop_arena.tscn` is active and functional.
5. **Encounter Deck:** `deck_glass_star_prism` is a legal 40-card deck in `content/cards/starter_decks.json`.
