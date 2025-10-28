/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {Route} from '../models';
import {runCanMatchGuards} from '../operators/check_guards';
import {defaultUrlMatcher, PRIMARY_OUTLET} from '../shared';
import {UrlSegment, UrlSegmentGroup, UrlSerializer} from '../url_tree';

import {last} from './collection';
import {getOrCreateRouteInjectorIfNeeded, getOutlet} from './config';

export interface MatchResult {
  matched: boolean;
  consumedSegments: UrlSegment[];
  remainingSegments: UrlSegment[];
  parameters: {[k: string]: string};
  positionalParamSegments: {[k: string]: UrlSegment};
}

const noMatch: MatchResult = {
  matched: false,
  consumedSegments: [],
  remainingSegments: [],
  parameters: {},
  positionalParamSegments: {},
};

export function matchWithChecks(
  segmentGroup: UrlSegmentGroup,
  route: Route,
  segments: UrlSegment[],
  injector: EnvironmentInjector,
  urlSerializer: UrlSerializer,
  abortSignal?: AbortSignal,
): Observable<MatchResult> {
  const result = match(segmentGroup, route, segments);
  if (!result.matched) {
    return of(result);
  }

  // Only create the Route's `EnvironmentInjector` if it matches the attempted
  // navigation
  injector = getOrCreateRouteInjectorIfNeeded(route, injector);
  return runCanMatchGuards(injector, route, segments, urlSerializer, abortSignal).pipe(
    map((v) => (v === true ? result : {...noMatch})),
  );
}

export function match(
  segmentGroup: UrlSegmentGroup,
  route: Route,
  segments: UrlSegment[],
): MatchResult {
  if (route.path === '**') {
    return createWildcardMatchResult(segments);
  }

  if (route.path === '') {
    if (route.pathMatch === 'full' && (segmentGroup.hasChildren() || segments.length > 0)) {
      return {...noMatch};
    }

    return {
      matched: true,
      consumedSegments: [],
      remainingSegments: segments,
      parameters: {},
      positionalParamSegments: {},
    };
  }

  const matcher = route.matcher || defaultUrlMatcher;
  const res = matcher(segments, segmentGroup, route);
  if (!res) return {...noMatch};

  const posParams: {[n: string]: string} = {};
  Object.entries(res.posParams ?? {}).forEach(([k, v]) => {
    posParams[k] = v.path;
  });
  const parameters =
    res.consumed.length > 0
      ? {...posParams, ...res.consumed[res.consumed.length - 1].parameters}
      : posParams;

  return {
    matched: true,
    consumedSegments: res.consumed,
    remainingSegments: segments.slice(res.consumed.length),
    // TODO(atscott): investigate combining parameters and positionalParamSegments
    parameters,
    positionalParamSegments: res.posParams ?? {},
  };
}

function createWildcardMatchResult(segments: UrlSegment[]): MatchResult {
  return {
    matched: true,
    parameters: segments.length > 0 ? last(segments)!.parameters : {},
    consumedSegments: segments,
    remainingSegments: [],
    positionalParamSegments: {},
  };
}

export function split(
  segmentGroup: UrlSegmentGroup,
  consumedSegments: UrlSegment[],
  slicedSegments: UrlSegment[],
  config: Route[],
): {
  segmentGroup: UrlSegmentGroup;
  slicedSegments: UrlSegment[];
} {
  if (
    slicedSegments.length > 0 &&
    containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, config)
  ) {
    const s = new UrlSegmentGroup(
      consumedSegments,
      createChildrenForEmptyPaths(
        config,
        new UrlSegmentGroup(slicedSegments, segmentGroup.children),
      ),
    );
    return {segmentGroup: s, slicedSegments: []};
  }

  if (
    slicedSegments.length === 0 &&
    containsEmptyPathMatches(segmentGroup, slicedSegments, config)
  ) {
    const s = new UrlSegmentGroup(
      segmentGroup.segments,
      addEmptyPathsToChildrenIfNeeded(segmentGroup, slicedSegments, config, segmentGroup.children),
    );
    return {segmentGroup: s, slicedSegments};
  }

  const s = new UrlSegmentGroup(segmentGroup.segments, segmentGroup.children);
  return {segmentGroup: s, slicedSegments};
}

function addEmptyPathsToChildrenIfNeeded(
  segmentGroup: UrlSegmentGroup,
  slicedSegments: UrlSegment[],
  routes: Route[],
  children: {[name: string]: UrlSegmentGroup},
): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  for (const r of routes) {
    if (emptyPathMatch(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
      const s = new UrlSegmentGroup([], {});
      res[getOutlet(r)] = s;
    }
  }
  return {...children, ...res};
}

function createChildrenForEmptyPaths(
  routes: Route[],
  primarySegment: UrlSegmentGroup,
): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  res[PRIMARY_OUTLET] = primarySegment;

  for (const r of routes) {
    if (r.path === '' && getOutlet(r) !== PRIMARY_OUTLET) {
      const s = new UrlSegmentGroup([], {});
      res[getOutlet(r)] = s;
    }
  }
  return res;
}

function containsEmptyPathMatchesWithNamedOutlets(
  segmentGroup: UrlSegmentGroup,
  slicedSegments: UrlSegment[],
  routes: Route[],
): boolean {
  return routes.some(
    (r) => emptyPathMatch(segmentGroup, slicedSegments, r) && getOutlet(r) !== PRIMARY_OUTLET,
  );
}

function containsEmptyPathMatches(
  segmentGroup: UrlSegmentGroup,
  slicedSegments: UrlSegment[],
  routes: Route[],
): boolean {
  return routes.some((r) => emptyPathMatch(segmentGroup, slicedSegments, r));
}

export function emptyPathMatch(
  segmentGroup: UrlSegmentGroup,
  slicedSegments: UrlSegment[],
  r: Route,
): boolean {
  if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === 'full') {
    return false;
  }

  return r.path === '';
}

export function noLeftoversInUrl(
  segmentGroup: UrlSegmentGroup,
  segments: UrlSegment[],
  outlet: string,
): boolean {
  return segments.length === 0 && !segmentGroup.children[outlet];
}
