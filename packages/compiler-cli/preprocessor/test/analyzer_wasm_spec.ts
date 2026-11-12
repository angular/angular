/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {WasmAnalyzer, type WasmInner} from '../src/analyzer_wasm.js';

const MESSAGE = "Entry points must be absolute paths, got 'src/main.ts'";

/**
 * A stand-in for the wasm-bindgen `WasmAnalyzer` whose exports all fail the way the real binding
 * fails for a Rust `Err(String)`: by throwing the message as a bare string, not an `Error`.
 */
function throwingInner(message: string): WasmInner {
  const fail = () => {
    throw message;
  };
  return {
    free() {},
    pump: () => undefined,
    analyze: fail,
    analyze_optimized: fail,
    analyze_delta: fail,
    analyze_optimized_delta: fail,
    update_file_content: fail,
    invalidate_files: fail,
    set_entry_points: fail,
    clear_resolution_cache: fail,
    request_metadata: fail,
    get_file_content: fail,
    get_metadata_for_file: fail,
    get_ts_file_for_template: fail,
    read_resource: fail,
  };
}

describe('WasmAnalyzer engine errors', () => {
  it('rejects async methods with an Error carrying the engine message', async () => {
    const analyzer = new WasmAnalyzer(throwingInner(MESSAGE));

    await expectAsync(analyzer.setEntryPoints(['src/main.ts'])).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.clearResolutionCache()).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.updateFileContent([])).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.invalidateFiles([])).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.getFileContent('/main.ts')).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.getMetadataForFile('/main.ts')).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.getTsFileForTemplate('/main.html')).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.readResource('/main.ts', './main.html')).toBeRejectedWithError(
      MESSAGE,
    );
  });

  it('fails an analysis stream with an Error when the engine refuses to start it', async () => {
    const analyzer = new WasmAnalyzer(throwingInner(MESSAGE));

    await expectAsync(analyzer.analyze().next()).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.analyzeOptimized().next()).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.analyzeDelta().next()).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.analyzeOptimizedDelta().next()).toBeRejectedWithError(MESSAGE);
  });

  it('passes Error instances through unchanged', async () => {
    // wasm-bindgen's own guards (e.g. a call after `free()`) and Rust panics already throw
    // `Error` subclasses; wrapping those again would hide their type and stack.
    const original = new TypeError('null pointer passed to rust');
    const inner = throwingInner('unused');
    inner.set_entry_points = () => {
      throw original;
    };
    const analyzer = new WasmAnalyzer(inner);

    await expectAsync(analyzer.setEntryPoints(['/main.ts'])).toBeRejectedWith(original);
  });

  it('still reports exports that an older engine build lacks', async () => {
    const inner = throwingInner('unused');
    delete inner.set_entry_points;
    delete inner.clear_resolution_cache;
    delete inner.request_metadata;
    const analyzer = new WasmAnalyzer(inner);

    await expectAsync(analyzer.setEntryPoints(['/main.ts'])).toBeRejectedWithError(
      'WasmInner does not support setEntryPoints',
    );
    await expectAsync(analyzer.clearResolutionCache()).toBeRejectedWithError(
      'WasmInner does not support clearResolutionCache',
    );
    await expectAsync(analyzer.getMetadataForFile('/main.ts')).toBeRejectedWithError(
      'WasmInner does not support requestMetadata',
    );
  });

  it('parses evicted module IDs returned by clearResolutionCache', async () => {
    const inner = throwingInner('unused');
    inner.clear_resolution_cache = () => JSON.stringify(['/app/a.ts', '\0virtual:dep']);
    const analyzer = new WasmAnalyzer(inner);

    expect(await analyzer.clearResolutionCache()).toEqual(['/app/a.ts', '\0virtual:dep']);
  });
});

