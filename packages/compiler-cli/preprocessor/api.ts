/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Public programmatic API of `ng-exp-compiler`.
 *
 * This module is deliberately **free of static edges to the analysis-engine loader**.
 * The compiler also runs where N-API is unavailable, driven by an out-of-process
 * sidecar binary; a static `import` of `./src/analyzer_loader.js` here would pull
 * engine resolution into module evaluation and break those deployments. The engine is
 * reached only through {@link createAnalyzer}, which loads the resolver lazily.
 *
 * Consumers that always want the engine can import `ng-exp-compiler/analyzer`
 * directly instead.
 */

import type {IAnalyzer} from './src/hybrid_compiler.js';
import type {AnalyzerBackend, LoadAnalyzerOptions, LoadedAnalyzer} from './src/analyzer_loader.js';

export {HybridCompiler} from './src/hybrid_compiler.js';
export type {IAnalyzer, HybridCompilerOptions} from './src/hybrid_compiler.js';

// The sidecar transport: usable with no N-API addon and no wasm engine present.
export {SidecarAnalyzer} from './src/analyzer_sidecar.js';

export {run} from './ngp.js';
export type {RunOptions} from './ngp.js';

export {buildTypeCheckingConfig} from './src/tcb.js';
export {resolveWorkspaceConfig} from './src/workspace.js';
export type {WorkspaceConfig} from './src/workspace.js';

export type {AnalyzerBackend, LoadAnalyzerOptions, LoadedAnalyzer};

/**
 * Resolves and constructs the analysis engine (native N-API, falling back to wasm).
 *
 * Lazy by construction — see the module comment. Callers that only use
 * {@link SidecarAnalyzer} never invoke this and so never load engine-resolution code.
 */
export async function createAnalyzer(
  tsconfigPath: string,
  options: LoadAnalyzerOptions = {},
): Promise<IAnalyzer> {
  const {loadAnalyzer} = await import('./src/analyzer_loader.js');
  return loadAnalyzer(tsconfigPath, options);
}

/** As {@link createAnalyzer}, but also reports which engine actually loaded. */
export async function createAnalyzerWithInfo(
  tsconfigPath: string,
  options: LoadAnalyzerOptions = {},
): Promise<LoadedAnalyzer> {
  const {loadAnalyzerWithInfo} = await import('./src/analyzer_loader.js');
  return loadAnalyzerWithInfo(tsconfigPath, options);
}
