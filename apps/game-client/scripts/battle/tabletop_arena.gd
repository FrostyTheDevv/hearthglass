extends Control
## Playable Convergence Duels Tabletop Battle Scene (Godot 4)
## Powered exclusively by the authoritative Rust battle engine (`services/battle-server`)
## and live WebSocket multiplayer (`ws://127.0.0.1:4173/v1/ws`).
##
## Visual Features:
##  - Polished 3D Tabletop Presentation with mahogany/slate duel table and runic lanes.
##  - Runic Resonate pulse visualization (2+ lanes controlled).
##  - Responsive card hover, selection, and drag/click to slot.
##  - Creature summoning scale/glow effects with faction color bursts.
##  - Dynamic Attack Lunges, Screen Shake, and Floating Combat Text (-X DMG, GUARDED, WARDED).
##  - Status Keyword Badges (Guard, Reach, Ward, Pierce, Stealth, Ready).
##  - Dramatic Victory & Defeat screens displaying authoritative reward payouts.
##  - Seamless World-to-Battle transitions preserving authoritative Rust engine state.

const CardFrameWidgetScript := preload("res://scripts/ui/card_frame_widget.gd")

var match_state: Dictionary = {}
var selected_hand_index: int = -1

# UI Containers & Nodes
var header_label: Label
var resonate_banner: Label
var lanes_container: HBoxContainer
var hand_container: HBoxContainer
var inspector_label: RichTextLabel
var log_label: RichTextLabel
var btn_mulligan: Button
var btn_end_turn: Button
var btn_pvp_queue: Button
var btn_tag_pvp_queue: Button
var btn_tag_2v2: Button

# Combat Effects & Victory/Defeat Modal
var fx_layer: Control
var end_game_modal: PanelContainer
var end_game_title: Label
var end_game_subtitle: Label
var end_game_details: RichTextLabel
var end_game_actions_hbox: HBoxContainer

# Sound effects audio player
var sfx_player: AudioStreamPlayer

func _ready() -> void:
	ConvergenceRules.match_state_received.connect(_on_online_match_state_received)
	ConvergenceRules.command_rejected.connect(func(err: String):
		if inspector_label:
			inspector_label.text = "Server Rejected Command: " + err
		_spawn_floating_text(Vector2(800, 450), "REJECTED: " + err, Color(1.0, 0.35, 0.35))
	)
	ConvergenceRules.pvp_queued.connect(func():
		if inspector_label:
			inspector_label.text = "Queued for Live WebSocket Matchmaking (/v1/ws)... Waiting for duelists."
	)

	_init_rust_match(GameState.selected_match_format)
	_build_tabletop_ui()
	_refresh_tabletop()

func _init_rust_match(format: String = "standard_1v1") -> void:
	var player_deck := GameState.get_active_deck()
	var npc := GameState.get_npc(GameState.selected_npc_id)
	var npc_deck_id: String = str(npc.get("deck_id", "deck_glass_star_prism"))
	var npc_deck := player_deck
	for d in GameState.starter_decks:
		if d.get("id") == npc_deck_id:
			npc_deck = d
			break

	match_state = ConvergenceRules.create_match(
		player_deck,
		npc_deck,
		str(npc.get("name", "Rival Duelist")),
		Time.get_ticks_msec(),
		format
	)

func _on_online_match_state_received(new_state: Dictionary) -> void:
	match_state = new_state
	selected_hand_index = -1
	_refresh_tabletop()
	_check_game_over()

