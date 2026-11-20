# HEARTHGLASS — ORIGINAL CARD ARTWORK PRODUCTION PIPELINE

## 1. Executive Summary & Pipeline Purpose

The Hearthglass Art Production Pipeline is the authoritative subsystem governing the generation, candidate management, provenance tracking, human review, technical validation, and engine export of all 640 original card illustrations across all eight factions and the neutral Lumenport Accord.

### Core Safeguards & Guarantees
1. **Strict Concept vs Production Separation**: The 8 initial deterministic SVG concepts (`hearthglass-prismatic-illustrator-v1`) are strictly classified as `stylized_vector_concept` and tracked under `concept_approved`. They are **never** counted as `final_production_artwork_approved` (0 approved initially, until real visual-inspected raster illustrations are reviewed).
2. **Zero Response Fabrication**: No mock or hallucinated responses are ever claimed as live AI generations. The system strictly separates `live_tested`, `mock_tested`, `configured_untested`, and `unconfigured` adapters. Live status is earned only after completed download, byte validation, and SHA-256 hashing.
3. **Two-Stage Budget Accounting**: Budget authorization enforces a two-stage accounting model:
   - **Cost Reservation**: Bounded by `budget_limit_usd` (`reserved_spend_usd`).
   - **Billed Reconciliation**: Committed only upon verified image retrieval (`spent_usd`). Unused reservations on failed/cancelled jobs are immediately released.
4. **Master Asset Preservation**: Ingested candidate raster bytes (PNG, WebP, JPEG) are preserved verbatim in `content/art/masters/<CARD_ID>/` without recompression or lossy re-encoding.
5. **Human Visual Review Gate**: Final production approval requires authenticated reviewer identity (`approved_by`), recorded visual review (`visual_review_passed: true`), and quality confirmation (`visual_quality_confirmed: true`).
6. **Dual-Target Godot & Web Export**: Approved assets are automatically mirrored to `apps/game-client/assets/cards/` (with Godot 4.x `.import` texture metadata) and `apps/content-studio/public/assets/cards/`.
7. **SSRF-Safe Worker Communication**: Remote GPU workers and ComfyUI endpoints must pass strict URL validation (HTTP/HTTPS only, no embedded credentials, safe hosts).

---

## 2. Supported Image Providers & Remote GPU Workers

| Provider ID | Provider Name | Type | Model ID | Target Tier | Env Variable | Cost / Img | License |
|---|---|---|---|---|---|---|---|
| `flux_2_klein` | FLUX.2 Klein (Hosted API) | Hosted API | `black-forest-labs/flux-2-klein` | Final Production | `FLUX_API_KEY` / `FAL_KEY` | $0.015 | Commercial Hosted API |
| `z_image_turbo` | Z-Image Turbo (Fast Diffusion) | Hosted API | `z-image/z-image-turbo-v1` | Final Production | `Z_IMAGE_API_KEY` / `REPLICATE_API_TOKEN` | $0.008 | Apache-2.0 / Commercial |
| `qwen_image` | Wanx 2.1 / Qwen-Image (DashScope) | Hosted API | `wanx-2.1-t2i-turbo` | Final Production | `QWEN_IMAGE_API_KEY` / `DASHSCOPE_API_KEY` | $0.012 | Tongyi Commercial API |
| `flux_1_schnell` | FLUX.1 Schnell (Together AI) | Hosted API | `black-forest-labs/FLUX.1-schnell` | Final Production | `TOGETHER_API_KEY` | $0.003 | Apache-2.0 |
| `remote_comfyui` | Remote ComfyUI Worker Node | Remote Worker | `comfyui-hearthglass-sdxl-flux-workflow` | Final Production | `COMFYUI_REMOTE_URL` | $0.000 | Self-Managed Worker |
| `self_hosted_worker` | Self-Hosted Cloud GPU Worker | Remote Worker | `hearthglass-gpu-worker-v1` | Final Production | `HEARTHGLASS_GPU_WORKER_URL` | $0.000 | Internal Studio Worker |
| `studio_stylized_svg` | Hearthglass Vector Illustrator | Built-in Engine | `hearthglass-prismatic-illustrator-v1` | Vector Concept | None (Built-in) | $0.000 | First-Party Studio Engine |
| `manual_upload` | Manual Artist / Studio Upload | Manual Import | `manual-artist-upload` | Final Production | None (Direct File) | $0.000 | First-Party Studio Asset |
| `batch_export` | Batch Prompt JSONL Exporter | Pipeline Exporter | `batch-jsonl-v1` | Prompt Export | None (File Export) | $0.000 | First-Party Pipeline |

