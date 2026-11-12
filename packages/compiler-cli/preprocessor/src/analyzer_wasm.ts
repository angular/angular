/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type * as nga from './types.js';
import type {NgpCompilerOptions} from './compiler_options.js';
import type {IAnalyzer} from './hybrid_compiler.js';

export type ModuleFormat = 'ts' | 'tsx' | 'dts' | 'js' | 'jsx';
export type {IdKind, ModuleRef} from './types.js';

export interface HostItemError {
  error: string;
}

export interface ResolveRequest {
  importer: string;
  specifier: string;
  /** Syntax form: `'type-import'` is specifically `TSImportType` (`import('...')` in a type). */
  kind: 'import' | 're-export' | 'dynamic-import' | 'type-import';
  /** True for `import type`, `export type`, and `'type-import'`. */
  typeOnly: boolean;
  attributes?: Record<string, string>;
}

export interface ResolveResult {
  id: string;
  /** Required: the adapter knows its ID scheme; the core never guesses. */
  idKind: nga.IdKind;
  /** Optional here if provided on `LoadResult`; required on at least one of the two for modules. */
  format?: ModuleFormat;
  external?: boolean;
  /** Optional inline content: saves the follow-up `load` round trip when the adapter already has it. */
  code?: string;
}

export interface ResourceRequest {
  containingFile: string;
  url: string;
  kind: 'template' | 'style';
}

export interface ResourceResolveResult {
  id: string;
  /** Defaults to `'path'` when omitted. */
  idKind?: nga.IdKind;
  /** Optional inline content (e.g. compiled Sass/CSS or HTML): skips the follow-up `load` wave. */
  code?: string;
}

/** `external` echoes `ResolveResult.external` so the adapter can route external loads directly. */
export interface LoadRequest {
  id: string;
  kind: 'module' | 'template' | 'style';
  external: boolean;
}

export interface LoadResult {
  code: string;
  /** Required for `'module'` loads unless `ResolveResult.format` was already supplied. */
  format?: ModuleFormat;
}

export interface AnalyzerHost {
  /** Batch-resolve. Index-aligned results; `null` = unresolvable, `{error}` = failed with diagnostic. */
  resolve(
    requests: readonly ResolveRequest[],
  ): Promise<ReadonlyArray<ResolveResult | HostItemError | null>>;
  /** Required. The bundler is the authority for content; there is no disk fallback. */
  load(requests: readonly LoadRequest[]): Promise<ReadonlyArray<LoadResult | HostItemError | null>>;
  /**
   * Optional: defaults to normalizing bare relative URLs (`./`) and resolving relative to
   * `containingFile` via `resolve`.
   */
  resolveResource?(
    requests: readonly ResourceRequest[],
  ): Promise<ReadonlyArray<ResourceResolveResult | HostItemError | null>>;
}

/** The wasm-bindgen `WasmAnalyzer` surface this adapter drives. */
export interface WasmInner {
  free(): void;
  pump(): string | undefined;
  analyze(): number;
  analyze_optimized?(): number;
  analyzeOptimized?(): number;
  analyze_delta?(): number;
  analyzeDelta?(): number;
  analyze_optimized_delta?(): number;
  analyzeOptimizedDelta?(): number;
  updateFileContent?(updatesJson: string): string;
  update_file_content?(updatesJson: string): string;
  invalidateFiles?(updatesJson: string): string;
  invalidate_files?(updatesJson: string): string;
  setEntryPoints?(entryPointsJson: string): string;
  set_entry_points?(entryPointsJson: string): string;
  clearResolutionCache?(): string;
  clear_resolution_cache?(): string;
  provideHostResults?(batchId: number, resultsJson: string): void;
  provide_host_results?(batchId: number, resultsJson: string): void;
  requestMetadata?(moduleRefJson: string): number;
  request_metadata?(moduleRefJson: string): number;
  getMetadataForFile?(filePath: string): string | undefined;
  get_metadata_for_file?(filePath: string): string | undefined;
  getFileContent?(filePath: string): string;
  get_file_content?(filePath: string): string;
  lookupHostFileContent?(filePath: string): string;
  lookup_host_file_content?(filePath: string): string;
  getTsFileForTemplate?(templatePath: string): string | undefined;
  get_ts_file_for_template?(templatePath: string): string | undefined;
  readResource?(containingFile: string, url: string): string | undefined;
  read_resource?(containingFile: string, url: string): string | undefined;
  canonicalPaths?(pathsJson: string): string;
  canonical_paths?(pathsJson: string): string;
  getCompilerOptions?(): string;
  get_compiler_options?(): string;
  closeStream?(id: number): void;
  close_stream?(id: number): void;
}

