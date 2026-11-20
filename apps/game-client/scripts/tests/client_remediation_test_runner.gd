extends Node
## Node wrapper for Client Remediation Regression Tests

func _ready() -> void:
	var tester = load("res://scripts/tests/client_remediation_test.gd").new()
	# The _init in client_remediation_test runs all tests and calls quit()
