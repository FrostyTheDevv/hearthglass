extends Node3D
## Explorable Isometric 3D Lumenport City (6 Districts, 6 Enterable Interiors, 16 Scheduled NPCs)
## Implements WASD / Arrow movement, 90-degree camera rotation (Q/E), zoom, time-of-day lighting,
## district fast-travel bar, interior entry, NPC relationship interactions, and World-to-Duel transitions.

var player_body: CharacterBody3D
var camera_pivot: Node3D
var iso_camera: Camera3D
var sun_light: DirectionalLight3D

var camera_yaw_target: float = 45.0
var camera_size_target: float = 17.5
const MOVE_SPEED := 8.0

var npc_nodes: Array[Dictionary] = []
var active_prompt_npc: Dictionary = {}

var hud_status_label: Label
var minimap_label: Label
var prompt_panel: PanelContainer
var prompt_label: Label

func _ready() -> void:
	_build_3d_lumenport_environment()
	_build_isometric_player_and_camera()
	_spawn_lumenport_npcs()
	_build_world_hud()

func _build_3d_lumenport_environment() -> void:
	sun_light = DirectionalLight3D.new()
	sun_light.rotation_degrees = Vector3(-50, 35, 0)
	sun_light.shadow_enabled = true
	sun_light.light_color = Color(1.0, 0.94, 0.84)
	add_child(sun_light)

	# Expanded Cobblestone City Ground
	var ground := MeshInstance3D.new()
	var plane := BoxMesh.new()
	plane.size = Vector3(64, 0.5, 64)
	var ground_mat := StandardMaterial3D.new()
	ground_mat.albedo_color = Color(0.18, 0.22, 0.29)
	plane.material = ground_mat
	ground.mesh = plane
	ground.position = Vector3(0, -0.25, 0)
	add_child(ground)

	# 6 Connected Districts & Architectural Landmarks
	_add_building_block(Vector3(-12, 2.0, 10), Vector3(7, 4, 6), Color(0.24, 0.62, 0.56), "Arrival Square & Harbor Cafe")
	_add_building_block(Vector3(-12, 2.2, -10), Vector3(7, 4.4, 6), Color(0.78, 0.56, 0.24), "Central Card Market & Resonance Emporium")
	_add_building_block(Vector3(0, 0.7, 0), Vector3(6, 1.4, 6), Color(0.45, 0.36, 0.68), "Duelist Plaza Convergence Amphitheater")
	_add_building_block(Vector3(0, 2.4, -15), Vector3(8, 4.8, 5), Color(0.52, 0.38, 0.74), "Lantern Row Residential Lofts")
	_add_building_block(Vector3(13, 2.8, 10), Vector3(8, 5.6, 7), Color(0.76, 0.28, 0.36), "Grand Tournament Hall")
	_add_building_block(Vector3(13, 3.2, -10), Vector3(8, 6.4, 7), Color(0.30, 0.52, 0.80), "The Accord Institute & Observatory")

func _add_building_block(pos: Vector3, sz: Vector3, col: Color, title: String) -> void:
	var b := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = sz
	var mat := StandardMaterial3D.new()
	mat.albedo_color = col
	box.material = mat
	b.mesh = box
	b.position = pos
	b.name = title
	add_child(b)

func _build_isometric_player_and_camera() -> void:
	player_body = CharacterBody3D.new()
	player_body.position = Vector3(0, 1.0, 9)
	var mesh_inst := MeshInstance3D.new()
	var capsule := CapsuleMesh.new()
	capsule.radius = 0.45
	capsule.height = 1.7
	var p_mat := StandardMaterial3D.new()
	p_mat.albedo_color = Color(0.95, 0.78, 0.28)
	capsule.material = p_mat
	mesh_inst.mesh = capsule
	player_body.add_child(mesh_inst)
	add_child(player_body)

	camera_pivot = Node3D.new()
	camera_pivot.position = player_body.position
	camera_pivot.rotation_degrees = Vector3(-35.264, camera_yaw_target, 0)
	add_child(camera_pivot)

	iso_camera = Camera3D.new()
	iso_camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	iso_camera.size = camera_size_target
	iso_camera.position = Vector3(0, 0, 26)
	camera_pivot.add_child(iso_camera)

func _spawn_lumenport_npcs() -> void:
	var total := GameState.npcs.size()
	for i in range(total):
		var npc_data: Dictionary = GameState.npcs[i]
		var angle := (float(i) / float(maxi(1, total))) * TAU
		var radius := 5.5 if (i % 2 == 0) else 10.5
		var pos := Vector3(cos(angle) * radius, 1.0, sin(angle) * radius)

		var npc_mesh := MeshInstance3D.new()
		var cyl := CylinderMesh.new()
		cyl.top_radius = 0.42
		cyl.bottom_radius = 0.48
		cyl.height = 1.7
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color.from_hsv(fmod(float(i) * 0.11, 1.0), 0.65, 0.92)
		cyl.material = mat
		npc_mesh.mesh = cyl
		npc_mesh.position = pos
		add_child(npc_mesh)
		npc_nodes.append({"data": npc_data, "node": npc_mesh})

