# Convergence Duels — Official Rules Engine Specification

## 1. Standard Match Configuration
- **Format:** 1v1 Standard (30 Leader Vitality) and 2v2 Tag Foundation (45 Team Vitality).
- **Main Deck:** Exactly 40 cards (`<= 2` major factions + Neutral; Common max 3, Uncommon max 3, Rare max 2, Legendary max 1).
- **Hand:** 5-card opening hand, maximum hand size 9 (overdrawn cards move to discard).
- **Mulligan:** Once at match start, each player may replace up to 3 cards (shuffled back into deck before drawing replacements).
- **Aether Resource:** Starts at 1 capacity, increases by +1 at the start of each turn up to 10, and refills each turn.
- **First-Turn Balance:** Player 0 skips the initial draw on Turn 1 and cannot attack during Turn 1.
- **Turn Limit:** 40 turns per player, followed by remaining-Vitality tiebreaker resolution.

## 2. Three-Lane Board & Combat Positioning
- **Lanes:** `LEFT (0)` | `CENTER (1)` | `RIGHT (2)`.
- **Slots per Lane per Side:** `FRONT` and `REAR` (maximum 6 active creatures per player).
- **Front Line Protection:** The `FRONT` slot protects the `REAR` slot in the same lane by default.
  - Normal attackers must target the enemy `FRONT` creature in their lane.
  - If no `FRONT` creature is present, they may target the enemy `REAR` creature.
  - If the lane contains no blocking enemy creatures, they may attack the opposing Leader directly.
  - **Reach** allows targeting an enemy `REAR` creature past an unguarded `FRONT` creature (a Front creature without **Guard**).

## 3. Lane Control & Resonate
- A player controls a lane at the end of their turn if they have at least 1 creature in that lane and the opponent has 0 creatures in that lane.
- Controlling **2 or more lanes** activates the global **Resonate** condition for that player.

## 4. Eight Factions & Signature Mechanics
1. **Emberclad (`Overheat`):** Accumulates `heat` counters to boost attack and trigger forge synergies; 3+ Heat inflicts 1 end-of-turn self-damage.
2. **Verdant Pact (`Bloom`):** Accumulates `growth` counters (+1/+1) and triggers threshold bonuses and healing.
3. **Iron Choir (`Assembly`):** Accumulates `assembly` counters, deploys construct drones, and synergizes with Relics and Shields.
4. **Tidebound (`Current`):** Triggers bonuses when creatures change lanes (`Skirmish`) or return to hand (`Recall`).
5. **Glassborne (`Refraction`):** Deploys `Ward` barriers and reflects damage back at attackers.
6. **Nocturne (`Veil`):** Enters play with `Stealth` concealment, silences threats, and gains ambush bonuses when breaking Stealth.
7. **Starweave (`Alignment`):** Accumulates `alignment` counters when playing Tactics/Environments and rewards `Resonate` lane control.
8. **Gravewild (`Reclaim`):** Uses `Rebirth` death tokens, `Corrode` (-1/-1) counters, and once-per-card `Reclaim` recursion from the discard pile.
