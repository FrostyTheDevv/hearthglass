extends Control
## Main Menu and Character Selection Controller for Hearthglass: Convergence Duels
## Provides hero selection, deck pre-configuration, world exploration launch,
## duel matchmaking, and gameplay controls guide.

const HERO_ROSTER: Array[Dictionary] = [
	{
		"id": "hero_aerin",
		"name": "Aerin Vanguard",
		"title": "Commander of the Ashen March",
		"factions": ["emberclad", "iron_choir"],
		"deck_id": "deck_ember_iron_forge",
		"color": Color(0.95, 0.42, 0.22),
		"avatar_symbol": "⚔",
		"description": "Veteran tactician balancing aggressive Emberclad shock troops with fortified Iron Choir automatons. Excellent for direct combat control.",
		"favored_playstyle": "Vanguard Wall + Siege Engines"
	},
	{
		"id": "hero_lyra",
		"name": "Lyra of the Glass",
		"title": "Prismblade Infiltrator",
		"factions": ["glassborne", "nocturne"],
		"deck_id": "deck_glass_nocturne_mirage",
		"color": Color(0.72, 0.48, 0.98),
		"avatar_symbol": "✦",
		"description": "Elusive duelist who commands crystal reflections, Ward barriers, and lethal Nocturne shadow strikes that bypass front-line defenders.",
		"favored_playstyle": "Stealth Infiltration + Burst Magic"
	},
	{
		"id": "hero_soren",
		"name": "Envoy Soren",
		"title": "Scholar of the Solstice Spire",
		"factions": ["verdant_pact", "starweave"],
		"deck_id": "deck_verdant_star_solstice",
		"color": Color(0.24, 0.86, 0.52),
		"avatar_symbol": "🌿",
		"description": "Mystic emissary channeling natural Aether growth and celestial astrology. Excels at late-game behemoths and lane restoration.",
		"favored_playstyle": "Aether Ramp + Celestial Reach"
	},
	{
		"id": "hero_kaelen",
		"name": "Kaelen Forgeborn",
		"title": "Master of the Molten Foundry",
		"factions": ["emberclad"],
		"deck_id": "deck_emberclad_mono_burn",
		"color": Color(1.0, 0.65, 0.20),
		"avatar_symbol": "🔥",
		"description": "Aggressive pyromancer who weaponizes relentless direct damage and sacrificial Flame Imps to overwhelm opponents before they stabilize.",
		"favored_playstyle": "Fast Aggro + Direct Burn"
	}
]

var character_modal: PanelContainer
var guide_modal: PanelContainer
var hero_name_label: Label
var hero_title_label: Label
var hero_desc_label: Label
var hero_deck_label: Label
var hero_avatar_box: PanelContainer
var hero_avatar_label: Label
var hero_playstyle_label: Label
var current_hero_idx: int = 0

var current_hero_summary_label: Label

func _ready() -> void:
	_sync_current_hero_index()
	_build_ui()
	_update_hero_display()

func _sync_current_hero_index() -> void:
	for i in range(HERO_ROSTER.size()):
		if HERO_ROSTER[i]["deck_id"] == GameState.active_deck_id or HERO_ROSTER[i]["name"] == GameState.player_name:
			current_hero_idx = i
			return
	current_hero_idx = 0

