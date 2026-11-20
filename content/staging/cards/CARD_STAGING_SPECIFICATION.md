# Hearthglass — Card Design & Staging Specification (Phase 5: 640-Card Canonical Milestone)

**Document Version:** 1.2.0  
**Status:** Staged & Validated (Ready for Rust Engine & Integration Owner Review)  
**Assigned Feature Branch:** `feat/cards-world-content`  
**Repository:** `https://github.com/FrostyTheDevv/hearthglass`  

---

## 1. Executive Summary & Audit Verification

In accordance with Hearthglass architectural mandates, the card production and design pipeline has achieved the complete 640-card release milestone. To ensure development stability across concurrent agent worktrees, all 160 expansion cards expanding the catalogue from 480 to 640 are isolated in:
`content/staging/cards/expansion_160_staging_catalogue.json`

The existing authoritative source (`content/cards/foundations_v1.json`) has been audited and validated. Direct overwrites of working files are strictly isolated until final merge sign-off from the Rust rules engine and integration owners.

### Canonical 640-Card Release Distribution
| Card Type | Target Count | Actual Canonical Count | Expansion Staging Delta | Verification Status |
| :--- | :---: | :---: | :---: | :---: |
| **Creatures** | 368 | 368 | +104 | **PASS (100%)** |
| **Tactics** | 136 | 136 | +32 | **PASS (100%)** |
| **Relics** | 88 | 88 | +16 | **PASS (100%)** |
| **Environments** | 48 | 48 | +8 | **PASS (100%)** |
| **TOTAL** | **640** | **640** | **+160** | **PASS (100%)** |

### Rarity Distribution (Strict Anti-Epic Mandate)
| Rarity | Target Count | Actual Canonical Count | Staging Delta | Verification Status |
| :--- | :---: | :---: | :---: | :---: |
| **Common** | 320 | 320 | +80 | **PASS (100%)** |
| **Uncommon** | 192 | 192 | +48 | **PASS (100%)** |
| **Rare** | 96 | 96 | +24 | **PASS (100%)** |
| **Legendary** | 32 | 32 | +8 | **PASS (100%)** |
| **Epic** | **0** | **0** | **0** | **ZERO EPIC RATIFIED** |
| **TOTAL** | **640** | **640** | **+160** | **PASS (100%)** |

---

## 2. Faction Type Matrix Across All 640 Cards

Every major faction maintains identical internal parity (60 cards per faction) across the four core card types, while the Neutral Accord acts as the flexible structural bridge (160 cards) providing universal counterplay, archetype enablers, and multi-lane utility.

```
+----------------+-----------+---------+--------+-------------+-------+
| Faction        | Creatures | Tactics | Relics | Environment | Total |
+----------------+-----------+---------+--------+-------------+-------+
| Emberclad      |    36     |   12    |   8    |      4      |  60   |
| Verdant Pact   |    36     |   12    |   8    |      4      |  60   |
| Iron Choir     |    36     |   12    |   8    |      4      |  60   |
| Tidebound      |    36     |   12    |   8    |      4      |  60   |
| Glassborne     |    36     |   12    |   8    |      4      |  60   |
| Nocturne       |    36     |   12    |   8    |      4      |  60   |
| Starweave      |    36     |   12    |   8    |      4      |  60   |
| Gravewild      |    36     |   12    |   8    |      4      |  60   |
| Neutral Accord |    80     |   40    |   24   |     16      |  160  |
+----------------+-----------+---------+--------+-------------+-------+
| TOTAL          |   368     |  136    |   88   |     48      |  640  |
+----------------+-----------+---------+--------+-------------+-------+
```

---

## 3. Archetype Synergies, Counterplay & Balance

The 160 staged expansion cards deepen the eight primary faction archetypes while introducing deliberate counterplay vectors to prevent any single dominant strategy.

### Faction Archetype Profiles & Mechanics
1. **Emberclad — Heat Core & Overheat Pressure:**
   - *Mechanic:* `heat` counters scale attack when striking, triggering explosive threshold bonuses when overcharging (`overheat`), offset by self-recoil.
   - *Counterplay:* High-health Bulwarks with Armor mitigation (Iron Choir) and lane displacement tactics (Tidebound) prevent cumulative heat ramp.
2. **Verdant Pact — Living Bloom & Regeneration:**
   - *Mechanic:* `bloom` counters provide sustained vitality recovery and board-wide growth when creatures survive multiple rounds.
   - *Counterplay:* Burst removal tactics, Direct Lane Penetration (Marksman), and Gravewild Corrode mechanics that bypass natural healing.
3. **Iron Choir — Clockwork Assembly & Harmonic Resonance:**
   - *Mechanic:* `assembly` and `relic_resonance` grant incremental Armor and automated damage triggers on specific metronome cadence turns.
   - *Counterplay:* Relic destruction tactics, Silence spells, and Nocturne Stealth units that eliminate key artificers before assembly triggers.
4. **Tidebound — Tidal Undertow & Skirmish Mobility:**
   - *Mechanic:* `skirmish` allows dynamic lane repositioning after attacking or when targeted, flanking immobile defenses.
   - *Counterplay:* Area-of-effect lane hazards, Ward barriers (Glassborne), and root-entanglement tactics (Verdant Pact).
