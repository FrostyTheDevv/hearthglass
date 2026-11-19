use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashSet};

pub const STARTING_VITALITY_1V1: i32 = 30;
pub const STARTING_VITALITY_2V2: i32 = 45;
pub const DECK_SIZE_STANDARD: usize = 40;
pub const STARTING_HAND_SIZE: usize = 5;
pub const MAX_HAND_SIZE: usize = 9;
pub const NUM_LANES: usize = 3;
pub const MAX_RELICS_PER_PLAYER: usize = 2;
pub const MAX_AETHER_CAPACITY: u8 = 10;
pub const MAX_TURNS_PER_PLAYER: u32 = 40;
pub const MAX_EFFECT_DEPTH: usize = 16;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CardType {
    Creature,
    Tactic,
    Relic,
    Environment,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Faction {
    Emberclad,
    VerdantPact,
    IronChoir,
    Tidebound,
    Glassborne,
    Nocturne,
    Starweave,
    Gravewild,
    Neutral,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Legendary,
}

impl Rarity {
    pub fn max_copies(self) -> usize {
        match self {
            Rarity::Common => 3,
            Rarity::Uncommon => 3,
            Rarity::Rare => 2,
            Rarity::Legendary => 1,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CombatRole {
    Vanguard,
    Bulwark,
    Assassin,
    Marksman,
    Caster,
    Support,
    Trickster,
    Summoner,
    Controller,
    Colossus,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ConditionDefinition {
    #[serde(rename = "type")]
    pub condition_type: String,
    #[serde(default)]
    pub counter: Option<String>,
    #[serde(default)]
    pub value: Option<i32>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EffectDefinition {
    pub operation: String,
    pub target: String,
    #[serde(default)]
    pub amount: Option<i32>,
    #[serde(default)]
    pub counter: Option<String>,
    #[serde(default)]
    pub attack_delta: Option<i32>,
    #[serde(default)]
    pub health_delta: Option<i32>,
    #[serde(default)]
    pub keyword: Option<String>,
    #[serde(default)]
    pub token_name: Option<String>,
    #[serde(default)]
    pub attack: Option<i32>,
    #[serde(default)]
    pub health: Option<i32>,
    #[serde(default)]
    pub keywords: Option<Vec<String>>,
    #[serde(default)]
    pub direction: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AbilityDefinition {
    pub trigger: String,
    #[serde(default)]
    pub conditions: Vec<ConditionDefinition>,
    #[serde(default)]
    pub effects: Vec<EffectDefinition>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CardDefinition {
    pub id: String,
    pub revision: u32,
    pub name: String,
    #[serde(rename = "type")]
    pub card_type: CardType,
    pub subtype: String,
    pub faction: Faction,
    pub rarity: Rarity,
    pub role: Option<CombatRole>,
    pub cost: u8,
    pub attack: i32,
    pub health: i32,
    #[serde(default)]
    pub keywords: Vec<String>,
    #[serde(default)]
    pub mechanics: Vec<String>,
    #[serde(default)]
    pub abilities: Vec<AbilityDefinition>,
    pub description: String,
    pub lore: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardBundle {
    pub schema_version: String,
    pub release_set: String,
    pub balance_version: String,
    pub cards: Vec<CardDefinition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeckCardEntry {
    pub card_id: String,
    pub count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeckDefinition {
    pub id: String,
    pub name: String,
    pub description: String,
    pub factions: Vec<Faction>,
    pub total_cards: usize,
    pub cards: Vec<DeckCardEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StarterDecksFile {
    pub schema_version: String,
    pub decks: Vec<DeckDefinition>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeckValidationResult {
    pub valid: bool,
    pub errors: Vec<String>,
}

pub fn validate_deck(
    deck: &DeckDefinition,
    catalogue: &BTreeMap<String, CardDefinition>,
) -> DeckValidationResult {
    let mut errors = Vec::new();
    let mut total_cards = 0usize;
    let mut major_factions = HashSet::new();
    let mut seen_ids = HashSet::new();

    for entry in &deck.cards {
        if !seen_ids.insert(entry.card_id.clone()) {
            errors.push(format!("Duplicate card entry in deck: {}", entry.card_id));
        }
        match catalogue.get(&entry.card_id) {
            None => errors.push(format!("Unknown card ID: {}", entry.card_id)),
            Some(card) => {
                total_cards += entry.count;
                if card.faction != Faction::Neutral {
                    major_factions.insert(card.faction);
                }
                let max_copies = card.rarity.max_copies();
                if entry.count == 0 || entry.count > max_copies {
                    errors.push(format!(
                        "Card {} ({:?}) has {} copies, allowed 1..={}",
                        card.id, card.rarity, entry.count, max_copies
                    ));
                }
            }
        }
    }

    if total_cards != DECK_SIZE_STANDARD {
        errors.push(format!(
            "Standard deck must contain exactly {} cards, found {}",
            DECK_SIZE_STANDARD, total_cards
        ));
    }

    if major_factions.len() > 2 {
        errors.push(format!(
            "Deck contains {} major factions (maximum 2 allowed)",
            major_factions.len()
        ));
    }

    DeckValidationResult {
        valid: errors.is_empty(),
        errors,
    }
}

/// Deterministic SplitMix64 PRNG for cross-platform reproducible shuffling and replay validation.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeterministicRng {
    state: u64,
}

impl DeterministicRng {
    pub fn new(seed: u64) -> Self {
        Self {
            state: if seed == 0 { 0x9E3779B97F4A7C15 } else { seed },
        }
    }

    pub fn next_u64(&mut self) -> u64 {
        self.state = self.state.wrapping_add(0x9E3779B97F4A7C15);
        let mut z = self.state;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58476D1CE4E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D049BB133111EB);
        z ^ (z >> 31)
    }

    pub fn shuffle<T>(&mut self, slice: &mut [T]) {
        if slice.len() <= 1 {
            return;
        }
        for i in (1..slice.len()).rev() {
            let j = (self.next_u64() as usize) % (i + 1);
            slice.swap(i, j);
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SlotPosition {
    Front,
    Rear,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CardInstance {
    pub instance_id: u32,
    pub card_id: String,
    pub owner: usize,
    pub reclaimed: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CreatureUnit {
    pub instance_id: u32,
    pub card_id: String,
    pub name: String,
    pub owner: usize,
    pub controller: usize,
    pub faction: Faction,
    pub attack: i32,
    pub health: i32,
    pub max_health: i32,
    pub keywords: Vec<String>,
    pub counters: BTreeMap<String, i32>,
    pub ready: bool,
    pub attacks_this_turn: u8,
    pub moved_this_turn: bool,
    pub silenced: bool,
    pub is_token: bool,
    pub reclaimed: bool,
}

impl CreatureUnit {
    pub fn has_keyword(&self, kw: &str) -> bool {
        if self.silenced && kw != "guard" {
            return false;
        }
        self.keywords.iter().any(|k| k == kw)
    }

    pub fn add_keyword(&mut self, kw: &str) {
        if !self.keywords.iter().any(|k| k == kw) {
            self.keywords.push(kw.to_string());
        }
    }

    pub fn remove_keyword(&mut self, kw: &str) {
        self.keywords.retain(|k| k != kw);
    }
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct LaneSide {
    pub front: Option<CreatureUnit>,
    pub rear: Option<CreatureUnit>,
}

impl LaneSide {
    pub fn get(&self, pos: SlotPosition) -> Option<&CreatureUnit> {
        match pos {
            SlotPosition::Front => self.front.as_ref(),
            SlotPosition::Rear => self.rear.as_ref(),
        }
    }

    pub fn get_mut(&mut self, pos: SlotPosition) -> Option<&mut CreatureUnit> {
        match pos {
            SlotPosition::Front => self.front.as_mut(),
            SlotPosition::Rear => self.rear.as_mut(),
        }
    }

    pub fn set(&mut self, pos: SlotPosition, unit: Option<CreatureUnit>) {
        match pos {
            SlotPosition::Front => self.front = unit,
            SlotPosition::Rear => self.rear = unit,
        }
    }

    pub fn has_any(&self) -> bool {
        self.front.is_some() || self.rear.is_some()
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RelicInstance {
    pub instance_id: u32,
    pub card_id: String,
    pub name: String,
    pub owner: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EnvironmentInstance {
    pub instance_id: u32,
    pub card_id: String,
    pub name: String,
    pub controller: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlayerState {
    pub player_index: usize,
    pub team_index: usize,
    pub vitality: i32,
    pub max_vitality: i32,
    pub aether: u8,
    pub aether_capacity: u8,
    pub deck: Vec<CardInstance>,
    pub hand: Vec<CardInstance>,
    pub discard: Vec<CardInstance>,
    pub lanes: [LaneSide; NUM_LANES],
    pub relics: Vec<RelicInstance>,
    pub mulligan_done: bool,
    pub resonate_active: bool,
    pub turns_taken: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MatchFormat {
    Standard1v1,
    Tag2v2,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MatchOutcome {
    InProgress,
    PlayerVictory(usize),
    TeamVictory(usize),
    Draw,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum BattleCommand {
    Mulligan {
        player: usize,
        replace_hand_indices: Vec<usize>,
    },
    SummonCreature {
        player: usize,
        hand_index: usize,
        lane: usize,
        position: SlotPosition,
    },
    PlayTactic {
        player: usize,
        hand_index: usize,
        target_lane: Option<usize>,
        target_position: Option<SlotPosition>,
    },
    PlayRelic {
        player: usize,
        hand_index: usize,
    },
    PlayEnvironment {
        player: usize,
        hand_index: usize,
    },
    MoveCreature {
        player: usize,
        from_lane: usize,
        from_position: SlotPosition,
        to_lane: usize,
        to_position: SlotPosition,
    },
    AttackCreature {
        player: usize,
        attacker_lane: usize,
        attacker_position: SlotPosition,
        defender_lane: usize,
        defender_position: SlotPosition,
    },
    AttackLeader {
        player: usize,
        attacker_lane: usize,
        attacker_position: SlotPosition,
    },
    EndTurn {
        player: usize,
    },
    Surrender {
        player: usize,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "event", rename_all = "snake_case")]
pub enum BattleEvent {
    MatchStarted {
        format: MatchFormat,
        active_player: usize,
    },
    MulliganCompleted {
        player: usize,
        replaced_count: usize,
    },
    TurnStarted {
        player: usize,
        turn_number: u32,
        aether: u8,
    },
    CardDrawn {
        player: usize,
        card_id: String,
    },
    CardBurnedOverdraw {
        player: usize,
        card_id: String,
    },
    CreatureSummoned {
        player: usize,
        card_id: String,
        name: String,
        lane: usize,
        position: SlotPosition,
        is_token: bool,
    },
    TacticPlayed {
        player: usize,
        card_id: String,
        name: String,
    },
    RelicPlayed {
        player: usize,
        card_id: String,
        name: String,
    },
    EnvironmentReplaced {
        previous_card_id: Option<String>,
        new_card_id: String,
        controller: usize,
    },
    CreatureMoved {
        player: usize,
        card_id: String,
        from_lane: usize,
        from_position: SlotPosition,
        to_lane: usize,
        to_position: SlotPosition,
    },
    CombatDeclared {
        attacker_player: usize,
        attacker_card_id: String,
        lane: usize,
        target_description: String,
    },
    DamageDealt {
        target_description: String,
        amount: i32,
    },
    ShieldAbsorbed {
        card_id: String,
        lane: usize,
    },
    WardTriggered {
        card_id: String,
        lane: usize,
    },
    LeaderHealed {
        player: usize,
        amount: i32,
        new_vitality: i32,
    },
    LeaderDamaged {
        player: usize,
        amount: i32,
        new_vitality: i32,
    },
    CreatureDestroyed {
        owner: usize,
        card_id: String,
        name: String,
        lane: usize,
        position: SlotPosition,
    },
    ResonateUpdated {
        player: usize,
        controlled_lanes: usize,
        active: bool,
    },
    MatchEnded {
        outcome: MatchOutcome,
        reason: String,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CommandExecutionResult {
    pub accepted: bool,
    pub error: Option<String>,
    pub events: Vec<BattleEvent>,
    pub state_checksum: u64,
    pub outcome: MatchOutcome,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchState {
    pub format: MatchFormat,
    pub rule_version: String,
    pub global_turn: u32,
    pub active_player: usize,
    pub players: Vec<PlayerState>,
    pub active_environment: Option<EnvironmentInstance>,
    pub outcome: MatchOutcome,
    pub rng: DeterministicRng,
    pub next_instance_id: u32,
    pub event_log: Vec<BattleEvent>,
}

impl MatchState {
    pub fn new_1v1(
        deck_a: &DeckDefinition,
        deck_b: &DeckDefinition,
        catalogue: &BTreeMap<String, CardDefinition>,
        seed: u64,
    ) -> Result<Self, String> {
        let val_a = validate_deck(deck_a, catalogue);
        if !val_a.valid {
            return Err(format!("Player 0 deck invalid: {:?}", val_a.errors));
        }
        let val_b = validate_deck(deck_b, catalogue);
        if !val_b.valid {
            return Err(format!("Player 1 deck invalid: {:?}", val_b.errors));
        }

        let mut rng = DeterministicRng::new(seed);
        let mut next_id = 1u32;

        let build_player = |idx: usize,
                            team: usize,
                            vitality: i32,
                            deck_def: &DeckDefinition,
                            rng: &mut DeterministicRng,
                            next_id: &mut u32|
         -> PlayerState {
            let mut deck = Vec::with_capacity(DECK_SIZE_STANDARD);
            for entry in &deck_def.cards {
                for _ in 0..entry.count {
                    deck.push(CardInstance {
                        instance_id: *next_id,
                        card_id: entry.card_id.clone(),
                        owner: idx,
                        reclaimed: false,
                    });
                    *next_id += 1;
                }
            }
            rng.shuffle(&mut deck);
            let mut hand = Vec::with_capacity(STARTING_HAND_SIZE);
            for _ in 0..STARTING_HAND_SIZE {
                if let Some(card) = deck.pop() {
                    hand.push(card);
                }
            }
            PlayerState {
                player_index: idx,
                team_index: team,
                vitality,
                max_vitality: vitality,
                aether: if idx == 0 { 1 } else { 0 },
                aether_capacity: if idx == 0 { 1 } else { 0 },
                deck,
                hand,
                discard: Vec::new(),
                lanes: [
                    LaneSide::default(),
                    LaneSide::default(),
                    LaneSide::default(),
                ],
                relics: Vec::new(),
                mulligan_done: false,
                resonate_active: false,
                turns_taken: if idx == 0 { 1 } else { 0 },
            }
        };

        let p0 = build_player(0, 0, STARTING_VITALITY_1V1, deck_a, &mut rng, &mut next_id);
        let p1 = build_player(1, 1, STARTING_VITALITY_1V1, deck_b, &mut rng, &mut next_id);

        let start_event = BattleEvent::MatchStarted {
            format: MatchFormat::Standard1v1,
            active_player: 0,
        };

        Ok(Self {
            format: MatchFormat::Standard1v1,
            rule_version: "1.0.0".to_string(),
            global_turn: 1,
            active_player: 0,
            players: vec![p0, p1],
            active_environment: None,
            outcome: MatchOutcome::InProgress,
            rng,
            next_instance_id: next_id,
            event_log: vec![start_event],
        })
    }

    /// Initializes a 2v2 Tag Battle (Section 5.8).
    /// Turn rotation: Player 0 (Team 0, A1) -> Player 1 (Team 1, B1) -> Player 2 (Team 0, A2) -> Player 3 (Team 1, B2).
    /// Team 0 shares 45 Team Vitality and Team 0's 3-lane board (`players[0].lanes` & `players[0].relics`).
    /// Team 1 shares 45 Team Vitality and Team 1's 3-lane board (`players[1].lanes` & `players[1].relics`).
    /// Each of the 4 players maintains an independent 40-card deck, hand, discard pile, and personal Aether pool.
    pub fn new_2v2(
        decks: [&DeckDefinition; 4],
        catalogue: &BTreeMap<String, CardDefinition>,
        seed: u64,
    ) -> Result<Self, String> {
        for (i, d) in decks.iter().enumerate() {
            let val = validate_deck(d, catalogue);
            if !val.valid {
                return Err(format!("Player {} deck invalid: {:?}", i, val.errors));
            }
        }

        let mut rng = DeterministicRng::new(seed);
        let mut next_id = 1u32;
        let mut players = Vec::with_capacity(4);

        for (idx, deck_def) in decks.iter().enumerate() {
            let mut deck = Vec::with_capacity(DECK_SIZE_STANDARD);
            for entry in &deck_def.cards {
                for _ in 0..entry.count {
                    deck.push(CardInstance {
                        instance_id: next_id,
                        card_id: entry.card_id.clone(),
                        owner: idx,
                        reclaimed: false,
                    });
                    next_id += 1;
                }
            }
            rng.shuffle(&mut deck);
            let mut hand = Vec::with_capacity(STARTING_HAND_SIZE);
            for _ in 0..STARTING_HAND_SIZE {
                if let Some(card) = deck.pop() {
                    hand.push(card);
                }
            }
            players.push(PlayerState {
                player_index: idx,
                team_index: idx % 2,
                vitality: STARTING_VITALITY_2V2,
                max_vitality: STARTING_VITALITY_2V2,
                aether: if idx == 0 { 1 } else { 0 },
                aether_capacity: if idx == 0 { 1 } else { 0 },
                deck,
                hand,
                discard: Vec::new(),
                lanes: [
                    LaneSide::default(),
                    LaneSide::default(),
                    LaneSide::default(),
                ],
                relics: Vec::new(),
                mulligan_done: false,
                resonate_active: false,
                turns_taken: if idx == 0 { 1 } else { 0 },
            });
        }

        let start_event = BattleEvent::MatchStarted {
            format: MatchFormat::Tag2v2,
            active_player: 0,
        };

        Ok(Self {
            format: MatchFormat::Tag2v2,
            rule_version: "1.0.0".to_string(),
            global_turn: 1,
            active_player: 0,
            players,
            active_environment: None,
            outcome: MatchOutcome::InProgress,
            rng,
            next_instance_id: next_id,
            event_log: vec![start_event],
        })
    }

    /// Returns the canonical player index that holds the team board, team relics, and team vitality for `player`.
    /// In 1v1: 0 -> 0, 1 -> 1.
    /// In 2v2: Team 0 (players 0 and 2) -> 0; Team 1 (players 1 and 3) -> 1.
    pub fn board_holder(&self, player: usize) -> usize {
        self.players
            .get(player)
            .map(|p| p.team_index)
            .unwrap_or(player % 2)
    }

    pub fn opposing_board_holder(&self, player: usize) -> usize {
        let my_team = self.board_holder(player);
        if my_team == 0 {
            1
        } else {
            0
        }
    }

    pub fn opponent_of(&self, player: usize) -> usize {
        self.opposing_board_holder(player)
    }

    fn sync_team_state(&mut self) {
        if self.format == MatchFormat::Tag2v2 && self.players.len() == 4 {
            for team in [0usize, 1usize] {
                let partner = team + 2;
                let vit = self.players[team].vitality;
                let max_vit = self.players[team].max_vitality;
                let lanes = self.players[team].lanes.clone();
                let relics = self.players[team].relics.clone();
                let res = self.players[team].resonate_active;
                self.players[partner].vitality = vit;
                self.players[partner].max_vitality = max_vit;
                self.players[partner].lanes = lanes;
                self.players[partner].relics = relics;
                self.players[partner].resonate_active = res;
            }
        }
    }

    /// Produces a redacted snapshot of the match state for a specific viewer (`Some(player_index)`) or spectator (`None`).
    /// Never exposes any player's draw deck order or opponents' hidden hand card IDs.
    pub fn redact_for_player(&self, viewer: Option<usize>) -> Self {
        let mut copy = self.clone();
        // Zero out internal RNG state so clients cannot predict future draws
        copy.rng = DeterministicRng::new(0);

        for p in &mut copy.players {
            for card in &mut p.deck {
                card.card_id = "HIDDEN".to_string();
                card.instance_id = 0;
            }
            let can_see_hand = match viewer {
                Some(v) => {
                    if self.format == MatchFormat::Tag2v2 {
                        // In 2v2 Tag Battles, teammates can coordinate or only see their own hand; keep opponent hands hidden
                        v == p.player_index
                    } else {
                        v == p.player_index
                    }
                }
                None => false,
            };
            if !can_see_hand {
                for card in &mut p.hand {
                    card.card_id = "HIDDEN".to_string();
                    card.instance_id = 0;
                }
            }
        }

        for ev in &mut copy.event_log {
            if let BattleEvent::CardDrawn { player, card_id } = ev {
                if viewer != Some(*player) {
                    *card_id = "HIDDEN".to_string();
                }
            }
        }

        copy
    }

    pub fn compute_checksum(&self) -> u64 {
        let mut hash: u64 = 0xcbf29ce484222325;
        let mut mix = |byte: u8| {
            hash ^= byte as u64;
            hash = hash.wrapping_mul(0x100000001b3);
        };
        for b in self.global_turn.to_le_bytes() {
            mix(b);
        }
        mix(self.active_player as u8);
        for p in &self.players {
            for b in p.vitality.to_le_bytes() {
                mix(b);
            }
            mix(p.aether);
            mix(p.aether_capacity);
            mix(p.deck.len() as u8);
            mix(p.hand.len() as u8);
            mix(p.discard.len() as u8);
            for lane in &p.lanes {
                for slot in [&lane.front, &lane.rear] {
                    if let Some(u) = slot {
                        for b in u.card_id.as_bytes() {
                            mix(*b);
                        }
                        for b in u.attack.to_le_bytes() {
                            mix(b);
                        }
                        for b in u.health.to_le_bytes() {
                            mix(b);
                        }
                        mix(u.ready as u8);
                    } else {
                        mix(0);
                    }
                }
            }
        }
        hash
    }

    pub fn apply_command(
        &mut self,
        cmd: BattleCommand,
        catalogue: &BTreeMap<String, CardDefinition>,
    ) -> CommandExecutionResult {
        if self.outcome != MatchOutcome::InProgress {
            return self.reject("Match has already concluded");
        }

        let mut events = Vec::new();
        let res = match cmd {
            BattleCommand::Mulligan {
                player,
                replace_hand_indices,
            } => self.handle_mulligan(player, replace_hand_indices, &mut events),
            BattleCommand::SummonCreature {
                player,
                hand_index,
                lane,
                position,
            } => self.handle_summon_creature(
                player,
                hand_index,
                lane,
                position,
                catalogue,
                &mut events,
            ),
            BattleCommand::PlayTactic {
                player,
                hand_index,
                target_lane,
                target_position,
            } => self.handle_play_tactic(
                player,
                hand_index,
                target_lane,
                target_position,
                catalogue,
                &mut events,
            ),
            BattleCommand::PlayRelic { player, hand_index } => {
                self.handle_play_relic(player, hand_index, catalogue, &mut events)
            }
            BattleCommand::PlayEnvironment { player, hand_index } => {
                self.handle_play_environment(player, hand_index, catalogue, &mut events)
            }
            BattleCommand::MoveCreature {
                player,
                from_lane,
                from_position,
                to_lane,
                to_position,
            } => self.handle_move_creature(
                player,
                from_lane,
                from_position,
                to_lane,
                to_position,
                catalogue,
                &mut events,
            ),
            BattleCommand::AttackCreature {
                player,
                attacker_lane,
                attacker_position,
                defender_lane,
                defender_position,
            } => self.handle_attack_creature(
                player,
                attacker_lane,
                attacker_position,
                defender_lane,
                defender_position,
                catalogue,
                &mut events,
            ),
            BattleCommand::AttackLeader {
                player,
                attacker_lane,
                attacker_position,
            } => self.handle_attack_leader(
                player,
                attacker_lane,
                attacker_position,
                catalogue,
                &mut events,
            ),
            BattleCommand::EndTurn { player } => {
                self.handle_end_turn(player, catalogue, &mut events)
            }
            BattleCommand::Surrender { player } => self.handle_surrender(player, &mut events),
        };

        match res {
            Ok(()) => {
                self.check_state_based_actions(catalogue, &mut events);
                self.sync_team_state();
                self.event_log.extend(events.clone());
                CommandExecutionResult {
                    accepted: true,
                    error: None,
                    events,
                    state_checksum: self.compute_checksum(),
                    outcome: self.outcome,
                }
            }
            Err(err_msg) => self.reject(&err_msg),
        }
    }

    fn reject(&self, msg: &str) -> CommandExecutionResult {
        CommandExecutionResult {
            accepted: false,
            error: Some(msg.to_string()),
            events: Vec::new(),
            state_checksum: self.compute_checksum(),
            outcome: self.outcome,
        }
    }

    fn handle_mulligan(
        &mut self,
        player: usize,
        mut indices: Vec<usize>,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        if player >= self.players.len() {
            return Err("Invalid player index".into());
        }
        let max_mulligan_turn = self.players.len() as u32;
        if self.global_turn > max_mulligan_turn || self.players[player].mulligan_done {
            return Err("Mulligan window has already closed for this player".into());
        }
        if indices.len() > 3 {
            return Err("May only mulligan up to 3 cards".into());
        }
        indices.sort_unstable();
        indices.dedup();
        for &idx in &indices {
            if idx >= self.players[player].hand.len() {
                return Err("Mulligan hand index out of bounds".into());
            }
        }

        let mut returned = Vec::new();
        for &idx in indices.iter().rev() {
            returned.push(self.players[player].hand.remove(idx));
        }
        let replaced_count = returned.len();
        self.players[player].deck.extend(returned);
        self.rng.shuffle(&mut self.players[player].deck);

        for _ in 0..replaced_count {
            if let Some(drawn) = self.players[player].deck.pop() {
                self.players[player].hand.push(drawn);
            }
        }
        self.players[player].mulligan_done = true;
        events.push(BattleEvent::MulliganCompleted {
            player,
            replaced_count,
        });
        Ok(())
    }

    fn handle_summon_creature(
        &mut self,
        player: usize,
        hand_index: usize,
        lane: usize,
        position: SlotPosition,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        self.ensure_active_player(player)?;
        if lane >= NUM_LANES {
            return Err("Invalid lane index".into());
        }
        if hand_index >= self.players[player].hand.len() {
            return Err("Hand index out of bounds".into());
        }
        let bh = self.board_holder(player);
        if self.players[bh].lanes[lane].get(position).is_some() {
            return Err("Target battlefield slot is already occupied".into());
        }

        let card_inst = self.players[player].hand[hand_index].clone();
        let def = catalogue
            .get(&card_inst.card_id)
            .ok_or_else(|| "Card definition not found".to_string())?;

        if def.card_type != CardType::Creature {
            return Err("Selected card is not a Creature".into());
        }
        if self.players[player].aether < def.cost {
            return Err("Insufficient Aether".into());
        }

        self.players[player].aether -= def.cost;
        self.players[player].hand.remove(hand_index);

        let is_swift = def.keywords.iter().any(|k| k == "swift");
        let mut counters = BTreeMap::new();
        if def.keywords.iter().any(|k| k == "shield") {
            counters.insert("shield".to_string(), 1);
        }

        let mut unit = CreatureUnit {
            instance_id: card_inst.instance_id,
            card_id: def.id.clone(),
            name: def.name.clone(),
            owner: player,
            controller: player,
            faction: def.faction,
            attack: def.attack,
            health: def.health,
            max_health: def.health,
            keywords: def.keywords.clone(),
            counters,
            ready: is_swift,
            attacks_this_turn: 0,
            moved_this_turn: false,
            silenced: false,
            is_token: false,
            reclaimed: card_inst.reclaimed,
        };

        // Crucible of the First Flame environment passive bonus
        if let Some(env) = &self.active_environment {
            if env.card_id == "EMB-E-0008" {
                unit.attack += 1;
            }
        }

        self.players[bh].lanes[lane].set(position, Some(unit));

        events.push(BattleEvent::CreatureSummoned {
            player,
            card_id: def.id.clone(),
            name: def.name.clone(),
            lane,
            position,
            is_token: false,
        });

        // Palace Beneath the Wake environment passive heal on summon
        if let Some(env) = &self.active_environment {
            if env.card_id == "TID-E-0008" {
                self.heal_leader(player, 1, events);
            }
        }

        self.execute_abilities_for_trigger(
            player,
            &def.abilities,
            "on_summon",
            Some((lane, position)),
            None,
            catalogue,
            events,
            0,
        );

        Ok(())
    }

    fn handle_play_tactic(
        &mut self,
        player: usize,
        hand_index: usize,
        target_lane: Option<usize>,
        target_position: Option<SlotPosition>,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        self.ensure_active_player(player)?;
        if hand_index >= self.players[player].hand.len() {
            return Err("Hand index out of bounds".into());
        }
        let card_inst = self.players[player].hand[hand_index].clone();
        let def = catalogue
            .get(&card_inst.card_id)
            .ok_or_else(|| "Card definition not found".to_string())?;

        if def.card_type != CardType::Tactic {
            return Err("Selected card is not a Tactic".into());
        }
        if self.players[player].aether < def.cost {
            return Err("Insufficient Aether".into());
        }

        self.players[player].aether -= def.cost;
        let removed = self.players[player].hand.remove(hand_index);

        events.push(BattleEvent::TacticPlayed {
            player,
            card_id: def.id.clone(),
            name: def.name.clone(),
        });

        let target_slot = match (target_lane, target_position) {
            (Some(l), Some(p)) if l < NUM_LANES => Some((l, p)),
            (Some(l), None) if l < NUM_LANES => Some((l, SlotPosition::Front)),
            _ => None,
        };

        self.execute_abilities_for_trigger(
            player,
            &def.abilities,
            "on_play",
            target_slot,
            None,
            catalogue,
            events,
            0,
        );

        self.trigger_alignment_on_non_creature(player);

        self.players[player].discard.push(removed);
        Ok(())
    }

    fn handle_play_relic(
        &mut self,
        player: usize,
        hand_index: usize,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        self.ensure_active_player(player)?;
        if hand_index >= self.players[player].hand.len() {
            return Err("Hand index out of bounds".into());
        }
        let bh = self.board_holder(player);
        if self.players[bh].relics.len() >= MAX_RELICS_PER_PLAYER {
            return Err("Maximum 2 active Relics per team/player".into());
        }

        let card_inst = self.players[player].hand[hand_index].clone();
        let def = catalogue
            .get(&card_inst.card_id)
            .ok_or_else(|| "Card definition not found".to_string())?;

        if def.card_type != CardType::Relic {
            return Err("Selected card is not a Relic".into());
        }
        if self.players[player].aether < def.cost {
            return Err("Insufficient Aether".into());
        }

        self.players[player].aether -= def.cost;
        self.players[player].hand.remove(hand_index);

        self.players[bh].relics.push(RelicInstance {
            instance_id: card_inst.instance_id,
            card_id: def.id.clone(),
            name: def.name.clone(),
            owner: player,
        });

        events.push(BattleEvent::RelicPlayed {
            player,
            card_id: def.id.clone(),
            name: def.name.clone(),
        });

        self.execute_abilities_for_trigger(
            player,
            &def.abilities,
            "on_play",
            None,
            None,
            catalogue,
            events,
            0,
        );

        Ok(())
    }

    fn handle_play_environment(
        &mut self,
        player: usize,
        hand_index: usize,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        self.ensure_active_player(player)?;
        if hand_index >= self.players[player].hand.len() {
            return Err("Hand index out of bounds".into());
        }

        let card_inst = self.players[player].hand[hand_index].clone();
        let def = catalogue
            .get(&card_inst.card_id)
            .ok_or_else(|| "Card definition not found".to_string())?;

        if def.card_type != CardType::Environment {
            return Err("Selected card is not an Environment".into());
        }
        if self.players[player].aether < def.cost {
            return Err("Insufficient Aether".into());
        }

        self.players[player].aether -= def.cost;
        self.players[player].hand.remove(hand_index);

        let prev_id = self.active_environment.as_ref().map(|e| e.card_id.clone());
        self.active_environment = Some(EnvironmentInstance {
            instance_id: card_inst.instance_id,
            card_id: def.id.clone(),
            name: def.name.clone(),
            controller: player,
        });

        events.push(BattleEvent::EnvironmentReplaced {
            previous_card_id: prev_id,
            new_card_id: def.id.clone(),
            controller: player,
        });

        self.execute_abilities_for_trigger(
            player,
            &def.abilities,
            "on_play",
            None,
            None,
            catalogue,
            events,
            0,
        );

        self.trigger_alignment_on_non_creature(player);
        Ok(())
    }

    fn handle_move_creature(
        &mut self,
        player: usize,
        from_lane: usize,
        from_position: SlotPosition,
        to_lane: usize,
        to_position: SlotPosition,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        self.ensure_active_player(player)?;
        if from_lane >= NUM_LANES || to_lane >= NUM_LANES {
            return Err("Invalid lane index".into());
        }
        if from_lane.abs_diff(to_lane) != 1 {
            return Err("Skirmish movement must be to an adjacent lane".into());
        }
        let bh = self.board_holder(player);
        if self.players[bh].lanes[to_lane].get(to_position).is_some() {
            return Err("Destination slot is occupied".into());
        }

        let unit = self.players[bh].lanes[from_lane]
            .get(from_position)
            .ok_or_else(|| "No creature in source slot".to_string())?
            .clone();

        if !unit.has_keyword("skirmish") {
            return Err("Creature does not have Skirmish keyword".into());
        }
        if unit.has_keyword("anchor") {
            return Err("Anchored creature cannot move".into());
        }
        if unit.moved_this_turn {
            return Err("Creature has already moved this turn".into());
        }

        let mut moved_unit = unit;
        moved_unit.moved_this_turn = true;
        self.players[bh].lanes[from_lane].set(from_position, None);
        self.players[bh].lanes[to_lane].set(to_position, Some(moved_unit.clone()));

        events.push(BattleEvent::CreatureMoved {
            player,
            card_id: moved_unit.card_id.clone(),
            from_lane,
            from_position,
            to_lane,
            to_position,
        });

        // Palace Beneath the Wake heal on move
        if let Some(env) = &self.active_environment {
            if env.card_id == "TID-E-0008" {
                self.heal_leader(player, 1, events);
            }
        }

        if let Some(def) = catalogue.get(&moved_unit.card_id) {
            self.execute_abilities_for_trigger(
                player,
                &def.abilities,
                "on_move",
                Some((to_lane, to_position)),
                None,
                catalogue,
                events,
                0,
            );
        }

        Ok(())
    }

    fn handle_attack_creature(
        &mut self,
        player: usize,
        attacker_lane: usize,
        attacker_position: SlotPosition,
        defender_lane: usize,
        defender_position: SlotPosition,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        self.ensure_active_player(player)?;
        if self.global_turn == 1 && player == 0 {
            return Err("The first player cannot attack during the opening turn".into());
        }
        if attacker_lane >= NUM_LANES || attacker_lane != defender_lane {
            return Err("Creatures must attack within their current lane".into());
        }

        let bh = self.board_holder(player);
        let opponent = self.opposing_board_holder(player);
        let attacker = self.players[bh].lanes[attacker_lane]
            .get(attacker_position)
            .ok_or_else(|| "No attacking creature in specified slot".to_string())?
            .clone();

        if !attacker.ready || attacker.has_keyword("exhaust") || attacker.attacks_this_turn >= 1 {
            return Err("Attacker is not ready or is exhausted".into());
        }

        let defender = self.players[opponent].lanes[defender_lane]
            .get(defender_position)
            .ok_or_else(|| "No defending creature in specified slot".to_string())?
            .clone();

        if defender.has_keyword("stealth") {
            return Err("Cannot directly target a creature with Stealth".into());
        }

        // Front protects Rear unless attacker has Reach and Front does not have Guard
        if defender_position == SlotPosition::Rear {
            if let Some(front_unit) = &self.players[opponent].lanes[defender_lane].front {
                let can_bypass =
                    attacker.has_keyword("reach") && !front_unit.has_keyword("guard");
                if !can_bypass {
                    return Err(
                        "Front position protects Rear position unless attacker has Reach and Front lacks Guard"
                            .into(),
                    );
                }
            }
        }

        events.push(BattleEvent::CombatDeclared {
            attacker_player: player,
            attacker_card_id: attacker.card_id.clone(),
            lane: attacker_lane,
            target_description: format!("{}:{:?}", defender.card_id, defender_position),
        });

        // Breaking stealth on attack
        if let Some(att_mut) = self.players[bh].lanes[attacker_lane].get_mut(attacker_position) {
            att_mut.ready = false;
            att_mut.attacks_this_turn += 1;
            att_mut.remove_keyword("stealth");
        }

        let att_dmg = attacker.attack.max(0);
        let def_dmg = defender.attack.max(0);

        // Apply simultaneous combat damage
        let excess_to_defender = self.apply_damage_to_creature(
            opponent,
            defender_lane,
            defender_position,
            att_dmg,
            events,
        );
        let _ = self.apply_damage_to_creature(
            bh,
            attacker_lane,
            attacker_position,
            def_dmg,
            events,
        );

        // Drain on attacker
        if attacker.has_keyword("drain") && att_dmg > 0 {
            self.heal_leader(bh, att_dmg, events);
        }

        // Pierce excess damage to opposing leader
        if attacker.has_keyword("pierce") && excess_to_defender > 0 {
            self.damage_leader(opponent, excess_to_defender, events);
        }

        // Trigger after_this_attacks on attacker (if still alive)
        if let Some(att_now) = self.players[bh].lanes[attacker_lane]
            .get(attacker_position)
            .cloned()
        {
            if !att_now.silenced {
                if let Some(def) = catalogue.get(&att_now.card_id) {
                    self.execute_abilities_for_trigger(
                        player,
                        &def.abilities,
                        "after_this_attacks",
                        Some((attacker_lane, attacker_position)),
                        Some((opponent, defender_lane, defender_position)),
                        catalogue,
                        events,
                        0,
                    );
                }
            }
        }

        // Trigger when_damaged on defender (if damaged)
        if att_dmg > 0 {
            if let Some(def_now) = self.players[opponent].lanes[defender_lane]
                .get(defender_position)
                .cloned()
            {
                if !def_now.silenced {
                    if let Some(def) = catalogue.get(&def_now.card_id) {
                        self.execute_abilities_for_trigger(
                            opponent,
                            &def.abilities,
                            "when_damaged",
                            Some((defender_lane, defender_position)),
                            Some((bh, attacker_lane, attacker_position)),
                            catalogue,
                            events,
                            0,
                        );
                    }
                }
            }
        }

        Ok(())
    }

    fn handle_attack_leader(
        &mut self,
        player: usize,
        attacker_lane: usize,
        attacker_position: SlotPosition,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        self.ensure_active_player(player)?;
        if self.global_turn == 1 && player == 0 {
            return Err("The first player cannot attack during the opening turn".into());
        }
        if attacker_lane >= NUM_LANES {
            return Err("Invalid lane index".into());
        }

        let bh = self.board_holder(player);
        let opponent = self.opposing_board_holder(player);
        // Check if lane contains any non-stealthed enemy creatures
        let enemy_lane = &self.players[opponent].lanes[attacker_lane];
        let front_blocks = enemy_lane
            .front
            .as_ref()
            .map(|u| !u.has_keyword("stealth"))
            .unwrap_or(false);
        let rear_blocks = enemy_lane
            .rear
            .as_ref()
            .map(|u| !u.has_keyword("stealth"))
            .unwrap_or(false);
        if front_blocks || rear_blocks {
            return Err("Cannot attack opposing Leader while enemy creatures block this lane".into());
        }

        let attacker = self.players[bh].lanes[attacker_lane]
            .get(attacker_position)
            .ok_or_else(|| "No attacking creature in specified slot".to_string())?
            .clone();

        if !attacker.ready || attacker.has_keyword("exhaust") || attacker.attacks_this_turn >= 1 {
            return Err("Attacker is not ready or is exhausted".into());
        }

        if let Some(att_mut) = self.players[bh].lanes[attacker_lane].get_mut(attacker_position) {
            att_mut.ready = false;
            att_mut.attacks_this_turn += 1;
            att_mut.remove_keyword("stealth");
        }

        events.push(BattleEvent::CombatDeclared {
            attacker_player: player,
            attacker_card_id: attacker.card_id.clone(),
            lane: attacker_lane,
            target_description: format!("leader_{}", opponent),
        });

        let dmg = attacker.attack.max(0);
        self.damage_leader(opponent, dmg, events);

        if attacker.has_keyword("drain") && dmg > 0 {
            self.heal_leader(bh, dmg, events);
        }

        if !attacker.silenced {
            if let Some(def) = catalogue.get(&attacker.card_id) {
                self.execute_abilities_for_trigger(
                    player,
                    &def.abilities,
                    "after_this_attacks",
                    Some((attacker_lane, attacker_position)),
                    None,
                    catalogue,
                    events,
                    0,
                );
            }
        }

        Ok(())
    }

    fn handle_end_turn(
        &mut self,
        player: usize,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        self.ensure_active_player(player)?;

        let bh = self.board_holder(player);
        let opponent = self.opposing_board_holder(player);

        // 1. Evaluate Lane Control & Resonate (Section 5.7)
        let mut controlled_lanes = 0usize;
        for lane_idx in 0..NUM_LANES {
            let my_has = self.players[bh].lanes[lane_idx].has_any();
            let opp_has = self.players[opponent].lanes[lane_idx].has_any();
            if my_has && !opp_has {
                controlled_lanes += 1;
            }
        }
        let resonate = controlled_lanes >= 2;
        self.players[bh].resonate_active = resonate;
        self.players[player].resonate_active = resonate;
        events.push(BattleEvent::ResonateUpdated {
            player,
            controlled_lanes,
            active: resonate,
        });

        // 2. Execute end-of-turn triggers for active team's creatures, relics, and environment
        for lane_idx in 0..NUM_LANES {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if let Some(unit) = self.players[bh].lanes[lane_idx].get(pos).cloned() {
                    if !unit.silenced {
                        if let Some(def) = catalogue.get(&unit.card_id) {
                            self.execute_abilities_for_trigger(
                                player,
                                &def.abilities,
                                "turn_end",
                                Some((lane_idx, pos)),
                                None,
                                catalogue,
                                events,
                                0,
                            );
                        }
                    }
                    let burn = *unit.counters.get("burn").unwrap_or(&0);
                    let heat = *unit.counters.get("heat").unwrap_or(&0);
                    let recurring = burn + if heat >= 3 { 1 } else { 0 };
                    if recurring > 0 {
                        self.apply_damage_to_creature(bh, lane_idx, pos, recurring, events);
                    }
                }
            }
        }

        let relics = self.players[bh].relics.clone();
        for relic in relics {
            if let Some(def) = catalogue.get(&relic.card_id) {
                self.execute_abilities_for_trigger(
                    player,
                    &def.abilities,
                    "turn_end",
                    None,
                    None,
                    catalogue,
                    events,
                    0,
                );
            }
        }

        if let Some(env) = self.active_environment.clone() {
            if let Some(def) = catalogue.get(&env.card_id) {
                self.execute_abilities_for_trigger(
                    player,
                    &def.abilities,
                    "turn_end",
                    None,
                    None,
                    catalogue,
                    events,
                    0,
                );
            }
        }

        self.check_state_based_actions(catalogue, events);
        if self.outcome != MatchOutcome::InProgress {
            return Ok(());
        }

        // 3. Advance to next player's turn (in 2v2: 0 -> 1 -> 2 -> 3 -> 0)
        let next_player = (player + 1) % self.players.len();
        let next_bh = self.board_holder(next_player);
        self.active_player = next_player;
        self.global_turn += 1;
        self.players[next_player].turns_taken += 1;
        self.players[next_player].mulligan_done = true;

        // Check 40-turn limit per player (Section 5.1)
        if self
            .players
            .iter()
            .all(|p| p.turns_taken > MAX_TURNS_PER_PLAYER)
        {
            self.resolve_turn_limit_draw(events);
            return Ok(());
        }

        // 4. Increase Aether capacity (max 10) and refill for active player
        let new_cap = (self.players[next_player].aether_capacity + 1).min(MAX_AETHER_CAPACITY);
        self.players[next_player].aether_capacity = new_cap;
        self.players[next_player].aether = new_cap;

        events.push(BattleEvent::TurnStarted {
            player: next_player,
            turn_number: self.global_turn,
            aether: new_cap,
        });

        // 5. Ready creatures on next player's team board and clear Exhaust
        for lane_idx in 0..NUM_LANES {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if let Some(u) = self.players[next_bh].lanes[lane_idx].get_mut(pos) {
                    if u.has_keyword("exhaust") {
                        u.remove_keyword("exhaust");
                        u.ready = true;
                    } else {
                        u.ready = true;
                    }
                    u.attacks_this_turn = 0;
                    u.moved_this_turn = false;
                }
            }
        }

        // 6. Draw step
        self.draw_cards(next_player, 1, events);

        // 7. Execute turn_start triggers
        for lane_idx in 0..NUM_LANES {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if let Some(unit) = self.players[next_bh].lanes[lane_idx].get(pos).cloned() {
                    if !unit.silenced {
                        if let Some(def) = catalogue.get(&unit.card_id) {
                            self.execute_abilities_for_trigger(
                                next_player,
                                &def.abilities,
                                "turn_start",
                                Some((lane_idx, pos)),
                                None,
                                catalogue,
                                events,
                                0,
                            );
                        }
                    }
                }
            }
        }

        let next_relics = self.players[next_bh].relics.clone();
        for relic in next_relics {
            if let Some(def) = catalogue.get(&relic.card_id) {
                self.execute_abilities_for_trigger(
                    next_player,
                    &def.abilities,
                    "turn_start",
                    None,
                    None,
                    catalogue,
                    events,
                    0,
                );
            }
        }

        if let Some(env) = self.active_environment.clone() {
            if let Some(def) = catalogue.get(&env.card_id) {
                self.execute_abilities_for_trigger(
                    next_player,
                    &def.abilities,
                    "turn_start",
                    None,
                    None,
                    catalogue,
                    events,
                    0,
                );
            }
        }

        Ok(())
    }

    fn handle_surrender(
        &mut self,
        player: usize,
        events: &mut Vec<BattleEvent>,
    ) -> Result<(), String> {
        if player >= self.players.len() {
            return Err("Invalid player index".into());
        }
        let winner_team = self.opposing_board_holder(player);
        self.outcome = match self.format {
            MatchFormat::Standard1v1 => MatchOutcome::PlayerVictory(winner_team),
            MatchFormat::Tag2v2 => MatchOutcome::TeamVictory(winner_team),
        };
        events.push(BattleEvent::MatchEnded {
            outcome: self.outcome,
            reason: format!("Player {} surrendered", player),
        });
        Ok(())
    }

    fn ensure_active_player(&self, player: usize) -> Result<(), String> {
        if player != self.active_player {
            return Err(format!(
                "Not player {}'s turn (active player is {})",
                player, self.active_player
            ));
        }
        Ok(())
    }

    fn draw_cards(&mut self, player: usize, count: usize, events: &mut Vec<BattleEvent>) {
        for _ in 0..count {
            if let Some(card) = self.players[player].deck.pop() {
                if self.players[player].hand.len() < MAX_HAND_SIZE {
                    events.push(BattleEvent::CardDrawn {
                        player,
                        card_id: card.card_id.clone(),
                    });
                    self.players[player].hand.push(card);
                } else {
                    events.push(BattleEvent::CardBurnedOverdraw {
                        player,
                        card_id: card.card_id.clone(),
                    });
                    self.players[player].discard.push(card);
                }
            }
        }
    }

    fn heal_leader(&mut self, player: usize, amount: i32, events: &mut Vec<BattleEvent>) {
        if amount <= 0 {
            return;
        }
        let bh = self.board_holder(player);
        let old = self.players[bh].vitality;
        let max_v = self.players[bh].max_vitality;
        let new_v = (old + amount).min(max_v);
        let healed = new_v - old;
        self.players[bh].vitality = new_v;
        if healed > 0 {
            events.push(BattleEvent::LeaderHealed {
                player: bh,
                amount: healed,
                new_vitality: new_v,
            });
        }
    }

    fn damage_leader(&mut self, player: usize, amount: i32, events: &mut Vec<BattleEvent>) {
        if amount <= 0 {
            return;
        }
        let bh = self.board_holder(player);
        self.players[bh].vitality -= amount;
        events.push(BattleEvent::LeaderDamaged {
            player: bh,
            amount,
            new_vitality: self.players[bh].vitality,
        });
    }

    /// Applies damage to a creature, factoring in Shield prevention. Returns excess damage beyond remaining health.
    fn apply_damage_to_creature(
        &mut self,
        board_owner: usize,
        lane: usize,
        pos: SlotPosition,
        amount: i32,
        events: &mut Vec<BattleEvent>,
    ) -> i32 {
        if amount <= 0 {
            return 0;
        }
        let bh = self.board_holder(board_owner);
        if let Some(unit) = self.players[bh].lanes[lane].get_mut(pos) {
            if unit.has_keyword("shield") {
                unit.remove_keyword("shield");
                unit.counters.remove("shield");
                events.push(BattleEvent::ShieldAbsorbed {
                    card_id: unit.card_id.clone(),
                    lane,
                });
                return 0;
            }
            let pre_health = unit.health;
            unit.health -= amount;
            events.push(BattleEvent::DamageDealt {
                target_description: format!("p{}_lane{}_{:?}:{}", bh, lane, pos, unit.card_id),
                amount,
            });
            if amount > pre_health {
                amount - pre_health
            } else {
                0
            }
        } else {
            0
        }
    }

    fn trigger_alignment_on_non_creature(&mut self, player: usize) {
        let bh = self.board_holder(player);
        for lane_idx in 0..NUM_LANES {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if let Some(u) = self.players[bh].lanes[lane_idx].get_mut(pos) {
                    if u.card_id == "STR-C-0002" && !u.silenced {
                        *u.counters.entry("alignment".to_string()).or_insert(0) += 1;
                        u.attack += 1;
                        u.health += 1;
                        u.max_health += 1;
                    }
                }
            }
        }
    }

    #[allow(clippy::too_many_arguments)]
    fn execute_abilities_for_trigger(
        &mut self,
        controller: usize,
        abilities: &[AbilityDefinition],
        trigger: &str,
        source_slot: Option<(usize, SlotPosition)>,
        event_source: Option<(usize, usize, SlotPosition)>,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
        depth: usize,
    ) {
        if depth >= MAX_EFFECT_DEPTH {
            return;
        }
        for ability in abilities {
            if ability.trigger != trigger {
                continue;
            }
            if !self.evaluate_conditions(controller, &ability.conditions, source_slot) {
                continue;
            }
            for effect in &ability.effects {
                self.execute_single_effect(
                    controller,
                    effect,
                    source_slot,
                    event_source,
                    catalogue,
                    events,
                );
            }
        }
    }

    fn evaluate_conditions(
        &self,
        controller: usize,
        conditions: &[ConditionDefinition],
        source_slot: Option<(usize, SlotPosition)>,
    ) -> bool {
        let bh = self.board_holder(controller);
        for cond in conditions {
            match cond.condition_type.as_str() {
                "has_resonate" => {
                    if !self.players[bh].resonate_active {
                        return false;
                    }
                }
                "controls_relic" => {
                    if self.players[bh].relics.is_empty() {
                        return false;
                    }
                }
                "self_counter_at_least" => {
                    if let (Some((lane, pos)), Some(counter_name), Some(min_val)) =
                        (source_slot, &cond.counter, cond.value)
                    {
                        let count = self.players[bh].lanes[lane]
                            .get(pos)
                            .and_then(|u| u.counters.get(counter_name))
                            .copied()
                            .unwrap_or(0);
                        if count < min_val {
                            return false;
                        }
                    }
                }
                _ => {}
            }
        }
        true
    }

    fn execute_single_effect(
        &mut self,
        controller: usize,
        effect: &EffectDefinition,
        source_slot: Option<(usize, SlotPosition)>,
        event_source: Option<(usize, usize, SlotPosition)>,
        _catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) {
        let bh = self.board_holder(controller);
        let opponent = self.opposing_board_holder(controller);

        match effect.operation.as_str() {
            "deal_damage" => {
                let amount = effect.amount.unwrap_or(1);
                match effect.target.as_str() {
                    "enemy_leader" => self.damage_leader(opponent, amount, events),
                    "ally_leader" => self.damage_leader(bh, amount, events),
                    "event_source" => {
                        if let Some((p, l, pos)) = event_source {
                            self.apply_damage_to_creature(p, l, pos, amount, events);
                        }
                    }
                    "enemy_in_lane" | "target_enemy_creature" => {
                        if let Some((l, pos)) =
                            self.find_enemy_target(opponent, source_slot.map(|(l, _)| l))
                        {
                            if self.consume_ward_if_present(opponent, l, pos, events) {
                                return;
                            }
                            self.apply_damage_to_creature(opponent, l, pos, amount, events);
                        }
                    }
                    _ => {}
                }
            }
            "heal" => {
                let amount = effect.amount.unwrap_or(1);
                match effect.target.as_str() {
                    "ally_leader" => self.heal_leader(bh, amount, events),
                    "self" => {
                        if let Some((l, pos)) = source_slot {
                            if let Some(u) = self.players[bh].lanes[l].get_mut(pos) {
                                u.health = (u.health + amount).min(u.max_health);
                            }
                        }
                    }
                    "ally_creature_in_lane_or_any" => {
                        if let Some((l, pos)) =
                            self.find_ally_target(bh, source_slot.map(|(l, _)| l))
                        {
                            if let Some(u) = self.players[bh].lanes[l].get_mut(pos) {
                                u.health = (u.health + amount).min(u.max_health);
                            }
                        }
                    }
                    "all_ally_creatures" => {
                        for l in 0..NUM_LANES {
                            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                                if let Some(u) = self.players[bh].lanes[l].get_mut(pos) {
                                    u.health = (u.health + amount).min(u.max_health);
                                }
                            }
                        }
                    }
                    _ => {}
                }
            }
            "draw" => {
                let amount = effect.amount.unwrap_or(1).max(0) as usize;
                self.draw_cards(controller, amount, events);
            }
            "scry_top_deck" => {
                // Reorder or inspect top N cards deterministically (moves highest-cost card further from top if early turn)
                let amount = (effect.amount.unwrap_or(1).max(1) as usize)
                    .min(self.players[controller].deck.len());
                if amount >= 2 {
                    let len = self.players[controller].deck.len();
                    self.players[controller].deck.swap(len - 1, len - 2);
                }
            }
            "gain_aether" => {
                let amount = effect.amount.unwrap_or(1).max(0) as u8;
                self.players[controller].aether =
                    (self.players[controller].aether + amount).min(MAX_AETHER_CAPACITY);
            }
            "add_counter" => {
                let counter_name = effect.counter.clone().unwrap_or_else(|| "growth".into());
                let amount = effect.amount.unwrap_or(1);
                let targets = self.resolve_creature_targets(
                    controller,
                    &effect.target,
                    source_slot,
                    event_source,
                );
                for (p, l, pos) in targets {
                    let p_bh = self.board_holder(p);
                    if p_bh != bh && self.consume_ward_if_present(p_bh, l, pos, events) {
                        continue;
                    }
                    if let Some(u) = self.players[p_bh].lanes[l].get_mut(pos) {
                        *u.counters.entry(counter_name.clone()).or_insert(0) += amount;
                        if counter_name == "growth" {
                            u.attack += amount;
                            u.health += amount;
                            u.max_health += amount;
                        } else if counter_name == "corrode" {
                            u.attack = (u.attack - amount).max(0);
                            u.health -= amount;
                        }
                    }
                }
            }
            "remove_counter" => {
                let counter_name = effect.counter.clone().unwrap_or_else(|| "heat".into());
                let amount = effect.amount.unwrap_or(1);
                let targets = self.resolve_creature_targets(
                    controller,
                    &effect.target,
                    source_slot,
                    event_source,
                );
                for (p, l, pos) in targets {
                    let p_bh = self.board_holder(p);
                    if let Some(u) = self.players[p_bh].lanes[l].get_mut(pos) {
                        if let Some(val) = u.counters.get_mut(&counter_name) {
                            *val = (*val - amount).max(0);
                            if *val == 0 {
                                u.counters.remove(&counter_name);
                            }
                        }
                    }
                }
            }
            "modify_stats" => {
                let atk_d = effect.attack_delta.unwrap_or(0);
                let hp_d = effect.health_delta.unwrap_or(0);
                let targets = self.resolve_creature_targets(
                    controller,
                    &effect.target,
                    source_slot,
                    event_source,
                );
                for (p, l, pos) in targets {
                    let p_bh = self.board_holder(p);
                    if p_bh != bh && self.consume_ward_if_present(p_bh, l, pos, events) {
                        continue;
                    }
                    if let Some(u) = self.players[p_bh].lanes[l].get_mut(pos) {
                        u.attack = (u.attack + atk_d).max(0);
                        u.health += hp_d;
                        if hp_d > 0 {
                            u.max_health += hp_d;
                        }
                    }
                }
            }
            "grant_keyword" => {
                if let Some(kw) = &effect.keyword {
                    let targets = self.resolve_creature_targets(
                        controller,
                        &effect.target,
                        source_slot,
                        event_source,
                    );
                    for (p, l, pos) in targets {
                        let p_bh = self.board_holder(p);
                        if p_bh != bh && self.consume_ward_if_present(p_bh, l, pos, events) {
                            continue;
                        }
                        if let Some(u) = self.players[p_bh].lanes[l].get_mut(pos) {
                            u.add_keyword(kw);
                        }
                    }
                }
            }
            "silence" => {
                let targets = self.resolve_creature_targets(
                    controller,
                    &effect.target,
                    source_slot,
                    event_source,
                );
                for (p, l, pos) in targets {
                    let p_bh = self.board_holder(p);
                    if p_bh != bh && self.consume_ward_if_present(p_bh, l, pos, events) {
                        continue;
                    }
                    if let Some(u) = self.players[p_bh].lanes[l].get_mut(pos) {
                        u.silenced = true;
                        u.keywords.retain(|k| k == "guard");
                        u.counters.clear();
                    }
                }
            }
            "destroy" => {
                let targets = self.resolve_creature_targets(
                    controller,
                    &effect.target,
                    source_slot,
                    event_source,
                );
                for (p, l, pos) in targets {
                    let p_bh = self.board_holder(p);
                    if p_bh != bh && self.consume_ward_if_present(p_bh, l, pos, events) {
                        continue;
                    }
                    if let Some(u) = self.players[p_bh].lanes[l].get_mut(pos) {
                        u.health = 0;
                    }
                }
            }
            "return_to_hand" => {
                let targets = self.resolve_creature_targets(
                    controller,
                    &effect.target,
                    source_slot,
                    event_source,
                );
                for (p, l, pos) in targets {
                    let p_bh = self.board_holder(p);
                    if let Some(u) = self.players[p_bh].lanes[l].get(pos).cloned() {
                        if u.has_keyword("anchor") {
                            continue;
                        }
                        self.players[p_bh].lanes[l].set(pos, None);
                        if !u.is_token && self.players[u.owner].hand.len() < MAX_HAND_SIZE {
                            self.players[u.owner].hand.push(CardInstance {
                                instance_id: u.instance_id,
                                card_id: u.card_id,
                                owner: u.owner,
                                reclaimed: u.reclaimed,
                            });
                        }
                    }
                }
            }
            "summon_token" => {
                if let Some((l, pos)) = self.find_open_slot(bh, source_slot.map(|(l, _)| l)) {
                    let token_name = effect
                        .token_name
                        .clone()
                        .unwrap_or_else(|| "Echo Token".to_string());
                    let atk = effect.attack.unwrap_or(1);
                    let hp = effect.health.unwrap_or(1);
                    let kws = effect.keywords.clone().unwrap_or_default();
                    let inst_id = self.next_instance_id;
                    self.next_instance_id += 1;

                    let unit = CreatureUnit {
                        instance_id: inst_id,
                        card_id: format!(
                            "TOKEN-{}",
                            token_name.to_uppercase().replace(' ', "_")
                        ),
                        name: token_name.clone(),
                        owner: controller,
                        controller,
                        faction: Faction::Neutral,
                        attack: atk,
                        health: hp,
                        max_health: hp,
                        keywords: kws,
                        counters: BTreeMap::new(),
                        ready: false,
                        attacks_this_turn: 0,
                        moved_this_turn: false,
                        silenced: false,
                        is_token: true,
                        reclaimed: false,
                    };
                    let token_id = unit.card_id.clone();
                    self.players[bh].lanes[l].set(pos, Some(unit));
                    events.push(BattleEvent::CreatureSummoned {
                        player: controller,
                        card_id: token_id,
                        name: token_name,
                        lane: l,
                        position: pos,
                        is_token: true,
                    });
                }
            }
            "reclaim_from_discard" => {
                if let Some(idx) = self.players[controller]
                    .discard
                    .iter()
                    .rposition(|c| !c.reclaimed)
                {
                    let mut card = self.players[controller].discard.remove(idx);
                    card.reclaimed = true;
                    if self.players[controller].hand.len() < MAX_HAND_SIZE {
                        self.players[controller].hand.push(card);
                    }
                }
            }
            "move_lane" => {
                if let Some((from_l, from_pos)) =
                    self.find_ally_target(bh, source_slot.map(|(l, _)| l))
                {
                    for candidate_lane in 0..NUM_LANES {
                        if candidate_lane.abs_diff(from_l) == 1 {
                            for candidate_pos in [SlotPosition::Front, SlotPosition::Rear] {
                                if self.players[bh].lanes[candidate_lane]
                                    .get(candidate_pos)
                                    .is_none()
                                {
                                    if let Some(unit) = self.players[bh].lanes[from_l]
                                        .get(from_pos)
                                        .cloned()
                                    {
                                        if !unit.has_keyword("anchor") {
                                            self.players[bh].lanes[from_l].set(from_pos, None);
                                            self.players[bh].lanes[candidate_lane]
                                                .set(candidate_pos, Some(unit.clone()));
                                            events.push(BattleEvent::CreatureMoved {
                                                player: controller,
                                                card_id: unit.card_id,
                                                from_lane: from_l,
                                                from_position: from_pos,
                                                to_lane: candidate_lane,
                                                to_position: candidate_pos,
                                            });
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            _ => {}
        }
    }

    fn consume_ward_if_present(
        &mut self,
        board_owner: usize,
        lane: usize,
        pos: SlotPosition,
        events: &mut Vec<BattleEvent>,
    ) -> bool {
        let bh = self.board_holder(board_owner);
        if let Some(u) = self.players[bh].lanes[lane].get_mut(pos) {
            if u.has_keyword("ward") {
                u.remove_keyword("ward");
                events.push(BattleEvent::WardTriggered {
                    card_id: u.card_id.clone(),
                    lane,
                });
                return true;
            }
        }
        false
    }

    fn resolve_creature_targets(
        &self,
        controller: usize,
        target_spec: &str,
        source_slot: Option<(usize, SlotPosition)>,
        event_source: Option<(usize, usize, SlotPosition)>,
    ) -> Vec<(usize, usize, SlotPosition)> {
        let bh = self.board_holder(controller);
        let opponent = self.opposing_board_holder(controller);
        match target_spec {
            "self" => source_slot
                .map(|(l, p)| vec![(bh, l, p)])
                .unwrap_or_default(),
            "event_source" => event_source.map(|t| vec![t]).unwrap_or_default(),
            "ally_creature_in_lane_or_any" => self
                .find_ally_target(bh, source_slot.map(|(l, _)| l))
                .map(|(l, p)| vec![(bh, l, p)])
                .unwrap_or_default(),
            "strongest_ally_creature" => {
                let mut best: Option<((usize, SlotPosition), i32)> = None;
                for l in 0..NUM_LANES {
                    for pos in [SlotPosition::Front, SlotPosition::Rear] {
                        if let Some(u) = self.players[bh].lanes[l].get(pos) {
                            if best.map(|(_, atk)| u.attack > atk).unwrap_or(true) {
                                best = Some(((l, pos), u.attack));
                            }
                        }
                    }
                }
                best.map(|((l, p), _)| vec![(bh, l, p)])
                    .unwrap_or_default()
            }
            "all_ally_creatures" => {
                let mut out = Vec::new();
                for l in 0..NUM_LANES {
                    for pos in [SlotPosition::Front, SlotPosition::Rear] {
                        if self.players[bh].lanes[l].get(pos).is_some() {
                            out.push((bh, l, pos));
                        }
                    }
                }
                out
            }
            "enemy_in_lane" | "target_enemy_creature" => self
                .find_enemy_target(opponent, source_slot.map(|(l, _)| l))
                .map(|(l, p)| vec![(opponent, l, p)])
                .unwrap_or_default(),
            _ => Vec::new(),
        }
    }

    fn find_ally_target(
        &self,
        board_owner: usize,
        preferred_lane: Option<usize>,
    ) -> Option<(usize, SlotPosition)> {
        let bh = self.board_holder(board_owner);
        if let Some(l) = preferred_lane {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if self.players[bh].lanes[l].get(pos).is_some() {
                    return Some((l, pos));
                }
            }
        }
        for l in 0..NUM_LANES {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if self.players[bh].lanes[l].get(pos).is_some() {
                    return Some((l, pos));
                }
            }
        }
        None
    }

    fn find_enemy_target(
        &self,
        opponent_board: usize,
        preferred_lane: Option<usize>,
    ) -> Option<(usize, SlotPosition)> {
        let bh = self.board_holder(opponent_board);
        if let Some(l) = preferred_lane {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if let Some(u) = self.players[bh].lanes[l].get(pos) {
                    if !u.has_keyword("stealth") {
                        return Some((l, pos));
                    }
                }
            }
        }
        for l in 0..NUM_LANES {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if let Some(u) = self.players[bh].lanes[l].get(pos) {
                    if !u.has_keyword("stealth") {
                        return Some((l, pos));
                    }
                }
            }
        }
        None
    }

    fn find_open_slot(
        &self,
        board_owner: usize,
        preferred_lane: Option<usize>,
    ) -> Option<(usize, SlotPosition)> {
        let bh = self.board_holder(board_owner);
        if let Some(l) = preferred_lane {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if self.players[bh].lanes[l].get(pos).is_none() {
                    return Some((l, pos));
                }
            }
        }
        for l in 0..NUM_LANES {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if self.players[bh].lanes[l].get(pos).is_none() {
                    return Some((l, pos));
                }
            }
        }
        None
    }

    fn check_state_based_actions(
        &mut self,
        catalogue: &BTreeMap<String, CardDefinition>,
        events: &mut Vec<BattleEvent>,
    ) {
        // 1. Destroy creatures with health <= 0 on team boards (0 and 1)
        for bh in 0..2usize.min(self.players.len()) {
            for lane_idx in 0..NUM_LANES {
                for pos in [SlotPosition::Front, SlotPosition::Rear] {
                    let dead_unit = match self.players[bh].lanes[lane_idx].get(pos) {
                        Some(u) if u.health <= 0 => Some(u.clone()),
                        _ => None,
                    };
                    if let Some(unit) = dead_unit {
                        self.players[bh].lanes[lane_idx].set(pos, None);
                        events.push(BattleEvent::CreatureDestroyed {
                            owner: unit.owner,
                            card_id: unit.card_id.clone(),
                            name: unit.name.clone(),
                            lane: lane_idx,
                            position: pos,
                        });
                        if !unit.is_token && unit.owner < self.players.len() {
                            self.players[unit.owner].discard.push(CardInstance {
                                instance_id: unit.instance_id,
                                card_id: unit.card_id.clone(),
                                owner: unit.owner,
                                reclaimed: unit.reclaimed,
                            });
                        }
                        if !unit.silenced && !unit.is_token {
                            if let Some(def) = catalogue.get(&unit.card_id) {
                                self.execute_abilities_for_trigger(
                                    unit.owner,
                                    &def.abilities,
                                    "on_death",
                                    Some((lane_idx, pos)),
                                    None,
                                    catalogue,
                                    events,
                                    1,
                                );
                            }
                            if unit.has_keyword("rebirth") && self.players[bh].lanes[lane_idx].get(pos).is_none() {
                                let inst_id = self.next_instance_id;
                                self.next_instance_id += 1;
                                let remnant = CreatureUnit {
                                    instance_id: inst_id,
                                    card_id: "TOKEN-ECHO_REMNANT".to_string(),
                                    name: "Echo Remnant".to_string(),
                                    owner: unit.owner,
                                    controller: unit.controller,
                                    faction: unit.faction,
                                    attack: 1,
                                    health: 1,
                                    max_health: 1,
                                    keywords: Vec::new(),
                                    counters: BTreeMap::new(),
                                    ready: false,
                                    attacks_this_turn: 0,
                                    moved_this_turn: false,
                                    silenced: false,
                                    is_token: true,
                                    reclaimed: false,
                                };
                                self.players[bh].lanes[lane_idx].set(pos, Some(remnant));
                                events.push(BattleEvent::CreatureSummoned {
                                    player: unit.owner,
                                    card_id: "TOKEN-ECHO_REMNANT".to_string(),
                                    name: "Echo Remnant".to_string(),
                                    lane: lane_idx,
                                    position: pos,
                                    is_token: true,
                                });
                            }
                        }
                    }
                }
            }
        }

        // 2. Check leader / team Vitality victory or simultaneous defeat
        let t0_dead = self.players[0].vitality <= 0;
        let t1_dead = self.players[1].vitality <= 0;
        if t0_dead && t1_dead {
            self.outcome = MatchOutcome::Draw;
            events.push(BattleEvent::MatchEnded {
                outcome: MatchOutcome::Draw,
                reason: "Simultaneous leader defeat".into(),
            });
        } else if t1_dead {
            self.outcome = match self.format {
                MatchFormat::Standard1v1 => MatchOutcome::PlayerVictory(0),
                MatchFormat::Tag2v2 => MatchOutcome::TeamVictory(0),
            };
            events.push(BattleEvent::MatchEnded {
                outcome: self.outcome,
                reason: "Opponent Vitality reduced to 0 or below".into(),
            });
        } else if t0_dead {
            self.outcome = match self.format {
                MatchFormat::Standard1v1 => MatchOutcome::PlayerVictory(1),
                MatchFormat::Tag2v2 => MatchOutcome::TeamVictory(1),
            };
            events.push(BattleEvent::MatchEnded {
                outcome: self.outcome,
                reason: "Opponent Vitality reduced to 0 or below".into(),
            });
        }
    }

    fn resolve_turn_limit_draw(&mut self, events: &mut Vec<BattleEvent>) {
        let v0 = self.players[0].vitality;
        let v1 = self.players[1].vitality;
        if v0 > v1 {
            self.outcome = match self.format {
                MatchFormat::Standard1v1 => MatchOutcome::PlayerVictory(0),
                MatchFormat::Tag2v2 => MatchOutcome::TeamVictory(0),
            };
        } else if v1 > v0 {
            self.outcome = match self.format {
                MatchFormat::Standard1v1 => MatchOutcome::PlayerVictory(1),
                MatchFormat::Tag2v2 => MatchOutcome::TeamVictory(1),
            };
        } else {
            self.outcome = MatchOutcome::Draw;
        }
        events.push(BattleEvent::MatchEnded {
            outcome: self.outcome,
            reason: "40-turn limit reached".into(),
        });
    }

    /// Generates all legal commands for the active player.
    pub fn generate_legal_commands(
        &self,
        catalogue: &BTreeMap<String, CardDefinition>,
    ) -> Vec<BattleCommand> {
        let mut commands = Vec::new();
        if self.outcome != MatchOutcome::InProgress {
            return commands;
        }

        let p = self.active_player;
        let bh = self.board_holder(p);
        let opponent = self.opposing_board_holder(p);
        let player_state = &self.players[p];
        let board_state = &self.players[bh];

        // 1. Hand plays
        for (h_idx, card_inst) in player_state.hand.iter().enumerate() {
            if let Some(def) = catalogue.get(&card_inst.card_id) {
                if def.cost <= player_state.aether {
                    match def.card_type {
                        CardType::Creature => {
                            for lane in 0..NUM_LANES {
                                for pos in [SlotPosition::Front, SlotPosition::Rear] {
                                    if board_state.lanes[lane].get(pos).is_none() {
                                        commands.push(BattleCommand::SummonCreature {
                                            player: p,
                                            hand_index: h_idx,
                                            lane,
                                            position: pos,
                                        });
                                    }
                                }
                            }
                        }
                        CardType::Tactic => {
                            commands.push(BattleCommand::PlayTactic {
                                player: p,
                                hand_index: h_idx,
                                target_lane: Some(1),
                                target_position: Some(SlotPosition::Front),
                            });
                        }
                        CardType::Relic => {
                            if board_state.relics.len() < MAX_RELICS_PER_PLAYER {
                                commands.push(BattleCommand::PlayRelic {
                                    player: p,
                                    hand_index: h_idx,
                                });
                            }
                        }
                        CardType::Environment => {
                            commands.push(BattleCommand::PlayEnvironment {
                                player: p,
                                hand_index: h_idx,
                            });
                        }
                    }
                }
            }
        }

        // 2. Creature attacks and Skirmish movement on the active team's board
        let can_attack_turn = !(self.global_turn == 1 && p == 0);
        for lane in 0..NUM_LANES {
            for pos in [SlotPosition::Front, SlotPosition::Rear] {
                if let Some(unit) = board_state.lanes[lane].get(pos) {
                    if unit.has_keyword("skirmish")
                        && !unit.has_keyword("anchor")
                        && !unit.moved_this_turn
                    {
                        for adj_lane in 0..NUM_LANES {
                            if adj_lane.abs_diff(lane) == 1 {
                                for to_pos in [SlotPosition::Front, SlotPosition::Rear] {
                                    if board_state.lanes[adj_lane].get(to_pos).is_none() {
                                        commands.push(BattleCommand::MoveCreature {
                                            player: p,
                                            from_lane: lane,
                                            from_position: pos,
                                            to_lane: adj_lane,
                                            to_position: to_pos,
                                        });
                                    }
                                }
                            }
                        }
                    }

                    if can_attack_turn
                        && unit.ready
                        && !unit.has_keyword("exhaust")
                        && unit.attacks_this_turn == 0
                    {
                        let enemy_lane = &self.players[opponent].lanes[lane];
                        let mut has_blocker = false;

                        if let Some(front_e) = &enemy_lane.front {
                            if !front_e.has_keyword("stealth") {
                                has_blocker = true;
                                commands.push(BattleCommand::AttackCreature {
                                    player: p,
                                    attacker_lane: lane,
                                    attacker_position: pos,
                                    defender_lane: lane,
                                    defender_position: SlotPosition::Front,
                                });
                            }
                        }

                        if let Some(rear_e) = &enemy_lane.rear {
                            if !rear_e.has_keyword("stealth") {
                                has_blocker = true;
                                let front_allows = match &enemy_lane.front {
                                    None => true,
                                    Some(f) => {
                                        unit.has_keyword("reach") && !f.has_keyword("guard")
                                    }
                                };
                                if front_allows {
                                    commands.push(BattleCommand::AttackCreature {
                                        player: p,
                                        attacker_lane: lane,
                                        attacker_position: pos,
                                        defender_lane: lane,
                                        defender_position: SlotPosition::Rear,
                                    });
                                }
                            }
                        }

                        if !has_blocker {
                            commands.push(BattleCommand::AttackLeader {
                                player: p,
                                attacker_lane: lane,
                                attacker_position: pos,
                            });
                        }
                    }
                }
            }
        }

        commands.push(BattleCommand::EndTurn { player: p });
        commands
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AiDifficulty {
    Beginner,
    Casual,
    Skilled,
    Veteran,
    Elite,
    Champion,
    Boss,
}

pub struct NpcAi;

impl NpcAi {
    /// Chooses the highest-utility legal command for the current active player without inspecting hidden opponent state.
    pub fn choose_command(
        state: &MatchState,
        catalogue: &BTreeMap<String, CardDefinition>,
        _difficulty: AiDifficulty,
    ) -> BattleCommand {
        let legal = state.generate_legal_commands(catalogue);
        let p = state.active_player;
        let bh = state.board_holder(p);

        // 1. Prioritize summoning creatures into Front slots across empty lanes to establish Resonate (>= 2 lanes)
        for cmd in &legal {
            if let BattleCommand::SummonCreature {
                lane,
                position: SlotPosition::Front,
                ..
            } = cmd
            {
                if !state.players[bh].lanes[*lane].has_any() {
                    return cmd.clone();
                }
            }
        }

        // 2. Any summon or relic or environment or tactic play
        for cmd in &legal {
            match cmd {
                BattleCommand::SummonCreature { .. }
                | BattleCommand::PlayRelic { .. }
                | BattleCommand::PlayEnvironment { .. }
                | BattleCommand::PlayTactic { .. } => return cmd.clone(),
                _ => {}
            }
        }

        // 3. Prioritize attacking opposing Leader when lane is clear
        for cmd in &legal {
            if matches!(cmd, BattleCommand::AttackLeader { .. }) {
                return cmd.clone();
            }
        }

        // 4. Attack enemy creatures
        for cmd in &legal {
            if matches!(cmd, BattleCommand::AttackCreature { .. }) {
                return cmd.clone();
            }
        }

        BattleCommand::EndTurn { player: p }
    }
}

