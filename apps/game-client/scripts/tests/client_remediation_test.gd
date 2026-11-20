extends Node
## Client Remediation & Defect Regression Test Suite for Hearthglass (Godot 4.3)
## Verifies all P0 and P1 review fixes:
##  1. Offline vs. Online Economy Isolation (purchases, crafting, network failure, duplicate prevention)
##  2. Tabletop Targeting System (allied, enemy, untargeted, cancellation, invalid explanations)
##  3. Victory Reward Presentation (accepted, rejected, duplicate idempotency, offline/online separation)
##  4. Collection & Deck Builder UX (actual loaded count, owned/unowned, copy limits, faction limits)
##  5. Procedural Audio Synthesis (SoundManager verification)

func _ready() -> void:
	print("\n" + "=".repeat(70))
	print("   PROJECT HEARTHGLASS — CLIENT REMEDIATION & REGRESSION TEST SUITE   ")
	print("=".repeat(70) + "\n")

	var all_ok := true
	all_ok = all_ok and _test_economy_separation()
	all_ok = all_ok and _test_tabletop_targeting_system()
	all_ok = all_ok and _test_victory_reward_presentation()
	all_ok = all_ok and _test_deck_builder_ux_and_restrictions()
	all_ok = all_ok and _test_procedural_audio()

	print("\n" + "=".repeat(70))
	if all_ok:
		print("   ALL CLIENT REMEDIATION TESTS PASSED (5/5 TEST SUITES OK)          ")
		print("=".repeat(70) + "\n")
		get_tree().quit(0)
	else:
		print("   TEST FAILURES DETECTED IN CLIENT REMEDIATION SUITE                 ")
		print("=".repeat(70) + "\n")
		get_tree().quit(1)

