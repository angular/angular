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

export * from './private/hybrid_analysis';

// Exposed as they are needed for relying on the `linker`.
export * from './src/ngtsc/file_system';
export * from './src/ngtsc/logging';

// Exports for dealing with the `ngtsc` program.
export {NgtscProgram} from './src/ngtsc/program';
export {NgTscPlugin, PluginCompilerHost} from './src/ngtsc/tsc_plugin';
export {OptimizeFor} from './src/ngtsc/typecheck/api';

// Explicit exports for language service
export {getAngularDecorators} from './src/ngtsc/annotations';
export {
  freshCompilationTicket,
  incrementalFromCompilerTicket,
  NgCompiler,
  resourceChangeTicket,
  type CompilationTicket,
  type NgCompilerOptions,
} from './src/ngtsc/core';
export {type NgCompilerAdapter} from './src/ngtsc/core/api';
export {isFatalDiagnosticError} from './src/ngtsc/diagnostics';
export {Reference} from './src/ngtsc/imports';
export {TrackedIncrementalBuildStrategy} from './src/ngtsc/incremental';
export {
  isExternalResource,
  MetaKind,
  type DirectiveMeta,
  type InputMapping,
  type PipeMeta,
  type Resource,
} from './src/ngtsc/metadata';
export {PerfPhase} from './src/ngtsc/perf';
export {type FileUpdate, type ProgramDriver} from './src/ngtsc/program_driver';
export {
  isNamedClassDeclaration,
  type ClassDeclaration,
  type DeclarationNode,
  type ReflectionHost,
} from './src/ngtsc/reflection';
export {isShim} from './src/ngtsc/shims';
export * from './src/ngtsc/typecheck/api';
export {getRootDirs} from './src/ngtsc/util/src/typescript';

// **Note**: Explicit named exports to make this file work with CJS/ESM interop without
// needing to use a default import. NodeJS will expose named CJS exports as named ESM exports.
// TODO(devversion): Remove these duplicate exports once devmode&prodmode is combined/ESM.
export {
  absoluteFrom,
  absoluteFromSourceFile,
  getFileSystem,
  getSourceFileOrError,
  isLocalRelativePath,
  NgtscCompilerHost,
  NodeJSFileSystem,
  resolve,
  setFileSystem,
  type AbsoluteFsPath,
  type FileStats,
  type FileSystem,
  type PathSegment,
  type PathString,
} from './src/ngtsc/file_system';
export {ConsoleLogger, Logger, LogLevel} from './src/ngtsc/logging';

// Export documentation entities for Angular-internal API doc generation.
export * from './src/ngtsc/docs';

// Exposed for usage in 1P Angular plugin.
export {ErrorCode, isLocalCompilationDiagnostics, ngErrorCode} from './src/ngtsc/diagnostics';

setFileSystem(new NodeJSFileSystem());