5. **Glassborne — Prism Refraction & Spectral Wards:**
   - *Mechanic:* `ward` shields absorb incoming spell and combat damage, while `refract` redirects incoming spells back across the lane.
   - *Counterplay:* Multi-hit swarm attacks, low-cost token attrition, and uncounterable physical Colossus strikes.
6. **Nocturne — Umbral Stealth & Crimson Drain:**
   - *Mechanic:* `stealth` conceals assassins from direct attacks until striking from the shadows, siphoning player vitality via `drain`.
   - *Counterplay:* True-sight revealing relics, wide-lane cleave damage, and persistent environmental hazard cards.
7. **Starweave — Celestial Alignment & Destiny Scrying:**
   - *Mechanic:* `alignment` counts multi-turn astrological constellations, reducing late-game Colossus costs and scrying future draw orders.
   - *Counterplay:* Aggressive vanguard rush decks (Emberclad/Nocturne) that overwhelm the early board before alignment activates.
8. **Gravewild — Sunken Reclamation & Memory Blossoms:**
   - *Mechanic:* `reclaim` returns fallen Echoes from the graveyard to hand or field, converting casualty counts into board presence.
   - *Counterplay:* Exile tactics, graveyard-purifying relics, and high-tempo direct-damage finishers.

---

## 4. Sample Complete Card Record (Staging Format)

The following record from `content/staging/cards/expansion_160_staging_catalogue.json` illustrates the full metadata, encyclopedia lore, artwork brief, and mechanic test specification implemented for all staged cards:

```json
{
  "id": "EMB-C-0049",
  "name": "Ignis Hearth-Scout",
  "type": "creature",
  "subtype": "human_scout",
  "faction": "emberclad",
  "rarity": "common",
  "role": "vanguard",
  "cost": 1,
  "attack": 2,
  "health": 1,
  "keywords": ["swift"],
  "mechanics": ["heat"],
  "description": "Swift. After this attacks, gain 1 Heat counter (+1 Attack).",
  "abilities": [
    {
      "trigger": "after_this_attacks",
      "conditions": [],
      "effects": [
        {
          "operation": "add_counter",
          "target": "self",
          "amount": 1,
          "counter": "heat"
        }
      ]
    }
  ],
  "lore": "Runs ahead of the magma flows, lighting torch-markers with sparks struck from his knuckles.",
  "archetypes": ["heat_core"],
  "weaknesses": ["silence"],
  "complexity": "beginner",
  "gameplay_metadata": {
    "effect_targets": ["self"],
    "timing_restrictions": "Active Player Main Phase",
    "status_interactions": ["swift", "heat", "add_counter"],
    "counterplay_options": ["High-health Bulwark guards", "Quick removal tactics"],
    "balance_metadata": {
      "cost_curve_tier": "early",
      "power_budget_score": 4
    }
  },
  "identity": {
    "entity_kind": "creature",
    "world_bible_refs": {
      "region_id": "reg_crucible_reaches",
      "primary_landmark_id": "lm_emb_slaggate_causeway",
      "primary_figure_id": "fig_emb_hespa",
      "organization_id": "org_pyraxis_vanguard"
    },
    "origin": "Slag-Gate Basalt Causeway, The Crucible Reaches",
    "physical_appearance": "Agile scout leaping across bubbling lava fissure with glowing torch clad in hammered obsidian plate.",
    "collection_biography": "Few sights along Slag-Gate Basalt Causeway are as unmistakable as this agile scout leaping across bubbling lava fissures."
  },
  "art": {
    "asset_id": "art_card_emb_c_0049",
    "prompt": "Rich stylized hand-painted fantasy illustration... Subject: Agile scout leaping across bubbling lava fissure with glowing torch.",
    "visual_exclusions": ["NO text, NO numbers, NO card borders, NO photorealism"]
  },
  "mechanic_test_specification": {
    "test_case_id": "test_rules_emb_c_0049",
    "assertion_type": "state_transition_validation",
    "expected_board_effect": "When played in appropriate lane, verifies 1 active ability, swift deployment, and energy cost deduction of 1.",
    "counterplay_assertion": "Vulnerable to High-health Bulwark guards, Quick removal tactics.",
    "lane_geometry_validation": "Complies with 3-lane front/back row positioning and legal target constraints."
  }
}
```

---

## 5. Integration Protocols for Rust Rules Engine & Godot Client

1. **Rust Engine Verification (`services/battle-server`):**
   - The authoritative rules engine processes card play actions via `BattleEngine::execute_action`.
   - Staged cards conform strictly to the enum schemas (`CardType`, `Role`, `Keyword`, `AbilityTrigger`, `EffectOperation`).
   - No unknown mechanics or unregistered string constants are introduced.
2. **Godot Client Visual Pipeline (`apps/game-client`):**
   - Staged cards point to compliant asset URIs in `res://assets/cards/`.
   - Card frames dynamically bind stats using `CardView` and `TabletopArena` 3D shaders.
   - Text rendering leverages canonical `name_key` and `description_key` localization hooks.
