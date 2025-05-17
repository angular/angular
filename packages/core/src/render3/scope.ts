/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isForwardRef, resolveForwardRef} from '../di/forward_ref';
import {Type} from '../interface/type';
import {flatten} from '../util/array_utils';
import {noSideEffects} from '../util/closure';
import {EMPTY_ARRAY} from '../util/empty';
import {getNgModuleDefOrThrow, getPipeDef} from './def_getters';

import {extractDefListOrFactory, extractDirectiveDef} from './definition';
import {depsTracker} from './deps_tracker/deps_tracker';
import {
  ComponentDef,
  ComponentType,
  NgModuleScopeInfoFromDecorator,
  RawScopeInfoFromDecorator,
} from './interfaces/definition';
import {isModuleWithProviders} from './jit/util';

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
  type: ComponentType<any>,
  directives: Type<any>[] | (() => Type<any>[]),
  pipes: Type<any>[] | (() => Type<any>[]),
): void {
  const def = type.ɵcmp as ComponentDef<any>;
  def.directiveDefs = extractDefListOrFactory(directives, extractDirectiveDef);
  def.pipeDefs = extractDefListOrFactory(pipes, getPipeDef);
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
    const ngModuleDef = getNgModuleDefOrThrow(type);
    ngModuleDef.declarations = convertToTypeArray(scope.declarations || EMPTY_ARRAY);
    ngModuleDef.imports = convertToTypeArray(scope.imports || EMPTY_ARRAY);
    ngModuleDef.exports = convertToTypeArray(scope.exports || EMPTY_ARRAY);

    if (scope.bootstrap) {
      // This only happens in local compilation mode.
      ngModuleDef.bootstrap = convertToTypeArray(scope.bootstrap);
    }

    depsTracker.registerNgModule(type, scope);
  });
}

function convertToTypeArray(
  values: Type<any>[] | (() => Type<any>[]) | RawScopeInfoFromDecorator[],
): Type<any>[] | (() => Type<any>[]) {
  if (typeof values === 'function') {
    return values;
  }

  const flattenValues = flatten(values);

  if (flattenValues.some(isForwardRef)) {
    return () => flattenValues.map(resolveForwardRef).map(maybeUnwrapModuleWithProviders);
  } else {
    return flattenValues.map(maybeUnwrapModuleWithProviders);
  }
}

function maybeUnwrapModuleWithProviders(value: any): Type<any> {
  return isModuleWithProviders(value) ? value.ngModule : (value as Type<any>);
}
