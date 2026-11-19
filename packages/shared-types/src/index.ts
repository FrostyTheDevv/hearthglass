export type FactionId =
  | 'emberclad'
  | 'verdant_pact'
  | 'iron_choir'
  | 'tidebound'
  | 'glassborne'
  | 'nocturne'
  | 'starweave'
  | 'gravewild'
  | 'neutral';

export type CardType = 'creature' | 'tactic' | 'relic' | 'environment';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type CombatRole =
  | 'vanguard'
  | 'bulwark'
  | 'assassin'
  | 'marksman'
  | 'caster'
  | 'support'
  | 'trickster'
  | 'summoner'
  | 'controller'
  | 'colossus';

export type CoreKeyword =
  | 'guard'
  | 'swift'
  | 'reach'
  | 'pierce'
  | 'ward'
  | 'stealth'
  | 'drain'
  | 'anchor'
  | 'skirmish'
  | 'rebirth'
  | 'burn'
  | 'growth'
  | 'shield'
  | 'exhaust'
  | 'silence'
  | 'awaken'
  | 'resonate'
  | 'recall'
  | 'corrode'
  | 'echo';

export interface EffectOperation {
  operation:
    | 'deal_damage'
    | 'heal'
    | 'draw'
    | 'discard'
    | 'summon_token'
    | 'destroy'
    | 'return_to_hand'
    | 'move_lane'
    | 'add_counter'
    | 'remove_counter'
    | 'modify_stats'
    | 'grant_keyword'
    | 'silence'
    | 'gain_aether'
    | 'reclaim_from_discard'
    | 'scry_top_deck';
  target: string;
  amount?: number;
  counter?: string;
  attack_delta?: number;
  health_delta?: number;
  keyword?: CoreKeyword;
  token_name?: string;
  attack?: number;
  health?: number;
  keywords?: CoreKeyword[];
}

export interface AbilityDefinition {
  trigger:
    | 'on_summon'
    | 'on_play'
    | 'after_this_attacks'
    | 'when_damaged'
    | 'on_death'
    | 'on_move'
    | 'turn_start'
    | 'turn_end';
  conditions: Array<{ type: string; counter?: string; value?: number }>;
  effects: EffectOperation[];
}

export interface CardDefinition {
  id: string;
  revision: number;
  name: string;
  name_key: string;
  description: string;
  description_key: string;
  type: CardType;
  subtype: string;
  faction: FactionId;
  rarity: Rarity;
  role: CombatRole | null;
  cost: number;
  attack: number;
  health: number;
  keywords: CoreKeyword[];
  mechanics: string[];
  abilities: AbilityDefinition[];
  lore: string;
  archetypes: string[];
  weaknesses: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  balance_version: string;
  release_set: string;
}
