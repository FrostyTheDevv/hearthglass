use hearthglass_battle_server::{
    AiDifficulty, BattleCommand, CardBundle, CardDefinition, MatchOutcome, MatchState, NpcAi,
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
fn test_simulate_1000_matches() {
    let (catalogue, decks) = load_catalogue_and_decks();
    assert_eq!(catalogue.len(), 480);
    assert_eq!(decks.decks.len(), 16);

    let num_decks = decks.decks.len();
    let total_matches = 1000;

    let mut p0_wins = 0;
    let mut p1_wins = 0;
    let mut draws = 0;
    let mut timeouts = 0;
    let mut vitality_kos = 0;
    let mut total_actions: u64 = 0;
    let mut total_turns: u64 = 0;
    let mut turn_distribution: Vec<u32> = Vec::with_capacity(total_matches);

    let mut deck_stats: BTreeMap<String, (u32, u32)> = BTreeMap::new(); // deck_id -> (wins, plays)
    for d in &decks.decks {
        deck_stats.insert(d.id.clone(), (0, 0));
    }

    println!("\n=== STARTING 1,000 IN-MEMORY MATCH SIMULATION ===");

    for i in 0..total_matches {
        let d1_idx = i % num_decks;
        let mut d2_idx = (i * 3 + 1) % num_decks;
        if d1_idx == d2_idx {
            d2_idx = (d2_idx + 1) % num_decks;
        }

        let deck_a = &decks.decks[d1_idx];
        let deck_b = &decks.decks[d2_idx];

        deck_stats.get_mut(&deck_a.id).unwrap().1 += 1;
        deck_stats.get_mut(&deck_b.id).unwrap().1 += 1;

        let seed = (i as u64) * 31337 + 42;
        let mut state = MatchState::new_1v1(deck_a, deck_b, &catalogue, seed).expect("init match");

        let mut actions = 0;
        while state.outcome == MatchOutcome::InProgress && actions < 1000 {
            let cmd = NpcAi::choose_command(&state, &catalogue, AiDifficulty::Skilled);
            let res = state.apply_command(cmd, &catalogue);
            if !res.accepted {
                break;
            }
            actions += 1;
        }

        total_actions += actions as u64;
        total_turns += state.global_turn as u64;
        turn_distribution.push(state.global_turn);

        match state.outcome {
            MatchOutcome::PlayerVictory(0) => {
                p0_wins += 1;
                vitality_kos += 1;
                deck_stats.get_mut(&deck_a.id).unwrap().0 += 1;
            }
            MatchOutcome::PlayerVictory(1) => {
                p1_wins += 1;
                vitality_kos += 1;
                deck_stats.get_mut(&deck_b.id).unwrap().0 += 1;
            }
            MatchOutcome::Draw => {
                draws += 1;
                timeouts += 1;
            }
            MatchOutcome::InProgress => {
                if state.players[0].vitality > state.players[1].vitality {
                    p0_wins += 1;
                    deck_stats.get_mut(&deck_a.id).unwrap().0 += 1;
                } else if state.players[1].vitality > state.players[0].vitality {
                    p1_wins += 1;
                    deck_stats.get_mut(&deck_b.id).unwrap().0 += 1;
                } else {
                    draws += 1;
                }
                timeouts += 1;
            }
            _ => {}
        }
    }

    turn_distribution.sort();
    let mean_turns = total_turns as f64 / total_matches as f64;
    let median_turns = turn_distribution[total_matches / 2];
    let mean_actions = total_actions as f64 / total_matches as f64;

    println!("---------------------------------------------------------------");
    println!("Total Matches Simulated: {}", total_matches);
    println!("Total Legal Actions Executed: {}", total_actions);
    println!("Mean Actions Per Match: {:.1}", mean_actions);
    println!("Mean Global Turns Per Match: {:.1}", mean_turns);
    println!("Median Global Turns Per Match: {}", median_turns);
    println!("Vitality Depletion Knockouts: {} ({:.1}%)", vitality_kos, (vitality_kos as f64 / total_matches as f64) * 100.0);
    println!("Timeouts / Draws: {} ({:.1}%)", timeouts, (timeouts as f64 / total_matches as f64) * 100.0);
    println!("Player 0 (First Player) Wins: {} ({:.1}%)", p0_wins, (p0_wins as f64 / total_matches as f64) * 100.0);
    println!("Player 1 (Second Player) Wins: {} ({:.1}%)", p1_wins, (p1_wins as f64 / total_matches as f64) * 100.0);
    println!("Draws: {}", draws);
    println!("---------------------------------------------------------------");
    println!("Archetype Deck Win Rates:");
    for (deck_id, (wins, plays)) in &deck_stats {
        let wr = if *plays > 0 { (*wins as f64 / *plays as f64) * 100.0 } else { 0.0 };
        println!("  {:35}: {:3} / {:3} ({:5.1}%)", deck_id, wins, plays, wr);
    }
    println!("===============================================================\n");

    assert_eq!(p0_wins + p1_wins + draws, total_matches);
    assert!(vitality_kos >= 950, "At least 95% of matches should end in natural KOs");
}