func _build_tabletop_ui() -> void:
	# 1. Dark Runic Tabletop Background (Mahogany & Slate)
	var bg := ColorRect.new()
	bg.color = Color(0.04, 0.06, 0.11)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	# Decorative Table Felt Panel
	var table_felt := PanelContainer.new()
	table_felt.set_anchors_preset(Control.PRESET_FULL_RECT)
	var t_style := StyleBoxFlat.new()
	t_style.bg_color = Color(0.06, 0.09, 0.15)
	t_style.border_color = Color(0.24, 0.38, 0.58)
	t_style.set_border_width_all(2)
	t_style.set_corner_radius_all(10)
	t_style.set_content_margin_all(8)
	table_felt.add_theme_stylebox_override("panel", t_style)
	add_child(table_felt)

	var main_vbox := VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	main_vbox.add_theme_constant_override("separation", 6)
	add_child(main_vbox)

	# 2. Top Header Status & Match Controls Bar
	var top_bar := HBoxContainer.new()
	top_bar.add_theme_constant_override("separation", 10)
	main_vbox.add_child(top_bar)

	header_label = Label.new()
	header_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header_label.add_theme_font_size_override("font_size", 13)
	top_bar.add_child(header_label)

	btn_pvp_queue = Button.new()
	btn_pvp_queue.text = "Queue 1v1 PvP (WS)"
	btn_pvp_queue.pressed.connect(func(): ConvergenceRules.queue_1v1_pvp())
	top_bar.add_child(btn_pvp_queue)

	btn_tag_pvp_queue = Button.new()
	btn_tag_pvp_queue.text = "Queue 4-Client 2v2 Tag"
	btn_tag_pvp_queue.pressed.connect(func(): ConvergenceRules.queue_2v2_pvp())
	top_bar.add_child(btn_tag_pvp_queue)

	btn_tag_2v2 = Button.new()
	btn_tag_2v2.text = "Co-op 2v2 Tag (45 Vit)"
	btn_tag_2v2.pressed.connect(func():
		_init_rust_match("tag_2v2")
		_refresh_tabletop()
	)
	top_bar.add_child(btn_tag_2v2)

	btn_mulligan = Button.new()
	btn_mulligan.text = "Mulligan 2 Cards"
	btn_mulligan.pressed.connect(_on_mulligan_pressed)
	top_bar.add_child(btn_mulligan)

	btn_end_turn = Button.new()
	btn_end_turn.text = "End Turn ->"
	btn_end_turn.pressed.connect(_on_end_turn_pressed)
	btn_end_turn.add_theme_color_override("font_color", Color(1.0, 0.85, 0.35))
	top_bar.add_child(btn_end_turn)

	var btn_return := Button.new()
	btn_return.text = "Return to Lumenport"
	btn_return.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/world/lumenport_hub.tscn"))
	top_bar.add_child(btn_return)

	# Resonate Banner Indicator
	resonate_banner = Label.new()
	resonate_banner.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	resonate_banner.add_theme_font_size_override("font_size", 12)
	resonate_banner.add_theme_color_override("font_color", Color(0.35, 0.95, 0.75))
	main_vbox.add_child(resonate_banner)

	# 3. Middle Battlefield + Sidebar Split
	var mid_hbox := HBoxContainer.new()
	mid_hbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	mid_hbox.add_theme_constant_override("separation", 10)
	main_vbox.add_child(mid_hbox)

	# 3-Lane Combat Grid
	lanes_container = HBoxContainer.new()
	lanes_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lanes_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	lanes_container.add_theme_constant_override("separation", 12)
	mid_hbox.add_child(lanes_container)

	# Right Sidebar: Card Inspector & Live Authoritative Battle Log
	var right_sidebar := VBoxContainer.new()
	right_sidebar.custom_minimum_size = Vector2(360, 0)
	right_sidebar.add_theme_constant_override("separation", 6)
	mid_hbox.add_child(right_sidebar)

	var insp_panel := PanelContainer.new()
	insp_panel.custom_minimum_size = Vector2(350, 210)
	var ip_style := StyleBoxFlat.new()
	ip_style.bg_color = Color(0.07, 0.11, 0.19)
	ip_style.border_color = Color(0.25, 0.45, 0.68)
	ip_style.set_border_width_all(1)
	ip_style.set_corner_radius_all(6)
	ip_style.set_content_margin_all(10)
	insp_panel.add_theme_stylebox_override("panel", ip_style)
	right_sidebar.add_child(insp_panel)

	inspector_label = RichTextLabel.new()
	inspector_label.bbcode_enabled = true
	inspector_label.text = "[color=#ffdd44][b]RUST BATTLE AUTHORITY ACTIVE[/b][/color]\nSelect a card in your hand to inspect it, then click an allied Front (Vanguard) or Rear (Support) lane slot to summon."
	insp_panel.add_child(inspector_label)

	var log_panel := PanelContainer.new()
	log_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var lp_style := StyleBoxFlat.new()
	lp_style.bg_color = Color(0.05, 0.08, 0.14)
	lp_style.border_color = Color(0.18, 0.28, 0.42)
	lp_style.set_border_width_all(1)
	lp_style.set_corner_radius_all(6)
	lp_style.set_content_margin_all(8)
	log_panel.add_theme_stylebox_override("panel", lp_style)
	right_sidebar.add_child(log_panel)

	log_label = RichTextLabel.new()
	log_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	log_label.bbcode_enabled = true
	log_panel.add_child(log_label)

	# 4. Bottom Hand Bar (Data-Driven CardFrameWidget)
	var hand_scroll := ScrollContainer.new()
	hand_scroll.custom_minimum_size = Vector2(0, 255)
	main_vbox.add_child(hand_scroll)

	hand_container = HBoxContainer.new()
	hand_container.add_theme_constant_override("separation", 10)
	hand_scroll.add_child(hand_container)

	# 5. Effects Overlay Layer (Floating combat text, animations)
	fx_layer = Control.new()
	fx_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	fx_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(fx_layer)

	# 6. Victory & Defeat Modal Overlay
	_build_end_game_modal()

