<p align="center">
  <img src="assets/icon.svg" width="96" height="96" alt="Hearthglass">
</p>

# Project Hearthglass — Convergence Duels

**Hearthglass** is an original isometric open-world card-battling RPG built around the deterministic **Convergence Duels** three-lane tabletop battle engine, eight great Echo Card factions plus the cosmopolitan Neutral Accord, persistent PostgreSQL/PGlite account progression, real-time WebSocket multiplayer, and the explorable harbor city of **Lumenport**.

---

## 1. Core Architecture & Technology Stack

| Layer | Technology | Role & Authority |
| :--- | :--- | :--- |
| **Battle Authority** | **Rust 1.80+ (`services/battle-server`)** | Sole authoritative rules engine (`lib.rs`); computes 100% of state transitions, combat exchanges, keyword resolution, hidden-information redaction, and deterministic replays. |
| **Client Interface** | **Godot 4.3 Stable (`apps/game-client`)** | 3D isometric world exploration (`lumenport_hub.tscn`), 3-lane tabletop arena (`tabletop_arena.tscn`), 480-card deck builder and shop (`deck_builder.tscn`), and data-driven card renderer (`card_frame_widget.gd`). |
| **Backend & API** | **Node.js v22 (`services/api`)** | REST API, WebSocket multiplayer (`/v1/ws`), PostgreSQL transaction-guarded store/crafting, JSON-RPC bridge to Rust engine. |
| **Database** | **PostgreSQL 16 / PGlite (`infra/migrations`)** | Account persistence, collection ledgers, 40-card deck storage, anti-tamper wallet transactions (`wallet_balances`). Supports disk-persisted embedded PGlite. |
| **Content Pipeline** | **Node.js ES Modules (`tools/card-validator`)** | 480 canonical cards (`foundations_v1.json`), 16 legal 40-card archetype decks (`starter_decks.json`), world bible references, and batch prompt manifests (`batch_prompts_480.jsonl`). |

---

## 2. Repository Structure

```text
hearthglass/
├── apps/
│   ├── game-client/                 # Godot 4.3 Client (Scenes, Scripts, Shaders, SVG Assets)
│   │   ├── project.godot            # Godot Engine Configuration
│   │   ├── scenes/                  # World, Battle, UI, and Test Scenes
│   │   └── scripts/                 # GDScript Presentation & Network Logic (No Duplicate Rules)
│   └── content-studio/              # Web-Based Content Studio & Testing Tools
├── services/
│   ├── battle-server/               # Authoritative Rust Convergence Duels Engine & Simulator
│   │   ├── Cargo.toml               # Rust Dependencies (serde, serde_json, sha2, rand)
│   │   ├── src/lib.rs               # Authoritative Core Rules & Combat Math
│   │   ├── src/main.rs              # JSON-RPC Server & CLI Evaluation Binary
│   │   └── tests/                   # 11 Unit/Integration Suites + 1,000-Match Simulation
│   └── api/                         # Node.js REST API & WebSocket Server
│       ├── src/server.mjs           # Express + WebSocket Router (/v1/ws)
│       ├── src/db.mjs               # PostgreSQL / PGlite Persistence Layer
│       ├── src/art_pipeline.mjs     # Multi-Provider Artwork Pipeline Adapter
│       └── tests/                   # API, Multiplayer, and Economy Security Test Suites
├── content/
│   ├── cards/                       # Canonical 480-Card Set (foundations_v1.json) & Faction Folders
│   ├── art/                         # Batch Prompt Manifests (batch_prompts_480.jsonl)
│   └── world/                       # Canonical Regional Data (lumenport, verdant, ironreach, astral)
├── docs/
│   ├── production/                  # CARD_INTEGRITY_AUDIT.md, QUALITY_AUDIT.md
│   └── roadmap/                     # IMPLEMENTATION_STATUS.md
├── infra/
│   └── migrations/                  # PostgreSQL 16 DDL (001_initial_schema.sql)
└── tools/
    └── card-validator/              # Catalogue Builders, Integrity Verifiers, Keyword Audits
```

---

## 3. Runtime & Prerequisites

