# Hearthglass — Canonical World Content & Narrative Expansion Specification

**Document Version:** 1.2.0  
**Status:** Validated & Integrated in Staging  
**Assigned Feature Branch:** `feat/cards-world-content`  
**Repository:** `https://github.com/FrostyTheDevv/hearthglass`  

---

## 1. Executive Summary & Production Scope

This document details the complete narrative, campaign, and worldbuilding expansion implemented for Hearthglass. All content adheres strictly to the canonical entity IDs, historical events, and geographical landmarks codified in the **Hearthglass World Bible** (`tools/card-validator/world_bible.mjs`), preserving narrative continuity and preventing contradictory lore generation.

### Staged Content Production Matrix
| Content Category | Canonical Target | Implemented & Staged | Verification Status | File Location |
| :--- | :---: | :---: | :---: | :--- |
| **Named NPCs** | **80** | **80** | **PASS (100%)** | `content/staging/world/world_npcs_80.json` |
| **Campaign Chapters** | **12** | **12** | **PASS (100%)** | `content/staging/world/campaign_twelve_chapters.json` |
| **Original Side Quests** | **120** | **120** | **PASS (100%)** | `content/staging/world/world_side_quests_120.json` |
| **Dungeons & Vaults** | **16** | **16** | **PASS (100%)** | `content/staging/world/world_dungeons_16.json` |
| **Tournaments** | **8** | **8** | **PASS (100%)** | `content/staging/world/world_tournaments_8.json` |
| **Companion Stories** | **24** | **24** | **PASS (100%)** | `content/staging/world/world_companion_stories_24.json` |
| **World Secrets** | **32** | **32** | **PASS (100%)** | `content/staging/world/world_secrets_32.json` |
| **Elite Encounters** | **20** | **20** | **PASS (100%)** | `content/staging/world/world_elite_encounters_20.json` |
| **Card Staging Delta** | **160** | **160** | **PASS (100%)** | `content/staging/cards/expansion_160_staging_catalogue.json` |

---

## 2. The Four Canonical Regions

Every element of the world is grounded in the four primary geographical theaters where the eight faction leylines intersect:

```
                              [4. THE HIGH ASTRAL ARCHIVE]
                                 (Mount Solitude Zenith)
                                     ^             ^
                                    /               \
                                   /                 \
                                  v                   v
           [3. THE IRONREACH CANYONS] <-----------> [2. THE VERDANT EXPANSE]
               (Acoustic Rift Basalt)                     (Worldroot Primeval Canopy)
                                  ^                   ^
                                   \                 /
                                    \               /
                                     v             v
                              [1. FREE CITY OF LUMENPORT]
                                (Central Convergence Hub)
```

1. **Free City of Lumenport & Accord Trade Roads (Level 1–6):**
   - *Theme:* Sunlit coastal harbor city where all eight faction leylines converge at octagonal slate dueling tables.
   - *Key Districts:* Arrival Square, Central Card Market, Duelist Plaza, Lantern Row Residential District, Grand Tournament Hall, Accord Institute & Observatory.
   - *Key NPCs:* Grand Marshal Corin Thorne, Master Artificer Vance, Soren of Whisperleaf, Kaelen Emberforge, Lyra Vane, Mira Solis.
2. **The Verdant Expanse (Level 4–10):**
   - *Theme:* Primeval temperate rainforest and bioluminescent root-cathedrals guarded by the treants and druids of the Verdant Pact.
   - *Key Landmarks:* Rootbridge Crossing, Whispering High Canopy, Twelve White Birches Sanctuary, Root-Bound Cathedral of Elder Yew, Sun-Dew Conservatory Glades, Briar-Gate Borderland March.
   - *Key NPCs:* Elder Orla, Ranger Bram, Arch-Druid Sylvanus Rootbinder, Grove-Speaker Elowen, Thornweaver Myra, Fenn the Spore-Collector.
3. **The Ironreach Canyons (Level 8–14):**
   - *Theme:* Sheer ironstone gorges bridged by towering brass viaducts where the Iron Choir synchronizes clockwork automata and foundry presses to the Great Metronome.
   - *Key Landmarks:* Grand Gantry of the Seventh Chime, Clockwork Proving Floor, Bell-Spire of Saint Automaton, Induction Railhead, Harmonic Dynamo Vaults, Cindervault Ridge Smeltery.
   - *Key NPCs:* Conductor-General Vespera, Clocksmith Greta, Dynamo Architect Vorne, Prime Automaton Aegis-IX, Grand Master Vaelor, Crucible Matron Hespa.
