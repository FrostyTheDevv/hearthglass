extends Control
## Playable Convergence Duels Tabletop Battle Scene (Godot 4)
## Powered exclusively by the authoritative Rust battle engine (`services/battle-server`)
## and live WebSocket multiplayer (`ws://127.0.0.1:4173/v1/ws`).
##
## Targeting & Strategic Interaction System:
##  - Supports targeting allied creatures, enemy creatures, empty slots, lanes, and Leaders.
##  - Highlights legal targets dynamically based on card requirements and battlefield state.
##  - Explains invalid selections clearly (e.g. Stealth, Vanguard guarding Rear, occupied slot).
##  - Provides an explicit "Cancel Action" button and Right-Click / Escape cancellation.
##  - Resumes normal input immediately after rejected actions.
##  - Preserves 100% Rust authority; Godot client never determines combat outcomes.
##  - Displays only actually granted rewards or explicit already-claimed / zero-reward status.

const CardFrameWidgetScript := preload("res://scripts/ui/card_frame_widget.gd")

enum InteractionMode {
	NEUTRAL,
	SUMMON_TARGET,
	TACTIC_TARGET,
	ATTACK_TARGET
}

var match_state: Dictionary = {}
var current_mode: InteractionMode = InteractionMode.NEUTRAL
var selected_hand_index: int = -1
var pending_hand_index: int = -1
var pending_card_def: Dictionary = {}
var pending_tactic_target_type: String = "" # "enemy_creature" | "ally_creature" | "open_ally_slot" | "enemy_leader" | "ally_leader" | "none"
var pending_attacker_lane: int = -1
var pending_attacker_pos: String = ""

# UI Containers & Nodes
var header_label: Label
var resonate_banner: Label
var targeting_instruction_label: Label
var btn_cancel_action: Button
var enemy_leader_btn: Button
var ally_leader_btn: Button
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

func _ready() -> void:
	ConvergenceRules.match_state_received.connect(_on_online_match_state_received)
	ConvergenceRules.command_rejected.connect(func(err: String):
		_cancel_interaction()
		if inspector_label:
			inspector_label.text = "[color=#ff5555][b]Action Rejected by Server:[/b][/color] " + err
		_spawn_floating_text(Vector2(600, 380), "REJECTED: " + err, Color(1.0, 0.35, 0.35))
	)
	ConvergenceRules.pvp_queued.connect(func():
		if inspector_label:
			inspector_label.text = "Queued for Live WebSocket Matchmaking (/v1/ws)... Waiting for duelists."
	)

	_init_rust_match(GameState.selected_match_format)
	_build_tabletop_ui()
	_refresh_tabletop()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_RIGHT:
		if current_mode != InteractionMode.NEUTRAL:
			_cancel_interaction()
			get_viewport().set_input_as_handled()
	elif event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
		if current_mode != InteractionMode.NEUTRAL:
			_cancel_interaction()
			get_viewport().set_input_as_handled()

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
	_cancel_interaction()
	_refresh_tabletop()
	_check_game_over()

func _cancel_interaction() -> void:
	current_mode = InteractionMode.NEUTRAL
	selected_hand_index = -1
	pending_card_def.clear()
	pending_tactic_target_type = ""
	pending_attacker_lane = -1
	pending_attacker_pos = ""
	if btn_cancel_action:
		btn_cancel_action.visible = false
	if targeting_instruction_label:
		targeting_instruction_label.text = ""
	_refresh_tabletop()

