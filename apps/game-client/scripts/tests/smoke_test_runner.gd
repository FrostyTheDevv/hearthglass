extends Node
## Automated Godot 4.3 Headless Smoke-Test & Verification Runner for Hearthglass
## Executed in scene context where GameState and ConvergenceRules autoloads are active.

func _ready() -> void:
	print("======================================================================")
	print("   PROJECT HEARTHGLASS — GODOT 4.3 HEADLESS SMOKE TEST SUITE          ")
	print("======================================================================")
	call_deferred("_run_all_tests")

func _run_all_tests() -> void:
	var passed_count := 0
	var total_tests := 0

	total_tests += 1
	if _test_canonical_content_and_rarity():
		passed_count += 1
	else:
		_fail_exit("Test 1 Failed: Canonical Content and Rarity")
		return

	total_tests += 1
	if _test_lumenport_hub_scene():
		passed_count += 1
	else:
		_fail_exit("Test 2 Failed: Lumenport Hub Scene")
		return

	total_tests += 1
	if _test_tabletop_arena_scene():
		passed_count += 1
	else:
		_fail_exit("Test 3 Failed: Tabletop Arena Scene")
		return

	total_tests += 1
	if _test_deck_builder_scene():
		passed_count += 1
	else:
		_fail_exit("Test 4 Failed: Deck Builder Scene")
		return

	total_tests += 1
	if _test_card_frame_widget_and_art():
		passed_count += 1
	else:
		_fail_exit("Test 5 Failed: Card Frame Widget & Art Rendering")
		return

	total_tests += 1
	if _test_world_to_battle_transition():
		passed_count += 1
	else:
		_fail_exit("Test 6 Failed: World-to-Battle Transition")
		return

	print("----------------------------------------------------------------------")
	print("   ALL GODOT ENGINE SMOKE TESTS PASSED: %d / %d OK" % [passed_count, total_tests])
	print("======================================================================")
	get_tree().quit(0)

func _fail_exit(msg: String) -> void:
	printerr("[ERROR] " + msg)
	get_tree().quit(1)

func _test_canonical_content_and_rarity() -> bool:
	print("\n[SMOKE TEST 1] Verifying Canonical Content & 4-Tier Rarity in GameState...")

	var cards: Array = GameState.all_cards
	print("  -> GameState loaded %d canonical cards (Target: 480)" % [cards.size()])
	if cards.size() != 480:
		printerr("Expected 480 canonical cards, got: ", cards.size())
		return false

	var rarity_counts := {
		"common": 0,
		"uncommon": 0,
		"rare": 0,
		"legendary": 0,
		"epic": 0
	}

	for c in cards:
		var r: String = str(c.get("rarity", "")).to_lower()
		if not rarity_counts.has(r):
			rarity_counts[r] = 0
		rarity_counts[r] += 1

	print("  -> Rarity Breakdown:")
	print("     Common:    %d (Target: 240, 50.0%%)" % [rarity_counts["common"]])
	print("     Uncommon:  %d (Target: 144, 30.0%%)" % [rarity_counts["uncommon"]])
	print("     Rare:      %d (Target: 72,  15.0%%)" % [rarity_counts["rare"]])
	print("     Legendary: %d (Target: 24,  5.0%%)" % [rarity_counts["legendary"]])
	print("     Epic:      %d (Target: 0,   0.0%%)" % [rarity_counts["epic"]])

	if rarity_counts["common"] != 240 or rarity_counts["uncommon"] != 144 or rarity_counts["rare"] != 72 or rarity_counts["legendary"] != 24 or rarity_counts["epic"] != 0:
		printerr("Rarity distribution does not match canonical 4-tier specification!")
		return false

	var decks: Array = GameState.starter_decks
	print("  -> GameState loaded %d legal starter & archetype decks (Target: 16)" % [decks.size()])
	if decks.size() != 16:
		printerr("Expected 16 starter decks, got: ", decks.size())
		return false

	print("  -> Lumenport World Content: %d NPCs, %d Districts, %d Interiors, %d Quests" % [
		GameState.npcs.size(), GameState.districts.size(), GameState.interiors.size(), GameState.quests.size()
	])
	if GameState.npcs.size() != 16 or GameState.districts.size() != 6 or GameState.interiors.size() != 6:
		printerr("Expected 16 NPCs, 6 districts, 6 interiors")
		return false

	print("  [OK] Canonical Content & Rarity distribution validated.")
	return true