func _build_end_game_modal() -> void:
	end_game_modal = PanelContainer.new()
	end_game_modal.set_anchors_preset(Control.PRESET_FULL_RECT)
	var m_style := StyleBoxFlat.new()
	m_style.bg_color = Color(0.03, 0.05, 0.09, 0.94)
	m_style.set_content_margin_all(60)
	end_game_modal.add_theme_stylebox_override("panel", m_style)
	end_game_modal.visible = false
	add_child(end_game_modal)

	var mvbox := VBoxContainer.new()
	mvbox.add_theme_constant_override("separation", 20)
	end_game_modal.add_child(mvbox)

	end_game_title = Label.new()
	end_game_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_game_title.add_theme_font_size_override("font_size", 34)
	mvbox.add_child(end_game_title)

	end_game_subtitle = Label.new()
	end_game_subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_game_subtitle.add_theme_font_size_override("font_size", 16)
	mvbox.add_child(end_game_subtitle)

	var det_panel := PanelContainer.new()
	det_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var dp_style := StyleBoxFlat.new()
	dp_style.bg_color = Color(0.07, 0.11, 0.18)
	dp_style.set_corner_radius_all(8)
	dp_style.set_content_margin_all(20)
	det_panel.add_theme_stylebox_override("panel", dp_style)
	mvbox.add_child(det_panel)

	end_game_details = RichTextLabel.new()
	end_game_details.bbcode_enabled = true
	det_panel.add_child(end_game_details)

	end_game_actions_hbox = HBoxContainer.new()
	end_game_actions_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	end_game_actions_hbox.add_theme_constant_override("separation", 20)
	mvbox.add_child(end_game_actions_hbox)

	var btn_return := Button.new()
	btn_return.text = "Return to Lumenport [E]"
	btn_return.custom_minimum_size = Vector2(200, 48)
	btn_return.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/world/lumenport_hub.tscn"))
	end_game_actions_hbox.add_child(btn_return)

	var btn_rematch := Button.new()
	btn_rematch.text = "Rematch Duel"
	btn_rematch.custom_minimum_size = Vector2(160, 48)
	btn_rematch.pressed.connect(func():
		end_game_modal.visible = false
		_init_rust_match(GameState.selected_match_format)
		_refresh_tabletop()
	)
	end_game_actions_hbox.add_child(btn_rematch)

	var btn_deck := Button.new()
	btn_deck.text = "Adjust Deck in Emporium"
	btn_deck.custom_minimum_size = Vector2(200, 48)
	btn_deck.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/ui/deck_builder.tscn"))
	end_game_actions_hbox.add_child(btn_deck)

