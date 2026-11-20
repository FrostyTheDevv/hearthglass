extends Node3D
## Explorable Isometric 3D Lumenport City Hub
## Features:
##  - Architectural fantasy cityscape: Cobblestone streets, canal water, stone buildings with pitched roofs,
##    emissive stained-glass windows, street lanterns with warm OmniLight3D, and the Grand Convergence Amphitheater.
##  - 16 Scheduled NPCs with 3D humanoid stylized models and floating billboard Label3D nameplates.
##  - 6 Enterable Interiors with detailed rooms (Harbor Cafe, Card Shop, Artificer Forge, Training Ring, etc.).
##  - Interactive Branching RPG Dialogue with relationship affinity, lore inquiries, and gifting.
##  - In-game Quest Journal overlay (Hotkey: [J]) tracking Act I objectives, chapters, and rewards.
##  - WASD / Arrow movement with rotation smoothing, 90° Q/E camera rotation, and mouse zoom.
##  - Seamless World-to-Battle transitions preserving authoritative Rust engine state and outcome rewards.

var player_body: CharacterBody3D
var camera_pivot: Node3D
var iso_camera: Camera3D
var sun_light: DirectionalLight3D

var camera_yaw_target: float = 45.0
var camera_size_target: float = 17.5
const MOVE_SPEED := 8.5

var npc_nodes: Array[Dictionary] = []
var interior_markers: Array[Dictionary] = []
var active_prompt_npc: Dictionary = {}
var active_prompt_interior: Dictionary = {}
var is_inside_interior: bool = false
var current_interior_id: String = ""

# UI Elements
var hud_status_label: Label
var minimap_label: Label
var prompt_panel: PanelContainer
var prompt_label: Label

# Overlays
var dialogue_modal: PanelContainer
var dialogue_npc_name: Label
var dialogue_npc_title: Label
var dialogue_body_label: RichTextLabel
var dialogue_rel_bar: ProgressBar
var dialogue_rel_label: Label
var dialogue_options_container: VBoxContainer

var quest_journal_modal: PanelContainer
var quest_list_container: VBoxContainer
var quest_detail_label: RichTextLabel

var interior_panel: PanelContainer
var interior_title: Label
var interior_desc: Label
var interior_room_root: Node3D

func _ready() -> void:
	_build_3d_lumenport_environment()
	_build_isometric_player_and_camera()
	_spawn_lumenport_npcs()
	_spawn_interior_portals()
	_build_world_hud()
	_build_dialogue_modal()
	_build_quest_journal_modal()
	_build_interior_overlay()
	_refresh_hud_text()

# -----------------------------------------------------------------------------
# 1. ARCHITECTURAL 3D LUMENPORT ENVIRONMENT
# -----------------------------------------------------------------------------
func _build_3d_lumenport_environment() -> void:
	# Directional Sunlight / Moonlight
	sun_light = DirectionalLight3D.new()
	sun_light.rotation_degrees = Vector3(-50, 35, 0)
	sun_light.shadow_enabled = true
	sun_light.light_color = Color(1.0, 0.95, 0.86)
	sun_light.light_energy = 1.15
	add_child(sun_light)

	# Main Cobblestone City Ground
	var ground := MeshInstance3D.new()
	var plane := BoxMesh.new()
	plane.size = Vector3(72, 0.6, 72)
	var ground_mat := StandardMaterial3D.new()
	ground_mat.albedo_color = Color(0.18, 0.22, 0.28)
	ground_mat.roughness = 0.85
	plane.material = ground_mat
	ground.mesh = plane
	ground.position = Vector3(0, -0.3, 0)
	add_child(ground)

	# Harbor Canal Water Basin (Teal Shimmering Water)
	var water := MeshInstance3D.new()
	var w_mesh := BoxMesh.new()
	w_mesh.size = Vector3(26, 0.4, 70)
	var w_mat := StandardMaterial3D.new()
	w_mat.albedo_color = Color(0.12, 0.52, 0.62, 0.85)
	w_mat.metallic = 0.35
	w_mat.roughness = 0.15
	w_mesh.material = w_mat
	water.mesh = w_mesh
	water.position = Vector3(-24, -0.15, 0)
	add_child(water)

	# Wooden Boardwalk / Harbor Wharfs
	var dock := MeshInstance3D.new()
	var dock_mesh := BoxMesh.new()
	dock_mesh.size = Vector3(5, 0.7, 50)
	var dock_mat := StandardMaterial3D.new()
	dock_mat.albedo_color = Color(0.38, 0.26, 0.16)
	dock_mesh.material = dock_mat
	dock.mesh = dock_mesh
	dock.position = Vector3(-13.5, 0.05, 0)
	add_child(dock)

	# Central Duelist Plaza Amphitheater (Stepped Octagon with Glowing Aether Spire)
	_build_duelist_amphitheater(Vector3(0, 0, 0))

	# Architectural City Buildings (Pitched Roofs, Arched Facades, Chimneys, Glowing Windows)
	# 1. Arrival Square & Harbor Cafe
	_create_fantasy_building(
		Vector3(-10, 0, 12),
		Vector3(8, 5, 7),
		Color(0.28, 0.55, 0.52),
		Color(0.65, 0.28, 0.20),
		"Arrival Square & The Salty Seagull Cafe",
		"Harbor Cafe"
	)

	# 2. Central Card Market & Resonance Emporium
	_create_fantasy_building(
		Vector3(-10, 0, -12),
		Vector3(9, 5.5, 8),
		Color(0.74, 0.54, 0.26),
		Color(0.24, 0.48, 0.72),
		"Central Card Market & Resonance Emporium",
		"Card Shop & Forge"
	)

	# 3. Lantern Row Residential Lofts & Duelist Apartments
	_create_fantasy_building(
		Vector3(0, 0, -18),
		Vector3(12, 6, 6),
		Color(0.48, 0.35, 0.68),
		Color(0.72, 0.32, 0.25),
		"Lantern Row Residential Lofts",
		"Player Apartment"
	)

	# 4. Grand Tournament Coliseum & Inscription Sanctum
	_create_fantasy_building(
		Vector3(15, 0, 12),
		Vector3(11, 7, 9),
		Color(0.72, 0.28, 0.35),
		Color(0.85, 0.68, 0.25),
		"Grand Tournament Hall & Coliseum",
		"Tournament Arena"
	)

	# 5. The Accord Institute & Celestial Observatory
	_create_fantasy_building(
		Vector3(15, 0, -12),
		Vector3(10, 8, 8),
		Color(0.26, 0.48, 0.78),
		Color(0.88, 0.78, 0.38),
		"The Accord Institute & Observatory Spire",
		"Observatory & Training"
	)

	# Decorative Street Lanterns with Warm Lights
	var lantern_coords := [
		Vector3(-8, 0, 4), Vector3(-8, 0, -4),
		Vector3(6, 0, 4), Vector3(6, 0, -4),
		Vector3(0, 0, 9), Vector3(0, 0, -9),
		Vector3(-11, 0, 18), Vector3(-11, 0, -18)
	]
	for l_pos in lantern_coords:
		_create_street_lantern(l_pos)

	# Decorative Landscaping: Cypress Trees and Stone Planters
	var tree_coords := [
		Vector3(-6, 0, 15), Vector3(-6, 0, -15),
		Vector3(8, 0, 18), Vector3(8, 0, -18),
		Vector3(18, 0, 0), Vector3(-11, 0, 0)
	]
	for t_pos in tree_coords:
		_create_cypress_tree(t_pos)

