/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {noSideEffects} from '../util/closure';
import {EMPTY_ARRAY} from '../util/empty';

import {extractDefListOrFactory, getNgModuleDef} from './definition';
import {ComponentDef, ComponentType, NgModuleScopeInfoFromDecorator} from './interfaces/definition';

/**
 * Generated next to NgModules to monkey-patch directive and pipe references onto a component's
 * definition, when generating a direct reference in the component file would otherwise create an
 * import cycle.
 *
 * See [this explanation](https://hackmd.io/Odw80D0pR6yfsOjg_7XCJg?view) for more details.
 *
 * @codeGenApi
 */
export function ɵɵsetComponentScope(
    type: ComponentType<any>, directives: Type<any>[]|(() => Type<any>[]),
    pipes: Type<any>[]|(() => Type<any>[])): void {
  const def = type.ɵcmp as ComponentDef<any>;
  def.directiveDefs = extractDefListOrFactory(directives, /* pipeDef */ false);
  def.pipeDefs = extractDefListOrFactory(pipes, /* pipeDef */ true);
}

/**
 * Adds the module metadata that is necessary to compute the module's transitive scope to an
 * existing module definition.
 *
 * Scope metadata of modules is not used in production builds, so calls to this function can be
 * marked pure to tree-shake it from the bundle, allowing for all referenced declarations
 * to become eligible for tree-shaking as well.
 *
 * @codeGenApi
 */
export function ɵɵsetNgModuleScope(type: any, scope: NgModuleScopeInfoFromDecorator): unknown {
  return noSideEffects(() => {
    const ngModuleDef = getNgModuleDef(type, true);
    ngModuleDef.declarations = scope.declarations || EMPTY_ARRAY;
    ngModuleDef.imports = scope.imports || EMPTY_ARRAY;
    ngModuleDef.exports = scope.exports || EMPTY_ARRAY;
  });
}
