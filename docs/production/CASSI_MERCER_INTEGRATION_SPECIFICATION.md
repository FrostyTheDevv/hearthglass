# Hearthglass — Cassi Mercer Target Integration Specification & Architecture

**Document Version:** 2.1.0  
**Status:** Target Design Specification & Integration Contract (Proposed / Not Implemented in Runtime)  
**Branch:** `feat/cards-world-content`  
**Governing Subsystems:** Godot Client (`apps/game-client`), API Backend (`services/api`), Battle Server (`services/battle-server`)

---

## 1. Overview & Architectural Boundaries

This specification defines the proposed handoff contract for the **Cassi Mercer Playable Content Increment** (`content/staging/world/playable_content_increment.json`).

> [!IMPORTANT]
> **Implementation Status Disclosure:**
> Neither NPC Cassi Mercer (`npc_cassi_mercer`) nor the quest "The Glass Cartographer's Survey" (`quest_playable_glass_survey`) are implemented or active in runtime.
> - The API server currently loads NPCs exclusively from `content/npcs/lumenport_npcs.json` and quests exclusively from `content/quests/act1_quests.json`.
> - Staging content in `content/staging/` is not imported, seeded, or loaded by the active backend.
> - This document explicitly distinguishes **Current Backend Facts** from **Proposed Architecture & Backend Dependencies**.

---

## 2. Subsystem Facts vs. Requirements Matrix

```
+------------------------------------+---------------------------------------+-------------------+-------------------------------------------------------------+
| Component / Mechanism              | Subsystem / Path                      | Classification    | Architectural Status & Behavior                             |
+------------------------------------+---------------------------------------+-------------------+-------------------------------------------------------------+
| Explorable 3D City Scene           | res://scenes/world/lumenport_hub.tscn | Current Fact      | Active runtime resource (isometric camera, WASD movement)   |
| Hub Controller Script              | res://scripts/world/lumenport_hub.gd  | Current Fact      | Active runtime resource (spawns GameState.npcs, HUD, duels) |
| Arrival Square District            | res://scenes/world/lumenport_hub.tscn | Current Fact      | Architectural district mesh at Vector3(-12, 2.0, 10); no    |
|                                    |                                       |                   | separate arrival_square.tscn file exists                    |
| Published NPC Endpoint             | POST /v1/npcs/interact                | Current Fact      | Active route; accepts ONLY npc_id and type (talk/gift)      |
| Dialogue Choice API                | POST /v1/npcs/interact                | Absent (Dependency)| No dialogue-choice API exists; choice_id is NOT supported   |
| Schedule / Proximity Checks        | services/api/src/server.mjs           | Absent (Dependency)| Completely absent; server does not check player position    |
| World Movement Endpoint            | POST /v1/world/move                   | Current Fact      | Validates connected locations; completely separate endpoint |
| Visit Objective Verification       | services/api/src/db.mjs               | Current Fact      | Unconditionally advances npc.home_location naively on talk; |
|                                    |                                       |                   | does NOT verify player location via /v1/world/move          |
| Canonical Server Datasets          | content/npcs/lumenport_npcs.json      | Current Fact      | Active backend data source; Cassi Mercer is NOT present     |
|                                    | content/quests/act1_quests.json       | Current Fact      | Active backend data source; Cassi quest is NOT present      |
| Staged World Content               | content/staging/world/*               | Proposed Fixture  | Staged datasets on PR #3 branch; not seeded into runtime    |
| Scene Node: Cassi Mercer           | res://scenes/world/lumenport_hub.tscn | Proposed Addition | Spatial node binding required from GODOT agent              |
| Secure Objective / Reward Flow     | services/api/src/db.mjs               | Backend Dependency| Atomic single-claim ledger transaction required from MAIN   |
| Environmental Rule: Center Lane +1 | services/battle-server/src/lib.rs     | Proposed Mechanic | Pending Rust engine; fallback to standard 1v1 Convergence   |
+------------------------------------+---------------------------------------+-------------------+-------------------------------------------------------------+
```

---