func _create_fantasy_building(pos: Vector3, size: Vector3, wall_color: Color, roof_color: Color, title: String, sign_text: String) -> Node3D:
	var b_root := Node3D.new()
	b_root.position = pos
	b_root.name = title
	add_child(b_root)

	# 1. Main Stone Wall Foundation
	var wall_mesh := MeshInstance3D.new()
	var w_box := BoxMesh.new()
	w_box.size = size
	var w_mat := StandardMaterial3D.new()
	w_mat.albedo_color = wall_color
	w_mat.roughness = 0.8
	w_box.material = w_mat
	wall_mesh.mesh = w_box
	wall_mesh.position = Vector3(0, size.y * 0.5, 0)
	b_root.add_child(wall_mesh)

	# 2. Pitched Roof (PrismMesh)
	var roof := MeshInstance3D.new()
	var r_prism := PrismMesh.new()
	r_prism.size = Vector3(size.x + 0.8, size.y * 0.55, size.z + 0.8)
	var r_mat := StandardMaterial3D.new()
	r_mat.albedo_color = roof_color
	r_mat.roughness = 0.7
	r_prism.material = r_mat
	roof.mesh = r_prism
	roof.position = Vector3(0, size.y + (size.y * 0.55 * 0.5), 0)
	b_root.add_child(roof)

	# 3. Arched Doorway / Portico
	var door := MeshInstance3D.new()
	var d_box := BoxMesh.new()
	d_box.size = Vector3(1.8, 2.6, 0.4)
	var d_mat := StandardMaterial3D.new()
	d_mat.albedo_color = Color(0.24, 0.16, 0.10)
	d_box.material = d_mat
	door.mesh = d_box
	door.position = Vector3(0, 1.3, size.z * 0.5 + 0.15)
	b_root.add_child(door)

	# 4. Glowing Stained Glass Windows (Emissive Cyan/Gold)
	var window_left := MeshInstance3D.new()
	var win_box := BoxMesh.new()
	win_box.size = Vector3(1.2, 1.6, 0.2)
	var win_mat := StandardMaterial3D.new()
	win_mat.albedo_color = Color(0.40, 0.85, 1.0)
	win_mat.emission_enabled = true
	win_mat.emission = Color(0.25, 0.70, 0.95)
	win_mat.emission_energy_multiplier = 0.8
	win_box.material = win_mat
	window_left.mesh = win_box
	window_left.position = Vector3(-size.x * 0.28, size.y * 0.65, size.z * 0.5 + 0.1)
	b_root.add_child(window_left)

	var window_right := MeshInstance3D.new()
	window_right.mesh = win_box
	window_right.position = Vector3(size.x * 0.28, size.y * 0.65, size.z * 0.5 + 0.1)
	b_root.add_child(window_right)

	# 5. Overhang Sign (Label3D)
	var sign_lbl := Label3D.new()
	sign_lbl.text = "🏛 " + sign_text
	sign_lbl.font_size = 28
	sign_lbl.outline_size = 6
	sign_lbl.outline_modulate = Color(0, 0, 0, 0.9)
	sign_lbl.modulate = Color(1.0, 0.92, 0.65)
	sign_lbl.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	sign_lbl.position = Vector3(0, 3.2, size.z * 0.5 + 0.6)
	b_root.add_child(sign_lbl)

	return b_root

func _build_duelist_amphitheater(pos: Vector3) -> void:
	var amp_root := Node3D.new()
	amp_root.position = pos
	amp_root.name = "Duelist Plaza Convergence Amphitheater"
	add_child(amp_root)

	# Stepped Octagonal Stone Dais
	var base_ring := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 6.5
	cyl.bottom_radius = 7.2
	cyl.height = 0.4
	cyl.radial_segments = 16
	var base_mat := StandardMaterial3D.new()
	base_mat.albedo_color = Color(0.24, 0.28, 0.38)
	cyl.material = base_mat
	base_ring.mesh = cyl
	base_ring.position = Vector3(0, 0.2, 0)
	amp_root.add_child(base_ring)

	# Inner Duel Platform
	var inner_ring := MeshInstance3D.new()
	var in_cyl := CylinderMesh.new()
	in_cyl.top_radius = 4.8
	in_cyl.bottom_radius = 5.2
	in_cyl.height = 0.3
	in_cyl.radial_segments = 16
	var in_mat := StandardMaterial3D.new()
	in_mat.albedo_color = Color(0.32, 0.22, 0.45)
	in_cyl.material = in_mat
	inner_ring.mesh = in_cyl
	inner_ring.position = Vector3(0, 0.5, 0)
	amp_root.add_child(inner_ring)

	# Central Pulsing Aether Convergence Spire
	var spire := MeshInstance3D.new()
	var s_prism := PrismMesh.new()
	s_prism.size = Vector3(1.2, 3.8, 1.2)
	var s_mat := StandardMaterial3D.new()
	s_mat.albedo_color = Color(0.65, 0.40, 0.95)
	s_mat.emission_enabled = true
	s_mat.emission = Color(0.72, 0.42, 1.0)
	s_mat.emission_energy_multiplier = 1.4
	s_prism.material = s_mat
	spire.mesh = s_prism
	spire.position = Vector3(0, 2.3, 0)
	amp_root.add_child(spire)

	var spire_light := OmniLight3D.new()
	spire_light.light_color = Color(0.75, 0.45, 1.0)
	spire_light.light_energy = 2.0
	spire_light.omni_range = 8.0
	spire_light.position = Vector3(0, 2.5, 0)
	amp_root.add_child(spire_light)

	var title_lbl := Label3D.new()
	title_lbl.text = "⚔ DUELIST PLAZA ⚔\nConvergence Arena"
	title_lbl.font_size = 28
	title_lbl.outline_size = 6
	title_lbl.modulate = Color(0.95, 0.85, 0.35)
	title_lbl.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	title_lbl.position = Vector3(0, 4.8, 0)
	amp_root.add_child(title_lbl)

