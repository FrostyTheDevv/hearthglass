extends Control
## 40-Card Deck Builder, Collection Browser, Crafting Bench, and Resonance Emporium Shop
## Supports strict separation of Offline Campaign Profile vs. Authenticated Online Account,
## interactive card addition/removal, copy-limit & faction restrictions, distinct owned/unowned styling,
## exact Rust validation diagnostics, and safe developer-mode inspection toggles.

const CardFrameWidgetScript := preload("res://scripts/ui/card_frame_widget.gd")

var status_label: Label
var economy_mode_btn: OptionButton
var curve_label: Label
var validation_label: Label
var search_input: LineEdit
var faction_filter: OptionButton
var type_filter: OptionButton
var rarity_filter: OptionButton
var ownership_filter: OptionButton
var cards_list: ItemList
var details_label: RichTextLabel
var card_preview_holder: CenterContainer
var dev_inspect_check: CheckBox

var filtered_cards: Array = []
var selected_card_id: String = "EMB-C-0001"
var current_deck_cards: Array = [] # working copy of active deck card entries

# Deck Management Bar
var deck_selector: OptionButton
var btn_add_to_deck: Button
var btn_remove_from_deck: Button
var btn_save_deck: Button
var deck_summary_label: Label

# Pack Opening Modal
var pack_modal: PanelContainer
var pack_title: Label
var pack_cards_hbox: HBoxContainer
var pack_status_label: Label

