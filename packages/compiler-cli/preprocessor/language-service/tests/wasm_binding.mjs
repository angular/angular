/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import path from 'node:path';
import fsSync from 'node:fs';

/** Bazel target that produces the wasm engine and its sibling `package.json`. */
export const WASM_BUILD_TARGET = '//packages/compiler-cli/preprocessor/ng-analyze:wasm';

/**
 * Ensures the analysis engine is reachable by the test process and anything it spawns.
 *
 * The engine is the Bazel-built wasm binding. The analyzer loader does not know about
 * `dist/bin`, so we resolve the binding here and publish it through the loader's
 * `NG_EXP_COMPILER_WASM_BINDING` override. Child processes (e.g. the bundled LSP server)
 * inherit the environment, so this only needs to happen once in the test entrypoint.
 *
 * Throws when no binding can be found, so the suite fails fast instead of reporting
 * every spec as a `null` result.
 */
export function ensureWasmBinding(repoRoot) {
  if (process.env['NG_EXP_COMPILER_WASM_BINDING']) {
    return process.env['NG_EXP_COMPILER_WASM_BINDING'];
  }
  const wasmBinding =
    process.env['NGP_WASM_BINDING'] ||
    path.join(
      repoRoot,
      'dist/bin/packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
    );
  if (!fsSync.existsSync(wasmBinding)) {
    throw new Error(
      `Could not find the ng-analyze wasm binding at ${wasmBinding}.\n` +
        `Build it first with: pnpm bazel build ${WASM_BUILD_TARGET}\n` +
        `or point NGP_WASM_BINDING / NG_EXP_COMPILER_WASM_BINDING at a wasm-bindgen build.`,
    );
  }
  process.env['NG_EXP_COMPILER_WASM_BINDING'] = wasmBinding;
  return wasmBinding;
}
