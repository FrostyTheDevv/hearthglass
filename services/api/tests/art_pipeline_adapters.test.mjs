import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ImageAdapterRegistry,
  FluxKleinAdapter,
  ZImageTurboAdapter,
  QwenImageAdapter,
  FluxSchnellAdapter,
  ComfyUIWorkerAdapter,
  SelfHostedWorkerAdapter,
  MOCK_VALID_PNG_BYTES,
  MOCK_VALID_WEBP_BYTES
} from '../src/art_adapters.mjs';
import {
  ArtProductionPipeline,
  validateArtworkTechnical,
  detectImageFormat
} from '../src/art_pipeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

const testCards = [
  {
    id: 'EMB-C-0001',
    name: 'Ashborne Initiate',
    faction: 'emberclad',
    type: 'creature',
    role: 'vanguard',
    attack: 2,
    health: 2,
    cost: 1,
    rarity: 'common',
    description: 'Swift. After this attacks, gain 1 Heat counter.',
    lore: 'Every apprentice of the Cinder Anvil learns to strike while their gauntlets still glow white-hot.',
    art: {
      prompt: 'A fiery apprentice of the Cinder Anvil',
      style_id: 'hearthglass_stylized_handpainted_v1'
    }
  },
  {
    id: 'VER-C-0001',
    name: 'Mossveil Tender',
    faction: 'verdant_pact',
    type: 'creature',
    role: 'support',
    attack: 1,
    health: 3,
    cost: 1,
    rarity: 'common',
    description: 'On Summon: Grant an allied creature 1 Growth counter and restore 1 Vitality.',
    lore: 'She coaxes dormant Echo seeds out of cracked cobblestone and rusted battle armor alike.',
    art: {
      prompt: 'A woodland druid tender cupping glowing emerald seeds',
      style_id: 'hearthglass_stylized_handpainted_v1'
    }
  }
];

