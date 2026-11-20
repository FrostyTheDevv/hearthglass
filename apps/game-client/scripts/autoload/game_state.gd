extends Node
## Global GameState Autoload (Singleton)
## Holds loaded canonical card catalogue, starter decks, Lumenport world data,
## enforces strict separation of Offline Campaign Profile vs. Authenticated Online Account,
## and guarantees outcome-dependent, transaction-safe, idempotent duel rewards.

signal wallet_updated(crowns: int, echo_dust: int)
signal collection_updated()
signal economy_mode_changed(mode: String)

const OFFLINE_SAVE_PATH := "user://hearthglass_offline_profile.json"
const ONLINE_CACHE_PATH := "user://hearthglass_online_cache.json"
const LEGACY_SAVE_PATH := "user://hearthglass_profile_v1.json"

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

# Economy & Account Mode: "offline" (local campaign) vs "online" (PostgreSQL platform API)
var account_mode: String = "offline" # "offline" | "online"
var api_base_url: String = "http://127.0.0.1:4173"
var ws_base_url: String = "ws://127.0.0.1:4173/v1/ws"
var user_id: String = "guest_duelist_local"
var auth_token: String = ""
var online_authenticated: bool = false
var player_name: String = "Aerin Vanguard"
var active_deck_id: String = "deck_ember_iron_forge"

# Offline Campaign Economy State (Persisted locally in OFFLINE_SAVE_PATH)
var offline_crowns: int = 1100
var offline_echo_dust: int = 460
var offline_sigils: int = 12
var offline_collection: Dictionary = {}
var offline_claimed_matches: Dictionary = {} # match_id -> true

# Authenticated Online Account State (Updated strictly from server API responses)
var online_crowns: int = 0
var online_echo_dust: int = 0
var online_sigils: int = 0
var online_collection: Dictionary = {}
var online_claimed_matches: Dictionary = {}

# Active Mirrored Properties (for UI components and backwards compatibility)
var crowns: int = 1100:
	set(val):
		crowns = val
		if account_mode == "offline":
			offline_crowns = val
		elif account_mode == "online":
			online_crowns = val
var echo_dust: int = 460:
	set(val):
		echo_dust = val
		if account_mode == "offline":
			offline_echo_dust = val
		elif account_mode == "online":
			online_echo_dust = val
var sigils: int = 12:
	set(val):
		sigils = val
		if account_mode == "offline":
			offline_sigils = val
		elif account_mode == "online":
			online_sigils = val
var collection: Dictionary = {}
var claimed_matches: Dictionary = {}
var relationships: Dictionary = {}
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
	_sync_active_wallet()

## Safe Content Loader: searches bundled PCK res://, development paths, and executable-relative folders
func _open_content_file(rel_path: String) -> FileAccess:
	var clean_rel := rel_path.trim_prefix("res://").trim_prefix("/")
	var exe_dir := OS.get_executable_path().get_base_dir()
	var candidates: Array[String] = [
		"res://" + clean_rel,
		"res://../../" + clean_rel,
		exe_dir.path_join(clean_rel),
		exe_dir.path_join("content").path_join(clean_rel.trim_prefix("content/")),
		ProjectSettings.globalize_path("res://" + clean_rel),
		ProjectSettings.globalize_path("res://../../" + clean_rel)
	]
	for p in candidates:
		if FileAccess.file_exists(p):
			var fa := FileAccess.open(p, FileAccess.READ)
			if fa != null:
				return fa
	return null

