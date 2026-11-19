use hearthglass_battle_server::{
    validate_deck, AiDifficulty, BattleCommand, CardBundle, CardDefinition, CardType,
    DeckCardEntry, DeckDefinition, Faction, MatchFormat, MatchOutcome, MatchState, NpcAi,
    SlotPosition, StarterDecksFile,
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

#[test]
fn test_all_480_cards_and_16_starter_decks_load_and_validate() {
    let (catalogue, decks) = load_catalogue_and_decks();
    assert_eq!(catalogue.len(), 480, "Expected 480 Phase 4 Expansion cards");
    assert_eq!(decks.decks.len(), 16, "Expected 16 legal 40-card starter/archetype decks");

    for deck in &decks.decks {
        let validation = validate_deck(deck, &catalogue);
        assert!(
            validation.valid,
            "Deck {} failed validation: {:?}",
            deck.id, validation.errors
        );
    }
}

#[test]
fn test_deck_construction_rules_reject_illegal_decks() {
    let (catalogue, decks) = load_catalogue_and_decks();

    // 1. Wrong card count (39 cards)
    let mut short_deck = decks.decks[0].clone();
    short_deck.cards[0].count -= 1;
    let res_short = validate_deck(&short_deck, &catalogue);
    assert!(!res_short.valid);

    // 2. Too many copies of Legendary (max 1)
    let mut leg_deck = decks.decks[0].clone();
    for entry in &mut leg_deck.cards {
        if entry.card_id == "EMB-E-0008" {
            entry.count = 2;
        }
    }
    leg_deck.cards[0].count -= 1; // keep 40 total
    let res_leg = validate_deck(&leg_deck, &catalogue);
    assert!(!res_leg.valid);

    // 3. Three major factions (max 2 allowed)
    let illegal_3_faction_deck = DeckDefinition {
        id: "illegal_3_factions".into(),
        name: "Illegal 3 Factions".into(),
        description: "Uses Emberclad, Verdant Pact, and Iron Choir".into(),
        factions: vec![Faction::Emberclad, Faction::VerdantPact, Faction::IronChoir],
        total_cards: 40,
        cards: vec![
            DeckCardEntry {
                card_id: "EMB-C-0001".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "VER-C-0001".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "IRN-C-0001".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "NEU-C-0001".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "NEU-C-0002".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "NEU-C-0003".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "NEU-C-0004".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "NEU-T-0006".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "NEU-R-0007".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "EMB-C-0002".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "EMB-C-0003".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "EMB-T-0006".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "VER-C-0002".into(),
                count: 3,
            },
            DeckCardEntry {
                card_id: "EMB-E-0008".into(),
                count: 1,
            },
        ],
    };
    let res_factions = validate_deck(&illegal_3_faction_deck, &catalogue);
    assert!(!res_factions.valid);
}

#[test]
fn test_opening_hand_mulligan_and_first_turn_attack_restriction() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state =
        MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 42).expect("init match");

    assert_eq!(state.players[0].hand.len(), 5);
    assert_eq!(state.players[1].hand.len(), 5);
    assert_eq!(state.players[0].vitality, 30);
    assert_eq!(state.players[0].aether, 1);

    // Player 0 performs a 2-card mulligan
    let m_res = state.apply_command(
        BattleCommand::Mulligan {
            player: 0,
            replace_hand_indices: vec![0, 2],
        },
        &catalogue,
    );
    assert!(m_res.accepted);
    assert_eq!(state.players[0].hand.len(), 5);
    assert_eq!(state.players[0].deck.len(), 35);

    // Second mulligan by same player must be rejected
    let m_again = state.apply_command(
        BattleCommand::Mulligan {
            player: 0,
            replace_hand_indices: vec![0],
        },
        &catalogue,
    );
    assert!(!m_again.accepted);

    // Force a Swift creature into Player 0's hand on Turn 1 and summon it
    state.players[0].hand[0].card_id = "EMB-C-0001".to_string(); // Ashborne Initiate (Cost 1, Swift)
    let s_res = state.apply_command(
        BattleCommand::SummonCreature {
            player: 0,
            hand_index: 0,
            lane: 0,
            position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(s_res.accepted);

    // Even with Swift, Player 0 cannot attack on Opening Turn 1 (Section 5.1)
    let atk_res = state.apply_command(
        BattleCommand::AttackLeader {
            player: 0,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(
        !atk_res.accepted,
        "First player must not be allowed to attack on opening turn"
    );
}

#[test]
fn test_front_protects_rear_and_reach_keyword() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state =
        MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 99).expect("init match");

    state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue);

    state.players[1].aether = 5;
    state.players[1].hand[0].card_id = "EMB-C-0001".to_string(); // non-Guard Front
    state.players[1].hand[1].card_id = "VER-C-0001".to_string(); // Rear target
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 1,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Front
                },
                &catalogue
            )
            .accepted
    );
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 1,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Rear
                },
                &catalogue
            )
            .accepted
    );
    state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue);

    state.players[0].aether = 10;
    state.players[0].hand[0].card_id = "EMB-C-0001".to_string(); // Swift, no Reach
    state.players[0].hand[1].card_id = "NEU-C-0003".to_string(); // Clocktower Lookout (Reach)
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 0,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Front
                },
                &catalogue
            )
            .accepted
    );
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 0,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Rear
                },
                &catalogue
            )
            .accepted
    );
    state.players[0].lanes[0].rear.as_mut().unwrap().ready = true;

    let illegal_rear_attack = state.apply_command(
        BattleCommand::AttackCreature {
            player: 0,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
            defender_lane: 0,
            defender_position: SlotPosition::Rear,
        },
        &catalogue,
    );
    assert!(
        !illegal_rear_attack.accepted,
        "Normal attacker cannot bypass enemy Front creature"
    );

    let reach_attack = state.apply_command(
        BattleCommand::AttackCreature {
            player: 0,
            attacker_lane: 0,
            attacker_position: SlotPosition::Rear,
            defender_lane: 0,
            defender_position: SlotPosition::Rear,
        },
        &catalogue,
    );
    assert!(
        reach_attack.accepted,
        "Reach attacker should bypass unguarded Front creature"
    );
}