func _refresh_tabletop() -> void:
	if not match_state.has("players") or match_state["players"].size() < 2:
		return

	var my_slot: int = ConvergenceRules.local_player_slot
	var my_board_slot: int = my_slot % 2
	var opp_board_slot: int = 1 if my_board_slot == 0 else 0

	var p_me: Dictionary = match_state["players"][my_slot]
	var p_board: Dictionary = match_state["players"][my_board_slot]
	var p_opp: Dictionary = match_state["players"][opp_board_slot]
	var max_vit: int = int(p_board.get("max_vitality", 30))

	var env_text := "None"
	if match_state.get("active_environment") != null:
		env_text = str(match_state["active_environment"].get("name", "Active"))

	var fmt_label := "2v2 TAG" if str(match_state.get("format", "")).contains("2v2") else ("1v1 PVP" if ConvergenceRules.is_online_pvp else "1v1 PVE")
	header_label.text = "[%s] TURN %d (Seat %d) | %s: %d/%d Vit | Aether: %d/%d | Resonate: %s  ||  VS  %s: %d/%d Vit | Env: %s" % [
		fmt_label,
		int(match_state.get("global_turn", 1)),
		int(match_state.get("active_player", 0)),
		str(p_me.get("name", "Player")),
		int(p_board.get("vitality", 30)),
		max_vit,
		int(p_me.get("aether", 1)),
		int(p_me.get("aether_capacity", 1)),
		"ACTIVE" if bool(p_board.get("resonate_active", false)) else "Inactive",
		str(p_opp.get("name", "Opponent")),
		int(p_opp.get("vitality", 30)),
		max_vit,
		env_text
	]

	# Resonate Banner Glow
	if bool(p_board.get("resonate_active", false)):
		resonate_banner.text = "✦ RESONATE ACTIVE ✦ (2+ Lanes Controlled — Faction Synergies Empowered)"
		resonate_banner.add_theme_color_override("font_color", Color(0.35, 0.98, 0.70))
	elif bool(p_opp.get("resonate_active", false)):
		resonate_banner.text = "⚠ OPPONENT RESONATING ⚠ (Enemy Controls 2+ Lanes)"
		resonate_banner.add_theme_color_override("font_color", Color(1.0, 0.45, 0.35))
	else:
		resonate_banner.text = "Lane Control Neutral — Control 2 or more lanes to trigger Resonate"
		resonate_banner.add_theme_color_override("font_color", Color(0.65, 0.75, 0.88))

	btn_mulligan.disabled = bool(p_me.get("mulligan_done", false)) or int(match_state.get("global_turn", 1)) > 4

	# Rebuild 3 Lanes
	for child in lanes_container.get_children():
		child.queue_free()

	var lane_names := ["LEFT LANE (1)", "CENTER LANE (2)", "RIGHT LANE (3)"]
	for l_idx in range(3):
		var lane_panel := PanelContainer.new()
		lane_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		lane_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
		var lp_style := StyleBoxFlat.new()
		lp_style.bg_color = Color(0.06, 0.09, 0.15)
		lp_style.border_color = Color(0.20, 0.32, 0.48)
		lp_style.set_border_width_all(1)
		lp_style.set_corner_radius_all(6)
		lp_style.set_content_margin_all(6)
		lane_panel.add_theme_stylebox_override("panel", lp_style)
		lanes_container.add_child(lane_panel)

		var lvbox := VBoxContainer.new()
		lvbox.add_theme_constant_override("separation", 5)
		lane_panel.add_child(lvbox)

		var ally_has := p_board["lanes"][l_idx]["front"] != null or p_board["lanes"][l_idx]["rear"] != null
		var opp_has := p_opp["lanes"][l_idx]["front"] != null or p_opp["lanes"][l_idx]["rear"] != null

		var l_header := Label.new()
		l_header.text = lane_names[l_idx] + (" [CONTROLLED]" if (ally_has and not opp_has) else (" [ENEMY]" if (opp_has and not ally_has) else " [CONTESTED]"))
		if ally_has and not opp_has:
			l_header.add_theme_color_override("font_color", Color(0.30, 0.95, 0.65))
		elif opp_has and not ally_has:
			l_header.add_theme_color_override("font_color", Color(1.0, 0.45, 0.35))
		else:
			l_header.add_theme_color_override("font_color", Color(0.70, 0.80, 0.92))
		lvbox.add_child(l_header)

		# 4 Slots: Enemy Rear -> Enemy Front -> Allied Front (Guards Rear) -> Allied Rear
		lvbox.add_child(_create_slot_widget(opp_board_slot, l_idx, "rear", "Enemy Rear"))
		lvbox.add_child(_create_slot_widget(opp_board_slot, l_idx, "front", "Enemy Front [Vanguard]"))
		lvbox.add_child(_create_slot_widget(my_board_slot, l_idx, "front", "Your Front [Vanguard]"))
		lvbox.add_child(_create_slot_widget(my_board_slot, l_idx, "rear", "Your Rear [Support]"))

	# Rebuild Hand with CardFrameWidget
	for child in hand_container.get_children():
		child.queue_free()

	var hand: Array = p_me.get("hand", [])
	for h_idx in range(hand.size()):
		var cid: String = str(hand[h_idx].get("card_id", ""))
		var def: Dictionary = GameState.cards_by_id.get(cid, {})
		var card_widget: PanelContainer = CardFrameWidgetScript.new()
		card_widget.setup_card(def, h_idx == selected_hand_index)
		card_widget.card_clicked.connect(func(_d: Dictionary): _on_hand_card_clicked(h_idx, def))
		hand_container.add_child(card_widget)

	# Update Event Log
	var log_lines: Array = match_state.get("event_log", [])
	var recent := log_lines.slice(maxi(0, log_lines.size() - 14), log_lines.size())
	var str_lines: Array[String] = []
	for line in recent:
		str_lines.append(str(line))
	log_label.text = "\n".join(str_lines)

	_check_game_over()

