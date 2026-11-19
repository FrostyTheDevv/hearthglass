use hearthglass_battle_server::{
    validate_deck, AiDifficulty, BattleCommand, CardBundle, CardDefinition, DeckDefinition,
    MatchOutcome, MatchState, NpcAi, StarterDecksFile,
};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::env;
use std::fs;
use std::io::{self, BufRead, Write};
use std::path::PathBuf;

fn load_content() -> (BTreeMap<String, CardDefinition>, StarterDecksFile) {
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

#[derive(Debug, Deserialize)]
#[serde(tag = "op", rename_all = "snake_case")]
enum RpcRequest {
    ValidateDeck {
        req_id: Option<String>,
        deck: DeckDefinition,
    },
    CreateMatch1v1 {
        req_id: Option<String>,
        deck_a: DeckDefinition,
        deck_b: DeckDefinition,
        seed: u64,
    },
    CreateMatch2v2 {
        req_id: Option<String>,
        decks: [DeckDefinition; 4],
        seed: u64,
    },
    ApplyCommand {
        req_id: Option<String>,
        state: MatchState,
        command: BattleCommand,
    },
    ChooseAiCommand {
        req_id: Option<String>,
        state: MatchState,
        #[serde(default)]
        difficulty: Option<AiDifficulty>,
    },
    RunAiTurns {
        req_id: Option<String>,
        state: MatchState,
        ai_players: Vec<usize>,
        #[serde(default)]
        difficulty: Option<AiDifficulty>,
    },
    RedactState {
        req_id: Option<String>,
        state: MatchState,
        viewer: Option<usize>,
    },
    LegalCommands {
        req_id: Option<String>,
        state: MatchState,
    },
}

#[derive(Debug, Serialize)]
struct RpcResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    req_id: Option<String>,
    ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    data: Option<serde_json::Value>,
}

fn process_rpc_line(
    line: &str,
    catalogue: &BTreeMap<String, CardDefinition>,
) -> RpcResponse {
    let parsed: Result<RpcRequest, _> = serde_json::from_str(line);
    match parsed {
        Err(e) => RpcResponse {
            req_id: None,
            ok: false,
            error: Some(format!("Invalid RPC JSON request: {}", e)),
            data: None,
        },
        Ok(req) => match req {
            RpcRequest::ValidateDeck { req_id, deck } => {
                let res = validate_deck(&deck, catalogue);
                RpcResponse {
                    req_id,
                    ok: true,
                    error: None,
                    data: Some(serde_json::to_value(res).unwrap()),
                }
            }
            RpcRequest::CreateMatch1v1 {
                req_id,
                deck_a,
                deck_b,
                seed,
            } => match MatchState::new_1v1(&deck_a, &deck_b, catalogue, seed) {
                Ok(state) => RpcResponse {
                    req_id,
                    ok: true,
                    error: None,
                    data: Some(serde_json::json!({
                        "state": state,
                        "checksum": state.compute_checksum()
                    })),
                },
                Err(err) => RpcResponse {
                    req_id,
                    ok: false,
                    error: Some(err),
                    data: None,
                },
            },
            RpcRequest::CreateMatch2v2 {
                req_id,
                decks,
                seed,
            } => {
                let deck_refs = [&decks[0], &decks[1], &decks[2], &decks[3]];
                match MatchState::new_2v2(deck_refs, catalogue, seed) {
                    Ok(state) => RpcResponse {
                        req_id,
                        ok: true,
                        error: None,
                        data: Some(serde_json::json!({
                            "state": state,
                            "checksum": state.compute_checksum()
                        })),
                    },
                    Err(err) => RpcResponse {
                        req_id,
                        ok: false,
                        error: Some(err),
                        data: None,
                    },
                }
            }
            RpcRequest::ApplyCommand {
                req_id,
                mut state,
                command,
            } => {
                let result = state.apply_command(command, catalogue);
                RpcResponse {
                    req_id,
                    ok: true,
                    error: None,
                    data: Some(serde_json::json!({
                        "result": result,
                        "state": state,
                    })),
                }
            }
            RpcRequest::ChooseAiCommand {
                req_id,
                state,
                difficulty,
            } => {
                let cmd = NpcAi::choose_command(
                    &state,
                    catalogue,
                    difficulty.unwrap_or(AiDifficulty::Skilled),
                );
                RpcResponse {
                    req_id,
                    ok: true,
                    error: None,
                    data: Some(serde_json::json!({ "command": cmd })),
                }
            }
            RpcRequest::RunAiTurns {
                req_id,
                mut state,
                ai_players,
                difficulty,
            } => {
                let diff = difficulty.unwrap_or(AiDifficulty::Skilled);
                let mut all_events = Vec::new();
                let mut steps = 0usize;
                while state.outcome == MatchOutcome::InProgress
                    && ai_players.contains(&state.active_player)
                    && steps < 64
                {
                    let cmd = NpcAi::choose_command(&state, catalogue, diff);
                    let res = state.apply_command(cmd, catalogue);
                    all_events.extend(res.events);
                    if !res.accepted {
                        let _ = state.apply_command(
                            BattleCommand::EndTurn {
                                player: state.active_player,
                            },
                            catalogue,
                        );
                        break;
                    }
                    steps += 1;
                }
                RpcResponse {
                    req_id,
                    ok: true,
                    error: None,
                    data: Some(serde_json::json!({
                        "state": state,
                        "events": all_events,
                        "checksum": state.compute_checksum(),
                        "outcome": state.outcome,
                    })),
                }
            }
            RpcRequest::RedactState {
                req_id,
                state,
                viewer,
            } => {
                let redacted = state.redact_for_player(viewer);
                RpcResponse {
                    req_id,
                    ok: true,
                    error: None,
                    data: Some(serde_json::json!({
                        "state": redacted,
                        "checksum": state.compute_checksum(),
                    })),
                }
            }
            RpcRequest::LegalCommands { req_id, state } => {
                let commands = state.generate_legal_commands(catalogue);
                RpcResponse {
                    req_id,
                    ok: true,
                    error: None,
                    data: Some(serde_json::json!({ "commands": commands })),
                }
            }
        },
    }
}