- **Rust**: Version `1.80.0` or later (`rustc`, `cargo`).
- **Node.js**: Version `22.0.0` or later (`node`, `npm`).
- **Godot Engine**: Godot `4.3-stable` (Standard 64-bit console/GUI).
- **PostgreSQL**: (Optional) PostgreSQL 16. If unset, the backend automatically uses embedded disk-persisted `@electric-sql/pglite` at `data/pgdata`.

---

## 4. Local Development & Verification Commands

### 4.1 Card Catalogue & Integrity Verification
```bash
# Verify schema validity across all 480 cards and 16 starter decks:
node tools/card-validator/validate.mjs

# Verify ID uniqueness, type allocations, and regression bounds:
node tools/card-validator/verify_card_integrity.mjs

# Verify canonical keyword vocabulary against Rust engine:
node tools/card-validator/keyword_audit.mjs
```

### 4.2 Authoritative Rust Rules Engine & 1,000-Match Simulation
```bash
# Run all 11 authoritative unit & integration tests:
cargo test --manifest-path services/battle-server/Cargo.toml

# Run the 1,000 in-memory match simulation benchmark:
cargo test --manifest-path services/battle-server/Cargo.toml --test simulation_1000_tests -- --nocapture

# Build the Rust CLI binary:
cargo build --manifest-path services/battle-server/Cargo.toml
```

### 4.3 Backend API, Multiplayer & Economy Security
```bash
# Run economy anti-tamper security tests (verifying server-side wallet authority):
node services/api/tests/economy_security.test.mjs

# Run full API and WebSocket integration tests:
node --test services/api/tests/api.test.mjs

# Start the Node.js API server (REST on :4173, WebSocket at /v1/ws):
node services/api/src/server.mjs
```

### 4.4 Godot 4.3 Client Launch Instructions
```powershell
# Run the connected 9-step vertical slice test headlessly:
godot --path apps/game-client --headless scenes/tests/vertical_slice_test.tscn

# Run the 6-suite automated smoke test headlessly:
godot --path apps/game-client --headless scenes/tests/smoke_test_runner.tscn

# Launch the interactive 3D Lumenport World Hub:
godot --path apps/game-client scenes/world/lumenport_hub.tscn

# Launch the Tabletop Battle Arena:
godot --path apps/game-client scenes/battle/tabletop_arena.tscn

# Launch the Deck Builder & Resonance Emporium Card Shop:
godot --path apps/game-client scenes/ui/deck_builder.tscn
```

---

## 5. Canonical Game Rules Summary

- **Format**:
  - **1v1 Standard**: Exactly 30 Leader Vitality.
  - **2v2 Tag Team**: Exactly 45 Shared Team Vitality, 4 alternating seats.
- **Board Layout**: Exactly 3 Lanes (Left, Center, Right), each with 1 Front (Vanguard) and 1 Rear (Support) slot per side (6 allied slots, 6 enemy slots).
- **Combat Timing**:
  - Front-slot creatures protect Rear-slot creatures in the same lane unless the attacker has `Reach` and the Front creature lacks `Guard`.
  - Direct attacks against the opposing Leader require the defending lane to be completely clear of non-stealthed enemy creatures.
  - Controlling 2 or more lanes at the end of a turn activates **Resonate**.
- **Deck Rules**: Exactly 40 cards, maximum 2 major factions plus Neutral. Copy caps: Common (3), Uncommon (3), Rare (2), Legendary (1), Epic (0 - eliminated).

---

## 6. Known Limitations & Ongoing Balancing

1. **AI Matchup Skew**: In 1,000 automated AI vs AI matches, graveyard reanimation archetypes (`deck_nocturne_grave_nightfall`) significantly outperformed fragile illusion/burst decks (`deck_glass_nocturne_mirage`). This stems from basic AI heuristics prioritizing raw creature count in front slots without complex synergy setups. Full human playtesting is recommended.
2. **Production Card Illustrations**: The 480 cards currently utilize stylized SVG vector concept art. The AI card art pipeline is configured with 5 provider adapters, awaiting authorized hosted diffusion API keys to batch-generate the 640 final raster illustrations.
3. **Explorable Regions**: Lumenport City is fully explorable in 3D Godot (`lumenport_hub.tscn`). The remaining regions (Verdant Expanse, Ironreach, Astral Archive) have canonical JSON region datasets and landmarks codified, with remaining 3D environment scenes currently in production.
