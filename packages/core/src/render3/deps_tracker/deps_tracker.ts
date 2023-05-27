/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';
import {NgModuleType} from '../../metadata/ng_module_def';
import {ComponentType, NgModuleScopeInfoFromDecorator} from '../interfaces/definition';

import {ComponentDependencies, DepsTrackerApi, NgModuleScope, StandaloneComponentScope} from './api';

/**
 * An implementation of DepsTrackerApi which will be used for JIT and local compilation.
 */
class DepsTracker implements DepsTrackerApi {
  private ownerNgModule = new Map<ComponentType<any>, NgModuleType<any>>();
  private ngModulesScopeCache = new Map<NgModuleType<any>, NgModuleScope>();
  private standaloneComponentsScopeCache = new Map<NgModuleType<any>, StandaloneComponentScope>();

  /** @override */
  getComponentDependencies(cmp: Type<any>): ComponentDependencies {
    // TODO: implement this.
    return {dependencies: []};
  }

  /** @override */
  registerNgModule(type: Type<any>, scopeInfo: NgModuleScopeInfoFromDecorator): void {}

  /** The main deps calculation takes place here. */
  private getNgModuleScope(m: NgModuleType<any>): NgModuleScope {
    // TODO: implement this.
    return {exported: {}, compilation: {}};
  }
}

/** The deps tracker to be used in the current Angular app in dev mode. */
export const depsTracker = new DepsTracker();