describe('WasmAnalyzer pump-driven getMetadataForFile', () => {
  it('resolves metadata and null outcomes across multiple pump polls without calling sync export', async () => {
    let nextId = 1;
    const requestedRefs: unknown[] = [];
    const queuedEvents: Array<string | undefined> = [];
    const fakeResult = {
      filePath: '/app/cmp.ts',
      classes: [],
      diagnostics: [],
    };

    const inner: WasmInner = {
      free() {},
      pump: () => queuedEvents.shift(),
      analyze: () => 0,
      request_metadata(refJson: string) {
        requestedRefs.push(JSON.parse(refJson));
        const id = nextId++;
        if (id === 1) {
          queuedEvents.push(
            undefined,
            JSON.stringify({event: 'metadataResult', id, data: fakeResult}),
          );
        } else {
          queuedEvents.push(JSON.stringify({event: 'metadataResult', id, data: null}));
        }
        return id;
      },
      get_metadata_for_file() {
        throw new Error('sync get_metadata_for_file must not be called');
      },
    };

    const analyzer = new WasmAnalyzer(inner);
    const [found, missing] = await Promise.all([
      analyzer.getMetadataForFile('/app/cmp.ts'),
      analyzer.getMetadataForFile('/app/missing.ts'),
    ]);

    expect(requestedRefs).toEqual(['/app/cmp.ts', '/app/missing.ts']);
    expect(found).toEqual(jasmine.objectContaining({filePath: '/app/cmp.ts'}));
    expect(missing).toBeNull();
  });

  it('interleaves metadataResult on microtasks during analyze() and stops pumping on analysisComplete', async () => {
    let nextId = 1;
    let pumpAfterComplete = 0;
    let sawComplete = false;
    const queuedEvents: Array<string | undefined> = [];

    const inner: WasmInner = {
      free() {},
      pump() {
        if (sawComplete) {
          pumpAfterComplete++;
        }
        const next = queuedEvents.shift();
        if (next && JSON.parse(next).event === 'analysisComplete') {
          sawComplete = true;
        }
        return next;
      },
      analyze() {
        const id = nextId++;
        queuedEvents.push(
          JSON.stringify({
            event: 'analysisResult',
            id,
            data: {files: [{filePath: '/app/main.ts', classes: [], diagnostics: []}]},
          }),
        );
        return id;
      },
      request_metadata(refJson: string) {
        const filePath = JSON.parse(refJson) as string;
        const id = nextId++;
        queuedEvents.push(
          JSON.stringify({
            event: 'metadataResult',
            id,
            data: {filePath, classes: [], diagnostics: []},
          }),
          JSON.stringify({event: 'analysisComplete', id: 1}),
        );
        return id;
      },
    };

    const analyzer = new WasmAnalyzer(inner);
    const seenChunks: string[] = [];
    let depMetaFilePath: string | undefined;
    let macrotaskFired = false;
    const timer = setTimeout(() => {
      macrotaskFired = true;
    }, 0);

    try {
      for await (const chunk of analyzer.analyze()) {
        seenChunks.push(...chunk.files.map((f) => f.filePath));
        const depMeta = await analyzer.getMetadataForFile('/app/dep.ts');
        depMetaFilePath = depMeta?.filePath;
      }
      expect(macrotaskFired).toBe(false);
    } finally {
      clearTimeout(timer);
    }

    expect(seenChunks).toEqual(['/app/main.ts']);
    expect(depMetaFilePath).toBe('/app/dep.ts');
    expect(pumpAfterComplete).toBe(0);
  });

  it('rejects when metadataResult carries an error and when close() cancels pending work', async () => {
    let nextId = 1;
    let freed = false;
    const queuedEvents: Array<string | undefined> = [];

    const inner: WasmInner = {
      free() {
        freed = true;
      },
      close_stream() {
        if (freed) {
          throw new Error('null pointer passed to rust');
        }
      },
      pump: () => queuedEvents.shift(),
      analyze: () => nextId++,
      request_metadata() {
        const id = nextId++;
        if (id === 1) {
          queuedEvents.push(
            JSON.stringify({
              event: 'metadataResult',
              id,
              data: null,
              error: 'Metadata request cancelled',
            }),
          );
        }
        return id;
      },
    };

    const analyzer = new WasmAnalyzer(inner);
    await expectAsync(analyzer.getMetadataForFile('/app/broken.ts')).toBeRejectedWithError(
      'Metadata request cancelled',
    );

    const stalledStreamNext = analyzer.analyze().next();
    const stalledPromise = analyzer.getMetadataForFile('/app/stalled.ts');
    analyzer.close();
    await expectAsync(stalledPromise).toBeRejectedWithError('WasmAnalyzer closed');
    await expectAsync(stalledStreamNext).toBeRejectedWithError('WasmAnalyzer closed');
  });
});

