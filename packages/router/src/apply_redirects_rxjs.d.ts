/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadedRouterConfig, RedirectFunction, Route } from './models';
import { ActivatedRouteSnapshot } from './router_state';
import { Params } from './shared';
import { UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree } from './url_tree';
export declare class NoMatch {
    segmentGroup: UrlSegmentGroup | null;
    constructor(segmentGroup?: UrlSegmentGroup);
}
export declare class AbsoluteRedirect extends Error {
    urlTree: UrlTree;
    constructor(urlTree: UrlTree);
}
export declare function noMatch(segmentGroup: UrlSegmentGroup): Observable<any>;
export declare function absoluteRedirect(newTree: UrlTree): Observable<any>;
export declare function namedOutletsRedirect(redirectTo: string): Observable<any>;
export declare function canLoadFails(route: Route): Observable<LoadedRouterConfig>;
export declare class ApplyRedirects {
    private urlSerializer;
    private urlTree;
    constructor(urlSerializer: UrlSerializer, urlTree: UrlTree);
    lineralizeSegments(route: Route, urlTree: UrlTree): Observable<UrlSegment[]>;
    applyRedirectCommands(segments: UrlSegment[], redirectTo: string | RedirectFunction, posParams: {
        [k: string]: UrlSegment;
    }, currentSnapshot: ActivatedRouteSnapshot, injector: Injector): Observable<UrlTree>;
    applyRedirectCreateUrlTree(redirectTo: string, urlTree: UrlTree, segments: UrlSegment[], posParams: {
        [k: string]: UrlSegment;
    }): UrlTree;
    createQueryParams(redirectToParams: Params, actualParams: Params): Params;
    createSegmentGroup(redirectTo: string, group: UrlSegmentGroup, segments: UrlSegment[], posParams: {
        [k: string]: UrlSegment;
    }): UrlSegmentGroup;
    createSegments(redirectTo: string, redirectToSegments: UrlSegment[], actualSegments: UrlSegment[], posParams: {
        [k: string]: UrlSegment;
    }): UrlSegment[];
    findPosParam(redirectTo: string, redirectToUrlSegment: UrlSegment, posParams: {
        [k: string]: UrlSegment;
    }): UrlSegment;
    findOrReturn(redirectToUrlSegment: UrlSegment, actualSegments: UrlSegment[]): UrlSegment;
}
