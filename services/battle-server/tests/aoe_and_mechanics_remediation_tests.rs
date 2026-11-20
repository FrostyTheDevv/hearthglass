use hearthglass_battle_server::{
    AiDifficulty, BattleCommand, CardBundle, CardDefinition,
    Faction, MatchState, NpcAi, SlotPosition,
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
// 1. ALL_ENEMY_CREATURES TARGET RESOLUTION TESTS (TASK 1)
// =========================================================================

#[test]
fn test_aoe_deal_damage_hits_all_enemy_creatures_across_all_lanes() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 501).unwrap();

    // P1 has 3 creatures across lanes 0, 1, 2 (each with 3 health)
    state.players[1].lanes[0].front = Some(create_custom_unit(101, "E0", "Enemy 0", 1, 2, 3, vec![]));
    state.players[1].lanes[1].front = Some(create_custom_unit(102, "E1", "Enemy 1", 1, 2, 3, vec![]));
    state.players[1].lanes[2].front = Some(create_custom_unit(103, "E2", "Enemy 2", 1, 2, 3, vec![]));

    // P0 also has a friendly creature in lane 0 (should NOT be damaged)
    state.players[0].lanes[0].front = Some(create_custom_unit(201, "F0", "Friend 0", 0, 2, 3, vec![]));

    // P0 plays EMB-T-0043: Cinder-Vent Eruption (deal_damage, target: all_enemy_creatures, amount: 1)
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

    // All 3 enemy creatures take 1 damage (HP: 3 -> 2)
    assert_eq!(state.players[1].lanes[0].front.as_ref().unwrap().health, 2);
    assert_eq!(state.players[1].lanes[1].front.as_ref().unwrap().health, 2);
    assert_eq!(state.players[1].lanes[2].front.as_ref().unwrap().health, 2);

    // Friendly creature took ZERO damage (HP remains 3)
    assert_eq!(state.players[0].lanes[0].front.as_ref().unwrap().health, 3);
}

#[test]
fn test_aoe_deal_damage_respects_ward_and_shield() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 502).unwrap();

    // P1 has 3 creatures:
    // Lane 0: has Ward (should consume Ward, HP stays 3)
    // Lane 1: has Shield (should absorb damage, remove Shield, HP stays 3)
    // Lane 2: normal (HP drops from 3 to 2)
    state.players[1].lanes[0].front = Some(create_custom_unit(101, "E0", "Ward Enemy", 1, 2, 3, vec!["ward"]));
    state.players[1].lanes[1].front = Some(create_custom_unit(102, "E1", "Shield Enemy", 1, 2, 3, vec!["shield"]));
    state.players[1].lanes[2].front = Some(create_custom_unit(103, "E2", "Normal Enemy", 1, 2, 3, vec![]));

    // P0 plays EMB-T-0043 (deal_damage, all_enemy_creatures, amount: 1)
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

    let u0 = state.players[1].lanes[0].front.as_ref().unwrap();
    assert_eq!(u0.health, 3, "Ward must negate damage");
    assert!(!u0.has_keyword("ward"), "Ward must be consumed");

    let u1 = state.players[1].lanes[1].front.as_ref().unwrap();
    assert_eq!(u1.health, 3, "Shield must absorb damage");
    assert!(!u1.has_keyword("shield"), "Shield must be removed");

    let u2 = state.players[1].lanes[2].front.as_ref().unwrap();
    assert_eq!(u2.health, 2, "Unshielded creature must take 1 damage");
}

#[test]
fn test_aoe_deal_damage_triggers_rebirth_on_lethal() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 503).unwrap();

    // P1 has a creature with 1 HP and Rebirth keyword in lane 0
    state.players[1].lanes[0].front = Some(create_custom_unit(101, "GRV-C-0001", "Rebirth Skeleton", 1, 1, 1, vec!["rebirth"]));

    // P0 plays EMB-T-0043 (1 AoE damage)
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

    // Rebirth must trigger, replacing with a 1/1 Token Echo Remnant
    let remnant = state.players[1].lanes[0].front.as_ref().expect("Echo Remnant must spawn");
    assert_eq!(remnant.card_id, "TOKEN-ECHO_REMNANT");
    assert_eq!(remnant.attack, 1);
    assert_eq!(remnant.health, 1);
    assert!(remnant.is_token);

    // Original card in P1 discard
    assert!(state.players[1].discard.iter().any(|c| c.card_id == "GRV-C-0001"));
}