---

## 3. Production Lifecycle States

Every card in the catalogue transitions through formal, observable production phases:

```mermaid
stateDiagram-v2
    [*] --> prompt_prepared: Faction reference prompt compiled
    prompt_prepared --> candidate_requested: Generation job dispatched & budget reserved
    candidate_requested --> candidate_received: Real image bytes retrieved from provider
    candidate_received --> technical_validation_passed: Format, 3:4 aspect ratio, & SHA-256 validated
    technical_validation_passed --> human_review_required: Master stored & candidate catalogued
    human_review_required --> revisions_requested: Art Director submits feedback
    revisions_requested --> candidate_requested: Re-prompted / New variant enqueued
    human_review_required --> concept_approved: Approved as Vector Concept Prototype
    human_review_required --> production_approved: Visual review gate confirmed
    production_approved --> exported: Asset written to Godot & Web Studio with .import
    exported --> godot_loaded: Texture import validated by Godot Engine
    godot_loaded --> verified_in_game: Rendered inside CardFrameWidget in tabletop match
    verified_in_game --> [*]
```

### Detailed State Definitions:
1. `prompt_prepared`: Card definition has full lore, gameplay role, and compiled faction prompt directives.
2. `candidate_requested`: Generation job enqueued; provider cost reserved from authorized budget.
3. `candidate_received`: Completed binary image returned from hosted API or remote GPU worker.
4. `technical_validation_passed`: Confirmed PNG/WebP magic bytes, 768x1024 or 3:4 vertical framing, non-zero size, SHA-256 computed.
5. `human_review_required`: Preserved in master archive, candidate record registered in manifest.
6. `revisions_requested`: Art Director rejected candidate; notes recorded for prompt refinement.
7. `concept_approved`: Vector SVG concept active as functional gameplay prototype.
8. `production_approved`: Authenticated reviewer confirmed 5-point visual checklist on finished raster illustration.
9. `exported`: Game-ready texture written to `res://assets/cards/` with Godot `.import` file.
10. `godot_loaded`: Headless Godot editor import completed and texture verified loadable.
11. `verified_in_game`: Dynamically loaded into `CardFrameWidget` without placeholder fallbacks.

---

## 4. Provider Real Contracts & Execution Schemas

### 4.1 FLUX.2 Klein (fal.ai)
- **Submission**: `POST https://queue.fal.run/fal-ai/flux/dev`
  - Headers: `Authorization: Key <FLUX_API_KEY>`, `Content-Type: application/json`
  - Body: `{ "prompt": "...", "image_size": { "width": 768, "height": 1024 }, "num_inference_steps": 28, "seed": 42 }`
- **Polling**: `GET <status_url>` -> checks status `COMPLETED`.
- **Download**: `GET <images[0].url>` -> binary PNG buffer.

### 4.2 Z-Image Turbo (Replicate)
- **Submission**: `POST https://api.replicate.com/v1/predictions`
  - Headers: `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
  - Body: `{ "input": { "prompt": "...", "aspect_ratio": "3:4", "num_inference_steps": 8, "seed": 42 } }`
- **Polling**: `GET https://api.replicate.com/v1/predictions/<id>` -> checks status `succeeded`.
- **Download**: `GET <output[0]>` -> binary WebP buffer.

