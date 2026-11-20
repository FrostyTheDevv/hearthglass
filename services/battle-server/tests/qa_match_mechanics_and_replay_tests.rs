use hearthglass_battle_server::{
    AiDifficulty, BattleCommand, CardBundle, CardDefinition,
    Faction, MatchFormat, MatchOutcome, MatchState, NpcAi, SlotPosition,
    StarterDecksFile, CreatureUnit,
};
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

fn load_catalogue_and_decks() -> (BTreeMap<String, CardDefinition>, StarterDecksFile) {
    let root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf();

    let bundle_str =
        fs::read_to_string(root.join("content/cards/foundations_v1.json")).expect("read bundle");
    let bundle: CardBundle = serde_json::from_str(&bundle_str).expect("parse bundle");
    let mut catalogue = BTreeMap::new();
    for card in bundle.cards {
        catalogue.insert(card.id.clone(), card);
    }

    let decks_str =
        fs::read_to_string(root.join("content/cards/starter_decks.json")).expect("read decks");
    let decks: StarterDecksFile = serde_json::from_str(&decks_str).expect("parse decks");
    (catalogue, decks)
}

fn create_custom_unit(
    instance_id: u32,
    card_id: &str,
    name: &str,
    owner: usize,
    attack: i32,
    health: i32,
) -> CreatureUnit {
    CreatureUnit {
        instance_id,
        card_id: card_id.to_string(),
        name: name.to_string(),
        owner,
        controller: owner,
        faction: Faction::Neutral,
        attack,
        health,
        max_health: health,
        keywords: Vec::new(),
        counters: BTreeMap::new(),
        ready: true,
        attacks_this_turn: 0,
        moved_this_turn: false,
        silenced: false,
        is_token: false,
        reclaimed: false,
    }
}

// =========================================================================
// 1. MATCH TERMINATION AND TURN TIMING LIMITS
// =========================================================================

#[test]
fn test_match_termination_on_40_turn_limit_with_vitality_tiebreak() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 301).unwrap();

    // Set Player 0 vitality to 25 and Player 1 vitality to 20
    state.players[0].vitality = 25;
    state.players[1].vitality = 20;

    // Fast-forward turns_taken to 40 for both players
    state.players[0].turns_taken = 40;
    state.players[1].turns_taken = 40;

    // Player 0 takes turn 40, ends turn -> Player 1 takes turn 40, ends turn
    state.active_player = 0;
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);
    assert_eq!(state.active_player, 1);

    let res = state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue);
    assert!(res.accepted);

    // 40 turns reached: Player 0 has 25 Vit, Player 1 has 20 Vit -> Player 0 Victory!
    assert_eq!(
        state.outcome,
        MatchOutcome::PlayerVictory(0),
        "Player with higher vitality must win at 40-turn limit"
    );
}

#[test]
fn test_match_termination_on_40_turn_limit_equal_vitality_draw() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 302).unwrap();

    // Equal vitality at turn limit
    state.players[0].vitality = 18;
    state.players[1].vitality = 18;
    state.players[0].turns_taken = 40;
    state.players[1].turns_taken = 40;

    state.active_player = 0;
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);
    let res = state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue);
    assert!(res.accepted);

    assert_eq!(
        state.outcome,
        MatchOutcome::Draw,
        "Equal vitality at 40-turn limit must result in Draw"
    );
}

#[test]
fn test_match_termination_surrender() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 303).unwrap();

    // Player 0 surrenders
    let res = state.apply_command(BattleCommand::Surrender { player: 0 }, &catalogue);
    assert!(res.accepted);
    assert_eq!(state.outcome, MatchOutcome::PlayerVictory(1));
}

// =========================================================================
// 2. 2V2 TAG TEAM SHARED BOARD & TEAM SYNCHRONIZATION
// =========================================================================

