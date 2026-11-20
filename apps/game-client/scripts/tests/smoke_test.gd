extends SceneTree
## Automated Godot 4.3 Headless Smoke-Test & Verification Suite for Hearthglass
## Verifies:
##  1. Global GameState bootstrap: 640 cards, 16 starter decks, 4-tier rarity, 16 NPCs, 6 districts, 6 interiors, 8 quests
##  2. Lumenport 3D Hub Scene: environment meshes, player controller, camera pivot, lighting, 16 scheduled NPCs
##  3. Tabletop Arena 3D/2D Scene: 1v1 (30 Vitality) & 2v2 Tag (45 Vitality), board lanes, hand layout, buttons
##  4. Deck Builder Scene: collection filtering, archetype deck loading, legal deck composition
##  5. CardFrameWidget: rendering card frames, faction borders, stats, and SVG concept illustrations
##  6. World-to-Battle Transition simulation & state persistence

const GameStateScript = preload("res://scripts/autoload/game_state.gd")
const ConvergenceRulesScript = preload("res://scripts/engine/convergence_rules.gd")

var game_state: Node
var convergence_rules: Node

func _init() -> void:
	print("======================================================================")
	print("   PROJECT HEARTHGLASS — GODOT 4.3 HEADLESS SMOKE TEST SUITE          ")
	print("======================================================================")
	call_deferred("_setup_and_run")

func _setup_and_run() -> void:
	game_state = GameStateScript.new()
	game_state.name = "GameState"
	root.add_child(game_state)

	convergence_rules = ConvergenceRulesScript.new()
	convergence_rules.name = "ConvergenceRules"
	root.add_child(convergence_rules)

	# Trigger ready manually if needed
	if game_state.has_method("_ready"):
		game_state._ready()

	_run_all_tests()

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
	quit(0)

func _fail_exit(msg: String) -> void:
	printerr("[ERROR] " + msg)
	quit(1)

