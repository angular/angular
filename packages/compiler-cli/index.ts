/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodeJSFileSystem, setFileSystem} from './src/ngtsc/file_system';

export {AotCompilerHost, AotCompilerHost as StaticReflectorHost, StaticReflector, StaticSymbol} from '@angular/compiler';
export {VERSION} from './src/version';

export * from './src/transformers/api';
export * from './src/transformers/entry_points';

export * from './src/perform_compile';

// TODO(tbosch): remove this once usages in G3 are changed to `CompilerOptions`
export {CompilerOptions as AngularCompilerOptions} from './src/transformers/api';

export {ngToTsDiagnostic} from './src/transformers/util';

// Internal exports needed for packages relying on the compiler-cli.
// TODO: Remove this when the CLI has switched to the private entry-point.
export * from './private/tooling';

// Exposed as they are needed for relying on the `linker`.
export * from './src/ngtsc/logging';
export * from './src/ngtsc/file_system';

// Exports for dealing with the `ngtsc` program.
export {NgTscPlugin} from './src/ngtsc/tsc_plugin';
export {NgtscProgram} from './src/ngtsc/program';
export {OptimizeFor} from './src/ngtsc/typecheck/api';

setFileSystem(new NodeJSFileSystem());
