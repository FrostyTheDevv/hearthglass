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

#[derive(Debug, Default, Clone)]
struct MatchupRecord {
    deck_a_wins: u32,
    deck_b_wins: u32,
    draws: u32,
    timeouts: u32,
    total_turns: u64,
}

#[test]
fn test_exhaustive_pairwise_matchup_simulation() {
    let (catalogue, decks) = load_catalogue_and_decks();
    assert_eq!(catalogue.len(), 480);
    assert_eq!(decks.decks.len(), 16);

    let num_decks = decks.decks.len();
    let seeds_per_pairing = 10;

    let mut pairwise_stats: BTreeMap<(usize, usize), MatchupRecord> = BTreeMap::new();
    let mut deck_non_mirror_wins: Vec<u32> = vec![0; num_decks];
    let mut deck_non_mirror_games: Vec<u32> = vec![0; num_decks];

    let mut p0_wins_non_mirror = 0;
    let mut p1_wins_non_mirror = 0;
    let mut draws_non_mirror = 0;
    let mut total_actions_non_mirror: u64 = 0;
    let mut turn_distribution_non_mirror: Vec<u32> = Vec::new();
    let mut total_timeouts_non_mirror = 0;
    let mut total_vitality_kos_non_mirror = 0;

    println!("\n=== STARTING EXHAUSTIVE PAIRWISE BATTLE SIMULATION (120 PAIRS x 20 GAMES = 2,400 MATCHES) ===");

    let mut distinct_pairs_tested = 0;

    for i in 0..num_decks {
        for j in (i + 1)..num_decks {
            distinct_pairs_tested += 1;
            let pair_key = (i, j);
            let mut record = MatchupRecord::default();

            let deck_i = &decks.decks[i];
            let deck_j = &decks.decks[j];

            for seed_idx in 0..seeds_per_pairing {
                let seed = ((i * 1000 + j * 10 + seed_idx) as u64)
                    .wrapping_mul(6364136223846793005)
                    .wrapping_add(1442695040888963407);

                // --- MATCH A: Deck i as Seat 0 (P0), Deck j as Seat 1 (P1) ---
                deck_non_mirror_games[i] += 1;
                deck_non_mirror_games[j] += 1;

                let mut state_a = MatchState::new_1v1(deck_i, deck_j, &catalogue, seed).expect("init match a");
                let mut actions_a = 0;
                while state_a.outcome == MatchOutcome::InProgress && actions_a < 1000 {
                    let cmd = NpcAi::choose_command(&state_a, &catalogue, AiDifficulty::Skilled);
                    let res = state_a.apply_command(cmd, &catalogue);
                    if !res.accepted { break; }
                    actions_a += 1;
                }
                total_actions_non_mirror += actions_a as u64;
                turn_distribution_non_mirror.push(state_a.global_turn);
                record.total_turns += state_a.global_turn as u64;

                match state_a.outcome {
                    MatchOutcome::PlayerVictory(0) => {
                        record.deck_a_wins += 1;
                        deck_non_mirror_wins[i] += 1;
                        p0_wins_non_mirror += 1;
                        total_vitality_kos_non_mirror += 1;
                    }
                    MatchOutcome::PlayerVictory(1) => {
                        record.deck_b_wins += 1;
                        deck_non_mirror_wins[j] += 1;
                        p1_wins_non_mirror += 1;
                        total_vitality_kos_non_mirror += 1;
                    }
                    _ => {
                        record.draws += 1;
                        draws_non_mirror += 1;
                        record.timeouts += 1;
                        total_timeouts_non_mirror += 1;
                    }
                }

                // --- MATCH B: Swapped Seats with IDENTICAL seed: Deck j as Seat 0 (P0), Deck i as Seat 1 (P1) ---
                deck_non_mirror_games[i] += 1;
                deck_non_mirror_games[j] += 1;

                let mut state_b = MatchState::new_1v1(deck_j, deck_i, &catalogue, seed).expect("init match b");
                let mut actions_b = 0;
                while state_b.outcome == MatchOutcome::InProgress && actions_b < 1000 {
                    let cmd = NpcAi::choose_command(&state_b, &catalogue, AiDifficulty::Skilled);
                    let res = state_b.apply_command(cmd, &catalogue);
                    if !res.accepted { break; }
                    actions_b += 1;
                }
                total_actions_non_mirror += actions_b as u64;
                turn_distribution_non_mirror.push(state_b.global_turn);
                record.total_turns += state_b.global_turn as u64;

                match state_b.outcome {
                    MatchOutcome::PlayerVictory(0) => {
                        // Seat 0 was deck j
                        record.deck_b_wins += 1;
                        deck_non_mirror_wins[j] += 1;
                        p0_wins_non_mirror += 1;
                        total_vitality_kos_non_mirror += 1;
                    }
                    MatchOutcome::PlayerVictory(1) => {
                        // Seat 1 was deck i
                        record.deck_a_wins += 1;
                        deck_non_mirror_wins[i] += 1;
                        p1_wins_non_mirror += 1;
                        total_vitality_kos_non_mirror += 1;
                    }
                    _ => {
                        record.draws += 1;
                        draws_non_mirror += 1;
                        record.timeouts += 1;
                        total_timeouts_non_mirror += 1;
                    }
                }
            }

            pairwise_stats.insert(pair_key, record);
        }
    }

    assert_eq!(distinct_pairs_tested, 120, "Must test exactly 120 distinct pairs (16*15/2)");
    assert_eq!(pairwise_stats.len(), 120);

    let total_non_mirror_matches = distinct_pairs_tested * seeds_per_pairing * 2;
    assert_eq!(total_non_mirror_matches, 2400);

    // --- MIRROR MATCH DATASET (16 Decks x 10 Seeds = 160 Mirror Matches) ---
    println!("=== SIMULATING SEPARATE MIRROR MATCH DATASET (16 DECKS x 10 SEEDS = 160 MATCHES) ===");
    let mut mirror_p0_wins = 0;
    let mut mirror_p1_wins = 0;
    let mut mirror_draws = 0;

    for i in 0..num_decks {
        let deck = &decks.decks[i];
        for k in 0..10 {
            let seed = ((i * 5555 + k) as u64)
                .wrapping_mul(6364136223846793005)
                .wrapping_add(1442695040888963407);
            let mut state = MatchState::new_1v1(deck, deck, &catalogue, seed).expect("init mirror match");
            let mut actions = 0;
            while state.outcome == MatchOutcome::InProgress && actions < 1000 {
                let cmd = NpcAi::choose_command(&state, &catalogue, AiDifficulty::Skilled);
                let res = state.apply_command(cmd, &catalogue);
                if !res.accepted { break; }
                actions += 1;
            }
            match state.outcome {
                MatchOutcome::PlayerVictory(0) => mirror_p0_wins += 1,
                MatchOutcome::PlayerVictory(1) => mirror_p1_wins += 1,
                _ => mirror_draws += 1,
            }
        }
    }

    turn_distribution_non_mirror.sort();
    let mean_turns = turn_distribution_non_mirror.iter().map(|&t| t as u64).sum::<u64>() as f64 / total_non_mirror_matches as f64;
    let median_turns = turn_distribution_non_mirror[total_non_mirror_matches / 2];
    let mean_actions = total_actions_non_mirror as f64 / total_non_mirror_matches as f64;

    println!("\n---------------------------------------------------------------------------------");
    println!("               EXHAUSTIVE 2,400 NON-MIRROR MATCH SIMULATION REPORT               ");
    println!("---------------------------------------------------------------------------------");
    println!("Total Distinct Deck Pairs Evaluated:  120 / 120 (100.0%)");
    println!("Total Non-Mirror Matches Run:        2,400 (10 Paired Seeds per Direction)");
    println!("Total Legal Commands Executed:       {}", total_actions_non_mirror);
    println!("Mean Commands Per Match:             {:.1}", mean_actions);
    println!("Mean Global Turns Per Match:         {:.1}", mean_turns);
    println!("Median Global Turns Per Match:       {}", median_turns);
    println!("Vitality Depletion Knockouts:        {} ({:.1}%)", total_vitality_kos_non_mirror, (total_vitality_kos_non_mirror as f64 / total_non_mirror_matches as f64) * 100.0);
    println!("Timeouts / Draws:                    {} ({:.1}%)", total_timeouts_non_mirror, (total_timeouts_non_mirror as f64 / total_non_mirror_matches as f64) * 100.0);
    println!("First-Player (Seat 0) Wins:          {} ({:.1}%)", p0_wins_non_mirror, (p0_wins_non_mirror as f64 / total_non_mirror_matches as f64) * 100.0);
    println!("Second-Player (Seat 1) Wins:         {} ({:.1}%)", p1_wins_non_mirror, (p1_wins_non_mirror as f64 / total_non_mirror_matches as f64) * 100.0);
    println!("Draws:                               {}", draws_non_mirror);
    println!("---------------------------------------------------------------------------------");
    println!("Mirror Matches (160 Games): Seat 0 Wins: {} ({:.1}%), Seat 1 Wins: {} ({:.1}%), Draws: {}",
        mirror_p0_wins, (mirror_p0_wins as f64 / 160.0) * 100.0,
        mirror_p1_wins, (mirror_p1_wins as f64 / 160.0) * 100.0,
        mirror_draws
    );
    println!("---------------------------------------------------------------------------------");
    println!("UNBIASED PAIRWISE DECK RANKING (Each deck played exactly 300 non-mirror games):");
    let mut ranked_indices: Vec<usize> = (0..num_decks).collect();
    ranked_indices.sort_by(|&a, &b| deck_non_mirror_wins[b].cmp(&deck_non_mirror_wins[a]));

    for (rank, &idx) in ranked_indices.iter().enumerate() {
        let deck = &decks.decks[idx];
        let wins = deck_non_mirror_wins[idx];
        let total = deck_non_mirror_games[idx];
        let wr = (wins as f64 / total as f64) * 100.0;
        println!("  #{:2} {:35}: {:3} / {:3} ({:5.1}%)", rank + 1, deck.id, wins, total, wr);
    }
    println!("=================================================================================\n");

    assert_eq!(p0_wins_non_mirror + p1_wins_non_mirror + draws_non_mirror, 2400);
    for total_g in deck_non_mirror_games {
        assert_eq!(total_g, 300, "Every deck must play exactly 300 non-mirror matches across all 15 opponents");
    }
}
