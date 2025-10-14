/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector } from '@angular/core';
import { Observable } from 'rxjs';
import { Route } from '../models';
import { UrlSegment, UrlSegmentGroup, UrlSerializer } from '../url_tree';
export interface MatchResult {
    matched: boolean;
    consumedSegments: UrlSegment[];
    remainingSegments: UrlSegment[];
    parameters: {
        [k: string]: string;
    };
    positionalParamSegments: {
        [k: string]: UrlSegment;
    };
}
export declare function matchWithChecks(segmentGroup: UrlSegmentGroup, route: Route, segments: UrlSegment[], injector: EnvironmentInjector, urlSerializer: UrlSerializer, abortSignal?: AbortSignal): Observable<MatchResult>;
export declare function match(segmentGroup: UrlSegmentGroup, route: Route, segments: UrlSegment[]): MatchResult;
export declare function split(segmentGroup: UrlSegmentGroup, consumedSegments: UrlSegment[], slicedSegments: UrlSegment[], config: Route[]): {
    segmentGroup: UrlSegmentGroup;
    slicedSegments: UrlSegment[];
};
export declare function emptyPathMatch(segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], r: Route): boolean;
export declare function noLeftoversInUrl(segmentGroup: UrlSegmentGroup, segments: UrlSegment[], outlet: string): boolean;