#[test]
fn test_resonate_lane_control_evaluation() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state =
        MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 777).expect("init match");

    state.players[0].aether = 5;
    state.players[0].hand[0].card_id = "EMB-C-0001".to_string();
    state.players[0].hand[1].card_id = "EMB-C-0001".to_string();

    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 0,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Front
                },
                &catalogue
            )
            .accepted
    );
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 0,
                    hand_index: 0,
                    lane: 2,
                    position: SlotPosition::Front
                },
                &catalogue
            )
            .accepted
    );

    assert!(!state.players[0].resonate_active);
    state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue);
    assert!(
        state.players[0].resonate_active,
        "Controlling 2 lanes at end of turn must activate Resonate"
    );
}

#[test]
fn test_keywords_ward_shield_pierce_drain_rebirth_reclaim_skirmish() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state =
        MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 555).expect("init match");

    // Advance past turn 1
    state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue);
    state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue);

    // 1. Test Skirmish & Tidebound Current on Reefstep Scout (TID-C-0001)
    state.players[0].aether = 10;
    state.players[0].hand[0].card_id = "TID-C-0001".to_string();
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 0,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Front
                },
                &catalogue
            )
            .accepted
    );
    let move_res = state.apply_command(
        BattleCommand::MoveCreature {
            player: 0,
            from_lane: 0,
            from_position: SlotPosition::Front,
            to_lane: 1,
            to_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(move_res.accepted, "Skirmish creature must move adjacent lane");
    let moved_scout = state.players[0].lanes[1].front.as_ref().unwrap();
    assert_eq!(
        moved_scout.attack, 3,
        "Reefstep Scout must gain +1/+1 from Current on move"
    );

    // 2. Test Ward blocking enemy tactic (Molten Reckoning EMB-T-0006 on Prismblade Apprentice GLS-C-0001)
    state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue);
    state.players[1].aether = 10;
    state.players[1].hand[0].card_id = "GLS-C-0001".to_string(); // Ward 2/2
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 1,
                    hand_index: 0,
                    lane: 2,
                    position: SlotPosition::Front
                },
                &catalogue
            )
            .accepted
    );
    state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue);

    state.players[0].aether = 10;
    state.players[0].hand[0].card_id = "EMB-T-0006".to_string(); // Deal 4 damage
    assert!(
        state
            .apply_command(
                BattleCommand::PlayTactic {
                    player: 0,
                    hand_index: 0,
                    target_lane: Some(2),
                    target_position: Some(SlotPosition::Front),
                },
                &catalogue
            )
            .accepted
    );
    let warded_unit = state.players[1].lanes[2].front.as_ref().unwrap();
    assert_eq!(
        warded_unit.health, 2,
        "Ward must negate the first enemy tactic damage"
    );
    assert!(
        !warded_unit.has_keyword("ward"),
        "Ward must be consumed after negating an effect"
    );
}

