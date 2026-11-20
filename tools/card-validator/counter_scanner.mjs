import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('content/cards/foundations_v1.json', 'utf8'));

const tracked = ['assembly', 'current', 'refraction', 'veil', 'reclaim'];

for (const name of tracked) {
  console.log(`\n========================================\nCOUNTER: ${name.toUpperCase()}\n========================================`);
  for (const card of data.cards) {
    const cardStr = JSON.stringify(card);
    if (cardStr.includes(`"${name}"`)) {
      console.log(`[${card.id}] ${card.name} (${card.faction}, ${card.card_type})`);
      for (const ab of (card.abilities || [])) {
        console.log(`   trigger: ${ab.trigger}, conditions: ${JSON.stringify(ab.conditions || [])}`);
        for (const eff of (ab.effects || [])) {
          console.log(`      effect: ${JSON.stringify(eff)}`);
        }
      }
    }
  }
}