## 3. Backend Integration Reality vs. Proposed Contracts (`services/api`)

### 3.1 Current Backend Reality (Verified Facts)

1. **Active Endpoint Contract:**
   - Endpoint: `POST /v1/npcs/interact` in `services/api/src/server.mjs:1108-1113`.
   - Accepted Payload:
     ```json
     {
       "npc_id": "string (required)",
       "type": "talk | gift (optional, defaults to talk)"
     }
     ```
2. **Absence of Dialogue Choice API:**
   - **Fact:** No dialogue-choice API exists. The endpoint does not accept `choice_id` or evaluate dialogue tree branches.
   - Passing `choice_id` to `POST /v1/npcs/interact` is ignored by the backend.
3. **Absence of Schedule and Proximity Enforcement:**
   - **Fact:** The server performs no position, distance, district, or time-of-day checks during `POST /v1/npcs/interact`.
   - Any client can call `/v1/npcs/interact` regardless of player coordinates.
4. **Separation of Movement and Visit Objectives:**
   - **Fact:** `POST /v1/world/move` in `services/api/src/server.mjs:975-996` validates connected districts and interiors, but operates completely independently of NPC interactions.
   - When `interactWithNpc` runs in `services/api/src/db.mjs:1192`, it naively executes:
     ```javascript
     await this.advanceQuestObjective(userId, 'visit_location', npc.home_location);
     ```
     This advancement is triggered solely by the talk interaction, **not** by a server-verified location visit.
5. **Runtime Data Sources:**
   - In `services/api/src/db.mjs:124-128`, the backend reads:
     - `content/npcs/lumenport_npcs.json`
     - `content/quests/act1_quests.json`
   - Neither file contains Cassi Mercer (`npc_cassi_mercer`) or the quest `quest_playable_glass_survey`. Calling `/v1/npcs/interact` with `npc_cassi_mercer` on the current merged backend fails with `Unknown NPC: npc_cassi_mercer`.

---

### 3.2 Proposed Dialogue & Interaction Specifications (Backend Dependencies)

The following schemas represent the **proposed design specifications** submitted for future MAIN agent implementation:

#### Proposed Request Payload (Target Requirement)
```json
{
  "npc_id": "npc_cassi_mercer",
  "type": "talk",
  "choice_id": "choice_survey_accept"
}
```
*(Note: `choice_id` is a proposed requirement; it is not supported in the active backend.)*

#### Proposed Response Payload (Target Requirement Example)
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
        "obj_survey_arrival": 0,
        "obj_duel_cassi": 0
      }
    }
  ]
}
```

---

### 3.3 Proposed Database Seeding Migration (Specification Fixture)

The following PostgreSQL migration represents a **proposed specification fixture** awaiting execution by the MAIN backend agent:

```sql
-- PROPOSED FIXTURE: Pending execution by MAIN agent
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

## 4. GODOT Client Integration Contract (`apps/game-client`)

### 4.1 3D World Scene & District Placement (Verified Facts)
- **Authoritative Scene:** `res://scenes/world/lumenport_hub.tscn` (script: `res://scripts/world/lumenport_hub.gd`).
- **Scene Note:** There is no separate `arrival_square.tscn`. Arrival Square is an architectural district building block within `lumenport_hub.tscn`.
- **District Transform Coordinates:**
  - **Arrival Square & Harbor Cafe Quay:** `Vector3(-12.0, 2.0, 10.0)` (District Mesh size: `Vector3(7, 4, 6)`).
  - **Duelist Plaza Amphitheater:** `Vector3(0.0, 0.7, 0.0)` (District Mesh size: `Vector3(6, 1.4, 6)`).

### 4.2 Spawning & Client Requirements
- Dynamic NPC spawning in `lumenport_hub.gd` iterates over `GameState.npcs`.
- **Client Fact:** Cassi Mercer does not appear in the client unless present in `GameState.npcs` or instantiated directly by the GODOT agent.
- **Client Dependency:** A dialogue choice selection UI is not implemented in the client; interaction currently displays single greeting/tier strings returned from `/v1/npcs/interact`.

