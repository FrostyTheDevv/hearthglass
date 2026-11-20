extends Node
## Authoritative Rust Battle Engine Bridge & WebSocket Multiplayer Client for Godot 4.
## IMPORTANT: This script intentionally contains ZERO card rules or combat resolution logic.
## 100% of deck validation, match initialization (1v1 & 2v2 Tag), command execution, AI turns,
## and hidden-state redaction are performed by the compiled Rust crate (`services/battle-server`),
## either via the live PostgreSQL-backed Platform API (`http://127.0.0.1:4173` / `ws://127.0.0.1:4173/v1/ws`)
## or via direct invocation of `hearthglass-battle-server --eval-json` for offline practice.

signal match_state_received(match_data: Dictionary)
signal command_rejected(error_message: String)
signal pvp_queued()
signal pvp_match_found(match_id: String, player_slot: int, match_data: Dictionary)

var ws_peer: WebSocketPeer = null
var ws_connected: bool = false
var current_match_id: String = ""
var local_player_slot: int = 0
var is_online_pvp: bool = false
var raw_rust_state: Dictionary = {}

func _process(_delta: float) -> void:
	if ws_peer == null:
		return
	ws_peer.poll()
	var state := ws_peer.get_ready_state()
	if state == WebSocketPeer.STATE_OPEN:
		if not ws_connected:
			ws_connected = true
			_send_ws_auth()
		while ws_peer.get_available_packet_count() > 0:
			var packet_str := ws_peer.get_packet().get_string_from_utf8()
			var msg = JSON.parse_string(packet_str)
			if typeof(msg) == TYPE_DICTIONARY:
				_handle_ws_message(msg)
	elif state == WebSocketPeer.STATE_CLOSED:
		ws_connected = false
		ws_peer = null

func connect_multiplayer_ws(ws_url: String = "ws://127.0.0.1:4173/v1/ws") -> void:
	ws_peer = WebSocketPeer.new()
	ws_peer.connect_to_url(ws_url)

func _send_ws_auth() -> void:
	if ws_peer and ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
		ws_peer.send_text(JSON.stringify({
			"type": "auth",
			"token": GameState.auth_token,
			"user_id": GameState.user_id
		}))

func queue_1v1_pvp(deck_id: String = "") -> void:
	is_online_pvp = true
	if ws_peer == null or ws_peer.get_ready_state() != WebSocketPeer.STATE_OPEN:
		connect_multiplayer_ws(GameState.ws_base_url)
		await get_tree().create_timer(0.35).timeout
	if ws_peer and ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
		ws_peer.send_text(JSON.stringify({
			"type": "queue_1v1",
			"deck_id": deck_id if deck_id != "" else GameState.active_deck_id
		}))

func queue_2v2_pvp(deck_id: String = "") -> void:
	is_online_pvp = true
	if ws_peer == null or ws_peer.get_ready_state() != WebSocketPeer.STATE_OPEN:
		connect_multiplayer_ws(GameState.ws_base_url)
		await get_tree().create_timer(0.35).timeout
	if ws_peer and ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
		ws_peer.send_text(JSON.stringify({
			"type": "queue_2v2",
			"deck_id": deck_id if deck_id != "" else GameState.active_deck_id
		}))

func create_tag_lobby(lobby_id: String = "", preferred_seat: int = 0) -> void:
	is_online_pvp = true
	if ws_peer == null or ws_peer.get_ready_state() != WebSocketPeer.STATE_OPEN:
		connect_multiplayer_ws(GameState.ws_base_url)
		await get_tree().create_timer(0.35).timeout
	if ws_peer and ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
		ws_peer.send_text(JSON.stringify({
			"type": "create_tag_lobby",
			"lobby_id": lobby_id,
			"preferred_seat": preferred_seat,
			"deck_id": GameState.active_deck_id
		}))

