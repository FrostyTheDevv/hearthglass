extends Node
## Global persistent player, world, collection, deck, and session state for Project Hearthglass.
## Synchronizes player accounts, collection, 40-card decks, and duel outcomes with the PostgreSQL-backed Platform API.

signal wallet_updated(crowns: int, echo_dust: int)
signal collection_updated()
signal active_deck_changed(deck_id: String)

const SAVE_PATH := "user://hearthglass_profile_v1.json"

var cards_by_id: Dictionary = {}
var all_cards: Array = []
var starter_decks: Array = []
var npcs: Array = []
var districts: Array = []
var interiors: Array = []
var quests: Array = []

var user_id: String = "00000000-0000-4000-8000-000000000001"
var auth_token: String = ""
var player_name: String = "Aerin_Vanguard"
var crowns: int = 850
var echo_dust: int = 360
var sigils: int = 3
var account_level: int = 3
var active_deck_id: String = "deck_ember_iron_forge"
var selected_npc_id: String = "npc_kaelen_forge"
var selected_match_format: String = "standard_1v1"

var collection: Dictionary = {}
var relationships: Dictionary = {}
var world_time_minutes: float = 810.0 # 13:30 Afternoon
var current_weather: String = "Clear"
var current_district: String = "lumenport_arrival_square"
var api_base_url: String = "http://127.0.0.1:4173"
var ws_base_url: String = "ws://127.0.0.1:4173/v1/ws"

func _ready() -> void:
	_load_canonical_content()
	_init_default_collection_and_relationships()
	load_local_profile()
	sync_from_postgres_api()

func _load_canonical_content() -> void:
	var root_dir := ProjectSettings.globalize_path("res://../..")
	var bundle_path := root_dir.path_join("content/cards/foundations_v1.json")
	if FileAccess.file_exists(bundle_path):
		var parsed = JSON.parse_string(FileAccess.get_file_as_string(bundle_path))
		if typeof(parsed) == TYPE_DICTIONARY and parsed.has("cards"):
			all_cards = parsed["cards"]
			for c in all_cards:
				cards_by_id[c["id"]] = c

	var decks_path := root_dir.path_join("content/cards/starter_decks.json")
	if FileAccess.file_exists(decks_path):
		var parsed_decks = JSON.parse_string(FileAccess.get_file_as_string(decks_path))
		if typeof(parsed_decks) == TYPE_DICTIONARY and parsed_decks.has("decks"):
			starter_decks = parsed_decks["decks"]

	var npcs_path := root_dir.path_join("content/npcs/lumenport_npcs.json")
	if FileAccess.file_exists(npcs_path):
		var parsed_npcs = JSON.parse_string(FileAccess.get_file_as_string(npcs_path))
		if typeof(parsed_npcs) == TYPE_DICTIONARY:
			if parsed_npcs.has("npcs"):
				npcs = parsed_npcs["npcs"]
			if parsed_npcs.has("districts"):
				districts = parsed_npcs["districts"]
			if parsed_npcs.has("interiors"):
				interiors = parsed_npcs["interiors"]

	var quests_path := root_dir.path_join("content/quests/act1_quests.json")
	if FileAccess.file_exists(quests_path):
		var parsed_quests = JSON.parse_string(FileAccess.get_file_as_string(quests_path))
		if typeof(parsed_quests) == TYPE_DICTIONARY and parsed_quests.has("quests"):
			quests = parsed_quests["quests"]

func _init_default_collection_and_relationships() -> void:
	for c in all_cards:
		var rarity: String = c.get("rarity", "common")
		var max_copies := 3
		if rarity == "rare":
			max_copies = 2
		elif rarity == "legendary":
			max_copies = 1
		collection[c["id"]] = max_copies

	for n in npcs:
		relationships[n["id"]] = int(n.get("initial_relationship", 20))

func sync_from_postgres_api() -> void:
	var http := HTTPRequest.new()
	add_child(http)
	http.request_completed.connect(func(_result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray):
		if response_code == 200:
			var parsed = JSON.parse_string(body.get_string_from_utf8())
			if typeof(parsed) == TYPE_DICTIONARY and parsed.has("account"):
				var acc: Dictionary = parsed["account"]
				user_id = str(acc.get("id", user_id))
				player_name = str(acc.get("username", player_name))
				crowns = int(acc.get("crowns", crowns))
				echo_dust = int(acc.get("echo_dust", echo_dust))
				if typeof(parsed.get("collection")) == TYPE_DICTIONARY:
					collection = parsed["collection"]
				if typeof(parsed.get("starter_decks")) == TYPE_ARRAY and parsed["starter_decks"].size() > 0:
					starter_decks = parsed["starter_decks"]
				elif typeof(parsed.get("decks")) == TYPE_ARRAY and parsed["decks"].size() > 0:
					starter_decks = parsed["decks"]
				if typeof(parsed.get("districts")) == TYPE_ARRAY:
					districts = parsed["districts"]
				if typeof(parsed.get("interiors")) == TYPE_ARRAY:
					interiors = parsed["interiors"]
				wallet_updated.emit(crowns, echo_dust)
				collection_updated.emit()
		http.queue_free()
	)
	var headers := PackedStringArray(["Content-Type: application/json"])
	if auth_token != "":
		headers.append("Authorization: Bearer " + auth_token)
	http.request(api_base_url + "/v1/bootstrap", headers, HTTPClient.METHOD_GET)

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
	if npcs.size() > 0:
		return npcs[0]
	return {}

func award_duel_victory(npc_id: String) -> Dictionary:
	var npc := get_npc(npc_id)
	var rewards: Dictionary = npc.get("rewards", {"crowns": 100, "echo_dust": 30, "relationship_gain": 8})
	crowns += int(rewards.get("crowns", 100))
	echo_dust += int(rewards.get("echo_dust", 30))
	var cur_rel: int = int(relationships.get(npc_id, 20))
	relationships[npc_id] = mini(100, cur_rel + int(rewards.get("relationship_gain", 8)))
	var bonus_card: String = str(rewards.get("bonus_card_id", ""))
	if bonus_card != "":
		collection[bonus_card] = int(collection.get(bonus_card, 0)) + 1
	save_local_profile()
	wallet_updated.emit(crowns, echo_dust)
	collection_updated.emit()
	return rewards

func save_local_profile() -> void:
	var data := {
		"user_id": user_id,
		"auth_token": auth_token,
		"player_name": player_name,
		"crowns": crowns,
		"echo_dust": echo_dust,
		"sigils": sigils,
		"active_deck_id": active_deck_id,
		"collection": collection,
		"relationships": relationships
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
		auth_token = str(parsed.get("auth_token", auth_token))
		player_name = str(parsed.get("player_name", player_name))
		crowns = int(parsed.get("crowns", crowns))
		echo_dust = int(parsed.get("echo_dust", echo_dust))
		active_deck_id = str(parsed.get("active_deck_id", active_deck_id))
