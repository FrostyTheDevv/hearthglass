import fs from 'node:fs';

const bundle = JSON.parse(fs.readFileSync('content/cards/foundations_v1.json', 'utf8'));
const lines = bundle.cards.map(c => JSON.stringify({
  card_id: c.id,
  name: c.name,
  faction: c.faction,
  type: c.type,
  rarity: c.rarity,
  role: c.role,
  style_id: c.art?.style_id || 'fantasy_oil',
  aspect_ratio: '3:4',
  target_resolution: '768x1024',
  prompt: c.art?.prompt || '',
  negative_prompt: (c.art?.visual_exclusions || []).join('; '),
  output_filename: `${c.id}.png`
}));

fs.writeFileSync('content/art/batch_prompts_480.jsonl', lines.join('\n') + '\n', 'utf8');
console.log(`Successfully exported content/art/batch_prompts_480.jsonl with ${lines.length} prompt entries.`);