func _build_ui() -> void:
	# Deep fantasy twilight gradient background
	var bg := ColorRect.new()
	bg.color = Color(0.04, 0.07, 0.12)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	# Atmospheric decorative banner
	var deco_banner := ColorRect.new()
	deco_banner.color = Color(0.12, 0.18, 0.32, 0.45)
	deco_banner.custom_minimum_size = Vector2(0, 160)
	deco_banner.set_anchors_preset(Control.PRESET_TOP_WIDE)
	add_child(deco_banner)

	var main_vbox := VBoxContainer.new()
	main_vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	main_vbox.add_theme_constant_override("separation", 24)
	main_vbox.offset_left = 60
	main_vbox.offset_right = -60
	main_vbox.offset_top = 40
	main_vbox.offset_bottom = -40
	add_child(main_vbox)

	# Header Title
	var title_vbox := VBoxContainer.new()
	title_vbox.add_theme_constant_override("separation", 4)
	main_vbox.add_child(title_vbox)

	var title := Label.new()
	title.text = "H E A R T H G L A S S"
	title.add_theme_font_size_override("font_size", 42)
	title.add_theme_color_override("font_color", Color(0.96, 0.85, 0.45))
	title_vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "C O N V E R G E N C E   D U E L S  —  I S O M E T R I C   C A R D - B A T T L I N G   R P G"
	subtitle.add_theme_font_size_override("font_size", 14)
	subtitle.add_theme_color_override("font_color", Color(0.48, 0.78, 0.95))
	title_vbox.add_child(subtitle)

	# Active Profile Bar
	var profile_bar := PanelContainer.new()
	var p_style := StyleBoxFlat.new()
	p_style.bg_color = Color(0.08, 0.13, 0.22, 0.85)
	p_style.border_color = Color(0.25, 0.45, 0.65)
	p_style.set_border_width_all(1)
	p_style.set_corner_radius_all(6)
	p_style.set_content_margin_all(10)
	profile_bar.add_theme_stylebox_override("panel", p_style)
	main_vbox.add_child(profile_bar)

	var prof_hbox := HBoxContainer.new()
	prof_hbox.add_theme_constant_override("separation", 20)
	profile_bar.add_child(prof_hbox)

	current_hero_summary_label = Label.new()
	current_hero_summary_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	current_hero_summary_label.add_theme_color_override("font_color", Color(0.88, 0.92, 1.0))
	prof_hbox.add_child(current_hero_summary_label)

	var btn_switch_hero := Button.new()
	btn_switch_hero.text = "Change Character / Archetype"
	btn_switch_hero.pressed.connect(_open_character_modal)
	prof_hbox.add_child(btn_switch_hero)

	# Main Layout Split: Left Action Columns + Right Lore Showcase
	var mid_split := HBoxContainer.new()
	mid_split.size_flags_vertical = Control.SIZE_EXPAND_FILL
	mid_split.add_theme_constant_override("separation", 36)
	main_vbox.add_child(mid_split)

	# Left Column: Primary Journey Actions
	var left_vbox := VBoxContainer.new()
	left_vbox.custom_minimum_size = Vector2(400, 0)
	left_vbox.add_theme_constant_override("separation", 14)
	mid_split.add_child(left_vbox)

	var btn_explore := Button.new()
	btn_explore.text = "✦  EXPLORE LUMENPORT (3D CITY HUB)  ✦"
	btn_explore.custom_minimum_size = Vector2(0, 56)
	btn_explore.add_theme_font_size_override("font_size", 16)
	btn_explore.pressed.connect(_on_explore_pressed)
	left_vbox.add_child(btn_explore)

	var btn_duel := Button.new()
	btn_duel.text = "⚔  CONVERGENCE TABLETOP DUEL  ⚔"
	btn_duel.custom_minimum_size = Vector2(0, 52)
	btn_duel.pressed.connect(_on_duel_pressed)
	left_vbox.add_child(btn_duel)

	var btn_shop := Button.new()
	btn_shop.text = "🏛  RESONANCE EMPORIUM & DECK BUILDER (640 CARDS)"
	btn_shop.custom_minimum_size = Vector2(0, 48)
	btn_shop.pressed.connect(_on_shop_pressed)
	left_vbox.add_child(btn_shop)

	var btn_guide := Button.new()
	btn_guide.text = "📜  HOW TO PLAY & CONTROLS GUIDE"
	btn_guide.custom_minimum_size = Vector2(0, 44)
	btn_guide.pressed.connect(_open_guide_modal)
	left_vbox.add_child(btn_guide)

	var btn_reset := Button.new()
	btn_reset.text = "↺  Reset Saved Profile & Start Fresh"
	btn_reset.pressed.connect(_on_reset_profile)
	left_vbox.add_child(btn_reset)

	# Right Column: Lore & Feature Highlights
	var right_panel := PanelContainer.new()
	right_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var r_style := StyleBoxFlat.new()
	r_style.bg_color = Color(0.06, 0.10, 0.18, 0.75)
	r_style.border_color = Color(0.20, 0.35, 0.52)
	r_style.set_border_width_all(1)
	r_style.set_corner_radius_all(8)
	r_style.set_content_margin_all(18)
	right_panel.add_theme_stylebox_override("panel", r_style)
	mid_split.add_child(right_panel)

	var right_vbox := VBoxContainer.new()
	right_vbox.add_theme_constant_override("separation", 12)
	right_panel.add_child(right_vbox)

	var feature_title := Label.new()
	feature_title.text = "CONVERGENCE DUELS FEATURES"
	feature_title.add_theme_font_size_override("font_size", 16)
	feature_title.add_theme_color_override("font_color", Color(0.95, 0.78, 0.35))
	right_vbox.add_child(feature_title)

	var feature_text := RichTextLabel.new()
	feature_text.size_flags_vertical = Control.SIZE_EXPAND_FILL
	feature_text.bbcode_enabled = true
	feature_text.text = """[color=#aaccff][b]3-Lane Tabletop Combat[/b][/color]
Three distinct lanes: Left, Center, and Right. Each lane holds 1 Front slot (Vanguard) and 1 Rear slot (Support). Front units protect Rear units from normal attacks.

[color=#66eebb][b]Runic Lane Resonate[/b][/color]
Controlling 2 or more lanes at the end of your turn activates [b]Resonate[/b], empowering faction abilities and unleashing devastating combo triggers.

[color=#ffcc66][b]Lumenport City & Enterable Interiors[/b][/color]
Explore the 3D harbor capital of the realm with isometric camera navigation, day-night cycle, 16 scheduled NPCs with branching dialogue, and full interior exploration.

[color=#ff99bb][b]Authoritative Rust Rules Engine[/b][/color]
100% deterministic combat, legal deck validation (40 cards, 4-tier rarity limits), and transactional economy progression."""
	right_vbox.add_child(feature_text)

	# Footer Status
	var footer := Label.new()
	footer.text = "Godot 4.3 Stable Client • Authoritative Rust Convergence Engine • 640 Canonical Cards • 16 Starter Decks"
	footer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	footer.add_theme_color_override("font_color", Color(0.45, 0.55, 0.68))
	main_vbox.add_child(footer)

	_build_character_selection_modal()
	_build_guide_modal()