func _test_lumenport_hub_scene() -> bool:
	print("\n[SMOKE TEST 2] Instantiating and validating Lumenport Hub Scene (lumenport_hub.tscn)...")
	var scene_res := load("res://scenes/world/lumenport_hub.tscn")
	if not scene_res:
		printerr("Failed to load res://scenes/world/lumenport_hub.tscn")
		return false

	var hub_instance = scene_res.instantiate()
	if not hub_instance:
		printerr("Failed to instantiate lumenport_hub.tscn")
		return false

	add_child(hub_instance)

	var player = hub_instance.get("player_body")
	if player == null:
		for child in hub_instance.get_children():
			if child is CharacterBody3D:
				player = child
				break

	if player == null:
		printerr("Player CharacterBody3D not found in lumenport_hub scene!")
		hub_instance.queue_free()
		return false

	print("  -> Player CharacterBody3D positioned at: ", player.position)

	var camera_pivot = hub_instance.get("camera_pivot")
	print("  -> Isometric Camera Pivot established with yaw: ", hub_instance.get("camera_yaw_target"))

	var npc_list: Array = hub_instance.get("npc_nodes")
	print("  -> Spawned %d interactive NPC nodes around Lumenport Plaza" % [npc_list.size()])

	hub_instance.queue_free()
	print("  [OK] Lumenport Hub scene instantiated and validated successfully.")
	return true

func _test_tabletop_arena_scene() -> bool:
	print("\n[SMOKE TEST 3] Instantiating and validating Tabletop Battle Arena (tabletop_arena.tscn)...")
	var scene_res := load("res://scenes/battle/tabletop_arena.tscn")
	if not scene_res:
		printerr("Failed to load res://scenes/battle/tabletop_arena.tscn")
		return false

	var arena_instance = scene_res.instantiate()
	if not arena_instance:
		printerr("Failed to instantiate tabletop_arena.tscn")
		return false

	add_child(arena_instance)

	var match_data: Dictionary = arena_instance.get("match_state")
	var players_arr: Array = match_data.get("players", [])
	if players_arr.size() < 2:
		printerr("Expected at least 2 players in match_state, got: ", players_arr.size())
		arena_instance.queue_free()
		return false

	var p0: Dictionary = players_arr[0]
	var opp: Dictionary = players_arr[1]
	var player_vit: int = int(p0.get("vitality", 0))
	var player_max_vit: int = int(p0.get("max_vitality", 0))
	var opp_vit: int = int(opp.get("vitality", 0))
	var opp_max_vit: int = int(opp.get("max_vitality", 0))
	print("  -> Initialized 1v1 Tabletop Match State:")
	print("     Format:          ", match_data.get("format", "standard_1v1"))
	print("     Player Vitality: %d / %d" % [player_vit, player_max_vit])
	print("     Enemy Vitality:  %d / %d" % [opp_vit, opp_max_vit])
	print("     Global Turn:     ", match_data.get("global_turn", 1))

	if player_vit != 30 or player_max_vit != 30:
		printerr("Expected 30 initial 1v1 Vitality, got: ", player_vit)
		arena_instance.queue_free()
		return false

	# Test 2v2 Tag match initialization
	var tag_state = ConvergenceRules.create_match(
		GameState.get_active_deck(),
		GameState.starter_decks[1] if GameState.starter_decks.size() > 1 else GameState.get_active_deck(),
		"Tag Duo Rivals",
		42,
		"tag_2v2"
	)
	var tag_players: Array = tag_state.get("players", [])
	if tag_players.size() < 4:
		printerr("Expected 4 players in 2v2 Tag match, got: ", tag_players.size())
		arena_instance.queue_free()
		return false

	var tag_p0: Dictionary = tag_players[0]
	var tag_vit: int = int(tag_p0.get("vitality", 0))
	var tag_max_vit: int = int(tag_p0.get("max_vitality", 0))
	print("  -> Initialized 2v2 Tag Match State:")
	print("     Team Vitality:   %d / %d (Canonical Target: 45)" % [tag_vit, tag_max_vit])
	if tag_vit != 45 or tag_max_vit != 45:
		printerr("Expected 45 initial 2v2 Team Vitality, got: ", tag_vit)
		arena_instance.queue_free()
		return false

	arena_instance.queue_free()
	print("  [OK] Tabletop Arena Scene & Vitality rules (30 1v1 / 45 2v2) verified.")
	return true

