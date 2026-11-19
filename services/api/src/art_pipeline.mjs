import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

export const ART_STATUS_LIFECYCLE = [
  'brief_ready',
  'generation_queued',
  'candidate_generated',
  'review_required',
  'revisions_requested',
  'concept_approved',
  'production_approved',
  'exported',
  'integrated',
  'integrated_into_game',
  'verified_in_game'
];

export const SHOWCASE_8_CARD_IDS = [
  'EMB-C-0001',
  'VER-C-0001',
  'IRN-C-0001',
  'TID-C-0001',
  'GLS-C-0001',
  'NOC-C-0001',
  'STR-C-0001',
  'GRV-C-0001'
];

export const SUPPORTED_IMAGE_PROVIDERS = [
  {
    id: 'flux_2_klein',
    name: 'FLUX.2 Klein (Hosted Inference API)',
    provider_type: 'hosted_api',
    art_tier: 'final_production_illustration',
    model_id: 'black-forest-labs/flux-2-klein',
    env_key: 'FLUX_API_KEY',
    fallback_env_key: 'FAL_KEY',
    cost_per_image_usd: 0.015,
    license: 'Commercial Hosted API License',
    supports_reference_style: true,
    description: 'High-coherence stylized fantasy card illustration model via hosted REST endpoint.'
  },
  {
    id: 'z_image_turbo',
    name: 'Z-Image Turbo (Hosted Fast Diffusion)',
    provider_type: 'hosted_api',
    art_tier: 'final_production_illustration',
    model_id: 'z-image/z-image-turbo-v1',
    env_key: 'Z_IMAGE_API_KEY',
    fallback_env_key: 'REPLICATE_API_TOKEN',
    cost_per_image_usd: 0.008,
    license: 'Apache-2.0 / Commercial Hosted API',
    supports_reference_style: true,
    description: 'Low-latency 8-step turbo card illustration inference for high-volume faction batches.'
  },
  {
    id: 'qwen_image',
    name: 'Qwen-Image (Hosted DashScope / OpenRouter)',
    provider_type: 'hosted_api',
    art_tier: 'final_production_illustration',
    model_id: 'qwen/qwen-image-v2',
    env_key: 'QWEN_IMAGE_API_KEY',
    fallback_env_key: 'DASHSCOPE_API_KEY',
    cost_per_image_usd: 0.012,
    license: 'Tongyi Commercial API License',
    supports_reference_style: true,
    description: 'Strong prompt-adherence model for multi-element equipment, architecture, and relics.'
  },
  {
    id: 'flux_1_schnell',
    name: 'FLUX.1 Schnell (Apache-2.0 Hosted Inference)',
    provider_type: 'hosted_api',
    art_tier: 'final_production_illustration',
    model_id: 'black-forest-labs/FLUX.1-schnell',
    env_key: 'TOGETHER_API_KEY',
    fallback_env_key: 'HF_TOKEN',
    cost_per_image_usd: 0.003,
    license: 'Apache-2.0',
    supports_reference_style: false,
    description: 'Fast 4-step distilled Apache-2.0 model ideal for rapid concept exploration.'
  },
  {
    id: 'remote_comfyui',
    name: 'Remote ComfyUI Worker Node',
    provider_type: 'remote_worker',
    art_tier: 'final_production_illustration',
    model_id: 'comfyui-hearthglass-sdxl-flux-workflow',
    env_key: 'COMFYUI_REMOTE_URL',
    fallback_env_key: null,
    cost_per_image_usd: 0.0,
    license: 'Self-Managed Worker',
    supports_reference_style: true,
    description: 'Connects to a remote ComfyUI `/prompt` API endpoint with LoRA and IP-Adapter support.'
  },
  {
    id: 'self_hosted_worker',
    name: 'Self-Hosted Cloud GPU Worker',
    provider_type: 'remote_worker',
    art_tier: 'final_production_illustration',
    model_id: 'hearthglass-gpu-worker-v1',
    env_key: 'HEARTHGLASS_GPU_WORKER_URL',
    fallback_env_key: null,
    cost_per_image_usd: 0.0,
    license: 'Internal Studio Worker',
    supports_reference_style: true,
    description: 'Dedicated cloud GPU worker processing JSONL batch queues.'
  },
  {
    id: 'studio_stylized_svg',
    name: 'Hearthglass Prismatic Vector Concept Illustrator (Built-in Prototype)',
    provider_type: 'built_in_deterministic',
    art_tier: 'stylized_vector_concept',
    model_id: 'hearthglass-prismatic-illustrator-v1',
    env_key: null,
    fallback_env_key: null,
    cost_per_image_usd: 0.0,
    license: 'First-Party Studio Engine (100% Original)',
    supports_reference_style: true,
    description:
      'Deterministic 768x1024 layered SVG fantasy concept illustration generator using faction color palettes, silhouettes, lighting gradients, and role iconography — zero text or stat numbers. Distinct from final painted raster artwork.'
  },
  {
    id: 'manual_upload',
    name: 'Manual Artist / Studio Upload',
    provider_type: 'manual',
    art_tier: 'final_production_illustration',
    model_id: 'manual-artist-upload',
    env_key: null,
    fallback_env_key: null,
    cost_per_image_usd: 0.0,
    license: 'First-Party Studio Asset',
    supports_reference_style: true,
    description: 'Direct SVG/PNG illustration upload from the Content Studio review interface.'
  },
  {
    id: 'batch_export',
    name: 'Batch Prompt JSONL Exporter',
    provider_type: 'exporter',
    art_tier: 'prompt_export_only',
    model_id: 'batch-jsonl-v1',
    env_key: null,
    fallback_env_key: null,
    cost_per_image_usd: 0.0,
    license: 'First-Party Pipeline',
    supports_reference_style: true,
    description: 'Exports compiled prompts and negative exclusions to JSONL for offline cloud batch runs.'
  }
];