describe('WasmAnalyzer synchronous host gating', () => {
  it('surfaces synchronous host rejections on single-call exports while keeping pump and in-memory APIs working', async () => {
    const syncHostMsg = 'synchronous APIs require a synchronous host';
    const queuedEvents: Array<string | undefined> = [];
    const inner: WasmInner = {
      free() {},
      pump: () => queuedEvents.shift(),
      analyze: () => 1,
      request_metadata() {
        queuedEvents.push(
          JSON.stringify({
            event: 'metadataResult',
            id: 1,
            data: {filePath: '/app/a.ts', classes: [], diagnostics: []},
          }),
        );
        return 1;
      },
      get_file_content() {
        throw syncHostMsg;
      },
      read_resource() {
        throw syncHostMsg;
      },
      update_file_content: () => JSON.stringify(['/app/a.ts']),
      invalidate_files: () => JSON.stringify(['/app/a.ts']),
      clear_resolution_cache: () => JSON.stringify(['/app/a.ts']),
      canonical_paths: (pathsJson: string) => pathsJson,
      get_ts_file_for_template: () => JSON.stringify([{tsFilePath: '/app/a.ts', symbolId: 0}]),
    };

    const analyzer = new WasmAnalyzer(inner);
    await expectAsync(analyzer.getFileContent('/app/a.ts')).toBeRejectedWithError(syncHostMsg);
    await expectAsync(analyzer.readResource('/app/a.ts', './a.css')).toBeRejectedWithError(
      syncHostMsg,
    );

    // Pump-driven metadata, mutations, and in-memory lookups continue working with an async host.
    expect((await analyzer.getMetadataForFile('/app/a.ts'))?.filePath).toBe('/app/a.ts');
    expect(await analyzer.updateFileContent([{filePath: '/app/a.ts', content: 'x'}])).toEqual([
      '/app/a.ts',
    ]);
    expect(await analyzer.invalidateFiles([])).toEqual(['/app/a.ts']);
    expect(await analyzer.clearResolutionCache()).toEqual(['/app/a.ts']);
    expect(await analyzer.canonicalPaths(['/app/a.ts'])).toEqual(['/app/a.ts']);
    expect(await analyzer.getTsFileForTemplate('/app/a.html')).toEqual([
      {tsFilePath: '/app/a.ts', symbolId: 0},
    ]);
  });
});