func _create_street_lantern(pos: Vector3) -> void:
	var l_root := Node3D.new()
	l_root.position = pos
	add_child(l_root)

	# Post
	var post := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.08
	cyl.bottom_radius = 0.12
	cyl.height = 2.8
	var p_mat := StandardMaterial3D.new()
	p_mat.albedo_color = Color(0.12, 0.12, 0.15)
	cyl.material = p_mat
	post.mesh = cyl
	post.position = Vector3(0, 1.4, 0)
	l_root.add_child(post)

	# Lantern Cap
	var cap := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.45, 0.55, 0.45)
	var cap_mat := StandardMaterial3D.new()
	cap_mat.albedo_color = Color(1.0, 0.82, 0.45)
	cap_mat.emission_enabled = true
	cap_mat.emission = Color(1.0, 0.78, 0.35)
	cap_mat.emission_energy_multiplier = 1.2
	box.material = cap_mat
	cap.mesh = box
	cap.position = Vector3(0, 2.7, 0)
	l_root.add_child(cap)

	# Warm Light
	var light := OmniLight3D.new()
	light.light_color = Color(1.0, 0.82, 0.48)
	light.light_energy = 1.0
	light.omni_range = 6.0
	light.position = Vector3(0, 2.7, 0)
	l_root.add_child(light)

func _create_cypress_tree(pos: Vector3) -> void:
	var t_root := Node3D.new()
	t_root.position = pos
	add_child(t_root)

	# Trunk
	var trunk := MeshInstance3D.new()
	var t_cyl := CylinderMesh.new()
	t_cyl.top_radius = 0.15
	t_cyl.bottom_radius = 0.22
	t_cyl.height = 1.2
	var tr_mat := StandardMaterial3D.new()
	tr_mat.albedo_color = Color(0.35, 0.22, 0.14)
	t_cyl.material = tr_mat
	trunk.mesh = t_cyl
	trunk.position = Vector3(0, 0.6, 0)
	t_root.add_child(trunk)

	# Foliage Cone
	var foliage := MeshInstance3D.new()
	var cone := CylinderMesh.new()
	cone.top_radius = 0.05
	cone.bottom_radius = 0.95
	cone.height = 3.2
	var f_mat := StandardMaterial3D.new()
	f_mat.albedo_color = Color(0.18, 0.45, 0.25)
	f_mat.roughness = 0.9
	cone.material = f_mat
	foliage.mesh = cone
	foliage.position = Vector3(0, 2.4, 0)
	t_root.add_child(foliage)

# -----------------------------------------------------------------------------
# 2. ISOMETRIC PLAYER & CAMERA RIG
# -----------------------------------------------------------------------------
func _build_isometric_player_and_camera() -> void:
	player_body = CharacterBody3D.new()
	player_body.name = "player_body"
	player_body.position = Vector3(0, 1.0, 9.0)

	# Stylized Duelist Model (Body, Cloak, Head, Gauntlet)
	var model_root := Node3D.new()
	model_root.name = "DuelistVisual"
	player_body.add_child(model_root)

	var torso := MeshInstance3D.new()
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.38
	capsule.height = 1.6
	var p_mat := StandardMaterial3D.new()
	p_mat.albedo_color = Color(0.96, 0.82, 0.25) # Golden Duelist Cuirass
	capsule.material = p_mat
	torso.mesh = capsule
	torso.position = Vector3(0, 0, 0)
	model_root.add_child(torso)

	# Cloak / Mantle
	var cloak := MeshInstance3D.new()
	var c_box := BoxMesh.new()
	c_box.size = Vector3(0.72, 1.1, 0.25)
	var c_mat := StandardMaterial3D.new()
	c_mat.albedo_color = Color(0.18, 0.32, 0.55) # Deep Blue Vanguard Cloak
	c_box.material = c_mat
	cloak.mesh = c_box
	cloak.position = Vector3(0, 0.1, -0.22)
	model_root.add_child(cloak)

	# Aether Gauntlet (Emissive Gem)
	var gauntlet := MeshInstance3D.new()
	var g_box := BoxMesh.new()
	g_box.size = Vector3(0.24, 0.24, 0.24)
	var g_mat := StandardMaterial3D.new()
	g_mat.albedo_color = Color(0.35, 0.88, 1.0)
	g_mat.emission_enabled = true
	g_mat.emission = Color(0.35, 0.88, 1.0)
	g_mat.emission_energy_multiplier = 1.5
	g_box.material = g_mat
	gauntlet.mesh = g_box
	gauntlet.position = Vector3(0.42, 0.2, 0.2)
	model_root.add_child(gauntlet)

	add_child(player_body)

	# Isometric Camera Pivot & Smooth Rig
	camera_pivot = Node3D.new()
	camera_pivot.name = "camera_pivot"
	camera_pivot.position = player_body.position
	camera_pivot.rotation_degrees = Vector3(-35.264, camera_yaw_target, 0)
	add_child(camera_pivot)

	iso_camera = Camera3D.new()
	iso_camera.name = "iso_camera"
	iso_camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	iso_camera.size = camera_size_target
	iso_camera.position = Vector3(0, 0, 26)
	camera_pivot.add_child(iso_camera)

# -----------------------------------------------------------------------------
# 3. SCHEDULED LUMENPORT NPCS WITH 3D MODELS & BILLBOARDS
# -----------------------------------------------------------------------------
func _spawn_lumenport_npcs() -> void:
	npc_nodes.clear()
	var total := GameState.npcs.size()
	for i in range(total):
		var npc_data: Dictionary = GameState.npcs[i]
		var angle := (float(i) / float(maxi(1, total))) * TAU
		var radius := 5.8 if (i % 2 == 0) else 11.2
		var pos := Vector3(cos(angle) * radius, 0.85, sin(angle) * radius)

		var npc_root := Node3D.new()
		npc_root.name = str(npc_data.get("id", "npc_%d" % i))
		npc_root.position = pos
		add_child(npc_root)

		# Multi-tier Humanoid Model
		var body := MeshInstance3D.new()
		var cyl := CylinderMesh.new()
		cyl.top_radius = 0.38
		cyl.bottom_radius = 0.44
		cyl.height = 1.6
		var faction_color := Color.from_hsv(fmod(float(i) * 0.12, 1.0), 0.70, 0.90)
		var mat := StandardMaterial3D.new()
		mat.albedo_color = faction_color
		mat.roughness = 0.7
		cyl.material = mat
		body.mesh = cyl
		body.position = Vector3(0, 0, 0)
		npc_root.add_child(body)

		# Head / Hood
		var head := MeshInstance3D.new()
		var h_sphere := SphereMesh.new()
		h_sphere.radius = 0.28
		h_sphere.height = 0.56
		var h_mat := StandardMaterial3D.new()
		h_mat.albedo_color = faction_color.lightened(0.2)
		h_sphere.material = h_mat
		head.mesh = h_sphere
		head.position = Vector3(0, 0.95, 0)
		npc_root.add_child(head)

		# Floating Billboard Nameplate (Label3D)
		var nameplate := Label3D.new()
		var n_name: String = str(npc_data.get("name", "Duelist"))
		var n_title: String = str(npc_data.get("title", ""))
		nameplate.text = "✦ %s ✦\n[%s]" % [n_name, n_title]
		nameplate.font_size = 22
		nameplate.outline_size = 5
		nameplate.outline_modulate = Color(0, 0, 0, 0.85)
		nameplate.modulate = faction_color.lightened(0.3)
		nameplate.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		nameplate.position = Vector3(0, 1.85, 0)
		npc_root.add_child(nameplate)

		npc_nodes.append({"data": npc_data, "node": npc_root})

