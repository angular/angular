/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {depsTracker} from './deps_tracker/deps_tracker';
import {getComponentDef} from './def_getters';
import {
  ComponentType,
  DependencyTypeList,
  QualifiedDependencyType,
  RawScopeInfoFromDecorator,
} from './interfaces/definition';

export function ɵɵgetComponentDepsFactory(
  type: ComponentType<any>,
  rawImports?: RawScopeInfoFromDecorator[],
  qualifiedImports?: QualifiedDependencyType[],
): () => DependencyTypeList {
  return () => {
    try {
      const dependencies = depsTracker.getComponentDependencies(type, rawImports).dependencies;
      if (qualifiedImports === undefined || qualifiedImports.length === 0) {
        return dependencies;
      }

      const qualifiedNames = new Map<unknown, string[]>();
      for (const qualifiedImport of qualifiedImports) {
        if (getComponentDef(qualifiedImport.type) === null) {
          continue;
        }

        const names = qualifiedNames.get(qualifiedImport.type) ?? [];
        names.push(...qualifiedImport.qualifiedNames);
        qualifiedNames.set(qualifiedImport.type, names);
      }

      return dependencies.map((dependency) => {
        const names = qualifiedNames.get(dependency);
        return names === undefined ? dependency : {type: dependency, qualifiedNames: names};
      });
    } catch (e) {
      console.error(
        `Computing dependencies in local compilation mode for the component "${type.name}" failed with the exception:`,
        e,
      );
      throw e;
    }
  };
}
