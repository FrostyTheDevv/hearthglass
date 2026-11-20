import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('content/cards/foundations_v1.json', 'utf8'));

const allCounters = ['assembly', 'current', 'refraction', 'veil', 'reclaim', 'growth', 'corrode', 'burn', 'heat', 'alignment', 'shield'];

console.log('=== COUNTER CONDITIONS IN CARDS ===');
for (const card of data.cards) {
  for (const ab of (card.abilities || [])) {
    for (const cond of (ab.conditions || [])) {
      if (cond.counter) {
        console.log(`Card ${card.id} (${card.name}) checks condition:`, cond);
      }
    }
  }
}

console.log('\n=== COUNTERS REMOVED IN CARDS ===');
for (const card of data.cards) {
  for (const ab of (card.abilities || [])) {
    for (const eff of (ab.effects || [])) {
      if (eff.operation === 'remove_counter') {
        console.log(`Card ${card.id} (${card.name}) removes counter:`, eff);
      }
    }
  }
}

console.log('\n=== CARD DESCRIPTIONS/TEXT FOR QUESTIONABLE COUNTERS ===');
for (const cName of ['assembly', 'current', 'refraction', 'veil', 'reclaim']) {
  console.log(`\n--- Cards mentioning '${cName}' in text/flavor ---`);
  for (const card of data.cards) {
    const text = (card.rules_text || '') + ' ' + (card.flavor_text || '') + ' ' + (card.biography || '');
    if (text.toLowerCase().includes(cName)) {
      console.log(`[${card.id}] ${card.name}: rules="${card.rules_text}"`);
    }
  }
}