# -----------------------------------------------------------------------------
# 4. ENTERABLE INTERIOR PORTALS
# -----------------------------------------------------------------------------
func _spawn_interior_portals() -> void:
	interior_markers.clear()
	var portals := [
		{"id": "interior_harbor_cafe", "name": "The Salty Seagull Harbor Cafe", "pos": Vector3(-10, 1.0, 15.5)},
		{"id": "interior_card_shop", "name": "Echo Emporium & Card Vault", "pos": Vector3(-10, 1.0, -8.0)},
		{"id": "interior_artificer_workshop", "name": "Aether-Dynamo Foundry", "pos": Vector3(-10, 1.0, -16.0)},
		{"id": "interior_player_apartment", "name": "Lantern Row Duelist Quarters", "pos": Vector3(0, 1.0, -15.0)},
		{"id": "interior_tournament_registration", "name": "Grand Coliseum Inscription Rotunda", "pos": Vector3(15, 1.0, 16.5)},
		{"id": "interior_training_facility", "name": "Duelist Arena Training Guild", "pos": Vector3(15, 1.0, -8.0)}
	]

	for p in portals:
		var marker := Node3D.new()
		marker.position = p["pos"]
		marker.name = "Portal_" + p["id"]
		add_child(marker)

		var lbl := Label3D.new()
		lbl.text = "🚪 [E] Enter\n%s" % p["name"]
		lbl.font_size = 20
		lbl.outline_size = 4
		lbl.modulate = Color(0.95, 0.88, 0.40)
		lbl.billboard = BaseMaterial3D.BILLBOARD_ENABLED
		lbl.position = Vector3(0, 1.5, 0)
		marker.add_child(lbl)

		interior_markers.append({"id": p["id"], "name": p["name"], "node": marker, "pos": p["pos"]})

# -----------------------------------------------------------------------------
# 5. WORLD HUD & NAVIGATION
# -----------------------------------------------------------------------------
func _build_world_hud() -> void:
	var canvas := CanvasLayer.new()
	canvas.name = "WorldHUD"
	add_child(canvas)

	var top_vbox := VBoxContainer.new()
	top_vbox.set_anchors_preset(Control.PRESET_TOP_WIDE)
	canvas.add_child(top_vbox)

	var top_bar := PanelContainer.new()
	var tb_style := StyleBoxFlat.new()
	tb_style.bg_color = Color(0.06, 0.09, 0.16, 0.90)
	tb_style.border_color = Color(0.25, 0.42, 0.62)
	tb_style.set_border_width_all(1)
	tb_style.set_content_margin_all(8)
	top_bar.add_theme_stylebox_override("panel", tb_style)
	top_vbox.add_child(top_bar)

	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 10)
	top_bar.add_child(hbox)

	hud_status_label = Label.new()
	hud_status_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hud_status_label.add_theme_font_size_override("font_size", 13)
	hud_status_label.add_theme_color_override("font_color", Color(0.92, 0.96, 1.0))
	hbox.add_child(hud_status_label)

	var btn_journal := Button.new()
	btn_journal.text = "📜 Quest Journal [J]"
	btn_journal.pressed.connect(toggle_quest_journal)
	hbox.add_child(btn_journal)

	var btn_deck := Button.new()
	btn_deck.text = "🏛 Deck Builder & Shop [B]"
	btn_deck.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/ui/deck_builder.tscn"))
	hbox.add_child(btn_deck)

	var btn_menu := Button.new()
	btn_menu.text = "☰ Main Menu"
	btn_menu.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/ui/main_menu.tscn"))
	hbox.add_child(btn_menu)

	var btn_quick_duel := Button.new()
	btn_quick_duel.text = "⚔ 1v1 Duel"
	btn_quick_duel.pressed.connect(func(): _start_duel("npc_kaelen_forge", "standard_1v1"))
	hbox.add_child(btn_quick_duel)

	var btn_tag_duel := Button.new()
	btn_tag_duel.text = "✦ 2v2 Tag Battle"
	btn_tag_duel.pressed.connect(func(): _start_duel("npc_soren_whisperleaf", "tag_2v2"))
	hbox.add_child(btn_tag_duel)

	var btn_time := Button.new()
	btn_time.text = "☼ +3h Time"
	btn_time.pressed.connect(_advance_time_of_day)
	hbox.add_child(btn_time)

	# District Fast-Travel Bar
	var ft_bar := HBoxContainer.new()
	ft_bar.add_theme_constant_override("separation", 6)
	top_vbox.add_child(ft_bar)

	var district_positions := {
		"lumenport_arrival_square": Vector3(-8, 1.0, 8),
		"lumenport_central_card_market": Vector3(-8, 1.0, -7),
		"lumenport_duelist_plaza": Vector3(0, 1.0, 3),
		"lumenport_residential_district": Vector3(0, 1.0, -11),
		"lumenport_grand_tournament_hall": Vector3(9, 1.0, 8),
		"lumenport_accord_institute": Vector3(9, 1.0, -7)
	}
	for d in GameState.districts:
		var did: String = str(d.get("id", ""))
		var dname: String = str(d.get("name", did))
		var b := Button.new()
		b.text = "Travel: " + dname
		b.add_theme_font_size_override("font_size", 11)
		b.pressed.connect(func():
			GameState.current_district = did
			if district_positions.has(did):
				player_body.position = district_positions[did]
			_refresh_hud_text()
		)
		ft_bar.add_child(b)

	# Minimap & Telemetry Panel
	var mm_panel := PanelContainer.new()
	mm_panel.position = Vector2(14, 88)
	var mm_style := StyleBoxFlat.new()
	mm_style.bg_color = Color(0.04, 0.08, 0.14, 0.85)
	mm_style.border_color = Color(0.20, 0.38, 0.55)
	mm_style.set_border_width_all(1)
	mm_style.set_content_margin_all(8)
	mm_panel.add_theme_stylebox_override("panel", mm_style)
	canvas.add_child(mm_panel)

	minimap_label = Label.new()
	minimap_label.add_theme_font_size_override("font_size", 11)
	mm_panel.add_child(minimap_label)

	# Bottom Proximity Interaction Prompt
	prompt_panel = PanelContainer.new()
	prompt_panel.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	prompt_panel.position = Vector2(380, 750)
	var pr_style := StyleBoxFlat.new()
	pr_style.bg_color = Color(0.06, 0.10, 0.18, 0.94)
	pr_style.border_color = Color(0.92, 0.78, 0.30)
	pr_style.set_border_width_all(2)
	pr_style.set_corner_radius_all(6)
	pr_style.set_content_margin_all(10)
	prompt_panel.add_theme_stylebox_override("panel", pr_style)
	prompt_panel.visible = false
	canvas.add_child(prompt_panel)

	var pvbox := VBoxContainer.new()
	prompt_panel.add_child(pvbox)

	prompt_label = Label.new()
	prompt_label.add_theme_font_size_override("font_size", 13)
	pvbox.add_child(prompt_label)

	var phbox := HBoxContainer.new()
	phbox.add_theme_constant_override("separation", 10)
	pvbox.add_child(phbox)

	var btn_talk := Button.new()
	btn_talk.text = "Talk / Quest Dialogue [E]"
	btn_talk.pressed.connect(_open_dialogue_with_active_npc)
	phbox.add_child(btn_talk)

	var btn_challenge := Button.new()
	btn_challenge.text = "⚔ 1v1 Convergence Duel"
	btn_challenge.pressed.connect(func():
		if active_prompt_npc.has("id"):
			_start_duel(active_prompt_npc["id"], "standard_1v1")
	)
	phbox.add_child(btn_challenge)

	var btn_tag := Button.new()
	btn_tag.text = "✦ 2v2 Tag Duel"
	btn_tag.pressed.connect(func():
		if active_prompt_npc.has("id"):
			_start_duel(active_prompt_npc["id"], "tag_2v2")
	)
	phbox.add_child(btn_tag)