func _load_canonical_data() -> void:
	# 1. Load Canonical Card Catalogue
	var cards_file := _open_content_file("content/cards/foundations_v1.json")
	if cards_file:
		var parsed = JSON.parse_string(cards_file.get_as_text())
		if typeof(parsed) == TYPE_DICTIONARY and parsed.has("cards"):
			cards = parsed["cards"]
			cards_by_id.clear()
			for c in cards:
				cards_by_id[str(c.get("id"))] = c

	# 2. Load Starter Decks
	var decks_file := _open_content_file("content/cards/starter_decks.json")
	if decks_file:
		var parsed = JSON.parse_string(decks_file.get_as_text())
		if typeof(parsed) == TYPE_DICTIONARY and parsed.has("decks"):
			starter_decks = parsed["decks"]

	# 3. Load Lumenport NPCs, Districts, and Interiors
	var npcs_file := _open_content_file("content/npcs/lumenport_npcs.json")
	if npcs_file:
		var parsed = JSON.parse_string(npcs_file.get_as_text())
		if typeof(parsed) == TYPE_DICTIONARY:
			if parsed.has("npcs"):
				npcs = parsed["npcs"]
			if parsed.has("districts"):
				districts = parsed["districts"]
			if parsed.has("interiors"):
				interiors = parsed["interiors"]

	# 4. Load Lumenport Act I Quests
	var quests_file := _open_content_file("content/quests/act1_quests.json")
	if quests_file:
		var parsed = JSON.parse_string(quests_file.get_as_text())
		if typeof(parsed) == TYPE_DICTIONARY and parsed.has("quests"):
			quests = parsed["quests"]

	# Initialize default offline collection if empty
	if offline_collection.is_empty():
		for c in cards:
			offline_collection[str(c.get("id"))] = 3

	# Initialize default relationships if empty
	if relationships.is_empty():
		for n in npcs:
			relationships[str(n.get("id"))] = 20

func set_account_mode(mode: String) -> void:
	if mode != "offline" and mode != "online":
		mode = "offline"
	account_mode = mode
	_sync_active_wallet()
	economy_mode_changed.emit(account_mode)

func _sync_active_wallet() -> void:
	if account_mode == "online":
		crowns = online_crowns
		echo_dust = online_echo_dust
		sigils = online_sigils
		collection = online_collection
		claimed_matches = online_claimed_matches
	else:
		crowns = offline_crowns
		echo_dust = offline_echo_dust
		sigils = offline_sigils
		collection = offline_collection
		claimed_matches = offline_claimed_matches

	wallet_updated.emit(crowns, echo_dust)
	collection_updated.emit()

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

# ==============================================================================
# SEPARATED OFFLINE & ONLINE ECONOMY TRANSACTIONS
# ==============================================================================

## Offline Pack Purchase: strictly mutates only offline campaign profile
func purchase_pack_offline(pack_id: String = "pack_foundations") -> Dictionary:
	if offline_crowns < 100:
		return {
			"success": false,
			"error": "Insufficient Crowns in offline campaign wallet (requires 100 Crowns)."
		}

	offline_crowns -= 100
	offline_echo_dust += 40

	var pulled: Array[Dictionary] = []
	if all_cards.size() >= 5:
		for i in range(5):
			var r_idx := randi() % all_cards.size()
			var c: Dictionary = all_cards[r_idx]
			pulled.append(c)
			var cid: String = str(c.get("id"))
			offline_collection[cid] = int(offline_collection.get(cid, 0)) + 1

	save_local_profile()
	_sync_active_wallet()

	return {
		"success": true,
		"pack_id": pack_id,
		"cards": pulled,
		"echo_dust_gained": 40,
		"wallet": {
			"crowns": offline_crowns,
			"echo_dust": offline_echo_dust,
			"sigils": offline_sigils
		}
	}

## Online Pack Purchase: strictly requires server-validated response; never generates cards locally
func purchase_pack_online(pack_id: String = "pack_foundations", idempotency_key: String = "", custom_adapter: Callable = Callable()) -> Dictionary:
	if not online_authenticated and auth_token == "":
		return {
			"success": false,
			"error": "Authentication required: Cannot perform online pack purchase without a valid online session."
		}

	if idempotency_key == "":
		idempotency_key = "idem_%d_%d" % [Time.get_ticks_msec(), randi() % 100000]

	# Use typed adapter if supplied (or default mock/HTTP adapter)
	if custom_adapter.is_valid():
		var raw_res = custom_adapter.call(pack_id, idempotency_key)
		return _apply_online_pack_response(raw_res)

	# Direct network fallback: if server is unreachable, reject without altering local balances
	return {
		"success": false,
		"error": "Network failure: Unable to reach platform API (/v1/shop/purchase). No cards or currency were deducted."
	}

