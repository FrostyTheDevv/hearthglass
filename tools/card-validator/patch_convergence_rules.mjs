import fs from 'node:fs';

let code = fs.readFileSync('apps/game-client/scripts/engine/convergence_rules.gd', 'utf8');

const target = `func _call_rust_cli(rpc_payload: Dictionary) -> Dictionary:
\tvar bin_path := _resolve_rust_binary_path()
\tvar json_arg := JSON.stringify(rpc_payload)
\tvar output: Array = []
\tvar exit_code := OS.execute(bin_path, ["--eval-json", json_arg], output, true)`;

const replacement = `func _call_rust_cli(rpc_payload: Dictionary) -> Dictionary:
\tvar bin_path := _resolve_rust_binary_path()
\tvar temp_path := OS.get_user_data_dir().path_join("rust_rpc_payload.json")
\tvar f := FileAccess.open(temp_path, FileAccess.WRITE)
\tif f != null:
\t\tf.store_string(JSON.stringify(rpc_payload))
\t\tf.close()
\tvar output: Array = []
\tvar exit_code := OS.execute(bin_path, ["--eval-file", temp_path], output, true)`;

if (!code.includes(target)) {
    console.error('Target not found in convergence_rules.gd');
    process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync('apps/game-client/scripts/engine/convergence_rules.gd', code, 'utf8');
console.log('Updated convergence_rules.gd with --eval-file temp file bridge');