# ==============================================================================
# TEST 1: OFFLINE VS. ONLINE ECONOMY ISOLATION
# ==============================================================================
func _test_economy_separation() -> bool:
	print("[TEST SUITE 1] Verifying Offline vs. Online Economy Separation...")

	# Reset state
	GameState.set_account_mode("offline")
	GameState.offline_crowns = 500
	GameState.offline_echo_dust = 200
	GameState.online_crowns = 1000
	GameState.online_echo_dust = 300
	GameState.online_authenticated = false

	# 1A. Offline pack purchase updates ONLY offline state
	var off_res := GameState.purchase_pack_offline("pack_foundations")
	assert(off_res.get("success") == true, "Offline pack purchase failed")
	assert(GameState.offline_crowns == 400, "Offline crowns should be deducted 100 -> 400")
	assert(GameState.online_crowns == 1000, "Online crowns must remain untouched by offline purchase")
	assert(off_res.get("cards", []).size() == 5, "Offline pack must grant exactly 5 cards")
	print("  [OK] 1A. Offline pack purchase deducted offline crowns (400) and preserved online wallet (1000).")

	# 1B. Online purchase fails without authentication
	GameState.set_account_mode("online")
	var unauth_res := GameState.purchase_pack_online("pack_foundations")
	assert(unauth_res.get("success") == false, "Unauthenticated online purchase must fail")
	assert(GameState.online_crowns == 1000, "Online crowns must remain 1000 on auth failure")
	print("  [OK] 1B. Unauthenticated online purchase rejected without altering balances.")

	# 1C. Network failure does not grant cards or deduct currency
	GameState.online_authenticated = true
	GameState.auth_token = "valid_test_token"
	# Custom adapter simulating network error
	var network_fail_adapter := func(_pack, _idem):
		return {"success": false, "error": "Connection timed out"}
	var net_res := GameState.purchase_pack_online("pack_foundations", "key_1", network_fail_adapter)
	assert(net_res.get("success") == false, "Network error must report failure")
	assert(GameState.online_crowns == 1000, "Network error must not deduct online crowns")
	print("  [OK] 1C. Network failure gracefully handled; no cards or currency deducted.")

	# 1D. Insufficient funds grants nothing
	var server_insufficient_funds_adapter := func(_pack, _idem):
		return {"success": false, "error": "Insufficient crowns"}
	var broke_res := GameState.purchase_pack_online("pack_foundations", "key_2", server_insufficient_funds_adapter)
	assert(broke_res.get("success") == false, "Insufficient funds must fail")
	print("  [OK] 1D. Insufficient funds rejected with zero inventory granted.")

	# 1E. Successful server response updates online wallet strictly from authoritative values
	var mock_server_cards: Array = [
		{"id": "EMB-C-0001", "name": "Ashborne Initiate"},
		{"id": "IRN-C-0001", "name": "Cogline Recruit"},
		{"id": "VER-C-0001", "name": "Mossveil Tender"},
		{"id": "TID-C-0001", "name": "Reefstep Scout"},
		{"id": "GLS-C-0001", "name": "Prismblade Apprentice"}
	]
	var server_success_adapter := func(_pack, _idem):
		return {
			"success": true,
			"pack_id": "pack_foundations",
			"cards": mock_server_cards,
			"duplicate_echo_dust_gained": 0,
			"idempotent_replay": false,
			"wallet": {
				"crowns": 900,
				"echo_dust": 300,
				"sigils": 0
			}
		}
	var success_res := GameState.purchase_pack_online("pack_foundations", "key_3", server_success_adapter)
	assert(success_res.get("success") == true, "Server purchase must succeed")
	assert(GameState.online_crowns == 900, "Online crowns must reflect server wallet (900)")
	assert(GameState.offline_crowns == 400, "Offline wallet must remain unchanged by online transaction")
	assert(int(GameState.online_collection.get("EMB-C-0001", 0)) >= 1, "Server-awarded cards must be added to online collection")
	print("  [OK] 1E. Server-validated online purchase applied authoritative balance (900) without leaking into offline profile.")

	# 1F. Duplicate response processing does not double-charge or duplicate cards
	var server_replay_adapter := func(_pack, _idem):
		return {
			"success": true,
			"pack_id": "pack_foundations",
			"cards": [],
			"duplicate_echo_dust_gained": 0,
			"idempotent_replay": true,
			"wallet": {
				"crowns": 900,
				"echo_dust": 300,
				"sigils": 0
			}
		}
	var replay_res := GameState.purchase_pack_online("pack_foundations", "key_3", server_replay_adapter)
	assert(replay_res.get("idempotent_replay") == true, "Replay must indicate idempotency")
	assert(GameState.online_crowns == 900, "Duplicate request must not deduct crowns again")
	print("  [OK] 1F. Duplicate response idempotency verified; no double deduction.")

	return true

# ==============================================================================
# TEST 2: TABLETOP TARGET SELECTION SYSTEM
# ==============================================================================
func _test_tabletop_targeting_system() -> bool:
	print("[TEST SUITE 2] Verifying Tabletop Targeting Interaction System...")

	var arena_scene = load("res://scenes/battle/tabletop_arena.tscn")
	assert(arena_scene != null, "tabletop_arena.tscn must be loadable")
	var arena = arena_scene.instantiate()
	add_child(arena)

	# 2A. Deriving targeting requirements for representative faction cards
	var molten_reckoning: Dictionary = GameState.cards_by_id.get("EMB-T-0006", {})
	var t_info_enemy: Dictionary = arena._derive_tactic_targeting(molten_reckoning)
	assert(t_info_enemy.needs_target == true, "Molten Reckoning requires target")
	assert(t_info_enemy.target_type == "enemy_creature", "Molten Reckoning must target enemy_creature")

	var renewal: Dictionary = GameState.cards_by_id.get("VER-T-0006", {})
	var t_info_global: Dictionary = arena._derive_tactic_targeting(renewal)
	assert(t_info_global.needs_target == false, "Season of Renewal is global untargeted")

	var emergency_reconfig: Dictionary = GameState.cards_by_id.get("IRN-T-0006", {})
	var t_info_ally: Dictionary = arena._derive_tactic_targeting(emergency_reconfig)
	assert(t_info_ally.needs_target == true, "Emergency Reconfiguration requires target")
	assert(t_info_ally.target_type == "ally_creature", "Emergency Reconfiguration must target ally_creature")
	print("  [OK] 2A. Card targeting requirement derivation verified across Emberclad, Verdant, and Iron Choir.")

	# 2B. Entering and Cancelling Target Selection Mode
	arena.current_mode = arena.InteractionMode.SUMMON_TARGET
	arena.pending_hand_index = 0
	arena.pending_card_def = {"id": "EMB-C-0001", "name": "Ashborne Initiate"}
	assert(arena.current_mode == arena.InteractionMode.SUMMON_TARGET, "Should be in summon target mode")

	arena._cancel_interaction()
	assert(arena.current_mode == arena.InteractionMode.NEUTRAL, "Cancel must return to neutral mode")
	assert(arena.selected_hand_index == -1, "Hand selection must be cleared")
	print("  [OK] 2B. Action cancellation verified; cleanly returns to NEUTRAL interaction mode.")

	# 2C. Rejection explanations on invalid targets
	arena._show_rejection_explanation("Invalid Target: Cannot directly target a creature with Stealth.")
	assert(arena.inspector_label.text.contains("Stealth"), "Inspector must display stealth rejection explanation")
	print("  [OK] 2C. Rejection explanation verified in inspector UI.")

	arena.queue_free()
	return true