func _ready() -> void:
	GameState.wallet_updated.connect(func(_c, _d): _refresh())
	GameState.collection_updated.connect(func(): _populate_cards(); _refresh())

	_load_working_deck()

	var bg := ColorRect.new()
	bg.color = Color(0.05, 0.08, 0.15)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var vbox := VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", 6)
	vbox.offset_left = 12
	vbox.offset_right = -12
	vbox.offset_top = 8
	vbox.offset_bottom = -8
	add_child(vbox)

	# 1. Top Header & Account Mode Bar
	var top := HBoxContainer.new()
	top.add_theme_constant_override("separation", 8)
	vbox.add_child(top)

	status_label = Label.new()
	status_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	status_label.add_theme_font_size_override("font_size", 13)
	top.add_child(status_label)

	var mode_label := Label.new()
	mode_label.text = "Account Economy:"
	mode_label.add_theme_font_size_override("font_size", 12)
	top.add_child(mode_label)

	economy_mode_btn = OptionButton.new()
	economy_mode_btn.add_item("Offline Campaign Profile", 0)
	economy_mode_btn.add_item("Authenticated Online Account", 1)
	economy_mode_btn.selected = 1 if GameState.account_mode == "online" else 0
	economy_mode_btn.item_selected.connect(func(idx: int):
		var mode := "online" if idx == 1 else "offline"
		GameState.set_account_mode(mode)
		_populate_cards()
		_refresh()
	)
	top.add_child(economy_mode_btn)

	var btn_pack_found := Button.new()
	btn_pack_found.text = "✦ Foundations Pack (100c)"
	btn_pack_found.pressed.connect(func(): _on_open_pack("pack_foundations"))
	top.add_child(btn_pack_found)

	var btn_craft := Button.new()
	btn_craft.text = "🔨 Craft Selected (+1)"
	btn_craft.pressed.connect(func(): _on_craft_action("craft"))
	top.add_child(btn_craft)

	var btn_back := Button.new()
	btn_back.text = "Return to Lumenport"
	btn_back.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/world/lumenport_hub.tscn"))
	top.add_child(btn_back)

	# 2. Deck Management Bar
	var deck_bar := HBoxContainer.new()
	deck_bar.add_theme_constant_override("separation", 8)
	vbox.add_child(deck_bar)

	var d_lbl := Label.new()
	d_lbl.text = "Active Deck:"
	d_lbl.add_theme_font_size_override("font_size", 12)
	deck_bar.add_child(d_lbl)

	deck_selector = OptionButton.new()
	_rebuild_deck_selector()
	deck_selector.item_selected.connect(_on_deck_selected)
	deck_bar.add_child(deck_selector)

	btn_add_to_deck = Button.new()
	btn_add_to_deck.text = "+ Add Card to Deck"
	btn_add_to_deck.pressed.connect(_on_add_card_to_deck)
	deck_bar.add_child(btn_add_to_deck)

	btn_remove_from_deck = Button.new()
	btn_remove_from_deck.text = "- Remove Card"
	btn_remove_from_deck.pressed.connect(_on_remove_card_from_deck)
	deck_bar.add_child(btn_remove_from_deck)

	btn_save_deck = Button.new()
	btn_save_deck.text = "💾 Save Deck Configuration"
	btn_save_deck.pressed.connect(_on_save_deck)
	btn_save_deck.add_theme_color_override("font_color", Color(0.4, 0.95, 0.7))
	deck_bar.add_child(btn_save_deck)

	deck_summary_label = Label.new()
	deck_summary_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	deck_summary_label.add_theme_font_size_override("font_size", 12)
	deck_bar.add_child(deck_summary_label)

	# 3. Filter & Aether Curve Bar
	var filter_bar := HBoxContainer.new()
	filter_bar.add_theme_constant_override("separation", 8)
	vbox.add_child(filter_bar)

	search_input = LineEdit.new()
	search_input.placeholder_text = "Search cards by name, keyword, subtype..."
	search_input.custom_minimum_size = Vector2(260, 0)
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

	ownership_filter = OptionButton.new()
	ownership_filter.add_item("ALL CARDS")
	ownership_filter.add_item("OWNED ONLY")
	ownership_filter.add_item("UNOWNED ONLY")
	ownership_filter.item_selected.connect(func(_i: int): _populate_cards())
	filter_bar.add_child(ownership_filter)

	curve_label = Label.new()
	curve_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	curve_label.add_theme_font_size_override("font_size", 11)
	curve_label.add_theme_color_override("font_color", Color(0.35, 0.90, 1.0))
	filter_bar.add_child(curve_label)

	dev_inspect_check = CheckBox.new()
	dev_inspect_check.text = "Dev View"
	dev_inspect_check.toggled.connect(func(_b: bool): _display_card_details(GameState.cards_by_id.get(selected_card_id, {})))
	filter_bar.add_child(dev_inspect_check)

	# 4. Main Split: Card List + CardFrameWidget Preview + Details & Validation Inspector
	var split := HBoxContainer.new()
	split.size_flags_vertical = Control.SIZE_EXPAND_FILL
	split.add_theme_constant_override("separation", 12)
	vbox.add_child(split)

	cards_list = ItemList.new()
	cards_list.custom_minimum_size = Vector2(620, 0)
	cards_list.size_flags_vertical = Control.SIZE_EXPAND_FILL
	cards_list.item_selected.connect(_on_card_selected)
	split.add_child(cards_list)

	card_preview_holder = CenterContainer.new()
	card_preview_holder.custom_minimum_size = Vector2(210, 270)
	split.add_child(card_preview_holder)

	var right_vbox := VBoxContainer.new()
	right_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right_vbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	right_vbox.add_theme_constant_override("separation", 8)
	split.add_child(right_vbox)

	var details_panel := PanelContainer.new()
	details_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var dp_style := StyleBoxFlat.new()
	dp_style.bg_color = Color(0.07, 0.11, 0.19)
	dp_style.border_color = Color(0.22, 0.38, 0.55)
	dp_style.set_border_width_all(1)
	dp_style.set_corner_radius_all(6)
	dp_style.set_content_margin_all(10)
	details_panel.add_theme_stylebox_override("panel", dp_style)
	right_vbox.add_child(details_panel)

	details_label = RichTextLabel.new()
	details_label.bbcode_enabled = true
	details_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	details_panel.add_child(details_label)

	var val_panel := PanelContainer.new()
	val_panel.custom_minimum_size = Vector2(0, 100)
	var vp_style := StyleBoxFlat.new()
	vp_style.bg_color = Color(0.05, 0.08, 0.14)
	vp_style.border_color = Color(0.25, 0.40, 0.60)
	vp_style.set_border_width_all(1)
	vp_style.set_corner_radius_all(6)
	vp_style.set_content_margin_all(8)
	val_panel.add_theme_stylebox_override("panel", vp_style)
	right_vbox.add_child(val_panel)

	validation_label = Label.new()
	validation_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	validation_label.add_theme_font_size_override("font_size", 11)
	val_panel.add_child(validation_label)

	_build_pack_opening_modal()

	_populate_cards()
	_refresh()
	if filtered_cards.size() > 0:
		_on_card_selected(0)

