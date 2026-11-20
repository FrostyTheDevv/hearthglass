extends Control
## Playable Convergence Duels Tabletop Battle Scene (Godot 4)
## Powered exclusively by the authoritative Rust battle engine (`services/battle-server`)
## and live WebSocket multiplayer (`ws://127.0.0.1:4173/v1/ws`), rendering cards with `CardFrameWidget`.

const CardFrameWidgetScript := preload("res://scripts/ui/card_frame_widget.gd")

var match_state: Dictionary = {}
var selected_hand_index: int = -1

var header_label: Label
var lanes_container: HBoxContainer
var hand_container: HBoxContainer
var inspector_label: RichTextLabel
var log_label: RichTextLabel
var btn_mulligan: Button
var btn_end_turn: Button
var btn_pvp_queue: Button
var btn_tag_pvp_queue: Button
var btn_tag_2v2: Button

func _ready() -> void:
	ConvergenceRules.match_state_received.connect(_on_online_match_state_received)
	ConvergenceRules.command_rejected.connect(func(err: String):
		if inspector_label:
			inspector_label.text = "Server Rejected Command: " + err
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

func _build_tabletop_ui() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.05, 0.08, 0.15)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var main_vbox := VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	main_vbox.add_theme_constant_override("separation", 8)
	add_child(main_vbox)

	# Top Status Bar
	var top_bar := HBoxContainer.new()
	top_bar.add_theme_constant_override("separation", 10)
	main_vbox.add_child(top_bar)

	header_label = Label.new()
	header_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(header_label)

	btn_pvp_queue = Button.new()
	btn_pvp_queue.text = "Queue 1v1 PvP (WS)"
	btn_pvp_queue.pressed.connect(func(): ConvergenceRules.queue_1v1_pvp())
	top_bar.add_child(btn_pvp_queue)

	btn_tag_pvp_queue = Button.new()
	btn_tag_pvp_queue.text = "Queue 4-Client 2v2 Tag (WS)"
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
	top_bar.add_child(btn_end_turn)

	var btn_return := Button.new()
	btn_return.text = "Return to Lumenport"
	btn_return.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/world/lumenport_hub.tscn"))
	top_bar.add_child(btn_return)

	# Middle Battlefield + Sidebar
	var mid_hbox := HBoxContainer.new()
	mid_hbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	mid_hbox.add_theme_constant_override("separation", 12)
	main_vbox.add_child(mid_hbox)

	lanes_container = HBoxContainer.new()
	lanes_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lanes_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	lanes_container.add_theme_constant_override("separation", 12)
	mid_hbox.add_child(lanes_container)

	var right_sidebar := VBoxContainer.new()
	right_sidebar.custom_minimum_size = Vector2(360, 0)
	mid_hbox.add_child(right_sidebar)

	var insp_title := Label.new()
	insp_title.text = "CARD, BIOGRAPHY & RUST ENGINE INSPECTOR"
	right_sidebar.add_child(insp_title)

	inspector_label = RichTextLabel.new()
	inspector_label.custom_minimum_size = Vector2(350, 220)
	inspector_label.text = "Authoritative Rust Engine Active (640 Cards). Select a card in your hand, then click an open Front or Rear lane slot."
	right_sidebar.add_child(inspector_label)

	var log_title := Label.new()
	log_title.text = "AUTHORITATIVE BATTLE EVENT LOG"
	right_sidebar.add_child(log_title)

	log_label = RichTextLabel.new()
	log_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	right_sidebar.add_child(log_label)

	# Bottom Hand Bar (Data-Driven Card Frame Widgets)
	var hand_scroll := ScrollContainer.new()
	hand_scroll.custom_minimum_size = Vector2(0, 250)
	main_vbox.add_child(hand_scroll)

	hand_container = HBoxContainer.new()
	hand_container.add_theme_constant_override("separation", 10)
	hand_scroll.add_child(hand_container)

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
	header_label.text = "[%s] TURN %d (Seat %d) | %s: %d/%d Vitality | Aether: %d/%d | Resonate: %s  ||  VS  %s: %d/%d Vitality | Env: %s" % [
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

	btn_mulligan.disabled = bool(p_me.get("mulligan_done", false)) or int(match_state.get("global_turn", 1)) > 4

	# Rebuild 3 Lanes
	for child in lanes_container.get_children():
		child.queue_free()

	var lane_names := ["LEFT LANE (1)", "CENTER LANE (2)", "RIGHT LANE (3)"]
	for l_idx in range(3):
		var lane_panel := PanelContainer.new()
		lane_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		lanes_container.add_child(lane_panel)

		var lvbox := VBoxContainer.new()
		lvbox.add_theme_constant_override("separation", 6)
		lane_panel.add_child(lvbox)

		var ally_has := p_board["lanes"][l_idx]["front"] != null or p_board["lanes"][l_idx]["rear"] != null
		var opp_has := p_opp["lanes"][l_idx]["front"] != null or p_opp["lanes"][l_idx]["rear"] != null
		var l_header := Label.new()
		l_header.text = lane_names[l_idx] + (" [CONTROLLED]" if (ally_has and not opp_has) else "")
		if ally_has and not opp_has:
			l_header.add_theme_color_override("font_color", Color(0.27, 0.88, 0.61))
		lvbox.add_child(l_header)

		lvbox.add_child(_create_slot_widget(opp_board_slot, l_idx, "rear", "Enemy Rear"))
		lvbox.add_child(_create_slot_widget(opp_board_slot, l_idx, "front", "Enemy Front (Guards Rear)"))
		lvbox.add_child(_create_slot_widget(my_board_slot, l_idx, "front", "Your Front (Guards Rear)"))
		lvbox.add_child(_create_slot_widget(my_board_slot, l_idx, "rear", "Your Rear"))

	# Rebuild Hand using reusable CardFrameWidget (Section 8)
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

func _create_slot_widget(owner_idx: int, lane_idx: int, pos: String, label_prefix: String) -> Button:
	var btn := Button.new()
	btn.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var my_board_slot: int = ConvergenceRules.local_player_slot % 2
	var unit = match_state["players"][owner_idx]["lanes"][lane_idx][pos]
	if unit != null:
		var kws: String = ", ".join(unit.get("keywords", []))
		var ready_tag := " [READY - CLICK TO ATTACK]" if (owner_idx == my_board_slot and unit.get("ready", false)) else ""
		btn.text = "%s:\n%s (ATK %d / HP %d/%d)\nKeywords: %s%s" % [
			label_prefix,
			unit["name"],
			int(unit["attack"]),
			int(unit["health"]),
			int(unit.get("max_health", unit["health"])),
			kws if kws != "" else "None",
			ready_tag
		]
		if owner_idx == my_board_slot and unit.get("ready", false):
			btn.modulate = Color(0.75, 1.0, 0.85)
	else:
		btn.text = "%s\n[Empty Tabletop Slot]" % label_prefix
		if owner_idx == my_board_slot and selected_hand_index >= 0:
			btn.modulate = Color(0.65, 0.92, 1.0)

	if owner_idx == my_board_slot:
		btn.pressed.connect(func(): _on_ally_slot_clicked(lane_idx, pos))
	return btn

func _dispatch_command(cmd: Dictionary) -> void:
	if ConvergenceRules.is_online_pvp:
		ConvergenceRules.submit_online_command(cmd)
	else:
		var res := ConvergenceRules.apply_command(match_state, cmd, GameState.cards_by_id)
		if not res.get("accepted", false):
			inspector_label.text = "Action Rejected by Rust Engine: " + str(res.get("error", ""))
		elif match_state.get("outcome") == "player_victory":
			var rewards := GameState.process_match_rewards(match_state, GameState.selected_npc_id)
			inspector_label.text = "VICTORY! Earned +%d Crowns and +%d Echo Dust!" % [
				int(rewards.get("crowns", 100)),
				int(rewards.get("echo_dust", 30))
			]
		_refresh_tabletop()

func _on_hand_card_clicked(h_idx: int, def: Dictionary) -> void:
	selected_hand_index = h_idx
	var iden: Dictionary = def.get("identity", {})
	inspector_label.text = "%s (%s)\nCost: %d Aether | Type: %s (%s) | Faction: %s\nKeywords: %s\n\n%s\n\nOrigin: %s\nBiography: %s" % [
		def.get("name", ""),
		def.get("id", ""),
		int(def.get("cost", 0)),
		def.get("type", ""),
		str(def.get("subtype", "core")),
		def.get("faction", ""),
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
