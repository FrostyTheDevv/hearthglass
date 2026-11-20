# Hearthglass — World Content & Runtime Integration Contract

**Document Version:** 1.1.0  
**Status:** Ratified Implementation Contract  
**Branch:** `feat/cards-world-content`  
**Governing Subsystems:** Godot Client (`apps/game-client`), API Progression Server (`services/api`), Rust Battle Engine (`services/battle-server`)

---

## 1. Executive Summary & Purpose

This contract establishes the formal data specification, state machine, and server-authoritative progression rules governing all world content across Hearthglass:
- 12 Campaign Chapters (3 per region)
- 80 Named NPCs (20 per region)
- 120 Side Quests (30 per region)
- 16 Multi-Floor Dungeons (4 per region)
- 8 Regional & Grand Tournaments
- 24 Companion Narrative Arcs (8 Companions x 3 Tiers)
- 32 Exploration Secrets (8 per region)
- 20 Elite Bounty Encounters (5 per region)

This specification defines the explicit boundary between **Designed World Content** (staged datasets in `content/staging/world/`) and **Playable Runtime Increments** (authoritatively verified contracts implemented in `services/api` and `apps/game-client`).

---

## 2. World Content JSON Schema Specifications

### 2.1 Region & Location Schema

```json
{
  "region_id": "lumenport | verdant_expanse | ironreach | astral_archive",
  "tier": 1,
  "district_id": "string (unique)",
  "name": "string",
  "description": "string",
  "ambient_theme": "string (audio event)",
  "connected_districts": ["district_id"],
  "interiors": ["interior_id"],
  "fast_travel_unlocked": true,
  "coordinates": { "x": 0, "y": 0 }
}
```

**Region Progression Hierarchy (Strict Anti-Contradiction Rule):**
1. **Tier 1 — Lumenport** (Unlocked by default, Act 1, Chapters 1–3)
2. **Tier 2 — Verdant Expanse** (Requires Chapter 3 completion, Act 2, Chapters 4–6)
3. **Tier 3 — Ironreach** (Requires Chapter 6 completion, Act 3, Chapters 7–9)
4. **Tier 4 — Astral Archive** (Requires Chapter 9 completion, Act 4, Chapters 10–12)

*Constraint:* No quest, dungeon, or NPC in Tier $N$ may require a prerequisite from Tier $M > N$.

---

### 2.2 NPC Identity & Schedule Schema

```json
{
  "id": "string (unique, prefix: npc_)",
  "name": "string",
  "title": "string",
  "region_id": "string",
  "category": "major_story_character | merchant | duelist | scholar | craftsperson",
  "faction_affinity": "string (canonical faction)",
  "secondary_faction": "string (optional)",
  "duel_difficulty": "novice | intermediate | skilled | master",
  "deck_id": "string (must exist in starter_decks.json)",
  "home_location": "district_id | interior_id",
  "initial_relationship": 0,
  "can_recruit_companion": false,
  "companion_ai_profile": "string (optional)",
  "appearance": "string",
  "background": "string",
  "personality": ["string"],
  "schedule": [
    {
      "time": "HH:MM",
      "location": "district_id | interior_id",
      "activity": "string"
    }
  ],
  "relationship_milestones": {
    "acquaintance": 20,
    "friendly": 40,
    "trusted": 65,
    "bonded": 85
  },
  "rewards": {
    "crowns": 120,
    "echo_dust": 35,
    "relationship_gain": 8,
    "bonus_card_id": "string (canonical card ID)"
  },
  "dialogue": {
    "greeting": "string",
    "friendly": "string",
    "bonded": "string",
    "victory": "string",
    "defeat": "string"
  }
}
```

**Schedule Collision Invariant:**
No NPC may have multiple entries in `schedule` sharing the same `time` string with conflicting `location` targets.

---

### 2.3 Dialogue State & Branching Choice Schema

```json
{
  "dialogue_tree_id": "string",
  "npc_id": "string",
  "initial_node": "node_greeting",
  "nodes": {
    "node_id": {
      "speaker": "npc | player",
      "text": "string",
      "voice_cue": "string (optional)",
      "condition": {
        "min_reputation": 0,
        "required_quest_state": { "quest_id": "string", "status": "active | completed" },
        "has_card_id": "string (optional)"
      },
      "choices": [
        {
          "choice_id": "string",
          "text": "string",
          "target_node": "string",
          "action": {
            "type": "accept_quest | start_duel | trade | modify_relationship | advance_objective",
            "payload": { "target_id": "string", "delta": 0 }
          }
        }
      ]
    }
  }
}
```

---

### 2.4 Quest & Objective Schema

```json
{
  "id": "string (unique, prefix: sq_ or quest_)",
  "chapter": 1,
  "title": "string",
  "category": "main_campaign | faction_trial | companion_arc | investigation | bounty | tournament",
  "region_id": "string",
  "district_id": "string",
  "giver_npc_id": "string (must exist in NPCs)",
  "prerequisites": {
    "player_level": 1,
    "completed_quests": ["quest_id"],
    "reputation_faction": { "faction": "string", "min_points": 0 }
  },
  "description": "string",
  "objectives": [
    {
      "id": "string (unique within quest)",
      "type": "talk_to_npc | visit_location | win_duel | validate_legal_deck | craft_card | collect_item | reach_level | inspect_object",
      "target": "string (npc_id | district_id | deck_id | card_id | item_id)",
      "count": 1,
      "description": "string"
    }
  ],
  "rewards": {
    "crowns": 150,
    "echo_dust": 40,
    "xp_reward": 200,
    "bonus_card_id": "string (valid canonical card ID)",
    "reputation_gain": 25
  }
}
```

---

## 3. Supported Objective Types & Runtime Event Mapping

