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

  it('interleaves metadataResult events with an active analyze() stream', async () => {
    let nextId = 1;
    const queuedEvents: Array<string | undefined> = [];

    const inner: WasmInner = {
      free() {},
      pump: () => queuedEvents.shift(),
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

    for await (const chunk of analyzer.analyze()) {
      seenChunks.push(...chunk.files.map((f) => f.filePath));
      const depMeta = await analyzer.getMetadataForFile('/app/dep.ts');
      depMetaFilePath = depMeta?.filePath;
    }

    expect(seenChunks).toEqual(['/app/main.ts']);
    expect(depMetaFilePath).toBe('/app/dep.ts');
  });

  it('rejects when metadataResult carries an error and when close() cancels pending requests', async () => {
    let nextId = 1;
    const queuedEvents: Array<string | undefined> = [];

    const inner: WasmInner = {
      free() {},
      pump: () => queuedEvents.shift(),
      analyze: () => 0,
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

    const stalledPromise = analyzer.getMetadataForFile('/app/stalled.ts');
    analyzer.close();
    await expectAsync(stalledPromise).toBeRejectedWithError('WasmAnalyzer closed');
  });
});
