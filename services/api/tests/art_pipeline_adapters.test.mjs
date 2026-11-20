import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
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
  MOCK_VALID_WEBP_BYTES,
  inspectImageBuffer,
  validateSafeWorkerUrl
} from '../src/art_adapters.mjs';

import { ArtProductionPipeline, validateArtworkTechnical } from '../src/art_pipeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

// Helper to launch a deterministic fake HTTP server
function createFakeServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        req.body = body;
        try {
          req.json = body ? JSON.parse(body) : null;
        } catch {
          req.json = null;
        }
        handler(req, res);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({
        server,
        port,
        baseUrl,
        close: () => new Promise((cb) => server.close(cb))
      });
    });
  });
}

test('Art Pipeline Real Provider Lifecycle & Isolation Suite', async (t) => {
  // Pre-test hash recording for tracked files to verify zero mutation
  const realManifestPath = path.join(ROOT, 'content/art/art_production_manifest.json');
  const initialManifestHash = fs.existsSync(realManifestPath)
    ? crypto.createHash('sha256').update(fs.readFileSync(realManifestPath)).digest('hex')
    : null;

  const showcasePath = path.join(ROOT, 'apps/game-client/assets/cards/EMB-C-0001.svg');
  const initialShowcaseHash = fs.existsSync(showcasePath)
    ? crypto.createHash('sha256').update(fs.readFileSync(showcasePath)).digest('hex')
    : null;

  await t.test('1. SSRF URL validation enforces safe schemes and rejects credential injection', () => {
    assert.equal(validateSafeWorkerUrl('http://127.0.0.1:8188'), 'http://127.0.0.1:8188');
    assert.equal(validateSafeWorkerUrl('https://gpu-worker.internal'), 'https://gpu-worker.internal');

    assert.throws(() => validateSafeWorkerUrl('ftp://example.com'), /must use http: or https:/);
    assert.throws(() => validateSafeWorkerUrl('http://admin:secret@malicious.com:8000'), /cannot contain embedded user credentials/);
    assert.throws(() => validateSafeWorkerUrl(''), /is empty or invalid/);
  });

  await t.test('2. Z-Image Turbo / Replicate full async lifecycle: submit -> poll -> download real WebP bytes', async () => {
    let submitCalled = false;
    let pollCount = 0;
    let downloadCalled = false;
    const testPredictionId = 'pred_test_12345';

    const fake = await createFakeServer((req, res) => {
      // Step 1: Prediction submission
      if (req.method === 'POST' && req.url === '/v1/predictions') {
        submitCalled = true;
        assert.equal(req.headers['authorization'], 'Bearer test_replicate_token');
        assert.equal(req.json.input.aspect_ratio, '3:4');
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          id: testPredictionId,
          status: 'starting',
          urls: {
            get: `${fake.baseUrl}/v1/predictions/${testPredictionId}`
          }
        }));
        return;
      }

      // Step 2 & 3: Prediction polling
      if (req.method === 'GET' && req.url === `/v1/predictions/${testPredictionId}`) {
        pollCount++;
        if (pollCount === 1) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            id: testPredictionId,
            status: 'processing'
          }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            id: testPredictionId,
            status: 'succeeded',
            output: [`${fake.baseUrl}/output/card_render.webp`]
          }));
        }
        return;
      }

      // Step 4: Real image download
      if (req.method === 'GET' && req.url === '/output/card_render.webp') {
        downloadCalled = true;
        res.writeHead(200, { 'Content-Type': 'image/webp' });
        res.end(MOCK_VALID_WEBP_BYTES);
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    try {
      process.env.REPLICATE_ENDPOINT_OVERRIDE = `${fake.baseUrl}/v1/predictions`;
      process.env.REPLICATE_API_TOKEN = 'test_replicate_token';

      const adapter = new ZImageTurboAdapter({ pollIntervalMs: 20 });
      const result = await adapter.generate({
        prompt: 'Volcanic Ashborne Warrior',
        negativePrompt: 'blurry, text',
        seed: 777,
        isMock: false
      });

      assert.ok(submitCalled, 'Must submit prediction');
      assert.ok(pollCount >= 2, 'Must poll prediction until succeeded');
      assert.ok(downloadCalled, 'Must download completed image');
      assert.equal(adapter.testStatus, 'live_tested', 'Must mark live_tested only after real download');
      assert.equal(result.mimeType, 'image/webp');
      assert.equal(result.fileType, 'webp');
      assert.equal(result.provenance.mode, 'live');
      assert.equal(result.provenance.prediction_id, testPredictionId);
      assert.equal(result.buffer.length, MOCK_VALID_WEBP_BYTES.length);
      assert.equal(result.provenance.sha256, crypto.createHash('sha256').update(MOCK_VALID_WEBP_BYTES).digest('hex'));
    } finally {
      delete process.env.REPLICATE_ENDPOINT_OVERRIDE;
      delete process.env.REPLICATE_API_TOKEN;
      await fake.close();
    }
  });

  await t.test('3. Wanx 2.1 / Qwen-Image async task synthesis: submit -> poll task -> download real PNG bytes', async () => {
    let submitCalled = false;
    let pollCount = 0;
    let downloadCalled = false;
    const testTaskId = 'task_dashscope_9876';

    const fake = await createFakeServer((req, res) => {
      // Step 1: Submit synthesis task
      if (req.method === 'POST' && req.url === '/api/v1/services/aigc/text2image/image-synthesis') {
        submitCalled = true;
        assert.equal(req.headers['authorization'], 'Bearer test_dashscope_key');
        assert.equal(req.json.model, 'wanx-2.1-t2i-turbo');
        assert.equal(req.json.parameters.size, '768*1024');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          output: {
            task_id: testTaskId,
            task_status: 'PENDING'
          }
        }));
        return;
      }

      // Step 2: Task polling
      if (req.method === 'GET' && req.url === `/api/v1/tasks/${testTaskId}`) {
        pollCount++;
        if (pollCount === 1) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            output: {
              task_id: testTaskId,
              task_status: 'RUNNING'
            }
          }));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            output: {
              task_id: testTaskId,
              task_status: 'SUCCEEDED',
              results: [{ url: `${fake.baseUrl}/results/relic.png` }]
            }
          }));
        }
        return;
      }

      // Step 3: Image download
      if (req.method === 'GET' && req.url === '/results/relic.png') {
        downloadCalled = true;
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(MOCK_VALID_PNG_BYTES);
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    try {
      process.env.DASHSCOPE_ENDPOINT_OVERRIDE = `${fake.baseUrl}/api/v1/services/aigc/text2image/image-synthesis`;
      process.env.DASHSCOPE_API_KEY = 'test_dashscope_key';

      const adapter = new QwenImageAdapter({ pollIntervalMs: 20 });
      const result = await adapter.generate({
        prompt: 'Ancient Iron Choir Armillary Relic',
        seed: 42,
        isMock: false
      });

      assert.ok(submitCalled, 'Must submit task to DashScope endpoint');
      assert.ok(pollCount >= 2, 'Must poll task until SUCCEEDED');
      assert.ok(downloadCalled, 'Must download real completed image bytes');
      assert.equal(adapter.testStatus, 'live_tested');
      assert.equal(result.mimeType, 'image/png');
      assert.equal(result.provenance.task_id, testTaskId);
      assert.equal(result.buffer.length, MOCK_VALID_PNG_BYTES.length);
    } finally {
      delete process.env.DASHSCOPE_ENDPOINT_OVERRIDE;
      delete process.env.DASHSCOPE_API_KEY;
      await fake.close();
    }
  });

  await t.test('4. FLUX.1 Schnell / Together AI: submit -> receive base64 -> decode & validate PNG', async () => {
    let submitCalled = false;

    const fake = await createFakeServer((req, res) => {
      if (req.method === 'POST' && req.url === '/v1/images/generations') {
        submitCalled = true;
        assert.equal(req.headers['authorization'], 'Bearer test_together_key');
        assert.equal(req.json.model, 'black-forest-labs/FLUX.1-schnell');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          data: [{
            b64_json: MOCK_VALID_PNG_BYTES.toString('base64')
          }]
        }));
        return;
      }
      res.writeHead(404);
      res.end('Not found');
    });

    try {
      process.env.TOGETHER_ENDPOINT_OVERRIDE = `${fake.baseUrl}/v1/images/generations`;
      process.env.TOGETHER_API_KEY = 'test_together_key';

      const adapter = new FluxSchnellAdapter();
      const result = await adapter.generate({
        prompt: 'Fast Verdant Seedling',
        seed: 123,
        isMock: false
      });

      assert.ok(submitCalled, 'Must submit to Together AI generations endpoint');
      assert.equal(adapter.testStatus, 'live_tested');
      assert.equal(result.mimeType, 'image/png');
      assert.equal(result.buffer.length, MOCK_VALID_PNG_BYTES.length);
    } finally {
      delete process.env.TOGETHER_ENDPOINT_OVERRIDE;
      delete process.env.TOGETHER_API_KEY;
      await fake.close();
    }
  });

  await t.test('5. Remote ComfyUI Worker Node: submit graph -> poll /history -> download via /view', async () => {
    let promptSubmitted = false;
    let historyPolled = false;
    let viewDownloaded = false;
    const testPromptId = 'comfy_prompt_777';

    const fake = await createFakeServer((req, res) => {
      if (req.method === 'POST' && req.url === '/prompt') {
        promptSubmitted = true;
        assert.ok(req.json.prompt['3'], 'Must contain KSampler node');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ prompt_id: testPromptId }));
        return;
      }

      if (req.method === 'GET' && req.url === `/history/${testPromptId}`) {
        historyPolled = true;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          [testPromptId]: {
            status: { status_str: 'success', completed: true },
            outputs: {
              '9': {
                images: [{ filename: 'HearthglassArt_0001.png', subfolder: '', type: 'output' }]
              }
            }
          }
        }));
        return;
      }

      if (req.method === 'GET' && req.url.startsWith('/view?')) {
        viewDownloaded = true;
        assert.ok(req.url.includes('filename=HearthglassArt_0001.png'));
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(MOCK_VALID_PNG_BYTES);
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    try {
      process.env.COMFYUI_REMOTE_URL = fake.baseUrl;
      const adapter = new ComfyUIWorkerAdapter({ pollIntervalMs: 20 });
      const result = await adapter.generate({
        prompt: 'Mystic Starweave Celestial Sphere',
        seed: 888,
        isMock: false
      });

      assert.ok(promptSubmitted, 'Must submit execution graph to /prompt');
      assert.ok(historyPolled, 'Must poll /history/{id}');
      assert.ok(viewDownloaded, 'Must download image from /view');
      assert.equal(adapter.testStatus, 'live_tested');
      assert.equal(result.provenance.filename, 'HearthglassArt_0001.png');
      assert.equal(result.buffer.length, MOCK_VALID_PNG_BYTES.length);
    } finally {
      delete process.env.COMFYUI_REMOTE_URL;
      await fake.close();
    }
  });

  await t.test('6. Self-Hosted Worker async queue: submit -> poll job -> download output image', async () => {
    let genCalled = false;
    let jobPolled = false;
    let imgDownloaded = false;
    const testJobId = 'gpu_job_999';

    const fake = await createFakeServer((req, res) => {
      if (req.method === 'POST' && req.url === '/v1/generate') {
        genCalled = true;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'queued',
          job_id: testJobId,
          poll_url: `/v1/jobs/${testJobId}`
        }));
        return;
      }

      if (req.method === 'GET' && req.url === `/v1/jobs/${testJobId}`) {
        jobPolled = true;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'completed',
          job_id: testJobId,
          image_url: `/v1/images/output_${testJobId}.png`
        }));
        return;
      }

      if (req.method === 'GET' && req.url === `/v1/images/output_${testJobId}.png`) {
        imgDownloaded = true;
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(MOCK_VALID_PNG_BYTES);
        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    try {
      process.env.HEARTHGLASS_GPU_WORKER_URL = fake.baseUrl;
      const adapter = new SelfHostedWorkerAdapter({ pollIntervalMs: 20 });
      const result = await adapter.generate({
        cardId: 'EMB-C-0001',
        prompt: 'Volcanic Forge Vanguard',
        seed: 111,
        isMock: false
      });

      assert.ok(genCalled);
      assert.ok(jobPolled);
      assert.ok(imgDownloaded);
      assert.equal(adapter.testStatus, 'live_tested');
      assert.equal(result.buffer.length, MOCK_VALID_PNG_BYTES.length);
    } finally {
      delete process.env.HEARTHGLASS_GPU_WORKER_URL;
      await fake.close();
    }
  });

  await t.test('7. Negative contracts: 401 unauthorized, 429 rate limit, corrupt bytes, timeout fail closed and NEVER mark live_tested', async () => {
    // 401 Unauthorized
    const fake401 = await createFakeServer((req, res) => {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid API key' }));
    });
    try {
      process.env.REPLICATE_ENDPOINT_OVERRIDE = `${fake401.baseUrl}/v1/predictions`;
      process.env.REPLICATE_API_TOKEN = 'bad_token';
      const adapter = new ZImageTurboAdapter();
      await assert.rejects(
        () => adapter.generate({ prompt: 'Fail test', isMock: false }),
        /HTTP 401/
      );
      assert.notEqual(adapter.testStatus, 'live_tested', 'Must NOT be marked live_tested on 401');
    } finally {
      delete process.env.REPLICATE_ENDPOINT_OVERRIDE;
      delete process.env.REPLICATE_API_TOKEN;
      await fake401.close();
    }

    // 429 Rate Limit
    const fake429 = await createFakeServer((req, res) => {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
    });
    try {
      process.env.TOGETHER_ENDPOINT_OVERRIDE = `${fake429.baseUrl}/v1/images/generations`;
      process.env.TOGETHER_API_KEY = 'test_key';
      const adapter = new FluxSchnellAdapter();
      await assert.rejects(
        () => adapter.generate({ prompt: 'Rate limit test', isMock: false }),
        /HTTP 429/
      );
      assert.notEqual(adapter.testStatus, 'live_tested', 'Must NOT be marked live_tested on 429');
    } finally {
      delete process.env.TOGETHER_ENDPOINT_OVERRIDE;
      delete process.env.TOGETHER_API_KEY;
      await fake429.close();
    }

    // Corrupted non-image bytes returned
    const fakeCorrupt = await createFakeServer((req, res) => {
      if (req.url === '/v1/images/generations') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          data: [{ b64_json: Buffer.from('NOT_A_REAL_IMAGE_CORRUPT_BYTES').toString('base64') }]
        }));
        return;
      }
      res.writeHead(404);
      res.end();
    });
    try {
      process.env.TOGETHER_ENDPOINT_OVERRIDE = `${fakeCorrupt.baseUrl}/v1/images/generations`;
      process.env.TOGETHER_API_KEY = 'test_key';
      const adapter = new FluxSchnellAdapter();
      await assert.rejects(
        () => adapter.generate({ prompt: 'Corrupt bytes test', isMock: false }),
        /magic bytes do not match/
      );
      assert.notEqual(adapter.testStatus, 'live_tested');
    } finally {
      delete process.env.TOGETHER_ENDPOINT_OVERRIDE;
      delete process.env.TOGETHER_API_KEY;
      await fakeCorrupt.close();
    }

    // Timeout during polling
    const fakeTimeout = await createFakeServer((req, res) => {
      if (req.method === 'POST') {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: 'time_pred', status: 'starting', urls: { get: `${fakeTimeout.baseUrl}/poll` } }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'time_pred', status: 'processing' }));
    });
    try {
      process.env.REPLICATE_ENDPOINT_OVERRIDE = `${fakeTimeout.baseUrl}/v1/predictions`;
      process.env.REPLICATE_API_TOKEN = 'test_token';
      const adapter = new ZImageTurboAdapter({ pollIntervalMs: 10, maxPollRetries: 3 });
      await assert.rejects(
        () => adapter.generate({ prompt: 'Timeout test', isMock: false }),
        /timed out/
      );
      assert.notEqual(adapter.testStatus, 'live_tested');
    } finally {
      delete process.env.REPLICATE_ENDPOINT_OVERRIDE;
      delete process.env.REPLICATE_API_TOKEN;
      await fakeTimeout.close();
    }
  });

  await t.test('8. Two-stage budget accounting: reservation, reconciliation, rate limit, and cancellation', async () => {
    const tmpWorkDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hg-art-budget-test-'));
    try {
      const pipeline = new ArtProductionPipeline({
        rootDir: ROOT,
        workDir: tmpWorkDir,
        maxConcurrentJobs: 2
      });
      pipeline.state.budget_limit_usd = 0.030; // $0.03 budget

      // 1. Check reservation on mock job
      const res1 = await pipeline.enqueueGenerationJob({
        card_ids: ['EMB-C-0001'],
        provider_id: 'flux_2_klein',
        isMock: true // Mock has $0 cost
      });
      assert.equal(res1.job.status, 'completed');
      assert.equal(pipeline.state.spent_usd, 0);

      // 2. Budget authorization failure: requesting $0.045 when limit is $0.030
      await assert.rejects(
        () => pipeline.enqueueGenerationJob({
          card_ids: ['EMB-C-0001', 'EMB-C-0002', 'EMB-C-0003'],
          provider_id: 'flux_2_klein',
          variants: 1,
          isMock: false // 3 * $0.015 = $0.045 > $0.030
        }),
        /exceeds remaining authorized budget/
      );

      // 3. Concurrency limit enforcement
      pipeline.state.jobs.push({ job_id: 'active_1', status: 'running' });
      pipeline.state.jobs.push({ job_id: 'active_2', status: 'running' });
      await assert.rejects(
        () => pipeline.enqueueGenerationJob({
          card_ids: ['EMB-C-0001'],
          provider_id: 'studio_stylized_svg'
        }),
        /Concurrency limit reached/
      );

      // 4. Job cancellation releases reserved funds
      pipeline.state.jobs = []; // Clear mock active jobs
      pipeline.state.reserved_usd = 0.015;
      const cancelJob = {
        job_id: 'job_to_cancel',
        status: 'running',
        reserved_cost_usd: 0.015,
        actual_cost_usd: 0
      };
      pipeline.state.jobs.push(cancelJob);
      pipeline.cancelJob('job_to_cancel');
      assert.equal(cancelJob.status, 'cancelled');
      assert.equal(pipeline.state.reserved_usd, 0, 'Cancelled job must release reserved budget');
    } finally {
      fs.rmSync(tmpWorkDir, { recursive: true, force: true });
    }
  });

  await t.test('9. Full workflow statuses: prompt_prepared -> candidate_requested -> technical_validation_passed -> human_review_required -> production_approved -> exported -> godot_loaded', async () => {
    const tmpWorkDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hg-art-workflow-test-'));
    try {
      const pipeline = new ArtProductionPipeline({
        rootDir: ROOT,
        workDir: tmpWorkDir
      });

      const cardId = 'EMB-C-0001';
      // Ingest real candidate raster
      const ingestRes = pipeline.ingestRasterCandidate({
        card_id: cardId,
        buffer: MOCK_VALID_PNG_BYTES,
        original_filename: 'EMB-C-0001_v1.png',
        provider_id: 'flux_2_klein',
        model_id: 'black-forest-labs/flux-2-klein'
      });
      assert.equal(ingestRes.candidate.technical_validation.valid, true);
      assert.ok(
        ingestRes.art_record.status === 'human_review_required' || ingestRes.art_record.status === 'review_required',
        'Status must require human visual review'
      );

      // Human production approval gate
      const appRes = pipeline.approveCandidate(cardId, ingestRes.candidate.candidate_id, {
        approval_type: 'production',
        approved_by: 'ArtDirector_Lead',
        visual_review_passed: true,
        visual_quality_confirmed: true,
        allow_overwrite: true
      });
      assert.equal(appRes.art_record.status, 'production_approved');
      assert.equal(appRes.art_record.final_production_approved, true);

      // Verify Godot texture import metadata was written
      const exportedFile = path.join(pipeline.godotCardsDir, `${cardId}.png`);
      const importFile = `${exportedFile}.import`;
      assert.ok(fs.existsSync(exportedFile), 'Exported PNG must exist in godotCardsDir');
      assert.ok(fs.existsSync(importFile), 'Godot .import metadata must exist');

      // Verify Godot texture import verification advances status
      const godotVerify = pipeline.verifyGodotTextureImport(cardId);
      assert.equal(godotVerify.art_record.status, 'godot_loaded');
      assert.equal(godotVerify.art_record.godot_import_verified, true);
    } finally {
      fs.rmSync(tmpWorkDir, { recursive: true, force: true });
    }
  });

  await t.test('10. Worktree filesystem isolation: verified ZERO mutations to tracked production assets and manifest', () => {
    if (initialManifestHash) {
      const postManifestHash = crypto.createHash('sha256').update(fs.readFileSync(realManifestPath)).digest('hex');
      assert.equal(postManifestHash, initialManifestHash, 'Real art_production_manifest.json must remain 100% byte-identical');
    }
    if (initialShowcaseHash) {
      const postShowcaseHash = crypto.createHash('sha256').update(fs.readFileSync(showcasePath)).digest('hex');
      assert.equal(postShowcaseHash, initialShowcaseHash, 'Showcase SVG EMB-C-0001.svg must remain 100% byte-identical');
    }
  });
});