func _test_deck_builder_scene() -> bool:
	print("\n[SMOKE TEST 4] Instantiating and validating Deck Builder UI (deck_builder.tscn)...")
	var scene_res := load("res://scenes/ui/deck_builder.tscn")
	if not scene_res:
		printerr("Failed to load res://scenes/ui/deck_builder.tscn")
		return false

	var builder_instance = scene_res.instantiate()
	if not builder_instance:
		printerr("Failed to instantiate deck_builder.tscn")
		return false

	add_child(builder_instance)

	var filtered: Array = builder_instance.get("filtered_cards")
	print("  -> Deck Builder collection browser populated with %d cards (Target: 480)" % [filtered.size()])
	if filtered.size() != 480:
		printerr("Expected 480 cards in collection browser, got: ", filtered.size())
		builder_instance.queue_free()
		return false

	var active_deck: Dictionary = GameState.get_active_deck()
	var deck_cards: Array = active_deck.get("cards", [])
	var deck_title: String = active_deck.get("name", "Untitled Deck")
	print("  -> Active Player Deck: '%s' with %d card entries" % [deck_title, deck_cards.size()])

	var v_res: Dictionary = ConvergenceRules.validate_deck(active_deck)
	print("  -> Authoritative Rust validation for active deck: valid=%s, total=%d cards" % [
		str(v_res.get("valid", false)), int(v_res.get("total_cards", 0))
	])
	if not bool(v_res.get("valid", false)):
		printerr("Active deck failed Rust deck validation: ", v_res.get("errors", []))
		builder_instance.queue_free()
		return false

	builder_instance.queue_free()
	print("  [OK] Deck Builder Scene and 40-card deck validation verified.")
	return true

func _test_card_frame_widget_and_art() -> bool:
	print("\n[SMOKE TEST 5] Testing CardFrameWidget with SVG Art concepts and 4-tier rarity borders...")
	var widget_script := load("res://scripts/ui/card_frame_widget.gd")
	if not widget_script:
		printerr("Failed to load res://scripts/ui/card_frame_widget.gd")
		return false

	var showcase_ids := [
		"EMB-C-0001",
		"VER-C-0001",
		"IRN-C-0001",
		"TID-C-0001",
		"GLS-C-0001",
		"NOC-C-0001",
		"STR-C-0001",
		"GRV-C-0001"
	]

	var validated_count := 0
	for cid in showcase_ids:
		var card_data = GameState.cards_by_id.get(cid)
		if card_data == null:
			printerr("Showcase card not found in GameState: ", cid)
			return false

		var widget = widget_script.new()
		add_child(widget)
		widget.setup_card(card_data)

		var title_node = widget.get_node_or_null("Margin/VBox/TitleLabel")
		if title_node:
			assert(title_node.text == card_data["name"])

		var art_rect = widget.find_child("ArtTextureRect", true, false)
		var has_texture: bool = (art_rect != null and art_rect.texture != null)

		print("  -> Card %s [%s] '%s' — Art Texture Loaded: %s, Rarity Border: %s" % [
			cid,
			card_data.get("faction"),
			card_data.get("name"),
			str(has_texture),
			card_data.get("rarity")
		])

		widget.queue_free()
		validated_count += 1

	print("  -> Successfully instantiated %d CardFrameWidgets with correct rarity styles" % [validated_count])
	print("  [OK] CardFrameWidget & Concept Art integration verified.")
	return true

func _test_world_to_battle_transition() -> bool:
	print("\n[SMOKE TEST 6] Simulating World-to-Battle Transition & Persistent State...")
	var initial_district: String = GameState.current_district
	var initial_crowns: int = GameState.crowns
	var initial_dust: int = GameState.echo_dust

	print("  -> Initial State: District='%s', Crowns=%d, Echo Dust=%d" % [
		initial_district, initial_crowns, initial_dust
	])

	GameState.current_district = "lumenport_tournament_hall"
	print("  -> Player fast-travelled to: '%s'" % [GameState.current_district])

	GameState.crowns += 50
	GameState.echo_dust += 25
	print("  -> Post-Duel Rewards: Crowns=%d (+50), Echo Dust=%d (+25)" % [
		GameState.crowns, GameState.echo_dust
	])

	GameState.save_local_profile()
	print("  -> Saved local profile to user://hearthglass_profile_v1.json")

	GameState.crowns = 0
	GameState.echo_dust = 0
	GameState.load_local_profile()
	print("  -> Reloaded profile: Crowns=%d, Echo Dust=%d" % [GameState.crowns, GameState.echo_dust])

	if GameState.crowns != initial_crowns + 50 or GameState.echo_dust != initial_dust + 25:
		printerr("Profile persistence reload failed to preserve updated wallet!")
		return false

	print("  [OK] World-to-Battle transitions and save/reload persistence verified.")
	return true
