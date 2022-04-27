/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {AliasingHost, AliasStrategy, PrivateExportAliasingHost, UnifiedModulesAliasingHost} from './src/alias.js';
export {ImportRewriter, NoopImportRewriter, R3SymbolsImportRewriter, validateAndRewriteCoreSymbol} from './src/core.js';
export {DefaultImportTracker} from './src/default.js';
export {AbsoluteModuleStrategy, assertSuccessfulReferenceEmit, EmittedReference, FailedEmitResult, ImportedFile, ImportFlags, LocalIdentifierStrategy, LogicalProjectStrategy, ReferenceEmitKind, ReferenceEmitResult, ReferenceEmitStrategy, ReferenceEmitter, RelativePathStrategy, UnifiedModulesStrategy} from './src/emitter.js';
export {Reexport} from './src/reexport.js';
export {OwningModule, Reference} from './src/references.js';
export {ModuleResolver} from './src/resolver.js';
