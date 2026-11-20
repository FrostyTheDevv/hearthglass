extends Control
## 40-Card Deck Builder, 640-Card Collection Browser, Crafting Bench, and Resonance Emporium Card Shop
## Renders live card previews using data-driven `CardFrameWidget` and persists pack openings,
## crafting, and custom 40-card archetype decks to PostgreSQL / local profile.

const CardFrameWidgetScript := preload("res://scripts/ui/card_frame_widget.gd")

var status_label: Label
var curve_label: Label
var search_input: LineEdit
var faction_filter: OptionButton
var type_filter: OptionButton
var rarity_filter: OptionButton
var cards_list: ItemList
var details_label: RichTextLabel
var card_preview_holder: CenterContainer
var filtered_cards: Array = []
var selected_card_id: String = "EMB-C-0001"

# Pack Opening Modal
var pack_modal: PanelContainer
var pack_title: Label
var pack_cards_hbox: HBoxContainer
var pack_status_label: Label

func _ready() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.05, 0.08, 0.15)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var vbox := VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", 8)
	vbox.offset_left = 12
	vbox.offset_right = -12
	vbox.offset_top = 10
	vbox.offset_bottom = -10
	add_child(vbox)

	# 1. Top Header & Deck Selection Bar
	var top := HBoxContainer.new()
	top.add_theme_constant_override("separation", 10)
	vbox.add_child(top)

	status_label = Label.new()
	status_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	status_label.add_theme_font_size_override("font_size", 13)
	top.add_child(status_label)

	var deck_sel := OptionButton.new()
	for i in range(GameState.starter_decks.size()):
		var d: Dictionary = GameState.starter_decks[i]
		deck_sel.add_item("%s (%s)" % [str(d.get("name", "")), ", ".join(d.get("factions", []))], i)
		if str(d.get("id", "")) == GameState.active_deck_id:
			deck_sel.selected = i
	deck_sel.item_selected.connect(func(idx: int):
		if idx >= 0 and idx < GameState.starter_decks.size():
			var chosen: Dictionary = GameState.starter_decks[idx]
			GameState.active_deck_id = str(chosen.get("id", ""))
			GameState.save_local_profile()
			_save_deck_to_postgres(chosen)
			_refresh()
	)
	top.add_child(deck_sel)

	var btn_pack_found := Button.new()
	btn_pack_found.text = "✦ Open Foundations Pack (100c)"
	btn_pack_found.pressed.connect(func(): _on_open_pack("pack_foundations"))
	top.add_child(btn_pack_found)

	var btn_pack_ember := Button.new()
	btn_pack_ember.text = "🔥 Open Ember/Iron Pack (100c)"
	btn_pack_ember.pressed.connect(func(): _on_open_pack("pack_emberclad"))
	top.add_child(btn_pack_ember)

	var btn_craft := Button.new()
	btn_craft.text = "🔨 Craft Selected (+1)"
	btn_craft.pressed.connect(func(): _on_craft_action("craft"))
	top.add_child(btn_craft)

	var btn_back := Button.new()
	btn_back.text = "Return to Lumenport"
	btn_back.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/world/lumenport_hub.tscn"))
	top.add_child(btn_back)

	# 2. Filter & Cost Curve Bar
	var filter_bar := HBoxContainer.new()
	filter_bar.add_theme_constant_override("separation", 10)
	vbox.add_child(filter_bar)

	search_input = LineEdit.new()
	search_input.placeholder_text = "Search 640 cards by name, keyword, subtype, or lore..."
	search_input.custom_minimum_size = Vector2(300, 0)
	search_input.text_changed.connect(func(_t: String): _populate_cards())
	filter_bar.add_child(search_input)

	faction_filter = OptionButton.new()
	for f in ["all", "emberclad", "verdant_pact", "iron_choir", "tidebound", "glassborne", "nocturne", "starweave", "gravewild", "neutral"]:
		faction_filter.add_item(f.to_upper())
	faction_filter.item_selected.connect(func(_i: int): _populate_cards())
	filter_bar.add_child(faction_filter)

	type_filter = OptionButton.new()
	for t in ["all", "creature", "tactic", "relic", "environment"]:
		type_filter.add_item(t.to_upper())
	type_filter.item_selected.connect(func(_i: int): _populate_cards())
	filter_bar.add_child(type_filter)

	rarity_filter = OptionButton.new()
	for r in ["ALL RARITIES", "COMMON", "UNCOMMON", "RARE", "LEGENDARY"]:
		rarity_filter.add_item(r)
	rarity_filter.item_selected.connect(func(_i: int): _populate_cards())
	filter_bar.add_child(rarity_filter)

	curve_label = Label.new()
	curve_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	curve_label.add_theme_font_size_override("font_size", 12)
	curve_label.add_theme_color_override("font_color", Color(0.35, 0.90, 1.0))
	filter_bar.add_child(curve_label)

	# 3. Main Split: Card List + CardFrameWidget Preview + Biography Inspector
	var split := HBoxContainer.new()
	split.size_flags_vertical = Control.SIZE_EXPAND_FILL
	split.add_theme_constant_override("separation", 14)
	vbox.add_child(split)

	cards_list = ItemList.new()
	cards_list.custom_minimum_size = Vector2(620, 0)
	cards_list.size_flags_vertical = Control.SIZE_EXPAND_FILL
	cards_list.item_selected.connect(_on_card_selected)
	split.add_child(cards_list)

	card_preview_holder = CenterContainer.new()
	card_preview_holder.custom_minimum_size = Vector2(210, 270)
	split.add_child(card_preview_holder)

	var details_panel := PanelContainer.new()
	details_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	details_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var dp_style := StyleBoxFlat.new()
	dp_style.bg_color = Color(0.07, 0.11, 0.19)
	dp_style.border_color = Color(0.22, 0.38, 0.55)
	dp_style.set_border_width_all(1)
	dp_style.set_corner_radius_all(6)
	dp_style.set_content_margin_all(14)
	details_panel.add_theme_stylebox_override("panel", dp_style)
	split.add_child(details_panel)

	details_label = RichTextLabel.new()
	details_label.bbcode_enabled = true
	details_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	details_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	details_panel.add_child(details_label)

	_build_pack_opening_modal()

	_populate_cards()
	_refresh()
	if filtered_cards.size() > 0:
		_on_card_selected(0)