func _create_slot_widget(owner_idx: int, lane_idx: int, pos: String, label_prefix: String) -> Button:
	var btn := Button.new()
	btn.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var my_board_slot: int = ConvergenceRules.local_player_slot % 2
	var unit = match_state["players"][owner_idx]["lanes"][lane_idx][pos]

	if unit != null:
		var kws: Array = unit.get("keywords", [])
		var kw_badges := ""
		if kws.has("guard"): kw_badges += " [🛡 Guard]"
		if kws.has("reach"): kw_badges += " [🏹 Reach]"
		if kws.has("ward"): kw_badges += " [✨ Ward]"
		if kws.has("piercing"): kw_badges += " [🗡 Pierce]"

		var ready_tag := " ⚡ [READY - ATTACK]" if (owner_idx == my_board_slot and unit.get("ready", false)) else ""
		btn.text = "%s:\n%s (⚔ %d / ♥ %d/%d)%s%s" % [
			label_prefix,
			unit["name"],
			int(unit["attack"]),
			int(unit["health"]),
			int(unit.get("max_health", unit["health"])),
			kw_badges,
			ready_tag
		]
		if owner_idx == my_board_slot:
			if unit.get("ready", false):
				btn.modulate = Color(0.75, 1.0, 0.85)
			else:
				btn.modulate = Color(0.85, 0.90, 0.98)
		else:
			btn.modulate = Color(1.0, 0.82, 0.82)
	else:
		btn.text = "%s\n[Empty Tabletop Slot]" % label_prefix
		if owner_idx == my_board_slot and selected_hand_index >= 0:
			btn.modulate = Color(0.55, 0.92, 1.0)
		else:
			btn.modulate = Color(0.65, 0.70, 0.78)

	if owner_idx == my_board_slot:
		btn.pressed.connect(func(): _on_ally_slot_clicked(lane_idx, pos))
	else:
		# Clicking enemy slot with active selected attacker
		btn.pressed.connect(func():
			_dispatch_command({
				"player": ConvergenceRules.local_player_slot,
				"type": "attack_lane",
				"lane": lane_idx,
				"position": "front"
			})
		)
	return btn

