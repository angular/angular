/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodeJSFileSystem, setFileSystem} from './src/ngtsc/file_system/index.js';

export {VERSION} from './src/version.js';

export * from './src/transformers/api.js';
export * from './src/transformers/entry_points.js';

export * from './src/perform_compile.js';

// TODO(tbosch): remove this once usages in G3 are changed to `CompilerOptions`
export {CompilerOptions as AngularCompilerOptions} from './src/transformers/api.js';

// Internal exports needed for packages relying on the compiler-cli.
// TODO: Remove this when the CLI has switched to the private entry-point.
export * from './private/tooling.js';

// Exposed as they are needed for relying on the `linker`.
export * from './src/ngtsc/logging/index.js';
export * from './src/ngtsc/file_system/index.js';

// Exports for dealing with the `ngtsc` program.
export {NgTscPlugin} from './src/ngtsc/tsc_plugin.js';
export {NgtscProgram} from './src/ngtsc/program.js';
export {OptimizeFor} from './src/ngtsc/typecheck/api/index.js';

// **Note**: Explicit named exports to make this file work with CJS/ESM interop without
// needing to use a default import. NodeJS will expose named CJS exports as named ESM exports.
// TODO(devversion): Remove these duplicate exports once devmode&prodmode is combined/ESM.
export {ConsoleLogger, Logger, LogLevel} from './src/ngtsc/logging/index.js';
export {NodeJSFileSystem} from './src/ngtsc/file_system/index.js';

setFileSystem(new NodeJSFileSystem());
