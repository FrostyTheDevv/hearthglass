extends PanelContainer
class_name CardFrameWidget
## Reusable Data-Driven Card Frame Renderer for Godot 4 (Section 8)
## Renders Creatures, Tactics, Relics, and Environments directly from canonical card definitions.
## Never relies on text or numbers baked into the illustration: loads pure illustration artwork
## from `res://assets/cards/<id>.svg` (or `.png`/`.webp`) and dynamically renders canonical Name, Aether Cost,
## Attack, Health, Type, Rarity, Faction border, Keywords, and Ability description.

signal card_clicked(card_data: Dictionary)

var card_data: Dictionary = {}
var is_selected: bool = false

const FACTION_BORDER_COLORS := {
	"emberclad": Color(1.0, 0.38, 0.22),
	"verdant_pact": Color(0.22, 0.85, 0.49),
	"iron_choir": Color(0.84, 0.64, 0.34),
	"tidebound": Color(0.15, 0.82, 0.81),
	"glassborne": Color(0.75, 0.52, 0.99),
	"nocturne": Color(0.51, 0.55, 0.97),
	"starweave": Color(0.98, 0.75, 0.14),
	"gravewild": Color(0.64, 0.90, 0.21),
	"neutral": Color(0.58, 0.64, 0.72)
}

const RARITY_COLORS := {
	"common": Color(0.75, 0.80, 0.88),
	"uncommon": Color(0.35, 0.92, 0.65),
	"rare": Color(0.38, 0.72, 1.0),
	"legendary": Color(1.0, 0.82, 0.25)
}

func setup_card(def: Dictionary, selected: bool = false) -> void:
	card_data = def
	is_selected = selected
	_rebuild_visuals()

func _ready() -> void:
	custom_minimum_size = Vector2(186, 240)
	if not card_data.is_empty():
		_rebuild_visuals()

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		card_clicked.emit(card_data)

