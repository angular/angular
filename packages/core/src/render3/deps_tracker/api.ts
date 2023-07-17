/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../core';
import {NgModuleType} from '../../metadata/ng_module_def';
import {ComponentType, DependencyTypeList, DirectiveTypeList, NgModuleScopeInfoFromDecorator, PipeTypeList} from '../interfaces/definition';

/**
 * Represents the set of dependencies of a type in a certain context.
 */
interface ScopeData {
  pipes: PipeTypeList;
  directives: DirectiveTypeList;

  /**
   * If true it indicates that calculating this scope somehow was not successful. The consumers
   * should interpret this as empty dependencies. The application of this flag is when calculating
   * scope recursively, the presence of this flag in a scope dependency implies that the scope is
   * also poisoned and thus we can return immediately without having to continue the recursion. The
   * reason for this error is displayed as an error message in the console as per JIT behavior
   * today. In addition to that, in local compilation the other build/compilations run in parallel
   * with local compilation may or may not reveal some details about the error as well.
   */
  isPoisoned?: boolean;
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
  dependencies: DependencyTypeList;
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
  getComponentDependencies(cmp: ComponentType<any>): ComponentDependencies;

  /**
   * Registers an NgModule into the tracker with the given scope info.
   *
   * This method should be called for every NgModule whether it is compiled in local mode or not.
   * This is needed in order to compute component's dependencies as some dependencies might be in
   * different compilation units with different compilation mode.
   */
  registerNgModule(type: Type<any>, scopeInfo: NgModuleScopeInfoFromDecorator): void;

  /**
   * Clears the scope cache for NgModule or standalone component. This will force re-calculation of
   * the scope, which could be an expensive operation as it involves aggregating transitive closure.
   *
   * The main application of this method is for test beds where we want to clear the cache to
   * enforce scope update after overriding.
   */
  clearScopeCacheFor(type: ComponentType<any>|NgModuleType): void;

  /**
   * Returns the scope of NgModule. Mainly to be used by JIT and test bed.
   *
   * The scope value here is memoized. To enforce a new calculation bust the cache by using
   * `clearScopeCacheFor` method.
   */
  getNgModuleScope(type: NgModuleType<any>): NgModuleScope;

  /**
   * Returns the scope of standalone component. Mainly to be used by JIT.
   *
   * The scope value here is memoized. To enforce a new calculation bust the cache by using
   * `clearScopeCacheFor` method.
   */
  getStandaloneComponentScope(type: ComponentType<any>, imports: Type<any>[]):
      StandaloneComponentScope;
}
