/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '../metadata';

import {depsTracker} from './deps_tracker/deps_tracker';
import {ComponentType, DependencyTypeList} from './interfaces/definition';

export function ɵɵgetComponentDepsFactory(
    type: ComponentType<any>, rawImports?: Component['imports']): () => DependencyTypeList {
  return () => {
    return depsTracker.getComponentDependencies(type, rawImports).dependencies;
  };
}