The progression system in `services/api/src/db.mjs` executes server-authoritative quest objective evaluation. The table below maps each supported objective type to the authoritative runtime event and data payload:

| Objective Type | Runtime Event Source | Authoritative API Hook | Target Resolution | Completion Validation |
| :--- | :--- | :--- | :--- | :--- |
| `talk_to_npc` | Dialogue interaction | `db.advanceQuestObjective(uid, 'talk_to_npc', npcId)` | Target matches `npc_id` | Server confirms NPC interaction session |
| `visit_location` | District/Interior transition | `db.advanceQuestObjective(uid, 'visit_location', locId)` | Target matches `district_id` or `interior_id` | Server verifies player movement coordinates |
| `win_duel` | Battle server match conclusion | `db.advanceQuestObjective(uid, 'win_duel', opponentId)` | Target matches `npc_id`, `deck_id`, or wildcard `any_duel` | Server receives signed match result from `battle-server` |
| `validate_legal_deck` | Deck builder save action | `db.advanceQuestObjective(uid, 'validate_legal_deck', 'any_40_card_deck')` | Exactly 40 cards, valid deck AST | Server checks 40 legal cards in deck |
| `craft_card` | Resonance card crafting | `db.advanceQuestObjective(uid, 'craft_card', 'any_card')` | Target matches `card_id` or `any_card` | Server validates Echo Dust deduction transaction |
| `collect_item` | World container / drop | `db.advanceQuestObjective(uid, 'collect_item', itemId)` | Target matches inventory `item_id` | Server inventory transaction recorded |
| `reach_level` | XP progression reward | `db.advanceQuestObjective(uid, 'reach_level', levelString)` | Target numeric level threshold | Server verifies `player_world_progress.level` |
| `inspect_object` | World exploration secret | `db.advanceQuestObjective(uid, 'inspect_object', secretId)` | Target matches `secret_id` | Server records puzzle resolution flag |

*Contract Invariant:* Any objective type outside of the 8 enumerated above will fail closed during content validation and will not be accepted into production.

---

## 4. Server-Authoritative Progression Rules

1. **Anti-Duplication & Idempotency:**
   - Every quest objective increment requires an authenticated `userId`.
   - Quest rewards (`crowns`, `echo_dust`, `bonus_card_id`) are disbursed in a single atomic SQL transaction upon the final objective transitioning to completed status.
   - Re-triggering completed quest objectives is a no-op (`if (row.status === 'completed') continue;`).

2. **Deck & Card Referential Integrity:**
   - All NPC duel encounters must reference a deck present in `content/cards/starter_decks.json`.
   - Every starter deck must contain exactly 40 cards, all resolvable in `content/cards/foundations_v1.json`.
   - All quest rewards granting cards must specify a canonical card ID present in `content/cards/foundations_v1.json`.

3. **Topological Dependency Ordering:**
   - Mandatory quest prerequisites cannot contain cycles ($A \to B \to A$).
   - Progression through campaign chapters is strictly linear ($1 \to 2 \to \dots \to 12$).

---

## 5. Preservation & Continuity of Canonical NPCs

The world content expansion strictly preserves all 16 canonical characters originally defined in Lumenport:

| Canonical ID | Canonical Name | Title | Role / Continuity Note |
| :--- | :--- | :--- | :--- |
| `npc_lyra_vane` | Lyra Vane | Glassborne Archivist & Rival Duelist | Retains Institute presence, Refraction deck, and Act 1 Plaza duel role |
| `npc_kaelen_forge` | Kaelen Emberforge | Emberclad Blacksmith & Street Duelist | Tutorial duel partner, Forge master, Overheat deck |
| `npc_master_vance` | Master Artificer Vance | Resonance Emporium Proprietor | Card shop keeper, crafting tutor, Chapter 2 quest giver |
| `npc_soren_whisperleaf` | Soren of Whisperleaf | Accord Envoy & Starter Deck Herald | Harbor welcome envoy, starter deck distributor |
| `npc_captain_nerissa` | Captain Nerissa Wake | Harbor Watch Captain & Tidebound Master | Harbor Breakwater duel, Tidebound Current teacher |
| `npc_vesper_noctis` | Vesper of the Crescent Mask | Nocturne Informant & Lantern Row Duelist | Residential district twilight duel, stealth/ambush archetype |
| `npc_astromancer_celeste`| Astromancer Celeste Oryn| Observational Scholar & Starweave Diviner | Observatory Conjunction duel, Starweave Alignment tutor |
| `npc_morwen_ossuary` | Keeper Morwen Vale | Gravewild Sepulcher Custodian | Ossuary guardian, Entomb mechanic guide |
| `npc_marshal_corin` | Grand Marshal Corin Thorne | Grand Tournament Administrator | Tournament Hall registrar, Chapter 3 & 4 quest giver |
| `npc_mira_solis` | Mira Solis | Harbor Tavern Barkeep | Information hub, Harbor Café social encounter |
| `npc_instructor_hale` | Garrick Hale | Tactical Training Instructor | Duelist Plaza training facility combat evaluator |
| `npc_eluned_glass` | Eluned Prismwright | Senior Optical Craftsman | Mirror Spire calibration workshop artisan |
| `npc_toma_wick` | Toma Wick | Lantern Row Caretaker | Residential loft supervisor |
| `npc_brynja_slagheart`| Brynja Slagheart | Ironreach Smelter Emissary | Industrial liaison visiting Lumenport market |
| `npc_brother_cassian` | Cassian Bell | Choir Campanile Deacon | Resonance bell ringer, Iron Choir representative |
| `npc_sylvi_thorn` | Sylvi Thornweaver | Verdant Expanse Herbalist | Botanical trader in Central Card Market |

All staged records build upon these characters without overwriting or contradicting their established backgrounds, faction affiliations, or locations.
