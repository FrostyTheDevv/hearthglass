import fs from 'node:fs';

const rustCode = fs.readFileSync('services/battle-server/src/lib.rs', 'utf8');
const rustMatches = new Set([...rustCode.matchAll(/has_keyword\(\s*"([^"]+)"\s*\)/g)].map(m => m[1]));

const cards = JSON.parse(fs.readFileSync('content/cards/foundations_v1.json', 'utf8')).cards;
const cardKeywords = new Set();
const keywordFrequency = {};

for (const c of cards) {
  for (const k of (c.keywords || [])) {
    const norm = k.toLowerCase().trim();
    cardKeywords.add(norm);
    keywordFrequency[norm] = (keywordFrequency[norm] || 0) + 1;
  }
}

console.log('Rust Keywords in engine logic:', [...rustMatches].sort());
console.log('Card JSON Keywords count:', cardKeywords.size);
console.log('Frequencies:');
for (const [k, count] of Object.entries(keywordFrequency).sort((a,b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(16)}: ${count} cards (Rust engine support: ${rustMatches.has(k)})`);
}
