/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getComponentDef} from './definition';
import {depsTracker} from './deps_tracker/deps_tracker';
import {ComponentType, DependencyTypeList} from './interfaces/definition';
import {TypeWithMetadata} from './metadata';

export function ɵɵgetComponentDepsFactory(type: TypeWithMetadata): () => DependencyTypeList {
  return () => {
    console.log('>>>>> ɵɵgetComponentDepsFactory factory called', type);

    const def = getComponentDef(type);
    if (!def) return [];

    if (def.standalone) {
      return depsTracker
          .getComponentDependencies(
              type as ComponentType<any>, type.decorators?.[0]?.args?.[0]?.imports)
          .dependencies;
    } else {
      return depsTracker.getComponentDependencies(type as ComponentType<any>).dependencies;
    }
  };
}