func _build_character_selection_modal() -> void:
	character_modal = PanelContainer.new()
	character_modal.set_anchors_preset(Control.PRESET_FULL_RECT)
	var modal_bg := StyleBoxFlat.new()
	modal_bg.bg_color = Color(0.03, 0.05, 0.09, 0.92)
	modal_bg.set_content_margin_all(50)
	character_modal.add_theme_stylebox_override("panel", modal_bg)
	character_modal.visible = false
	add_child(character_modal)

	var modal_vbox := VBoxContainer.new()
	modal_vbox.add_theme_constant_override("separation", 20)
	character_modal.add_child(modal_vbox)

	var m_title := Label.new()
	m_title.text = "CHOOSE YOUR DUELIST & STARTING ARCHETYPE"
	m_title.add_theme_font_size_override("font_size", 24)
	m_title.add_theme_color_override("font_color", Color(0.96, 0.85, 0.45))
	modal_vbox.add_child(m_title)

	var cards_hbox := HBoxContainer.new()
	cards_hbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	cards_hbox.add_theme_constant_override("separation", 16)
	modal_vbox.add_child(cards_hbox)

	for i in range(HERO_ROSTER.size()):
		var hero: Dictionary = HERO_ROSTER[i]
		var card_btn := PanelContainer.new()
		card_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var c_style := StyleBoxFlat.new()
		c_style.bg_color = Color(0.08, 0.12, 0.20)
		c_style.border_color = hero["color"]
		c_style.set_border_width_all(2)
		c_style.set_corner_radius_all(8)
		c_style.set_content_margin_all(14)
		card_btn.add_theme_stylebox_override("panel", c_style)
		cards_hbox.add_child(card_btn)

		var cvbox := VBoxContainer.new()
		cvbox.add_theme_constant_override("separation", 8)
		card_btn.add_child(cvbox)

		var icon := Label.new()
		icon.text = hero["avatar_symbol"]
		icon.add_theme_font_size_override("font_size", 32)
		icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		icon.add_theme_color_override("font_color", hero["color"])
		cvbox.add_child(icon)

		var hname := Label.new()
		hname.text = hero["name"]
		hname.add_theme_font_size_override("font_size", 16)
		hname.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		cvbox.add_child(hname)

		var htitle := Label.new()
		htitle.text = hero["title"]
		htitle.add_theme_font_size_override("font_size", 11)
		htitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		htitle.add_theme_color_override("font_color", Color(0.65, 0.75, 0.88))
		cvbox.add_child(htitle)

		var factions_lbl := Label.new()
		factions_lbl.text = "Factions: " + ", ".join(hero["factions"]).capitalize()
		factions_lbl.add_theme_font_size_override("font_size", 11)
		factions_lbl.add_theme_color_override("font_color", hero["color"])
		cvbox.add_child(factions_lbl)

		var hdesc := Label.new()
		hdesc.text = hero["description"]
		hdesc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		hdesc.size_flags_vertical = Control.SIZE_EXPAND_FILL
		hdesc.add_theme_font_size_override("font_size", 11)
		cvbox.add_child(hdesc)

		var hstyle := Label.new()
		hstyle.text = "Style: " + hero["favored_playstyle"]
		hstyle.add_theme_font_size_override("font_size", 11)
		hstyle.add_theme_color_override("font_color", Color(0.35, 0.88, 1.0))
		cvbox.add_child(hstyle)

		var select_btn := Button.new()
		select_btn.text = "Select " + hero["name"].split(" ")[0]
		var idx := i
		select_btn.pressed.connect(func(): _select_hero(idx))
		cvbox.add_child(select_btn)

	var bottom_hbox := HBoxContainer.new()
	modal_vbox.add_child(bottom_hbox)

	var close_btn := Button.new()
	close_btn.text = "Confirm & Close"
	close_btn.custom_minimum_size = Vector2(160, 40)
	close_btn.pressed.connect(func(): character_modal.visible = false)
	bottom_hbox.add_child(close_btn)

