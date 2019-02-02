/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {ImportRewriter, NoopImportRewriter, R3SymbolsImportRewriter, validateAndRewriteCoreSymbol} from './src/core';
export {AbsoluteModuleStrategy, FileToModuleHost, FileToModuleStrategy, LocalIdentifierStrategy, LogicalProjectStrategy, ReferenceEmitStrategy, ReferenceEmitter} from './src/emitter';
export {ImportMode, OwningModule, Reference} from './src/references';
export {ModuleResolver} from './src/resolver';
