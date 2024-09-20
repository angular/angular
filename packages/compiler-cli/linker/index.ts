/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export {AstHost, Range} from './src/ast/ast_host';
export {assert} from './src/ast/utils';
export {FatalLinkerError, isFatalLinkerError} from './src/fatal_linker_error';
export {DeclarationScope} from './src/file_linker/declaration_scope';
export {FileLinker} from './src/file_linker/file_linker';
export {LinkerEnvironment} from './src/file_linker/linker_environment';
export {DEFAULT_LINKER_OPTIONS, LinkerOptions} from './src/file_linker/linker_options';
export {needsLinking} from './src/file_linker/needs_linking';
