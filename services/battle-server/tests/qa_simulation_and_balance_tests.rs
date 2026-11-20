use hearthglass_battle_server::{
    AiDifficulty, CardBundle, CardDefinition, MatchOutcome, MatchState, NpcAi,
    StarterDecksFile,
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
fn test_qa_pairwise_deck_balance_and_first_player_advantage_audit() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let num_decks = decks.decks.len();
    assert_eq!(num_decks, 16, "Must evaluate all 16 canonical archetype decks");

    // Seeds per pairing direction (each pair gets 4 seeds in A->B, and 4 seeds in B->A with seat swap)
    let seeds_per_pairing = 4;
    let mut deck_wins = vec![0u32; num_decks];
    let mut deck_matches = vec![0u32; num_decks];
    let mut total_p0_wins = 0;
    let mut total_p1_wins = 0;
    let mut total_draws = 0;
    let mut total_timeouts = 0;
    let mut total_invalid_actions = 0;
    let mut total_matches = 0;

    let difficulties = [
        AiDifficulty::Beginner,
        AiDifficulty::Casual,
        AiDifficulty::Skilled,
        AiDifficulty::Veteran,
        AiDifficulty::Elite,
    ];

    for i in 0..num_decks {
        for j in (i + 1)..num_decks {
            let deck_i = &decks.decks[i];
            let deck_j = &decks.decks[j];

            for seed_idx in 0..seeds_per_pairing {
                let seed = ((i * 1000 + j * 10 + seed_idx) as u64)
                    .wrapping_mul(6364136223846793005)
                    .wrapping_add(1442695040888963407);

                let diff = difficulties[seed_idx % difficulties.len()];

                // --- DIRECTION 1: Deck i as Seat 0, Deck j as Seat 1 ---
                let mut state_a = MatchState::new_1v1(deck_i, deck_j, &catalogue, seed).unwrap();
                let mut actions_a = 0;
                while state_a.outcome == MatchOutcome::InProgress && actions_a < 500 {
                    let cmd = NpcAi::choose_command(&state_a, &catalogue, diff);
                    let res = state_a.apply_command(cmd, &catalogue);
                    if !res.accepted {
                        total_invalid_actions += 1;
                        break;
                    }
                    actions_a += 1;
                }
                total_matches += 1;
                deck_matches[i] += 1;
                deck_matches[j] += 1;

                match state_a.outcome {
                    MatchOutcome::PlayerVictory(0) => {
                        deck_wins[i] += 1;
                        total_p0_wins += 1;
                    }
                    MatchOutcome::PlayerVictory(1) => {
                        deck_wins[j] += 1;
                        total_p1_wins += 1;
                    }
                    MatchOutcome::Draw => total_draws += 1,
                    MatchOutcome::InProgress => total_timeouts += 1,
                    _ => total_timeouts += 1,
                }

                // --- DIRECTION 2: SWAPPED SEATS: Deck j as Seat 0, Deck i as Seat 1 (Same seed) ---
                let mut state_b = MatchState::new_1v1(deck_j, deck_i, &catalogue, seed).unwrap();
                let mut actions_b = 0;
                while state_b.outcome == MatchOutcome::InProgress && actions_b < 500 {
                    let cmd = NpcAi::choose_command(&state_b, &catalogue, diff);
                    let res = state_b.apply_command(cmd, &catalogue);
                    if !res.accepted {
                        total_invalid_actions += 1;
                        break;
                    }
                    actions_b += 1;
                }
                total_matches += 1;
                deck_matches[i] += 1;
                deck_matches[j] += 1;

                match state_b.outcome {
                    MatchOutcome::PlayerVictory(0) => {
                        deck_wins[j] += 1;
                        total_p0_wins += 1;
                    }
                    MatchOutcome::PlayerVictory(1) => {
                        deck_wins[i] += 1;
                        total_p1_wins += 1;
                    }
                    MatchOutcome::Draw => total_draws += 1,
                    MatchOutcome::InProgress => total_timeouts += 1,
                    _ => total_timeouts += 1,
                }
            }
        }
    }

    assert_eq!(total_invalid_actions, 0, "Zero invalid commands allowed during AI simulation");
    assert_eq!(total_timeouts, 0, "Zero matches should hang or exceed command limit");

    let p0_rate = (total_p0_wins as f64 / total_matches as f64) * 100.0;
    let p1_rate = (total_p1_wins as f64 / total_matches as f64) * 100.0;

    println!("\n=== QA PAIRWISE DECK BALANCE & FIRST-PLAYER ADVANTAGE AUDIT ===");
    println!("Total Matches Simulated: {}", total_matches);
    println!("Seat 0 (First Player) Win Rate: {:.1}% ({} wins)", p0_rate, total_p0_wins);
    println!("Seat 1 (Second Player) Win Rate: {:.1}% ({} wins)", p1_rate, total_p1_wins);
    println!("Natural Draws: {}", total_draws);

    // Deck Rankings
    let mut ranking: Vec<usize> = (0..num_decks).collect();
    ranking.sort_by(|&a, &b| deck_wins[b].cmp(&deck_wins[a]));

    println!("\nDECK WIN RATE RANKINGS:");
    for (rank, &idx) in ranking.iter().enumerate() {
        let wr = (deck_wins[idx] as f64 / deck_matches[idx] as f64) * 100.0;
        println!(
            "  #{:2} {:35}: {:3} / {:3} ({:5.1}%)",
            rank + 1,
            decks.decks[idx].id,
            deck_wins[idx],
            deck_matches[idx],
            wr
        );
    }

    let top_wr = (deck_wins[ranking[0]] as f64 / deck_matches[ranking[0]] as f64) * 100.0;
    let bottom_wr = (deck_wins[*ranking.last().unwrap()] as f64 / deck_matches[*ranking.last().unwrap()] as f64) * 100.0;

    println!("\nBALANCE SPREAD: Top = {:.1}%, Bottom = {:.1}%, Spread = {:.1}%", top_wr, bottom_wr, top_wr - bottom_wr);

    // Balance assertion: First-player win rate should be within reasonable bounds (< 60%)
    assert!(
        p0_rate < 60.0,
        "First-player advantage must not exceed 60% (Actual: {:.1}%)",
        p0_rate
    );
}
