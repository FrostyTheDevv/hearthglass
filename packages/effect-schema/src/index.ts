import type { AbilityDefinition, CardDefinition, Rarity } from '../../shared-types/src/index.ts';

export const RARITY_COPY_LIMITS: Record<Rarity, number> = {
  common: 3,
  uncommon: 3,
  rare: 2,
  legendary: 1
};

export const CRAFTING_COSTS: Record<Rarity, { craft: number; disenchant: number }> = {
  common: { craft: 40, disenchant: 10 },
  uncommon: { craft: 100, disenchant: 25 },
  rare: { craft: 300, disenchant: 75 },
  legendary: { craft: 1200, disenchant: 300 }
};

export function validateEffectAst(abilities: AbilityDefinition[]): string[] {
  const errors: string[] = [];
  for (const ab of abilities) {
    if (!ab.trigger) {
      errors.push('Ability missing trigger');
    }
    for (const eff of ab.effects || []) {
      if (!eff.operation || !eff.target) {
        errors.push(`Effect missing operation or target: ${JSON.stringify(eff)}`);
      }
    }
  }
  return errors;
}

export function validateDeckList(
  entries: Array<{ card_id: string; count: number }>,
  catalogue: Map<string, CardDefinition>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  let total = 0;
  const majorFactions = new Set<string>();

  for (const entry of entries) {
    const card = catalogue.get(entry.card_id);
    if (!card) {
      errors.push(`Unknown card ID: ${entry.card_id}`);
      continue;
    }
    total += entry.count;
    if (card.faction !== 'neutral') {
      majorFactions.add(card.faction);
    }
    const maxCopies = RARITY_COPY_LIMITS[card.rarity];
    if (entry.count < 1 || entry.count > maxCopies) {
      errors.push(`Card ${card.id} (${card.rarity}) count ${entry.count} exceeds limit ${maxCopies}`);
    }
  }

  if (total !== 40) {
    errors.push(`Deck must contain exactly 40 cards (found ${total})`);
  }
  if (majorFactions.size > 2) {
    errors.push(`Deck contains ${majorFactions.size} major factions (max 2 allowed)`);
  }

  return { valid: errors.length === 0, errors };
}