func _load_working_deck() -> void:
	var active_deck := GameState.get_active_deck()
	current_deck_cards = active_deck.get("cards", []).duplicate(true)

func _rebuild_deck_selector() -> void:
	deck_selector.clear()
	for i in range(GameState.starter_decks.size()):
		var d: Dictionary = GameState.starter_decks[i]
		deck_selector.add_item("%s (%s)" % [str(d.get("name", "")), ", ".join(d.get("factions", []))], i)
		if str(d.get("id", "")) == GameState.active_deck_id:
			deck_selector.selected = i

func _on_deck_selected(idx: int) -> void:
	if idx >= 0 and idx < GameState.starter_decks.size():
		var chosen: Dictionary = GameState.starter_decks[idx]
		GameState.active_deck_id = str(chosen.get("id", ""))
		GameState.save_local_profile()
		_load_working_deck()
		_refresh()

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
	pvbox.add_theme_constant_override("separation", 18)
	pack_modal.add_child(pvbox)

	pack_title = Label.new()
	pack_title.text = "✦ RESONANCE EMPORIUM: PACK OPENING REVEAL ✦"
	pack_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	pack_title.add_theme_font_size_override("font_size", 22)
	pack_title.add_theme_color_override("font_color", Color(0.96, 0.85, 0.40))
	pvbox.add_child(pack_title)

	pack_status_label = Label.new()
	pack_status_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	pack_status_label.add_theme_font_size_override("font_size", 13)
	pack_status_label.add_theme_color_override("font_color", Color(0.40, 0.90, 1.0))
	pvbox.add_child(pack_status_label)

	pack_cards_hbox = HBoxContainer.new()
	pack_cards_hbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	pack_cards_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	pack_cards_hbox.add_theme_constant_override("separation", 14)
	pvbox.add_child(pack_cards_hbox)

	var btn_close := Button.new()
	btn_close.text = "Claim Cards & Return to Collection"
	btn_close.custom_minimum_size = Vector2(240, 42)
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
	var o_sel := ownership_filter.get_item_text(ownership_filter.selected).to_upper() if ownership_filter else "ALL CARDS"

	for c in GameState.all_cards:
		var cid := str(c.get("id", ""))
		if cid == "":
			continue
		var owned: int = int(GameState.collection.get(cid, 0))
		if o_sel == "OWNED ONLY" and owned <= 0:
			continue
		if o_sel == "UNOWNED ONLY" and owned > 0:
			continue
		if f_sel != "all" and str(c.get("faction", "")) != f_sel:
			continue
		if t_sel != "all" and str(c.get("type", "")) != t_sel:
			continue
		if r_sel != "all rarities" and str(c.get("rarity", "")).to_lower() != r_sel:
			continue
		if q != "":
			var hay := "%s %s %s %s %s" % [
				cid,
				str(c.get("name", "")),
				str(c.get("description", "")),
				str(c.get("subtype", "")),
				", ".join(c.get("keywords", []))
			]
			if not hay.to_lower().contains(q):
				continue

		filtered_cards.append(c)
		var item_idx := cards_list.add_item("[%s] %s (%s • %s • %s) — Cost %d⚡ | %s" % [
			cid,
			str(c.get("name", "")),
			str(c.get("faction", "")).capitalize(),
			str(c.get("type", "")).capitalize(),
			str(c.get("rarity", "")).to_upper(),
			int(c.get("cost", 0)),
			("Owned: x%d" % owned) if owned > 0 else "[UNOWNED]"
		])

		# Distinct Owned vs Unowned visual styling
		if owned > 0:
			cards_list.set_item_custom_fg_color(item_idx, Color(0.85, 0.95, 1.0))
		else:
			cards_list.set_item_custom_fg_color(item_idx, Color(0.55, 0.58, 0.65))

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

	_display_card_details(c)

