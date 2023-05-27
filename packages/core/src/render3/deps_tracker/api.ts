/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../core';
import {NgModuleScopeInfoFromDecorator} from '../interfaces/definition';

/**
 * Represents the set of dependencies of a type in a certain context.
 *
 * The absence of dependencies field indicates that calculating this scope somehow was not
 * successful. Consumers should interpret this as empty dependencies. The reason for this error is
 * displayed as an error message in the console as per JIT behavior today. In addition to that, in
 * local compilation the other build/compilations run in parallel with local compilation may (or may
 * not) reveal some details about the error as well.
 */
interface ScopeData {
  dependencies?: Type<any>[];
}

/** Represents scope data for NgModule as calculated during runtime by the deps tracker. */
export interface NgModuleScope {
  compilation: ScopeData;
  exported: ScopeData;
}

/**
 * Represents scope data for standalone component as calculated during runtime by the deps tracker.
 */
export interface StandaloneComponentScope {
  compilation: ScopeData;
}

/** Component dependencies info as calculated during runtime by the deps tracker. */
export interface ComponentDependencies {
  dependencies: Type<any>[];
}

/**
 * Public API for runtime deps tracker (RDT).
 *
 * All downstream tools should only use these methods.
 */
export interface DepsTrackerApi {
  /**
   * Computes the component dependencies, i.e., a set of components/directive/pipes that could be
   * present in the component's template (This set might contain directives/components/pipes not
   * necessarily used in the component's template depending on the implementation).
   *
   * The implementation is expected to use some caching mechanism in order to optimize the resources
   * needed to do this computation.
   */
  getComponentDependencies(cmp: Type<any>): ComponentDependencies;

  /**
   * Registers an NgModule into the tracker with the given scope info.
   *
   * This method should be called for every NgModule whether it is compiled in local mode or not.
   * This is needed in order to compute component's dependencies as some dependencies might be in
   * different compilation units with different compilation mode.
   */
  registerNgModule(type: Type<any>, scopeInfo: NgModuleScopeInfoFromDecorator): void;
}