#[test]
fn test_aoe_2v2_tag_damage_never_duplicates_or_hits_allies() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let tag_decks = [
        &decks.decks[0],
        &decks.decks[1],
        &decks.decks[2],
        &decks.decks[3],
    ];
    let mut state = MatchState::new_2v2(tag_decks, &catalogue, 504).unwrap();

    // Team 1 (opposing board holder is 1) has 2 creatures
    state.players[1].lanes[0].front = Some(create_custom_unit(101, "E0", "Enemy 0", 1, 2, 4, vec![]));
    state.players[1].lanes[1].front = Some(create_custom_unit(102, "E1", "Enemy 1", 3, 2, 4, vec![]));

    // Team 0 (allies) has 1 creature
    state.players[0].lanes[0].front = Some(create_custom_unit(201, "F0", "Ally 0", 0, 2, 4, vec![]));

    // Seat 0 (Team 0) plays EMB-T-0043 (1 AoE damage)
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

    // Both enemy creatures take exactly 1 damage (4 -> 3), never duplicated
    assert_eq!(state.players[1].lanes[0].front.as_ref().unwrap().health, 3);
    assert_eq!(state.players[1].lanes[1].front.as_ref().unwrap().health, 3);

    // Ally creature took 0 damage
    assert_eq!(state.players[0].lanes[0].front.as_ref().unwrap().health, 4);
}

#[test]
fn test_aoe_grant_keyword_exhaust_hits_all_enemy_creatures() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 505).unwrap();

    // P1 has 2 ready creatures
    state.players[1].lanes[0].front = Some(create_custom_unit(101, "E0", "Enemy 0", 1, 2, 3, vec![]));
    state.players[1].lanes[1].front = Some(create_custom_unit(102, "E1", "Enemy 1", 1, 2, 3, vec![]));

    // P0 plays VER-T-0043: Entangling Root-Surge (grant_keyword exhaust -> all_enemy_creatures)
    state.players[0].aether = 10;
    state.players[0].hand[0].card_id = "VER-T-0043".to_string();

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

    assert!(state.players[1].lanes[0].front.as_ref().unwrap().has_keyword("exhaust"));
    assert!(state.players[1].lanes[1].front.as_ref().unwrap().has_keyword("exhaust"));
}

#[test]
fn test_aoe_add_counter_corrode_reduces_stats_of_all_enemy_creatures() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 506).unwrap();

    // P1 has 2 creatures (3/3 each)
    state.players[1].lanes[0].front = Some(create_custom_unit(101, "E0", "Enemy 0", 1, 3, 3, vec![]));
    state.players[1].lanes[1].front = Some(create_custom_unit(102, "E1", "Enemy 1", 1, 3, 3, vec![]));

    // P0 summons GRV-C-0040: Ossuary Tomb-Warden (on_summon -> add_counter corrode 1 -> all_enemy_creatures)
    state.players[0].aether = 10;
    state.players[0].hand[0].card_id = "GRV-C-0040".to_string();

    let res = state.apply_command(
        BattleCommand::SummonCreature {
            player: 0,
            hand_index: 0,
            lane: 0,
            position: SlotPosition::Front,
        },
        &catalogue,
    );
    assert!(res.accepted);

    // Corrode gives -1/-1
    let e0 = state.players[1].lanes[0].front.as_ref().unwrap();
    assert_eq!(e0.attack, 2);
    assert_eq!(e0.health, 2);
    assert_eq!(*e0.counters.get("corrode").unwrap(), 1);

    let e1 = state.players[1].lanes[1].front.as_ref().unwrap();
    assert_eq!(e1.attack, 2);
    assert_eq!(e1.health, 2);
    assert_eq!(*e1.counters.get("corrode").unwrap(), 1);
}