func _display_card_details(c: Dictionary) -> void:
	if c.is_empty():
		return

	var iden: Dictionary = c.get("identity", {})
	var meta: Dictionary = c.get("gameplay_metadata", {})
	var art: Dictionary = c.get("art", {})
	var owned: int = int(GameState.collection.get(c.get("id", ""), 0))
	var copies_in_deck: int = _get_card_count_in_working_deck(str(c.get("id", "")))

	var dev_section := ""
	if dev_inspect_check and dev_inspect_check.button_pressed:
		dev_section = """\n\n[color=#ffaa55][b]Developer Inspection Mode:[/b][/color]
[b]Art Prompt:[/b] %s
[b]Asset Target:[/b] %s""" % [
			str(art.get("prompt", "Canonical concept art")),
			str(art.get("master_svg", "content/art/masters"))
		]

	details_label.text = """[size=17][b]%s[/b] (%s)[/size]
[color=#66eebb]Faction: %s[/color] | [color=#ffcc66]Rarity: %s[/color] | Type: %s (%s)
[b]Aether Cost:[/b] %d⚡ | [b]Combat Stats:[/b] %d ⚔ ATK / %d ♥ HP
[b]Keywords:[/b] %s | [b]In Active Deck:[/b] %d/3 copies
[b]Ownership Status:[/b] %s

[b]Gameplay Ability:[/b]
%s

[b]World Origin:[/b]
%s

[b]Collection Lore:[/b]
%s%s""" % [
		c.get("name", ""),
		c.get("id", ""),
		str(c.get("faction", "")).capitalize(),
		str(c.get("rarity", "")).to_upper(),
		str(c.get("type", "")).capitalize(),
		str(c.get("subtype", "core")),
		int(c.get("cost", 0)),
		int(c.get("attack", 0)),
		int(c.get("health", 0)),
		", ".join(c.get("keywords", [])),
		copies_in_deck,
		("[color=#44ff88]Owned: x%d[/color]" % owned) if owned > 0 else "[color=#ff6666]UNOWNED[/color]",
		c.get("description", ""),
		str(iden.get("origin", "Lumenport")),
		str(iden.get("collection_biography", c.get("lore", ""))),
		dev_section
	]

func _get_card_count_in_working_deck(card_id: String) -> int:
	for entry in current_deck_cards:
		if str(entry.get("card_id", "")) == card_id:
			return int(entry.get("count", 0))
	return 0

func _on_add_card_to_deck() -> void:
	var c: Dictionary = GameState.cards_by_id.get(selected_card_id, {})
	if c.is_empty():
		return

	# Copy limit restriction
	var cur_count := _get_card_count_in_working_deck(selected_card_id)
	var is_legendary := str(c.get("rarity", "")).to_lower() == "legendary"
	var max_copies := 1 if is_legendary else 3
	if cur_count >= max_copies:
		validation_label.text = "Copy Limit: Cannot include more than %dx copies of %s (%s)." % [
			max_copies,
			c.get("name", ""),
			"Legendary limit" if is_legendary else "Standard limit"
		]
		return

	# Faction restriction: Max 2 factions (plus Neutral)
	var card_faction := str(c.get("faction", "neutral")).to_lower()
	if card_faction != "neutral":
		var current_factions := _get_deck_factions()
		if not current_factions.has(card_faction) and current_factions.size() >= 2:
			validation_label.text = "Faction Restriction: Decks can have at most 2 factions. Current: [%s]. Cannot add %s card." % [
				", ".join(current_factions),
				card_faction.capitalize()
			]
			return

	# Add or increment in working copy
	var found := false
	for entry in current_deck_cards:
		if str(entry.get("card_id", "")) == selected_card_id:
			entry["count"] = int(entry.get("count", 0)) + 1
			found = true
			break
	if not found:
		current_deck_cards.append({"card_id": selected_card_id, "count": 1})

	_display_card_details(c)
	_refresh()

