use hearthglass_battle_server::{
    BattleCommand, CardBundle, CardDefinition, MatchState, SlotPosition, StarterDecksFile,
};
use std::collections::{BTreeMap, HashSet};
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
fn test_1v1_multiplayer_snapshot_privacy_zero_leakage() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 42)
        .expect("Match initialization failed");

    // Advance 2 turns so both players have drawn multiple cards and populated event log
    let _ = state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue);
    let _ = state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue);

    // Identify cards uniquely held in Player 1's secret hand (not held by Player 0)
    let p0_public_ids: HashSet<String> = state.players[0]
        .hand
        .iter()
        .map(|c| c.card_id.clone())
        .collect();

    let p1_secret_ids: Vec<String> = state.players[1]
        .hand
        .iter()
        .map(|c| c.card_id.clone())
        .filter(|id| !p0_public_ids.contains(id))
        .collect();

    assert!(
        !p1_secret_ids.is_empty(),
        "Player 1 must hold at least one card unique to their hand"
    );

    // 1. Audit Player 0's redacted snapshot
    let p0_redacted = state.redact_for_player(Some(0));
    let p0_json = serde_json::to_string(&p0_redacted).expect("Serialize P0 redacted state");

    // Verify Player 1's secret hand cards NEVER appear anywhere in Player 0's serialized state
    for secret_id in &p1_secret_ids {
        assert!(
            !p0_json.contains(secret_id),
            "SECURITY LEAK: Player 1 secret card ID '{}' leaked into Player 0 serialized snapshot!",
            secret_id
        );
    }

    // Verify Player 1's hand cards are all labeled "HIDDEN"
    assert_eq!(
        p0_redacted.players[1].hand.len(),
        state.players[1].hand.len()
    );
    for card in &p0_redacted.players[1].hand {
        assert_eq!(card.card_id, "HIDDEN");
        assert_eq!(card.instance_id, 0);
    }

    // Verify both draw decks are completely hidden
    for card in &p0_redacted.players[0].deck {
        assert_eq!(card.card_id, "HIDDEN");
        assert_eq!(card.instance_id, 0);
    }
    for card in &p0_redacted.players[1].deck {
        assert_eq!(card.card_id, "HIDDEN");
        assert_eq!(card.instance_id, 0);
    }

    // Verify internal RNG state was zeroed out
    assert_eq!(p0_redacted.next_instance_id, 0);

    // 2. Audit Spectator snapshot (viewer = None)
    let spectator_redacted = state.redact_for_player(None);
    let spec_json =
        serde_json::to_string(&spectator_redacted).expect("Serialize spectator state");

    for p in &spectator_redacted.players {
        for card in &p.hand {
            assert_eq!(card.card_id, "HIDDEN", "Spectator must not see any player's hand cards");
            assert_eq!(card.instance_id, 0);
        }
        for card in &p.deck {
            assert_eq!(card.card_id, "HIDDEN", "Spectator must not see any player's deck cards");
            assert_eq!(card.instance_id, 0);
        }
    }

    // Verify event logs in spectator snapshot do not leak card IDs from draws
    assert!(
        !spec_json.contains("\"CardDrawn\":{\"player\":0,\"card_id\":\"EMB-"),
        "SECURITY LEAK: Spectator event log leaked drawn card ID"
    );
}

