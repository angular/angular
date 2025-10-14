/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { Route, Routes } from './models';
import { RouterConfigLoader } from './router_config_loader';
import { ActivatedRouteSnapshot, ParamsInheritanceStrategy, RouterStateSnapshot } from './router_state';
import { UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree } from './url_tree';
import { TreeNode } from './utils/tree';
/**
 * Class used to indicate there were no additional route config matches but that all segments of
 * the URL were consumed during matching so the route was URL matched. When this happens, we still
 * try to match child configs in case there are empty path children.
 */
declare class NoLeftoversInUrl {
}
export declare function recognize(injector: EnvironmentInjector, configLoader: RouterConfigLoader, rootComponentType: Type<any> | null, config: Routes, urlTree: UrlTree, urlSerializer: UrlSerializer, paramsInheritanceStrategy: ParamsInheritanceStrategy | undefined, abortSignal: AbortSignal): Observable<{
    state: RouterStateSnapshot;
    tree: UrlTree;
}>;
export declare class Recognizer {
    private injector;
    private configLoader;
    private rootComponentType;
    private config;
    private urlTree;
    private paramsInheritanceStrategy;
    private readonly urlSerializer;
    private applyRedirects;
    private absoluteRedirectCount;
    allowRedirects: boolean;
    constructor(injector: EnvironmentInjector, configLoader: RouterConfigLoader, rootComponentType: Type<any> | null, config: Routes, urlTree: UrlTree, paramsInheritanceStrategy: ParamsInheritanceStrategy, urlSerializer: UrlSerializer);
    private noMatchError;
    recognize(): Observable<{
        state: RouterStateSnapshot;
        tree: UrlTree;
    }>;
    private match;
    processSegmentGroup(injector: EnvironmentInjector, config: Route[], segmentGroup: UrlSegmentGroup, outlet: string, parentRoute: ActivatedRouteSnapshot): Observable<TreeNode<ActivatedRouteSnapshot>[]>;
    /**
     * Matches every child outlet in the `segmentGroup` to a `Route` in the config. Returns `null` if
     * we cannot find a match for _any_ of the children.
     *
     * @param config - The `Routes` to match against
     * @param segmentGroup - The `UrlSegmentGroup` whose children need to be matched against the
     *     config.
     */
    processChildren(injector: EnvironmentInjector, config: Route[], segmentGroup: UrlSegmentGroup, parentRoute: ActivatedRouteSnapshot): Observable<TreeNode<ActivatedRouteSnapshot>[]>;
    processSegment(injector: EnvironmentInjector, routes: Route[], segmentGroup: UrlSegmentGroup, segments: UrlSegment[], outlet: string, allowRedirects: boolean, parentRoute: ActivatedRouteSnapshot): Observable<TreeNode<ActivatedRouteSnapshot> | NoLeftoversInUrl>;
    processSegmentAgainstRoute(injector: EnvironmentInjector, routes: Route[], route: Route, rawSegment: UrlSegmentGroup, segments: UrlSegment[], outlet: string, allowRedirects: boolean, parentRoute: ActivatedRouteSnapshot): Observable<TreeNode<ActivatedRouteSnapshot> | NoLeftoversInUrl>;
    private expandSegmentAgainstRouteUsingRedirect;
    matchSegmentAgainstRoute(injector: EnvironmentInjector, rawSegment: UrlSegmentGroup, route: Route, segments: UrlSegment[], outlet: string, parentRoute: ActivatedRouteSnapshot): Observable<TreeNode<ActivatedRouteSnapshot>>;
    private getChildConfig;
}
export {};