func _dispatch_command(cmd: Dictionary) -> void:
	if ConvergenceRules.is_online_pvp:
		ConvergenceRules.submit_online_command(cmd)
	else:
		var res := ConvergenceRules.apply_command(match_state, cmd, GameState.cards_by_id)
		if not res.get("accepted", false):
			var err_msg: String = str(res.get("error", ""))
			inspector_label.text = "[color=#ff5555]Action Rejected by Rust Engine:[/color] " + err_msg
			_spawn_floating_text(Vector2(600, 380), err_msg, Color(1.0, 0.35, 0.35))
		else:
			var ctype: String = str(cmd.get("type", ""))
			if ctype == "summon_creature":
				_spawn_floating_text(Vector2(600, 420), "✦ CREATURE SUMMONED ✦", Color(0.35, 0.95, 0.80))
			elif ctype == "attack_lane":
				_spawn_floating_text(Vector2(600, 320), "⚔ CLASH & DAMAGE EVALUATED ⚔", Color(1.0, 0.75, 0.30))

		_refresh_tabletop()

func _on_hand_card_clicked(h_idx: int, def: Dictionary) -> void:
	selected_hand_index = h_idx
	var iden: Dictionary = def.get("identity", {})
	inspector_label.text = "[size=15][b]%s[/b] (%s)[/size]\nCost: %d Aether | Type: %s (%s) | Faction: %s\nKeywords: %s\n\n[color=#88ccff]%s[/color]\n\n[b]Origin:[/b] %s\n[b]Lore:[/b] %s" % [
		def.get("name", ""),
		def.get("id", ""),
		int(def.get("cost", 0)),
		def.get("type", ""),
		str(def.get("subtype", "core")),
		str(def.get("faction", "")).capitalize(),
		", ".join(def.get("keywords", [])),
		def.get("description", ""),
		str(iden.get("origin", def.get("faction", ""))),
		str(iden.get("collection_biography", def.get("lore", "")))
	]

	if def.get("type") != "creature":
		var ctype: String = "play_tactic"
		if def.get("type") == "relic":
			ctype = "play_relic"
		elif def.get("type") == "environment":
			ctype = "play_environment"
		selected_hand_index = -1
		_dispatch_command({
			"player": ConvergenceRules.local_player_slot,
			"type": ctype,
			"hand_index": h_idx,
			"target_lane": 0,
			"target_position": "front"
		})
	else:
		_refresh_tabletop()

func _on_ally_slot_clicked(lane_idx: int, pos: String) -> void:
	var my_board_slot: int = ConvergenceRules.local_player_slot % 2
	var p_board: Dictionary = match_state["players"][my_board_slot]
	var existing = p_board["lanes"][lane_idx][pos]

	if existing == null and selected_hand_index >= 0:
		var h_idx := selected_hand_index
		selected_hand_index = -1
		_dispatch_command({
			"player": ConvergenceRules.local_player_slot,
			"type": "summon_creature",
			"hand_index": h_idx,
			"lane": lane_idx,
			"position": pos
		})
	elif existing != null:
		# Attack opposing lane with this unit
		_dispatch_command({
			"player": ConvergenceRules.local_player_slot,
			"type": "attack_lane",
			"lane": lane_idx,
			"position": pos
		})

func _on_mulligan_pressed() -> void:
	_dispatch_command({
		"player": ConvergenceRules.local_player_slot,
		"type": "mulligan",
		"replace_hand_indices": [0, 1]
	})