#[test]
fn test_2v2_tag_battle_snapshot_privacy_all_four_seats() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let d0 = &decks.decks[0];
    let d1 = &decks.decks[1];
    let d2 = &decks.decks[2];
    let d3 = &decks.decks[3];

    let state = MatchState::new_2v2([d0, d1, d2, d3], &catalogue, 9999)
        .expect("2v2 Tag match initialization failed");

    // Test each seat from 0 to 3:
    // Seat S must see Seat S hand, but seats != S MUST be redacted to "HIDDEN"
    for viewer_seat in 0..4 {
        let redacted = state.redact_for_player(Some(viewer_seat));

        for seat in 0..4 {
            if seat == viewer_seat {
                // Viewer can see their own hand
                for card in &redacted.players[seat].hand {
                    assert_ne!(
                        card.card_id, "HIDDEN",
                        "Viewer seat {} should see their own hand cards",
                        viewer_seat
                    );
                    assert!(card.instance_id > 0);
                }
            } else {
                // All other seats must be completely hidden
                for card in &redacted.players[seat].hand {
                    assert_eq!(
                        card.card_id, "HIDDEN",
                        "Viewer seat {} must not see seat {} hand cards",
                        viewer_seat, seat
                    );
                    assert_eq!(card.instance_id, 0);
                }
            }

            // All 4 draw decks must be redacted for everyone
            for card in &redacted.players[seat].deck {
                assert_eq!(
                    card.card_id, "HIDDEN",
                    "Draw deck must be redacted for seat {}",
                    seat
                );
                assert_eq!(card.instance_id, 0);
            }
        }

        // Verify RNG state and instance ID counter are sanitized
        assert_eq!(redacted.next_instance_id, 0);
    }

    // Audit Spectator for 2v2 Tag Battle
    let spectator_snapshot = state.redact_for_player(None);
    for seat in 0..4 {
        for card in &spectator_snapshot.players[seat].hand {
            assert_eq!(card.card_id, "HIDDEN", "Spectator must see zero hands in 2v2");
        }
        for card in &spectator_snapshot.players[seat].deck {
            assert_eq!(card.card_id, "HIDDEN", "Spectator must see zero decks in 2v2");
        }
    }
}

#[test]
fn test_dedicated_match_snapshot_dto_excludes_internal_state() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 12345)
        .expect("Match init");

    // Use dedicated player-facing DTO
    let snapshot_dto = state.to_snapshot(Some(0));
    let json = serde_json::to_string(&snapshot_dto).expect("Serialize DTO");

    // The dedicated DTO schema MUST NOT contain "rng" field
    assert!(
        !json.contains("\"rng\":"),
        "SECURITY LEAK: MatchSnapshotDto must not contain internal RNG state"
    );

    // The dedicated DTO schema MUST NOT contain full deck card instances
    assert!(
        !json.contains("\"deck\":["),
        "SECURITY LEAK: MatchSnapshotDto must not contain deck card instances array"
    );

    // Must preserve deck_count and hand_count
    assert_eq!(snapshot_dto.players[0].deck_count, 35);
    assert_eq!(snapshot_dto.players[0].hand_count, 5);
    assert_eq!(snapshot_dto.players[1].deck_count, 35);
    assert_eq!(snapshot_dto.players[1].hand_count, 5);

    // Player 0 sees their hand
    for c in &snapshot_dto.players[0].hand {
        assert_ne!(c.card_id, "HIDDEN");
    }

    // Player 1's hand is redacted
    for c in &snapshot_dto.players[1].hand {
        assert_eq!(c.card_id, "HIDDEN");
    }
}

#[test]
fn test_public_battlefield_information_preserved_accurately() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 777)
        .expect("Match init");

    // Player 0 plays a 1-cost creature to Lane 0 Front
    let p0_card_id = state.players[0].hand[0].card_id.clone();
    let p0_card_def = catalogue.get(&p0_card_id).unwrap();

    if p0_card_def.cost <= state.players[0].aether && p0_card_def.card_type == hearthglass_battle_server::CardType::Creature {
        let _ = state.apply_command(
            BattleCommand::SummonCreature {
                player: 0,
                hand_index: 0,
                lane: 0,
                position: SlotPosition::Front,
            },
            &catalogue,
        );

        // Verify public battlefield state in player 1's redacted snapshot
        let p1_snapshot = state.redact_for_player(Some(1));
        let lane0_front = p1_snapshot.players[0].lanes[0].front.as_ref();
        assert!(lane0_front.is_some(), "Summoned unit must be publicly visible on battlefield");
        let unit = lane0_front.unwrap();
        assert_eq!(unit.card_id, p0_card_id, "Unit card_id in play is public battlefield info");
        assert_eq!(unit.attack, p0_card_def.attack);
    }
}