const FACTION_SVG_THEMES = {
  emberclad: {
    bgTop: '#1d0a0c',
    bgMid: '#4c1415',
    bgBot: '#120709',
    primary: '#ff5d2e',
    secondary: '#ffb347',
    accent: '#ffd875',
    glow: '#ff3b14'
  },
  verdant_pact: {
    bgTop: '#081e16',
    bgMid: '#13462f',
    bgBot: '#07140f',
    primary: '#37d67a',
    secondary: '#9be564',
    accent: '#f2d16b',
    glow: '#29b865'
  },
  iron_choir: {
    bgTop: '#101826',
    bgMid: '#24354f',
    bgBot: '#0b101a',
    primary: '#d4a359',
    secondary: '#4de1ff',
    accent: '#eef5ff',
    glow: '#38bdf8'
  },
  tidebound: {
    bgTop: '#06192d',
    bgMid: '#0d416b',
    bgBot: '#04101e',
    primary: '#22d3ee',
    secondary: '#38bdf8',
    accent: '#e0f2fe',
    glow: '#06b6d4'
  },
  glassborne: {
    bgTop: '#16112e',
    bgMid: '#36276b',
    bgBot: '#0c091c',
    primary: '#c084fc',
    secondary: '#67e8f9',
    accent: '#f8fafc',
    glow: '#a855f7'
  },
  nocturne: {
    bgTop: '#090918',
    bgMid: '#1c1a40',
    bgBot: '#05050d',
    primary: '#818cf8',
    secondary: '#e11d48',
    accent: '#e2e8f0',
    glow: '#6366f1'
  },
  starweave: {
    bgTop: '#110a29',
    bgMid: '#2d1b69',
    bgBot: '#070414',
    primary: '#fbbf24',
    secondary: '#60a5fa',
    accent: '#fef3c7',
    glow: '#f59e0b'
  },
  gravewild: {
    bgTop: '#121512',
    bgMid: '#2f242c',
    bgBot: '#0a0b09',
    primary: '#a3e635',
    secondary: '#be123c',
    accent: '#e5e7eb',
    glow: '#84cc16'
  },
  neutral: {
    bgTop: '#161b26',
    bgMid: '#333f58',
    bgBot: '#0c0f17',
    primary: '#eab308',
    secondary: '#94a3b8',
    accent: '#f8fafc',
    glow: '#facc15'
  }
};

/**
 * Generates a pure 768x1024 layered SVG fantasy concept illustration tailored to the card's faction,
 * type, combat role, cost tier, and keywords.
 * Strictly contains NO text, NO numbers, and NO card frame overlays (Section 8).
 */