func _build_tabletop_ui() -> void:
	# 1. Dark Runic Tabletop Background (Mahogany & Slate)
	var bg := ColorRect.new()
	bg.color = Color(0.04, 0.06, 0.11)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

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
	main_vbox.add_theme_constant_override("separation", 5)
	add_child(main_vbox)

	# 2. Top Header Status & Match Controls Bar
	var top_bar := HBoxContainer.new()
	top_bar.add_theme_constant_override("separation", 8)
	main_vbox.add_child(top_bar)

	header_label = Label.new()
	header_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header_label.add_theme_font_size_override("font_size", 13)
	top_bar.add_child(header_label)

	btn_cancel_action = Button.new()
	btn_cancel_action.text = "✖ Cancel Target Selection (Esc/Right-Click)"
	btn_cancel_action.visible = false
	btn_cancel_action.add_theme_color_override("font_color", Color(1.0, 0.45, 0.45))
	btn_cancel_action.pressed.connect(_cancel_interaction)
	top_bar.add_child(btn_cancel_action)

	btn_pvp_queue = Button.new()
	btn_pvp_queue.text = "Queue 1v1 PvP"
	btn_pvp_queue.pressed.connect(func(): ConvergenceRules.queue_1v1_pvp())
	top_bar.add_child(btn_pvp_queue)

	btn_tag_pvp_queue = Button.new()
	btn_tag_pvp_queue.text = "Queue 2v2 Tag"
	btn_tag_pvp_queue.pressed.connect(func(): ConvergenceRules.queue_2v2_pvp())
	top_bar.add_child(btn_tag_pvp_queue)

	btn_tag_2v2 = Button.new()
	btn_tag_2v2.text = "Offline 2v2 Tag"
	btn_tag_2v2.pressed.connect(func():
		_init_rust_match("tag_2v2")
		_refresh_tabletop()
	)
	top_bar.add_child(btn_tag_2v2)

	btn_mulligan = Button.new()
	btn_mulligan.text = "Mulligan"
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

	# Banners & Targeting Prompts
	var banners_hbox := HBoxContainer.new()
	banners_hbox.add_theme_constant_override("separation", 12)
	main_vbox.add_child(banners_hbox)

	resonate_banner = Label.new()
	resonate_banner.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	resonate_banner.add_theme_font_size_override("font_size", 12)
	resonate_banner.add_theme_color_override("font_color", Color(0.35, 0.95, 0.75))
	banners_hbox.add_child(resonate_banner)

	targeting_instruction_label = Label.new()
	targeting_instruction_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	targeting_instruction_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	targeting_instruction_label.add_theme_font_size_override("font_size", 12)
	targeting_instruction_label.add_theme_color_override("font_color", Color(1.0, 0.85, 0.35))
	banners_hbox.add_child(targeting_instruction_label)

	# Leader Targeting Interaction Bar
	var leader_bar := HBoxContainer.new()
	leader_bar.add_theme_constant_override("separation", 10)
	main_vbox.add_child(leader_bar)

	enemy_leader_btn = Button.new()
	enemy_leader_btn.text = "Target Enemy Leader (Direct Attack / Spell)"
	enemy_leader_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	enemy_leader_btn.pressed.connect(_on_enemy_leader_clicked)
	leader_bar.add_child(enemy_leader_btn)

	ally_leader_btn = Button.new()
	ally_leader_btn.text = "Target Ally Leader (Heal / Shield Ability)"
	ally_leader_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	ally_leader_btn.pressed.connect(_on_ally_leader_clicked)
	leader_bar.add_child(ally_leader_btn)

	# 3. Middle Battlefield + Sidebar Split
	var mid_hbox := HBoxContainer.new()
	mid_hbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	mid_hbox.add_theme_constant_override("separation", 8)
	main_vbox.add_child(mid_hbox)

	# 3-Lane Combat Grid
	lanes_container = HBoxContainer.new()
	lanes_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lanes_container.size_flags_vertical = Control.SIZE_EXPAND_FILL
	lanes_container.add_theme_constant_override("separation", 10)
	mid_hbox.add_child(lanes_container)

	# Right Sidebar: Card Inspector & Live Authoritative Battle Log
	var right_sidebar := VBoxContainer.new()
	right_sidebar.custom_minimum_size = Vector2(360, 0)
	right_sidebar.add_theme_constant_override("separation", 6)
	mid_hbox.add_child(right_sidebar)

	var insp_panel := PanelContainer.new()
	insp_panel.custom_minimum_size = Vector2(350, 200)
	var ip_style := StyleBoxFlat.new()
	ip_style.bg_color = Color(0.07, 0.11, 0.19)
	ip_style.border_color = Color(0.25, 0.45, 0.68)
	ip_style.set_border_width_all(1)
	ip_style.set_corner_radius_all(6)
	ip_style.set_content_margin_all(8)
	insp_panel.add_theme_stylebox_override("panel", ip_style)
	right_sidebar.add_child(insp_panel)

	inspector_label = RichTextLabel.new()
	inspector_label.bbcode_enabled = true
	inspector_label.text = "[color=#ffdd44][b]RUST BATTLE AUTHORITY ACTIVE[/b][/color]\nSelect a card in your hand to inspect it, then choose a legal target or battlefield slot."
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

	# 4. Bottom Hand Bar
	var hand_scroll := ScrollContainer.new()
	hand_scroll.custom_minimum_size = Vector2(0, 255)
	main_vbox.add_child(hand_scroll)

	hand_container = HBoxContainer.new()
	hand_container.add_theme_constant_override("separation", 10)
	hand_scroll.add_child(hand_container)

	# 5. Effects Overlay Layer
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
	m_style.set_content_margin_all(50)
	end_game_modal.add_theme_stylebox_override("panel", m_style)
	end_game_modal.visible = false
	add_child(end_game_modal)

	var mvbox := VBoxContainer.new()
	mvbox.add_theme_constant_override("separation", 18)
	end_game_modal.add_child(mvbox)

	end_game_title = Label.new()
	end_game_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_game_title.add_theme_font_size_override("font_size", 32)
	mvbox.add_child(end_game_title)

	end_game_subtitle = Label.new()
	end_game_subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_game_subtitle.add_theme_font_size_override("font_size", 15)
	mvbox.add_child(end_game_subtitle)

	end_game_details = RichTextLabel.new()
	end_game_details.bbcode_enabled = true
	end_game_details.size_flags_vertical = Control.SIZE_EXPAND_FILL
	mvbox.add_child(end_game_details)

	end_game_actions_hbox = HBoxContainer.new()
	end_game_actions_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	end_game_actions_hbox.add_theme_constant_override("separation", 16)
	mvbox.add_child(end_game_actions_hbox)

	var btn_leave := Button.new()
	btn_leave.text = "Return to Lumenport"
	btn_leave.custom_minimum_size = Vector2(200, 44)
	btn_leave.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/world/lumenport_hub.tscn"))
	end_game_actions_hbox.add_child(btn_leave)

	var btn_rematch := Button.new()
	btn_rematch.text = "Play Another Duel"
	btn_rematch.custom_minimum_size = Vector2(200, 44)
	btn_rematch.pressed.connect(func():
		end_game_modal.visible = false
		_init_rust_match(GameState.selected_match_format)
		_refresh_tabletop()
	)
	end_game_actions_hbox.add_child(btn_rematch)

