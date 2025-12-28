/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Export runtime classes from alias; do not re-export the `AliasingHost` interface
// which is type-only and causes ESM runtime export errors.
export {
  AliasingHost,
  AliasStrategy,
  PrivateExportAliasingHost,
  UnifiedModulesAliasingHost,
} from './src/alias';
export {
  ImportRewriter,
  NoopImportRewriter,
  R3SymbolsImportRewriter,
  validateAndRewriteCoreSymbol,
} from './src/core';
export {DefaultImportTracker} from './src/default';
export {DeferredSymbolTracker} from './src/deferred_symbol_tracker';
export {
  ImportFlags,
  ImportedFile,
  ReferenceEmitKind,
  ReferenceEmitStrategy,
  EmittedReference,
  FailedEmitResult,
  assertSuccessfulReferenceEmit,
  ReferenceEmitter,
  LocalIdentifierStrategy,
  AbsoluteModuleStrategy,
  LogicalProjectStrategy,
  RelativePathStrategy,
  UnifiedModulesStrategy,
} from './src/emitter';
export {ImportedSymbolsTracker} from './src/imported_symbols_tracker';
export {LocalCompilationExtraImportsTracker} from './src/local_compilation_extra_imports_tracker';
export {
  isAliasImportDeclaration,
  loadIsReferencedAliasDeclarationPatch,
} from './src/patch_alias_reference_resolution';
export type {AliasImportDeclaration} from './src/patch_alias_reference_resolution';
export {OwningModule, Reference} from './src/references';
export {Reexport} from './src/reexport';
export {ModuleResolver} from './src/resolver';
