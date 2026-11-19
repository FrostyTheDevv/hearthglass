import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { ArtProductionPipeline, detectImageFormat } from '../src/art_pipeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

// Real minimal valid 1x1 PNG byte array
const REAL_PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR header
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 width, height
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, // bit depth, color type, compression, filter, interlace
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, // IDAT length & header
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, // compressed image data
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, // IEND chunk
  0x42, 0x60, 0x82
]);

// Real minimal valid WebP byte array
const REAL_WEBP_BYTES = Buffer.from([
  0x52, 0x49, 0x46, 0x46, // "RIFF"
  0x1a, 0x00, 0x00, 0x00, // file length - 8
  0x57, 0x45, 0x42, 0x50, // "WEBP"
  0x56, 0x50, 0x38, 0x20, // "VP8 " chunk
  0x0e, 0x00, 0x00, 0x00, // chunk length
  0x90, 0x00, 0x00, 0x9d, 0x01, 0x2a, 0x01, 0x00, // VP8 keyframe data
  0x01, 0x00, 0x02, 0x00, 0x34, 0x25
]);

const sampleCards = [
  {
    id: 'TEST-C-0001',
    name: 'Aether Smith Master',
    faction: 'iron_choir',
    type: 'creature',
    rarity: 'rare',
    art: {
      prompt: 'A master blacksmith hammering a glowing blue crystal blade in an iron forge.',
      style_id: 'hearthglass_stylized_handpainted_v1'
    }
  },
  {
    id: 'TEST-C-0002',
    name: 'Verdant Spore Shaman',
    faction: 'verdant_pact',
    type: 'creature',
    rarity: 'uncommon',
    art: {
      prompt: 'A woodland druid casting glowing emerald spores into the ancient forest canopy.',
      style_id: 'hearthglass_stylized_handpainted_v1'
    }
  }
];

