/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {NodeJSFileSystem, setFileSystem} from './src/ngtsc/file_system';

export {VERSION} from './src/version';

export * from './src/ngtsc/transform/jit';
export * from './src/transformers/api';
export * from './src/transformers/entry_points';

export * from './src/perform_compile';

// TODO(tbosch): remove this once usages in G3 are changed to `CompilerOptions`
export {CompilerOptions as AngularCompilerOptions} from './src/transformers/api';

// Internal exports needed for packages relying on the compiler-cli.
// TODO: Remove this when the CLI has switched to the private entry-point.
export * from './private/tooling';

// Exposed as they are needed for relying on the `linker`.
export * from './src/ngtsc/logging';
export * from './src/ngtsc/file_system';

// Exports for dealing with the `ngtsc` program.
export {NgTscPlugin, PluginCompilerHost} from './src/ngtsc/tsc_plugin';
export {NgtscProgram} from './src/ngtsc/program';
export {OptimizeFor} from './src/ngtsc/typecheck/api';

// **Note**: Explicit named exports to make this file work with CJS/ESM interop without
// needing to use a default import. NodeJS will expose named CJS exports as named ESM exports.
// TODO(devversion): Remove these duplicate exports once devmode&prodmode is combined/ESM.
export {ConsoleLogger, Logger, LogLevel} from './src/ngtsc/logging';
export {NodeJSFileSystem, absoluteFrom, FileSystem, AbsoluteFsPath} from './src/ngtsc/file_system';

// Export documentation entities for Angular-internal API doc generation.
export * from './src/ngtsc/docs';

// Exposed for usage in 1P Angular plugin.
export {isLocalCompilationDiagnostics, ErrorCode, ngErrorCode} from './src/ngtsc/diagnostics';

setFileSystem(new NodeJSFileSystem());
