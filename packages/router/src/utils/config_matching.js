/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {of} from 'rxjs';
import {map} from 'rxjs/operators';
import {runCanMatchGuards} from '../operators/check_guards';
import {defaultUrlMatcher, PRIMARY_OUTLET} from '../shared';
import {UrlSegmentGroup} from '../url_tree';
import {last} from './collection';
import {getOrCreateRouteInjectorIfNeeded, getOutlet} from './config';
const noMatch = {
  matched: false,
  consumedSegments: [],
  remainingSegments: [],
  parameters: {},
  positionalParamSegments: {},
};
export function matchWithChecks(
  segmentGroup,
  route,
  segments,
  injector,
  urlSerializer,
  abortSignal,
) {
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
export function match(segmentGroup, route, segments) {
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
  const posParams = {};
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
function createWildcardMatchResult(segments) {
  return {
    matched: true,
    parameters: segments.length > 0 ? last(segments).parameters : {},
    consumedSegments: segments,
    remainingSegments: [],
    positionalParamSegments: {},
  };
}
export function split(segmentGroup, consumedSegments, slicedSegments, config) {
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
function addEmptyPathsToChildrenIfNeeded(segmentGroup, slicedSegments, routes, children) {
  const res = {};
  for (const r of routes) {
    if (emptyPathMatch(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
      const s = new UrlSegmentGroup([], {});
      res[getOutlet(r)] = s;
    }
  }
  return {...children, ...res};
}
function createChildrenForEmptyPaths(routes, primarySegment) {
  const res = {};
  res[PRIMARY_OUTLET] = primarySegment;
  for (const r of routes) {
    if (r.path === '' && getOutlet(r) !== PRIMARY_OUTLET) {
      const s = new UrlSegmentGroup([], {});
      res[getOutlet(r)] = s;
    }
  }
  return res;
}
function containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, routes) {
  return routes.some(
    (r) => emptyPathMatch(segmentGroup, slicedSegments, r) && getOutlet(r) !== PRIMARY_OUTLET,
  );
}
function containsEmptyPathMatches(segmentGroup, slicedSegments, routes) {
  return routes.some((r) => emptyPathMatch(segmentGroup, slicedSegments, r));
}
export function emptyPathMatch(segmentGroup, slicedSegments, r) {
  if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === 'full') {
    return false;
  }
  return r.path === '';
}
export function noLeftoversInUrl(segmentGroup, segments, outlet) {
  return segments.length === 0 && !segmentGroup.children[outlet];
}
//# sourceMappingURL=config_matching.js.map