4. **The High Astral Archive (Level 14–20 Climax):**
   - *Theme:* Cloud-piercing marble observatories, floating starlight scriptoriums, and zero-gravity celestial bridges suspended above Mount Solitude.
   - *Key Landmarks:* Observatory Beyond Dawn, Star-Bridge of the Ninth Hour, High Astral Archive Rotunda, Comet-Fall Terrace, Zenith Meridian Sanctuary, Sanctum of the First Conjunction.
   - *Key NPCs:* Grand Astromancer Celeste, The Convergence Sovereign, Crownbearer Solarius, Comet-Ranger Orion, Arch-Refractor Seraphina, Star-Seer Aurelia.

---

## 3. The Complete 12-Chapter Campaign

The main campaign features a sequential 12-chapter narrative arc spanning Acts 1 through 4. Each chapter provides exposition, multi-step objectives, validated boss encounter configurations, unique field rules, and progression milestones.

### Act 1: Lumenport (The Awakening of Echoes)
- **Chapter 1: The Harbor Pier & First Echo (Level 1)**
  - *Setting:* Lumenport Arrival Square & Beacon Pier.
  - *Boss Encounter:* Kaelen Emberforge (`deck_ember_iron_forge`).
  - *Special Rule:* *Neutral Harbor Accord* — Creatures summoned in Center Lane gain +1 Health during Turn 1.
  - *Narrative:* The Wanderer arrives in Lumenport, receives registration cards from Envoy Soren, and tests their initial resonance.
- **Chapter 2: The Resonance Emporium & The Artificer's Trial (Level 2)**
  - *Setting:* Central Card Market Colonnade.
  - *Boss Encounter:* Tactical Instructor Garrick Hale (`deck_iron_glass_citadel`).
  - *Special Rule:* *Artificer Dynamo* — Relics cost 1 less Aether to deploy (minimum 1).
  - *Narrative:* Investigating fractured card echoes in Vance's workshop; learning card crafting and three-lane geometry.
- **Chapter 3: The Grand Marshal's Invitational & The Leyline Fracture (Level 4)**
  - *Setting:* Lumenport Grand Tournament Hall.
  - *Boss Encounter:* Grand Marshal Corin Thorne (`deck_accord_grand_alliance`).
  - *Special Rule:* *Championship Spotlight* — When a Colossus or Vanguard attacks, draw 1 card.
  - *Narrative:* A tremor shakes the arena during the championship bout; foreign energy leaks from the outer leylines.

### Act 2: The Verdant Expanse (The Living Accord)
- **Chapter 4: The Whispering High Canopy & The Ironwood Treason (Level 5)**
  - *Setting:* Rootbridge Crossing & Whispering Canopy.
  - *Boss Encounter:* Thornweaver Myra (`deck_verdant_tide_harmony`).
  - *Special Rule:* *Deep Canopy Bloom* — At end of round, all wounded creatures heal 1 Health.
  - *Narrative:* Gravewild necrotic spores threaten the root-wards; negotiating passage with the forest wardens.
- **Chapter 5: The Twelve Birches Healing & The Mycelium Rift (Level 7)**
  - *Setting:* Twelve White Birches Sanctuary & Old Growth Shaded Glen.
  - *Boss Encounter:* Elder Orla of the Canopy (`deck_verdant_grave_cycle`).
  - *Special Rule:* *Spring Vitality* — Creatures played in Left or Right lane gain +1 Attack on deploy turn.
  - *Narrative:* Purifying tainted mycelium nodes with Alchemist Fenn; proving worthy of the root-heart.
- **Chapter 6: The Siege of Briar-Gate & The Primeval Awakener (Level 9)**
  - *Setting:* Briar-Gate March & Elder Yew Cathedral.
  - *Boss Encounter:* Arch-Druid Sylvanus Rootbinder (`deck_verdant_iron_resonance`).
  - *Special Rule:* *Briar Thorns* — Direct attacks inflict 1 recoil damage on the attacker.
  - *Narrative:* Halting the radical awakening of the ancient treants to restore balance to the nature leylines.