func join_tag_lobby(lobby_id: String, preferred_seat: int = -1) -> void:
	is_online_pvp = true
	if ws_peer == null or ws_peer.get_ready_state() != WebSocketPeer.STATE_OPEN:
		connect_multiplayer_ws(GameState.ws_base_url)
		await get_tree().create_timer(0.35).timeout
	if ws_peer and ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
		var payload := {
			"type": "join_tag_lobby",
			"lobby_id": lobby_id,
			"deck_id": GameState.active_deck_id
		}
		if preferred_seat >= 0:
			payload["preferred_seat"] = preferred_seat
		ws_peer.send_text(JSON.stringify(payload))

func reconnect_online_match(match_id: String) -> void:
	current_match_id = match_id
	if ws_peer and ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
		ws_peer.send_text(JSON.stringify({
			"type": "reconnect_match",
			"match_id": match_id
		}))

func submit_online_command(cmd: Dictionary) -> void:
	if ws_peer and ws_peer.get_ready_state() == WebSocketPeer.STATE_OPEN:
		var payload := cmd.duplicate()
		payload["player"] = local_player_slot
		ws_peer.send_text(JSON.stringify({
			"type": "submit_command",
			"match_id": current_match_id,
			"command": payload
		}))

func _handle_ws_message(msg: Dictionary) -> void:
	var mtype: String = str(msg.get("type", ""))
	if mtype == "queued" or mtype == "tag_lobby_created" or mtype == "tag_lobby_updated":
		pvp_queued.emit()
	elif mtype == "match_found" or mtype == "match_joined":
		current_match_id = str(msg.get("match_id", ""))
		local_player_slot = int(msg.get("player_slot", 0))
		var mdata: Dictionary = msg.get("match", {})
		match_state_received.emit(mdata)
		pvp_match_found.emit(current_match_id, local_player_slot, mdata)
	elif mtype == "match_state_update":
		var mdata: Dictionary = msg.get("match", {})
		match_state_received.emit(mdata)
	elif mtype == "command_rejected" or mtype == "error":
		command_rejected.emit(str(msg.get("error", "Command rejected by server")))

func _resolve_rust_binary_path() -> String:
	var exe_dir := OS.get_executable_path().get_base_dir()
	var root_dir := ProjectSettings.globalize_path("res://../..")
	var candidates: Array[String] = [
		exe_dir.path_join("hearthglass-battle-server.exe"),
		exe_dir.path_join("bin/hearthglass-battle-server.exe"),
		exe_dir.path_join("target/debug/hearthglass-battle-server.exe"),
		exe_dir.path_join("services/battle-server/target/debug/hearthglass-battle-server.exe"),
		exe_dir.path_join("hearthglass-battle-server"),
		exe_dir.path_join("bin/hearthglass-battle-server"),
		root_dir.path_join("services/battle-server/target/debug/hearthglass-battle-server.exe"),
		root_dir.path_join("services/battle-server/target/debug/hearthglass-battle-server"),
		root_dir.path_join("target/debug/hearthglass-battle-server.exe"),
		root_dir.path_join("target/debug/hearthglass-battle-server"),
		root_dir.path_join("target/release/hearthglass-battle-server.exe"),
		root_dir.path_join("target/release/hearthglass-battle-server")
	]
	for p in candidates:
		if FileAccess.file_exists(p):
			return p
	return candidates[0]

func _call_rust_cli(rpc_payload: Dictionary) -> Dictionary:
	var bin_path := _resolve_rust_binary_path()
	var temp_path := OS.get_user_data_dir().path_join("rust_rpc_payload.json")
	var f := FileAccess.open(temp_path, FileAccess.WRITE)
	if f != null:
		f.store_string(JSON.stringify(rpc_payload))
		f.close()
	var output: Array = []
	var exit_code := OS.execute(bin_path, ["--eval-file", temp_path], output, true)
	if exit_code != 0 or output.is_empty():
		return {"ok": false, "error": "Failed to invoke authoritative Rust battle-server binary"}
	var raw_text: String = str(output[0]).strip_edges()
	var lines := raw_text.split("\n")
	var last_line: String = lines[lines.size() - 1].strip_edges()
	var parsed = JSON.parse_string(last_line)
	if typeof(parsed) == TYPE_DICTIONARY:
		return parsed
	return {"ok": false, "error": "Invalid JSON returned from Rust battle-server"}