// =========================================================================
// 2. GLASSBORNE REFRACTION COMBAT DAMAGE REFLECTION (TASK 3)
// =========================================================================

#[test]
fn test_glassborne_refraction_reflects_combat_damage_back_to_attacker() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 507).unwrap();

    // Advance to Turn 2 so P1 can attack
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // P0 has a Glassborne defender with 2 Refraction counters (0 attack, 6 health)
    let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 6, vec![]);
    defender.counters.insert("refraction".to_string(), 2);
    state.players[0].lanes[0].front = Some(defender);

    // P1 has an attacker with 3 attack and 5 health
    let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 3, 5, vec![]);
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

    // Defender took 3 damage (6 -> 3)
    let def_now = state.players[0].lanes[0].front.as_ref().unwrap();
    assert_eq!(def_now.health, 3);

    // Attacker took 0 base damage from defender attack (0) PLUS 2 Reflected damage from Refraction!
    // Attacker health: 5 - 2 = 3!
    let att_now = state.players[1].lanes[0].front.as_ref().unwrap();
    assert_eq!(att_now.health, 3, "Attacker must take 2 reflected damage from Refraction");
}

#[test]
fn test_glassborne_refraction_does_not_reflect_when_silenced() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 508).unwrap();

    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // P0 has a silenced defender with refraction
    let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 6, vec![]);
    defender.counters.insert("refraction".to_string(), 2);
    defender.silenced = true;
    state.players[0].lanes[0].front = Some(defender);

    let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 3, 5, vec![]);
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

    // Attacker takes NO reflected damage because defender was silenced
    let att_now = state.players[1].lanes[0].front.as_ref().unwrap();
    assert_eq!(att_now.health, 5, "Silenced unit must not reflect damage");
}

#[test]
fn test_glassborne_refraction_defender_lethal_damage_still_reflects() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 510).unwrap();

    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // P0 defender has 2 HP, 0 ATK, and 2 Refraction counters
    let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 2, vec![]);
    defender.counters.insert("refraction".to_string(), 2);
    state.players[0].lanes[0].front = Some(defender);

    // P1 attacker has 5 ATK, 6 HP (lethal damage to defender)
    let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 5, 6, vec![]);
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

    // Defender took lethal damage (2 - 5 = -3) and died (cleaned up by state-based actions)
    assert!(state.players[0].lanes[0].front.is_none(), "Defender must die from lethal damage");

    // Attacker received 2 reflected damage from Refraction before defender was cleaned up: 6 - 2 = 4
    let att_now = state.players[1].lanes[0].front.as_ref().unwrap();
    assert_eq!(att_now.health, 4, "Attacker must take 2 reflected damage even when defender takes lethal damage");
}

#[test]
fn test_glassborne_refraction_attacker_dies_from_ordinary_retaliation() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 511).unwrap();

    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // P0 defender has 4 ATK, 5 HP, and 1 Refraction counter
    let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 4, 5, vec![]);
    defender.counters.insert("refraction".to_string(), 1);
    state.players[0].lanes[0].front = Some(defender);

    // P1 attacker has 2 ATK, 3 HP (ordinary retaliation of 4 ATK is lethal alone)
    let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 2, 3, vec![]);
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

    // Defender survived with 5 - 2 = 3 HP
    let def_now = state.players[0].lanes[0].front.as_ref().unwrap();
    assert_eq!(def_now.health, 3);

    // Attacker died (3 - 4 retaliation - 1 refraction = -2 HP)
    assert!(state.players[1].lanes[0].front.is_none(), "Attacker must die from retaliation + refraction");
}

#[test]
fn test_glassborne_refraction_attacker_dies_from_reflected_damage() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 512).unwrap();

    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // P0 defender has 0 ATK (0 retaliation damage), 6 HP, and 3 Refraction counters
    let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 6, vec![]);
    defender.counters.insert("refraction".to_string(), 3);
    state.players[0].lanes[0].front = Some(defender);

    // P1 attacker has 2 ATK, 3 HP (survives 0 retaliation, but dies to 3 Reflected damage!)
    let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 2, 3, vec![]);
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

    // Defender survived: 6 - 2 = 4 HP
    let def_now = state.players[0].lanes[0].front.as_ref().unwrap();
    assert_eq!(def_now.health, 4);

    // Attacker took 0 retaliation + 3 reflected damage = 3 total -> dies (health = 0)
    assert!(state.players[1].lanes[0].front.is_none(), "Attacker must die specifically from reflected damage");
}