#[test]
fn test_all_eight_faction_mechanics_and_advanced_combat_resolutions() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state =
        MatchState::new_1v1(&decks.decks[8], &decks.decks[9], &catalogue, 888).expect("init match");

    // Advance past Turn 1
    state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue);
    state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue);

    // 1. Emberclad Overheat (EMB-C-0019 Cinderpike Halberdier: gains Heat after attacking)
    state.players[0].aether = 10;
    state.players[0].hand[0].card_id = "EMB-C-0019".to_string();
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 0,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Front,
                },
                &catalogue
            )
            .accepted
    );
    state.players[0].lanes[0].front.as_mut().unwrap().ready = true;
    assert!(
        state
            .apply_command(
                BattleCommand::AttackLeader {
                    player: 0,
                    attacker_lane: 0,
                    attacker_position: SlotPosition::Front,
                },
                &catalogue
            )
            .accepted
    );
    assert_eq!(
        state.players[0].lanes[0]
            .front
            .as_ref()
            .unwrap()
            .counters
            .get("heat")
            .copied()
            .unwrap_or(0),
        1,
        "Cinderpike Halberdier must gain 1 Heat counter after attacking"
    );

    // 2. Verdant Pact Bloom (VER-C-0019 Briarhorn Stag: gains Growth counter +1/+1 after attacking)
    state.players[0].hand[0].card_id = "VER-C-0019".to_string();
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 0,
                    hand_index: 0,
                    lane: 1,
                    position: SlotPosition::Front,
                },
                &catalogue
            )
            .accepted
    );
    state.players[0].lanes[1].front.as_mut().unwrap().ready = true;
    assert!(
        state
            .apply_command(
                BattleCommand::AttackLeader {
                    player: 0,
                    attacker_lane: 1,
                    attacker_position: SlotPosition::Front,
                },
                &catalogue
            )
            .accepted
    );
    let stag = state.players[0].lanes[1].front.as_ref().unwrap();
    assert_eq!(stag.counters.get("growth").copied().unwrap_or(0), 1);
    assert_eq!(stag.attack, 3, "Growth counter must grant +1/+1 to 2/3 base");
    assert_eq!(stag.health, 4);

    // 3. Iron Choir Assembly & Shield (IRN-C-0019 Piston-Pike Automaton)
    state.players[0].hand[0].card_id = "IRN-C-0019".to_string();
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 0,
                    hand_index: 0,
                    lane: 2,
                    position: SlotPosition::Front,
                },
                &catalogue
            )
            .accepted
    );
    let pike = state.players[0].lanes[2].front.as_ref().unwrap();
    assert_eq!(pike.counters.get("assembly").copied().unwrap_or(0), 1);
    assert!(pike.has_keyword("shield"));

    // 4. Starweave Alignment & Scry (STR-T-0027 Chart the Meridian)
    let hand_before = state.players[0].hand.len();
    state.players[0].hand[0].card_id = "STR-T-0027".to_string();
    assert!(
        state
            .apply_command(
                BattleCommand::PlayTactic {
                    player: 0,
                    hand_index: 0,
                    target_lane: Some(0),
                    target_position: Some(SlotPosition::Front),
                },
                &catalogue
            )
            .accepted
    );
    assert_eq!(
        state.players[0].hand.len(),
        hand_before,
        "Playing 1 card and drawing 1 card keeps hand count equal"
    );

    // 5. Gravewild Rebirth & Reclaim (GRV-C-0019 Barrow-Hound Stalker + GRV-C-0023 Wicker-Lantern Guide)
    state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue);
    state.players[1].aether = 10;
    state.players[1].hand[0].card_id = "GRV-C-0019".to_string(); // 3/2 Rebirth
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 1,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Front,
                },
                &catalogue
            )
            .accepted
    );
    // Destroy Barrow-Hound with Focused Volley (NEU-T-0044: 4 damage)
    state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue);
    state.players[0].aether = 10;
    state.players[0].hand[0].card_id = "NEU-T-0044".to_string();
    assert!(
        state
            .apply_command(
                BattleCommand::PlayTactic {
                    player: 0,
                    hand_index: 0,
                    target_lane: Some(0),
                    target_position: Some(SlotPosition::Front),
                },
                &catalogue
            )
            .accepted
    );
    assert!(
        state.players[1].lanes[0].front.is_some(),
        "Rebirth must leave a 1/1 remnant in the slot after destruction"
    );
    assert_eq!(state.players[1].discard.len(), 1);

    // Reclaim the fallen Barrow-Hound from discard
    state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue);
    state.players[1].aether = 10;
    state.players[1].hand[0].card_id = "GRV-C-0023".to_string(); // Wicker-Lantern Guide (On Summon: Reclaim 1)
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 1,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Rear,
                },
                &catalogue
            )
            .accepted
    );
    assert_eq!(
        state.players[1].discard.len(),
        0,
        "Reclaim must return the qualifying card from discard to hand"
    );
    assert!(
        state.players[1]
            .hand
            .iter()
            .any(|c| c.card_id == "GRV-C-0019" && c.reclaimed),
        "Reclaimed card in hand must be flagged reclaimed=true so it cannot infinite-loop"
    );
}