describe('WasmAnalyzer hostRequests pump protocol', () => {
  it('dispatches hostRequests waves concurrently and resumes pumping via provideHostResults', async () => {
    const queuedEvents: Array<string | undefined> = [];
    const providedBatches: Array<{batchId: number; payload: unknown}> = [];
    let pumpCallsWhileStalled = 0;
    let waitingForBatch = false;

    const inner: WasmInner = {
      free() {},
      pump() {
        const next = queuedEvents.shift();
        if (!next && waitingForBatch) {
          pumpCallsWhileStalled++;
        }
        return next;
      },
      analyze() {
        waitingForBatch = true;
        queuedEvents.push(
          JSON.stringify({
            event: 'hostRequests',
            id: 1,
            resolve: [
              {
                importer: '\0virtual:app',
                specifier: './dep',
                kind: 'import',
                typeOnly: false,
              },
            ],
            load: [
              {
                id: '\0virtual:app',
                kind: 'module',
                external: false,
              },
            ],
          }),
        );
        return 1;
      },
      provide_host_results(batchId: number, resultsJson: string) {
        waitingForBatch = false;
        providedBatches.push({batchId, payload: JSON.parse(resultsJson)});
        queuedEvents.push(
          JSON.stringify({
            event: 'analysisResult',
            id: 1,
            data: {
              files: [
                {
                  filePath: '\0virtual:app',
                  idKind: 'virtual',
                  classes: [],
                  diagnostics: [],
                },
              ],
            },
          }),
          JSON.stringify({event: 'analysisComplete', id: 1}),
        );
      },
    };

    let concurrentInFlight = 0;
    let maxConcurrent = 0;
    const analyzer = new WasmAnalyzer(inner, {
      host: {
        async resolve(requests) {
          concurrentInFlight++;
          maxConcurrent = Math.max(maxConcurrent, concurrentInFlight);
          await Promise.resolve();
          concurrentInFlight--;
          expect(requests).toEqual([
            {
              importer: '\0virtual:app',
              specifier: './dep',
              kind: 'import',
              typeOnly: false,
            },
          ]);
          return [{id: '\0virtual:dep', idKind: 'virtual', format: 'ts'}];
        },
        async load(requests) {
          concurrentInFlight++;
          maxConcurrent = Math.max(maxConcurrent, concurrentInFlight);
          await Promise.resolve();
          concurrentInFlight--;
          expect(requests).toEqual([{id: '\0virtual:app', kind: 'module', external: false}]);
          return [{code: 'export class App {}', format: 'ts'}];
        },
      },
    });

    const emitted: Array<{filePath: string; idKind?: string}> = [];
    for await (const chunk of analyzer.analyze()) {
      emitted.push(...chunk.files.map((f) => ({filePath: f.filePath, idKind: f.idKind})));
    }

    expect(maxConcurrent).toBe(2);
    // `pumpLoop` breaks immediately once stalled on an in-flight host batch instead of spinning.
    expect(pumpCallsWhileStalled).toBeLessThanOrEqual(1);
    expect(providedBatches).toEqual([
      {
        batchId: 1,
        payload: {
          resolve: [{id: '\0virtual:dep', idKind: 'virtual', format: 'ts'}],
          load: [{code: 'export class App {}', format: 'ts'}],
        },
      },
    ]);
    expect(emitted).toEqual([{filePath: '\0virtual:app', idKind: 'virtual'}]);
  });

  it('maps rejected host batch promises and mismatched array lengths to per-slot error objects', async () => {
    const queuedEvents: Array<string | undefined> = [];
    const provided: unknown[] = [];

    const inner: WasmInner = {
      free() {},
      pump: () => queuedEvents.shift(),
      analyze() {
        queuedEvents.push(
          JSON.stringify({
            event: 'hostRequests',
            id: 7,
            resolve: [
              {importer: '/a.ts', specifier: './x', kind: 'import', typeOnly: false},
              {importer: '/a.ts', specifier: './y', kind: 'import', typeOnly: false},
            ],
            load: [{id: '/a.ts', kind: 'module', external: false}],
          }),
        );
        return 1;
      },
      provide_host_results(_batchId: number, resultsJson: string) {
        provided.push(JSON.parse(resultsJson));
        queuedEvents.push(JSON.stringify({event: 'analysisComplete', id: 1}));
      },
    };

    const analyzer = new WasmAnalyzer(inner, {
      host: {
        async resolve() {
          throw new Error('resolver exploded');
        },
        async load() {
          // Intentionally wrong length (0 instead of 1).
          return [];
        },
      },
    });

    for await (const _chunk of analyzer.analyze()) {
      // Drain stream.
    }

    expect(provided).toEqual([
      {
        resolve: [{error: 'resolver exploded'}, {error: 'resolver exploded'}],
        load: [{error: 'AnalyzerHost.load returned 0 results for 1 requests'}],
      },
    ]);
  });

  it('does not invoke provideHostResults if close() runs while a host batch is in flight', async () => {
    const queuedEvents: Array<string | undefined> = [];
    let provideCalled = false;
    let releaseResolve!: () => void;

    const inner: WasmInner = {
      free() {},
      pump: () => queuedEvents.shift(),
      analyze() {
        queuedEvents.push(
          JSON.stringify({
            event: 'hostRequests',
            id: 1,
            resolve: [{importer: '/a.ts', specifier: './b', kind: 'import', typeOnly: false}],
            load: [],
          }),
        );
        return 1;
      },
      provide_host_results() {
        provideCalled = true;
      },
    };

    const analyzer = new WasmAnalyzer(inner, {
      host: {
        resolve: () =>
          new Promise((resolve) => {
            releaseResolve = () => resolve([null]);
          }),
        load: async () => [],
      },
    });

    const nextPromise = analyzer.analyze().next();
    await new Promise((r) => setTimeout(r, 0));
    analyzer.close();
    await expectAsync(nextPromise).toBeRejectedWithError('WasmAnalyzer closed');

    releaseResolve();
    await Promise.resolve();
    expect(provideCalled).toBe(false);
  });

  it('serializes explicit virtual ModuleRef objects in setEntryPoints and getMetadataForFile', async () => {
    const seenSetEntries: unknown[] = [];
    const seenMetadataRefs: unknown[] = [];
    const queuedEvents: Array<string | undefined> = [];

    const inner: WasmInner = {
      free() {},
      pump: () => queuedEvents.shift(),
      analyze: () => 1,
      set_entry_points(json: string) {
        seenSetEntries.push(JSON.parse(json));
        return JSON.stringify(['\0virtual:old']);
      },
      request_metadata(json: string) {
        seenMetadataRefs.push(JSON.parse(json));
        queuedEvents.push(
          JSON.stringify({
            event: 'metadataResult',
            id: 1,
            data: {filePath: '\0virtual:entry', idKind: 'virtual', classes: [], diagnostics: []},
          }),
        );
        return 1;
      },
    };

    const analyzer = new WasmAnalyzer(inner);
    const evicted = await analyzer.setEntryPoints([
      '/app/real.ts',
      {id: '\0virtual:entry', idKind: 'virtual'},
    ]);
    expect(evicted).toEqual(['\0virtual:old']);
    expect(seenSetEntries).toEqual([['/app/real.ts', {id: '\0virtual:entry', idKind: 'virtual'}]]);

    const meta = await analyzer.getMetadataForFile({id: '\0virtual:entry', idKind: 'virtual'});
    expect(seenMetadataRefs).toEqual([{id: '\0virtual:entry', idKind: 'virtual'}]);
    expect(meta?.idKind).toBe('virtual');
  });

  it('serves host-mode getFileContent from engine cache before falling back to host.load', async () => {
    const loadRequests: unknown[] = [];
    const inner: WasmInner = {
      free() {},
      pump: () => undefined,
      analyze: () => 1,
      get_file_content() {
        throw 'synchronous APIs require a synchronous host';
      },
      lookup_host_file_content(filePath: string) {
        if (filePath === '/app/cached.ts') {
          return JSON.stringify({
            code: 'export const CACHED = 1;',
            id: '/app/cached.ts',
            external: false,
          });
        }
        if (filePath === '/nm/pkg/index.d.ts') {
          return JSON.stringify({id: '/nm/pkg/index.d.ts', external: true});
        }
        return JSON.stringify({id: filePath, external: false});
      },
    };

    const analyzer = new WasmAnalyzer(inner, {
      host: {
        resolve: async (reqs) => reqs.map(() => null),
        async load(requests) {
          loadRequests.push(requests);
          const req = requests[0]!;
          if (req.id === '/nm/pkg/index.d.ts') {
            return [{code: 'export declare const EXT: number;', format: 'dts'}];
          }
          if (req.id === '/app/broken.ts') {
            return [{error: 'disk read failed'}];
          }
          return [null];
        },
      },
    });

    expect(await analyzer.getFileContent('/app/cached.ts')).toBe('export const CACHED = 1;');
    expect(loadRequests).toEqual([]);

    expect(await analyzer.getFileContent('/nm/pkg/index.d.ts')).toBe(
      'export declare const EXT: number;',
    );
    expect(loadRequests).toEqual([[{id: '/nm/pkg/index.d.ts', kind: 'module', external: true}]]);

    await expectAsync(analyzer.getFileContent('/app/broken.ts')).toBeRejectedWithError(
      'disk read failed',
    );
    await expectAsync(analyzer.getFileContent('/app/missing.ts')).toBeRejectedWithError(
      'Module not found: /app/missing.ts',
    );

    analyzer.close();
    await expectAsync(analyzer.getFileContent('/app/cached.ts')).toBeRejectedWithError(
      'WasmAnalyzer closed',
    );
  });
});
