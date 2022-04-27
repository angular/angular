/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export {AstHost, Range} from './src/ast/ast_host.js';
export {assert} from './src/ast/utils.js';
export {FatalLinkerError, isFatalLinkerError} from './src/fatal_linker_error.js';
export {DeclarationScope} from './src/file_linker/declaration_scope.js';
export {FileLinker} from './src/file_linker/file_linker.js';
export {LinkerEnvironment} from './src/file_linker/linker_environment.js';
export {DEFAULT_LINKER_OPTIONS, LinkerOptions} from './src/file_linker/linker_options.js';
export {needsLinking} from './src/file_linker/needs_linking.js';
