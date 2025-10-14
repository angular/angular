/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export {AliasStrategy, PrivateExportAliasingHost, UnifiedModulesAliasingHost} from './src/alias';
export {
  NoopImportRewriter,
  R3SymbolsImportRewriter,
  validateAndRewriteCoreSymbol,
} from './src/core';
export {DefaultImportTracker} from './src/default';
export {DeferredSymbolTracker} from './src/deferred_symbol_tracker';
export {
  AbsoluteModuleStrategy,
  assertSuccessfulReferenceEmit,
  ImportFlags,
  LocalIdentifierStrategy,
  LogicalProjectStrategy,
  ReferenceEmitKind,
  ReferenceEmitter,
  RelativePathStrategy,
  UnifiedModulesStrategy,
} from './src/emitter';
export {ImportedSymbolsTracker} from './src/imported_symbols_tracker';
export {LocalCompilationExtraImportsTracker} from './src/local_compilation_extra_imports_tracker';
export {
  isAliasImportDeclaration,
  loadIsReferencedAliasDeclarationPatch,
} from './src/patch_alias_reference_resolution';
export {Reference} from './src/references';
export {ModuleResolver} from './src/resolver';
//# sourceMappingURL=index.js.map