func _apply_online_pack_response(resp: Dictionary) -> Dictionary:
	if not bool(resp.get("success", false)):
		return {
			"success": false,
			"error": str(resp.get("error", "Online pack purchase was rejected by server."))
		}

	# Authoritative server balances applied to online wallet ONLY
	if resp.has("wallet") and typeof(resp["wallet"]) == TYPE_DICTIONARY:
		online_crowns = int(resp["wallet"].get("crowns", online_crowns))
		online_echo_dust = int(resp["wallet"].get("echo_dust", online_echo_dust))
		online_sigils = int(resp["wallet"].get("sigils", online_sigils))

	# Update online inventory strictly from server-returned cards
	var raw_cards: Array = resp.get("cards", [])
	var server_cards: Array[Dictionary] = []
	for item in raw_cards:
		var cid := ""
		if typeof(item) == TYPE_DICTIONARY:
			cid = str(item.get("id", item.get("card_id", "")))
			server_cards.append(item)
		elif typeof(item) == TYPE_STRING:
			cid = str(item)
			server_cards.append(cards_by_id.get(cid, {"id": cid, "name": cid}))
		if cid != "":
			online_collection[cid] = int(online_collection.get(cid, 0)) + 1

	save_online_cache()
	_sync_active_wallet()

	return {
		"success": true,
		"pack_id": str(resp.get("pack_id", "pack_foundations")),
		"cards": server_cards,
		"echo_dust_gained": int(resp.get("duplicate_echo_dust_gained", 0)),
		"idempotent_replay": bool(resp.get("idempotent_replay", false)),
		"wallet": {
			"crowns": online_crowns,
			"echo_dust": online_echo_dust,
			"sigils": online_sigils
		}
	}

## Offline Crafting: modifies offline Dust and offline collection only
func craft_card_offline(card_id: String) -> Dictionary:
	if offline_echo_dust < 100:
		return {
			"success": false,
			"error": "Insufficient Echo Dust in offline campaign wallet (requires 100 Dust)."
		}

	offline_echo_dust -= 100
	offline_collection[card_id] = int(offline_collection.get(card_id, 0)) + 1

	save_local_profile()
	_sync_active_wallet()

	return {
		"success": true,
		"card_id": card_id,
		"new_quantity": int(offline_collection.get(card_id, 0)),
		"wallet": {
			"crowns": offline_crowns,
			"echo_dust": offline_echo_dust
		}
	}

## Online Crafting: requires server validation; never mutates online balances locally
func craft_card_online(card_id: String, action: String = "craft", idempotency_key: String = "", custom_adapter: Callable = Callable()) -> Dictionary:
	if not online_authenticated and auth_token == "":
		return {
			"success": false,
			"error": "Authentication required: Cannot craft online without a valid online session."
		}

	if idempotency_key == "":
		idempotency_key = "craft_%d_%d" % [Time.get_ticks_msec(), randi() % 100000]

	if custom_adapter.is_valid():
		var raw_res = custom_adapter.call(card_id, action, idempotency_key)
		return _apply_online_craft_response(raw_res)

	return {
		"success": false,
		"error": "Network failure: Unable to reach platform API (/v1/crafting/create). No Dust deducted."
	}

func _apply_online_craft_response(resp: Dictionary) -> Dictionary:
	if not bool(resp.get("success", false)):
		return {
			"success": false,
			"error": str(resp.get("error", "Online crafting request rejected by server."))
		}

	if resp.has("wallet") and typeof(resp["wallet"]) == TYPE_DICTIONARY:
		online_echo_dust = int(resp["wallet"].get("echo_dust", online_echo_dust))
		online_crowns = int(resp["wallet"].get("crowns", online_crowns))

	var cid: String = str(resp.get("card_id", ""))
	var new_qty: int = int(resp.get("new_quantity", int(online_collection.get(cid, 0)) + 1))
	if cid != "":
		online_collection[cid] = new_qty

	save_online_cache()
	_sync_active_wallet()

	return {
		"success": true,
		"card_id": cid,
		"new_quantity": new_qty,
		"idempotent_replay": bool(resp.get("idempotent_replay", false)),
		"wallet": {
			"crowns": online_crowns,
			"echo_dust": online_echo_dust
		}
	}