export interface WasmAnalyzerOptions {
  host?: AnalyzerHost;
}

interface HostFileContentLookup {
  code?: string;
  id: string;
  external: boolean;
}

type WasmEvent =
  | {
      id: number;
      event: 'analysisResult';
      data: nga.CompilationChunk;
    }
  | {
      id: number;
      event: 'analysisComplete';
    }
  | {
      id: number;
      event: 'analysisError';
      error: string;
    }
  | {
      id: number;
      event: 'metadataResult';
      data: nga.AnalysisResult | null;
      error?: string;
    }
  | {
      id: number;
      event: 'hostRequests';
      resolve: ResolveRequest[];
      load: LoadRequest[];
    };

/** JS-side state of one engine stream; `null` in `queue` marks its end. */
interface WasmStream {
  queue: (nga.CompilationChunk | null)[];
  nextResolve: ((val: nga.CompilationChunk | null) => void) | null;
  error?: Error;
  /** Whether the engine has emitted a terminal event (`analysisComplete` or `analysisError`). */
  ended: boolean;
}

interface PendingMetadataRequest {
  resolve: (val: nga.AnalysisResult | null) => void;
  reject: (err: Error) => void;
}

async function settleHostSubBatch<Req, Res>(
  requests: readonly Req[],
  run: (reqs: readonly Req[]) => Promise<ReadonlyArray<Res | HostItemError | null>>,
  label: string,
): Promise<ReadonlyArray<Res | HostItemError | null>> {
  if (requests.length === 0) {
    return [];
  }
  try {
    const results = await run(requests);
    if (!Array.isArray(results) || results.length !== requests.length) {
      const error = `AnalyzerHost.${label} returned ${
        Array.isArray(results) ? results.length : typeof results
      } results for ${requests.length} requests`;
      return requests.map(() => ({error}));
    }
    return results;
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return requests.map(() => ({error}));
  }
}

export class WasmAnalyzer implements IAnalyzer {
  private inner: WasmInner;
  private host: AnalyzerHost | undefined;
  private streams = new Map<number, WasmStream>();
  private metadataRequests = new Map<number, PendingMetadataRequest>();
  private pendingHostBatches = 0;
  private microtaskScheduled = false;
  private pumpTimer: ReturnType<typeof setTimeout> | null = null;
  private closed = false;

  constructor(inner: WasmInner, options?: WasmAnalyzerOptions) {
    this.inner = inner;
    this.host = options?.host;
  }

  private hasActivePumpWork(): boolean {
    if (this.metadataRequests.size > 0) {
      return true;
    }
    for (const stream of this.streams.values()) {
      if (!stream.ended) {
        return true;
      }
    }
    return false;
  }

  private clearPumpTimer(): void {
    if (this.pumpTimer !== null) {
      clearTimeout(this.pumpTimer);
      this.pumpTimer = null;
    }
  }

  private schedulePump(): void {
    if (this.closed || this.microtaskScheduled) {
      return;
    }
    this.clearPumpTimer();
    this.microtaskScheduled = true;
    queueMicrotask(this.pumpLoop);
  }