func _build_pack_opening_modal() -> void:
	pack_modal = PanelContainer.new()
	pack_modal.set_anchors_preset(Control.PRESET_FULL_RECT)
	var pm_style := StyleBoxFlat.new()
	pm_style.bg_color = Color(0.03, 0.05, 0.09, 0.96)
	pm_style.set_content_margin_all(40)
	pack_modal.add_theme_stylebox_override("panel", pm_style)
	pack_modal.visible = false
	add_child(pack_modal)

	var pvbox := VBoxContainer.new()
	pvbox.add_theme_constant_override("separation", 20)
	pack_modal.add_child(pvbox)

	pack_title = Label.new()
	pack_title.text = "✦ RESONANCE EMPORIUM: PACK OPENING REVEAL ✦"
	pack_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	pack_title.add_theme_font_size_override("font_size", 24)
	pack_title.add_theme_color_override("font_color", Color(0.96, 0.85, 0.40))
	pvbox.add_child(pack_title)

	pack_status_label = Label.new()
	pack_status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	pack_status_label.add_theme_font_size_override("font_size", 14)
	pack_status_label.add_theme_color_override("font_color", Color(0.40, 0.90, 1.0))
	pvbox.add_child(pack_status_label)

	pack_cards_hbox = HBoxContainer.new()
	pack_cards_hbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	pack_cards_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	pack_cards_hbox.add_theme_constant_override("separation", 16)
	pvbox.add_child(pack_cards_hbox)

	var btn_close := Button.new()
	btn_close.text = "Claim Cards & Return to Collection"
	btn_close.custom_minimum_size = Vector2(240, 44)
	btn_close.pressed.connect(func():
		pack_modal.visible = false
		_populate_cards()
		_refresh()
	)
	pvbox.add_child(btn_close)

func _populate_cards() -> void:
	cards_list.clear()
	filtered_cards.clear()

	var q := search_input.text.strip_edges().to_lower() if search_input else ""
	var f_sel := faction_filter.get_item_text(faction_filter.selected).to_lower() if faction_filter else "all"
	var t_sel := type_filter.get_item_text(type_filter.selected).to_lower() if type_filter else "all"
	var r_sel := rarity_filter.get_item_text(rarity_filter.selected).to_lower() if rarity_filter else "all rarities"

	for c in GameState.all_cards:
		if f_sel != "all" and str(c.get("faction", "")) != f_sel:
			continue
		if t_sel != "all" and str(c.get("type", "")) != t_sel:
			continue
		if r_sel != "all rarities" and str(c.get("rarity", "")).to_lower() != r_sel:
			continue
		if q != "":
			var hay := "%s %s %s %s %s" % [
				str(c.get("id", "")),
				str(c.get("name", "")),
				str(c.get("description", "")),
				str(c.get("subtype", "")),
				", ".join(c.get("keywords", []))
			]
			if not hay.to_lower().contains(q):
				continue

		filtered_cards.append(c)
		var owned: int = int(GameState.collection.get(c["id"], 0))
		cards_list.add_item("[%s] %s (%s • %s • %s) — Cost %d⚡ | Owned: x%d" % [
			c["id"],
			c["name"],
			str(c["faction"]).capitalize(),
			str(c["type"]).capitalize(),
			str(c["rarity"]).to_upper(),
			int(c["cost"]),
			owned
		])

