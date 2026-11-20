/**
 * Hearthglass — World Content & Card Staging Validator
 *
 * Enforces strict referential integrity, canonical distribution targets,
 * and comprehensive schema compliance across all staging and world files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

export function validateWorldContent() {
  const errors = [];
  const warnings = [];

  console.log('[WorldValidator] Starting Hearthglass World Content Validation...');

  // 1. Load canonical foundations and decks
  const foundationsPath = path.join(ROOT, 'content/cards/foundations_v1.json');
  const starterDecksPath = path.join(ROOT, 'content/cards/starter_decks.json');

  if (!fs.existsSync(foundationsPath)) errors.push(`Missing foundations_v1.json at ${foundationsPath}`);
  if (!fs.existsSync(starterDecksPath)) errors.push(`Missing starter_decks.json at ${starterDecksPath}`);

  if (errors.length > 0) return { valid: false, errors, warnings };

  const foundations = JSON.parse(fs.readFileSync(foundationsPath, 'utf8'));
  const starterDecks = JSON.parse(fs.readFileSync(starterDecksPath, 'utf8'));

  const allCardIds = new Set(foundations.cards.map(c => c.id));
  const allDeckIds = new Set(starterDecks.decks.map(d => d.id));

  // Canonical card distribution check
  const totalCards = foundations.cards.length;
  if (totalCards !== 640) {
    errors.push(`Expected 640 canonical cards, found ${totalCards}`);
  }

  const typeCounts = {
    creature: foundations.cards.filter(c => c.type === 'creature').length,
    tactic: foundations.cards.filter(c => c.type === 'tactic').length,
    relic: foundations.cards.filter(c => c.type === 'relic').length,
    environment: foundations.cards.filter(c => c.type === 'environment').length
  };

  if (typeCounts.creature !== 368) errors.push(`Expected 368 creatures, found ${typeCounts.creature}`);
  if (typeCounts.tactic !== 136) errors.push(`Expected 136 tactics, found ${typeCounts.tactic}`);
  if (typeCounts.relic !== 88) errors.push(`Expected 88 relics, found ${typeCounts.relic}`);
  if (typeCounts.environment !== 48) errors.push(`Expected 48 environments, found ${typeCounts.environment}`);

  const rarityCounts = {
    common: foundations.cards.filter(c => c.rarity === 'common').length,
    uncommon: foundations.cards.filter(c => c.rarity === 'uncommon').length,
    rare: foundations.cards.filter(c => c.rarity === 'rare').length,
    legendary: foundations.cards.filter(c => c.rarity === 'legendary').length,
    epic: foundations.cards.filter(c => c.rarity === 'epic').length
  };

  if (rarityCounts.common !== 320) errors.push(`Expected 320 common cards, found ${rarityCounts.common}`);
  if (rarityCounts.uncommon !== 192) errors.push(`Expected 192 uncommon cards, found ${rarityCounts.uncommon}`);
  if (rarityCounts.rare !== 96) errors.push(`Expected 96 rare cards, found ${rarityCounts.rare}`);
  if (rarityCounts.legendary !== 32) errors.push(`Expected 32 legendary cards, found ${rarityCounts.legendary}`);
  if (rarityCounts.epic !== 0) errors.push(`No Epic rarity allowed, found ${rarityCounts.epic}`);

  // 2. Validate Card Staging Catalogue
  const stagingCardsPath = path.join(ROOT, 'content/staging/cards/expansion_160_staging_catalogue.json');
  if (!fs.existsSync(stagingCardsPath)) {
    errors.push(`Missing staged cards file at ${stagingCardsPath}`);
  } else {
    const stagedCardsData = JSON.parse(fs.readFileSync(stagingCardsPath, 'utf8'));
    if (stagedCardsData.total_staged_cards !== 160) {
      errors.push(`Expected 160 staged expansion cards, found ${stagedCardsData.total_staged_cards}`);
    }
    for (const card of stagedCardsData.cards) {
      if (!allCardIds.has(card.id)) errors.push(`Staged card ${card.id} not present in foundations_v1.json`);
      if (!card.mechanic_test_specification) errors.push(`Staged card ${card.id} missing mechanic_test_specification`);
      if (!card.art?.prompt) errors.push(`Staged card ${card.id} missing art.prompt`);
      if (!card.identity?.collection_biography) errors.push(`Staged card ${card.id} missing collection_biography`);
    }
  }

  // 3. Validate World NPCs (80)
  const npcsPath = path.join(ROOT, 'content/staging/world/world_npcs_80.json');
  const npcIds = new Set();
  if (!fs.existsSync(npcsPath)) {
    errors.push(`Missing world_npcs_80.json at ${npcsPath}`);
  } else {
    const npcsFile = JSON.parse(fs.readFileSync(npcsPath, 'utf8'));
    if (npcsFile.total_npcs !== 80 || npcsFile.npcs.length !== 80) {
      errors.push(`Expected 80 NPCs, found ${npcsFile.npcs.length}`);
    }
    for (const [reg, expected] of Object.entries({ lumenport: 20, verdant_expanse: 20, ironreach: 20, astral_archive: 20 })) {
      const count = npcsFile.npcs.filter(n => n.region_id === reg).length;
      if (count !== expected) errors.push(`Expected ${expected} NPCs in ${reg}, found ${count}`);
    }

    for (const npc of npcsFile.npcs) {
      if (npcIds.has(npc.id)) errors.push(`Duplicate NPC ID: ${npc.id}`);
      npcIds.add(npc.id);

      if (!allDeckIds.has(npc.deck_id)) {
        errors.push(`NPC ${npc.id} (${npc.name}) references invalid deck_id: '${npc.deck_id}'`);
      }
      if (npc.rewards?.bonus_card_id && !allCardIds.has(npc.rewards.bonus_card_id)) {
        errors.push(`NPC ${npc.id} references invalid bonus_card_id: '${npc.rewards.bonus_card_id}'`);
      }
      if (!npc.dialogue?.greeting || !npc.dialogue?.victory || !npc.dialogue?.defeat) {
        errors.push(`NPC ${npc.id} missing required dialogue fields`);
      }
    }
  }

  // 4. Validate Campaign (12 Chapters)
  const campaignPath = path.join(ROOT, 'content/staging/world/campaign_twelve_chapters.json');
  if (!fs.existsSync(campaignPath)) {
    errors.push(`Missing campaign_twelve_chapters.json at ${campaignPath}`);
  } else {
    const campFile = JSON.parse(fs.readFileSync(campaignPath, 'utf8'));
    if (campFile.total_chapters !== 12 || campFile.chapters.length !== 12) {
      errors.push(`Expected 12 campaign chapters, found ${campFile.chapters.length}`);
    }
    for (const ch of campFile.chapters) {
      if (!allDeckIds.has(ch.boss_deck_id)) {
        errors.push(`Campaign Chapter ${ch.chapter_number} references invalid boss_deck_id: '${ch.boss_deck_id}'`);
      }
      if (ch.rewards?.bonus_card_id && !allCardIds.has(ch.rewards.bonus_card_id)) {
        errors.push(`Campaign Chapter ${ch.chapter_number} references invalid bonus_card_id: '${ch.rewards.bonus_card_id}'`);
      }
      if (ch.boss_npc_id && !npcIds.has(ch.boss_npc_id)) {
        errors.push(`Campaign Chapter ${ch.chapter_number} references unknown boss NPC: '${ch.boss_npc_id}'`);
      }
    }
  }

  // 5. Validate Side Quests (120)
  const questsPath = path.join(ROOT, 'content/staging/world/world_side_quests_120.json');
  const questIds = new Set();
  if (!fs.existsSync(questsPath)) {
    errors.push(`Missing world_side_quests_120.json at ${questsPath}`);
  } else {
    const questsFile = JSON.parse(fs.readFileSync(questsPath, 'utf8'));
    if (questsFile.total_quests !== 120 || questsFile.quests.length !== 120) {
      errors.push(`Expected 120 side quests, found ${questsFile.quests.length}`);
    }
    for (const [reg, expected] of Object.entries({ lumenport: 30, verdant_expanse: 30, ironreach: 30, astral_archive: 30 })) {
      const count = questsFile.quests.filter(q => q.region_id === reg).length;
      if (count !== expected) errors.push(`Expected ${expected} side quests in ${reg}, found ${count}`);
    }

    for (const q of questsFile.quests) {
      if (questIds.has(q.id)) errors.push(`Duplicate Quest ID: ${q.id}`);
      questIds.add(q.id);

      if (!npcIds.has(q.giver_npc_id)) {
        errors.push(`Quest ${q.id} references unknown giver_npc_id: '${q.giver_npc_id}'`);
      }
      if (q.rewards?.bonus_card_id && !allCardIds.has(q.rewards.bonus_card_id)) {
        errors.push(`Quest ${q.id} references invalid bonus_card_id: '${q.rewards.bonus_card_id}'`);
      }
      if (!q.objectives || q.objectives.length === 0) {
        errors.push(`Quest ${q.id} has no objectives`);
      }
    }
  }

  // 6. Validate Dungeons (16)
  const dungeonsPath = path.join(ROOT, 'content/staging/world/world_dungeons_16.json');
  if (!fs.existsSync(dungeonsPath)) {
    errors.push(`Missing world_dungeons_16.json at ${dungeonsPath}`);
  } else {
    const dungFile = JSON.parse(fs.readFileSync(dungeonsPath, 'utf8'));
    if (dungFile.total_dungeons !== 16 || dungFile.dungeons.length !== 16) {
      errors.push(`Expected 16 dungeons, found ${dungFile.dungeons.length}`);
    }
    for (const dung of dungFile.dungeons) {
      for (const floor of dung.floors) {
        for (const enc of floor.encounters) {
          if (!allDeckIds.has(enc.deck_id)) {
            errors.push(`Dungeon ${dung.id} encounter '${enc.encounter_id}' references invalid deck_id: '${enc.deck_id}'`);
          }
        }
      }
    }
  }

  // 7. Validate Tournaments (8)
  const tournamentsPath = path.join(ROOT, 'content/staging/world/world_tournaments_8.json');
  if (!fs.existsSync(tournamentsPath)) {
    errors.push(`Missing world_tournaments_8.json at ${tournamentsPath}`);
  } else {
    const tourFile = JSON.parse(fs.readFileSync(tournamentsPath, 'utf8'));
    if (tourFile.total_tournaments !== 8 || tourFile.tournaments.length !== 8) {
      errors.push(`Expected 8 tournaments, found ${tourFile.tournaments.length}`);
    }
    for (const tour of tourFile.tournaments) {
      if (!allCardIds.has(tour.grand_prize_card_id)) {
        errors.push(`Tournament ${tour.id} references invalid grand_prize_card_id: '${tour.grand_prize_card_id}'`);
      }
      for (const p of tour.participants) {
        if (p !== 'player' && !npcIds.has(p)) {
          errors.push(`Tournament ${tour.id} participant '${p}' is not a recognized NPC`);
        }
      }
    }
  }

  // 8. Validate Companion Stories (24)
  const companionsPath = path.join(ROOT, 'content/staging/world/world_companion_stories_24.json');
  if (!fs.existsSync(companionsPath)) {
    errors.push(`Missing world_companion_stories_24.json at ${companionsPath}`);
  } else {
    const compFile = JSON.parse(fs.readFileSync(companionsPath, 'utf8'));
    if (compFile.total_stories !== 24 || compFile.stories.length !== 24) {
      errors.push(`Expected 24 companion stories, found ${compFile.stories.length}`);
    }
    for (const story of compFile.stories) {
      if (!npcIds.has(story.companion_npc_id)) {
        errors.push(`Companion story ${story.id} references unknown NPC '${story.companion_npc_id}'`);
      }
    }
  }

  // 9. Validate Secrets (32)
  const secretsPath = path.join(ROOT, 'content/staging/world/world_secrets_32.json');
  if (!fs.existsSync(secretsPath)) {
    errors.push(`Missing world_secrets_32.json at ${secretsPath}`);
  } else {
    const secFile = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
    if (secFile.total_secrets !== 32 || secFile.secrets.length !== 32) {
      errors.push(`Expected 32 secrets, found ${secFile.secrets.length}`);
    }
    for (const sec of secFile.secrets) {
      if (!sec.riddle_or_clue || !sec.solution) {
        errors.push(`Secret ${sec.id} missing riddle or solution`);
      }
      if (sec.rewards?.bonus_card_id && !allCardIds.has(sec.rewards.bonus_card_id)) {
        errors.push(`Secret ${sec.id} references invalid bonus_card_id: '${sec.rewards.bonus_card_id}'`);
      }
    }
  }

  // 10. Validate Elite Encounters (20)
  const elitePath = path.join(ROOT, 'content/staging/world/world_elite_encounters_20.json');
  if (!fs.existsSync(elitePath)) {
    errors.push(`Missing world_elite_encounters_20.json at ${elitePath}`);
  } else {
    const eliteFile = JSON.parse(fs.readFileSync(elitePath, 'utf8'));
    if (eliteFile.total_elite_encounters !== 20 || eliteFile.elite_encounters.length !== 20) {
      errors.push(`Expected 20 elite encounters, found ${eliteFile.elite_encounters.length}`);
    }
    for (const el of eliteFile.elite_encounters) {
      if (!allDeckIds.has(el.deck_id)) {
        errors.push(`Elite encounter ${el.id} references invalid deck_id: '${el.deck_id}'`);
      }
      if (el.unique_card_drop_id && !allCardIds.has(el.unique_card_drop_id)) {
        errors.push(`Elite encounter ${el.id} references invalid unique_card_drop_id: '${el.unique_card_drop_id}'`);
      }
    }
  }

  const valid = errors.length === 0;

  const summary = {
    valid,
    canonicalCardCatalogue: totalCards,
    typeCounts,
    rarityCounts,
    stagedExpansionCards: 160,
    campaignChapters: 12,
    namedNpcs: npcIds.size,
    sideQuests: questIds.size,
    dungeons: 16,
    tournaments: 8,
    companionStories: 24,
    secrets: 32,
    eliteEncounters: 20,
    errorsCount: errors.length,
    errors,
    warningsCount: warnings.length,
    warnings
  };

  console.log(`[WorldValidator] Validation complete. Valid: ${valid}. Errors: ${errors.length}, Warnings: ${warnings.length}`);
  return summary;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateWorldContent();
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) {
    process.exit(1);
  }
}