  private async fulfilHostBatch(
    batchId: number,
    resolveReqs: readonly ResolveRequest[],
    loadReqs: readonly LoadRequest[],
  ): Promise<void> {
    const host = this.host;
    let resolveResults: ReadonlyArray<ResolveResult | HostItemError | null>;
    let loadResults: ReadonlyArray<LoadResult | HostItemError | null>;
    if (!host) {
      const noHost = {error: 'No AnalyzerHost configured for hostRequests'};
      resolveResults = resolveReqs.map(() => noHost);
      loadResults = loadReqs.map(() => noHost);
    } else {
      [resolveResults, loadResults] = await Promise.all([
        settleHostSubBatch(resolveReqs, (reqs) => host.resolve(reqs), 'resolve'),
        settleHostSubBatch(loadReqs, (reqs) => host.load(reqs), 'load'),
      ]);
    }

    this.pendingHostBatches--;
    if (this.closed) {
      return;
    }

    try {
      this.invoke(
        this.inner.provideHostResults ?? this.inner.provide_host_results,
        'provideHostResults',
        batchId,
        JSON.stringify({resolve: resolveResults, load: loadResults}),
      );
    } catch (err) {
      const wrapped = err instanceof Error ? err : new Error(String(err));
      for (const pending of this.metadataRequests.values()) {
        pending.reject(wrapped);
      }
      this.metadataRequests.clear();
      for (const stream of this.streams.values()) {
        stream.ended = true;
        stream.error = wrapped;
        if (stream.nextResolve) {
          const resolve = stream.nextResolve;
          stream.nextResolve = null;
          resolve(null);
        }
      }
      return;
    }

    if (this.hasActivePumpWork()) {
      this.schedulePump();
    }
  }

  private dispatchEvent(event: WasmEvent): void {
    if (event.event === 'hostRequests') {
      this.pendingHostBatches++;
      void this.fulfilHostBatch(event.id, event.resolve ?? [], event.load ?? []);
      return;
    }

    if (event.event === 'metadataResult') {
      const pending = this.metadataRequests.get(event.id);
      if (pending) {
        this.metadataRequests.delete(event.id);
        if (event.error !== undefined) {
          pending.reject(new Error(event.error));
        } else {
          pending.resolve(event.data ?? null);
        }
      }
      return;
    }

    const stream = this.streams.get(event.id);
    if (!stream) {
      return;
    }
    if (event.event === 'analysisResult' && event.data != null) {
      stream.queue.push(event.data);
    } else if (event.event === 'analysisComplete') {
      stream.ended = true;
      stream.queue.push(null);
    } else if (event.event === 'analysisError' && event.error !== undefined) {
      stream.ended = true;
      stream.error = new Error(event.error);
    }
    if (stream.nextResolve) {
      const resolve = stream.nextResolve;
      stream.nextResolve = null;
      resolve(null);
    }
  }

  private pumpLoop = () => {
    this.microtaskScheduled = false;
    this.clearPumpTimer();
    if (this.closed || !this.hasActivePumpWork()) {
      return;
    }

    const start = Date.now();
    let idleCount = 0;
    let stalledOnHost = false;
    while (this.hasActivePumpWork() && Date.now() - start < 15) {
      const eventStr = this.inner.pump();
      if (!eventStr) {
        if (this.pendingHostBatches > 0) {
          stalledOnHost = true;
          break;
        }
        idleCount++;
        if (idleCount > 1000) {
          break;
        }
        continue;
      }
      idleCount = 0;
      try {
        const event = JSON.parse(eventStr) as WasmEvent;
        this.dispatchEvent(event);
      } catch (e) {
        console.error('Failed to parse WASM pump event', e);
      }
    }

    if (this.hasActivePumpWork() && !stalledOnHost && !this.microtaskScheduled) {
      this.pumpTimer = setTimeout(this.pumpLoop, 0);
    }
  };

