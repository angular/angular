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

export * from './src/metadata';
export * from './src/transformers/api';
export * from './src/transformers/entry_points';

export * from './src/perform_compile';
export * from './src/tooling';

// TODO(tbosch): remove this once usages in G3 are changed to `CompilerOptions`
export {CompilerOptions as AngularCompilerOptions} from './src/transformers/api';

export {ngToTsDiagnostic} from './src/transformers/util';
export {NgTscPlugin} from './src/ngtsc/tsc_plugin';
export {NgtscProgram} from './src/ngtsc/program';

setFileSystem(new NodeJSFileSystem());