# -----------------------------------------------------------------------------
# 6. INTERACTIVE BRANCHING RPG DIALOGUE SYSTEM
# -----------------------------------------------------------------------------
func _build_dialogue_modal() -> void:
	dialogue_modal = PanelContainer.new()
	dialogue_modal.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	dialogue_modal.offset_top = -350
	dialogue_modal.offset_bottom = -20
	dialogue_modal.offset_left = 60
	dialogue_modal.offset_right = -60
	var d_style := StyleBoxFlat.new()
	d_style.bg_color = Color(0.04, 0.07, 0.12, 0.95)
	d_style.border_color = Color(0.25, 0.45, 0.70)
	d_style.set_border_width_all(2)
	d_style.set_corner_radius_all(10)
	d_style.set_content_margin_all(20)
	dialogue_modal.add_theme_stylebox_override("panel", d_style)
	dialogue_modal.visible = false
	add_child(dialogue_modal)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 16)
	dialogue_modal.add_child(vbox)

	# Header: NPC Title & Affinity Bar
	var top_hbox := HBoxContainer.new()
	vbox.add_child(top_hbox)

	var name_vbox := VBoxContainer.new()
	name_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_hbox.add_child(name_vbox)

	dialogue_npc_name = Label.new()
	dialogue_npc_name.add_theme_font_size_override("font_size", 24)
	dialogue_npc_name.add_theme_color_override("font_color", Color(0.96, 0.85, 0.40))
	name_vbox.add_child(dialogue_npc_name)

	dialogue_npc_title = Label.new()
	dialogue_npc_title.add_theme_font_size_override("font_size", 14)
	dialogue_npc_title.add_theme_color_override("font_color", Color(0.48, 0.78, 0.95))
	name_vbox.add_child(dialogue_npc_title)

	var rel_vbox := VBoxContainer.new()
	rel_vbox.custom_minimum_size = Vector2(240, 0)
	top_hbox.add_child(rel_vbox)

	dialogue_rel_label = Label.new()
	dialogue_rel_label.add_theme_font_size_override("font_size", 12)
	rel_vbox.add_child(dialogue_rel_label)

	dialogue_rel_bar = ProgressBar.new()
	dialogue_rel_bar.max_value = 100.0
	rel_vbox.add_child(dialogue_rel_bar)

	# Dialogue Body Text
	var text_panel := PanelContainer.new()
	text_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var tp_style := StyleBoxFlat.new()
	tp_style.bg_color = Color(0.08, 0.12, 0.20)
	tp_style.set_corner_radius_all(6)
	tp_style.set_content_margin_all(18)
	text_panel.add_theme_stylebox_override("panel", tp_style)
	vbox.add_child(text_panel)

	dialogue_body_label = RichTextLabel.new()
	dialogue_body_label.bbcode_enabled = true
	dialogue_body_label.add_theme_font_size_override("normal_font_size", 15)
	text_panel.add_child(dialogue_body_label)

	# Response Action Options
	dialogue_options_container = VBoxContainer.new()
	dialogue_options_container.add_theme_constant_override("separation", 8)
	vbox.add_child(dialogue_options_container)

func _open_dialogue_with_active_npc() -> void:
	if not active_prompt_npc.has("id"):
		return
	var npc_id: String = active_prompt_npc["id"]
	var result: Dictionary = GameState.interact_with_npc(npc_id)
	if not bool(result.get("success", false)):
		return

	dialogue_npc_name.text = str(result.get("name", "Duelist"))
	dialogue_npc_title.text = str(result.get("title", ""))

	var rel: int = int(result.get("relationship", 20))
	dialogue_rel_bar.value = rel
	dialogue_rel_label.text = "Bond Affinity: %d/100" % rel

	var dial_dict: Dictionary = result.get("dialogue", {})
	dialogue_body_label.text = "\"%s\"\n\n%s" % [
		str(dial_dict.get("greeting", "")),
		str(dial_dict.get("rumors", ""))
	]

	_populate_dialogue_options(npc_id, dial_dict)
	dialogue_modal.visible = true

