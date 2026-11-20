extends Node
## Procedural Audio Synthesizer & Sound Manager (Autoload)
## Generates clean 16-bit PCM waveform AudioStreams at runtime without external assets.
## Safe across all platforms and headless/export environments.

var audio_player: AudioStreamPlayer

func _ready() -> void:
	audio_player = AudioStreamPlayer.new()
	audio_player.bus = "Master"
	add_child(audio_player)

func play_card_play() -> void:
	_play_stream(_synth_tones([523.25, 659.25, 783.99], 0.14, "arpeggio"))

func play_attack_clash() -> void:
	_play_stream(_synth_impact(120.0, 0.16))

func play_button_click() -> void:
	_play_stream(_synth_click(880.0, 0.04))

func play_victory() -> void:
	_play_stream(_synth_tones([523.25, 659.25, 783.99, 1046.50], 0.35, "chord"))

func play_defeat() -> void:
	_play_stream(_synth_tones([392.00, 311.13, 261.63], 0.35, "arpeggio_down"))

func play_pack_reveal() -> void:
	_play_stream(_synth_tones([587.33, 739.99, 880.00, 1174.66], 0.28, "arpeggio"))

func _play_stream(stream: AudioStreamWAV) -> void:
	if audio_player and stream:
		audio_player.stream = stream
		audio_player.play()

func _synth_tones(freqs: Array, duration: float, style: String = "arpeggio") -> AudioStreamWAV:
	var sample_rate := 22050
	var total_samples := int(duration * sample_rate)
	var pcm := PackedByteArray()
	pcm.resize(total_samples * 2)

	var tone_count := freqs.size()
	for i in range(total_samples):
		var t := float(i) / float(sample_rate)
		var decay := 1.0 - (float(i) / float(total_samples))
		var sample := 0.0

		if style == "arpeggio":
			var note_idx := clampi(int((float(i) / float(total_samples)) * tone_count), 0, tone_count - 1)
			var freq: float = float(freqs[note_idx])
			sample = sin(t * TAU * freq) * decay * 0.45
		elif style == "arpeggio_down":
			var note_idx := clampi(int((1.0 - (float(i) / float(total_samples))) * tone_count), 0, tone_count - 1)
			var freq: float = float(freqs[note_idx])
			sample = sin(t * TAU * freq) * decay * 0.45
		elif style == "chord":
			for f in freqs:
				sample += sin(t * TAU * float(f)) * (0.45 / float(tone_count))
			sample *= decay

		var val := int(clampf(sample * 32767.0, -32768.0, 32767.0))
		pcm.encode_s16(i * 2, val)

	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = sample_rate
	wav.stereo = false
	wav.data = pcm
	return wav

func _synth_impact(base_freq: float, duration: float) -> AudioStreamWAV:
	var sample_rate := 22050
	var total_samples := int(duration * sample_rate)
	var pcm := PackedByteArray()
	pcm.resize(total_samples * 2)

	for i in range(total_samples):
		var t := float(i) / float(sample_rate)
		var decay := pow(1.0 - (float(i) / float(total_samples)), 2.5)
		# Rapid downward frequency sweep (pitch envelope)
		var cur_freq := base_freq * (1.0 - (float(i) / float(total_samples)) * 0.7)
		var sample := sin(t * TAU * cur_freq) * decay * 0.65
		# Add a touch of noise for punch
		var noise := (randf() * 2.0 - 1.0) * decay * 0.2
		var val := int(clampf((sample + noise) * 32767.0, -32768.0, 32767.0))
		pcm.encode_s16(i * 2, val)

	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = sample_rate
	wav.stereo = false
	wav.data = pcm
	return wav

func _synth_click(freq: float, duration: float) -> AudioStreamWAV:
	var sample_rate := 22050
	var total_samples := int(duration * sample_rate)
	var pcm := PackedByteArray()
	pcm.resize(total_samples * 2)

	for i in range(total_samples):
		var t := float(i) / float(sample_rate)
		var decay := pow(1.0 - (float(i) / float(total_samples)), 4.0)
		var sample := sin(t * TAU * freq) * decay * 0.35
		var val := int(clampf(sample * 32767.0, -32768.0, 32767.0))
		pcm.encode_s16(i * 2, val)

	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = sample_rate
	wav.stereo = false
	wav.data = pcm
	return wav
