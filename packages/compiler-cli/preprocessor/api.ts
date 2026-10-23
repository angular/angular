/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Public programmatic API of `@angular/compiler-cli/preprocessor`.
 *
 * This module is deliberately **free of static edges to the analysis-engine loader**.
 * The compiler also runs where N-API is unavailable, driven by an out-of-process
 * sidecar binary; a static `import` of `./src/analyzer_loader.js` here would pull
 * engine resolution into module evaluation and break those deployments. The engine is
 * reached only through {@link createAnalyzer}, which loads the resolver lazily.
 */

import type {AnalyzerBackend, LoadAnalyzerOptions, LoadedAnalyzer} from './src/analyzer_loader.js';
import type {IAnalyzer} from './src/hybrid_compiler.js';

export {HybridCompiler} from './src/hybrid_compiler.js';
export type {HybridCompilerOptions, IAnalyzer} from './src/hybrid_compiler.js';

// The sidecar transport: usable with no N-API addon and no wasm engine present.
export {SidecarAnalyzer} from './src/analyzer_sidecar.js';

export {run} from './ngp.js';
export type {RunOptions} from './ngp.js';

export {WasmAnalyzer, type WasmInner} from './src/analyzer_wasm.js';
export type {ClassEntity} from './src/indexer_api.js';
export {IndexerBoundTemplate} from './src/indexing/indexer.js';
export {buildTypeCheckingConfig, type NgpTypeCheckingConfig} from './src/tcb.js';
export {verifyCompilerOptions, type NgpCompilerOptions} from './src/compiler_options.js';
export type {
  AnalyzerOptions,
  DefaultHostConfig,
  NgDiagnostic,
  NgRelatedInformation,
} from './src/types.js';
export type {HostDirEntry, HostFileStat, WasmHostFs} from './src/wasm_host_fs.js';
export {resolveWorkspaceConfig} from './src/workspace.js';
export type {WorkspaceConfig} from './src/workspace.js';

export type {AnalyzerBackend, LoadAnalyzerOptions, LoadedAnalyzer};

/**
 * Resolves and constructs the analysis engine (native N-API, falling back to wasm).
 *
 * Accepts either a tsconfig path plus options, or options alone. In the options form
 * `tsconfigPath` is optional; without it, the analyzer is configured from the options only
 * (see {@link AnalyzerOptions}).
 *
 * Lazy by construction — see the module comment. Callers that only use
 * {@link SidecarAnalyzer} never invoke this and so never load engine-resolution code.
 */
export function createAnalyzer(options: LoadAnalyzerOptions): Promise<IAnalyzer>;
export function createAnalyzer(
  tsconfigPath: string,
  options?: LoadAnalyzerOptions,
): Promise<IAnalyzer>;
export async function createAnalyzer(
  tsconfigPathOrOptions: string | LoadAnalyzerOptions,
  options?: LoadAnalyzerOptions,
): Promise<IAnalyzer> {
  const {loadAnalyzer, toLoadAnalyzerOptions} = await import('./src/analyzer_loader.js');
  return loadAnalyzer(toLoadAnalyzerOptions(tsconfigPathOrOptions, options));
}

/** As {@link createAnalyzer}, but also reports which engine actually loaded. */
export function createAnalyzerWithInfo(options: LoadAnalyzerOptions): Promise<LoadedAnalyzer>;
export function createAnalyzerWithInfo(
  tsconfigPath: string,
  options?: LoadAnalyzerOptions,
): Promise<LoadedAnalyzer>;
export async function createAnalyzerWithInfo(
  tsconfigPathOrOptions: string | LoadAnalyzerOptions,
  options?: LoadAnalyzerOptions,
): Promise<LoadedAnalyzer> {
  const {loadAnalyzerWithInfo, toLoadAnalyzerOptions} = await import('./src/analyzer_loader.js');
  return loadAnalyzerWithInfo(toLoadAnalyzerOptions(tsconfigPathOrOptions, options));
}
