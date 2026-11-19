import fs from 'node:fs';

let code = fs.readFileSync('apps/game-client/scripts/tests/vertical_slice_test.gd', 'utf8');
code = code.replace('  print("  NPC Title: ", vance_npc.get("title"))', '\tprint("  NPC Title: ", vance_npc.get("title"))');
fs.writeFileSync('apps/game-client/scripts/tests/vertical_slice_test.gd', code, 'utf8');
console.log('Successfully fixed tab in vertical_slice_test.gd');