### 4.3 Wanx 2.1 / Qwen-Image (DashScope)
- **Submission**: `POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis`
  - Headers: `Authorization: Bearer <DASHSCOPE_API_KEY>`, `X-DashScope-Async: enable`
  - Body: `{ "model": "wanx-2.1-t2i-turbo", "input": { "prompt": "..." }, "parameters": { "size": "768*1024", "n": 1, "seed": 42 } }`
- **Polling**: `GET https://dashscope.aliyuncs.com/api/v1/tasks/<task_id>` -> checks `task_status: "SUCCEEDED"`.
- **Download**: `GET <output.results[0].url>` -> binary PNG buffer.

### 4.4 FLUX.1 Schnell (Together AI)
- **Submission**: `POST https://api.together.xyz/v1/images/generations`
  - Headers: `Authorization: Bearer <TOGETHER_API_KEY>`, `Content-Type: application/json`
  - Body: `{ "model": "black-forest-labs/FLUX.1-schnell", "prompt": "...", "width": 768, "height": 1024, "steps": 4, "response_format": "b64_json" }`
- **Retrieval**: Decodes `data[0].b64_json` or downloads `data[0].url`.

### 4.5 Remote ComfyUI Worker Node
- **Graph Submission**: `POST <COMFYUI_REMOTE_URL>/prompt`
  - Body: `{ "prompt": <9-node execution graph>, "client_id": "hearthglass_..." }`
- **History Polling**: `GET <COMFYUI_REMOTE_URL>/history/<prompt_id>`
  - Locates `outputs[node_id].images[0]` metadata (`filename`, `subfolder`, `type`).
- **Download**: `GET <COMFYUI_REMOTE_URL>/view?filename=<filename>&subfolder=<subfolder>&type=output` -> binary PNG buffer.

### 4.6 Self-Hosted Cloud GPU Worker
- **Endpoint**: `POST <HEARTHGLASS_GPU_WORKER_URL>/v1/generate`
  - Body: `{ "card_id": "...", "prompt": "...", "width": 768, "height": 1024, "aspect_ratio": "3:4", "seed": 42 }`
- **Supported Returns**: Direct image binary, Base64 JSON, or async queue job with `/v1/jobs/<id>` polling and `/v1/images/<file>` download.
- **SSRF Rule**: Enforces HTTP/HTTPS protocol, rejects userinfo, validates hostname.

---

## 5. Budget Accounting & Idempotency

### Budget Lifecycle:
1. **Pre-flight Check**: `spent_usd + reserved_usd + estimatedCost <= budget_limit_usd`.
2. **Reservation**: `reserved_usd += estimatedCost` upon job submission.
3. **Reconciliation**:
   - On success: `reserved_usd -= perImageCost`, `spent_usd += perImageCost`.
   - On failure/cancellation: `reserved_usd -= remainingReserved`. `spent_usd` is untouched.
4. **Idempotency**: Submissions with `idempotency_key` return existing active or completed jobs without double charging.

---

## 6. Faction Visual Directives & Reference Guides