#[test]
fn test_glassborne_refraction_shield_absorption_scenarios() {
    let (catalogue, decks) = load_catalogue_and_decks();

    // Scenario A: Defender has Shield. Shield absorbs incoming attack, and defender still reflects.
    {
        let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 513).unwrap();
        assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

        let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 5, vec!["shield"]);
        defender.counters.insert("refraction".to_string(), 2);
        state.players[0].lanes[0].front = Some(defender);

        let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 3, 5, vec![]);
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

        // Defender Shield absorbed attack: health remains 5, Shield consumed
        let def_now = state.players[0].lanes[0].front.as_ref().unwrap();
        assert_eq!(def_now.health, 5, "Defender Shield must absorb all combat damage");
        assert!(!def_now.has_keyword("shield"), "Defender Shield must be popped");

        // Attacker struck mirror: takes 2 reflected damage (5 - 2 = 3)
        let att_now = state.players[1].lanes[0].front.as_ref().unwrap();
        assert_eq!(att_now.health, 3, "Attacker takes reflected damage from striking Shielded mirror");
    }

    // Scenario B: Attacker has Shield. Attacker's Shield absorbs Refraction reflection.
    {
        let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 514).unwrap();
        assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

        let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 5, vec![]);
        defender.counters.insert("refraction".to_string(), 2);
        state.players[0].lanes[0].front = Some(defender);

        let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 2, 4, vec!["shield"]);
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

        // Attacker Shield absorbed reflected damage (defender has 0 ATK)
        let att_now = state.players[1].lanes[0].front.as_ref().unwrap();
        assert_eq!(att_now.health, 4, "Attacker Shield absorbs Refraction damage");
        assert!(!att_now.has_keyword("shield"), "Attacker Shield is popped by reflection");
    }
}

#[test]
fn test_glassborne_refraction_ward_in_combat_does_not_block_physical_attacks() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 515).unwrap();

    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // Defender has Ward and Refraction
    let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 5, vec!["ward"]);
    defender.counters.insert("refraction".to_string(), 2);
    state.players[0].lanes[0].front = Some(defender);

    let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 3, 5, vec![]);
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

    // Physical combat damage bypasses Ward (Ward only blocks spells/abilities)
    let def_now = state.players[0].lanes[0].front.as_ref().unwrap();
    assert_eq!(def_now.health, 2, "Physical attack deals normal damage through Ward");
    assert!(def_now.has_keyword("ward"), "Ward remains intact after physical combat");

    // Attacker takes 2 reflected damage
    let att_now = state.players[1].lanes[0].front.as_ref().unwrap();
    assert_eq!(att_now.health, 3, "Attacker takes 2 reflected damage");
}

#[test]
fn test_glassborne_refraction_scales_with_multiple_counters() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 516).unwrap();

    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // Defender has 5 Refraction counters
    let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 10, vec![]);
    defender.counters.insert("refraction".to_string(), 5);
    state.players[0].lanes[0].front = Some(defender);

    let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 2, 10, vec![]);
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

    // Attacker takes exactly 5 reflected damage: 10 - 5 = 5
    let att_now = state.players[1].lanes[0].front.as_ref().unwrap();
    assert_eq!(att_now.health, 5, "Attacker must take exactly 5 reflected damage for 5 counters");
}

#[test]
fn test_glassborne_refraction_simultaneous_deaths_in_combat() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 517).unwrap();

    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);

    // P0 defender: 2 HP, 0 ATK, 2 Refraction counters
    let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 2, vec![]);
    defender.counters.insert("refraction".to_string(), 2);
    state.players[0].lanes[0].front = Some(defender);

    // P1 attacker: 2 HP, 4 ATK (kills defender with 4 dmg, dies from 2 reflected dmg)
    let attacker = create_custom_unit(2001, "P1_ATT", "P1 Attacker", 1, 4, 2, vec![]);
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

    // Both units die simultaneously and their slots are cleared
    assert!(state.players[0].lanes[0].front.is_none(), "Defender must be destroyed");
    assert!(state.players[1].lanes[0].front.is_none(), "Attacker must be destroyed simultaneously");
}