  analyze(): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    return this.consumeStream(() => this.invoke(this.inner.analyze, 'analyze'));
  }

  analyzeOptimized(): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    return this.consumeStream(() =>
      this.invoke(this.inner.analyze_optimized ?? this.inner.analyzeOptimized, 'analyzeOptimized'),
    );
  }

  analyzeDelta(): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    return this.consumeStream(() =>
      this.invoke(this.inner.analyze_delta ?? this.inner.analyzeDelta, 'analyzeDelta'),
    );
  }

  analyzeOptimizedDelta(): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    return this.consumeStream(() =>
      this.invoke(
        this.inner.analyze_optimized_delta ?? this.inner.analyzeOptimizedDelta,
        'analyzeOptimizedDelta',
      ),
    );
  }

  /**
   * Calls the engine export `fn` with `args`; `name` identifies it when an older engine build
   * does not have it.
   *
   * The engine's fallible exports return `Result<_, String>`, which wasm-bindgen throws across
   * the boundary as a bare string rather than an `Error`. The N-API adapter receives
   * `napi::Error`s and the sidecar adapter constructs `Error`s from the RPC payload, so this is
   * the one backend whose failures would otherwise reach `IAnalyzer` consumers as non-`Error`
   * values. Anything thrown is wrapped in an `Error` here; `Error` instances (wasm-bindgen's own
   * `TypeError`s, Rust panics surfacing as `RuntimeError`) pass through unchanged.
   */
  private invoke<A extends unknown[], R>(
    fn: ((...args: A) => R) | undefined,
    name: string,
    ...args: A
  ): R {
    if (!fn) {
      throw new Error(`WasmInner does not support ${name}`);
    }
    try {
      return fn.apply(this.inner, args);
    } catch (e) {
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  /**
   * Opens an engine stream with `start` and yields its chunks until the engine ends it.
   *
   * `start` runs on the first `next()`, not when the generator is created. The `finally`
   * releases the stream however iteration ends: completion, an engine error, or a consumer
   * that stops early with `break`, `return()` or a throw. Without it an abandoned stream
   * would stay registered, and `pumpLoop`, which runs while any stream is registered,
   * would never stop.
   */
  private async *consumeStream(
    start: () => number,
  ): AsyncGenerator<nga.CompilationChunk, void, unknown> {
    const id = start();
    const stream: WasmStream = {queue: [], nextResolve: null, ended: false};
    this.streams.set(id, stream);
    this.schedulePump();

    try {
      while (true) {
        // TODO(wasm): deliver queued chunks before throwing on stream error to match N-API.
        if (stream.error) {
          throw stream.error;
        }
        const item = stream.queue.shift();
        if (item === undefined) {
          await new Promise<void>((resolve) => {
            stream.nextResolve = () => resolve();
          });
          continue;
        }
        if (item === null) {
          return;
        }
        yield item;
      }
    } finally {
      this.releaseStream(id);
    }
  }

  /**
   * Unregisters stream `id` and drops the engine's receiver for it.
   *
   * What happens to a stream that had not ended depends on the analyzer. Without a `host`, the
   * engine keeps analyzing and filling its caches; only the results go unobserved. With a
   * `host`, the engine cancels the analysis and its pending host requests instead, so queries
   * parked on host answers are not left behind for later requests to join. Batches already
   * handed to the host still settle, and the engine ignores their results.
   *
   * Once a stream has ended the engine has already dropped the receiver, so `close_stream` does
   * nothing then. If `close()` already cleared `streams` and freed `inner`, skip `close_stream`
   * so cleanup does not touch the freed WASM handle. Older engine builds do not export
   * `close_stream`; for those only the JS side is released.
   */
  private releaseStream(id: number): void {
    if (!this.streams.delete(id)) {
      return;
    }
    const close = this.inner.close_stream ?? this.inner.closeStream;
    close?.call(this.inner, id);
  }

  async getMetadataForFile(file: nga.ModuleRef): Promise<nga.AnalysisResult | null> {
    const id = this.invoke(
      this.inner.requestMetadata ?? this.inner.request_metadata,
      'requestMetadata',
      JSON.stringify(file),
    );
    return new Promise<nga.AnalysisResult | null>((resolve, reject) => {
      this.metadataRequests.set(id, {resolve, reject});
      this.schedulePump();
    });
  }

  async updateFileContent(updates: nga.FileUpdate[]): Promise<string[]> {
    const res = this.invoke(
      this.inner.updateFileContent ?? this.inner.update_file_content,
      'updateFileContent',
      JSON.stringify(updates),
    );
    return JSON.parse(res) as string[];
  }

  async invalidateFiles(updates: nga.FileInvalidation[]): Promise<string[]> {
    const stringNames = ['Created', 'Deleted', 'Changed'];
    const mapped = updates.map((u) => ({
      filePath: u.filePath,
      updateType:
        typeof u.updateType === 'number'
          ? (stringNames[u.updateType] ?? u.updateType)
          : u.updateType,
      ...(u.idKind !== undefined ? {idKind: u.idKind} : {}),
    }));
    const res = this.invoke(
      this.inner.invalidateFiles ?? this.inner.invalidate_files,
      'invalidateFiles',
      JSON.stringify(mapped),
    );
    return JSON.parse(res) as string[];
  }

  async setEntryPoints(entryPoints: nga.ModuleRef[]): Promise<string[]> {
    const res = this.invoke(
      this.inner.setEntryPoints ?? this.inner.set_entry_points,
      'setEntryPoints',
      JSON.stringify(entryPoints),
    );
    return JSON.parse(res) as string[];
  }

  async clearResolutionCache(): Promise<string[]> {
    const res = this.invoke(
      this.inner.clearResolutionCache ?? this.inner.clear_resolution_cache,
      'clearResolutionCache',
    );
    return JSON.parse(res) as string[];
  }

  async getTsFileForTemplate(templatePath: string): Promise<nga.TemplateUsage[] | null> {
    const res = this.invoke(
      this.inner.getTsFileForTemplate ?? this.inner.get_ts_file_for_template,
      'getTsFileForTemplate',
      templatePath,
    );
    return res ? (JSON.parse(res) as nga.TemplateUsage[]) : null;
  }

  async getFileContent(filePath: string): Promise<string> {
    if (!this.host) {
      return this.invoke(
        this.inner.getFileContent ?? this.inner.get_file_content,
        'getFileContent',
        filePath,
      );
    }
    if (this.closed) {
      throw new Error('WasmAnalyzer closed');
    }
    const lookupFn = this.inner.lookupHostFileContent ?? this.inner.lookup_host_file_content;
    let id = filePath;
    let external = false;
    if (lookupFn) {
      const lookup = JSON.parse(
        this.invoke(lookupFn, 'lookupHostFileContent', filePath),
      ) as HostFileContentLookup;
      if (lookup.code !== undefined) {
        return lookup.code;
      }
      id = lookup.id;
      external = lookup.external;
    }
    let results: ReadonlyArray<LoadResult | HostItemError | null>;
    try {
      results = await this.host.load([{id, kind: 'module', external}]);
    } catch (e) {
      throw e instanceof Error ? e : new Error(String(e));
    }
    if (!Array.isArray(results) || results.length !== 1) {
      throw new Error(
        `AnalyzerHost.load returned ${
          Array.isArray(results) ? results.length : typeof results
        } results for 1 request`,
      );
    }
    const slot = results[0];
    if (slot === null || slot === undefined) {
      throw new Error(`Module not found: ${id}`);
    }
    if ('error' in slot) {
      throw new Error(slot.error);
    }
    return slot.code;
  }

  async readResource(containingFile: string, url: string): Promise<nga.ResolvedResource | null> {
    const res = this.invoke(
      this.inner.readResource ?? this.inner.read_resource,
      'readResource',
      containingFile,
      url,
    );
    return res ? (JSON.parse(res) as nga.ResolvedResource) : null;
  }

  async canonicalPaths(paths: string[]): Promise<string[]> {
    const res = this.invoke(
      this.inner.canonicalPaths ?? this.inner.canonical_paths,
      'canonicalPaths',
      JSON.stringify(paths),
    );
    return JSON.parse(res) as string[];
  }

  getCompilerOptions(): NgpCompilerOptions {
    const fn = this.inner.getCompilerOptions ?? this.inner.get_compiler_options;
    if (!fn) {
      return {};
    }
    const raw = fn.call(this.inner);
    return raw ? (JSON.parse(raw) as NgpCompilerOptions) : {};
  }

  close(): void {
    this.closed = true;
    this.clearPumpTimer();
    const closeError = new Error('WasmAnalyzer closed');
    for (const pending of this.metadataRequests.values()) {
      pending.reject(closeError);
    }
    this.metadataRequests.clear();
    for (const stream of this.streams.values()) {
      stream.ended = true;
      stream.error = closeError;
      if (stream.nextResolve) {
        const resolve = stream.nextResolve;
        stream.nextResolve = null;
        resolve(null);
      }
    }
    this.streams.clear();
    try {
      this.inner.free();
    } catch {
      // Ignore if already freed.
    }
  }
}
