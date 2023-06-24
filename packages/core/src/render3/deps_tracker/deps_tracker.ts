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
  private standaloneComponentsScopeCache = new Map<ComponentType<any>, StandaloneComponentScope>();

  /** @override */
  getComponentDependencies(cmp: ComponentType<any>): ComponentDependencies {
    // TODO: implement this.
    return {dependencies: []};
  }

  /** @override */
  registerNgModule(type: Type<any>, scopeInfo: NgModuleScopeInfoFromDecorator): void {
    // TODO: implement this.
  }

  /** @override */
  clearScopeCacheFor(type: ComponentType<any>|NgModuleType): void {
    // TODO: implement this.
  }

  /** @override */
  getNgModuleScope(type: NgModuleType<any>): NgModuleScope {
    // TODO: implement this.
    return {exported: {directives: [], pipes: []}, compilation: {directives: [], pipes: []}};
  }

  /** @override */
  getStandaloneComponentScope(type: ComponentType<any>, imports: Type<any>[]):
      StandaloneComponentScope {
    // TODO: implement this.
    return {compilation: {directives: [], pipes: []}};
  }
}

/** The deps tracker to be used in the current Angular app in dev mode. */
export const depsTracker = new DepsTracker();