### Act 3: The Ironreach Canyons (The Harmonic Machine)
- **Chapter 7: The Induction Railhead & Slag-Gate Sabotage (Level 10)**
  - *Setting:* Ironreach Induction Railhead.
  - *Boss Encounter:* Dynamo Architect Vorne (`deck_iron_tide_dreadnought`).
  - *Special Rule:* *Resonance Cadence* — Every 4th turn, all active automatons and relics gain 1 Armor.
  - *Narrative:* Intercepting saboteurs attempting to dump volcanic slag onto residential gantries.
- **Chapter 8: The Seventh Chime & The Clockwork Metronome (Level 12)**
  - *Setting:* Grand Gantry of the Seventh Chime & Bell-Spire of Saint Automaton.
  - *Boss Encounter:* Conductor-General Vespera (`deck_iron_glass_citadel`).
  - *Special Rule:* *Clockwork Clock* — Both players draw an extra card during odd-numbered turns.
  - *Narrative:* Recalibrating the Great Metronome after an alien glass crystal disrupts its four-four rhythm.
- **Chapter 9: The Dynamo Core Crisis & The Automaton Titan (Level 14)**
  - *Setting:* The Harmonic Dynamo Vaults.
  - *Boss Encounter:* Prime Automaton Aegis-IX (`deck_ember_iron_forge`).
  - *Special Rule:* *Overloaded Dynamo* — Tactics and spells deal +1 damage to all targets in lane.
  - *Narrative:* Defeating the rogue sentinel Aegis-IX before its emergency lockdown traps the continent.

### Act 4: The High Astral Archive (The Celestial Convergence)
- **Chapter 10: The Comet-Fall Ascent & Star-Bridge Guard (Level 15)**
  - *Setting:* Star-Bridge of the Ninth Hour & Observatory Beyond Dawn.
  - *Boss Encounter:* Comet-Ranger Orion (`deck_tide_star_navigation`).
  - *Special Rule:* *Starlight Clarity* — Both players scry the top 2 cards of their deck at start of turn.
  - *Narrative:* Ascending above the clouds during a meteor shower to reach the celestial observatory.
- **Chapter 11: The Auroral Scriptorium & The Echo Conjunction (Level 17)**
  - *Setting:* Auroral Scriptorium & Zenith Meridian.
  - *Boss Encounter:* Crownbearer Solarius (`deck_glass_star_celestial`).
  - *Special Rule:* *Astral Resonance* — Legendary and Rare cards cost 1 less Aether to play.
  - *Narrative:* Uncovering the First-Age star-plates that anchor reality itself against the void.
- **Chapter 12: The Sanctum of the First Conjunction & The Convergence Sovereign (Level 20 Climax)**
  - *Setting:* Sanctum of the First Conjunction atop the Celestial Spire.
  - *Boss Encounter:* The Convergence Sovereign (`deck_accord_grand_alliance`).
  - *Special Rule:* *Total Leyline Convergence* — Random faction resonance grants +1 Power to all allied units in one random lane each turn.
  - *Narrative:* The ultimate 1v1 Convergence Duel deciding whether the Great Accord endures or fractures forever.

---

## 4. 80 Named NPCs Overview

The 80 NPCs are evenly divided among the four regions (20 per region) and fully populated with:
- Canonical entity names and titles conforming to the World Bible.
- Validated archetype deck IDs from `starter_decks.json`.
- Comprehensive dialogue trees (greeting, friendly, bonded, victory, defeat, quest prompt, lore tidbits).
- Full morning/afternoon/evening routine schedules.
- Defined gameplay functions: card traders, dust craft artisans, sparring mentors, tournament officiants, companion partners.

---

## 5. 120 Original Side Quests Architecture

Side quests are distributed evenly (30 per region) across eight distinct gameplay categories:
- **Investigation:** Uncovering conspiracies, analyzing leyline disturbances, inspecting boundary wards.
- **Duel Challenge:** Testing specific lane tactics, role restrictions, or deck cost curves.
- **Collection:** Gathering rare herbs, salvage relics, or missing first-edition card prints.
- **Dungeon Delve:** Exploring subterranean chambers and defeating regional dungeon bosses.
- **Tournament Qualifier:** Earning ranking tickets and defeating seeded duelists.
- **Companion Story:** Deepening character bonds and learning backstories.
- **Bounty:** Hunting rogue duelists, smugglers, and dangerous roaming constructs.
- **Puzzle:** Solving optical prism riddles, metronome timing locks, and astronomical alignments.

---

## 6. 16 Dungeons & Environmental Hazards

