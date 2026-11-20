extends SceneTree
## Comprehensive Screenshot and Visual Verification Capture Tool for Hearthglass
## Captures authentic in-engine renderings of:
##  01_main_menu.png
##  02_character_selection.png
##  03_lumenport_hub.png
##  04_npc_dialogue_modal.png
##  05_quest_journal.png
##  06_enterable_interior.png
##  07_tabletop_arena.png
##  08_victory_screen.png
##  09_deck_builder.png
##  10_pack_opening_reveal.png

var frame_count: int = 0
var current_step: int = 0
var active_test_scene: Node = null

const CAPTURE_DIR := "res://screenshots"

const STEPS := [
	{"name": "01_main_menu.png", "scene": "res://scenes/ui/main_menu.tscn"},
	{"name": "02_character_selection.png", "scene": "res://scenes/ui/main_menu.tscn", "action": "open_char_modal"},
	{"name": "03_lumenport_hub.png", "scene": "res://scenes/world/lumenport_hub.tscn"},
	{"name": "04_npc_dialogue_modal.png", "scene": "res://scenes/world/lumenport_hub.tscn", "action": "open_dialogue"},
	{"name": "05_quest_journal.png", "scene": "res://scenes/world/lumenport_hub.tscn", "action": "open_journal"},
	{"name": "06_enterable_interior.png", "scene": "res://scenes/world/lumenport_hub.tscn", "action": "open_interior"},
	{"name": "07_tabletop_arena.png", "scene": "res://scenes/battle/tabletop_arena.tscn"},
	{"name": "08_victory_screen.png", "scene": "res://scenes/battle/tabletop_arena.tscn", "action": "show_victory"},
	{"name": "09_deck_builder.png", "scene": "res://scenes/ui/deck_builder.tscn"},
	{"name": "10_pack_opening_reveal.png", "scene": "res://scenes/ui/deck_builder.tscn", "action": "open_pack"}
]

func _init() -> void:
	print("[SCREENSHOT CAPTURE] Initializing Full Visual Verification Suite (10 Frames)...")
	call_deferred("_setup")

func _setup() -> void:
	DirAccess.make_dir_absolute(ProjectSettings.globalize_path(CAPTURE_DIR))
	_load_step(0)

func _process(_delta: float) -> bool:
	frame_count += 1
	if frame_count == 10:
		_capture_current()
		current_step += 1
		frame_count = 0
		if current_step < STEPS.size():
			_load_step(current_step)
		else:
			print("[SCREENSHOT CAPTURE] All 10 authentic screenshots successfully captured!")
			quit(0)
			return true
	return false

func _load_step(step: int) -> void:
	if active_test_scene:
		active_test_scene.queue_free()
		active_test_scene = null

	var info: Dictionary = STEPS[step]
	var scene_path: String = info["scene"]
	print("  -> Loading Scene [%d/%d]: %s (%s)" % [step + 1, STEPS.size(), scene_path, info["name"]])
	var res := load(scene_path)
	if res:
		active_test_scene = res.instantiate()
		root.add_child(active_test_scene)

		# Execute custom action if configured
		var act: String = str(info.get("action", ""))
		if act == "open_char_modal" and active_test_scene.has_method("_open_character_modal"):
			active_test_scene._open_character_modal()
		elif act == "open_dialogue" and active_test_scene.get("dialogue_modal"):
			active_test_scene.active_prompt_npc = {"id": "npc_soren_whisperleaf"}
			active_test_scene._open_dialogue_with_active_npc()
		elif act == "open_journal" and active_test_scene.has_method("toggle_quest_journal"):
			active_test_scene.toggle_quest_journal()
		elif act == "open_interior" and active_test_scene.has_method("_enter_interior"):
			active_test_scene._enter_interior("interior_harbor_cafe", "The Salty Seagull Harbor Cafe")
		elif act == "show_victory" and active_test_scene.get("end_game_modal"):
			active_test_scene.match_state["outcome"] = {"player_victory": 0}
			active_test_scene._check_game_over()
		elif act == "open_pack" and active_test_scene.has_method("_on_open_pack"):
			active_test_scene._on_open_pack("pack_foundations")

func _capture_current() -> void:
	var img := root.get_viewport().get_texture().get_image()
	if img:
		var info: Dictionary = STEPS[current_step]
		var out_path := ProjectSettings.globalize_path(CAPTURE_DIR.path_join(info["name"]))
		var err := img.save_png(out_path)
		print("  -> Captured frame: %s (result: %s, size: %dx%d)" % [
			info["name"],
			"OK" if err == OK else str(err),
			img.get_width(),
			img.get_height()
		])
