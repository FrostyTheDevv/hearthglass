# Hearthglass — Cassi Mercer Integration Specification & Contracts

**Document Version:** 1.0.0  
**Status:** Integration-Ready Specification  
**Branch:** `feat/cards-world-content`  
**Governing Subsystems:** Godot Client (`apps/game-client`), API Backend (`services/api`), Battle Server (`services/battle-server`)

---

## 1. Overview & Objective

This specification provides the exact, non-destructive integration requirements for the **Cassi Mercer Playable Content Increment** (`content/staging/world/playable_content_increment.json`).

It serves as the formal handoff contract for:
1. **The GODOT Agent:** Client-side data loading, scene node binding, dialogue UI interaction, and battle launch.
2. **The MAIN Agent:** Server-side database seeding, objective verification, duel result authorization, and atomic reward issuance.
3. **The QA Agent & Coordinator:** Multi-stage integration validation, anti-exploit verification, and save/reload continuity.

---

## 2. GODOT Client Integration Contract (`apps/game-client`)

### 2.1 Asset & Data Loading
- **Fixture Source:** `content/staging/world/playable_content_increment.json` (or merged runtime location `content/npcs/lumenport_npcs.json` and `content/quests/act1_quests.json`).
- **Scene Location:** `res://scenes/world/districts/arrival_square.tscn`
- **Node Identifier:** `CassiMercerNPC` (extends `InteractableNPC`)
- **World Transform:** `x: 275, y: 550` (Arrival Square Pier Quay)
- **Schedule Routing:**
  - `08:00–12:00`: Arrival Square Quay (calibrating theodolite)
  - `12:00–16:00`: Interior Harbor Café (chart cross-referencing)
  - `16:00–21:00`: Duelist Plaza (tactical sparring)

### 2.2 Client-Side Dialogue Protocol
1. **Trigger:** Player interacts with `CassiMercerNPC` when within interaction radius (50 units).
2. **Display:** Godot `DialogueBox` renders current dialogue node text and interactive choice buttons.
3. **Choice Selection:**
   - Client sends chosen `choice_id` to server:
     ```http
     POST /api/world/dialogue/choose
     Content-Type: application/json
     Authorization: Bearer <session_token>

     {
       "dialogue_tree_id": "dt_cassi_mercer_survey",
       "npc_id": "npc_cassi_mercer",
       "choice_id": "choice_expedition"
     }
     ```
   - Client **never** calculates or applies rewards, wallet modifications, or quest flags locally.
   - Server returns the verified next dialogue node and updated quest status:
     ```json
     {
       "next_node_id": "node_expedition_brief",
       "dialogue": { "speaker": "npc_cassi_mercer", "text": "..." },
       "active_quests": [...]
     }
     ```

### 2.3 Battle Encounter Launch
- **Encounter Mode:** Standard 1v1 Convergence Duel against NPC.
- **Deck Profile:** `deck_glass_star_prism` (Legal 40-card starter deck from `content/cards/starter_decks.json`).
- **Environmental Rule Status:**
  - The special rule `"Crystal Refraction: Center Lane +1 Health on summon"` is flagged as `pending_rust_engine_implementation`.
  - Godot battle client initiates the duel using standard 1v1 rules without crashing or blocking.

---

## 3. MAIN Backend Integration Contract (`services/api`)

### 3.1 Database Seeding Specification
Upon integration, MAIN will execute the following idempotent migration into PostgreSQL:

```sql
-- 1. Register NPC Definition
INSERT INTO npc_definitions (id, region_id, name, title, home_location, deck_id, definition_json)
VALUES (
  'npc_cassi_mercer',
  'lumenport',
  'Cassi Mercer',
  'Glassborne Field Cartographer',
  'lumenport_arrival_square',
  'deck_glass_star_prism',
  '{"id": "npc_cassi_mercer", "name": "Cassi Mercer", "category": "scholar", "faction_affinity": "glassborne"}'::jsonb
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
    "rewards": { "crowns": 250, "echo_dust": 75, "bonus_card_id": "GLS-C-0004", "reputation_gain": 30 },
    "objectives": [
      { "id": "obj_speak_cassi", "type": "talk_to_npc", "target": "npc_cassi_mercer", "required": 1 },
      { "id": "obj_survey_arrival", "type": "visit_location", "target": "lumenport_arrival_square", "required": 1 },
      { "id": "obj_duel_cassi", "type": "win_duel", "target": "npc_cassi_mercer", "required": 1 }
    ]
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET definition_json = EXCLUDED.definition_json;
```

### 3.2 Server-Authoritative Progression Verification
The backend server (`services/api/src/db.mjs`) evaluates progress authoritatively across the three objectives:

1. **Objective 1 (`obj_speak_cassi`):**
   - Verified during `POST /api/world/dialogue/choose` when player selects `choice_confirm_start`.
   - Hook: `await db.advanceQuestObjective(userId, 'talk_to_npc', 'npc_cassi_mercer')`.
2. **Objective 2 (`obj_survey_arrival`):**
   - Verified when player enters Arrival Square trigger zone.
   - Hook: `await db.advanceQuestObjective(userId, 'visit_location', 'lumenport_arrival_square')`.
3. **Objective 3 (`obj_duel_cassi`):**
   - Verified only upon receiving a signed match victory event from `hearthglass-battle-server` for player vs. `npc_cassi_mercer`.
   - Hook: `await db.advanceQuestObjective(userId, 'win_duel', 'npc_cassi_mercer')`.

---

## 4. Anti-Exploit & Reward Security Rules

### 4.1 Strict Separation of Duel vs. Quest Payouts
To prevent accidental duplicate payouts or double-claiming:
1. **Transaction A: Duel Completion Ledger (`tx_duel_npc_cassi_mercer`):**
   - Payout: 100 Crowns, 30 Echo Dust, +10 Relationship.
   - Frequency: Repeatable sparring payout (governed by daily economy limits).
2. **Transaction B: Quest Completion Ledger (`tx_quest_glass_survey_completion`):**
   - Payout: 250 Crowns, 75 Echo Dust, 300 XP, Card `GLS-C-0004`, +30 Glassborne Reputation.
   - Frequency: **Strictly One-Time Only**.
   - Issued in an atomic database transaction only when all 3 objectives reach completed state.

### 4.2 Idempotency & Duplicate Claim Rejection
```sql
-- Atomic transition enforcing single-claim guarantee:
UPDATE player_quests
SET status = 'completed', claimed_at = NOW()
WHERE user_id = $1
  AND quest_id = 'quest_playable_glass_survey'
  AND status = 'active';

-- If 0 rows are updated, the claim attempt was duplicate or invalid; return HTTP 409 Conflict.
```

### 4.3 Client Tampering Immunity
- Any client attempting to forge objective completion or inject arbitrary reward amounts will be rejected:
  - All reward values are loaded from `quest_definitions` on the server.
  - Client parameter inputs are limited to `{ choice_id }` or `{ command }`.

---

## 5. Save/Reload Continuity

1. **State Persistence:**
   - Player quest progress is stored in `player_quests` (`progress_json` storing `{ "obj_speak_cassi": 1, "obj_survey_arrival": 1, "obj_duel_cassi": 0 }`).
2. **Session Restoration:**
   - Upon logging in or switching devices, `GET /api/user/profile` delivers the exact server-authoritative quest state.
   - The Godot client inspects `player_quests['quest_playable_glass_survey']` and automatically selects `node_quest_active` if in progress, or `node_completed` if finished.
