# Technical Architecture & Roadmap Status

## 1. Authoritative Stack Implemented (Phases 0–3 Vertical Slice Foundation)
- **Rust Authoritative Battle Engine (`services/battle-server`):** Deterministic SplitMix64 PRNG, FNV-1a 64-bit state checksums, declarative Effect AST execution, legal action generator, 40-card deck validator, and heuristic NPC AI (`NpcAi`).
- **Canonical Content Bundle (`content/cards/foundations_v1.json`):** 72 distinct Phase-1 cards (8 per each of the 8 major factions + 8 Neutral cards), 4 legal 40-card starter decks (`content/cards/starter_decks.json`), 4 scheduled Lumenport NPCs (`content/npcs/lumenport_npcs.json`), and Act I campaign quests (`content/quests/act1_quests.json`).
- **Node/TypeScript Backend Service (`services/api`):** Versioned `/v1/*` REST API for authentication, account settings, card catalogue, player collection, 40-card deck validation, shop pack openings with duplicate Echo Dust conversion, crafting, world progression, and authoritative match commands.
- **Godot 4.x Game Client (`apps/game-client`):** Explorable 3D isometric Lumenport scene (`lumenport_hub.tscn`), 3-lane Convergence Duels tabletop arena (`tabletop_arena.tscn`), and 40-card deck builder (`deck_builder.tscn`).
- **PostgreSQL & Docker Infrastructure (`infra/`):** Full relational schema (`001_initial_schema.sql`) and Docker Compose (`docker-compose.yml`) for PostgreSQL 16 and Redis 7.

## 2. Milestone Rollout Ledger
- [x] **Phase 0 — Foundation:** Monorepo, Rust workspace, Godot project, Node API, PostgreSQL schema, Docker Compose, CI, validator tools.
- [x] **Phase 1 — First Playable Card Engine:** Card schema, declarative Effect AST, 3-lane Front/Rear board, Aether, Resonate, 72 original starter cards (exceeding 64-card target), 4 legal 40-card starter decks, NPC AI, and deterministic replay checksum tests.
- [x] **Phase 2 & 3 — Tabletop & Isometric Lumenport Vertical Slice:** Playable 3-lane tabletop UI, deck builder, pack shop, and isometric Lumenport exploration hub in both Godot 4 and Web Studio.
- [ ] **Phase 4–8 — Content Expansion to 640 Cards:** Expand canonical catalogue in structured batches (`160 -> 320 -> 480 -> 640`), add bespoke 2D illustrations and 32 custom 3D creature summoning models, and expand regions (Verdant Expanse, Ironreach, Astral Archive).
