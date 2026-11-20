extends Node
## Global GameState Autoload (Singleton)
## Holds loaded 480 canonical cards, 16 starter decks, active deck ID, Lumenport world data,
## persistent profile (Crowns, Echo Dust, Sigils, Collection, Relationships, Quests),
## and enforces strict outcome-dependent, transaction-safe duel rewards.

signal wallet_updated(crowns: int, echo_dust: int)
signal collection_updated()

const SAVE_PATH := "user://hearthglass_profile_v1.json"

var cards: Array = []
var all_cards: Array:
	get:
		return cards
var cards_by_id: Dictionary = {}
var starter_decks: Array = []
var npcs: Array = []
var districts: Array = []
var interiors: Array = []
var quests: Array = []
var quest_objective_progress: Dictionary = {}

# Persistent Player Profile State
var user_id: String = "guest_duelist_local"
var auth_token: String = ""
var player_name: String = "Aerin Vanguard"
var crowns: int = 1100
var echo_dust: int = 460
var sigils: int = 12
var active_deck_id: String = "deck_ember_iron_forge"
var collection: Dictionary = {}
var relationships: Dictionary = {}
var claimed_matches: Dictionary = {} # match_id -> true
var quest_states: Dictionary = {}     # quest_id -> "available" | "active" | "completed"

# Runtime World State
var current_district: String = "lumenport_arrival_square"
var current_weather: String = "clear_day"
var world_time_minutes: float = 600.0 # 10:00 AM
var selected_npc_id: String = "npc_master_vance"
var selected_match_format: String = "standard_1v1"

func _ready() -> void:
	_load_canonical_data()
	load_local_profile()

func _load_canonical_data() -> void:
	# 1. Load 480 Canonical Cards
	var cards_file := FileAccess.open("res://../../content/cards/foundations_v1.json", FileAccess.READ)
	if not cards_file:
		cards_file = FileAccess.open("res://content/cards/foundations_v1.json", FileAccess.READ)
	if cards_file:
		var json_text := cards_file.get_as_text()
		var parsed = JSON.parse_string(json_text)
		if typeof(parsed) == TYPE_DICTIONARY and parsed.has("cards"):
			cards = parsed["cards"]
			for c in cards:
				cards_by_id[str(c.get("id"))] = c

	# 2. Load 16 Starter Decks
	var decks_file := FileAccess.open("res://../../content/cards/starter_decks.json", FileAccess.READ)
	if not decks_file:
		decks_file = FileAccess.open("res://content/cards/starter_decks.json", FileAccess.READ)
	if decks_file:
		var json_text := decks_file.get_as_text()
		var parsed = JSON.parse_string(json_text)
		if typeof(parsed) == TYPE_DICTIONARY and parsed.has("decks"):
			starter_decks = parsed["decks"]

	# 3. Load Lumenport NPCs, Districts, and Interiors
	var npcs_file := FileAccess.open("res://../../content/npcs/lumenport_npcs.json", FileAccess.READ)
	if not npcs_file:
		npcs_file = FileAccess.open("res://content/npcs/lumenport_npcs.json", FileAccess.READ)
	if npcs_file:
		var json_text := npcs_file.get_as_text()
		var parsed = JSON.parse_string(json_text)
		if typeof(parsed) == TYPE_DICTIONARY:
			if parsed.has("npcs"):
				npcs = parsed["npcs"]
			if parsed.has("districts"):
				districts = parsed["districts"]
			if parsed.has("interiors"):
				interiors = parsed["interiors"]

	# 4. Load Lumenport Act I Quests
	var quests_file := FileAccess.open("res://../../content/quests/act1_quests.json", FileAccess.READ)
	if not quests_file:
		quests_file = FileAccess.open("res://content/quests/act1_quests.json", FileAccess.READ)
	if quests_file:
		var json_text := quests_file.get_as_text()
		var parsed = JSON.parse_string(json_text)
		if typeof(parsed) == TYPE_DICTIONARY and parsed.has("quests"):
			quests = parsed["quests"]

	# Initialize default collection if empty
	if collection.is_empty():
		for c in cards:
			collection[str(c.get("id"))] = 3

	# Initialize default relationships if empty
	if relationships.is_empty():
		for n in npcs:
			relationships[str(n.get("id"))] = 20

func get_active_deck() -> Dictionary:
	for d in starter_decks:
		if d.get("id") == active_deck_id:
			return d
	if starter_decks.size() > 0:
		return starter_decks[0]
	return {}

func get_npc(npc_id: String) -> Dictionary:
	for n in npcs:
		if n.get("id") == npc_id:
			return n
	return {}

