/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {
  ComponentScopeKind,
  ComponentScopeReader,
  ExportScope,
  LocalModuleScope,
  ScopeData,
  StandaloneScope,
  ComponentScope,
} from './src/api';
export {CompoundComponentScopeReader} from './src/component_scope';
export {DtsModuleScopeResolver, MetadataDtsModuleScopeResolver} from './src/dependency';
export {DeclarationData, LocalModuleScopeRegistry, LocalNgModuleData} from './src/local';
export {SelectorlessComponentScopeReader} from './src/selectorless_scope';
export {TypeCheckScope, TypeCheckScopeRegistry} from './src/typecheck';
export {makeNotStandaloneDiagnostic, makeUnknownComponentImportDiagnostic} from './src/util';
