/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {depsTracker} from './deps_tracker/deps_tracker';
import {
  ComponentType,
  DependencyTypeList,
  RawScopeInfoFromDecorator,
} from './interfaces/definition';

export function ɵɵgetComponentDepsFactory(
  type: ComponentType<any>,
  rawImports?: RawScopeInfoFromDecorator[],
): () => DependencyTypeList {
  return () => {
    try {
      return depsTracker.getComponentDependencies(type, rawImports).dependencies;
    } catch (e) {
      console.error(
        `Computing dependencies in local compilation mode for the component "${type.name}" failed with the exception:`,
        e,
      );
      throw e;
    }
  };
}