func _rebuild_visuals() -> void:
	for child in get_children():
		child.queue_free()

	var faction: String = str(card_data.get("faction", "neutral"))
	var rarity: String = str(card_data.get("rarity", "common"))
	var ctype: String = str(card_data.get("type", "creature"))
	var border_col: Color = FACTION_BORDER_COLORS.get(faction, Color(0.6, 0.6, 0.6))
	if is_selected:
		border_col = Color(0.30, 0.88, 1.0)

	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.08, 0.13, 0.24)
	style.border_color = border_col
	style.set_border_width_all(3 if is_selected else 2)
	style.set_corner_radius_all(8)
	style.set_content_margin_all(7)
	add_theme_stylebox_override("panel", style)

	var root_vbox := VBoxContainer.new()
	root_vbox.add_theme_constant_override("separation", 4)
	add_child(root_vbox)

	# 1. Header Bar: Name + Aether Cost Gem
	var header_hbox := HBoxContainer.new()
	root_vbox.add_child(header_hbox)

	var name_lbl := Label.new()
	name_lbl.text = str(card_data.get("name", card_data.get("id", "Card")))
	name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	name_lbl.clip_text = true
	name_lbl.add_theme_font_size_override("font_size", 13)
	name_lbl.add_theme_color_override("font_color", Color(0.97, 0.98, 1.0))
	header_hbox.add_child(name_lbl)

	var cost_lbl := Label.new()
	cost_lbl.text = " %d ⚡ " % int(card_data.get("cost", 0))
	cost_lbl.add_theme_font_size_override("font_size", 13)
	cost_lbl.add_theme_color_override("font_color", Color(0.30, 0.88, 1.0))
	header_hbox.add_child(cost_lbl)

	# 2. Pure Illustration Art Window (Supports PNG, WebP, JPEG, SVG)
	var art_holder := PanelContainer.new()
	art_holder.custom_minimum_size = Vector2(168, 92)
	var art_style := StyleBoxFlat.new()
	art_style.bg_color = border_col.darkened(0.72)
	art_style.border_color = border_col.darkened(0.25)
	art_style.set_border_width_all(1)
	art_style.set_corner_radius_all(5)
	art_holder.add_theme_stylebox_override("panel", art_style)
	root_vbox.add_child(art_holder)

	var cid: String = str(card_data.get("id", ""))
	var tex_loaded := false
	var exts: Array[String] = [".png", ".webp", ".jpg", ".jpeg", ".svg"]
	var search_paths: Array[String] = []
	for ext in exts:
		search_paths.append("res://assets/cards/%s%s" % [cid, ext])
		search_paths.append("res://assets/cards/%s%s" % [cid.to_lower(), ext])

	for candidate_path in search_paths:
		var abs_path := ProjectSettings.globalize_path(candidate_path)
		if FileAccess.file_exists(abs_path):
			var img := Image.new()
			var err := img.load(abs_path)
			if err == OK:
				var tex := ImageTexture.create_from_image(img)
				var tex_rect := TextureRect.new()
				tex_rect.name = "ArtTextureRect"
				tex_rect.texture = tex
				tex_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
				tex_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
				tex_rect.custom_minimum_size = Vector2(168, 92)
				art_holder.add_child(tex_rect)
				tex_loaded = true
				break

	if not tex_loaded:
		var fallback_lbl := Label.new()
		fallback_lbl.text = "[%s]\n%s" % [
			faction.replace("_", " ").to_upper(),
			str(card_data.get("art", {}).get("subject", card_data.get("name", "")))
		]
		fallback_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		fallback_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		fallback_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		fallback_lbl.add_theme_font_size_override("font_size", 10)
		fallback_lbl.add_theme_color_override("font_color", Color(0.82, 0.88, 0.96))
		art_holder.add_child(fallback_lbl)

	# 3. Type, Subtype & Rarity Bar
	var type_hbox := HBoxContainer.new()
	root_vbox.add_child(type_hbox)

	var type_lbl := Label.new()
	var subtype_str: String = str(card_data.get("subtype", ""))
	type_lbl.text = "%s%s" % [ctype.capitalize(), (" • " + subtype_str.capitalize()) if subtype_str != "" else ""]
	type_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	type_lbl.add_theme_font_size_override("font_size", 10)
	type_lbl.add_theme_color_override("font_color", border_col.lightened(0.25))
	type_hbox.add_child(type_lbl)

	var rarity_lbl := Label.new()
	rarity_lbl.text = rarity.to_upper()
	rarity_lbl.add_theme_font_size_override("font_size", 10)
	rarity_lbl.add_theme_color_override("font_color", RARITY_COLORS.get(rarity, Color.WHITE))
	type_hbox.add_child(rarity_lbl)

	# 4. Keywords & Canonical Ability Text
	var desc_lbl := Label.new()
	var kws: Array = card_data.get("keywords", [])
	var kw_prefix := ("[" + ", ".join(kws).to_upper() + "] ") if kws.size() > 0 else ""
	desc_lbl.text = kw_prefix + str(card_data.get("description", ""))
	desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	desc_lbl.size_flags_vertical = Control.SIZE_EXPAND_FILL
	desc_lbl.add_theme_font_size_override("font_size", 10)
	desc_lbl.add_theme_color_override("font_color", Color(0.84, 0.90, 0.98))
	root_vbox.add_child(desc_lbl)

	# 5. Live Canonical Combat Stats Footer (Creatures show Attack / Role / Health)
	var footer_hbox := HBoxContainer.new()
	root_vbox.add_child(footer_hbox)

	if ctype == "creature":
		var atk_lbl := Label.new()
		atk_lbl.text = "⚔ ATK %d" % int(card_data.get("attack", 0))
		atk_lbl.add_theme_font_size_override("font_size", 12)
		atk_lbl.add_theme_color_override("font_color", Color(1.0, 0.78, 0.35))
		footer_hbox.add_child(atk_lbl)

		var role_lbl := Label.new()
		role_lbl.text = str(card_data.get("role", "")).capitalize()
		role_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		role_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		role_lbl.add_theme_font_size_override("font_size", 10)
		role_lbl.add_theme_color_override("font_color", Color(0.65, 0.75, 0.88))
		footer_hbox.add_child(role_lbl)

		var hp_lbl := Label.new()
		hp_lbl.text = "♥ HP %d" % int(card_data.get("health", 0))
		hp_lbl.add_theme_font_size_override("font_size", 12)
		hp_lbl.add_theme_color_override("font_color", Color(0.45, 0.98, 0.78))
		footer_hbox.add_child(hp_lbl)
	else:
		var non_creature_lbl := Label.new()
		non_creature_lbl.text = "Click to Cast %s" % ctype.capitalize()
		non_creature_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		non_creature_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		non_creature_lbl.add_theme_font_size_override("font_size", 10)
		non_creature_lbl.add_theme_color_override("font_color", Color(0.30, 0.88, 1.0))
		footer_hbox.add_child(non_creature_lbl)