func _build_guide_modal() -> void:
	guide_modal = PanelContainer.new()
	guide_modal.set_anchors_preset(Control.PRESET_FULL_RECT)
	var modal_bg := StyleBoxFlat.new()
	modal_bg.bg_color = Color(0.04, 0.06, 0.11, 0.94)
	modal_bg.set_content_margin_all(50)
	guide_modal.add_theme_stylebox_override("panel", modal_bg)
	guide_modal.visible = false
	add_child(guide_modal)

	var g_vbox := VBoxContainer.new()
	g_vbox.add_theme_constant_override("separation", 16)
	guide_modal.add_child(g_vbox)

	var g_title := Label.new()
	g_title.text = "HEARTHGLASS: HOW TO PLAY & CONTROLS GUIDE"
	g_title.add_theme_font_size_override("font_size", 22)
	g_title.add_theme_color_override("font_color", Color(0.96, 0.85, 0.45))
	g_vbox.add_child(g_title)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	g_vbox.add_child(scroll)

	var content := RichTextLabel.new()
	content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content.bbcode_enabled = true
	content.text = """[b][size=16]Controls & Keybindings[/size][/b]
• [color=#ffcc66]W, A, S, D / Arrow Keys[/color]: Walk and navigate isometric Lumenport.
• [color=#ffcc66]Q / E[/color]: Rotate isometric camera by 90 degrees around your duelist.
• [color=#ffcc66]Mouse Scroll Wheel[/color]: Zoom camera in and out.
• [color=#ffcc66]E / Spacebar / Click[/color]: Interact with nearby NPCs, open dialogue, and enter interiors.
• [color=#ffcc66]J Key[/color]: Open Quest Journal to view active Act I objectives.
• [color=#ffcc66]B Key[/color]: Open Resonance Emporium, Deck Builder, and Collection Browser.
• [color=#ffcc66]Escape[/color]: Close active overlay or return to Main Menu.

[b][size=16]Convergence Duels Combat Rules[/size][/b]
• [b]3 Lanes & 2 Ranks[/b]: Each lane has 1 Front (Vanguard) slot and 1 Rear (Support) slot.
• [b]Guard Mechanic[/b]: Front-row units protect Rear-row units in the same lane unless the attacker has the [color=#66eebb]Reach[/color] keyword.
• [b]Direct Attacks[/b]: You may attack the opposing Leader directly only when the defending lane is clear of enemy units.
• [b]Lane Resonate[/b]: Control 2 or more lanes at the end of your turn to activate [color=#ffdd44]Resonate[/color], triggering powerful faction bonuses!
• [b]Victory Condition[/b]: Reduce opposing Leader's Vitality to 0 (30 Vitality in 1v1, 45 Shared Vitality in 2v2 Tag)."""
	scroll.add_child(content)

	var close_g := Button.new()
	close_g.text = "Back to Menu"
	close_g.custom_minimum_size = Vector2(160, 40)
	close_g.pressed.connect(func(): guide_modal.visible = false)
	g_vbox.add_child(close_g)

func _open_character_modal() -> void:
	character_modal.visible = true

func _open_guide_modal() -> void:
	guide_modal.visible = true

func _select_hero(idx: int) -> void:
	current_hero_idx = idx
	var hero: Dictionary = HERO_ROSTER[idx]
	GameState.player_name = hero["name"]
	GameState.active_deck_id = hero["deck_id"]
	GameState.save_local_profile()
	_update_hero_display()
	character_modal.visible = false

func _update_hero_display() -> void:
	var hero: Dictionary = HERO_ROSTER[current_hero_idx]
	current_hero_summary_label.text = "Active Duelist: %s (%s)  |  Starting Deck: %s  |  Wallet: %d Crowns, %d Dust" % [
		hero["name"],
		hero["title"],
		hero["deck_id"],
		GameState.crowns,
		GameState.echo_dust
	]

func _on_explore_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/world/lumenport_hub.tscn")

func _on_duel_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/battle/tabletop_arena.tscn")

func _on_shop_pressed() -> void:
	get_tree().change_scene_to_file("res://scenes/ui/deck_builder.tscn")

func _on_reset_profile() -> void:
	GameState.crowns = 1200
	GameState.echo_dust = 500
	GameState.quest_states = {}
	GameState.claimed_matches = {}
	GameState.save_local_profile()
	_update_hero_display()