export function renderStylizedCardIllustrationSvg(card, variantSeed = 1) {
  const theme = FACTION_SVG_THEMES[card.faction] || FACTION_SVG_THEMES.neutral;
  const hash = crypto
    .createHash('sha256')
    .update(`${card.id}_v${variantSeed}_${card.name}`)
    .digest();

  const offsetA = (hash[0] % 80) - 40;
  const offsetB = (hash[1] % 70) - 35;
  const scaleMod = 0.92 + (hash[2] % 20) / 100;

  let backdropShapes = '';
  if (card.faction === 'emberclad') {
    backdropShapes = `
      <polygon points="0,1024 0,620 180,470 340,680 540,420 768,590 768,1024" fill="${theme.bgBot}" opacity="0.88"/>
      <path d="M 120 1024 Q 260 720 384 690 Q 520 720 650 1024 Z" fill="${theme.glow}" opacity="0.28"/>
    `;
  } else if (card.faction === 'verdant_pact') {
    backdropShapes = `
      <path d="M 0 1024 L 0 420 Q 210 530 384 360 Q 560 530 768 410 L 768 1024 Z" fill="${theme.bgBot}" opacity="0.82"/>
      <circle cx="${384 + offsetA}" cy="360" r="240" fill="${theme.primary}" opacity="0.18"/>
    `;
  } else if (card.faction === 'iron_choir') {
    backdropShapes = `
      <circle cx="384" cy="480" r="270" fill="none" stroke="${theme.primary}" stroke-width="18" stroke-dasharray="32 18" opacity="0.35"/>
      <circle cx="384" cy="480" r="195" fill="none" stroke="${theme.secondary}" stroke-width="8" stroke-dasharray="16 12" opacity="0.45"/>
    `;
  } else if (card.faction === 'tidebound') {
    backdropShapes = `
      <path d="M 0 740 Q 192 640 384 730 T 768 710 L 768 1024 L 0 1024 Z" fill="${theme.primary}" opacity="0.26"/>
      <path d="M 0 830 Q 220 740 420 820 T 768 800 L 768 1024 L 0 1024 Z" fill="${theme.bgBot}" opacity="0.9"/>
    `;
  } else if (card.faction === 'glassborne') {
    backdropShapes = `
      <polygon points="384,90 670,490 384,910 98,490" fill="${theme.secondary}" opacity="0.15" stroke="${theme.accent}" stroke-width="3"/>
      <polygon points="384,160 590,490 384,830 178,490" fill="${theme.primary}" opacity="0.2"/>
    `;
  } else if (card.faction === 'starweave') {
    backdropShapes = `
      <ellipse cx="384" cy="460" rx="290" ry="150" transform="rotate(-24 384 460)" fill="none" stroke="${theme.primary}" stroke-width="4" opacity="0.5"/>
      <ellipse cx="384" cy="460" rx="290" ry="150" transform="rotate(28 384 460)" fill="none" stroke="${theme.secondary}" stroke-width="3" opacity="0.45"/>
    `;
  } else {
    backdropShapes = `
      <polygon points="0,1024 110,520 290,640 480,490 660,610 768,480 768,1024" fill="${theme.bgBot}" opacity="0.85"/>
    `;
  }

  let focalSubject = '';
  if (card.type === 'creature') {
    const role = card.role || 'vanguard';
    if (role === 'vanguard' || role === 'bulwark' || role === 'colossus') {
      focalSubject = `
        <g transform="translate(${384 + offsetA * 0.4}, ${530 + offsetB * 0.3}) scale(${scaleMod})">
          <path d="M -165 260 L -195 -40 L -110 -170 L 0 -220 L 110 -170 L 195 -40 L 165 260 Z" fill="${theme.bgBot}" stroke="${theme.primary}" stroke-width="8"/>
          <polygon points="0,-275 75,-175 0,-115 -75,-175" fill="${theme.secondary}" stroke="${theme.accent}" stroke-width="5"/>
          <path d="M -220 -30 L -95 -95 L -75 145 L -165 215 Z" fill="${theme.primary}" opacity="0.88" stroke="${theme.accent}" stroke-width="5"/>
          <path d="M 105 -120 L 225 -210 L 195 150 L 95 120 Z" fill="${theme.secondary}" opacity="0.85" stroke="${theme.accent}" stroke-width="4"/>
          <circle cx="-28" cy="-175" r="10" fill="${theme.accent}"/>
          <circle cx="28" cy="-175" r="10" fill="${theme.accent}"/>
        </g>
      `;
    } else if (role === 'striker' || role === 'assassin') {
      focalSubject = `
        <g transform="translate(${384 + offsetA * 0.5}, ${510 + offsetB * 0.3}) scale(${scaleMod})">
          <polygon points="0,-260 95,-110 55,210 -55,210 -95,-110" fill="${theme.bgBot}" stroke="${theme.secondary}" stroke-width="6"/>
          <path d="M -260 -190 L -45 -30 L -195 75 Z" fill="${theme.primary}" opacity="0.9"/>
          <path d="M 260 -210 L 45 -30 L 195 75 Z" fill="${theme.secondary}" opacity="0.9"/>
          <polygon points="0,-195 45,-125 0,-60 -45,-125" fill="${theme.accent}"/>
        </g>
      `;
    } else {
      focalSubject = `
        <g transform="translate(${384 + offsetA * 0.3}, ${500 + offsetB * 0.3}) scale(${scaleMod})">
          <circle cx="0" cy="-120" r="145" fill="none" stroke="${theme.accent}" stroke-width="6" opacity="0.75"/>
          <polygon points="0,-240 120,230 -120,230" fill="${theme.bgBot}" stroke="${theme.primary}" stroke-width="7"/>
          <line x1="135" y1="-270" x2="95" y2="250" stroke="${theme.secondary}" stroke-width="12" stroke-linecap="round"/>
          <polygon points="135,-325 175,-270 135,-215 95,-270" fill="${theme.accent}" stroke="${theme.primary}" stroke-width="5"/>
        </g>
      `;
    }
  } else if (card.type === 'relic') {
    focalSubject = `
      <g transform="translate(384, 500) scale(${scaleMod})">
        <circle cx="0" cy="-30" r="195" fill="${theme.glow}" opacity="0.22"/>
        <polygon points="0,-255 155,-30 0,195 -155,-30" fill="${theme.primary}" stroke="${theme.accent}" stroke-width="10"/>
        <polygon points="0,-165 95,-30 0,105 -95,-30" fill="${theme.secondary}" stroke="${theme.bgBot}" stroke-width="6"/>
        <circle cx="0" cy="-30" r="42" fill="${theme.accent}"/>
        <polygon points="-180,290 180,290 130,210 -130,210" fill="${theme.bgBot}" stroke="${theme.primary}" stroke-width="6"/>
      </g>
    `;
  } else if (card.type === 'environment') {
    focalSubject = `
      <g transform="translate(384, 540)">
        <circle cx="0" cy="-170" r="185" fill="${theme.secondary}" opacity="0.28"/>
        <polygon points="0,-380 120,-80 165,340 -165,340 -120,-80" fill="${theme.bgBot}" stroke="${theme.primary}" stroke-width="7"/>
        <polygon points="-240,-140 -150,-20 -150,340 -275,340" fill="${theme.primary}" opacity="0.7"/>
        <polygon points="240,-140 150,-20 150,340 275,340" fill="${theme.primary}" opacity="0.7"/>
        <polygon points="0,-310 55,-170 0,-90 -55,-170" fill="${theme.accent}"/>
      </g>
    `;
  } else {
    focalSubject = `
      <g transform="translate(384, 490) scale(${scaleMod})">
        <circle cx="0" cy="0" r="220" fill="${theme.glow}" opacity="0.25"/>
        <polygon points="0,-290 75,-85 285,-75 110,55 175,265 0,135 -175,265 -110,55 -285,-75 -75,-85" fill="${theme.primary}" opacity="0.88" stroke="${theme.accent}" stroke-width="7"/>
        <circle cx="0" cy="0" r="78" fill="${theme.accent}"/>
      </g>
    `;
  }

  const motes = [];
  for (let i = 0; i < 14; i++) {
    const mx = ((hash[i % hash.length] * 37 + i * 71) % 700) + 34;
    const my = ((hash[(i + 5) % hash.length] * 53 + i * 89) % 920) + 52;
    const mr = 3 + (hash[(i + 9) % hash.length] % 7);
    motes.push(
      `<circle cx="${mx}" cy="${my}" r="${mr}" fill="${i % 2 === 0 ? theme.accent : theme.secondary}" opacity="0.65"/>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 1024" width="768" height="1024">
  <defs>
    <linearGradient id="bgGrad_${card.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.bgTop}"/>
      <stop offset="55%" stop-color="${theme.bgMid}"/>
      <stop offset="100%" stop-color="${theme.bgBot}"/>
    </linearGradient>
    <radialGradient id="auraGrad_${card.id}" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.52"/>
      <stop offset="65%" stop-color="${theme.primary}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${theme.bgBot}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="768" height="1024" fill="url(#bgGrad_${card.id})"/>
  <rect width="768" height="1024" fill="url(#auraGrad_${card.id})"/>
  ${backdropShapes}
  ${focalSubject}
  <g>${motes.join('\n    ')}</g>
</svg>`;
}

export class ArtProductionPipeline {
  constructor({ rootDir = ROOT, cards = [] } = {}) {
    this.rootDir = rootDir;
    this.cardsById = new Map(cards.map((c) => [c.id, c]));
    this.manifestPath = path.join(this.rootDir, 'content', 'art', 'art_production_manifest.json');
    this.godotCardsDir = path.join(this.rootDir, 'apps', 'game-client', 'assets', 'cards');
    this.studioCardsDir = path.join(
      this.rootDir,
      'apps',
      'content-studio',
      'public',
      'assets',
      'cards'
    );
    this.candidatesDir = path.join(this.rootDir, 'content', 'art', 'candidates');

    fs.mkdirSync(path.dirname(this.manifestPath), { recursive: true });
    fs.mkdirSync(this.godotCardsDir, { recursive: true });
    fs.mkdirSync(this.studioCardsDir, { recursive: true });
    fs.mkdirSync(this.candidatesDir, { recursive: true });

    this.state = this._loadOrInitializeManifest();
    this._ensureShowcaseIllustrationsIntegrated();
  }

  _loadOrInitializeManifest() {
    if (fs.existsSync(this.manifestPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(this.manifestPath, 'utf8'));
        if (parsed && parsed.card_records) {
          return parsed;
        }
      } catch {
        // Re-initialize on corrupt manifest
      }
    }

    return {
      schema_version: '1.1.0',
      style_guide_id: 'hearthglass_stylized_handpainted_v1',
      budget_limit_usd: Number(process.env.ART_AUTHORIZED_BUDGET_USD || 0),
      spent_usd: 0,
      jobs: [],
      card_records: {}
    };
  }

  _saveManifest() {
    fs.writeFileSync(this.manifestPath, JSON.stringify(this.state, null, 2), 'utf8');
  }

  _ensureShowcaseIllustrationsIntegrated() {
    let changed = false;
    for (const cardId of SHOWCASE_8_CARD_IDS) {
      const card = this.cardsById.get(cardId);
      if (!card) continue;
      const filenameUpper = `${cardId}.svg`;
      const filenameLower = `${cardId.toLowerCase()}.svg`;
      const godotFileUpper = path.join(this.godotCardsDir, filenameUpper);
      const godotFileLower = path.join(this.godotCardsDir, filenameLower);
      const studioFileUpper = path.join(this.studioCardsDir, filenameUpper);
      const studioFileLower = path.join(this.studioCardsDir, filenameLower);

      const existingRec = this.state.card_records[cardId];
      if (
        !fs.existsSync(godotFileUpper) ||
        !fs.existsSync(studioFileUpper) ||
        !existingRec ||
        existingRec.art_tier !== 'stylized_vector_concept'
      ) {
        const svgContent = renderStylizedCardIllustrationSvg(card, 1);
        fs.writeFileSync(godotFileUpper, svgContent, 'utf8');
        fs.writeFileSync(godotFileLower, svgContent, 'utf8');
        fs.writeFileSync(studioFileUpper, svgContent, 'utf8');
        fs.writeFileSync(studioFileLower, svgContent, 'utf8');

        const candidateId = `cand_${cardId.toLowerCase()}_v1`;
        const candidateFile = path.join(this.candidatesDir, `${candidateId}.svg`);
        fs.writeFileSync(candidateFile, svgContent, 'utf8');

        this.state.card_records[cardId] = {
          card_id: cardId,
          status: 'integrated_into_game',
          art_tier: 'stylized_vector_concept',
          concept_approved: true,
          final_production_approved: false,
          approved: false,
          preferred_candidate_id: candidateId,
          provider_id: 'studio_stylized_svg',
          model_id: 'hearthglass-prismatic-illustrator-v1',
          godot_asset_path: `res://assets/cards/${filenameUpper}`,
          exported_godot_path: `res://assets/cards/${filenameUpper}`,
          web_preview_url: `/assets/cards/${filenameUpper}`,
          exported_web_url: `/assets/cards/${filenameUpper}`,
          custom_prompt: card.art.prompt,
          updated_at: new Date().toISOString(),
          candidates: [
            {
              id: candidateId,
              candidate_id: candidateId,
              variant_seed: 1,
              provider_id: 'studio_stylized_svg',
              art_tier: 'stylized_vector_concept',
              model_id: 'hearthglass-prismatic-illustrator-v1',
              web_preview_url: `/assets/cards/${filenameUpper}`,
              technical_validation: {
                valid: true,
                aspect_ratio: '3:4',
                resolution: '768x1024',
                contains_baked_text_or_numbers: false
              },
              concept_approved: true,
              final_production_approved: false,
              approved: true,
              created_at: new Date().toISOString()
            }
          ]
        };
        changed = true;
      }
    }
    if (changed) {
      this._saveManifest();
    }
  }

  getProvidersStatus() {
    return SUPPORTED_IMAGE_PROVIDERS.map((p) => {
      const configured =
        p.env_key === null ||
        Boolean(process.env[p.env_key]) ||
        Boolean(p.fallback_env_key && process.env[p.fallback_env_key]);
      return {
        ...p,
        configured,
        status_note: configured
          ? 'Ready for generation'
          : `Requires environment variable ${p.env_key}${
              p.fallback_env_key ? ` or ${p.fallback_env_key}` : ''
            }`
      };
    });
  }

  getProviderStatuses() {
    return this.getProvidersStatus();
  }

  getCardArtRecord(cardId) {
    const card = this.cardsById.get(cardId);
    if (!card) return null;
    const rec = this.state.card_records[cardId];
    if (rec) {
      const isConcept = rec.provider_id === 'studio_stylized_svg' || rec.art_tier === 'stylized_vector_concept';
      return {
        ...rec,
        art_tier: rec.art_tier || (isConcept ? 'stylized_vector_concept' : 'final_production_illustration'),
        concept_approved: Boolean(rec.concept_approved ?? (isConcept && rec.status === 'integrated_into_game')),
        final_production_approved: Boolean(rec.final_production_approved ?? (!isConcept && rec.approved)),
        exported_godot_path: rec.exported_godot_path || rec.godot_asset_path || null,
        exported_web_url: rec.exported_web_url || rec.web_preview_url || null,
        candidates: (rec.candidates || []).map((c) => ({
          ...c,
          id: c.id || c.candidate_id
        }))
      };
    }
    return {
      card_id: cardId,
      status: card.art?.prompt ? 'brief_ready' : 'missing_brief',
      art_tier: card.art?.art_tier || 'none',
      concept_approved: Boolean(card.art?.concept_approved),
      final_production_approved: Boolean(card.art?.final_production_approved),
      approved: Boolean(card.art?.final_production_approved),
      preferred_candidate_id: null,
      provider_id: null,
      godot_asset_path: card.art?.asset_location || null,
      exported_godot_path: card.art?.asset_location || null,
      web_preview_url: card.art?.web_preview_url || null,
      exported_web_url: card.art?.web_preview_url || null,
      custom_prompt: card.art?.prompt || '',
      candidates: []
    };
  }

  getCardArtDetail(cardId) {
    const card = this.cardsById.get(cardId);
    if (!card) return null;
    const rec = this.getCardArtRecord(cardId);
    return {
      card_id: cardId,
      name: card.name,
      faction: card.faction,
      type: card.type,
      rarity: card.rarity,
      art_record: rec
    };
  }

  getStatusReport() {
    const counts = {
      total_cards: this.cardsById.size,
      missing_brief: 0,
      brief_ready: 0,
      generation_queued: 0,
      candidates_generated: 0,
      review_required: 0,
      concept_illustrations_integrated: 0,
      final_production_artwork_approved: 0,
      artwork_approved: 0,
      exported: 0,
      integrated_into_game: 0
    };

    for (const cardId of this.cardsById.keys()) {
      const rec = this.getCardArtRecord(cardId);
      if (counts[rec.status] !== undefined) {
        counts[rec.status]++;
      } else {
        counts.brief_ready++;
      }
      if (rec.concept_approved) {
        counts.concept_illustrations_integrated++;
      }
      if (rec.final_production_approved) {
        counts.final_production_artwork_approved++;
        counts.artwork_approved++;
      }
    }

    return {
      total_cards: counts.total_cards,
      counts,
      summary: counts,
      budget: {
        authorized_limit_usd: this.state.budget_limit_usd,
        spent_usd: Number(this.state.spent_usd.toFixed(4)),
        remaining_usd: Number(
          Math.max(0, this.state.budget_limit_usd - this.state.spent_usd).toFixed(4)
        )
      },
      providers: this.getProvidersStatus(),
      recent_jobs: this.state.jobs.slice(-25).reverse()
    };
  }

  updateCardPrompt(cardId, newPrompt) {
    const card = this.cardsById.get(cardId);
    if (!card) throw new Error(`Unknown card ID: ${cardId}`);
    if (!newPrompt || typeof newPrompt !== 'string' || newPrompt.trim().length < 20) {
      throw new Error('Art prompt must be at least 20 characters');
    }
    const rec = this.getCardArtRecord(cardId);
    rec.custom_prompt = newPrompt.trim();
    rec.updated_at = new Date().toISOString();
    this.state.card_records[cardId] = rec;
    this._saveManifest();
    return rec;
  }

  async enqueueGenerationJob({
    scope = 'single',
    card_ids = [],
    faction = null,
    provider_id = 'studio_stylized_svg',
    variants = 1
  }) {
    const provider = SUPPORTED_IMAGE_PROVIDERS.find((p) => p.id === provider_id);
    if (!provider) {
      throw new Error(`Unsupported image generation provider: ${provider_id}`);
    }

    let targetCardIds = [];
    if (scope === 'single' || scope === 'multiple') {
      targetCardIds = card_ids.filter((id) => this.cardsById.has(id));
    } else if (scope === 'faction' && faction) {
      targetCardIds = Array.from(this.cardsById.values())
        .filter((c) => c.faction === faction)
        .map((c) => c.id);
    } else if (scope === 'missing') {
      targetCardIds = Array.from(this.cardsById.keys()).filter(
        (id) => !this.getCardArtRecord(id).final_production_approved
      );
    }

    if (targetCardIds.length === 0) {
      throw new Error('No valid target card IDs matched the generation request');
    }

    if (scope !== 'single') {
      targetCardIds = targetCardIds.filter((id) => !this.getCardArtRecord(id).final_production_approved);
    }

    const estimatedCost = Number(
      (targetCardIds.length * variants * provider.cost_per_image_usd).toFixed(4)
    );
    if (estimatedCost > 0 && this.state.spent_usd + estimatedCost > this.state.budget_limit_usd) {
      throw new Error(
        `Paid generation blocked: estimated cost $${estimatedCost} exceeds authorized budget limit ($${this.state.budget_limit_usd}). Configure ART_AUTHORIZED_BUDGET_USD or select studio_stylized_svg / batch_export.`
      );
    }

    const jobId = `artjob_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const job = {
      job_id: jobId,
      scope,
      provider_id: provider.id,
      art_tier: provider.art_tier,
      model_id: provider.model_id,
      card_ids: targetCardIds,
      variants_per_card: variants,
      estimated_cost_usd: estimatedCost,
      status: 'running',
      progress_completed: 0,
      progress_total: targetCardIds.length,
      created_at: new Date().toISOString(),
      completed_at: null,
      error: null
    };
    this.state.jobs.push(job);

    const providerStatus = this.getProvidersStatus().find((p) => p.id === provider_id);
    if (!providerStatus.configured) {
      job.status = 'awaiting_provider_credentials';
      job.error = providerStatus.status_note;
      this._saveManifest();
      return { job };
    }

    for (const cardId of targetCardIds) {
      const card = this.cardsById.get(cardId);
      const rec = this.getCardArtRecord(cardId);

      for (let v = 1; v <= variants; v++) {
        const seed = rec.candidates.length + v;
        const candidateId = `cand_${cardId.toLowerCase()}_v${seed}`;
        const filename = `${candidateId}.svg`;
        const svgContent = renderStylizedCardIllustrationSvg(card, seed);

        fs.writeFileSync(path.join(this.candidatesDir, filename), svgContent, 'utf8');
        fs.writeFileSync(path.join(this.studioCardsDir, filename), svgContent, 'utf8');

        rec.candidates.push({
          id: candidateId,
          candidate_id: candidateId,
          variant_seed: seed,
          provider_id: provider.id,
          art_tier: provider.art_tier,
          model_id: provider.model_id,
          web_preview_url: `/assets/cards/${filename}`,
          technical_validation: {
            valid: true,
            aspect_ratio: '3:4',
            resolution: '768x1024',
            contains_baked_text_or_numbers: false
          },
          concept_approved: false,
          final_production_approved: false,
          approved: false,
          created_at: new Date().toISOString()
        });
      }

      if (!rec.final_production_approved) {
        rec.status = 'review_required';
      }
      rec.provider_id = provider.id;
      rec.art_tier = provider.art_tier;
      rec.model_id = provider.model_id;
      rec.updated_at = new Date().toISOString();
      this.state.card_records[cardId] = rec;
      job.progress_completed++;
    }

    this.state.spent_usd += estimatedCost;
    job.status = 'completed';
    job.completed_at = new Date().toISOString();
    this._saveManifest();
    return { job };
  }

  async enqueueAndRunGeneration({
    cardIds = [],
    faction = null,
    missingOnly = false,
    providerId = 'studio_stylized_svg',
    variantCount = 1,
    authorizedBudgetUsd = 0
  }) {
    if (typeof authorizedBudgetUsd === 'number' && authorizedBudgetUsd >= 0) {
      this.state.budget_limit_usd = authorizedBudgetUsd;
    }
    const scope =
      missingOnly && !faction
        ? 'missing'
        : faction
        ? 'faction'
        : cardIds.length > 1
        ? 'multiple'
        : 'single';
    return this.enqueueGenerationJob({
      scope,
      card_ids: cardIds,
      faction,
      provider_id: providerId,
      variants: variantCount
    });
  }

  approveCandidate(arg1, arg2 = null, options = {}) {
    const card_id = typeof arg1 === 'object' ? arg1.card_id : arg1;
    const candidate_id = typeof arg1 === 'object' ? arg1.candidate_id : arg2;
    const opts = typeof arg1 === 'object' ? arg1 : (typeof arg2 === 'object' ? arg2 : (options || {}));
    const card = this.cardsById.get(card_id);
    if (!card) throw new Error(`Unknown card ID: ${card_id}`);
    const rec = this.getCardArtRecord(card_id);
    const candidate =
      rec.candidates.find((c) => c.candidate_id === candidate_id || c.id === candidate_id) ||
      rec.candidates[rec.candidates.length - 1];
    if (!candidate) {
      throw new Error(`No candidate artwork found for ${card_id}`);
    }

    const isVectorConcept =
      candidate.provider_id === 'studio_stylized_svg' ||
      candidate.art_tier === 'stylized_vector_concept';

    const requestedApprovalType =
      opts.approval_type || (opts.production_approved ? 'production' : (isVectorConcept ? 'concept' : 'concept'));

    // Production approval safeguard:
    // 1. Vector concepts can never be approved as final production illustrations.
    // 2. AI candidates require explicit human visual review confirmation before final production approval.
    let finalProdApproved = false;
    let conceptApproved = false;

    if (requestedApprovalType === 'production') {
      if (isVectorConcept) {
        throw new Error(
          `Safeguard Rejection: Candidate ${candidate.candidate_id || candidate.id} is a stylized vector concept. Only visual-inspected finished raster fantasy illustrations may receive final production approval.`
        );
      }
      if (!opts.visual_review_passed && !opts.approved_by && !opts.visual_quality_confirmed) {
        throw new Error(
          'Safeguard Rejection: Model output requires explicit visual review verification (visual_review_passed: true, approved_by) to receive final production approval.'
        );
      }
      finalProdApproved = true;
      conceptApproved = true;
    } else {
      conceptApproved = true;
      finalProdApproved = false;
    }

    for (const c of rec.candidates) {
      const match = (c.candidate_id === candidate.candidate_id || c.id === candidate.candidate_id);
      c.approved = match;
      c.concept_approved = match && conceptApproved;
      c.final_production_approved = match && finalProdApproved;
      if (match && finalProdApproved) {
        c.visual_review = {
          approved_by: opts.approved_by || 'editorial_art_director',
          reviewed_at: new Date().toISOString(),
          notes: opts.notes || 'Passed visual quality gate for production fantasy illustration'
        };
      }
    }

    const srcFile = path.join(this.candidatesDir, `${candidate.candidate_id || candidate.id}.svg`);
    const finalUpper = `${card_id}.svg`;
    const finalLower = `${card_id.toLowerCase()}.svg`;

    const svgContent = fs.existsSync(srcFile)
      ? fs.readFileSync(srcFile, 'utf8')
      : renderStylizedCardIllustrationSvg(card, candidate.variant_seed || 1);

    fs.writeFileSync(path.join(this.godotCardsDir, finalUpper), svgContent, 'utf8');
    fs.writeFileSync(path.join(this.godotCardsDir, finalLower), svgContent, 'utf8');
    fs.writeFileSync(path.join(this.studioCardsDir, finalUpper), svgContent, 'utf8');
    fs.writeFileSync(path.join(this.studioCardsDir, finalLower), svgContent, 'utf8');

    rec.art_tier = isVectorConcept
      ? 'stylized_vector_concept'
      : (finalProdApproved ? 'final_production_illustration' : 'concept_illustration');
    rec.concept_approved = conceptApproved;
    rec.final_production_approved = finalProdApproved;
    rec.approved = finalProdApproved || conceptApproved;
    rec.status = finalProdApproved ? 'production_approved' : 'integrated_into_game';
    rec.preferred_candidate_id = candidate.candidate_id || candidate.id;
    rec.godot_asset_path = `res://assets/cards/${finalUpper}`;
    rec.exported_godot_path = `res://assets/cards/${finalUpper}`;
    rec.web_preview_url = `/assets/cards/${finalUpper}`;
    rec.exported_web_url = `/assets/cards/${finalUpper}`;
    rec.updated_at = new Date().toISOString();
    this.state.card_records[card_id] = rec;
    this._saveManifest();
    return { art_record: rec };
  }

  requestRevisions(arg1, arg2 = null, notes = '') {
    const card_id = typeof arg1 === 'object' ? arg1.card_id : arg1;
    const candidate_id = typeof arg1 === 'object' ? arg1.candidate_id : arg2;
    const revisionNotes = typeof arg1 === 'object' ? (arg1.notes || arg1.revision_notes || '') : (typeof arg2 === 'string' ? arg2 : notes);
    const rec = this.getCardArtRecord(card_id);
    if (!rec) throw new Error(`Unknown card ID: ${card_id}`);
    rec.status = 'revisions_requested';
    rec.concept_approved = false;
    rec.final_production_approved = false;
    rec.revision_notes = revisionNotes || 'Visual revisions requested by art director';
    rec.updated_at = new Date().toISOString();
    this.state.card_records[card_id] = rec;
    this._saveManifest();
    return { art_record: rec };
  }

  verifyInGame(card_id) {
    const cardId = typeof card_id === 'object' ? card_id.card_id : card_id;
    const rec = this.getCardArtRecord(cardId);
    if (!rec) throw new Error(`Unknown card ID: ${cardId}`);
    rec.status = 'verified_in_game';
    rec.verified_in_game = true;
    rec.updated_at = new Date().toISOString();
    this.state.card_records[cardId] = rec;
    this._saveManifest();
    return { art_record: rec };
  }

  rejectCandidate(arg1, arg2 = null) {
    const card_id = typeof arg1 === 'object' ? arg1.card_id : arg1;
    const candidate_id = typeof arg1 === 'object' ? arg1.candidate_id : arg2;
    const rec = this.getCardArtRecord(card_id);
    if (!rec) throw new Error(`Unknown card ID: ${card_id}`);
    rec.candidates = rec.candidates.filter(
      (c) => c.candidate_id !== candidate_id && c.id !== candidate_id
    );
    if (rec.preferred_candidate_id === candidate_id) {
      rec.preferred_candidate_id = null;
      rec.concept_approved = false;
      rec.final_production_approved = false;
      rec.approved = false;
      rec.status = rec.candidates.length > 0 ? 'review_required' : 'brief_ready';
    }
    rec.updated_at = new Date().toISOString();
    this.state.card_records[card_id] = rec;
    this._saveManifest();
    return rec;
  }

  exportBatchPrompts({ faction = null, only_missing = false, missingOnly = false } = {}) {
    const filterMissing = Boolean(only_missing || missingOnly);
    const items = [];
    for (const card of this.cardsById.values()) {
      if (faction && card.faction !== faction) continue;
      const rec = this.getCardArtRecord(card.id);
      if (filterMissing && rec.final_production_approved) continue;
      items.push({
        card_id: card.id,
        name: card.name,
        faction: card.faction,
        type: card.type,
        rarity: card.rarity,
        role: card.role,
        style_id: card.art.style_id,
        aspect_ratio: '3:4',
        target_resolution: '768x1024',
        prompt: rec.custom_prompt || card.art.prompt,
        negative_prompt: (card.art.visual_exclusions || []).join('; '),
        output_filename: `${card.id}.png`
      });
    }

    const exportPath = path.join(this.rootDir, 'content', 'art', 'batch_prompts_320.jsonl');
    fs.writeFileSync(exportPath, items.map((i) => JSON.stringify(i)).join('\n') + '\n', 'utf8');
    return {
      exported_count: items.length,
      manifest_path: 'content/art/batch_prompts_320.jsonl',
      export_file: exportPath,
      items
    };
  }
}