func _on_card_selected(idx: int) -> void:
	if idx < 0 or idx >= filtered_cards.size():
		return
	var c: Dictionary = filtered_cards[idx]
	selected_card_id = str(c.get("id", "EMB-C-0001"))

	for child in card_preview_holder.get_children():
		child.queue_free()
	var frame_widget: PanelContainer = CardFrameWidgetScript.new()
	frame_widget.setup_card(c, true)
	card_preview_holder.add_child(frame_widget)

	var iden: Dictionary = c.get("identity", {})
	var meta: Dictionary = c.get("gameplay_metadata", {})
	var art: Dictionary = c.get("art", {})

	details_label.text = """[size=18][b]%s[/b] (%s)[/size]
[color=#66eebb]Faction: %s[/color] | [color=#ffcc66]Rarity: %s[/color] | Type: %s (%s) | Role: %s
[b]Aether Cost:[/b] %d⚡ | [b]Combat Stats:[/b] %d ⚔ ATK / %d ♥ HP
[b]Keywords:[/b] %s
[b]Archetypes:[/b] %s

[b]Gameplay Ability:[/b]
%s

[b]World Origin:[/b]
%s

[b]Collection Lore:[/b]
%s

[b]Art Prompt & Asset Location:[/b]
%s""" % [
		c.get("name", ""),
		c.get("id", ""),
		str(c.get("faction", "")).capitalize(),
		str(c.get("rarity", "")).to_upper(),
		str(c.get("type", "")).capitalize(),
		str(c.get("subtype", "core")),
		str(c.get("role", "N/A")),
		int(c.get("cost", 0)),
		int(c.get("attack", 0)),
		int(c.get("health", 0)),
		", ".join(c.get("keywords", [])),
		", ".join(meta.get("archetype_membership", [])),
		c.get("description", ""),
		str(iden.get("origin", "")),
		str(iden.get("collection_biography", c.get("lore", ""))),
		str(art.get("prompt", "Canonical Echo concept art"))
	]

func _save_deck_to_postgres(deck: Dictionary) -> void:
	var http := HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(_r: int, _code: int, _h: PackedStringArray, _b: PackedByteArray):
		http.queue_free()
	)
	var headers := PackedStringArray(["Content-Type: application/json"])
	if GameState.auth_token != "":
		headers.append("Authorization: Bearer " + GameState.auth_token)
	http.request(GameState.api_base_url + "/v1/decks", headers, HTTPClient.METHOD_POST, JSON.stringify(deck))

func _on_open_pack(pack_id: String = "pack_foundations") -> void:
	if GameState.crowns < 100:
		details_label.text = "Not enough Crowns (requires 100 Crowns)."
		return

	GameState.crowns -= 100
	GameState.echo_dust += 40

	# Pick 5 random cards from canonical set
	for child in pack_cards_hbox.get_children():
		child.queue_free()

	var pulled: Array[Dictionary] = []
	if GameState.all_cards.size() >= 5:
		for i in range(5):
			var r_idx := randi() % GameState.all_cards.size()
			var c: Dictionary = GameState.all_cards[r_idx]
			pulled.append(c)
			var cid: String = str(c.get("id"))
			GameState.collection[cid] = int(GameState.collection.get(cid, 0)) + 1

			var w: PanelContainer = CardFrameWidgetScript.new()
			w.setup_card(c, false)
			pack_cards_hbox.add_child(w)

	pack_status_label.text = "Purchased %s for 100 Crowns! +40 Echo Dust gained. Added 5 cards to your collection ledger!" % pack_id
	pack_modal.visible = true
	GameState.save_local_profile()
	_refresh()

func _on_craft_action(action: String = "craft") -> void:
	if action == "craft":
		if GameState.echo_dust < 100:
			details_label.text = "Not enough Echo Dust (requires 100 Dust)."
			return
		GameState.echo_dust -= 100
		GameState.collection[selected_card_id] = int(GameState.collection.get(selected_card_id, 0)) + 1
		GameState.save_local_profile()
		details_label.text = "Crafted 1 copy of %s! Owned: x%d | Echo Dust: %d" % [
			selected_card_id,
			int(GameState.collection.get(selected_card_id, 0)),
			GameState.echo_dust
		]
		_populate_cards()
		_refresh()

func _refresh() -> void:
	var active_deck := GameState.get_active_deck()
	var val := ConvergenceRules.validate_deck(active_deck, GameState.cards_by_id)
	status_label.text = "Catalogue: %d/640 Cards (Full Canonical Foundations) | Crowns: %d | Echo Dust: %d | Active Deck: %s (Rust Validated: %s)" % [
		GameState.all_cards.size(),
		GameState.crowns,
		GameState.echo_dust,
		active_deck.get("name", ""),
		"YES" if val.get("valid", false) else "NO"
	]

	var buckets := [0, 0, 0, 0, 0, 0, 0]
	for entry in active_deck.get("cards", []):
		var cid: String = str(entry.get("card_id", ""))
		var c: Dictionary = GameState.cards_by_id.get(cid, {})
		var cost_idx := clampi(int(c.get("cost", 1)) - 1, 0, 6)
		buckets[cost_idx] += int(entry.get("count", 0))

	if curve_label:
		curve_label.text = "Deck Aether Curve: [1⚡:%d] [2⚡:%d] [3⚡:%d] [4⚡:%d] [5⚡:%d] [6⚡:%d] [7+⚡:%d]" % [
			buckets[0], buckets[1], buckets[2], buckets[3], buckets[4], buckets[5], buckets[6]
		]