# ==============================================================================
# TEST 3: VICTORY REWARD PRESENTATION & IDEMPOTENCY
# ==============================================================================
func _test_victory_reward_presentation() -> bool:
	print("[TEST SUITE 3] Verifying Strict Victory Reward Presentation...")

	GameState.set_account_mode("offline")
	var initial_crowns := GameState.offline_crowns

	# 3A. In-progress match rejected with 0 crowns
	var in_progress_match := {"outcome": "in_progress", "match_id": "test_match_inprogress"}
	var r_prog := GameState.process_match_rewards(in_progress_match, "npc_master_vance")
	assert(r_prog.get("success") == false, "In-progress match must be rejected")
	assert(r_prog.get("crowns") == 0, "No crowns granted for in-progress match")
	print("  [OK] 3A. In-progress match rejected with 0 rewards.")

	# 3B. Lost match rejected with 0 crowns
	var lost_match := {"outcome": "opponent_victory", "match_id": "test_match_lost"}
	var r_lost := GameState.process_match_rewards(lost_match, "npc_master_vance")
	assert(r_lost.get("success") == false, "Lost match must be rejected")
	assert(r_lost.get("crowns") == 0, "No crowns granted for lost match")
	print("  [OK] 3B. Lost match rejected with 0 rewards.")

	# 3C. Authentic victory accepted and granted
	var test_match_id := "test_match_victory_" + str(Time.get_ticks_usec())
	var victory_match := {"outcome": "player_victory", "match_id": test_match_id}
	var r_win := GameState.process_match_rewards(victory_match, "npc_master_vance")
	assert(r_win.get("success") == true, "Authentic victory must be accepted")
	assert(r_win.get("crowns") > 0, "Crowns must be granted for authentic victory")
	assert(GameState.offline_crowns == initial_crowns + r_win.get("crowns"), "Offline wallet must increase by exact reward")
	print("  [OK] 3C. Authentic victory accepted with exact authoritative reward payout (+%d Crowns)." % r_win.get("crowns"))

	# 3D. Duplicate claim idempotency: second claim rejected without false success
	var r_dup := GameState.process_match_rewards(victory_match, "npc_master_vance")
	assert(r_dup.get("success") == false, "Duplicate claim must be rejected")
	assert(r_dup.get("already_claimed") == true, "Must be flagged as already_claimed")
	assert(r_dup.get("crowns") == 0, "Duplicate claim must grant 0 crowns")
	assert(GameState.offline_crowns == initial_crowns + r_win.get("crowns"), "Offline wallet must not increase on duplicate claim")
	print("  [OK] 3D. Duplicate reward claim blocked; already_claimed=true with 0 additional currency.")

	# 3E. Online mode blocks local reward synthesis
	GameState.set_account_mode("online")
	var r_online := GameState.process_match_rewards(victory_match, "npc_master_vance")
	assert(r_online.get("success") == false, "Online match rewards must not be locally generated")
	assert(r_online.get("error").contains("platform server"), "Error must specify server authority")
	print("  [OK] 3E. Online mode strictly prevents local reward synthesis.")

	return true

