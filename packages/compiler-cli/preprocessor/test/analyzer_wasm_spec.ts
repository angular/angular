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
    await expectAsync(analyzer.updateFileContent([])).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.invalidateFiles([])).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.getFileContent('/main.ts')).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.getMetadataForFile('/main.ts')).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.getTsFileForTemplate('/main.html')).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.readResource('/main.ts', './main.html')).toBeRejectedWithError(
      MESSAGE,
    );
  });

  it('throws an Error carrying the engine message from sync methods', () => {
    const analyzer = new WasmAnalyzer(throwingInner(MESSAGE));

    expect(() => analyzer.getFileContentSync('/main.ts')).toThrowError(MESSAGE);
    expect(() => analyzer.getMetadataForFileSync('/main.ts')).toThrowError(MESSAGE);
    expect(() => analyzer.getTsFileForTemplateSync('/main.html')).toThrowError(MESSAGE);
    expect(() => analyzer.readResourceSync('/main.ts', './main.html')).toThrowError(MESSAGE);
  });

  it('fails an analysis stream with an Error when the engine refuses to start it', async () => {
    const analyzer = new WasmAnalyzer(throwingInner(MESSAGE));

    await expectAsync(analyzer.analyze().next()).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.analyzeOptimized().next()).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.analyzeDelta().next()).toBeRejectedWithError(MESSAGE);
    await expectAsync(analyzer.analyzeOptimizedDelta().next()).toBeRejectedWithError(MESSAGE);
    expect(() => analyzer.analyzeSync().next()).toThrowError(MESSAGE);
    expect(() => analyzer.analyzeOptimizedSync().next()).toThrowError(MESSAGE);
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
    const analyzer = new WasmAnalyzer(inner);

    await expectAsync(analyzer.setEntryPoints(['/main.ts'])).toBeRejectedWithError(
      'WasmInner does not support setEntryPoints',
    );
  });
});
