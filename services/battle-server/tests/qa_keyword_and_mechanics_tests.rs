use hearthglass_battle_server::{
    BattleCommand, BattleEvent, CardBundle, CardDefinition,
    Faction, MatchState, SlotPosition,
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
    keywords: Vec<&str>,
) -> CreatureUnit {
    let mut counters = BTreeMap::new();
    if keywords.contains(&"shield") {
        counters.insert("shield".to_string(), 1);
    }
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
        keywords: keywords.into_iter().map(|s| s.to_string()).collect(),
        counters,
        ready: true,
        attacks_this_turn: 0,
        moved_this_turn: false,
        silenced: false,
        is_token: false,
        reclaimed: false,
    }
}

// =========================================================================
// 1. CANONICAL KEYWORD VERIFICATION SUITE
// =========================================================================

#[test]
fn test_keyword_swift_and_first_turn_attack_restriction() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 101).unwrap();

    // Player 0 (Turn 1) summons a creature with Swift (e.g. EMB-C-0003 or custom swift unit)
    state.players[0].aether = 10;
    let swift_unit = create_custom_unit(1001, "TEST_SWIFT", "Swift Runner", 0, 3, 2, vec!["swift"]);
    state.players[0].lanes[0].front = Some(swift_unit);

    // On Turn 1, Player 0 CANNOT attack even with Swift (rules section 1.1)
    let atk_err = state.apply_command(
        BattleCommand::AttackLeader {
            player: 0,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(!atk_err.accepted);
    assert_eq!(
        atk_err.error,
        Some("The first player cannot attack during the opening turn".to_string())
    );

    // End Player 0's turn -> Advances to Player 1 (Global turn 2)
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);
    assert_eq!(state.global_turn, 2);
    assert_eq!(state.active_player, 1);

    // Player 1 summons a Swift creature on Turn 2
    state.players[1].aether = 10;
    let p1_swift = create_custom_unit(1002, "TEST_SWIFT_P1", "P1 Swift", 1, 4, 3, vec!["swift"]);
    state.players[1].lanes[1].front = Some(p1_swift);

    // Player 1 CAN attack immediately on Turn 2 with Swift!
    let atk_ok = state.apply_command(
        BattleCommand::AttackLeader {
            player: 1,
            attacker_lane: 1,
            attacker_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(atk_ok.accepted, "Player 1 with Swift must be able to attack on global turn 2");
    assert_eq!(state.players[0].vitality, 26); // 30 - 4 = 26
}

#[test]
fn test_keyword_shield_absorbs_damage_and_blocks_pierce() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 102).unwrap();

    // Advance to Turn 2 so attacks are legal
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // Player 1 has an attacker with 6 Attack and Pierce
    let attacker = create_custom_unit(2001, "PIERCE_BEAST", "Pierce Beast", 1, 6, 5, vec!["pierce"]);
    state.players[1].lanes[0].front = Some(attacker);

    // Player 0 has a defender with 2 Health and Shield
    let defender = create_custom_unit(2002, "SHIELD_GUARD", "Shield Guard", 0, 1, 2, vec!["shield"]);
    state.players[0].lanes[0].front = Some(defender);

    let initial_p0_vit = state.players[0].vitality;

    let res = state.apply_command(
        BattleCommand::AttackCreature {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
            defender_lane: 0,
            defender_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(res.accepted);

    // 1. Defender's Shield should absorb the blow completely: defender remains at 2 Health!
    let def_after = state.players[0].lanes[0].front.as_ref().unwrap();
    assert_eq!(def_after.health, 2, "Shield must absorb all damage");
    assert!(!def_after.has_keyword("shield"), "Shield keyword must be consumed");
    assert!(!def_after.counters.contains_key("shield"), "Shield counter must be removed");

    // 2. Because Shield absorbed all damage (excess = 0), Pierce deals 0 damage to P0 Leader
    assert_eq!(
        state.players[0].vitality, initial_p0_vit,
        "Pierce must deal 0 damage when defender has Shield"
    );

    // 3. Verify ShieldAbsorbed event was emitted
    assert!(res.events.iter().any(|e| matches!(e, BattleEvent::ShieldAbsorbed { .. })));
}

#[test]
fn test_keyword_pierce_deals_excess_combat_damage_to_leader() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 103).unwrap();
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // Attacker: 5 Attack, Pierce
    let attacker = create_custom_unit(3001, "PIERCE_UNIT", "Pierce Unit", 1, 5, 4, vec!["pierce"]);
    state.players[1].lanes[0].front = Some(attacker);

    // Defender: 2 Attack, 2 Health (NO shield)
    let defender = create_custom_unit(3002, "WEAK_DEF", "Weak Defender", 0, 2, 2, vec![]);
    state.players[0].lanes[0].front = Some(defender);

    let res = state.apply_command(
        BattleCommand::AttackCreature {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
            defender_lane: 0,
            defender_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(res.accepted);

    // Defender had 2 Health, Attacker dealt 5 -> Excess = 3 to P0 Leader
    assert_eq!(state.players[0].vitality, 27); // 30 - 3 = 27
    // Defender was destroyed
    assert!(state.players[0].lanes[0].front.is_none());
}

#[test]
fn test_keyword_drain_heals_leader_and_caps_at_max_vitality() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 104).unwrap();
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // Attacker: 4 Attack, Drain
    let attacker = create_custom_unit(4001, "DRAIN_UNIT", "Drain Unit", 1, 4, 4, vec!["drain"]);
    state.players[1].lanes[0].front = Some(attacker);

    // Lower Player 1 vitality to 20 (max 30)
    state.players[1].vitality = 20;

    // Direct leader attack
    let res = state.apply_command(
        BattleCommand::AttackLeader {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(res.accepted);

    // P0 took 4 damage: 30 - 4 = 26
    assert_eq!(state.players[0].vitality, 26);
    // P1 healed 4 damage via Drain: 20 + 4 = 24
    assert_eq!(state.players[1].vitality, 24);

    // Now test that Drain cannot overheal above max_vitality (30)
    state.players[1].vitality = 29;
    state.players[1].lanes[0].front.as_mut().unwrap().ready = true;
    state.players[1].lanes[0].front.as_mut().unwrap().attacks_this_turn = 0;

    let res2 = state.apply_command(
        BattleCommand::AttackLeader {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(res2.accepted);
    assert_eq!(state.players[1].vitality, 30, "Drain must cap at max_vitality (30)");
}

#[test]
fn test_keyword_ward_negates_hostile_spell_or_ability() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 105).unwrap();

    // P0 has a creature with Ward in Lane 0 Front
    let warded_unit = create_custom_unit(5001, "WARD_UNIT", "Ward Unit", 0, 3, 3, vec!["ward"]);
    state.players[0].lanes[0].front = Some(warded_unit);

    // P0 ends turn -> P1's turn
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // P1 plays a damage Tactic (e.g. EMB-T-0006: Blazing Strike, deals 3 damage to enemy in lane)
    state.players[1].aether = 10;
    state.players[1].hand[0].card_id = "EMB-T-0006".to_string();

    let res = state.apply_command(
        BattleCommand::PlayTactic {
            player: 1,
            hand_index: 0,
            target_lane: Some(0),
            target_position: Some(SlotPosition::Front),
        },
        &catalogue,
    );
    assert!(res.accepted);

    // Ward must negate the damage: health remains 3, Ward keyword is consumed
    let unit_after = state.players[0].lanes[0].front.as_ref().unwrap();
    assert_eq!(unit_after.health, 3, "Ward must negate all spell damage");
    assert!(!unit_after.has_keyword("ward"), "Ward must be consumed");
    assert!(res.events.iter().any(|e| matches!(e, BattleEvent::WardTriggered { .. })));
}

#[test]
fn test_keyword_reach_and_guard_positional_interaction() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 106).unwrap();
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // Case 1: Attacker lacks Reach -> CANNOT attack Rear while Front exists
    let normal_att = create_custom_unit(6001, "NORMAL_ATT", "Normal Attacker", 1, 3, 3, vec![]);
    state.players[1].lanes[0].front = Some(normal_att);

    let front_enemy = create_custom_unit(6002, "FRONT_DEF", "Front Def", 0, 2, 4, vec![]);
    let rear_enemy = create_custom_unit(6003, "REAR_DEF", "Rear Def", 0, 1, 2, vec![]);
    state.players[0].lanes[0].front = Some(front_enemy);
    state.players[0].lanes[0].rear = Some(rear_enemy);

    let res_err = state.apply_command(
        BattleCommand::AttackCreature {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
            defender_lane: 0,
            defender_position: SlotPosition::Rear,
        },
        &catalogue,
    );
    assert!(!res_err.accepted);
    assert_eq!(
        res_err.error,
        Some("Front position protects Rear position unless attacker has Reach and Front lacks Guard".to_string())
    );

    // Case 2: Attacker HAS Reach and Front enemy LACKS Guard -> CAN attack Rear!
    state.players[1].lanes[0].front.as_mut().unwrap().add_keyword("reach");
    let res_reach = state.apply_command(
        BattleCommand::AttackCreature {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
            defender_lane: 0,
            defender_position: SlotPosition::Rear,
        },
        &catalogue,
    );
    assert!(res_reach.accepted, "Reach attacker must be able to target Rear when Front lacks Guard");

    // Case 3: Front enemy HAS Guard -> Reach CANNOT bypass Guard!
    // Reset attacker
    state.players[1].lanes[0].front.as_mut().unwrap().ready = true;
    state.players[1].lanes[0].front.as_mut().unwrap().attacks_this_turn = 0;
    // Add Guard to Front enemy
    state.players[0].lanes[0].front.as_mut().unwrap().add_keyword("guard");
    // Place new Rear enemy
    state.players[0].lanes[0].rear = Some(create_custom_unit(6004, "REAR_DEF2", "Rear Def 2", 0, 1, 2, vec![]));

    let res_guard_blocks = state.apply_command(
        BattleCommand::AttackCreature {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
            defender_lane: 0,
            defender_position: SlotPosition::Rear,
        },
        &catalogue,
    );
    assert!(!res_guard_blocks.accepted, "Front creature with Guard must block Reach from targeting Rear");
}