func _populate_dialogue_options(npc_id: String, dial: Dictionary) -> void:
	for child in dialogue_options_container.get_children():
		child.queue_free()

	# 1. Ask about Faction Lore & Echo Cards
	var b_lore := Button.new()
	b_lore.text = "1. \"Tell me about the Echo Cards of Lumenport and your faction.\""
	b_lore.pressed.connect(func():
		var lore_text: String = str(dial.get("rumors", "The Aether flows freely across the three lanes."))
		dialogue_body_label.text = "\"%s\"" % lore_text
		GameState.relationships[npc_id] = mini(100, int(GameState.relationships.get(npc_id, 20)) + 3)
		dialogue_rel_bar.value = GameState.relationships[npc_id]
		dialogue_rel_label.text = "Bond Affinity: %d/100 (+3 Lore)" % GameState.relationships[npc_id]
		GameState.save_local_profile()
	)
	dialogue_options_container.add_child(b_lore)

	# 2. Quests from this NPC
	for q in GameState.quests:
		var qid: String = str(q.get("id", ""))
		var qstatus: String = GameState.get_quest_status(qid)
		if str(q.get("giver_npc_id", "")) == npc_id or (npc_id == "npc_soren_whisperleaf" and qid.contains("ch1")) or (npc_id == "npc_marshal_corin" and qid.contains("ch3")):
			var b_quest := Button.new()
			if qstatus == "completed":
				b_quest.text = "2. [COMPLETED] %s — Thank you for your guidance." % str(q.get("title"))
				b_quest.disabled = true
			elif qstatus == "active":
				b_quest.text = "2. [ACTIVE QUEST] %s — I am working on the objectives." % str(q.get("title"))
			else:
				b_quest.text = "2. [ACCEPT QUEST] %s — \"I will take on this task!\"" % str(q.get("title"))
				b_quest.pressed.connect(func():
					GameState.accept_quest(qid)
					dialogue_body_label.text = "\"Excellent. %s Return when you have proven your mettle.\"" % str(q.get("description"))
					_populate_dialogue_options(npc_id, dial)
				)
			dialogue_options_container.add_child(b_quest)

	# 3. Gift 50 Crowns to raise relationship
	var b_gift := Button.new()
	b_gift.text = "3. Offer Gift of Gratitude (50 Crowns, +12 Affinity)"
	b_gift.pressed.connect(func():
		if GameState.crowns >= 50:
			GameState.crowns -= 50
			GameState.relationships[npc_id] = mini(100, int(GameState.relationships.get(npc_id, 20)) + 12)
			dialogue_rel_bar.value = GameState.relationships[npc_id]
			dialogue_rel_label.text = "Bond Affinity: %d/100 (+12 Gifted)" % GameState.relationships[npc_id]
			dialogue_body_label.text = "\"Your generosity honors our bond, duelist! May the Aether guide your hand in the Convergence.\""
			GameState.save_local_profile()
			_refresh_hud_text()
		else:
			dialogue_body_label.text = "\"You do not have enough Crowns right now, friend.\""
	)
	dialogue_options_container.add_child(b_gift)

	# 4. Challenge to Duel
	var b_duel := Button.new()
	b_duel.text = "4. \"Stand with me in a Convergence Duel!\" (1v1 Tabletop)"
	b_duel.pressed.connect(func():
		dialogue_modal.visible = false
		_start_duel(npc_id, "standard_1v1")
	)
	dialogue_options_container.add_child(b_duel)

	# 5. Leave Dialogue
	var b_close := Button.new()
	b_close.text = "5. \"Farewell for now.\""
	b_close.pressed.connect(func():
		dialogue_modal.visible = false
	)
	dialogue_options_container.add_child(b_close)

# -----------------------------------------------------------------------------
# 7. IN-GAME QUEST JOURNAL
# -----------------------------------------------------------------------------
func _build_quest_journal_modal() -> void:
	quest_journal_modal = PanelContainer.new()
	quest_journal_modal.set_anchors_preset(Control.PRESET_FULL_RECT)
	var q_style := StyleBoxFlat.new()
	q_style.bg_color = Color(0.04, 0.06, 0.11, 0.95)
	q_style.set_content_margin_all(50)
	quest_journal_modal.add_theme_stylebox_override("panel", q_style)
	quest_journal_modal.visible = false
	add_child(quest_journal_modal)

	var qvbox := VBoxContainer.new()
	qvbox.add_theme_constant_override("separation", 16)
	quest_journal_modal.add_child(qvbox)

	var title := Label.new()
	title.text = "📜 ACT I QUEST JOURNAL & CAMPAIGN OBJECTIVES"
	title.add_theme_font_size_override("font_size", 22)
	title.add_theme_color_override("font_color", Color(0.96, 0.85, 0.45))
	qvbox.add_child(title)

	var split := HBoxContainer.new()
	split.size_flags_vertical = Control.SIZE_EXPAND_FILL
	split.add_theme_constant_override("separation", 24)
	qvbox.add_child(split)

	# Left Column: Quest List
	var left_scroll := ScrollContainer.new()
	left_scroll.custom_minimum_size = Vector2(420, 0)
	split.add_child(left_scroll)

	quest_list_container = VBoxContainer.new()
	quest_list_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	quest_list_container.add_theme_constant_override("separation", 8)
	left_scroll.add_child(quest_list_container)

	# Right Column: Quest Details
	var right_panel := PanelContainer.new()
	right_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var rp_style := StyleBoxFlat.new()
	rp_style.bg_color = Color(0.07, 0.11, 0.19)
	rp_style.set_content_margin_all(16)
	right_panel.add_theme_stylebox_override("panel", rp_style)
	split.add_child(right_panel)

	quest_detail_label = RichTextLabel.new()
	quest_detail_label.bbcode_enabled = true
	quest_detail_label.size_flags_vertical = Control.SIZE_EXPAND_FILL
	right_panel.add_child(quest_detail_label)

	var b_close := Button.new()
	b_close.text = "Close Journal [J]"
	b_close.custom_minimum_size = Vector2(160, 40)
	b_close.pressed.connect(func(): quest_journal_modal.visible = false)
	qvbox.add_child(b_close)

func toggle_quest_journal() -> void:
	quest_journal_modal.visible = not quest_journal_modal.visible
	if quest_journal_modal.visible:
		_refresh_quest_journal()

func _refresh_quest_journal() -> void:
	for child in quest_list_container.get_children():
		child.queue_free()

	for q in GameState.quests:
		var qid: String = str(q.get("id", ""))
		var qstatus: String = GameState.get_quest_status(qid)
		var btn := Button.new()
		var prefix := "[✓ COMPLETED] " if qstatus == "completed" else ("[ACTIVE] " if qstatus == "active" else "[AVAILABLE] ")
		btn.text = prefix + str(q.get("title", qid))
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		var q_copy: Dictionary = q
		btn.pressed.connect(func(): _show_quest_detail(q_copy))
		quest_list_container.add_child(btn)

	if GameState.quests.size() > 0:
		_show_quest_detail(GameState.quests[0])