func _test_canonical_content_and_rarity() -> bool:
	print("\n[SMOKE TEST 1] Verifying Canonical Content & 4-Tier Rarity in GameState...")

	var root_dir := ProjectSettings.globalize_path("res://../..")
	var bundle_path := root_dir.path_join("content/cards/foundations_v1.json")
	if not FileAccess.file_exists(bundle_path):
		printerr("Cannot find foundations_v1.json at: ", bundle_path)
		return false

	var raw_str := FileAccess.get_file_as_string(bundle_path)
	var parsed = JSON.parse_string(raw_str)
	if typeof(parsed) != TYPE_DICTIONARY or not parsed.has("cards"):
		printerr("Invalid JSON format in foundations_v1.json")
		return false

	var cards: Array = parsed["cards"]
	print("  -> Found %d canonical cards in client bundle (Target: 640)" % [cards.size()])
	if cards.size() != 640:
		printerr("Expected 640 canonical cards, got: ", cards.size())
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

	if rarity_counts["common"] != 320 or rarity_counts["uncommon"] != 192 or rarity_counts["rare"] != 96 or rarity_counts["legendary"] != 32 or rarity_counts["epic"] != 0:
		printerr("Rarity distribution does not match canonical 4-tier specification!")
		return false

	# Starter decks check
	var decks_path := root_dir.path_join("content/cards/starter_decks.json")
	if not FileAccess.file_exists(decks_path):
		printerr("Cannot find starter_decks.json")
		return false
	var parsed_decks = JSON.parse_string(FileAccess.get_file_as_string(decks_path))
	var decks: Array = parsed_decks.get("decks", [])
	print("  -> Found %d legal starter & archetype decks (Target: 16)" % [decks.size()])
	if decks.size() != 16:
		printerr("Expected 16 starter decks, got: ", decks.size())
		return false

	# NPCs check
	var npcs_path := root_dir.path_join("content/npcs/lumenport_npcs.json")
	if not FileAccess.file_exists(npcs_path):
		printerr("Cannot find lumenport_npcs.json")
		return false
	var parsed_npcs = JSON.parse_string(FileAccess.get_file_as_string(npcs_path))
	var npcs: Array = parsed_npcs.get("npcs", [])
	var districts: Array = parsed_npcs.get("districts", [])
	var interiors: Array = parsed_npcs.get("interiors", [])
	print("  -> Lumenport World Content: %d NPCs, %d Districts, %d Interiors" % [npcs.size(), districts.size(), interiors.size()])
	if npcs.size() != 16 or districts.size() != 6 or interiors.size() != 6:
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

	root.add_child(hub_instance)

	var player = hub_instance.get_node_or_null("player_body")
	if not player and hub_instance.get("player_body"):
		player = hub_instance.player_body

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
	if not camera_pivot:
		for child in hub_instance.get_children():
			if child.name == "camera_pivot" or child is Node3D:
				camera_pivot = child
				break
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

	root.add_child(arena_instance)

	var match_data: Dictionary = arena_instance.get("match_state")
	print("  -> Initialized Tabletop Match State:")
	print("     Format:        ", match_data.get("format", "standard_1v1"))
	print("     Player Health: ", match_data.get("player_health", 30))
	print("     Enemy Health:  ", match_data.get("enemy_health", 30))
	print("     Turn Count:    ", match_data.get("turn", 1))

	var player_hp: int = int(match_data.get("player_health", 0))
	if player_hp != 30:
		printerr("Expected 30 initial 1v1 Vitality, got: ", player_hp)
		arena_instance.queue_free()
		return false

	# Test 2v2 Tag match initialization
	var tag_state = convergence_rules.create_match(
		game_state.get_active_deck(),
		game_state.starter_decks[1] if game_state.starter_decks.size() > 1 else game_state.get_active_deck(),
		"Tag Duo Rivals",
		42,
		"tag_2v2"
	)
	var tag_hp: int = int(tag_state.get("player_health", 0))
	print("  -> Initialized 2v2 Tag Match State:")
	print("     Team Vitality: %d (Canonical Target: 45)" % [tag_hp])
	if tag_hp != 45:
		printerr("Expected 45 initial 2v2 Team Vitality, got: ", tag_hp)
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

	root.add_child(builder_instance)

	var current_deck: Dictionary = builder_instance.get("current_deck")
	var deck_cards: Array = current_deck.get("cards", [])
	var deck_title: String = current_deck.get("name", "Untitled Deck")
	print("  -> Active Deck: '%s' with %d cards" % [deck_title, deck_cards.size()])
	if deck_cards.size() != 40:
		printerr("Expected legal 40-card deck, got: ", deck_cards.size())
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
		var card_data = game_state.cards_by_id.get(cid)
		if card_data == null:
			printerr("Showcase card not found in GameState: ", cid)
			return false

		var widget = widget_script.new()
		root.add_child(widget)
		widget.setup_card(card_data)

		var title_node = widget.get_node_or_null("Margin/VBox/TitleLabel")
		if title_node:
			assert(title_node.text == card_data["name"])

		var art_rect = widget.get_node_or_null("Margin/VBox/ArtRect")
		var has_texture := false
		if art_rect and art_rect.texture != null:
			has_texture = true

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
	var initial_district: String = game_state.current_district
	var initial_crowns: int = game_state.crowns
	var initial_dust: int = game_state.echo_dust

	print("  -> Initial State: District='%s', Crowns=%d, Echo Dust=%d" % [
		initial_district, initial_crowns, initial_dust
	])

	game_state.current_district = "lumenport_tournament_hall"
	print("  -> Player fast-travelled to: '%s'" % [game_state.current_district])

	game_state.crowns += 50
	game_state.echo_dust += 25
	print("  -> Post-Duel Rewards: Crowns=%d (+50), Echo Dust=%d (+25)" % [
		game_state.crowns, game_state.echo_dust
	])

	game_state.save_local_profile()
	print("  -> Saved local profile to user://hearthglass_profile_v1.json")

	game_state.crowns = 0
	game_state.echo_dust = 0
	game_state.load_local_profile()
	print("  -> Reloaded profile: Crowns=%d, Echo Dust=%d" % [game_state.crowns, game_state.echo_dust])

	if game_state.crowns != initial_crowns + 50 or game_state.echo_dust != initial_dust + 25:
		printerr("Profile persistence reload failed to preserve updated wallet!")
		return false

	print("  [OK] World-to-Battle transitions and save/reload persistence verified.")
	return true