func _on_remove_card_from_deck() -> void:
	for i in range(current_deck_cards.size()):
		if str(current_deck_cards[i].get("card_id", "")) == selected_card_id:
			var cur := int(current_deck_cards[i].get("count", 0))
			if cur > 1:
				current_deck_cards[i]["count"] = cur - 1
			else:
				current_deck_cards.remove_at(i)
			break
	var c: Dictionary = GameState.cards_by_id.get(selected_card_id, {})
	_display_card_details(c)
	_refresh()

func _get_deck_factions() -> Array[String]:
	var facs: Array[String] = []
	for entry in current_deck_cards:
		var cid: String = str(entry.get("card_id", ""))
		var c: Dictionary = GameState.cards_by_id.get(cid, {})
		var f := str(c.get("faction", "")).to_lower()
		if f != "" and f != "neutral" and not facs.has(f):
			facs.append(f)
	return facs

func _on_save_deck() -> void:
	var total := 0
	for entry in current_deck_cards:
		total += int(entry.get("count", 0))

	# Online verification: prevent online submission with unowned cards
	if GameState.account_mode == "online":
		var missing: Array[String] = []
		for entry in current_deck_cards:
			var cid: String = str(entry.get("card_id", ""))
			var needed: int = int(entry.get("count", 0))
			var owned: int = int(GameState.online_collection.get(cid, 0))
			if owned < needed:
				missing.append("%s (Needs %d, Owned %d)" % [cid, needed, owned])
		if missing.size() > 0:
			validation_label.text = "Online Deck Submission Error: Deck contains unowned cards:\n- " + "\n- ".join(missing)
			return

	# Update active starter/custom deck in GameState
	var active_deck := GameState.get_active_deck()
	active_deck["cards"] = current_deck_cards.duplicate(true)
	active_deck["factions"] = _get_deck_factions()
	active_deck["total_cards"] = total
	GameState.save_local_profile()

	# Post to server if online
	if GameState.account_mode == "online":
		_save_deck_to_server(active_deck)
	else:
		validation_label.text = "Saved custom deck locally to offline campaign profile! Total cards: %d/40" % total
	_refresh()

func _save_deck_to_server(deck: Dictionary) -> void:
	var http := HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(_r: int, code: int, _h: PackedStringArray, body: PackedByteArray):
		http.queue_free()
		if code == 200 or code == 201:
			validation_label.text = "Deck successfully validated and synchronized to PostgreSQL online account!"
		else:
			var err_text := body.get_string_from_utf8()
			validation_label.text = "Server save warning (Status %d): %s. Local deck edits preserved." % [code, err_text]
	)
	var headers := PackedStringArray(["Content-Type: application/json"])
	if GameState.auth_token != "":
		headers.append("Authorization: Bearer " + GameState.auth_token)
	var err := http.request(GameState.api_base_url + "/v1/decks", headers, HTTPClient.METHOD_POST, JSON.stringify(deck))
	if err != OK:
		validation_label.text = "Network warning: Unable to dispatch deck to server. Working deck preserved locally."

func _on_open_pack(pack_id: String = "pack_foundations") -> void:
	if GameState.account_mode == "online":
		_open_pack_online(pack_id)
	else:
		_open_pack_offline(pack_id)

func _open_pack_offline(pack_id: String) -> void:
	var result := GameState.purchase_pack_offline(pack_id)
	if not result.get("success", false):
		details_label.text = "[color=#ff5555]%s[/color]" % result.get("error", "Purchase failed.")
		return

	_animate_pack_reveal(result.get("cards", []), pack_id, false)

func _open_pack_online(pack_id: String) -> void:
	# Requires authenticated server response; never fabricates cards locally
	var result := GameState.purchase_pack_online(pack_id)
	if not result.get("success", false):
		details_label.text = "[color=#ff5555]Online Purchase Error: %s[/color]" % result.get("error", "Server rejected transaction.")
		return

	_animate_pack_reveal(result.get("cards", []), pack_id, true)