func _refresh_tabletop() -> void:
	if match_state.is_empty() or not match_state.has("players"):
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
	header_label.text = "[%s] TURN %d | %s: %d/%d Vit | Aether: %d/%d | Resonate: %s  ||  VS  %s: %d/%d Vit | Env: %s" % [
		fmt_label,
		int(match_state.get("global_turn", 1)),
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

	# Update Resonate Banner
	if bool(p_board.get("resonate_active", false)):
		resonate_banner.text = "✦ RESONATE ACTIVE ✦ (2+ Lanes Controlled)"
		resonate_banner.add_theme_color_override("font_color", Color(0.35, 0.98, 0.70))
	elif bool(p_opp.get("resonate_active", false)):
		resonate_banner.text = "⚠ OPPONENT RESONATING ⚠ (Enemy Controls 2+ Lanes)"
		resonate_banner.add_theme_color_override("font_color", Color(1.0, 0.45, 0.35))
	else:
		resonate_banner.text = "Lane Control Neutral (Hold 2+ lanes to trigger Resonate)"
		resonate_banner.add_theme_color_override("font_color", Color(0.65, 0.75, 0.88))

	# Update Targeting Mode Prompts
	btn_cancel_action.visible = (current_mode != InteractionMode.NEUTRAL)
	if current_mode == InteractionMode.SUMMON_TARGET:
		targeting_instruction_label.text = "Select an open ally Vanguard (Front) or Support (Rear) slot to summon %s" % pending_card_def.get("name", "Creature")
	elif current_mode == InteractionMode.TACTIC_TARGET:
		targeting_instruction_label.text = "Choose a valid target for %s (Targeting: %s)" % [pending_card_def.get("name", "Tactic"), pending_tactic_target_type]
	elif current_mode == InteractionMode.ATTACK_TARGET:
		targeting_instruction_label.text = "Attacker selected (Lane %d). Click an enemy Vanguard, or enemy Leader if lane is clear." % (pending_attacker_lane + 1)
	else:
		targeting_instruction_label.text = ""

	btn_mulligan.disabled = bool(p_me.get("mulligan_done", false)) or int(match_state.get("global_turn", 1)) > 4

	# Update Leader Targeting Buttons
	if current_mode == InteractionMode.ATTACK_TARGET:
		var can_attack_leader := (p_opp["lanes"][pending_attacker_lane]["front"] == null and p_opp["lanes"][pending_attacker_lane]["rear"] == null)
		enemy_leader_btn.text = "⚔ ATTACK ENEMY LEADER (%d Vit) — [LEGAL TARGET]" % int(p_opp.get("vitality", 30)) if can_attack_leader else "Enemy Leader (%d Vit) [Guarded by Lane Creatures]" % int(p_opp.get("vitality", 30))
		enemy_leader_btn.disabled = not can_attack_leader
		enemy_leader_btn.modulate = Color(1.0, 0.85, 0.35) if can_attack_leader else Color(0.6, 0.6, 0.6)
	elif current_mode == InteractionMode.TACTIC_TARGET and pending_tactic_target_type == "enemy_leader":
		enemy_leader_btn.text = "✦ TARGET ENEMY LEADER (%d Vit) — [LEGAL SPELL TARGET]" % int(p_opp.get("vitality", 30))
		enemy_leader_btn.disabled = false
		enemy_leader_btn.modulate = Color(0.4, 0.95, 1.0)
	else:
		enemy_leader_btn.text = "Enemy Leader: %s (%d Vit)" % [str(p_opp.get("name", "Opponent")), int(p_opp.get("vitality", 30))]
		enemy_leader_btn.disabled = true
		enemy_leader_btn.modulate = Color(0.8, 0.8, 0.8)

	if current_mode == InteractionMode.TACTIC_TARGET and pending_tactic_target_type == "ally_leader":
		ally_leader_btn.text = "✦ TARGET ALLY LEADER (%d Vit) — [LEGAL SPELL TARGET]" % int(p_board.get("vitality", 30))
		ally_leader_btn.disabled = false
		ally_leader_btn.modulate = Color(0.35, 1.0, 0.7)
	else:
		ally_leader_btn.text = "Your Leader: %s (%d Vit)" % [str(p_me.get("name", "Player")), int(p_board.get("vitality", 30))]
		ally_leader_btn.disabled = true
		ally_leader_btn.modulate = Color(0.8, 0.8, 0.8)

	# Rebuild 3 Lanes with Dynamic Targeting Highlights
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

		# 4 Slots: Enemy Rear -> Enemy Front -> Allied Front (Vanguard) -> Allied Rear (Support)
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
	var is_ally: bool = (owner_idx == my_board_slot)
	var unit = match_state["players"][owner_idx]["lanes"][lane_idx][pos]

	var status_tag := ""
	var is_legal_target := false

	if unit != null:
		var kws: Array = unit.get("keywords", [])
		var kw_badges := ""
		if kws.has("guard"): kw_badges += " [🛡 Guard]"
		if kws.has("reach"): kw_badges += " [🏹 Reach]"
		if kws.has("ward"): kw_badges += " [✨ Ward]"
		if kws.has("piercing"): kw_badges += " [🗡 Pierce]"
		if kws.has("stealth"): kw_badges += " [👥 Stealth]"

		# Targeting state evaluation
		if current_mode == InteractionMode.TACTIC_TARGET:
			if not is_ally and (pending_tactic_target_type == "enemy_creature" or pending_tactic_target_type == "enemy_in_lane"):
				if kws.has("stealth"):
					status_tag = " [UNAVAILABLE - STEALTH]"
					btn.modulate = Color(0.6, 0.4, 0.4)
				else:
					status_tag = " [✦ LEGAL SPELL TARGET]"
					is_legal_target = true
					btn.modulate = Color(0.35, 0.95, 1.0)
			elif is_ally and pending_tactic_target_type == "ally_creature":
				status_tag = " [✦ LEGAL ALLY TARGET]"
				is_legal_target = true
				btn.modulate = Color(0.35, 1.0, 0.75)
			else:
				status_tag = " [UNAVAILABLE]"
				btn.modulate = Color(0.5, 0.5, 0.5)
		elif current_mode == InteractionMode.ATTACK_TARGET:
			if is_ally:
				if lane_idx == pending_attacker_lane and pos == pending_attacker_pos:
					status_tag = " [ACTIVE ATTACKER]"
					btn.modulate = Color(1.0, 0.90, 0.40)
				else:
					status_tag = ""
					btn.modulate = Color(0.8, 0.85, 0.9)
			else:
				# Enemy target evaluation
				var enemy_front = match_state["players"][owner_idx]["lanes"][lane_idx]["front"]
				var attacker_unit = match_state["players"][my_board_slot]["lanes"][pending_attacker_lane][pending_attacker_pos]
				var attacker_kws: Array = attacker_unit.get("keywords", []) if attacker_unit != null else []
				var has_reach := attacker_kws.has("reach")

				if kws.has("stealth"):
					status_tag = " [CANNOT TARGET - STEALTH]"
					btn.modulate = Color(0.6, 0.4, 0.4)
				elif pos == "front" and lane_idx == pending_attacker_lane:
					status_tag = " [⚔ LEGAL ATTACK TARGET]"
					is_legal_target = true
					btn.modulate = Color(1.0, 0.55, 0.40)
				elif pos == "rear" and lane_idx == pending_attacker_lane:
					if enemy_front == null or has_reach:
						status_tag = " [⚔ LEGAL ATTACK TARGET]"
						is_legal_target = true
						btn.modulate = Color(1.0, 0.55, 0.40)
					else:
						status_tag = " [GUARDED BY VANGUARD]"
						btn.modulate = Color(0.6, 0.4, 0.4)
				else:
					status_tag = " [DIFFERENT LANE]"
					btn.modulate = Color(0.5, 0.5, 0.5)
		else:
			# Neutral mode
			if is_ally:
				if unit.get("ready", false):
					status_tag = " ⚡ [READY - CLICK TO ATTACK]"
					btn.modulate = Color(0.75, 1.0, 0.85)
				else:
					btn.modulate = Color(0.85, 0.90, 0.98)
			else:
				btn.modulate = Color(1.0, 0.85, 0.85)

		btn.text = "%s:\n%s (⚔ %d / ♥ %d)%s%s" % [
			label_prefix,
			unit["name"],
			int(unit["attack"]),
			int(unit["health"]),
			kw_badges,
			status_tag
		]
	else:
		# Empty slot
		if current_mode == InteractionMode.SUMMON_TARGET:
			if is_ally:
				btn.text = "%s\n✦ [CLICK TO SUMMON]" % label_prefix
				btn.modulate = Color(0.35, 1.0, 0.75)
				is_legal_target = true
			else:
				btn.text = "%s\n[Enemy Slot - Unavailable]" % label_prefix
				btn.modulate = Color(0.4, 0.4, 0.4)
		elif current_mode == InteractionMode.TACTIC_TARGET and is_ally and pending_tactic_target_type == "open_ally_slot":
			btn.text = "%s\n✦ [LEGAL OPEN SLOT TARGET]" % label_prefix
			btn.modulate = Color(0.35, 0.95, 1.0)
			is_legal_target = true
		elif current_mode == InteractionMode.ATTACK_TARGET and is_ally:
			btn.text = "%s\n✦ [CLICK TO MOVE CREATURE]" % label_prefix
			btn.modulate = Color(0.4, 0.8, 1.0)
			is_legal_target = true
		else:
			btn.text = "%s\n[Empty Tabletop Slot]" % label_prefix
			btn.modulate = Color(0.6, 0.65, 0.75)

	# Slot click dispatch
	btn.pressed.connect(func(): _on_slot_clicked(owner_idx, lane_idx, pos, unit, is_legal_target))
	return btn

func _on_ally_slot_clicked(lane_idx: int, pos: String) -> void:
	var my_board_slot: int = ConvergenceRules.local_player_slot % 2
	var unit = match_state["players"][my_board_slot]["lanes"][lane_idx][pos]
	_on_slot_clicked(my_board_slot, lane_idx, pos, unit, true)

func _on_slot_clicked(owner_idx: int, lane_idx: int, pos: String, unit, is_legal: bool) -> void:
	var my_board_slot: int = ConvergenceRules.local_player_slot % 2
	var is_ally: bool = (owner_idx == my_board_slot)

	if current_mode == InteractionMode.SUMMON_TARGET:
		if is_ally and unit == null:
			SoundManager.play_card_play()
			var h_idx := pending_hand_index
			_cancel_interaction()
			_dispatch_command({
				"player": ConvergenceRules.local_player_slot,
				"type": "summon_creature",
				"hand_index": h_idx,
				"lane": lane_idx,
				"position": pos
			})
		elif is_ally and unit != null:
			_show_rejection_explanation("Invalid Selection: Slot is already occupied by %s." % unit.get("name", "creature"))
		else:
			_show_rejection_explanation("Invalid Selection: Cannot summon an allied creature into an enemy slot.")

	elif current_mode == InteractionMode.TACTIC_TARGET:
		if not is_legal:
			if unit != null and unit.get("keywords", []).has("stealth"):
				_show_rejection_explanation("Invalid Target: Cannot directly target a creature with Stealth.")
			elif pending_tactic_target_type == "enemy_creature" and is_ally:
				_show_rejection_explanation("Invalid Target: Tactic requires an enemy creature target.")
			elif pending_tactic_target_type == "ally_creature" and not is_ally:
				_show_rejection_explanation("Invalid Target: Tactic requires an allied creature target.")
			elif unit == null:
				_show_rejection_explanation("Invalid Target: This ability requires an active creature, not an empty slot.")
			else:
				_show_rejection_explanation("Invalid Target for %s." % pending_card_def.get("name", "Tactic"))
			return

		SoundManager.play_card_play()
		var h_idx := pending_hand_index
		_cancel_interaction()
		_dispatch_command({
			"player": ConvergenceRules.local_player_slot,
			"type": "play_tactic",
			"hand_index": h_idx,
			"target_lane": lane_idx,
			"target_position": pos
		})

	elif current_mode == InteractionMode.ATTACK_TARGET:
		if is_ally:
			if unit == null:
				# Move creature
				SoundManager.play_button_click()
				var from_l := pending_attacker_lane
				var from_p := pending_attacker_pos
				_cancel_interaction()
				_dispatch_command({
					"player": ConvergenceRules.local_player_slot,
					"type": "move_creature",
					"from_lane": from_l,
					"from_position": from_p,
					"to_lane": lane_idx,
					"to_position": pos
				})
			elif lane_idx != pending_attacker_lane or pos != pending_attacker_pos:
				# Switch attacker to another allied ready unit
				if unit.get("ready", false):
					pending_attacker_lane = lane_idx
					pending_attacker_pos = pos
					SoundManager.play_button_click()
					_refresh_tabletop()
		else:
			# Enemy target click
			if not is_legal:
				if unit != null and unit.get("keywords", []).has("stealth"):
					_show_rejection_explanation("Invalid Target: Cannot attack a creature with Stealth.")
				elif lane_idx != pending_attacker_lane:
					_show_rejection_explanation("Invalid Target: Attacks can only target enemy units in the same lane (Lane %d)." % (pending_attacker_lane + 1))
				elif pos == "rear":
					_show_rejection_explanation("Invalid Target: The enemy Vanguard in Front guards the Rear. Defeat Front first or use Reach.")
				return

			SoundManager.play_attack_clash()
			var a_l := pending_attacker_lane
			var a_p := pending_attacker_pos
			_cancel_interaction()
			_dispatch_command({
				"player": ConvergenceRules.local_player_slot,
				"type": "attack_creature",
				"attacker_lane": a_l,
				"attacker_position": a_p,
				"defender_lane": lane_idx,
				"defender_position": pos
			})

	else:
		# Neutral mode: clicking an ally unit starts attack selection
		if is_ally and unit != null and unit.get("ready", false):
			current_mode = InteractionMode.ATTACK_TARGET
			pending_attacker_lane = lane_idx
			pending_attacker_pos = pos
			SoundManager.play_button_click()
			inspector_label.text = "[color=#66ffbb][b]Attacker Selected: %s[/b][/color]\nClick an enemy Vanguard in Lane %d to attack, or click an empty allied slot to move." % [unit.get("name", ""), lane_idx + 1]
			_refresh_tabletop()

func _on_enemy_leader_clicked() -> void:
	if current_mode == InteractionMode.ATTACK_TARGET:
		var a_l := pending_attacker_lane
		var a_p := pending_attacker_pos
		SoundManager.play_attack_clash()
		_cancel_interaction()
		_dispatch_command({
			"player": ConvergenceRules.local_player_slot,
			"type": "attack_leader",
			"attacker_lane": a_l,
			"attacker_position": a_p
		})
	elif current_mode == InteractionMode.TACTIC_TARGET and pending_tactic_target_type == "enemy_leader":
		SoundManager.play_card_play()
		var h_idx := pending_hand_index
		_cancel_interaction()
		_dispatch_command({
			"player": ConvergenceRules.local_player_slot,
			"type": "play_tactic",
			"hand_index": h_idx,
			"target_lane": 0,
			"target_position": "front"
		})

func _on_ally_leader_clicked() -> void:
	if current_mode == InteractionMode.TACTIC_TARGET and pending_tactic_target_type == "ally_leader":
		SoundManager.play_card_play()
		var h_idx := pending_hand_index
		_cancel_interaction()
		_dispatch_command({
			"player": ConvergenceRules.local_player_slot,
			"type": "play_tactic",
			"hand_index": h_idx,
			"target_lane": 0,
			"target_position": "front"
		})

func _show_rejection_explanation(reason: String) -> void:
	inspector_label.text = "[color=#ff5555][b]Targeting Rejection:[/b][/color]\n" + reason
	_spawn_floating_text(Vector2(600, 360), reason, Color(1.0, 0.4, 0.4))

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
			elif ctype == "attack_creature" or ctype == "attack_leader" or ctype == "attack_lane":
				_spawn_floating_text(Vector2(600, 320), "⚔ CLASH & DAMAGE EVALUATED ⚔", Color(1.0, 0.75, 0.30))

		_refresh_tabletop()

func _on_hand_card_clicked(h_idx: int, def: Dictionary) -> void:
	selected_hand_index = h_idx
	pending_card_def = def
	SoundManager.play_button_click()

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

	var ctype: String = str(def.get("type", "creature"))
	if ctype == "creature":
		current_mode = InteractionMode.SUMMON_TARGET
		pending_hand_index = h_idx
		_refresh_tabletop()
	elif ctype == "relic":
		# Relics are untargeted board attachments
		SoundManager.play_card_play()
		_cancel_interaction()
		_dispatch_command({
			"player": ConvergenceRules.local_player_slot,
			"type": "play_relic",
			"hand_index": h_idx
		})
	elif ctype == "environment":
		# Environments are untargeted global battlefield shifts
		SoundManager.play_card_play()
		_cancel_interaction()
		_dispatch_command({
			"player": ConvergenceRules.local_player_slot,
			"type": "play_environment",
			"hand_index": h_idx
		})
	elif ctype == "tactic":
		var t_info := _derive_tactic_targeting(def)
		if not t_info.needs_target:
			# Untargeted tactic played immediately with null targets
			SoundManager.play_card_play()
			_cancel_interaction()
			_dispatch_command({
				"player": ConvergenceRules.local_player_slot,
				"type": "play_tactic",
				"hand_index": h_idx,
				"target_lane": null,
				"target_position": null
			})
		else:
			current_mode = InteractionMode.TACTIC_TARGET
			pending_hand_index = h_idx
			pending_tactic_target_type = t_info.target_type
			_refresh_tabletop()

func _derive_tactic_targeting(def: Dictionary) -> Dictionary:
	var abs_list: Array = def.get("abilities", [])
	for ab in abs_list:
		var effs: Array = ab.get("effects", [])
		for ef in effs:
			var t: String = str(ef.get("target", "")).to_lower()
			if t == "target_enemy_creature" or t == "enemy_in_lane":
				return {"needs_target": true, "target_type": "enemy_creature"}
			elif t == "ally_creature_in_lane_or_any" or t == "target_ally" or t == "strongest_ally_creature":
				return {"needs_target": true, "target_type": "ally_creature"}
			elif t == "open_ally_slot":
				return {"needs_target": true, "target_type": "open_ally_slot"}
			elif t == "enemy_leader":
				return {"needs_target": true, "target_type": "enemy_leader"}
			elif t == "ally_leader":
				return {"needs_target": true, "target_type": "ally_leader"}
	return {"needs_target": false, "target_type": "none"}

func _on_mulligan_pressed() -> void:
	SoundManager.play_button_click()
	_cancel_interaction()
	_dispatch_command({
		"player": ConvergenceRules.local_player_slot,
		"type": "mulligan",
		"replace_hand_indices": [0, 1]
	})

func _on_end_turn_pressed() -> void:
	SoundManager.play_button_click()
	_cancel_interaction()
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
		SoundManager.play_victory()
		end_game_title.text = "🏆 C O N V E R G E N C E   V I C T O R Y ! 🏆"
		end_game_title.add_theme_color_override("font_color", Color(0.96, 0.85, 0.35))
		end_game_subtitle.text = "You shattered the opposing lines and claimed victory in the Convergence!"

		# Process Authoritative Rewards via GameState
		var rewards := GameState.process_match_rewards(match_state, GameState.selected_npc_id)
		if rewards.get("success", false):
			var c_gain: int = int(rewards.get("crowns", 0))
			var d_gain: int = int(rewards.get("echo_dust", 0))
			var r_gain: int = int(rewards.get("relationship_gain", 0))
			var b_card: String = str(rewards.get("bonus_card_id", ""))
			var b_text := ("\n• [color=#ffdd44]Bonus Card Rewarded:[/color] %s" % b_card) if b_card != "" else ""

			end_game_details.text = """[b][size=18]AUTHORITATIVE DUEL REWARDS GRANTED[/size][/b]
• [color=#ffd700]Crowns Claimed:[/color] +%d Crowns (New Total: %d)
• [color=#88ccff]Echo Dust Gained:[/color] +%d Dust (New Total: %d)
• [color=#ff66aa]NPC Relationship Gain:[/color] +%d Bond Affinity with %s%s

[color=#66eebb]Quests Updated:[/color]
All matching duel objectives have progressed in your persistent profile!
Return to Lumenport to speak with Envoy Soren or Marshal Corin to turn in completed chapters.""" % [
				c_gain, GameState.crowns,
				d_gain, GameState.echo_dust,
				r_gain, GameState.selected_npc_id.replace("npc_", "").capitalize(),
				b_text
			]
		elif rewards.get("already_claimed", false):
			end_game_details.text = """[b][size=18]MATCH REWARD ALREADY CLAIMED[/size][/b]
[color=#ffbb33]Authoritative match rewards for Match ID '%s' have already been processed into your profile.[/color]
No duplicate Crowns, Dust, or quest progression will be granted for this encounter.

Current Balances: %d Crowns | %d Echo Dust""" % [
				str(rewards.get("match_id", match_state.get("match_id", ""))),
				GameState.crowns,
				GameState.echo_dust
			]
		else:
			end_game_details.text = """[b][size=18]DUEL COMPLETE — NO REWARDS GRANTED[/size][/b]
[color=#ff8888]%s[/color]

Current Balances: %d Crowns | %d Echo Dust""" % [
				str(rewards.get("error", "No authoritative reward granted.")),
				GameState.crowns,
				GameState.echo_dust
			]
	else:
		SoundManager.play_defeat()
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