#[test]
fn test_glassborne_refraction_2v2_shared_board_combat() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_2v2(
        [
            &decks.decks[0],
            &decks.decks[1],
            &decks.decks[2],
            &decks.decks[3],
        ],
        &catalogue,
        518,
    )
    .unwrap();

    // Advance to Turn 2 (active player Seat 1 on Team 1)
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);
    assert_eq!(state.active_player, 1);

    // Team 0 has Glassborne defender on shared board holder 0
    let mut defender = create_custom_unit(1001, "GLS_DEF", "Glass Defender", 0, 0, 5, vec![]);
    defender.counters.insert("refraction".to_string(), 2);
    state.players[0].lanes[0].front = Some(defender);

    // Team 1 has attacking unit owned by Seat 1 on shared board holder 1
    let attacker = create_custom_unit(2001, "T1_ATT", "Team 1 Attacker", 1, 3, 5, vec![]);
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

    // Team 1 attacker takes 2 reflected damage: 5 - 2 = 3
    let att_now = state.players[1].lanes[0].front.as_ref().unwrap();
    assert_eq!(att_now.health, 3, "2v2 attacker receives reflected damage on shared board");

    // Verify Seat 3 (partner on Team 1) has synchronized shared board with exact damage
    assert_eq!(state.players[3].lanes[0].front.as_ref().unwrap().health, 3);
}

// =========================================================================
// 3. AI DIFFICULTY EVALUATION DIFFERENTIATION (TASK 4)
// =========================================================================

#[test]
fn test_ai_difficulty_differentiates_lethal_recognition_and_trading() {
    let (catalogue, decks) = load_catalogue_and_decks();
    let mut state = MatchState::new_1v1(&decks.decks[0], &decks.decks[1], &catalogue, 509).unwrap();

    // Advance to Turn 2 so attacks are legal
    assert!(state.apply_command(BattleCommand::EndTurn { player: 0 }, &catalogue).accepted);
    assert_eq!(state.active_player, 1);

    // P0 leader vitality is 4 (within lethal range of a 5-attack creature)
    state.players[0].vitality = 4;

    // P1 has a 5-attack creature in an open lane 0 (can attack leader directly)
    state.players[1].lanes[0].front = Some(create_custom_unit(3001, "LETHAL_UNIT", "Lethal Behemoth", 1, 5, 5, vec![]));

    // Also has a card in hand that could be played
    state.players[1].aether = 5;

    // 1. Beginner AI: Naive play (will play a card from hand rather than taking immediate lethal attack)
    let beginner_cmd = NpcAi::choose_command(&state, &catalogue, AiDifficulty::Beginner);
    assert!(
        matches!(beginner_cmd, BattleCommand::SummonCreature { .. } | BattleCommand::PlayRelic { .. } | BattleCommand::PlayTactic { .. } | BattleCommand::PlayEnvironment { .. }),
        "Beginner AI does not prioritize immediate lethal strike"
    );

    // 2. Skilled AI: Recognizes lethal on leader and attacks leader immediately!
    let skilled_cmd = NpcAi::choose_command(&state, &catalogue, AiDifficulty::Skilled);
    assert_eq!(
        skilled_cmd,
        BattleCommand::AttackLeader {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
        },
        "Skilled AI must recognize lethal on opposing leader and attack immediately"
    );

    // 3. Boss AI: Also recognizes lethal and attacks leader immediately!
    let boss_cmd = NpcAi::choose_command(&state, &catalogue, AiDifficulty::Boss);
    assert_eq!(
        boss_cmd,
        BattleCommand::AttackLeader {
            player: 1,
            attacker_lane: 0,
            attacker_position: SlotPosition::Front,
        },
        "Boss AI must recognize lethal and strike leader for the win"
    );
}