### 4.3 Combat Encounter & Environmental Fallback
- **Encounter Mode:** Standard 1v1 Convergence Duel against NPC Cassi Mercer.
- **Encounter Deck:** `deck_glass_star_prism` (Legal 40-card starter deck from `content/cards/starter_decks.json`).
- **Environmental Rule Status:**
  - Proposed rule: `"Crystal Refraction: Center Lane +1 Health on summon"`.
  - Implementation status: Pending Rust battle engine ambient lane modifier hook in `services/battle-server/src/lib.rs`.
  - **Graceful Fallback:** The duel initiates using standard 1v1 Convergence rules without crashing or blocking.

---

## 5. Anti-Exploit, Rewards & Idempotency Guarantees (Proposed Requirements)

The following ledger models and idempotency guarantees represent **proposed architectural requirements** for MAIN backend integration, not active runtime behavior:

### 5.1 Proposed Ledger Separation
1. **Transaction A: Proposed Duel Payout Ledger (`tx_duel_npc_cassi_mercer`):**
   - Proposed Rewards: 100 Crowns, 30 Echo Dust, +10 Relationship.
   - Frequency: Repeatable sparring duel (governed by daily match limits).
2. **Transaction B: Proposed Quest Completion Ledger (`tx_quest_glass_survey_completion`):**
   - Proposed Rewards: 250 Crowns, 75 Echo Dust, 300 XP, Card `GLS-C-0004`, +30 Glassborne Reputation.
   - Frequency: **Strictly One-Time Only**.
   - Issued in an atomic database transaction only when all 3 objectives are verified.

### 5.2 Proposed Atomic Single-Claim Query Example
```sql
-- PROPOSED REQUIREMENT: Enforces single-claim guarantee upon completion
UPDATE player_quests
SET status = 'completed', claimed_at = NOW()
WHERE user_id = $1
  AND quest_id = 'quest_playable_glass_survey'
  AND status = 'active';

-- If 0 rows updated, returns HTTP 409 Conflict.
```

---

## 6. Comprehensive Implementation Boundaries & Disclosure Summary

| Feature / Artifact | Current Runtime Status | Governing Agent | Description / Caveat |
| :--- | :--- | :--- | :--- |
| **`POST /v1/npcs/interact`** | **Active Runtime** | MAIN | Accepts `npc_id` and `type` (`talk`/`gift`). Does not accept `choice_id`. |
| **Dialogue Choice API** | **Absent / Proposed** | MAIN | No endpoint exists for dialogue choice branching. |
| **Schedule / Proximity Checking** | **Absent / Proposed** | MAIN | Backend does not check player coordinates or schedules during NPC interaction. |
| **`POST /v1/world/move`** | **Active Runtime** | MAIN | Validates connected location movement; separate from NPC interaction. |
| **Visit Objective Verification** | **Naive Runtime** | MAIN | `interactWithNpc` naively advances `npc.home_location`; does not verify real visits. |
| **Cassi Mercer NPC Data** | **Staging Only** | CARDS / MAIN | Exists in `content/staging/`; not in canonical `lumenport_npcs.json` or database. |
| **Cassi Mercer Quest Data** | **Staging Only** | CARDS / MAIN | Exists in `content/staging/`; not in canonical `act1_quests.json` or database. |
| **Lumenport 3D Hub Scene** | **Active Runtime** | GODOT | `lumenport_hub.tscn` contains Arrival Square district at `Vector3(-12, 2.0, 10)`. |
| **Cassi Mercer 3D Spatial Node** | **Proposed Addition**| GODOT | Not committed in `lumenport_hub.tscn`; dynamic spawn requires `GameState.npcs`. |
| **Crystal Refraction Env Rule** | **Proposed Mechanic**| RUST / MAIN | Not implemented in battle engine; falls back safely to standard 1v1 Convergence. |
| **Staged World Datasets (80/120/16/8)** | **Staging Only** | CARDS / MAIN | Staged fixtures on PR #3 branch; awaiting runtime table migration by MAIN. |