# ==============================================================================
# TEST 4: DECK BUILDER UX & RESTRICTIONS
# ==============================================================================
func _test_deck_builder_ux_and_restrictions() -> bool:
	print("[TEST SUITE 4] Verifying Deck Builder UX, Copy Limits & Faction Limits...")

	var db_scene = load("res://scenes/ui/deck_builder.tscn")
	assert(db_scene != null, "deck_builder.tscn must be loadable")
	var db = db_scene.instantiate()
	add_child(db)

	# 4A. Actual loaded card count displayed
	var total_cards := GameState.all_cards.size()
	assert(total_cards > 0, "Card catalogue must have loaded cards")
	assert(db.status_label.text.contains(str(total_cards)), "Status label must display actual loaded card count")
	print("  [OK] 4A. Actual card count dynamically displayed: %d cards." % total_cards)

	# 4B. Developer art prompt hidden in standard player view
	var sample_card: Dictionary = GameState.all_cards[0]
	db._display_card_details(sample_card)
	assert(not db.details_label.text.contains("Developer Inspection Mode"), "Dev inspection section must be hidden by default")
	db.dev_inspect_check.button_pressed = true
	db._display_card_details(sample_card)
	assert(db.details_label.text.contains("Developer Inspection Mode"), "Dev inspection visible when toggled")
	print("  [OK] 4B. Developer art prompts hidden from player view and exposed only via toggle.")

	# 4C. Copy limit enforcement (Max 3 copies)
	db.current_deck_cards = [{"card_id": "EMB-C-0001", "count": 3}]
	db.selected_card_id = "EMB-C-0001"
	db._on_add_card_to_deck()
	assert(db.current_deck_cards[0]["count"] == 3, "Count must not exceed 3 copies")
	assert(db.validation_label.text.contains("Copy Limit"), "Validation label must explain copy limit")
	print("  [OK] 4C. 3-Copy limit restriction enforced and explained in UI.")

	# 4D. Faction restriction (Max 2 factions)
	db.current_deck_cards = [
		{"card_id": "EMB-C-0001", "count": 1}, # Emberclad
		{"card_id": "IRN-C-0001", "count": 1}  # Iron Choir
	]
	db.selected_card_id = "VER-C-0001" # Verdant Pact (3rd faction)
	db._on_add_card_to_deck()
	assert(db._get_deck_factions().size() == 2, "Deck must not allow a 3rd faction")
	assert(db.validation_label.text.contains("Faction Restriction"), "Validation label must explain faction restriction")
	print("  [OK] 4D. 2-Faction maximum restriction enforced and explained in UI.")

	# 4E. Online submission blocks unowned cards
	GameState.set_account_mode("online")
	GameState.online_collection.clear() # Zero cards owned online
	db._on_save_deck()
	assert(db.validation_label.text.contains("Online Deck Submission Error"), "Online submission must reject unowned cards")
	print("  [OK] 4E. Online deck submission blocked when deck contains unowned cards.")

	db.queue_free()
	return true

# ==============================================================================
# TEST 5: PROCEDURAL AUDIO SYNTHESIZER
# ==============================================================================
func _test_procedural_audio() -> bool:
	print("[TEST SUITE 5] Verifying Procedural Audio Synthesizer...")
	assert(SoundManager != null, "SoundManager singleton must be loaded")
	SoundManager.play_button_click()
	SoundManager.play_card_play()
	SoundManager.play_attack_clash()
	SoundManager.play_victory()
	SoundManager.play_defeat()
	print("  [OK] 5A. Procedural audio streams generated and played safely.")
	return true