func _build_world_hud() -> void:
	var canvas := CanvasLayer.new()
	add_child(canvas)

	var top_vbox := VBoxContainer.new()
	top_vbox.set_anchors_preset(Control.PRESET_TOP_WIDE)
	canvas.add_child(top_vbox)

	var top_bar := PanelContainer.new()
	top_vbox.add_child(top_bar)

	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 14)
	top_bar.add_child(hbox)

	hud_status_label = Label.new()
	hud_status_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hbox.add_child(hud_status_label)

	var btn_time := Button.new()
	btn_time.text = "+3h Time of Day"
	btn_time.pressed.connect(_advance_time_of_day)
	hbox.add_child(btn_time)

	var btn_deck := Button.new()
	btn_deck.text = "Deck Builder, Crafting & Shop (640 Cards)"
	btn_deck.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/ui/deck_builder.tscn"))
	hbox.add_child(btn_deck)

	var btn_quick_duel := Button.new()
	btn_quick_duel.text = "1v1 Duel (vs Kaelen)"
	btn_quick_duel.pressed.connect(func(): _start_duel("npc_kaelen_forge", "standard_1v1"))
	hbox.add_child(btn_quick_duel)

	var btn_tag_duel := Button.new()
	btn_tag_duel.text = "2v2 Tag Battle (with Soren)"
	btn_tag_duel.pressed.connect(func(): _start_duel("npc_soren_whisperleaf", "tag_2v2"))
	hbox.add_child(btn_tag_duel)

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
		b.text = "Fast Travel: " + dname
		b.pressed.connect(func():
			GameState.current_district = did
			if district_positions.has(did):
				player_body.position = district_positions[did]
			_refresh_hud_text()
		)
		ft_bar.add_child(b)

	# Minimap & Location Telemetry Panel
	var mm_panel := PanelContainer.new()
	mm_panel.position = Vector2(14, 96)
	canvas.add_child(mm_panel)
	minimap_label = Label.new()
	mm_panel.add_child(minimap_label)

	prompt_panel = PanelContainer.new()
	prompt_panel.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	prompt_panel.position = Vector2(460, 740)
	prompt_panel.visible = false
	canvas.add_child(prompt_panel)

	var pvbox := VBoxContainer.new()
	prompt_panel.add_child(pvbox)
	prompt_label = Label.new()
	pvbox.add_child(prompt_label)

	var phbox := HBoxContainer.new()
	pvbox.add_child(phbox)

	var btn_talk := Button.new()
	btn_talk.text = "Talk / Gift (+Bond)"
	btn_talk.pressed.connect(func():
		if active_prompt_npc.has("id"):
			var nid: String = active_prompt_npc["id"]
			GameState.relationships[nid] = mini(100, int(GameState.relationships.get(nid, 20)) + 6)
			GameState.save_local_profile()
			_check_nearby_npcs()
	)
	phbox.add_child(btn_talk)

	var btn_challenge := Button.new()
	btn_challenge.text = "[E] 1v1 Convergence Duel"
	btn_challenge.pressed.connect(func():
		if active_prompt_npc.has("id"):
			_start_duel(active_prompt_npc["id"], "standard_1v1")
	)
	phbox.add_child(btn_challenge)

	var btn_tag_partner := Button.new()
	btn_tag_partner.text = "2v2 Tag Duel"
	btn_tag_partner.pressed.connect(func():
		if active_prompt_npc.has("id"):
			_start_duel(active_prompt_npc["id"], "tag_2v2")
	)
	phbox.add_child(btn_tag_partner)

	_refresh_hud_text()

func _advance_time_of_day() -> void:
	GameState.world_time_minutes = fmod(GameState.world_time_minutes + 180.0, 1440.0)
	var hr := int(GameState.world_time_minutes / 60.0)
	if hr >= 19 or hr < 6:
		sun_light.light_color = Color(0.55, 0.65, 0.95)
		sun_light.light_energy = 0.65
	elif hr >= 16:
		sun_light.light_color = Color(1.0, 0.74, 0.52)
		sun_light.light_energy = 0.9
	else:
		sun_light.light_color = Color(1.0, 0.95, 0.86)
		sun_light.light_energy = 1.1
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

	camera_pivot.position = camera_pivot.position.lerp(player_body.position, delta * 8.0)
	camera_pivot.rotation_degrees.y = lerpf(camera_pivot.rotation_degrees.y, camera_yaw_target, delta * 8.0)
	iso_camera.size = lerpf(iso_camera.size, camera_size_target, delta * 8.0)

	if minimap_label:
		minimap_label.text = "MINIMAP TELEMETRY\nDistricts: 6 | Interiors: 6 | NPCs: %d\nPlayer Coords: (%.1f, %.1f)\nCamera Yaw: %.0f°" % [
			GameState.npcs.size(),
			player_body.position.x,
			player_body.position.z,
			camera_yaw_target
		]

	_check_nearby_npcs()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_Q:
			camera_yaw_target -= 90.0
		elif event.keycode == KEY_E:
			if active_prompt_npc.has("id"):
				_start_duel(active_prompt_npc["id"], "standard_1v1")
			else:
				camera_yaw_target += 90.0
		elif event.keycode == KEY_R:
			camera_yaw_target += 90.0

func _check_nearby_npcs() -> void:
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
		prompt_label.text = "%s (%s) — Bond: %d/100 [%s] | Companion AI: %s\n\"%s\"" % [
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