func _show_quest_detail(q: Dictionary) -> void:
	var qid: String = str(q.get("id", ""))
	var qstatus: String = GameState.get_quest_status(qid).to_upper()
	var rew: Dictionary = q.get("rewards", {})
	var objs: Array = q.get("objectives", [])
	var prog: Dictionary = GameState.quest_objective_progress.get(qid, {})

	var obj_lines: Array[String] = []
	for obj in objs:
		var oid: String = str(obj.get("id", ""))
		var target_c: int = int(obj.get("target_count", 1))
		var cur_c: int = int(prog.get(oid, 0))
		var mark := "[X] " if cur_c >= target_c or qstatus == "COMPLETED" else "[  ] "
		obj_lines.append("%s%s (%d/%d)" % [mark, str(obj.get("description", "")), mini(cur_c, target_c), target_c])

	quest_detail_label.text = """[size=20][b]%s[/b][/size]
[color=#4db8ff]Chapter %d — District: %s[/color]
[b]Status:[/b] %s

[b]Briefing:[/b]
%s

[b]Objectives:[/b]
%s

[b]Rewards:[/b]
• Crowns: +%d
• Echo Dust: +%d
• Bonus Card: %s
• Reputation: +%d""" % [
		str(q.get("title", "")),
		int(q.get("chapter", 1)),
		str(q.get("district_id", "")).replace("lumenport_", "").replace("_", " ").capitalize(),
		qstatus,
		str(q.get("description", "")),
		"\n".join(obj_lines),
		int(rew.get("crowns", 0)),
		int(rew.get("echo_dust", 0)),
		str(rew.get("card_id", "Pack")),
		int(rew.get("reputation_gain", 0))
	]

# -----------------------------------------------------------------------------
# 8. ENTERABLE INTERIORS SYSTEM
# -----------------------------------------------------------------------------
func _build_interior_overlay() -> void:
	interior_panel = PanelContainer.new()
	interior_panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	var in_style := StyleBoxFlat.new()
	in_style.bg_color = Color(0.04, 0.06, 0.10, 0.96)
	in_style.set_content_margin_all(50)
	interior_panel.add_theme_stylebox_override("panel", in_style)
	interior_panel.visible = false
	add_child(interior_panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 18)
	interior_panel.add_child(vbox)

	interior_title = Label.new()
	interior_title.add_theme_font_size_override("font_size", 24)
	interior_title.add_theme_color_override("font_color", Color(0.96, 0.85, 0.40))
	vbox.add_child(interior_title)

	interior_desc = Label.new()
	interior_desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	interior_desc.add_theme_font_size_override("font_size", 14)
	interior_desc.add_theme_color_override("font_color", Color(0.80, 0.88, 0.96))
	vbox.add_child(interior_desc)

	var room_panel := PanelContainer.new()
	room_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var rp_style := StyleBoxFlat.new()
	rp_style.bg_color = Color(0.08, 0.12, 0.22)
	rp_style.set_corner_radius_all(8)
	rp_style.set_content_margin_all(20)
	room_panel.add_theme_stylebox_override("panel", rp_style)
	vbox.add_child(room_panel)

	var room_vbox := VBoxContainer.new()
	room_vbox.add_theme_constant_override("separation", 12)
	room_panel.add_child(room_vbox)

	var r_feature := RichTextLabel.new()
	r_feature.size_flags_vertical = Control.SIZE_EXPAND_FILL
	r_feature.bbcode_enabled = true
	r_feature.text = """[color=#ffcc66][b]Interior Sanctum Active[/b][/color]
You have entered the interior sanctum. Here you can rest, review faction registries, inspect card displays, or converse with resident craftsmen.

• [b]Rest & Recharge[/b]: Realign your Aether focus.
• [b]Inspect Rarities[/b]: Examine rare foil cards under enchanted crystal glass.
• [b]Resident Duelists[/b]: Sparring tables are open for practice matches."""
	room_vbox.add_child(r_feature)

	var action_hbox := HBoxContainer.new()
	action_hbox.add_theme_constant_override("separation", 14)
	vbox.add_child(action_hbox)

	var btn_rest := Button.new()
	btn_rest.text = "☕ Interact with Interior Counter (+20 Crowns Rest Bonus)"
	btn_rest.pressed.connect(func():
		SoundManager.play_button_click()
		GameState.crowns += 20
		GameState.save_local_profile()
		_refresh_hud_text()
		interior_desc.text = "You enjoyed the warm ambiance and gathered local Convergence rumors. +20 Crowns added to your purse!"
	)
	action_hbox.add_child(btn_rest)

	var btn_shop := Button.new()
	btn_shop.text = "🏛 Open Deck Builder & Card Shop"
	btn_shop.pressed.connect(func():
		SoundManager.play_button_click()
		get_tree().change_scene_to_file("res://scenes/ui/deck_builder.tscn")
	)
	action_hbox.add_child(btn_shop)

	var btn_exit := Button.new()
	btn_exit.text = "🚪 Exit to Lumenport Street"
	btn_exit.custom_minimum_size = Vector2(180, 40)
	btn_exit.pressed.connect(_exit_interior)
	action_hbox.add_child(btn_exit)

func _enter_interior(interior_id: String, interior_name: String) -> void:
	is_inside_interior = true
	current_interior_id = interior_id
	interior_title.text = "🏛 " + interior_name

	if interior_id == "interior_harbor_cafe":
		interior_desc.text = "You step into The Salty Seagull Harbor Cafe. Warm amber hearth lights cast a cozy glow over dark timber tables. Sailors, merchants, and off-duty duelists share hot chowder and exchange rumors of the Convergence."
	elif interior_id == "interior_card_shop":
		interior_desc.text = "You enter the Resonance Emporium & Card Market. Arcane glass vitrines shimmer with rare foil cards from all eight factions. Master Artificer Vance's apprentices inspect mana crystals behind polished brass counters."
	elif interior_id == "interior_artificer_forge":
		interior_desc.text = "You enter the Molten Crucible & Artificer Forge. Heat radiates from roaring blast furnaces where Iron Choir engineers forge runic battle plates and synthesize Echo Dust into pristine card cores."
	elif interior_id == "interior_training_ring":
		interior_desc.text = "You step into the Grand Arena Sparring Ring. Heavy crimson banners hang over the packed-sand dueling arena. Veteran fighters test their lane resonance combinations in intense tactical drills."
	elif interior_id == "interior_player_apartment":
		interior_desc.text = "You enter your personal Duelist Quarters. Lavender twilight streams through the arched glass window overlooking the harbor. Your card cataloging desk and strategy journal are neatly organized."
	elif interior_id == "interior_tournament_registration":
		interior_desc.text = "You enter the Grand Tournament Inscription Rotunda. Soaring marble columns support a dome of celestial glass. The official roster of Convergence champions is inscribed upon towering brass tablets."
	else:
		interior_desc.text = "You step out of the coastal harbor wind into the warm, illuminated halls of %s." % interior_name

	interior_panel.visible = true