## Validates a 40-card deck exclusively via the compiled Rust battle engine (`services/battle-server`).
func validate_deck(deck: Dictionary, _catalogue: Dictionary = {}) -> Dictionary:
	var total := 0
	for entry in deck.get("cards", []):
		total += int(entry.get("count", 0))
	var resp := _call_rust_cli({
		"op": "validate_deck",
		"deck": {
			"id": str(deck.get("id", "custom_deck")),
			"name": str(deck.get("name", "Custom Deck")),
			"description": str(deck.get("description", "")),
			"factions": deck.get("factions", []),
			"total_cards": total,
			"cards": deck.get("cards", [])
		}
	})
	if resp.get("ok", false) and typeof(resp.get("data")) == TYPE_DICTIONARY:
		var data: Dictionary = resp["data"]
		return {
			"valid": bool(data.get("valid", false)),
			"total_cards": total,
			"errors": data.get("errors", [])
		}
	return {
		"valid": false,
		"total_cards": total,
		"errors": [str(resp.get("error", "Rust validation error"))]
	}

## Creates a 1v1 or 2v2 Tag match exclusively via the compiled Rust battle engine (`services/battle-server`).
func create_match(player_deck: Dictionary, npc_deck: Dictionary, npc_name: String, seed_val: int = 20261118, format: String = "standard_1v1") -> Dictionary:
	is_online_pvp = false
	local_player_slot = 0
	var resp: Dictionary
	if format == "tag_2v2":
		var d2: Dictionary = GameState.starter_decks[2] if GameState.starter_decks.size() > 2 else player_deck
		var d3: Dictionary = GameState.starter_decks[3] if GameState.starter_decks.size() > 3 else npc_deck
		resp = _call_rust_cli({
			"op": "create_match2v2",
			"decks": [player_deck, npc_deck, d2, d3],
			"seed": absi(seed_val)
		})
	else:
		resp = _call_rust_cli({
			"op": "create_match1v1",
			"deck_a": player_deck,
			"deck_b": npc_deck,
			"seed": absi(seed_val)
		})

	if resp.get("ok", false) and typeof(resp.get("data")) == TYPE_DICTIONARY:
		raw_rust_state = resp["data"]["state"]
		return _decorate_rust_state_for_ui(raw_rust_state, npc_name)
	return {}

## Applies a battle command exclusively via the compiled Rust battle engine (`services/battle-server`).
func apply_command(ui_state: Dictionary, cmd: Dictionary, _catalogue: Dictionary = {}) -> Dictionary:
	var npc_name: String = "Rival Duelist"
	if ui_state.has("players") and ui_state["players"].size() > 1:
		npc_name = str(ui_state["players"][1].get("name", "Rival Duelist"))

	var rust_cmd := _translate_ui_command_to_rust(cmd, ui_state)
	var resp := _call_rust_cli({
		"op": "apply_command",
		"state": raw_rust_state,
		"command": rust_cmd
	})
	if not resp.get("ok", false):
		return {"accepted": false, "error": str(resp.get("error", "Rust engine RPC failure"))}

	var data: Dictionary = resp["data"]
	var result: Dictionary = data.get("result", {})
	if not bool(result.get("accepted", false)):
		return {"accepted": false, "error": str(result.get("error", "Action rejected by Rust rules engine"))}

	raw_rust_state = data["state"]

	# If player ended turn and active player is now an AI slot, run AI turns in the Rust engine
	if str(cmd.get("type", "")) == "end_turn" and bool(cmd.get("run_ai", true)) and not is_online_pvp:
		var ai_slots := [1, 2, 3] if str(raw_rust_state.get("format", "")) == "tag2v2" else [1]
		var ai_resp := _call_rust_cli({
			"op": "run_ai_turns",
			"state": raw_rust_state,
			"ai_players": ai_slots,
			"difficulty": "skilled"
		})
		if ai_resp.get("ok", false):
			raw_rust_state = ai_resp["data"]["state"]

	var decorated := _decorate_rust_state_for_ui(raw_rust_state, npc_name)
	for k in decorated.keys():
		ui_state[k] = decorated[k]
	return {"accepted": true}