test('P0 Remediated Art Pipeline: Complete 10-Point Verification Suite', async (t) => {
  const tempDir = path.join(ROOT, 'content', 'art', '__test_pipeline_temp__' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  const pipeline = new ArtProductionPipeline({
    rootDir: tempDir,
    cards: sampleCards
  });

  t.after(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Cleanup best effort
    }
  });

  await t.test('1. Candidate accepted and ingested', () => {
    const res = pipeline.ingestRasterCandidate({
      card_id: 'TEST-C-0001',
      buffer: REAL_PNG_BYTES,
      original_filename: 'master_aether_smith.png',
      provider_id: 'manual_upload',
      model_id: 'manual-artist-upload'
    });

    assert.ok(res.candidate, 'Candidate entry must be returned');
    assert.equal(res.candidate.file_type, 'png');
    assert.equal(res.candidate.art_tier, 'final_production_illustration');
    assert.equal(res.candidate.final_production_approved, false);
    assert.equal(res.candidate.approved, false);
    assert.equal(res.art_record.status, 'review_required');
  });

  await t.test('2. Original image bytes preserved verbatim without corruption or re-encoding', () => {
    const rec = pipeline.getCardArtRecord('TEST-C-0001');
    const cand = rec.candidates[0];
    const candFile = pipeline._findCandidateFile(cand);
    assert.ok(candFile && fs.existsSync(candFile), 'Candidate file must exist on disk');

    const diskBytes = fs.readFileSync(candFile);
    assert.ok(diskBytes.equals(REAL_PNG_BYTES), 'Candidate bytes must match original input bytes exactly');

    // Also check master copy
    const masterPath = path.join(tempDir, 'content', 'art', 'masters', 'TEST-C-0001', `${cand.candidate_id}.png`);
    assert.ok(fs.existsSync(masterPath), 'Master asset copy must exist in masters directory');
    const masterBytes = fs.readFileSync(masterPath);
    assert.ok(masterBytes.equals(REAL_PNG_BYTES), 'Master asset bytes must match original input bytes');
  });

  await t.test('3. Visual review required for final production approval', () => {
    const rec = pipeline.getCardArtRecord('TEST-C-0001');
    const candId = rec.candidates[0].candidate_id;

    // Missing visual review confirmation must fail
    assert.throws(
      () => {
        pipeline.approveCandidate('TEST-C-0001', candId, {
          approval_type: 'production',
          approved_by: 'lead_art_director',
          visual_review_passed: false, // FAILED
          visual_quality_confirmed: true
        });
      },
      /Visual review verification failed|visual_review_passed: true/,
      'Must reject if visual review not passed'
    );

    // Missing authenticated approver must fail
    assert.throws(
      () => {
        pipeline.approveCandidate('TEST-C-0001', candId, {
          approval_type: 'production',
          approved_by: '', // EMPTY
          visual_review_passed: true,
          visual_quality_confirmed: true
        });
      },
      /reviewer identity \(approved_by\) is required/,
      'Must reject if approved_by is missing'
    );
  });

  await t.test('4. Approval correctly recorded with complete metadata audit trail', () => {
    const rec = pipeline.getCardArtRecord('TEST-C-0001');
    const candId = rec.candidates[0].candidate_id;

    const approvalRes = pipeline.approveCandidate('TEST-C-0001', candId, {
      approval_type: 'production',
      approved_by: 'audited_lead_art_director_elena',
      visual_review_passed: true,
      visual_quality_confirmed: true,
      decision: 'approve',
      notes: 'Clean brushwork, excellent silhouette and lighting contrast'
    });

    const updated = approvalRes.art_record;
    assert.equal(updated.status, 'production_approved');
    assert.equal(updated.final_production_approved, true);
    assert.equal(updated.approved, true);
    assert.equal(updated.concept_approved, false, 'Raster production asset must not be concept_approved');

    const cand = updated.candidates.find((c) => c.id === candId || c.candidate_id === candId);
    assert.ok(cand.visual_review, 'Candidate must retain recorded visual_review');
    assert.equal(cand.visual_review.approved_by, 'audited_lead_art_director_elena');
    assert.equal(cand.visual_review.decision, 'approve');
    assert.ok(cand.visual_review.asset_hash, 'Audit trail must record SHA-256 asset hash');
  });

  await t.test('5. Game-ready asset exported to Godot and Web directories with correct extension', () => {
    const godotFileUpper = path.join(tempDir, 'apps', 'game-client', 'assets', 'cards', 'TEST-C-0001.png');
    const godotFileLower = path.join(tempDir, 'apps', 'game-client', 'assets', 'cards', 'test-c-0001.png');
    const webFileUpper = path.join(tempDir, 'apps', 'content-studio', 'public', 'assets', 'cards', 'TEST-C-0001.png');

    assert.ok(fs.existsSync(godotFileUpper), 'Godot upper file must exist');
    assert.ok(fs.existsSync(godotFileLower), 'Godot lowercase file must exist');
    assert.ok(fs.existsSync(webFileUpper), 'Web studio file must exist');

    assert.ok(fs.readFileSync(godotFileUpper).equals(REAL_PNG_BYTES), 'Exported file must match master bytes');
  });

  await t.test('6. Godot loads correct texture format (PNG/WebP detect signatures match)', () => {
    const pngInfo = detectImageFormat(REAL_PNG_BYTES, 'asset.png');
    assert.equal(pngInfo.ext, '.png');
    assert.equal(pngInfo.mime, 'image/png');
    assert.equal(pngInfo.isRaster, true);

    const webpInfo = detectImageFormat(REAL_WEBP_BYTES, 'asset.webp');
    assert.equal(webpInfo.ext, '.webp');
    assert.equal(webpInfo.mime, 'image/webp');
    assert.equal(webpInfo.isRaster, true);
  });

  await t.test('7. Concept assets are NOT counted as final artwork', () => {
    // Generate a vector concept for TEST-C-0002
    pipeline.enqueueGenerationJob({
      scope: 'single',
      card_ids: ['TEST-C-0002'],
      provider_id: 'studio_stylized_svg',
      variants: 1
    });

    // Approve as concept
    pipeline.approveCandidate('TEST-C-0002', null, { approval_type: 'concept' });

    const rec = pipeline.getCardArtRecord('TEST-C-0002');
    assert.equal(rec.concept_approved, true);
    assert.equal(rec.final_production_approved, false);
    assert.equal(rec.approved, false, 'Concept asset must NOT have approved=true');

    const report = pipeline.getStatusReport();
    assert.equal(report.counts.final_production_artwork_approved, 1, 'Only TEST-C-0001 must be final production artwork');
    assert.equal(report.counts.concept_illustrations_integrated, 1, 'TEST-C-0002 is counted only under concept_illustrations_integrated');
  });

  await t.test('8. Missing raster files cause an error instead of generating an SVG replacement', () => {
    const rec = pipeline.getCardArtRecord('TEST-C-0001');
    const cand = rec.candidates[0];
    const candFile = pipeline._findCandidateFile(cand);

    // Temporarily delete candidate file
    fs.unlinkSync(candFile);

    assert.throws(
      () => {
        pipeline.approveCandidate('TEST-C-0001', cand.candidate_id, {
          approval_type: 'production',
          approved_by: 'audited_lead_art_director_elena',
          visual_review_passed: true,
          visual_quality_confirmed: true,
          allow_overwrite: true
        });
      },
      /Missing candidate asset file on disk.*Silent fallback to SVG is forbidden/,
      'Must throw clear error and never generate SVG fallback'
    );

    // Restore candidate file for subsequent tests
    fs.writeFileSync(candFile, REAL_PNG_BYTES);
  });

  await t.test('9. Invalid file types are rejected', () => {
    const invalidTextBuffer = Buffer.from('NOT_AN_IMAGE_RANDOM_TEXT_CONTENT');
    assert.throws(
      () => {
        pipeline.ingestRasterCandidate({
          card_id: 'TEST-C-0001',
          buffer: invalidTextBuffer,
          original_filename: 'fake_image.png'
        });
      },
      /Unsupported or invalid raster image format/,
      'Must reject invalid image content'
    );
  });

  await t.test('10. Approved assets cannot be silently overwritten without explicit flag', () => {
    const rec = pipeline.getCardArtRecord('TEST-C-0001');
    const candId = rec.candidates[0].candidate_id;

    assert.throws(
      () => {
        pipeline.approveCandidate('TEST-C-0001', candId, {
          approval_type: 'production',
          approved_by: 'audited_lead_art_director_elena',
          visual_review_passed: true,
          visual_quality_confirmed: true,
          allow_overwrite: false // NO OVERWRITE
        });
      },
      /already exists for card TEST-C-0001.*Set allow_overwrite: true/,
      'Must protect approved production art from silent overwrite'
    );
  });

  await t.test('11. Real WebP candidate ingestion, preservation, and approval', () => {
    const res = pipeline.ingestRasterCandidate({
      card_id: 'TEST-C-0002',
      buffer: REAL_WEBP_BYTES,
      original_filename: 'spore_shaman_v1.webp',
      provider_id: 'manual_upload',
      model_id: 'flux-2-klein'
    });

    assert.equal(res.candidate.file_type, 'webp');
    assert.equal(res.candidate.mime_type, 'image/webp');

    const appRes = pipeline.approveCandidate('TEST-C-0002', res.candidate.candidate_id, {
      approval_type: 'production',
      approved_by: 'audited_lead_art_director_elena',
      visual_review_passed: true,
      visual_quality_confirmed: true,
      decision: 'approve'
    });

    assert.equal(appRes.art_record.final_production_approved, true);
    assert.equal(appRes.art_record.approved, true);

    const godotWebpFile = path.join(tempDir, 'apps', 'game-client', 'assets', 'cards', 'TEST-C-0002.webp');
    assert.ok(fs.existsSync(godotWebpFile), 'Godot WebP file must exist');
    assert.ok(fs.readFileSync(godotWebpFile).equals(REAL_WEBP_BYTES), 'WebP bytes preserved');
  });
});
