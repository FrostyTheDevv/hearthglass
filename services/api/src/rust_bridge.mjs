import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

function resolveBinaryPath() {
  const candidates = [
    path.join(ROOT, 'target', 'debug', 'hearthglass-battle-server.exe'),
    path.join(ROOT, 'target', 'debug', 'hearthglass-battle-server'),
    path.join(ROOT, 'target', 'release', 'hearthglass-battle-server.exe'),
    path.join(ROOT, 'target', 'release', 'hearthglass-battle-server')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(
    `Compiled Rust battle-server binary not found. Run 'cargo build' in ${ROOT} first.`
  );
}

/**
 * Persistent JSON-RPC stdio bridge to the authoritative Rust battle engine (`services/battle-server`).
 * Ensures 100% of deck validation, match initialization (1v1 & 2v2 Tag), command execution,
 * AI decision-making, and hidden-state redaction execute through the compiled Rust rules engine.
 */
export class RustBattleEngineBridge {
  constructor() {
    this.binaryPath = resolveBinaryPath();
    this.proc = null;
    this.rl = null;
    this.nextId = 1;
    this.pending = new Map();
    this._ensureProcess();
  }

  _ensureProcess() {
    if (this.proc && !this.proc.killed) {
      return;
    }
    this.proc = spawn(this.binaryPath, ['--rpc-stdio'], {
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'inherit']
    });
    this.rl = readline.createInterface({ input: this.proc.stdout });
    this.rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        const msg = JSON.parse(line);
        const reqId = msg.req_id;
        if (reqId && this.pending.has(reqId)) {
          const { resolve, reject } = this.pending.get(reqId);
          this.pending.delete(reqId);
          if (msg.ok) {
            resolve(msg.data);
          } else {
            reject(new Error(msg.error || 'Rust battle engine error'));
          }
        }
      } catch (err) {
        console.error('[RustBattleEngineBridge] Failed to parse RPC response:', err);
      }
    });
    this.proc.on('exit', () => {
      for (const [, { reject }] of this.pending) {
        reject(new Error('Rust battle-server process exited unexpectedly'));
      }
      this.pending.clear();
      this.proc = null;
    });
  }

  call(op, payload = {}) {
    this._ensureProcess();
    const req_id = `rpc_${this.nextId++}`;
    const line = JSON.stringify({ op, req_id, ...payload }) + '\n';
    return new Promise((resolve, reject) => {
      this.pending.set(req_id, { resolve, reject });
      this.proc.stdin.write(line, 'utf8');
    });
  }

  async validateDeck(deck) {
    return this.call('validate_deck', { deck });
  }

  async createMatch1v1(deckA, deckB, seed = Date.now()) {
    return this.call('create_match1v1', {
      deck_a: deckA,
      deck_b: deckB,
      seed: Number(seed) >>> 0
    });
  }

  async createMatch2v2(decks, seed = Date.now()) {
    return this.call('create_match2v2', {
      decks,
      seed: Number(seed) >>> 0
    });
  }

  async applyCommand(state, command) {
    return this.call('apply_command', { state, command });
  }

  async chooseAiCommand(state, difficulty = 'skilled') {
    return this.call('choose_ai_command', { state, difficulty });
  }

  async runAiTurns(state, aiPlayers = [1], difficulty = 'skilled') {
    return this.call('run_ai_turns', {
      state,
      ai_players: aiPlayers,
      difficulty
    });
  }

  async redactState(state, viewer = null) {
    return this.call('redact_state', {
      state,
      viewer
    });
  }

  async getLegalCommands(state) {
    return this.call('legal_commands', { state });
  }

  close() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    if (this.proc && !this.proc.killed) {
      this.proc.kill();
      this.proc = null;
    }
  }
}