fn main() {
    let (catalogue, decks_file) = load_content();
    let args: Vec<String> = env::args().collect();

    if args.iter().any(|a| a == "--rpc-stdio") {
        let stdin = io::stdin();
        let mut stdout = io::stdout();
        for line in stdin.lock().lines() {
            match line {
                Ok(l) => {
                    let trimmed = l.trim();
                    if trimmed.is_empty() {
                        continue;
                    }
                    let resp = process_rpc_line(trimmed, &catalogue);
                    let json = serde_json::to_string(&resp).unwrap();
                    let _ = writeln!(stdout, "{}", json);
                    let _ = stdout.flush();
                }
                Err(_) => break,
            }
        }
        return;
    }

    if let Some(pos) = args.iter().position(|a| a == "--eval-file") {
        if let Some(path) = args.get(pos + 1) {
            if let Ok(payload) = std::fs::read_to_string(path) {
                let resp = process_rpc_line(&payload, &catalogue);
                println!("{}", serde_json::to_string(&resp).unwrap());
                return;
            }
        }
    }

    if let Some(pos) = args.iter().position(|a| a == "--eval-json") {
        if let Some(payload) = args.get(pos + 1) {
            let resp = process_rpc_line(payload, &catalogue);
            println!("{}", serde_json::to_string(&resp).unwrap());
            return;
        }
    }

    println!(
        "[Hearthglass Battle Server] Loaded {} canonical card definitions and {} starter decks.",
        catalogue.len(),
        decks_file.decks.len()
    );

    for deck in &decks_file.decks {
        let res = validate_deck(deck, &catalogue);
        assert!(
            res.valid,
            "Starter deck {} invalid: {:?}",
            deck.id, res.errors
        );
    }

    let deck_a = &decks_file.decks[0];
    let deck_b = &decks_file.decks[1];
    let mut match_state =
        MatchState::new_1v1(deck_a, deck_b, &catalogue, 0xCAFE_BEEF_1234_5678).unwrap();

    let mut steps = 0usize;
    while match_state.outcome == MatchOutcome::InProgress && steps < 500 {
        let cmd = NpcAi::choose_command(&match_state, &catalogue, AiDifficulty::Skilled);
        let result = match_state.apply_command(cmd, &catalogue);
        assert!(
            result.accepted,
            "AI emitted illegal command: {:?}",
            result.error
        );
        steps += 1;
    }

    println!(
        "[Hearthglass Battle Server] Completed deterministic 1v1 simulation in {} commands (Turn {}).",
        steps, match_state.global_turn
    );
    println!(
        "[Hearthglass Battle Server] Outcome: {:?} | P0 Vitality: {} | P1 Vitality: {} | Final Checksum: 0x{:016x}",
        match_state.outcome,
        match_state.players[0].vitality,
        match_state.players[1].vitality,
        match_state.compute_checksum()
    );
}
