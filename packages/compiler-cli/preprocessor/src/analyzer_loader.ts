/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Resolves the Rust analysis engine and wraps it in an {@link IAnalyzer}.
 *
 * Two engines can back the compiler:
 *
 * - **native** — the N-API addon, delivered by the per-platform
 *   `ng-exp-compiler-arch-<triple>` packages and loaded through napi's generated
 *   dispatcher (which owns the musl/glibc detection we must not reimplement).
 * - **wasm** — the `wasm-bindgen` build in `ng-exp-compiler-arch-wasm`, which runs
 *   anywhere.
 *
 * IMPORTANT: nothing in this module may run at import time, and nothing on the
 * sidecar code path may import it *statically*. The compiler is also deployed to
 * environments where N-API is unavailable and the engine is an out-of-process
 * sidecar binary; a static edge from `api.ts` or `analyzer_sidecar.ts` to this file
 * would drag engine resolution into module evaluation and break those deployments.
 * Reach this module through `createAnalyzer()` in `api.ts` or a dynamic `import()`.
 */

import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import type {IAnalyzer} from './hybrid_compiler.js';
import type {WasmInner} from './analyzer_wasm.js';
import type {WasmHostFs} from './wasm_host_fs.js';
import type * as nga from './types.js';

/** Which engine backs the analyzer. */
export type AnalyzerBackend = 'native' | 'wasm';

export interface LoadAnalyzerOptions {
  optimize?: boolean;
  virtualFiles?: Record<string, string>;
  nodeModulesPathOverride?: string;
  workspaceName?: string;
  rootDirs?: string[];

  /**
   * Force a specific engine. When set, only that engine is attempted — a failure
   * throws rather than silently falling back, so parity runs stay honest.
   */
  backend?: AnalyzerBackend;

  /** Explicit path or bare specifier of a napi CJS binding. Highest priority. */
  nativeBinding?: string;
  /** Explicit path or bare specifier of a wasm-bindgen glue module. Highest priority. */
  wasmBinding?: string;

  /**
   * Filesystem bridge for the wasm engine, which has no OS of its own.
   *
   * Defaults to a Node-backed host reading the local disk. Pass your own to point the
   * engine at a different source (a bundler's module graph, a virtual workspace), or
   * `null` to restrict it to `virtualFiles` only. Ignored by the native engine.
   */
  hostFs?: WasmHostFs | null;

  /**
   * In-repo layout hint: a directory containing napi's `index.js`, whose sibling
   * `../ng-analyze-wasm/ng_analyze.js` holds the wasm build. Used by the monorepo
   * and by callers that predate package-based resolution.
   */
  ngAnalyzeDir?: string;

  /** @deprecated Pass `backend: 'wasm'` instead. */
  useWasm?: boolean;
}

export interface LoadedAnalyzer {
  analyzer: IAnalyzer;
  /** The engine that actually loaded — not merely the one requested. */
  backend: AnalyzerBackend;
  /** The specifier that resolved, for diagnostics. */
  resolvedFrom: string;
}

interface Candidate {
  backend: AnalyzerBackend;
  spec: string;
  /** Human-readable description of where this candidate came from. */
  origin: string;
}

type AnalyzerConstructor = new (options: nga.AnalyzerOptions) => nga.Analyzer;
type WasmInnerConstructor = new (optionsJson: string, hostFs?: WasmHostFs | null) => WasmInner;

const SELF_DIR = path.dirname(fileURLToPath(import.meta.url));
const requireFromHere = createRequire(import.meta.url);

/**
 * True when this file lives inside an installed dependency tree. Gates the
 * repo-layout probes below: an installed copy must never walk up into the
 * consumer's project and guess at an unrelated `ng-analyze/` directory.
 */
const IS_INSTALLED = SELF_DIR.split(path.sep).includes('node_modules');

const MAX_WALK_UP = 8;

function envFlag(name: string): boolean {
  const value = process.env[name];
  return value !== undefined && value !== '' && value !== '0' && value.toLowerCase() !== 'false';
}

function debugLog(message: string): void {
  if (envFlag('NG_EXP_DEBUG_LOADER')) {
    console.error(`[ng-exp-compiler loader] ${message}`);
  }
}

function pathExists(p: string) {
  return fs.access(p).then(
    () => true,
    () => false,
  );
}

