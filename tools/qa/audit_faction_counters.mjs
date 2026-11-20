import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/cards/foundations_v1.json'), 'utf8'));

const targetCounters = ['assembly', 'current', 'refraction', 'veil', 'reclaim'];

for (const c of targetCounters) {
  console.log(`\n================================================================`);
  console.log(`COUNTER: ${c.toUpperCase()}`);
  console.log(`================================================================`);
  const matchingCards = data.cards.filter(card => {
    const s = JSON.stringify(card).toLowerCase();
    return s.includes(`"counter":"${c}"`) || s.includes(c);
  });

  console.log(`Total matching cards: ${matchingCards.length}`);
  for (const card of matchingCards) {
    const abilities = (card.abilities || []).map(a => 
      `${a.trigger}: ${JSON.stringify(a.effects)}`
    ).join(' | ');
    console.log(`- [${card.id}] ${card.name} (${card.faction}, Cost ${card.cost}): ${abilities}`);
  }
}
