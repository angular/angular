/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../../interface/type';
import { NgModuleType } from '../../metadata/ng_module_def';
import type { ComponentType, NgModuleScopeInfoFromDecorator, RawScopeInfoFromDecorator } from '../interfaces/definition';
import { ComponentDependencies, DepsTrackerApi, NgModuleScope, StandaloneComponentScope } from './api';
/**
 * An implementation of DepsTrackerApi which will be used for JIT and local compilation.
 */
declare class DepsTracker implements DepsTrackerApi {
    private ownerNgModule;
    private ngModulesWithSomeUnresolvedDecls;
    private ngModulesScopeCache;
    private standaloneComponentsScopeCache;
    /**
     * Attempts to resolve ng module's forward ref declarations as much as possible and add them to
     * the `ownerNgModule` map. This method normally should be called after the initial parsing when
     * all the forward refs are resolved (e.g., when trying to render a component)
     */
    private resolveNgModulesDecls;
    /** @override */
    getComponentDependencies(type: ComponentType<any>, rawImports?: RawScopeInfoFromDecorator[]): ComponentDependencies;
    /**
     * @override
     * This implementation does not make use of param scopeInfo since it assumes the scope info is
     * already added to the type itself through methods like {@link ɵɵsetNgModuleScope}
     */
    registerNgModule(type: Type<any>, scopeInfo: NgModuleScopeInfoFromDecorator): void;
    /** @override */
    clearScopeCacheFor(type: Type<any>): void;
    /** @override */
    getNgModuleScope(type: NgModuleType<any>): NgModuleScope;
    /** Compute NgModule scope afresh. */
    private computeNgModuleScope;
    /** @override */
    getStandaloneComponentScope(type: ComponentType<any>, rawImports?: RawScopeInfoFromDecorator[]): StandaloneComponentScope;
    private computeStandaloneComponentScope;
    /** @override */
    isOrphanComponent(cmp: Type<any>): boolean;
}
/** The deps tracker to be used in the current Angular app in dev mode. */
export declare const depsTracker: DepsTracker;
export declare const TEST_ONLY: {
    DepsTracker: typeof DepsTracker;
};
export {};
