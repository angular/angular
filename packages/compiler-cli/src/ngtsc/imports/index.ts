/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {AliasingHost, AliasStrategy, PrivateExportAliasingHost, UnifiedModulesAliasingHost} from './src/alias';
export {ImportRewriter, NoopImportRewriter, R3SymbolsImportRewriter, validateAndRewriteCoreSymbol} from './src/core';
export {DefaultImportTracker} from './src/default';
export {AbsoluteModuleStrategy, assertSuccessfulReferenceEmit, EmittedReference, FailedEmitResult, ImportedFile, ImportFlags, LocalIdentifierStrategy, LogicalProjectStrategy, ReferenceEmitKind, ReferenceEmitResult, ReferenceEmitStrategy, ReferenceEmitter, RelativePathStrategy, UnifiedModulesStrategy} from './src/emitter';
export {isAliasImportDeclaration, loadIsReferencedAliasDeclarationPatch} from './src/patch_alias_reference_resolution';
export {Reexport} from './src/reexport';
export {OwningModule, Reference} from './src/references';
export {ModuleResolver} from './src/resolver';
