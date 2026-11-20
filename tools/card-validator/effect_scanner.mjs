import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('content/cards/foundations_v1.json', 'utf8'));

console.log('=== SPECIAL 1-OFF COMBOS ===');
for (const card of data.cards) {
  for (const ab of (card.abilities || [])) {
    for (const eff of (ab.effects || [])) {
      if ((eff.target === 'ally_leader' && eff.operation === 'add_counter') ||
          (eff.target === 'enemy_in_lane' && eff.operation === 'move_lane') ||
          (eff.target === 'strongest_ally_creature' && eff.operation === 'heal')) {
        console.log(card.id, card.name, JSON.stringify(eff));
      }
    }
  }
}
