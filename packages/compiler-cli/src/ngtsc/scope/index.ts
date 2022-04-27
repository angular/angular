/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {ComponentScopeKind, ComponentScopeReader, ExportScope, LocalModuleScope, ScopeData, StandaloneScope} from './src/api.js';
export {CompoundComponentScopeReader} from './src/component_scope.js';
export {DtsModuleScopeResolver, MetadataDtsModuleScopeResolver} from './src/dependency.js';
export {DeclarationData, LocalModuleScopeRegistry, LocalNgModuleData} from './src/local.js';
export {TypeCheckScope, TypeCheckScopeRegistry} from './src/typecheck.js';
export {makeNotStandaloneDiagnostic, makeUnknownComponentImportDiagnostic} from './src/util.js';
