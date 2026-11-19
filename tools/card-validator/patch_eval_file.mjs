import fs from 'node:fs';

let code = fs.readFileSync('services/battle-server/src/main.rs', 'utf8');
const target = 'if let Some(pos) = args.iter().position(|a| a == "--eval-json") {';
const replacement = `if let Some(pos) = args.iter().position(|a| a == "--eval-file") {
        if let Some(path) = args.get(pos + 1) {
            if let Ok(payload) = std::fs::read_to_string(path) {
                let resp = process_rpc_line(&payload, &catalogue);
                println!("{}", serde_json::to_string(&resp).unwrap());
                return;
            }
        }
    }

    if let Some(pos) = args.iter().position(|a| a == "--eval-json") {`;

if (!code.includes(target)) {
    console.error('Target string not found');
    process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync('services/battle-server/src/main.rs', code, 'utf8');
console.log('Successfully updated services/battle-server/src/main.rs with --eval-file');