# ==============================================================================
# RPG INTERACTION & QUEST TRACKING
# ==============================================================================

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

# ==============================================================================
# AUTHORITATIVE MATCH REWARD PROCESSING
# ==============================================================================

## Strict, outcome-dependent, idempotent duel reward processor.
## Never fabricates fallback rewards and strictly isolates offline vs online outcomes.
func process_match_rewards(match_state: Dictionary, npc_id: String) -> Dictionary:
	# 1. Distinguish offline vs online match outcomes
	if account_mode == "online":
		return {
			"success": false,
			"error": "Online match rewards are granted exclusively by the platform server; local reward synthesis is disabled.",
			"crowns": 0,
			"echo_dust": 0,
			"relationship_gain": 0,
			"already_claimed": false
		}

	# 2. Authoritative match must have ended
	var outcome = match_state.get("outcome")
	if outcome == null or (typeof(outcome) == TYPE_STRING and outcome == "in_progress"):
		return {
			"success": false,
			"error": "Match is still in progress",
			"crowns": 0,
			"echo_dust": 0,
			"relationship_gain": 0,
			"already_claimed": false
		}

	# 3. Local player must be the winning participant
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
			return {
				"success": false,
				"error": "Match ended in a draw, no victory reward granted",
				"crowns": 0,
				"echo_dust": 0,
				"relationship_gain": 0,
				"already_claimed": false
			}
		if typeof(outcome) == TYPE_DICTIONARY and outcome.has("draw"):
			return {
				"success": false,
				"error": "Match ended in a draw, no victory reward granted",
				"crowns": 0,
				"echo_dust": 0,
				"relationship_gain": 0,
				"already_claimed": false
			}
		return {
			"success": false,
			"error": "Player did not win the authoritative match",
			"crowns": 0,
			"echo_dust": 0,
			"relationship_gain": 0,
			"already_claimed": false
		}

	# 4. Match ID validation & idempotency (duplicate prevention)
	var match_id: String = str(match_state.get("match_id", ""))
	if match_id.strip_edges() == "":
		return {
			"success": false,
			"error": "Missing authoritative match_id",
			"crowns": 0,
			"echo_dust": 0,
			"relationship_gain": 0,
			"already_claimed": false
		}

	if offline_claimed_matches.has(match_id):
		return {
			"success": false,
			"error": "Reward already claimed for this match",
			"already_claimed": true,
			"crowns": 0,
			"echo_dust": 0,
			"relationship_gain": 0
		}

	# 5. Valid encounter check
	var npc := get_npc(npc_id)
	if npc.is_empty():
		return {
			"success": false,
			"error": "Invalid encounter NPC",
			"crowns": 0,
			"echo_dust": 0,
			"relationship_gain": 0,
			"already_claimed": false
		}

	# Mark match as claimed
	offline_claimed_matches[match_id] = true

	# Grant authoritative rewards to offline wallet ONLY
	var rewards: Dictionary = npc.get("rewards", {"crowns": 100, "echo_dust": 30, "relationship_gain": 8})
	var earned_crowns: int = int(rewards.get("crowns", 100))
	var earned_dust: int = int(rewards.get("echo_dust", 30))
	var earned_rel: int = int(rewards.get("relationship_gain", 8))

	offline_crowns += earned_crowns
	offline_echo_dust += earned_dust
	crowns = offline_crowns
	echo_dust = offline_echo_dust
	var cur_rel: int = int(relationships.get(npc_id, 20))
	relationships[npc_id] = mini(100, cur_rel + earned_rel)

	var bonus_card: String = str(rewards.get("bonus_card_id", ""))
	if bonus_card != "":
		offline_collection[bonus_card] = int(offline_collection.get(bonus_card, 0)) + 1

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
	_sync_active_wallet()

	return {
		"success": true,
		"crowns": earned_crowns,
		"echo_dust": earned_dust,
		"relationship_gain": earned_rel,
		"bonus_card_id": bonus_card,
		"match_id": match_id,
		"already_claimed": false
	}