Stored canonically in [`content/art/faction_reference_sheets.json`](file:///C:/Users/billy/.t3/worktrees/hearthglass/feat-art-production-pip-3efc1595aa5a6589/content/art/faction_reference_sheets.json):

1. **Emberclad**: Volcanic obsidian, blackened iron, smoldering heat cracks, glowing amber-orange underlighting (`#ff5d2e`, `#ffb347`, `#120709`).
2. **Verdant Pact**: Ancient primordial woodland, ironwood bark, bioluminescent moss, glowing emerald spores (`#37d67a`, `#9be564`, `#07140f`).
3. **Iron Choir**: Gothic clockwork steampunk, polished ecclesiastical brass, church organs, cyan aether tubes (`#d4a359`, `#4de1ff`, `#0b101a`).
4. **Tidebound**: Oceanic abyss, coral chitin, iridescent pearl nacre, caustic wave refractions (`#22d3ee`, `#38bdf8`, `#04101e`).
5. **Glassborne**: Prismatic crystal refraction, mirrored galleries, violet twilight, faceted geometric jewelry (`#c084fc`, `#67e8f9`, `#0c091c`).
6. **Nocturne**: Dark gothic chiaroscuro, blood moon rim lighting, raven feathers, midnight velvet, silver masks (`#818cf8`, `#e11d48`, `#05050d`).
7. **Starweave**: Cosmic celestial, brass armillary spheres, constellation embroidery, deep indigo nebula (`#fbbf24`, `#60a5fa`, `#070414`).
8. **Gravewild**: Barrow ossuary, bleached leviathan bone, thorny black briars, neon lime will-o'-the-wisps (`#a3e635`, `#be123c`, `#0a0b09`).
9. **Neutral**: Warm Lumenport tavern, cobblestone harbor, tanned leather, forged iron lantern light (`#eab308`, `#94a3b8`, `#0c0f17`).

---

## 7. First Target: The Eight Signature Faction Illustrations

Stored canonically in [`content/art/showcase_production_specs.json`](file:///C:/Users/billy/.t3/worktrees/hearthglass/feat-art-production-pip-3efc1595aa5a6589/content/art/showcase_production_specs.json):

1. **`EMB-C-0001` (Ashborne Initiate)**: Emberclad 1-cost Vanguard. Volcanic Cinder Anvil forge, obsidian gauntlets glowing white-hot with molten heat cracks reflecting the Heat counter mechanic.
2. **`VER-C-0001` (Mossveil Tender)**: Verdant Pact 1-cost Support. Primordial elder grove, cupping glowing emerald Echo seeds bursting into life depicting Growth and Vitality restoration.
3. **`IRN-C-0001` (Cogline Recruit)**: Iron Choir 1-cost Vanguard. Third Foundry industrial cathedral, porcelain faceplate, brass interlocking gear shield and cyan aether tubes depicting Shield and Assembly mechanics.
4. **`TID-C-0001` (Reefstep Scout)**: Tidebound 1-cost Vanguard. Twilight surf, coral reef rocks, cerulean and pearl chitin armor, leaping dynamic motion with rushing water ribbons depicting Skirmish and Current lane shifts.
5. **`GLS-C-0001` (Prismblade Apprentice)**: Glassborne 1-cost Vanguard. Mirror Galleries, faceted crystal rapier, crystalline Ward barrier, triple-refraction light silhouettes depicting Ward and multi-angle strike.
6. **`NOC-C-0001` (Crescent Alley Stalker)**: Nocturne 1-cost Assassin. Crescent District foggy cobbled rooftop, blood-red moon, cloak dissolving into raven feathers and shadow smoke depicting Stealth and Veil.
7. **`STR-C-0001` (Astrolabe Student)**: Starweave 1-cost Caster. Celestial Spire observatory, armillary sphere, orbiting golden constellation glyphs depicting Alignment counter and top-card inspection.
8. **`GRV-C-0001` (Bonefield Wanderer)**: Gravewild 1-cost Vanguard. Mist-shrouded barrow swamp, leviathan bone construct bound by briars, glowing lime-green flame in skull, hovering translucent Echo Remnant depicting Rebirth.

---

## 8. Live Provider Configuration Guide

When authorized to run live raster illustration generation, configure the target provider credentials in `.env` or process environment:

```bash
# FLUX.2 Klein / Dev via fal.ai
export FLUX_API_KEY="your-fal-or-bfl-api-key"

# Z-Image Turbo via Replicate
export REPLICATE_API_TOKEN="r8_your_replicate_token"

# Wanx 2.1 / Qwen-Image via Alibaba DashScope
export DASHSCOPE_API_KEY="sk-your-dashscope-key"

# FLUX.1 Schnell via Together AI
export TOGETHER_API_KEY="together-api-key"

# Remote ComfyUI Worker Node
export COMFYUI_REMOTE_URL="http://gpu-worker-01.internal:8188"

# Self-Hosted Cloud GPU Worker
export HEARTHGLASS_GPU_WORKER_URL="http://hearthglass-worker.cloud:8000"

# Production Budget Authorization
export ART_AUTHORIZED_BUDGET_USD="50.00"
```