/** Walks up from this module looking for `relative`, stopping at the filesystem root. */
async function walkUpFor(relative: string): Promise<string | null> {
  let dir = SELF_DIR;
  for (let i = 0; i < MAX_WALK_UP; i++) {
    const candidate = path.join(dir, relative);
    if (await pathExists(candidate)) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return null;
}

async function existingPath(candidate: string): Promise<string | null> {
  return (await pathExists(candidate)) ? candidate : null;
}

/** Resolves the requested backend, or `null` to mean "native, then fall back to wasm". */
function requestedBackend(options: LoadAnalyzerOptions): AnalyzerBackend | null {
  if (options.backend) {
    return options.backend;
  }
  if (options.useWasm) {
    return 'wasm';
  }
  const fromEnv = process.env['NG_EXP_COMPILER_BACKEND'];
  if (fromEnv === 'native' || fromEnv === 'wasm') {
    return fromEnv;
  }
  if (envFlag('NG_EXP_FORCE_WASM')) {
    return 'wasm';
  }
  return null;
}

async function nativeCandidates(options: LoadAnalyzerOptions): Promise<Candidate[]> {
  const out: Candidate[] = [];
  const push = (spec: string | null | undefined, origin: string) => {
    if (spec) {
      out.push({backend: 'native', spec, origin});
    }
  };

  const [ngAnalyzeDirIndex, bundledBinding, inRepoIndex] = await Promise.all([
    options.ngAnalyzeDir ? existingPath(path.join(options.ngAnalyzeDir, 'index.js')) : null,
    existingPath(path.resolve(SELF_DIR, '../../native/binding.cjs')),
    !IS_INSTALLED ? walkUpFor(path.join('ng-analyze', 'index.js')) : null,
  ]);

  push(options.nativeBinding, 'nativeBinding option');
  push(process.env['NG_EXP_COMPILER_NATIVE_BINDING'], 'NG_EXP_COMPILER_NATIVE_BINDING');
  push(ngAnalyzeDirIndex, 'ngAnalyzeDir option');
  push(bundledBinding, 'bundled napi binding');
  push(inRepoIndex, 'in-repo ng-analyze/');

  return out;
}

async function wasmCandidates(options: LoadAnalyzerOptions): Promise<Candidate[]> {
  const out: Candidate[] = [];
  const push = (spec: string | null | undefined, origin: string) => {
    if (spec) {
      out.push({backend: 'wasm', spec, origin});
    }
  };

  const [ngAnalyzeWasmDirIndex, inRepoWasm] = await Promise.all([
    options.ngAnalyzeDir
      ? existingPath(path.join(options.ngAnalyzeDir, '..', 'ng-analyze-wasm', 'ng_analyze.js'))
      : null,
    !IS_INSTALLED ? walkUpFor(path.join('ng-analyze-wasm', 'ng_analyze.js')) : null,
  ]);

  push(options.wasmBinding, 'wasmBinding option');
  push(process.env['NG_EXP_COMPILER_WASM_BINDING'], 'NG_EXP_COMPILER_WASM_BINDING');
  push(ngAnalyzeWasmDirIndex, 'ngAnalyzeDir option');
  push('ng-exp-compiler-arch-wasm', 'ng-exp-compiler-arch-wasm package');
  push(inRepoWasm, 'in-repo ng-analyze-wasm/');

  return out;
}

function describeExports(mod: unknown): string {
  if (mod === null || mod === undefined) {
    return 'module resolved to null/undefined';
  }
  const keys = Object.keys(mod as object);
  return keys.length > 0 ? `exports: ${keys.join(', ')}` : 'module has no exports';
}

async function constructNative(
  spec: string,
  tsconfigPath: string,
  options: LoadAnalyzerOptions,
): Promise<IAnalyzer> {
  const mod = requireFromHere(spec);
  const Analyzer = mod?.Analyzer as AnalyzerConstructor | undefined;
  if (typeof Analyzer !== 'function') {
    throw new Error(
      `'${spec}' does not export an 'Analyzer' constructor (${describeExports(mod)})`,
    );
  }
  const {NapiAnalyzer} = await import('./analyzer_napi.js');
  return new NapiAnalyzer(
    new Analyzer({
      tsconfigPath,
      optimize: options.optimize ?? true,
      virtualFiles: options.virtualFiles,
      nodeModulesPathOverride: options.nodeModulesPathOverride,
      workspaceName: options.workspaceName,
      rootDirs: options.rootDirs,
    }),
  );
}

async function constructWasm(
  spec: string,
  tsconfigPath: string,
  options: LoadAnalyzerOptions,
): Promise<IAnalyzer> {
  const mod = requireFromHere(spec);
  const Inner = mod?.WasmAnalyzer as WasmInnerConstructor | undefined;
  if (typeof Inner !== 'function') {
    // Guards against pointing this at napi's WASI build, which exposes the napi
    // surface (Analyzer/TestAnalyzer) rather than the wasm-bindgen WasmAnalyzer.
    throw new Error(
      `'${spec}' does not export a 'WasmAnalyzer' constructor (${describeExports(mod)})`,
    );
  }
  const {WasmAnalyzer} = await import('./analyzer_wasm.js');

  // The engine has no OS beneath it, so without this bridge it can only see
  // `virtualFiles` and cannot analyze a project on disk. Callers can substitute their
  // own host (a bundler's module graph, say) or pass null to keep it in-memory only.
  let hostFs = options.hostFs;
  if (hostFs === undefined) {
    const {createNodeHostFs} = await import('./wasm_host_fs.js');
    hostFs = createNodeHostFs();
  }

  const inner = new Inner(
    JSON.stringify({
      virtualFiles: options.virtualFiles,
      optimize: options.optimize ?? true,
      tsconfigPath,
      nodeModulesPathOverride: options.nodeModulesPathOverride,
      workspaceName: options.workspaceName,
      rootDirs: options.rootDirs,
    }),
    hostFs,
  );
  return new WasmAnalyzer(inner);
}

function hostDescription(): string {
  const parts = [`${process.platform}/${process.arch}`, `node ${process.version}`];
  return parts.join(', ');
}

function noAnalyzerError(
  attempts: {candidate: Candidate; error: unknown}[],
  strict: boolean,
): Error {
  const lines = attempts.map(({candidate, error}, i) => {
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return `  ${i + 1}. ${candidate.backend.padEnd(6)} ${candidate.spec}\n       via ${candidate.origin}\n       ${reason}`;
  });

  const detail =
    attempts.length > 0
      ? `Tried, in order:\n${lines.join('\n')}`
      : 'No candidate engines were available to try.';

  const remedy = strict
    ? 'A specific backend was requested, so no fallback was attempted. Unset ' +
      'NG_EXP_COMPILER_BACKEND / NG_EXP_FORCE_WASM (or drop the `backend` option) to allow fallback.'
    : [
        'The engines ship as optionalDependencies. Package managers skip optional',
        'dependencies when installed with --omit=optional / --no-optional, or when a',
        'lockfile was generated on a different platform (npm/cli#4828).',
        '',
        'Fix:  npm install --save-optional ng-exp-compiler-arch-wasm',
        ' or:  rm -rf node_modules package-lock.json && npm install',
      ].join('\n');

  const error = new Error(
    `Could not load the ng-exp-compiler analysis engine.\n\n` +
      `Host: ${hostDescription()}\n${detail}\n\n${remedy}\n\n` +
      `Set NG_EXP_DEBUG_LOADER=1 for the full resolution trace.`,
  );
  (error as NodeJS.ErrnoException).code = 'ERR_NG_EXP_NO_ANALYZER';
  if (attempts.length > 0) {
    (error as Error & {cause?: unknown}).cause = new AggregateError(
      attempts.map((a) => a.error),
      'All analyzer engine candidates failed',
    );
  }
  return error;
}

/**
 * Loads the analysis engine and reports which one was used.
 *
 * Selection order: `backend` option, the deprecated `useWasm` option,
 * `NG_EXP_COMPILER_BACKEND`, `NG_EXP_FORCE_WASM`, then the default (native, falling
 * back to wasm). An explicit choice is strict and never falls back.
 */
export async function loadAnalyzerWithInfo(
  tsconfigPath: string,
  options: LoadAnalyzerOptions = {},
): Promise<LoadedAnalyzer> {
  const requested = requestedBackend(options);
  const candidates =
    requested === 'wasm'
      ? await wasmCandidates(options)
      : requested === 'native'
        ? await nativeCandidates(options)
        : [...(await nativeCandidates(options)), ...(await wasmCandidates(options))];

  debugLog(
    `backend=${requested ?? 'auto'} installed=${IS_INSTALLED} candidates=${candidates.length}`,
  );

  const attempts: {candidate: Candidate; error: unknown}[] = [];
  for (const candidate of candidates) {
    try {
      debugLog(`trying ${candidate.backend}: ${candidate.spec} (${candidate.origin})`);
      const analyzer =
        candidate.backend === 'native'
          ? await constructNative(candidate.spec, tsconfigPath, options)
          : await constructWasm(candidate.spec, tsconfigPath, options);
      debugLog(`loaded ${candidate.backend} from ${candidate.spec}`);
      return {analyzer, backend: candidate.backend, resolvedFrom: candidate.spec};
    } catch (error) {
      debugLog(`failed ${candidate.spec}: ${error instanceof Error ? error.message : error}`);
      attempts.push({candidate, error});
    }
  }

  throw noAnalyzerError(attempts, requested !== null);
}

/** Loads the analysis engine. See {@link loadAnalyzerWithInfo} for selection rules. */
export async function loadAnalyzer(
  tsconfigPath: string,
  options: LoadAnalyzerOptions = {},
): Promise<IAnalyzer> {
  const {analyzer} = await loadAnalyzerWithInfo(tsconfigPath, options);
  return analyzer;
}