func _exit_interior() -> void:
	is_inside_interior = false
	current_interior_id = ""
	interior_panel.visible = false

# -----------------------------------------------------------------------------
# 9. RUNTIME PROCESS, INPUT & MOVEMENT
# -----------------------------------------------------------------------------
func _advance_time_of_day() -> void:
	GameState.world_time_minutes = fmod(GameState.world_time_minutes + 180.0, 1440.0)
	var hr := int(GameState.world_time_minutes / 60.0)
	if hr >= 19 or hr < 6:
		sun_light.light_color = Color(0.55, 0.65, 0.95)
		sun_light.light_energy = 0.65
		GameState.current_weather = "clear_night"
	elif hr >= 16:
		sun_light.light_color = Color(1.0, 0.74, 0.52)
		sun_light.light_energy = 0.95
		GameState.current_weather = "golden_sunset"
	else:
		sun_light.light_color = Color(1.0, 0.95, 0.86)
		sun_light.light_energy = 1.15
		GameState.current_weather = "clear_day"
	_refresh_hud_text()

func _refresh_hud_text() -> void:
	var deck := GameState.get_active_deck()
	var hr := int(GameState.world_time_minutes / 60.0)
	var mn := int(fmod(GameState.world_time_minutes, 60.0))
	hud_status_label.text = "LUMENPORT (%s) | %02d:%02d | %s | Crowns: %d | Dust: %d | Active Deck: %s | [WASD] Move [Q/R] Rotate 90°" % [
		GameState.current_district,
		hr,
		mn,
		GameState.current_weather,
		GameState.crowns,
		GameState.echo_dust,
		deck.get("name", "Starter Deck")
	]

func _physics_process(delta: float) -> void:
	if is_inside_interior or dialogue_modal.visible or quest_journal_modal.visible:
		return

	var input_dir := Vector2.ZERO
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
		input_dir.y -= 1.0
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
		input_dir.y += 1.0
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
		input_dir.x -= 1.0
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
		input_dir.x += 1.0

	if input_dir.length() > 0.0:
		input_dir = input_dir.normalized()
		var yaw_rad := deg_to_rad(camera_yaw_target)
		var forward := Vector3(sin(yaw_rad), 0, cos(yaw_rad))
		var right := Vector3(cos(yaw_rad), 0, -sin(yaw_rad))
		var move_vec := (right * input_dir.x + forward * input_dir.y).normalized()
		player_body.velocity = move_vec * MOVE_SPEED
		player_body.move_and_slide()

		# Smooth model facing rotation
		var visual = player_body.get_node_or_null("DuelistVisual")
		if visual:
			var target_rot := atan2(move_vec.x, move_vec.z)
			visual.rotation.y = lerp_angle(visual.rotation.y, target_rot, delta * 12.0)

	camera_pivot.position = camera_pivot.position.lerp(player_body.position, delta * 8.0)
	camera_pivot.rotation_degrees.y = lerpf(camera_pivot.rotation_degrees.y, camera_yaw_target, delta * 8.0)
	iso_camera.size = lerpf(iso_camera.size, camera_size_target, delta * 8.0)

	if minimap_label:
		minimap_label.text = "MINIMAP TELEMETRY\nDistricts: 6 | Interiors: 6 | NPCs: %d\nPlayer Coords: (%.1f, %.1f)\nCamera Yaw: %.0f°\n[J] Quests | [B] Deck Builder" % [
			GameState.npcs.size(),
			player_body.position.x,
			player_body.position.z,
			camera_yaw_target
		]

	_check_nearby_interactions()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_ESCAPE:
			if dialogue_modal.visible:
				dialogue_modal.visible = false
			elif quest_journal_modal.visible:
				quest_journal_modal.visible = false
			elif interior_panel.visible:
				_exit_interior()
			else:
				get_tree().change_scene_to_file("res://scenes/ui/main_menu.tscn")
		elif event.keycode == KEY_J:
			toggle_quest_journal()
		elif event.keycode == KEY_B:
			get_tree().change_scene_to_file("res://scenes/ui/deck_builder.tscn")
		elif event.keycode == KEY_Q:
			camera_yaw_target -= 90.0
		elif event.keycode == KEY_E:
			if active_prompt_interior.has("id"):
				_enter_interior(active_prompt_interior["id"], active_prompt_interior["name"])
			elif active_prompt_npc.has("id"):
				_open_dialogue_with_active_npc()
			else:
				camera_yaw_target += 90.0
		elif event.keycode == KEY_R:
			camera_yaw_target += 90.0
	elif event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			camera_size_target = clampf(camera_size_target - 1.5, 10.0, 30.0)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			camera_size_target = clampf(camera_size_target + 1.5, 10.0, 30.0)

func _check_nearby_interactions() -> void:
	# 1. Check nearby interior doors first
	var closest_door: Dictionary = {}
	var door_dist := 3.2
	for marker in interior_markers:
		var d := player_body.position.distance_to(marker["pos"])
		if d < door_dist:
			door_dist = d
			closest_door = marker

	if closest_door.has("id"):
		active_prompt_interior = closest_door
		active_prompt_npc = {}
		prompt_label.text = "🏛 %s\nPress [E] to Enter Interior" % closest_door["name"]
		prompt_panel.visible = true
		return
	else:
		active_prompt_interior = {}

	# 2. Check nearby NPCs
	var closest: Dictionary = {}
	var best_dist := 3.6
	for item in npc_nodes:
		var node: Node3D = item["node"]
		var d := player_body.position.distance_to(node.position)
		if d < best_dist:
			best_dist = d
			closest = item["data"]

	if closest.has("id"):
		active_prompt_npc = closest
		var rel: int = int(GameState.relationships.get(closest["id"], 20))
		var tier := "Bonded" if rel >= 85 else ("Trusted" if rel >= 65 else ("Friendly" if rel >= 40 else "Acquaintance"))
		prompt_label.text = "%s (%s) — Bond: %d/100 [%s] | AI: %s\n\"%s\"\n[E] Speak / Quest Dialogue  |  ⚔ Challenge to Duel" % [
			closest.get("name", ""),
			closest.get("title", ""),
			rel,
			tier,
			str(closest.get("companion_ai_profile", "tactical")),
			closest.get("dialogue", {}).get("greeting", "")
		]
		prompt_panel.visible = true
	else:
		active_prompt_npc = {}
		prompt_panel.visible = false

func _start_duel(npc_id: String, format: String = "standard_1v1") -> void:
	GameState.selected_npc_id = npc_id
	GameState.selected_match_format = format
	get_tree().change_scene_to_file("res://scenes/battle/tabletop_arena.tscn")