## Interactive NPC dialogue interface
func interact_with_npc(npc_id: String) -> Dictionary:
	var npc := get_npc(npc_id)
	if npc.is_empty():
		return {"success": false, "error": "NPC not found"}
	var dialogue: Dictionary = npc.get("dialogue", {})
	var greeting: String = str(dialogue.get("greeting", ""))
	var rel: int = int(relationships.get(npc_id, 20))

	# Advance speak/visit objectives for active quests
	for q in quests:
		var qid: String = str(q.get("id", ""))
		if str(quest_states.get(qid, "")) != "active" and str(q.get("status", "")) != "active":
			continue
		var objs: Array = q.get("objectives", [])
		var progress: Dictionary = quest_objective_progress.get(qid, {})
		var all_done := true
		for obj in objs:
			var obj_id: String = str(obj.get("id", ""))
			var target_count: int = int(obj.get("target_count", 1))
			var cur_count: int = int(progress.get(obj_id, 0))
			var desc: String = str(obj.get("description", "")).to_lower()
			if (obj_id.contains("speak") or obj_id.contains("visit") or desc.contains("speak") or desc.contains("visit")) and cur_count < target_count:
				var npc_short_id: String = npc_id.replace("npc_", "").to_lower()
				if desc.contains(npc_short_id) or (npc_id == "npc_master_vance" and desc.contains("vance")) or (npc_id == "npc_soren_whisperleaf" and desc.contains("soren")) or (npc_id == "npc_marshal_corin" and desc.contains("corin")):
					cur_count += 1
					progress[obj_id] = cur_count
			if cur_count < target_count:
				all_done = false
		quest_objective_progress[qid] = progress
		if all_done and objs.size() > 0:
			q["status"] = "completed"
			quest_states[qid] = "completed"

	save_local_profile()
	return {
		"success": true,
		"npc_id": npc_id,
		"name": npc.get("name", ""),
		"title": npc.get("title", ""),
		"relationship": rel,
		"greeting": greeting,
		"dialogue": dialogue
	}

## Quest management with persistent tracking
func accept_quest(quest_id: String) -> bool:
	for q in quests:
		if str(q.get("id")) == quest_id:
			quest_states[quest_id] = "active"
			q["status"] = "active"
			save_local_profile()
			return true
	return false

func complete_quest(quest_id: String) -> bool:
	for q in quests:
		if str(q.get("id")) == quest_id:
			quest_states[quest_id] = "completed"
			q["status"] = "completed"
			save_local_profile()
			return true
	return false

func get_quest_status(quest_id: String) -> String:
	return str(quest_states.get(quest_id, "available"))

