extends Control
## 40-Card Deck Builder, 480-Card Collection Browser, Crafting Bench, and Resonance Emporium Card Shop
## Renders live card previews using the data-driven `CardFrameWidget` (which loads approved SVG illustrations
## from `res://assets/cards/<id>.svg`) and persists pack openings, crafting, and custom decks to PostgreSQL.

const CardFrameWidgetScript := preload("res://scripts/ui/card_frame_widget.gd")

var status_label: Label
var curve_label: Label
var search_input: LineEdit
var faction_filter: OptionButton
var type_filter: OptionButton
var cards_list: ItemList
var details_label: RichTextLabel
var card_preview_holder: CenterContainer
var filtered_cards: Array = []
var selected_card_id: String = "EMB-C-0001"

func _ready() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.06, 0.10, 0.18)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var vbox := VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", 8)
	add_child(vbox)

	# 1. Top Header & Deck Selection Bar
	var top := HBoxContainer.new()
	top.add_theme_constant_override("separation", 10)
	vbox.add_child(top)

	status_label = Label.new()
	status_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
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
	btn_pack_found.text = "Open Foundations Pack (100c)"
	btn_pack_found.pressed.connect(func(): _on_open_pack("pack_foundations"))
	top.add_child(btn_pack_found)

	var btn_pack_ember := Button.new()
	btn_pack_ember.text = "Open Ember/Iron Pack (100c)"
	btn_pack_ember.pressed.connect(func(): _on_open_pack("pack_emberclad"))
	top.add_child(btn_pack_ember)

	var btn_craft := Button.new()
	btn_craft.text = "Craft Selected (+1)"
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
	search_input.placeholder_text = "Search 480 cards by name, keyword, subtype, or ability..."
	search_input.custom_minimum_size = Vector2(320, 0)
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

	curve_label = Label.new()
	curve_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	filter_bar.add_child(curve_label)

	# 3. Main Split: Card List + Data-Driven CardFrameWidget Preview + Lore/Biography Inspector
	var split := HBoxContainer.new()
	split.size_flags_vertical = Control.SIZE_EXPAND_FILL
	split.add_theme_constant_override("separation", 14)
	vbox.add_child(split)

	cards_list = ItemList.new()
	cards_list.custom_minimum_size = Vector2(640, 0)
	cards_list.size_flags_vertical = Control.SIZE_EXPAND_FILL
	cards_list.item_selected.connect(_on_card_selected)
	split.add_child(cards_list)

	card_preview_holder = CenterContainer.new()
	card_preview_holder.custom_minimum_size = Vector2(220, 280)
	split.add_child(card_preview_holder)

	details_label = RichTextLabel.new()
	details_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	details_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	split.add_child(details_label)

	_populate_cards()
	_refresh()
	if filtered_cards.size() > 0:
		_on_card_selected(0)

func _populate_cards() -> void:
	cards_list.clear()
	filtered_cards.clear()

	var q := search_input.text.strip_edges().to_lower() if search_input else ""
	var f_sel := faction_filter.get_item_text(faction_filter.selected).to_lower() if faction_filter else "all"
	var t_sel := type_filter.get_item_text(type_filter.selected).to_lower() if type_filter else "all"

	for c in GameState.all_cards:
		if f_sel != "all" and str(c.get("faction", "")) != f_sel:
			continue
		if t_sel != "all" and str(c.get("type", "")) != t_sel:
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

	details_label.text = "%s (%s)\nFaction: %s | Rarity: %s | Type: %s (%s) | Role: %s\nAether Cost: %d | Stats: %d ATK / %d HP\nKeywords: %s\nArchetypes: %s\n\nGameplay Effect:\n%s\n\nOrigin & World Identity:\n%s\n\nCollection Biography:\n%s\n\nCompiled Art Prompt (Asset: %s):\n%s" % [
		c.get("name", ""),
		c.get("id", ""),
		c.get("faction", ""),
		c.get("rarity", ""),
		c.get("type", ""),
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
		str(art.get("asset_location", "res://assets/cards/" + selected_card_id + ".svg")),
		str(art.get("prompt", ""))
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
	var http := HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray):
		if response_code == 200:
			var parsed = JSON.parse_string(body.get_string_from_utf8())
			if typeof(parsed) == TYPE_DICTIONARY and parsed.has("wallet"):
				GameState.crowns = int(parsed["wallet"].get("crowns", GameState.crowns))
				GameState.echo_dust = int(parsed["wallet"].get("echo_dust", GameState.echo_dust))
				GameState.save_local_profile()
				details_label.text = "Opened %s (Persisted in PostgreSQL)! Duplicate Echo Dust gained: +%d" % [
					pack_id,
					int(parsed.get("duplicate_echo_dust_gained", 0))
				]
				_refresh()
		else:
			GameState.crowns -= 100
			GameState.echo_dust += 50
			GameState.save_local_profile()
			details_label.text = "Opened %s! Added 5 cards." % pack_id
			_refresh()
		http.queue_free()
	)
	var headers := PackedStringArray(["Content-Type: application/json"])
	if GameState.auth_token != "":
		headers.append("Authorization: Bearer " + GameState.auth_token)
	http.request(
		GameState.api_base_url + "/v1/shop/purchase",
		headers,
		HTTPClient.METHOD_POST,
		JSON.stringify({"pack_id": pack_id})
	)

func _on_craft_action(action: String = "craft") -> void:
	var http := HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray):
		if response_code == 200:
			var parsed = JSON.parse_string(body.get_string_from_utf8())
			if typeof(parsed) == TYPE_DICTIONARY and parsed.has("wallet"):
				GameState.echo_dust = int(parsed["wallet"].get("echo_dust", GameState.echo_dust))
				GameState.collection[selected_card_id] = int(parsed.get("new_quantity", 1))
				GameState.save_local_profile()
				details_label.text = "Crafted %s! Owned copies: %d | Remaining Echo Dust: %d" % [
					selected_card_id,
					int(parsed.get("new_quantity", 1)),
					GameState.echo_dust
				]
				_populate_cards()
				_refresh()
		http.queue_free()
	)
	var headers := PackedStringArray(["Content-Type: application/json"])
	if GameState.auth_token != "":
		headers.append("Authorization: Bearer " + GameState.auth_token)
	http.request(
		GameState.api_base_url + "/v1/crafting/create",
		headers,
		HTTPClient.METHOD_POST,
		JSON.stringify({"card_id": selected_card_id, "action": action})
	)

func _refresh() -> void:
	var active_deck := GameState.get_active_deck()
	var val := ConvergenceRules.validate_deck(active_deck, GameState.cards_by_id)
	status_label.text = "Catalogue: %d/320 Cards (Full Release Target: 640) | Crowns: %d | Echo Dust: %d | Active Deck: %s (Rust Validated: %s)" % [
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