Each of the 16 dungeons contains 3 to 4 floors of escalating encounters, environmental lane hazards, and unique boss passive rules:
1. `dung_lumen_sunken_lighthouse_vault` (Tidal Swell)
2. `dung_lumen_smuggler_shadow_canals` (Veiled Mist)
3. `dung_lumen_salt_warehouse_catacombs` (Corrosive Salt)
4. `dung_lumen_tidebreaker_cellars` (Crushing Depth)
5. `dung_verd_sporemist_hollows` (Spore Cloud)
6. `dung_verd_elder_yew_roots` (Worldroot Regeneration)
7. `dung_verd_bramble_cairn_crypts` (Thorny Grave)
8. `dung_verd_petal_chasm_conservatory` (Solar Blossom)
9. `dung_iron_overheated_slag_core` (Molten Floor)
10. `dung_iron_clockwork_testing_vaults` (Gear Lock)
11. `dung_iron_resonance_sub_basement` (Acoustic Shockwave)
12. `dung_iron_abandoned_mine_ignis` (Volatile Ignis Gas)
13. `dung_astral_scriptorium_labyrinth` (Written Fate)
14. `dung_astral_star_pylon_sublevels` (Meteoric Gravity)
15. `dung_astral_zenith_mirror_gallery` (Reflective Ward)
16. `dung_astral_comet_chamber_crypt` (Total Alignment)

---

## 7. 8 Regional & Grand Tournaments

Tournaments feature 8 to 16 duelist brackets, entry fee structures, and unique prestige trophies:
- **Lumenport Novice Cup:** Level 3 open bracket in Duelist Plaza.
- **Harbor Guild 2v2 Tag Championship:** Level 6 Tag-Team tournament in Grand Tournament Hall.
- **Verdant Canopy Invitational:** Level 8 high-canopy Bloom specialty bracket.
- **Bramble-Wood High-Attrition Gauntlet:** Level 10 endurance tournament.
- **Ironreach Resonance Grand Prix:** Level 12 clockwork precision championship.
- **Foundry Master's Iron Bout:** Level 14 Overheat specialty bout.
- **High Astral Zenith Trials:** Level 16 celestial alignment competition.
- **Grand All-Factions Convergence Masters:** Level 18 ultimate 16-duelist championship.

---

## 8. 24 Companion Stories & Passives

Eight major companions offer three-tier progressive storylines (Trust, Trial, Climax) unlocking powerful companion tag abilities:
1. **Soren of Whisperleaf:** *Verdant Symbiosis* (+1 Health on entry).
2. **Kaelen Emberforge:** *Slag Vanguard* (+1 Attack to first vanguard).
3. **Lyra Vane:** *Prism Deflection* (1 Ward shield on first spell).
4. **Captain Nerissa Wake:** *Tidal Maneuver* (free lane shift once per turn).
5. **Keeper Morwen Vale:** *Lantern Memory* (Echo dust upon creature death).
6. **Astromancer Celeste Oryn:** *Celestial Scry* (scry top card at round start).
7. **Vesper of the Crescent Mask:** *Shadow Veil* (tactics cannot be countered turn 1).
8. **Tactical Instructor Garrick Hale:** *Disciplined Bulwark* (+1 Armor to bulwarks).

---

## 9. 32 Secrets & 20 Elite Encounters

- **32 Secrets (8 per region):** Riddle-based caches, hidden rooms, and ancient glyphs that require environmental exploration and card element harmonization.
- **20 Elite Encounters (5 per region):** Roaming bounty bosses with custom combat traits (e.g., *Mist Veil*, *Iron Stance*, *Mirage Step*, *Heavy Armor Plate*, *Supernova Burst*).

---

## 10. Automated Validation & Referential Integrity Suite

Validation is continuously enforced by:
- `tools/card-validator/world_validator.mjs`
- `services/api/tests/world_content_validation.test.mjs`

### Verification Summary
- **Canonical Card Total:** 640 cards (368 Creatures, 136 Tactics, 88 Relics, 48 Environments)
- **Rarity Totals:** 320 Common, 192 Uncommon, 96 Rare, 32 Legendary, 0 Epic
- **NPC Deck Integrity:** 100% of NPC decks resolve to verified 40-card archetype decks.
- **Quest Reward Integrity:** 100% of bonus card drops resolve to valid foundations card IDs.
- **Referential Integrity Errors:** **0 Errors, 0 Warnings.**