## Strict, outcome-dependent, idempotent match reward processor
func process_match_rewards(match_state: Dictionary, npc_id: String) -> Dictionary:
	# 1. Authoritative match must have ended
	var outcome = match_state.get("outcome")
	if outcome == null or (typeof(outcome) == TYPE_STRING and outcome == "in_progress"):
		return {"success": false, "error": "Match is still in progress"}

	# 2. Local player must be the winning participant
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
		elif outcome.has("TeamVictory") and int(outcome["TeamVictory"]) == 0:
			is_victory = true

	if not is_victory:
		if typeof(outcome) == TYPE_STRING and str(outcome).to_lower() == "draw":
			return {"success": false, "error": "Match ended in a draw, no victory reward granted"}
		if typeof(outcome) == TYPE_DICTIONARY and outcome.has("draw"):
			return {"success": false, "error": "Match ended in a draw, no victory reward granted"}
		return {"success": false, "error": "Player did not win the authoritative match"}

	# 3. Match ID validation & idempotency (duplicate prevention)
	var match_id: String = str(match_state.get("match_id", ""))
	if match_id.strip_edges() == "":
		return {"success": false, "error": "Missing authoritative match_id"}

	if claimed_matches.has(match_id):
		return {"success": false, "error": "Reward already claimed for this match"}

	# 4. Valid encounter check
	var npc := get_npc(npc_id)
	if npc.is_empty():
		return {"success": false, "error": "Invalid encounter NPC"}

	# Mark match as claimed
	claimed_matches[match_id] = true

	# Grant authoritative rewards
	var rewards: Dictionary = npc.get("rewards", {"crowns": 100, "echo_dust": 30, "relationship_gain": 8})
	var earned_crowns: int = int(rewards.get("crowns", 100))
	var earned_dust: int = int(rewards.get("echo_dust", 30))
	var earned_rel: int = int(rewards.get("relationship_gain", 8))

	crowns += earned_crowns
	echo_dust += earned_dust
	var cur_rel: int = int(relationships.get(npc_id, 20))
	relationships[npc_id] = mini(100, cur_rel + earned_rel)

	var bonus_card: String = str(rewards.get("bonus_card_id", ""))
	if bonus_card != "":
		collection[bonus_card] = int(collection.get(bonus_card, 0)) + 1

	# Advance matching quest objectives only (objective isolation)
	for q in quests:
		var qid: String = str(q.get("id", ""))
		if str(quest_states.get(qid, "")) != "active" and str(q.get("status", "")) != "active":
			continue
		var objs: Array = q.get("objectives", [])
		var progress: Dictionary = quest_objective_progress.get(qid, {})
		var all_done := true
		for obj in objs:
			var obj_id: String = str(obj.get("id", ""))
			var target_count: int = int(obj.get("target_count", 1))
			var cur_count: int = int(progress.get(obj_id, 0))
			var desc: String = str(obj.get("description", "")).to_lower()
			var target_str: String = str(obj.get("target", "")).to_lower()
			var is_match := false

			if target_str != "" and (target_str == npc_id.to_lower() or target_str == str(npc.get("name", "")).to_lower()):
				is_match = true
			elif obj_id.contains("duel") or obj_id.contains("defeat") or desc.contains("duel") or desc.contains("defeat"):
				var npc_name: String = str(npc.get("name", "")).to_lower()
				var npc_short_id: String = npc_id.replace("npc_", "").to_lower()
				if desc.contains(npc_short_id) or desc.contains(npc_name) or (npc_id == "npc_master_vance" and desc.contains("vance")) or (npc_id == "npc_kaelen_emberforge" and desc.contains("kaelen")) or (npc_id == "npc_lyra_vane" and desc.contains("lyra")):
					is_match = true
				elif not desc.contains("kaelen") and not desc.contains("lyra") and not desc.contains("vance") and not desc.contains("corin") and not desc.contains("soren"):
					is_match = true

			if is_match and cur_count < target_count:
				cur_count += 1
				progress[obj_id] = cur_count

			if cur_count < target_count:
				all_done = false

		quest_objective_progress[qid] = progress
		if all_done and objs.size() > 0:
			q["status"] = "completed"
			quest_states[qid] = "completed"

	save_local_profile()
	wallet_updated.emit(crowns, echo_dust)
	collection_updated.emit()

	return {
		"success": true,
		"crowns": earned_crowns,
		"echo_dust": earned_dust,
		"relationship_gain": earned_rel,
		"bonus_card_id": bonus_card,
		"match_id": match_id
	}

## Explicit match victory wrapper; empty match states are rejected to prevent fabricated victories
func award_duel_victory(npc_id: String, match_state: Dictionary = {}) -> Dictionary:
	if match_state.is_empty():
		return {"success": false, "error": "Match outcome state is required; synthetic victories are disallowed"}
	return process_match_rewards(match_state, npc_id)

func save_local_profile() -> void:
	# Note: auth_token is never stored in unencrypted game_save.json to prevent token exposure
	var data := {
		"user_id": user_id,
		"player_name": player_name,
		"crowns": crowns,
		"echo_dust": echo_dust,
		"sigils": sigils,
		"active_deck_id": active_deck_id,
		"collection": collection,
		"relationships": relationships,
		"claimed_matches": claimed_matches,
		"quest_states": quest_states,
		"quest_objective_progress": quest_objective_progress
	}
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(data, "\t"))

func load_local_profile() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var parsed = JSON.parse_string(FileAccess.get_file_as_string(SAVE_PATH))
	if typeof(parsed) == TYPE_DICTIONARY:
		user_id = str(parsed.get("user_id", user_id))
		# auth_token is kept in transient session memory, not imported from local JSON
		player_name = str(parsed.get("player_name", player_name))
		crowns = int(parsed.get("crowns", crowns))
		echo_dust = int(parsed.get("echo_dust", echo_dust))
		active_deck_id = str(parsed.get("active_deck_id", active_deck_id))
		if parsed.has("collection") and typeof(parsed["collection"]) == TYPE_DICTIONARY:
			collection = parsed["collection"]
		if parsed.has("relationships") and typeof(parsed["relationships"]) == TYPE_DICTIONARY:
			relationships = parsed["relationships"]
		if parsed.has("claimed_matches") and typeof(parsed["claimed_matches"]) == TYPE_DICTIONARY:
			claimed_matches = parsed["claimed_matches"]
		if parsed.has("quest_states") and typeof(parsed["quest_states"]) == TYPE_DICTIONARY:
			quest_states = parsed["quest_states"]
			for q in quests:
				var qid: String = str(q.get("id", ""))
				if quest_states.has(qid):
					q["status"] = quest_states[qid]
		if parsed.has("quest_objective_progress") and typeof(parsed["quest_objective_progress"]) == TYPE_DICTIONARY:
			quest_objective_progress = parsed["quest_objective_progress"]
