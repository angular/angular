/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {AliasGenerator, AliasStrategy} from './src/alias';
export {ImportRewriter, NoopImportRewriter, R3SymbolsImportRewriter, validateAndRewriteCoreSymbol} from './src/core';
export {DefaultImportRecorder, DefaultImportTracker, NOOP_DEFAULT_IMPORT_RECORDER} from './src/default';
export {AbsoluteModuleStrategy, FileToModuleHost, FileToModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, ReferenceEmitStrategy, ReferenceEmitter} from './src/emitter';
export {Reexport} from './src/reexport';
export {ImportMode, OwningModule, Reference} from './src/references';
export {ModuleResolver} from './src/resolver';