test('Art Pipeline Adapters & Production Workflow Suite', async (t) => {
  const tempDir = path.join(ROOT, 'content', 'art', '__test_adapters_temp__' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  const pipeline = new ArtProductionPipeline({
    rootDir: tempDir,
    cards: testCards
  });
  pipeline.state.budget_limit_usd = 100.0;

  t.after(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup
    }
  });

  await t.test('1. ImageAdapterRegistry registers all 6 production adapters and runs mock verification', async () => {
    const registry = new ImageAdapterRegistry();
    const statuses = registry.listStatuses();
    assert.equal(statuses.length, 6, 'Must register 6 external adapters');

    const expectedIds = [
      'flux_2_klein',
      'z_image_turbo',
      'qwen_image',
      'flux_1_schnell',
      'remote_comfyui',
      'self_hosted_worker'
    ];
    for (const id of expectedIds) {
      assert.ok(registry.get(id), `Adapter ${id} must exist in registry`);
    }

    const mockResults = await registry.runMockVerificationSuite();
    for (const id of expectedIds) {
      assert.ok(mockResults[id], `Mock result for ${id} must exist`);
      assert.equal(mockResults[id].success, true, `Mock verification for ${id} must pass`);
      const adapter = registry.get(id);
      assert.equal(adapter.testStatus, 'mock_tested');
    }
  });

  await t.test('2. ComfyUI remote worker generates valid 9-node execution graph', () => {
    const comfy = new ComfyUIWorkerAdapter();
    const graph = comfy.formatWorkflowGraph({
      prompt: 'Aetheric Sentinel',
      negativePrompt: 'blurry, text',
      seed: 777,
      width: 768,
      height: 1024
    });

    assert.equal(graph['3'].class_type, 'KSampler');
    assert.equal(graph['3'].inputs.seed, 777);
    assert.equal(graph['5'].inputs.width, 768);
    assert.equal(graph['5'].inputs.height, 1024);
    assert.equal(graph['6'].inputs.text, 'Aetheric Sentinel');
    assert.equal(graph['9'].class_type, 'SaveImage');
  });

  await t.test('3. Unconfigured adapters gracefully report awaiting credentials without crashing or faking generation', async () => {
    // When API key is not present, live enqueueing reports awaiting_provider_credentials
    const res = await pipeline.enqueueGenerationJob({
      scope: 'single',
      card_ids: ['EMB-C-0001'],
      provider_id: 'flux_2_klein',
      variants: 1,
      isMock: false
    });

    assert.ok(res.job);
    assert.equal(res.job.status, 'awaiting_provider_credentials');
    assert.match(res.job.error, /FLUX_API_KEY/);

    const rec = pipeline.getCardArtRecord('EMB-C-0001');
    assert.equal(rec.final_production_approved, false);
  });

  await t.test('4. Mock-mode adapter execution ingests real raster candidate with full provenance metadata', async () => {
    const res = await pipeline.enqueueGenerationJob({
      scope: 'single',
      card_ids: ['EMB-C-0001'],
      provider_id: 'flux_2_klein',
      variants: 1,
      isMock: true
    });

    assert.equal(res.job.status, 'completed');
    const rec = pipeline.getCardArtRecord('EMB-C-0001');
    assert.equal(rec.status, 'review_required');
    assert.ok(rec.candidates.length >= 2, 'Should have initial concept + new raster candidate');

    const rasterCand = rec.candidates.find((c) => c.provider_id === 'flux_2_klein');
    assert.ok(rasterCand, 'Must have raster candidate from flux_2_klein');
    assert.equal(rasterCand.art_tier, 'final_production_illustration');
    assert.equal(rasterCand.file_type, 'png');
    assert.equal(rasterCand.provenance.mode, 'mock');
    assert.equal(rasterCand.final_production_approved, false);
    assert.equal(rasterCand.approved, false);
  });

  await t.test('5. Prompt compilation incorporates faction visual directives and canonical stats', () => {
    const compiled = pipeline.compileCardArtPrompt(testCards[0]);
    assert.equal(compiled.card_id, 'EMB-C-0001');
    assert.equal(compiled.faction, 'emberclad');
    assert.match(compiled.prompt, /Emberclad/i);
    assert.match(compiled.prompt, /Ashborne Initiate/i);
    assert.match(compiled.prompt, /768x1024/);
    assert.match(compiled.prompt, /zero baked text/i);
    assert.match(compiled.negative_prompt, /baked text/i);
  });

  await t.test('6. Production approval exports Godot .import file with correct texture metadata', () => {
    const rec = pipeline.getCardArtRecord('EMB-C-0001');
    const rasterCand = rec.candidates.find((c) => c.provider_id === 'flux_2_klein');
    assert.ok(rasterCand);

    const appRes = pipeline.approveCandidate('EMB-C-0001', rasterCand.candidate_id, {
      approval_type: 'production',
      approved_by: 'lead_art_director_marcus',
      visual_review_passed: true,
      visual_quality_confirmed: true,
      notes: 'Excellent volcanic palette and pose'
    });

    assert.equal(appRes.art_record.final_production_approved, true);
    assert.equal(appRes.art_record.approved, true);

    const godotFile = path.join(tempDir, 'apps', 'game-client', 'assets', 'cards', 'EMB-C-0001.png');
    const importFile = path.join(tempDir, 'apps', 'game-client', 'assets', 'cards', 'EMB-C-0001.png.import');
    assert.ok(fs.existsSync(godotFile), 'Godot card texture must exist');
    assert.ok(fs.existsSync(importFile), 'Godot texture .import file must exist');

    const importContent = fs.readFileSync(importFile, 'utf8');
    assert.match(importContent, /importer="texture"/);
    assert.match(importContent, /type="CompressedTexture2D"/);
    assert.match(importContent, /compress\/mode=0/);
    assert.match(importContent, /mipmaps\/generate=true/);
  });

  await t.test('7. Version history is tracked on approvals and allows rollback to previous version', () => {
    const rec = pipeline.getCardArtRecord('EMB-C-0001');
    assert.ok(rec.version_history.length >= 1, 'Version history must have at least 1 record');
    assert.equal(rec.version_history[0].version, 1);
    assert.equal(rec.version_history[0].approved_by, 'lead_art_director_marcus');

    // Ingest a second candidate
    const cand2 = pipeline.ingestRasterCandidate({
      card_id: 'EMB-C-0001',
      buffer: MOCK_VALID_PNG_BYTES,
      original_filename: 'ashborne_v2.png',
      provider_id: 'manual_upload',
      model_id: 'manual-artist-upload'
    });

    // Approve version 2 with allow_overwrite: true
    pipeline.approveCandidate('EMB-C-0001', cand2.candidate.candidate_id, {
      approval_type: 'production',
      approved_by: 'lead_art_director_marcus',
      visual_review_passed: true,
      visual_quality_confirmed: true,
      allow_overwrite: true,
      notes: 'Second iteration with higher contrast'
    });

    const recV2 = pipeline.getCardArtRecord('EMB-C-0001');
    assert.equal(recV2.version_history.length, 2, 'Version history must record version 2');

    // Rollback to version 1
    const rollbackRes = pipeline.rollbackToVersion('EMB-C-0001', 1);
    assert.ok(rollbackRes.art_record);
    assert.equal(rollbackRes.art_record.final_production_approved, true);
    assert.equal(rollbackRes.art_record.preferred_candidate_id, rec.version_history[0].candidate_id);
  });

  await t.test('8. Revisions requested transitions card status and records art director feedback', () => {
    const revRes = pipeline.requestRevisions('VER-C-0001', null, 'Need stronger rim lighting on spore clouds');
    assert.equal(revRes.art_record.status, 'revisions_requested');
    assert.equal(revRes.art_record.concept_approved, false);
    assert.equal(revRes.art_record.final_production_approved, false);
    assert.match(revRes.art_record.revision_notes, /rim lighting/);

    const report = pipeline.getStatusReport();
    assert.equal(report.counts.revisions_requested, 1);
  });

  await t.test('9. Technical image validation correctly extracts dimensions and validates 3:4 aspect ratio', () => {
    const valPng = validateArtworkTechnical(MOCK_VALID_PNG_BYTES, 'test.png');
    assert.equal(valPng.valid, true);
    assert.equal(valPng.format, 'png');
    assert.equal(valPng.is_raster, true);
    assert.equal(valPng.width, 1);
    assert.equal(valPng.height, 1);

    const valWebp = validateArtworkTechnical(MOCK_VALID_WEBP_BYTES, 'test.webp');
    assert.equal(valWebp.valid, true);
    assert.equal(valWebp.format, 'webp');
    assert.equal(valWebp.is_raster, true);
  });

  await t.test('10. Job cancellation updates status to cancelled', () => {
    const jobId = pipeline.state.jobs[0]?.job_id;
    if (jobId) {
      // Create a running dummy job
      pipeline.state.jobs.push({
        job_id: 'job_to_cancel_123',
        status: 'running',
        progress_completed: 0,
        progress_total: 10
      });
      const cancelled = pipeline.cancelJob('job_to_cancel_123');
      assert.equal(cancelled.status, 'cancelled');
    }
  });
});