#[test]
fn test_keyword_skirmish_and_anchor_movement_rules() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 107).unwrap();

    // Player 0 puts a Skirmish unit in Lane 1 Front
    let skirmisher = create_custom_unit(7001, "SKIRMISH_UNIT", "Skirmisher", 0, 2, 3, vec!["skirmish"]);
    state.players[0].lanes[1].front = Some(skirmisher);

    // 1. Valid move to adjacent lane (Lane 1 -> Lane 0)
    let move_ok = state.apply_command(
        BattleCommand::MoveCreature {
            player: 0,
            from_lane: 1,
            from_position: SlotPosition::Front,
            to_lane: 0,
            to_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(move_ok.accepted, "Skirmish creature must be able to move to adjacent lane");
    assert!(state.players[0].lanes[1].front.is_none());
    assert!(state.players[0].lanes[0].front.is_some());
    assert!(state.players[0].lanes[0].front.as_ref().unwrap().moved_this_turn);

    // 2. Cannot move twice in the same turn
    let move_twice = state.apply_command(
        BattleCommand::MoveCreature {
            player: 0,
            from_lane: 0,
            from_position: SlotPosition::Front,
            to_lane: 1,
            to_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(!move_twice.accepted);
    assert_eq!(
        move_twice.error,
        Some("Creature has already moved this turn".to_string())
    );

    // 3. Reset moved_this_turn and add Anchor -> Anchor must prevent movement
    state.players[0].lanes[0].front.as_mut().unwrap().moved_this_turn = false;
    state.players[0].lanes[0].front.as_mut().unwrap().add_keyword("anchor");

    let move_anchored = state.apply_command(
        BattleCommand::MoveCreature {
            player: 0,
            from_lane: 0,
            from_position: SlotPosition::Front,
            to_lane: 1,
            to_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(!move_anchored.accepted);
    assert_eq!(
        move_anchored.error,
        Some("Anchored creature cannot move".to_string())
    );

    // 4. Cannot move non-adjacent (e.g. Lane 0 to Lane 2, delta = 2)
    state.players[0].lanes[0].front.as_mut().unwrap().remove_keyword("anchor");
    let move_jump = state.apply_command(
        BattleCommand::MoveCreature {
            player: 0,
            from_lane: 0,
            from_position: SlotPosition::Front,
            to_lane: 2,
            to_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(!move_jump.accepted);
    assert_eq!(
        move_jump.error,
        Some("Skirmish movement must be to an adjacent lane".to_string())
    );
}

#[test]
fn test_keyword_stealth_breaks_on_attack_and_prevents_targeting() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 108).unwrap();

    // P0 has a creature with Stealth in Lane 0 Front (5 Health so it survives combat)
    let stealthed = create_custom_unit(8001, "STEALTH_UNIT", "Stealth Assassin", 0, 4, 5, vec!["stealth"]);
    state.players[0].lanes[0].front = Some(stealthed);

    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // P1 attempts to attack the stealthed creature directly -> REJECTED
    let p1_att = create_custom_unit(8002, "P1_ATT", "P1 Attacker", 1, 1, 2, vec![]);
    state.players[1].lanes[0].front = Some(p1_att);

    let atk_err = state.apply_command(
        BattleCommand::AttackCreature {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
            defender_lane: 0,
            defender_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(!atk_err.accepted);
    assert_eq!(
        atk_err.error,
        Some("Cannot directly target a creature with Stealth".to_string())
    );

    // P1 ends turn -> P0 attacks with the stealthed creature against P1's attacker in Lane 0
    assert!(state.apply_command(BattleCommand::EndTurn { player: 1 }, &catalogue).accepted);

    let p0_atk = state.apply_command(
        BattleCommand::AttackCreature {
            player: 0,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
            defender_lane: 0,
            defender_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(p0_atk.accepted);

    // Stealth must break upon attacking!
    let unit_after = state.players[0].lanes[0].front.as_ref().unwrap();
    assert!(!unit_after.has_keyword("stealth"), "Stealth must break after attacking");
}

#[test]
fn test_keyword_rebirth_spawns_echo_remnant_token() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 109).unwrap();
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // P0 has a creature with Rebirth: 1 Health
    let rebirth_unit = create_custom_unit(9001, "GRV-C-0001", "Bonefield Wanderer", 0, 2, 1, vec!["rebirth"]);
    state.players[0].lanes[0].front = Some(rebirth_unit);

    // P1 attacks and destroys it
    let attacker = create_custom_unit(9002, "ATT", "Attacker", 1, 3, 4, vec![]);
    state.players[1].lanes[0].front = Some(attacker);

    let res = state.apply_command(
        BattleCommand::AttackCreature {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
            defender_lane: 0,
            defender_position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(res.accepted);

    // Rebirth spawns a 1/1 Token Echo Remnant in the same slot
    let remnant = state.players[0].lanes[0].front.as_ref().expect("Echo Remnant must spawn in slot");
    assert_eq!(remnant.card_id, "TOKEN-ECHO_REMNANT");
    assert_eq!(remnant.attack, 1);
    assert_eq!(remnant.health, 1);
    assert!(remnant.is_token);

    // Original card should be in P0 discard
    assert!(state.players[0].discard.iter().any(|c| c.card_id == "GRV-C-0001"));
}

#[test]
fn test_keyword_silence_removes_abilities_keywords_and_counters() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 110).unwrap();

    // P0 has a buffed creature with keywords and counters (no ward)
    let mut buffed = create_custom_unit(10001, "BUFFED", "Buffed Titan", 0, 5, 5, vec!["reach", "guard", "pierce"]);
    buffed.counters.insert("growth".to_string(), 3);
    buffed.counters.insert("heat".to_string(), 2);
    state.players[0].lanes[0].front = Some(buffed);

    // P0 ends turn -> P1 plays Silence Tactic (NEU-T-0042: Disruptive Counter-Chime)
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    state.players[1].aether = 10;
    state.players[1].hand[0].card_id = "NEU-T-0042".to_string();

    let res = state.apply_command(
        BattleCommand::PlayTactic {
            player: 1,
            hand_index: 0,
            target_lane: Some(0),
            target_position: Some(SlotPosition::Front),
        },
        &catalogue,
    );
    assert!(res.accepted);

    let unit = state.players[0].lanes[0].front.as_ref().unwrap();
    assert!(unit.silenced, "Unit must be silenced");
    assert!(unit.counters.is_empty(), "Counters must be cleared on silence");
    // Guard is retained per rules: u.keywords.retain(|k| k == "guard");
    assert!(unit.has_keyword("guard"), "Guard is retained through silence");
    assert!(!unit.has_keyword("pierce"), "Pierce must be cleared");
    assert!(!unit.has_keyword("reach"), "Reach must be cleared");
}

// =========================================================================
// 2. DEFECT REPRODUCTION: ALL_ENEMY_CREATURES AOE RESOLUTION GAP
// =========================================================================

#[test]
fn test_defect_audit_all_enemy_creatures_aoe_resolution() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 201).unwrap();

    // Player 1 has 3 creatures deployed across 3 lanes
    state.players[1].lanes[0].front = Some(create_custom_unit(20001, "ENEMY_0", "E0", 1, 2, 3, vec![]));
    state.players[1].lanes[1].front = Some(create_custom_unit(20002, "ENEMY_1", "E1", 1, 2, 3, vec![]));
    state.players[1].lanes[2].front = Some(create_custom_unit(20003, "ENEMY_2", "E2", 1, 2, 3, vec![]));

    // Player 0 plays EMB-T-0043: Cinder-Vent Eruption
    // Card ability: operation: deal_damage, target: all_enemy_creatures, amount: 1
    state.players[0].aether = 10;
    state.players[0].hand[0].card_id = "EMB-T-0043".to_string();

    let res = state.apply_command(
        BattleCommand::PlayTactic {
            player: 0,
            hand_index: 0,
            target_lane: Some(0),
            target_position: Some(SlotPosition::Front),
        },
        &catalogue,
    );
    assert!(res.accepted);

    // AUDIT OBSERVATION / DEFECT DEMONSTRATION:
    // In lib.rs, `deal_damage` has NO match arm for `all_enemy_creatures`.
    // It falls through to `_ => {}`, causing all 3 enemy creatures to remain at 3 health!
    let e0_hp = state.players[1].lanes[0].front.as_ref().unwrap().health;
    let e1_hp = state.players[1].lanes[1].front.as_ref().unwrap().health;
    let e2_hp = state.players[1].lanes[2].front.as_ref().unwrap().health;

    // Documenting verified defect:
    println!(
        "[QA AUDIT VERIFIED DEFECT] EMB-T-0043 ('all_enemy_creatures' AoE damage) resolved with E0 HP={}, E1 HP={}, E2 HP={} (Expected 2, Actual 3 due to missing Rust match arm)",
        e0_hp, e1_hp, e2_hp
    );
    assert_eq!(e0_hp, 3, "Confirms unhandled 'all_enemy_creatures' in Rust engine deal_damage");
    assert_eq!(e1_hp, 3, "Confirms unhandled 'all_enemy_creatures' in Rust engine deal_damage");
    assert_eq!(e2_hp, 3, "Confirms unhandled 'all_enemy_creatures' in Rust engine deal_damage");
}