func _animate_pack_reveal(card_list: Array, pack_id: String, is_online: bool) -> void:
	for child in pack_cards_hbox.get_children():
		child.queue_free()

	for item in card_list:
		var c_def: Dictionary = item if typeof(item) == TYPE_DICTIONARY else GameState.cards_by_id.get(str(item), {})
		var w: PanelContainer = CardFrameWidgetScript.new()
		w.setup_card(c_def, false)
		pack_cards_hbox.add_child(w)

	SoundManager.play_pack_reveal()
	pack_status_label.text = "Opened %s [%s]! Added 5 cards to your ledger." % [
		pack_id,
		"Online Authenticated Account" if is_online else "Offline Campaign Profile"
	]
	pack_modal.visible = true
	_populate_cards()
	_refresh()

func _on_craft_action(action: String = "craft") -> void:
	if GameState.account_mode == "online":
		var res := GameState.craft_card_online(selected_card_id, action)
		if not res.get("success", false):
			details_label.text = "[color=#ff5555]Online Crafting Error: %s[/color]" % res.get("error", "Failed")
			return
		SoundManager.play_button_click()
		details_label.text = "Online Craft Success: %s! Quantity: %d" % [selected_card_id, res.get("new_quantity", 1)]
	else:
		var res := GameState.craft_card_offline(selected_card_id)
		if not res.get("success", false):
			details_label.text = "[color=#ff5555]Offline Crafting Error: %s[/color]" % res.get("error", "Failed")
			return
		SoundManager.play_button_click()
		details_label.text = "Offline Craft Success: %s! Quantity: %d" % [selected_card_id, res.get("new_quantity", 1)]

	_populate_cards()
	_refresh()

func _refresh() -> void:
	var total_loaded := GameState.all_cards.size()
	var unique_owned := 0
	for cid in GameState.collection.keys():
		if int(GameState.collection[cid]) > 0:
			unique_owned += 1

	status_label.text = "Catalogue: %d Loaded Cards | Owned: %d Unique | %s Wallet: %d Crowns, %d Dust" % [
		total_loaded,
		unique_owned,
		GameState.account_mode.capitalize(),
		GameState.crowns,
		GameState.echo_dust
	]

	var active_deck := GameState.get_active_deck()
	var temp_deck := active_deck.duplicate(true)
	temp_deck["cards"] = current_deck_cards

	var val := ConvergenceRules.validate_deck(temp_deck, GameState.cards_by_id)
	var deck_total: int = int(val.get("total_cards", 0))

	if val.get("valid", false):
		validation_label.text = "Rust Rules Authority: LEGAL 40-CARD DECK (Valid for Convergence Duels)"
		validation_label.add_theme_color_override("font_color", Color(0.35, 1.0, 0.7))
	else:
		var errs: Array = val.get("errors", [])
		validation_label.text = "Rust Deck Validation Failures (%d/40 cards):\n• %s" % [
			deck_total,
			"\n• ".join(errs)
		]
		validation_label.add_theme_color_override("font_color", Color(1.0, 0.45, 0.45))

	deck_summary_label.text = "%d/40 Cards | Factions: [%s]" % [
		deck_total,
		", ".join(_get_deck_factions()).capitalize()
	]

	# Calculate and display Aether Curve
	var buckets := [0, 0, 0, 0, 0, 0, 0]
	for entry in current_deck_cards:
		var cid: String = str(entry.get("card_id", ""))
		var c: Dictionary = GameState.cards_by_id.get(cid, {})
		var cost_idx := clampi(int(c.get("cost", 1)) - 1, 0, 6)
		buckets[cost_idx] += int(entry.get("count", 0))

	if curve_label:
		curve_label.text = "Aether Curve: [1⚡:%d] [2⚡:%d] [3⚡:%d] [4⚡:%d] [5⚡:%d] [6⚡:%d] [7+⚡:%d]" % [
			buckets[0], buckets[1], buckets[2], buckets[3], buckets[4], buckets[5], buckets[6]
		]
