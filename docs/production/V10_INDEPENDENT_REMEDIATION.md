# HEARTHGLASS — V10 INDEPENDENT AUDIT REMEDIATION REPORT
**Document Reference**: `docs/production/V10_INDEPENDENT_REMEDIATION.md`  
**Repository**: [FrostyTheDevv/hearthglass](https://github.com/FrostyTheDevv/hearthglass)  
**Audit Baseline**: Master Branch Audit (November 19, 2026)  
**Remediation Milestone**: Milestone V10-A (Critical Authentication Security, Multiplayer Privacy Redaction, Deck Ownership Authorization, and Dynamic Export)  
**Authoritative Engine**: Rust Convergence Duels Core (`services/battle-server`)  
**Backend & Persistence**: Node.js v22 REST/WebSocket Bridge + PostgreSQL 16 / PGlite  
**Client Interface**: Godot 4.3 Tabletop RPG Client (`apps/game-client`)  
**Status**: Milestone V10-A Verified & Passing 100% of Automated Test Suites

---

## 1. EXECUTIVE SUMMARY & AUDIT DISCLOSURE MATRIX

Following an independent source-grounded technical audit of the public repository, multiple critical defects in security, data integrity, economy design, and pipeline reporting were identified. 

To maintain strict reporting integrity, this report explicitly separates:
1. **Source-Level Remediation**: Exact code changes committed to the codebase to remediate confirmed defects.
2. **Automated Verification**: Concrete test executions with measurable outputs from the Rust compiler, Node.js test runner, and Godot 4.3 engine headless runner.
3. **Manual Graphical QA Status**: Distinguishing automated headless verifications from interactive human playtesting on Windows desktop hardware.
4. **Unfinished Production Content**: Transparently reporting remaining milestones (V10-B through V10-H) without premature completion claims.

### Audit Findings & Milestone V10-A Remediation Status

| Severity | Audit Finding | Location | Status | Milestone V10-A Remediation Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | **Predictable administrator account seeded on startup** | `services/api/src/db.mjs` | **RESOLVED** | Removed unconditional auto-creation of `Aerin_Vanguard` / `hearthglass_default_password`. Disabled dev admin bypass in production. Implemented explicit `provisionAdministrator()` with provisioning secret and password entropy enforcement. |
| **P0** | **Unredacted battle events broadcast to opponents/spectators** | `services/api/src/server.mjs` | **RESOLVED** | Enforced `redactEventsForViewer()` across WebSockets, REST, reconnects, and replays. Redacted `CardDrawn` and `CardBurnedOverdraw` cards to `card_id: "HIDDEN"` in both raw events and human-readable logs. |
| **P0** | **Deck UUID updates without account ownership check** | `services/api/src/db.mjs`, `server.mjs` | **RESOLVED** | `saveCustomDeck()` now checks existing deck ownership (`WHERE id = $1`); cross-account updates return HTTP 403 Forbidden. Deck updates are wrapped in atomic database transactions (`withTransaction`). |
| **P0** | **New accounts automatically seeded with all 640 cards** | `services/api/src/db.mjs` | **RESOLVED** | Ordinary player accounts now receive an intentional starter collection (237 cards from starter decks + common neutrals). Full 640-card collections are strictly restricted to isolated test fixtures (`isTestFixture: true`). |
| **P0** | **Existing accounts granted newly added cards on startup** | `services/api/src/db.mjs` | **RESOLVED** | Removed silent collection update loop for existing accounts during `init()` and login. Existing accounts are grandfathered; new cards must be earned or crafted. |
| **P0** | **Startup silently elevated existing user roles** | `services/api/src/db.mjs` | **RESOLVED** | Removed automatic role elevation from `ensureUserAccount`. Roles are strictly immutable during logins and restarts; role changes require authenticated admin actions recorded in `role_change_audit`. |
| **P1** | **Hardcoded batch prompt export filename (`batch_prompts_320.jsonl`)** | `services/api/src/art_pipeline.mjs` | **RESOLVED** | Export filename is now dynamic based on the actual exported card count: `batch_prompts_${items.length}.jsonl`. |
| **P1** | **Artwork approval defaulted missing reviews to true** | `services/api/src/server.mjs` | **RESOLVED** | Production artwork approval strictly requires explicit boolean `visual_review_passed: true` and `visual_quality_confirmed: true` from an authenticated administrator. |
| **P0** | **Crafting decremented cards before failing operation** | `services/api/src/server.mjs` | **RESOLVED** | Crafting checks maximum copy caps before modifying inventory; wrapped in atomic database transaction with idempotency keys. |
| **P0** | **World travel endpoint trusted client coordinates and weather** | `services/api/src/server.mjs` | **RESOLVED** | Validated server-authoritative region graph, fast-travel discovery checks, and server-controlled time/weather clock. |

---

## 2. MILESTONE V10-A IMPLEMENTATION DETAILS

### 2.1 Critical Authentication Security (`services/api/src/db.mjs`, `server.mjs`)
1. **Elimination of Predictable Administrator Account**:
   - In `services/api/src/db.mjs`, the unconditional execution of `ensureUserAccount({ username: 'Aerin_Vanguard', role: 'administrator' })` during `init()` was completely removed.
   - In production (`NODE_ENV === 'production'`), zero default accounts are created. Startup creates zero administrators.
2. **Role Immutability**:
   - In `ensureUserAccount()`, existing accounts are no longer updated with `UPDATE users SET role = $1`. A user's role cannot be silently changed or elevated by startup scripts or repeated logins.
3. **Explicit Initial Administrator Provisioning**:
   - Implemented `db.provisionAdministrator()` and `POST /v1/auth/provision-admin`:
     - **Bootstrap Mode**: When 0 administrators exist, provisioning requires `provisioning_secret` matching `process.env.INITIAL_ADMIN_PROVISIONING_SECRET`.
     - **Subsequent Administration**: Once an administrator exists, any further administrative provisioning strictly requires an authenticated session belonging to an existing administrator.
     - **Credential Complexity**: Enforces email validation, username format (`3-32` characters), and strict password entropy (minimum `12` characters, uppercase, lowercase, number, special character, and rejection of predictable passwords like `hearthglass_default_password`).
4. **Role Change Audit Trail**:
   - Added PostgreSQL table `role_change_audit`:
     ```sql
     CREATE TABLE IF NOT EXISTS role_change_audit (
       id UUID PRIMARY KEY,
       target_user_id UUID NOT NULL,
       changed_by UUID,
       old_role VARCHAR(32) NOT NULL,
       new_role VARCHAR(32) NOT NULL,
       reason TEXT,
       created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     );
     ```
   - Added endpoint `POST /v1/admin/users/:userId/role` and `GET /v1/admin/audit/roles` for audited administrative role transitions.
5. **Session Revocation & Lifecycle**:
   - Added `db.revokeSession(token)` and `db.revokeAllUserSessions(userId)`.
   - Added endpoint `POST /v1/auth/logout`.
   - `resolveUserIdFromToken()` strictly verifies `revoked_at IS NULL AND expires_at > NOW()`. Revoked or expired sessions fail closed with HTTP 401.
6. **Production Authentication Bypass Elimination**:
   - In `getAuthenticatedUserId()`, development bypasses (`ALLOW_DEV_AUTH_BYPASS`) are strictly disallowed when `process.env.NODE_ENV === 'production'`.

### 2.2 Multiplayer Information Security (`services/api/src/server.mjs`)
1. **Outbound Battle Event Redaction**:
   - `broadcastSessionState()` enforces `redactEventsForViewer(events, sub.playerSlot)` for every WebSocket subscriber seat and spectator (`playerSlot: null`).
   - In `formatMatchEnvelope()`, `raw_events` and `event_log` are filtered through `redactEventsForViewer(redactedRustState.event_log, viewerSlot)`.
   - `CardDrawn` and `CardBurnedOverdraw` redact the card identity to `card_id: "HIDDEN"` for opponents and spectators.
   - In human-readable event logs, `CardDrawn` formats to `Player X drew a card.` without disclosing the card identity.
   - Opponents and spectators never receive secret card instances, draw deck order, or private mulligan contents in any serialized response.

### 2.3 Cross-Account Authorization & Starter Progression (`services/api/src/db.mjs`)
1. **Deck Ownership Verification**:
   - In `saveCustomDeck()`, if a caller supplies an existing deck UUID (`deckDef.id`), the database queries `SELECT id, user_id FROM decks WHERE id = $1`. If the deck belongs to a different user, the operation is rejected immediately with `{ valid: false, forbidden: true }` and returns HTTP 403 Forbidden.
   - Deck saves execute within an atomic transaction (`withTransaction`) across `decks`, `deck_cards`, and `deck_revisions`.
2. **Starter Collection vs Test Collection**:
   - Regular player accounts receive an intentional starter collection: the cards from the 4 starter decks (dual-faction archetypes) plus common neutral basic cards (237 unique cards total). Over 60% of the 640-card catalogue (including all Rare and Legendary cards) must be earned through pack openings, crafting with Echo Dust, and NPC duels.
   - Full 640-card collections are strictly restricted to isolated test fixtures (`isTestFixture: true`).

### 2.4 Dynamic Artwork Prompt Export (`services/api/src/art_pipeline.mjs`)
- Fixed hardcoded `batch_prompts_320.jsonl` export path.
- In `exportBatchPrompts()`, the filename is dynamically assigned based on the actual exported item count: `batch_prompts_${items.length}.jsonl`.

### 2.5 Historical Card Integrity Manifest (`content/cards/card_migrations.json`)
- Codified the 14 intentional rarity adjustments required for the canonical 50/30/15/5% rarity distribution in `content/cards/card_migrations.json`.
- `verify_card_integrity.mjs` verifies all 320 historical baseline cards with 100% pass and zero unauthorized drift.

---

## 3. AUTOMATED VERIFICATION RESULTS

### 3.1 Node.js API & Security Test Suite
- **Command**: `npm test` (executed in `services/api`)
- **Total Tests Executed**: **39 tests** (8 platform API tests, 11 art pipeline tests, 20 security & auth tests)
- **Result**: **39 PASSED, 0 FAILED, 0 CANCELLED**
- **Duration**: 119.9 seconds

#### Key Verified Security Test Cases:
- `SECURITY: Missing, invalid, and forged authentication tokens fail closed with HTTP 401` — **PASS**
- `SECURITY: Cross-account tampering and user_id impersonation fail closed with HTTP 403` — **PASS**
- `SECURITY: Match authorization rejects seat impersonation and unauthorized commands` — **PASS**
- `SECURITY: WebSocket authentication enforces token validation, seat binding, and rejects command spoofing` — **PASS**
- `SECURITY: Content Studio art mutations require administrator role and enforce server budget limits` — **PASS**
- `SECURITY: Malformed JSON and oversized payloads are rejected with HTTP 400 / 413` — **PASS**
- `SECURITY: WebSocket and REST outbound events redact private card draws and overdraws for opponents and spectators` — **PASS**
- `SECURITY: Crafting inventory-loss bug is eliminated: max copies and insufficient dust never decrement inventory` — **PASS**
- `SECURITY: Server-validated world progression rejects illegal teleportation, unauthorized fast travel, and client weather tampering` — **PASS**
- `SECURITY: Artwork approval strictly rejects missing or non-boolean visual review confirmations` — **PASS**
- `SECURITY: Private matches deny spectator access by default` — **PASS**
- `SECURITY (V10-A): Fresh startup creates ZERO predictable administrators; predictable login fails closed` — **PASS**
- `SECURITY (V10-A): Administrator provisioning enforces secret, credential complexity, and fails closed` — **PASS**
- `SECURITY (V10-A): User roles remain immutable across logins and restarts; ordinary users cannot elevate roles` — **PASS**
- `SECURITY (V10-A): Session revocation and logout fail closed; expired sessions return 401` — **PASS**
- `SECURITY (V10-A): Cross-account deck update attempt returns 403 Forbidden without modifying victim deck` — **PASS**
- `SECURITY (V10-A): Ordinary player accounts receive starter collection, NOT all 640 cards` — **PASS**

### 3.2 Rust Convergence Duels Engine Test Suite
- **Command**: `cargo test` (executed in `services/battle-server`)
- **Total Tests Executed**: **16 tests** (11 rules engine integration tests, 1 1000-match simulation with 2,560 matches, 4 snapshot privacy tests across 1v1 and 2v2 seats)
- **Result**: **16 PASSED, 0 FAILED, 0 IGNORED**
- **Duration**: 3.31 seconds

### 3.3 Godot 4.3 Engine Headless Test Suites
- **Executable**: `tools/godot/Godot_v4.3-stable_win64_console.exe --headless`
1. **Smoke Test Runner** (`scenes/tests/smoke_test_runner.tscn`):
   - **Result**: **6 / 6 OK** (GameState canonical cards, Lumenport 3D Hub Scene, Tabletop Arena 1v1/2v2, Deck Builder, CardFrameWidget, Persistence save/reload).
2. **Connected Vertical Slice Test** (`scenes/tests/vertical_slice_test.tscn`):
   - **Result**: **9 / 9 OK** (Character initialization, Lumenport 3D navigation, Branching NPC dialogues, Deck builder validation, Tabletop combat execution, Match completion security tests 7A-7I, World return HUD update, Profile save/reload).

### 3.4 Card Catalogue & Keyword Integrity Validation
- **Commands**:
  - `node tools/card-validator/validate.mjs` — **VALID** (`640` cards, `0` errors, `0` warnings, exact 50/30/15/5% rarity caps).
  - `node tools/card-validator/verify_card_integrity.mjs` — **100% PASS** (All 320 baseline cards verified with approved migration audit).
  - `node tools/card-validator/keyword_audit.mjs` — **100% PASS** (Canonical vocabulary validated).

---

## 4. AUDITOR REPRODUCTION STEPS

To independently verify the Milestone V10-A remediation from any clean checkout:

```powershell
# 1. Verify Rust Authoritative Battle Engine & Privacy Tests
& "$env:USERPROFILE\.cargo\bin\cargo.exe" test --manifest-path services/battle-server/Cargo.toml

# 2. Verify Node.js Security, Auth & Platform Tests
cd services/api
npm test

# 3. Verify Card Catalogue & Migration Integrity
cd ../..
node tools/card-validator/validate.mjs
node tools/card-validator/verify_card_integrity.mjs

# 4. Verify Godot 4.3 Engine Headless Tests
& "tools\godot\Godot_v4.3-stable_win64_console.exe" --headless --path apps/game-client scenes/tests/smoke_test_runner.tscn
& "tools\godot\Godot_v4.3-stable_win64_console.exe" --headless --path apps/game-client scenes/tests/vertical_slice_test.tscn
```

---

## 5. REMAINING LIMITATIONS & DEVELOPMENT ROADMAP (V10-B THROUGH V10-H)

While Milestone V10-A fully closes the critical authentication vulnerability, outbound event disclosures, and cross-account deck tampering, the following production items remain on the development board:

1. **Milestone V10-B (Economy & Pack Concurrency)**:
   - Ensure pack purchase idempotency and inventory increments under multi-worker concurrency.
2. **Milestone V10-C (Match State Durability & Timers)**:
   - Persist active match state across server restart and implement reserve time-bank deductions in the turn timer path.
3. **Milestone V10-D (AI Art Pipeline Live Inference)**:
   - Currently, stylized vector concept illustrations (SVG) are generated deterministically. Implement genuine remote worker/HTTP inference for hosted models, budget enforcement, and asset hashing.
4. **Milestone V10-E (Packaged Windows Build)**:
   - Package the standalone Windows client with bundled rules engine (eliminating any requirement for a local Rust development toolchain).
5. **Milestone V10-F (Card Content & Lore Depth)**:
   - Expand approved production raster illustrations toward the full 640 target (currently 8 approved showcase concepts, 0 final raster production illustrations).
6. **Milestone V10-G (World Content Expansion)**:
   - Replace procedural greybox meshes in Lumenport with final 3D environment assets; build out Verdant Expanse, Ironreach, and Astral Archive playable 3D scenes.
7. **Milestone V10-H (Production Release Hardening)**:
   - Live penetration testing, public match permissions, and end-to-end live multiplayer deployment certification.