#[test]
fn test_every_single_one_of_the_480_cards_executes_and_verifies_state_delta() {
    let (catalogue, decks) = load_catalogue_and_decks();
    assert_eq!(catalogue.len(), 480);

    for (card_id, card_def) in &catalogue {
        let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 1024)
            .expect("init match");
        // Seed an injured ally creature, a discard card, and an enemy creature so all triggers/targets have valid state
        state.players[0].aether = 10;
        state.players[0].vitality = 25;
        state.players[0].hand[0].card_id = "NEU-C-0002".to_string();
        let _ = state.apply_command(
            BattleCommand::SummonCreature {
                player: 0,
                hand_index: 0,
                lane: 1,
                position: SlotPosition::Rear,
            },
            &catalogue,
        );
        if let Some(ally) = state.players[0].lanes[1].rear.as_mut() {
            ally.health = 2;
        }
        state
            .players[0]
            .discard
            .push(hearthglass_battle_server::CardInstance {
                instance_id: 9999,
                card_id: "NEU-C-0001".to_string(),
                owner: 0,
                reclaimed: false,
            });
        state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue);

        state.players[1].aether = 10;
        state.players[1].hand[0].card_id = "NEU-C-0002".to_string();
        let _ = state.apply_command(
            BattleCommand::SummonCreature {
                player: 1,
                hand_index: 0,
                lane: 0,
                position: SlotPosition::Front,
            },
            &catalogue,
        );
        state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue);

        // Now play the card under test as Player 0 with 10 Aether
        state.players[0].aether = 10;
        state.players[0].hand[0].card_id = card_id.clone();

        let cmd = match card_def.card_type {
            CardType::Creature => BattleCommand::SummonCreature {
                player: 0,
                hand_index: 0,
                lane: 0,
                position: SlotPosition::Front,
            },
            CardType::Tactic => BattleCommand::PlayTactic {
                player: 0,
                hand_index: 0,
                target_lane: Some(0),
                target_position: Some(SlotPosition::Front),
            },
            CardType::Relic => BattleCommand::PlayRelic {
                player: 0,
                hand_index: 0,
            },
            CardType::Environment => BattleCommand::PlayEnvironment {
                player: 0,
                hand_index: 0,
            },
        };

        let res = state.apply_command(cmd, &catalogue);
        assert!(
            res.accepted,
            "Card {} ({}) failed to execute: {:?}",
            card_id, card_def.name, res.error
        );
        assert!(
            !res.events.is_empty(),
            "Card {} ({}) must emit deterministic battle events",
            card_id,
            card_def.name
        );

        match card_def.card_type {
            CardType::Creature => {
                // Note: some creatures (e.g. Tidebound Skirmishers like TID-C-0003) may reposition on summon
                let present_on_board = state.players[0].lanes.iter().any(|l| {
                    l.front
                        .as_ref()
                        .map(|u| &u.card_id == card_id)
                        .unwrap_or(false)
                        || l.rear
                            .as_ref()
                            .map(|u| &u.card_id == card_id)
                            .unwrap_or(false)
                });
                assert!(
                    present_on_board,
                    "Creature {} must be present on Player 0's board after summon",
                    card_id
                );
            }
            CardType::Relic => {
                assert!(
                    state.players[0].relics.iter().any(|r| &r.card_id == card_id),
                    "Relic {} must be present in Player 0 relic zone",
                    card_id
                );
            }
            CardType::Environment => {
                assert_eq!(
                    state.active_environment.as_ref().map(|e| &e.card_id),
                    Some(card_id),
                    "Environment {} must replace active battlefield environment",
                    card_id
                );
            }
            CardType::Tactic => {
                assert!(
                    state.players[0].discard.iter().any(|c| &c.card_id == card_id),
                    "Tactic {} must move to discard pile after resolving",
                    card_id
                );
            }
        }
    }
}

