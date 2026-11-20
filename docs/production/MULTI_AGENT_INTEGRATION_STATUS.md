# Hearthglass — Multi-Agent Integration Coordination & Status

**Document Version**: 1.0.0  
**Last Updated**: November 20, 2026 (Post-V10-B Execution)  
**Master Head Commit**: `4013102` (`feat(security,economy): V10-A.1 admin CLI & atomic decks, V10-B transactional economy [skip ci]`)  
**Repository**: [FrostyTheDevv/hearthglass](https://github.com/FrostyTheDevv/hearthglass)  
**Coordinator**: Backend & Rules Engine Lead  

---

## 1. Executive Status & Master Branch Stability

The `master` branch is stable, passing all local automated regression suites, and authoritative at commit `4013102`. Uncontrolled pushes to `master` are strictly prohibited.

### Preserved Backend Systems (Commit `4013102`):
- **Operator-Only Admin Provisioning CLI (`services/api/src/cli.mjs`)**: Mandatory zero-admin prerequisite, credential complexity enforcement, and audit recording in `role_change_audit`.
- **Disabled Default HTTP Provisioning**: `POST /v1/auth/provision-admin` disabled by default (`ENABLE_HTTP_ADMIN_PROVISIONING === 'true'`).
- **Atomic Deck Ownership & Optimistic Concurrency**: Row-level locking (`FOR UPDATE`) inside `withTransaction`, query authorization scoped to authenticated user (`WHERE id = $1 AND user_id = $2`), and `expected_revision` conflict detection returning HTTP 409 Conflict.
- **Strict Event Serialization Schemas**: All 19 Rust engine battle events explicitly projected through viewer-specific allowlists in `redactEventsForViewer()`; unallowlisted internal properties stripped; unknown events fail closed.
- **Milestone V10-B Transactional Economy**:
  - `openPack`: Atomic pack purchase with row locks on `wallet_balances`, card grants, and duplicate auto-conversion to Echo Dust.
  - `craftOrDisenchantCard`: Row-locked crafting enforcing strict copy limits (3 Common/Uncommon, 2 Rare, 1 Legendary) and preventing balance overdrafts.
  - Non-null `idempotency_key` generation on all ledger records.
  - `recordMatchCompletion`: Transaction-safe match rewards with human player seat validation.
  - Full transaction rollback fault-tolerance verified with zero state leaks.
- **Authoritative 640-Card Catalogue**: 640 cards, 640 unique IDs, 8 factions × 60 + 160 Neutral, strict 4-tier rarity (320 Common, 192 Uncommon, 96 Rare, 32 Legendary, 0 Epic).

---

## 2. Pull Request Tracking & Compatibility Matrix

| Pull Request | Branch & Head | Team / Agent | Status | Compatibility with Master (`4013102`) | Blocker / Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[PR #1](https://github.com/FrostyTheDevv/hearthglass/pull/1)**: Playable Godot 4.3 Isometric Client | `feat/godot-playable-client`<br>Commit: `e1e4bb3` | Client Team | **BLOCKED / CHANGES REQUESTED** | • Zero backend file conflicts (`git merge-tree` clean).<br>• Must interface with server economy via REST/WS rather than client balance spoofing. | • Separate online authoritative economy from client save state.<br>• Refine card targeting logic.<br>• Polish reward presentation.<br>• Verify Windows standalone package build (`export_presets.cfg`). |
| **[PR #2](https://github.com/FrostyTheDevv/hearthglass/pull/2)**: Image Generation Adapters & Review Pipeline | `feat/art-production-pipeline`<br>Commit: `7f42676` | Artwork Team | **BLOCKED / REMEDIATION REQUIRED** | • Clean merge tree with `master`.<br>• Shared files: `services/api/src/server.mjs` and `package.json`. | • Hosted provider adapters currently return embedded mock PNG/WebP bytes from non-mock paths while claiming live mode.<br>• Requires real asset retrieval and end-to-end provider test coverage.<br>• Coordinate `server.mjs` route registration. |
| **[PR #3](https://github.com/FrostyTheDevv/hearthglass/pull/3)**: 640-Card Staging & 12-Chapter Campaign | `feat/cards-world-content`<br>Commit: `6597f4d` | Content Team | **BLOCKED / ID RECONCILIATION REQUIRED** | • Clean git tree, but content-level ID collision with `content/cards/foundations_v1.json`. | • The 160 staged cards overlap with IDs in the canonical 640-card catalogue.<br>• Content agent assigned ID-by-ID reconciliation.<br>• Must not overwrite canonical mechanics or append duplicate IDs. |
| **[PR #4](https://github.com/FrostyTheDevv/hearthglass/pull/4)**: QA Test Suites & Defect Audit | `feat/qa-and-balance`<br>Commit: `b3bc6b6` | QA Team | **REVIEW IN PROGRESS** | • Clean merge tree with `master`.<br>• Adds tests in `services/api/tests/` and `services/battle-server/tests/`. | • QA identified DEFECT-002 (openShopPack concurrency), which is already resolved on `master` in `4013102`.<br>• QA identified DEFECT-001 (unhandled `all_enemy_creatures` target) and DEFECT-003 (unused `_difficulty` in `NpcAi`), which are queued for engine refinement. |

---

## 3. Shared File Coordination (`server.mjs` & `package.json`)

To prevent merge collisions across teams:

1. **`services/api/src/server.mjs`**:
   - **Master (`4013102`)**: Contains strict `redactEventsForViewer()` allowlists, deck revision conflict handling (409 Conflict), and disabled HTTP admin provisioning.
   - **PR #2**: Adds 5 art pipeline management routes:
     - `POST /v1/art/revisions`
     - `POST /v1/art/rollback`
     - `GET /v1/art/factions`
     - `POST /v1/art/test-adapter`
     - `POST /v1/art/upload`
   - **Coordination Rule**: PR #2 must rebase on `origin/master` (`4013102`). The routes attach cleanly immediately after Section 6 (`/v1/art/export`) without touching match or deck logic.

2. **`package.json`**:
   - **Master (`4013102`)**:
     ```json
     "test": "node tools/card-validator/validate.mjs && node --test services/api/tests/art_pipeline_raster.test.mjs services/api/tests/security_auth.test.mjs services/api/tests/economy_security.test.mjs services/api/tests/api.test.mjs"
     ```
   - **PR #2**:
     ```json
     "test": "node tools/card-validator/validate.mjs && node --test services/api/tests/art_pipeline_raster.test.mjs services/api/tests/art_pipeline_adapters.test.mjs services/api/tests/security_auth.test.mjs services/api/tests/economy_security.test.mjs services/api/tests/api.test.mjs"
     ```
   - **Coordination Rule**: Adding `services/api/tests/art_pipeline_adapters.test.mjs` is accepted once real provider adapters and live tests pass without mock fallbacks in live mode.

---

## 4. Test Verification Separation (Local vs. GitHub Actions)

| Verification Dimension | Local Execution (Local Test Runner) | Remote GitHub Actions (`Hearthglass CI`) | Notes / Distinction |
| :--- | :--- | :--- | :--- |
| **Node API & Security Suites** | **48 / 48 PASS (100%)** (`npm test` in `services/api`) | Not automatically triggered on push | Local runs test all 23 auth, 5 economy, 8 integration, and 12 art tests. |
| **Rust Rules Engine & Simulations** | **16 / 16 PASS (100%)** (`cargo test`) | Not automatically triggered on push | Includes 2,560 exhaustive simulation matches in `simulation_1000_tests.rs`. |
| **Godot 4.3 Headless Suites** | **15 / 15 PASS (100%)** (6 smoke, 9 vertical slice) | Not automatically triggered on push | Runs headless via `tools\godot\Godot_v4.3-stable_win64_console.exe`. |
| **Card Catalogue Validation** | **640 / 640 VALID (0 errors, 0 warnings)** | Not automatically triggered on push | Validates exact 4-tier rarity, 0 Epic, 640 unique IDs. |
| **Remote CI Workflow** | N/A | **Workflow Dispatch Only** (Run `#44630026568` Success) | Configured in `.github/workflows/ci.yml` with `on: workflow_dispatch` to strictly preserve runner quotas. Never claim a push triggered CI unless manually dispatched. |

---

## 5. Branch Reconciliation Instructions for Subagents

All agent teams working on PRs #1–#4 must follow this reconciliation protocol:

1. **Do not create merge commits into `master`**.
2. **Fetch latest `master`**:
   ```bash
   git fetch origin master
   ```
3. **Rebase feature branch on `origin/master`**:
   ```bash
   git checkout <feature-branch>
   git rebase origin/master
   ```
4. **Resolve domain-specific responsibilities**:
   - **Artwork Team (PR #2)**: Replace mock byte fallbacks with real HTTP client calls in live mode, ensure mock mode is strictly opt-in (`mockOnly: true`), and add integration tests.
   - **Content Team (PR #3)**: Reconcile staged card IDs against `content/cards/foundations_v1.json` without overwriting canonical card stats or creating duplicate IDs.
   - **Client Team (PR #1)**: Bind all economy actions to backend REST/WS APIs and verify Windows export package.
   - **QA Team (PR #4)**: Update defect reports (DEFECT-002 resolved on master) and prepare integration test suite.
5. **Request Integration Review**: Post verification status to this document before requesting merge approval.