#[test]
fn test_2v2_tag_shared_board_partner_command_and_vitality() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let tag_decks = [
        &decks.decks[0],
        &decks.decks[1],
        &decks.decks[2],
        &decks.decks[3],
    ];
    let mut state = MatchState::new_2v2(tag_decks, &catalogue, 304).unwrap();

    assert_eq!(state.format, MatchFormat::Tag2v2);
    assert_eq!(state.players.len(), 4);
    assert_eq!(state.players[0].vitality, 45);
    assert_eq!(state.players[1].vitality, 45);
    assert_eq!(state.players[2].vitality, 45);
    assert_eq!(state.players[3].vitality, 45);

    // Player 0 (Seat 0, Team 0) places a creature in Lane 1 Front
    state.players[0].lanes[1].front = Some(create_custom_unit(50001, "T0_UNIT", "T0 Vanguard", 0, 4, 4));

    // End turn Seat 0 -> Seat 1 (Team 1)
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);
    assert_eq!(state.active_player, 1);

    // End turn Seat 1 -> Seat 2 (Team 0, Partner A2!)
    assert!(state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue).accepted);
    assert_eq!(state.active_player, 2);

    // Partner A2 (Seat 2) can see and command the creature summoned by Partner A1 (Seat 0)!
    let atk = state.apply_command(
        BattleCommand::AttackLeader {
            player: 2,
            attacker_lane: 1,
            attacker_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(atk.accepted, "Seat 2 must be able to attack with Team 0's shared board creature");

    // Both Seat 1 and Seat 3 (Team 1) vitality must drop to 41 (45 - 4)
    assert_eq!(state.players[1].vitality, 41);
    assert_eq!(state.players[3].vitality, 41);

    // End turn Seat 2 -> Seat 3
    assert!(state.apply_command(BattleCommand::EndTurn { player: 2 }, &catalogue).accepted);
    assert_eq!(state.active_player, 3);

    // End turn Seat 3 -> Seat 0
    assert!(state.apply_command(BattleCommand::EndTurn { player: 3 }, &catalogue).accepted);
    assert_eq!(state.active_player, 0);
}

// =========================================================================
// 3. DETERMINISTIC REPLAY AND CHECKSUM DIVERGENCE DETECTION
// =========================================================================

#[test]
fn test_deterministic_replay_produces_identical_checksums_and_diverges_on_altered_input() {
    let (catalogue, decks) = load_catalogue_and_decks();

    // Baseline run
    let mut state1 = MatchState::new_1v1(&decks.decks[4], &decks.decks[5], &catalogue, 77777).unwrap();
    let mut command_history = Vec::new();
    let mut steps = 0;
    while state1.outcome == MatchOutcome::InProgress && steps < 150 {
        let cmd = NpcAi::choose_command(&state1, &catalogue, AiDifficulty::Skilled);
        command_history.push(cmd.clone());
        let res = state1.apply_command(cmd, &catalogue);
        assert!(res.accepted);
        steps += 1;
    }
    let baseline_checksum = state1.compute_checksum();
    let baseline_outcome = state1.outcome;

    // Replay run: Replay exact same commands from identical seed
    let mut state2 = MatchState::new_1v1(&decks.decks[4], &decks.decks[5], &catalogue, 77777).unwrap();
    for cmd in &command_history {
        let res = state2.apply_command(cmd.clone(), &catalogue);
        assert!(res.accepted);
    }
    assert_eq!(
        state2.compute_checksum(),
        baseline_checksum,
        "Replay with identical seed and inputs must yield identical checksum"
    );
    assert_eq!(state2.outcome, baseline_outcome);

    // Divergent run: Alter a single action (e.g. EndTurn prematurely on step 1)
    let mut state3 = MatchState::new_1v1(&decks.decks[4], &decks.decks[5], &catalogue, 77777).unwrap();
    assert!(state3.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);
    let divergent_checksum = state3.compute_checksum();

    assert_ne!(
        divergent_checksum,
        state2.compute_checksum(),
        "Altering gameplay actions must produce divergent state checksums"
    );
}

// =========================================================================
// 4. MULTIPLAYER ZERO-LEAKAGE PRIVACY REDACTION
// =========================================================================

#[test]
fn test_multiplayer_zero_leakage_privacy_all_seats() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 88888).unwrap();

    // P0 draws cards, P1 draws cards
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);
    assert!(state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue).accepted);

    // Inspect P0 view
    let p0_view = state.redact_for_player(Some(0));
    for card in &p0_view.players[0].hand {
        assert_ne!(card.card_id, "HIDDEN", "Player 0 must see own hand");
        assert!(card.instance_id > 0);
    }
    for card in &p0_view.players[1].hand {
        assert_eq!(card.card_id, "HIDDEN", "Player 0 must NOT see Player 1 hand");
        assert_eq!(card.instance_id, 0);
    }
    for card in &p0_view.players[0].deck {
        assert_eq!(card.card_id, "HIDDEN", "Draw deck must remain hidden");
    }

    // Inspect Spectator view (viewer = None)
    let spec_view = state.redact_for_player(None);
    for p in &spec_view.players {
        for card in &p.hand {
            assert_eq!(card.card_id, "HIDDEN", "Spectator must see ZERO secret cards");
            assert_eq!(card.instance_id, 0);
        }
        for card in &p.deck {
            assert_eq!(card.card_id, "HIDDEN", "Spectator must see ZERO deck order");
            assert_eq!(card.instance_id, 0);
        }
    }
}