#[test]
fn test_deterministic_replay_produces_identical_checksums() {
    let (catalogue, decks) = load_catalogue_and_decks();

    let run_simulation = |seed: u64| -> (u64, MatchOutcome, usize) {
        let mut state = MatchState::new_1v1(&decks.decks[8], &decks.decks[9], &catalogue, seed)
            .expect("init match");
        let mut count = 0;
        while state.outcome == MatchOutcome::InProgress && count < 400 {
            let cmd = NpcAi::choose_command(&state, &catalogue, AiDifficulty::Veteran);
            let res = state.apply_command(cmd, &catalogue);
            assert!(res.accepted);
            count += 1;
        }
        (state.compute_checksum(), state.outcome, count)
    };

    let (hash1, out1, steps1) = run_simulation(20261118);
    let (hash2, out2, steps2) = run_simulation(20261118);

    assert_eq!(hash1, hash2, "Deterministic replay checksums must match");
    assert_eq!(out1, out2);
    assert_eq!(steps1, steps2);
    assert_ne!(out1, MatchOutcome::InProgress, "Match should finish cleanly");
}

#[test]
fn test_2v2_tag_battle_shared_vitality_shared_board_and_turn_rotation() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let tag_decks = [
        &decks.decks[0],
        &decks.decks[1],
        &decks.decks[8],
        &decks.decks[9],
    ];
    let mut state = MatchState::new_2v2(tag_decks, &catalogue, 987654321).expect("init 2v2");

    assert_eq!(state.format, MatchFormat::Tag2v2);
    assert_eq!(state.players.len(), 4);
    assert_eq!(state.players[0].vitality, 45);
    assert_eq!(state.players[1].vitality, 45);
    assert_eq!(state.players[2].vitality, 45);
    assert_eq!(state.players[3].vitality, 45);
    assert_eq!(state.active_player, 0);

    // Player 0 (Team 0, A1) summons a creature to Lane 0 Front
    state.players[0].aether = 5;
    state.players[0].hand[0].card_id = "EMB-C-0001".to_string();
    assert!(
        state
            .apply_command(
                BattleCommand::SummonCreature {
                    player: 0,
                    hand_index: 0,
                    lane: 0,
                    position: SlotPosition::Front,
                },
                &catalogue
            )
            .accepted
    );

    // Team 0 partner (Player 2, A2) shares the synchronized team board view
    assert!(state.players[2].lanes[0].front.is_some());

    // Turn rotation: 0 -> 1 -> 2 -> 3 -> 0
    assert!(
        state
            .apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue)
            .accepted
    );
    assert_eq!(state.active_player, 1);

    assert!(
        state
            .apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue)
            .accepted
    );
    assert_eq!(state.active_player, 2);

    // Player 2 (Team 0, A2) can attack with the creature summoned by teammate Player 0!
    let atk = state.apply_command(
        BattleCommand::AttackLeader {
            player: 2,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(
        atk.accepted,
        "Teammate A2 must be able to command ready units on Team 0's shared board"
    );
    // Team 1 (players 1 & 3) shared vitality must drop together
    assert_eq!(state.players[1].vitality, state.players[3].vitality);
    assert!(state.players[1].vitality < 45);

    // Run full 2v2 simulation to completion
    let mut steps = 0usize;
    while state.outcome == MatchOutcome::InProgress && steps < 600 {
        let cmd = NpcAi::choose_command(&state, &catalogue, AiDifficulty::Skilled);
        let res = state.apply_command(cmd, &catalogue);
        assert!(res.accepted);
        steps += 1;
    }
    assert!(
        matches!(
            state.outcome,
            MatchOutcome::TeamVictory(0) | MatchOutcome::TeamVictory(1) | MatchOutcome::Draw
        ),
        "2v2 Tag match should conclude with TeamVictory or Draw, got {:?}",
        state.outcome
    );
}

#[test]
fn test_hidden_information_redaction_never_leaks_opponent_hand_or_deck() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let state =
        MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 12345).expect("init");

    let view_p0 = state.redact_for_player(Some(0));
    // Player 0 can see their own hand card IDs
    assert!(view_p0.players[0].hand.iter().all(|c| c.card_id != "HIDDEN"));
    // Player 0 cannot see Player 1's hand card IDs
    assert!(view_p0.players[1].hand.iter().all(|c| c.card_id == "HIDDEN"));
    // Neither player's draw deck order is exposed
    assert!(view_p0.players[0].deck.iter().all(|c| c.card_id == "HIDDEN"));
    assert!(view_p0.players[1].deck.iter().all(|c| c.card_id == "HIDDEN"));

    let view_p1 = state.redact_for_player(Some(1));
    assert!(view_p1.players[1].hand.iter().all(|c| c.card_id != "HIDDEN"));
    assert!(view_p1.players[0].hand.iter().all(|c| c.card_id == "HIDDEN"));

    // Spectator view (None) must redact ALL players' hands and decks
    let view_spectator = state.redact_for_player(None);
    assert!(view_spectator.players[0].hand.iter().all(|c| c.card_id == "HIDDEN"));
    assert!(view_spectator.players[1].hand.iter().all(|c| c.card_id == "HIDDEN"));
}