func award_duel_victory(npc_id: String, match_state: Dictionary = {}) -> Dictionary:
	if match_state.is_empty():
		return {"success": false, "error": "Match outcome state is required; synthetic victories are disallowed"}
	return process_match_rewards(match_state, npc_id)

# ==============================================================================
# PROFILE PERSISTENCE
# ==============================================================================

func save_local_profile() -> void:
	save_offline_profile()

func save_offline_profile() -> void:
	var data := {
		"account_mode": "offline",
		"user_id": user_id,
		"player_name": player_name,
		"crowns": offline_crowns,
		"echo_dust": offline_echo_dust,
		"sigils": offline_sigils,
		"active_deck_id": active_deck_id,
		"collection": offline_collection,
		"relationships": relationships,
		"claimed_matches": offline_claimed_matches,
		"quest_states": quest_states,
		"quest_objective_progress": quest_objective_progress
	}
	for path in [OFFLINE_SAVE_PATH, LEGACY_SAVE_PATH]:
		var f := FileAccess.open(path, FileAccess.WRITE)
		if f:
			f.store_string(JSON.stringify(data, "\t"))

func load_local_profile() -> void:
	load_offline_profile()
	load_online_cache()
	_sync_active_wallet()

func load_offline_profile() -> void:
	var target_path := OFFLINE_SAVE_PATH if FileAccess.file_exists(OFFLINE_SAVE_PATH) else LEGACY_SAVE_PATH
	if not FileAccess.file_exists(target_path):
		return
	var parsed = JSON.parse_string(FileAccess.get_file_as_string(target_path))
	if typeof(parsed) == TYPE_DICTIONARY:
		user_id = str(parsed.get("user_id", user_id))
		player_name = str(parsed.get("player_name", player_name))
		offline_crowns = int(parsed.get("crowns", offline_crowns))
		offline_echo_dust = int(parsed.get("echo_dust", offline_echo_dust))
		offline_sigils = int(parsed.get("sigils", offline_sigils))
		active_deck_id = str(parsed.get("active_deck_id", active_deck_id))
		if parsed.has("collection") and typeof(parsed["collection"]) == TYPE_DICTIONARY:
			offline_collection = parsed["collection"]
		if parsed.has("relationships") and typeof(parsed["relationships"]) == TYPE_DICTIONARY:
			relationships = parsed["relationships"]
		if parsed.has("claimed_matches") and typeof(parsed["claimed_matches"]) == TYPE_DICTIONARY:
			offline_claimed_matches = parsed["claimed_matches"]
		if parsed.has("quest_states") and typeof(parsed["quest_states"]) == TYPE_DICTIONARY:
			quest_states = parsed["quest_states"]
			for q in quests:
				var qid: String = str(q.get("id", ""))
				if quest_states.has(qid):
					q["status"] = quest_states[qid]
		if parsed.has("quest_objective_progress") and typeof(parsed["quest_objective_progress"]) == TYPE_DICTIONARY:
			quest_objective_progress = parsed["quest_objective_progress"]

func save_online_cache() -> void:
	var data := {
		"account_mode": "online",
		"user_id": user_id,
		"crowns": online_crowns,
		"echo_dust": online_echo_dust,
		"sigils": online_sigils,
		"collection": online_collection,
		"claimed_matches": online_claimed_matches
	}
	var f := FileAccess.open(ONLINE_CACHE_PATH, FileAccess.WRITE)
	if f:
		f.store_string(JSON.stringify(data, "\t"))

func load_online_cache() -> void:
	if not FileAccess.file_exists(ONLINE_CACHE_PATH):
		return
	var parsed = JSON.parse_string(FileAccess.get_file_as_string(ONLINE_CACHE_PATH))
	if typeof(parsed) == TYPE_DICTIONARY:
		online_crowns = int(parsed.get("crowns", 0))
		online_echo_dust = int(parsed.get("echo_dust", 0))
		online_sigils = int(parsed.get("sigils", 0))
		if parsed.has("collection") and typeof(parsed["collection"]) == TYPE_DICTIONARY:
			online_collection = parsed["collection"]
		if parsed.has("claimed_matches") and typeof(parsed["claimed_matches"]) == TYPE_DICTIONARY:
			online_claimed_matches = parsed["claimed_matches"]