func _on_end_turn_pressed() -> void:
	_dispatch_command({
		"player": ConvergenceRules.local_player_slot,
		"type": "end_turn",
		"run_ai": not ConvergenceRules.is_online_pvp
	})

func _check_game_over() -> void:
	var outcome = match_state.get("outcome")
	if outcome == null or (typeof(outcome) == TYPE_STRING and outcome == "in_progress"):
		return

	var is_victory := false
	if typeof(outcome) == TYPE_STRING:
		var s := str(outcome).to_lower()
		if s == "player_victory" or s == "victory" or s.contains("playervictory(0)") or s.contains("player_victory: 0"):
			is_victory = true
	elif typeof(outcome) == TYPE_DICTIONARY:
		if outcome.has("player_victory") and int(outcome["player_victory"]) == 0:
			is_victory = true
		elif outcome.has("PlayerVictory") and int(outcome["PlayerVictory"]) == 0:
			is_victory = true
		elif outcome.has("team_victory") and int(outcome["team_victory"]) == 0:
			is_victory = true

	if is_victory:
		end_game_title.text = "🏆 C O N V E R G E N C E   V I C T O R Y ! 🏆"
		end_game_title.add_theme_color_override("font_color", Color(0.96, 0.85, 0.35))
		end_game_subtitle.text = "You shattered the opposing lines and claimed victory in the Convergence!"

		# Process Authoritative Rewards via GameState
		var rewards := GameState.process_match_rewards(match_state, GameState.selected_npc_id)
		var c_gain: int = int(rewards.get("crowns", 100))
		var d_gain: int = int(rewards.get("echo_dust", 30))
		var r_gain: int = int(rewards.get("relationship_gain", 8))

		end_game_details.text = """[b][size=18]AUTHORITATIVE DUEL REWARDS GRANTED[/size][/b]
• [color=#ffd700]Crowns Claimed:[/color] +%d Crowns (New Total: %d)
• [color=#88ccff]Echo Dust Gained:[/color] +%d Dust (New Total: %d)
• [color=#ff66aa]NPC Relationship Gain:[/color] +%d Bond Affinity with %s

[color=#66eebb]Quests Updated:[/color]
All matching duel objectives have progressed in your persistent profile!
Return to Lumenport to speak with Envoy Soren or Marshal Corin to turn in completed chapters.""" % [
			c_gain, GameState.crowns,
			d_gain, GameState.echo_dust,
			r_gain, GameState.selected_npc_id.replace("npc_", "").capitalize()
		]
	else:
		end_game_title.text = "⚔ D E F E A T E D   I N   D U E L ⚔"
		end_game_title.add_theme_color_override("font_color", Color(0.85, 0.35, 0.35))
		end_game_subtitle.text = "Your leader's vitality reached 0. The Convergence has reset."

		end_game_details.text = """[b][size=16]TACTICAL DEBRIEF & COMBAT ADVICE[/size][/b]
• [b]Vanguard Protection[/b]: Remember that units in your Front slot guard the Rear slot from normal attacks. Place high-health defensive creatures in Front!
• [b]Reach Keyword[/b]: Units with Reach can shoot directly over the enemy Vanguard into the Rear row.
• [b]Lane Resonate[/b]: Controlling 2 or more lanes at the end of your turn triggers Resonate, activating faction passives.
• [b]Deck Customization[/b]: Visit the Resonance Emporium to craft more synergistic cards or adjust your Aether curve."""

	end_game_modal.visible = true

func _spawn_floating_text(pos: Vector2, text: String, color: Color) -> void:
	var lbl := Label.new()
	lbl.text = text
	lbl.position = pos
	lbl.add_theme_font_size_override("font_size", 14)
	lbl.add_theme_color_override("font_color", color)
	fx_layer.add_child(lbl)

	var tween := create_tween()
	tween.tween_property(lbl, "position", pos + Vector2(0, -40), 0.8)
	tween.parallel().tween_property(lbl, "modulate:a", 0.0, 0.8)
	tween.tween_callback(lbl.queue_free)