func _translate_ui_command_to_rust(cmd: Dictionary, ui_state: Dictionary) -> Dictionary:
	var ctype: String = str(cmd.get("type", ""))
	var player: int = int(cmd.get("player", local_player_slot))
	if ctype == "play_card" or ctype == "play_tactic":
		var h_idx: int = int(cmd.get("hand_index", 0))
		var hand: Array = ui_state["players"][player]["hand"]
		var cid: String = str(hand[h_idx]["card_id"]) if h_idx < hand.size() else ""
		var def: Dictionary = GameState.cards_by_id.get(cid, {})
		var card_type: String = str(def.get("type", "tactic"))
		if card_type == "relic":
			return {"type": "play_relic", "player": player, "hand_index": h_idx}
		elif card_type == "environment":
			return {"type": "play_environment", "player": player, "hand_index": h_idx}
		else:
			var t_lane = cmd.get("target_lane", null)
			var t_pos = cmd.get("target_position", null)
			var rust_cmd: Dictionary = {
				"type": "play_tactic",
				"player": player,
				"hand_index": h_idx
			}
			if t_lane != null and int(t_lane) >= 0 and int(t_lane) < 3:
				rust_cmd["target_lane"] = int(t_lane)
				if t_pos != null and (str(t_pos) == "front" or str(t_pos) == "rear"):
					rust_cmd["target_position"] = str(t_pos)
				else:
					rust_cmd["target_position"] = "front"
			return rust_cmd
	elif ctype == "attack_lane":
		var lane: int = int(cmd.get("lane", 0))
		var pos: String = str(cmd.get("position", "front"))
		var opp_board_idx := 1 if (player % 2) == 0 else 0
		var enemy_lane: Dictionary = ui_state["players"][opp_board_idx]["lanes"][lane]
		if enemy_lane.get("front") != null and not enemy_lane["front"].get("keywords", []).has("stealth"):
			return {
				"type": "attack_creature",
				"player": player,
				"attacker_lane": lane,
				"attacker_position": pos,
				"defender_lane": lane,
				"defender_position": "front"
			}
		elif enemy_lane.get("rear") != null and not enemy_lane["rear"].get("keywords", []).has("stealth"):
			return {
				"type": "attack_creature",
				"player": player,
				"attacker_lane": lane,
				"attacker_position": pos,
				"defender_lane": lane,
				"defender_position": "rear"
			}
		else:
			return {
				"type": "attack_leader",
				"player": player,
				"attacker_lane": lane,
				"attacker_position": pos
			}
	return cmd

func _decorate_rust_state_for_ui(rstate: Dictionary, npc_name: String) -> Dictionary:
	var copy: Dictionary = rstate.duplicate(true)
	var names := [GameState.player_name, npc_name, "Soren (Tag Partner)", "Lyra Vane"]
	for i in range(copy.get("players", []).size()):
		copy["players"][i]["name"] = names[i] if i < names.size() else ("Player %d" % (i + 1))

	var raw_outcome = copy.get("outcome", "in_progress")
	if typeof(raw_outcome) == TYPE_DICTIONARY:
		if raw_outcome.has("player_victory"):
			copy["outcome"] = "player_victory" if int(raw_outcome["player_victory"]) == local_player_slot else "opponent_victory"
		elif raw_outcome.has("team_victory"):
			copy["outcome"] = "player_victory" if int(raw_outcome["team_victory"]) == (local_player_slot % 2) else "opponent_victory"

	var readable_logs: Array[String] = []
	for ev in copy.get("event_log", []):
		if typeof(ev) == TYPE_STRING:
			readable_logs.append(ev)
		elif typeof(ev) == TYPE_DICTIONARY:
			readable_logs.append(JSON.stringify(ev))
	copy["event_log"] = readable_logs
	return copy
