/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Route} from '../config';
import {defaultUrlMatcher, PRIMARY_OUTLET} from '../shared';
import {UrlSegment, UrlSegmentGroup} from '../url_tree';

import {forEach} from './collection';
import {getOutlet} from './config';

export interface MatchResult {
  matched: boolean;
  consumedSegments: UrlSegment[];
  lastChild: number;
  parameters: {[k: string]: string};
  positionalParamSegments: {[k: string]: UrlSegment};
}

const noMatch: MatchResult = {
  matched: false,
  consumedSegments: [],
  lastChild: 0,
  parameters: {},
  positionalParamSegments: {}
};

export function match(
    segmentGroup: UrlSegmentGroup, route: Route, segments: UrlSegment[]): MatchResult {
  if (route.path === '') {
    if (route.pathMatch === 'full' && (segmentGroup.hasChildren() || segments.length > 0)) {
      return {...noMatch};
    }

    return {
      matched: true,
      consumedSegments: [],
      lastChild: 0,
      parameters: {},
      positionalParamSegments: {}
    };
  }

  const matcher = route.matcher || defaultUrlMatcher;
  const res = matcher(segments, segmentGroup, route);
  if (!res) return {...noMatch};

  const posParams: {[n: string]: string} = {};
  forEach(res.posParams!, (v: UrlSegment, k: string) => {
    posParams[k] = v.path;
  });
  const parameters = res.consumed.length > 0 ?
      {...posParams, ...res.consumed[res.consumed.length - 1].parameters} :
      posParams;

  return {
    matched: true,
    consumedSegments: res.consumed,
    lastChild: res.consumed.length,
    // TODO(atscott): investigate combining parameters and positionalParamSegments
    parameters,
    positionalParamSegments: res.posParams ?? {}
  };
}

export function split(
    segmentGroup: UrlSegmentGroup, consumedSegments: UrlSegment[], slicedSegments: UrlSegment[],
    config: Route[], relativeLinkResolution: 'legacy'|'corrected' = 'corrected') {
  if (slicedSegments.length > 0 &&
      containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, config)) {
    const s = new UrlSegmentGroup(
        consumedSegments,
        createChildrenForEmptyPaths(
            segmentGroup, consumedSegments, config,
            new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
    s._sourceSegment = segmentGroup;
    s._segmentIndexShift = consumedSegments.length;
    return {segmentGroup: s, slicedSegments: []};
  }

  if (slicedSegments.length === 0 &&
      containsEmptyPathMatches(segmentGroup, slicedSegments, config)) {
    const s = new UrlSegmentGroup(
        segmentGroup.segments,
        addEmptyPathsToChildrenIfNeeded(
            segmentGroup, consumedSegments, slicedSegments, config, segmentGroup.children,
            relativeLinkResolution));
    s._sourceSegment = segmentGroup;
    s._segmentIndexShift = consumedSegments.length;
    return {segmentGroup: s, slicedSegments};
  }

  const s = new UrlSegmentGroup(segmentGroup.segments, segmentGroup.children);
  s._sourceSegment = segmentGroup;
  s._segmentIndexShift = consumedSegments.length;
  return {segmentGroup: s, slicedSegments};
}

function addEmptyPathsToChildrenIfNeeded(
    segmentGroup: UrlSegmentGroup, consumedSegments: UrlSegment[], slicedSegments: UrlSegment[],
    routes: Route[], children: {[name: string]: UrlSegmentGroup},
    relativeLinkResolution: 'legacy'|'corrected'): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  for (const r of routes) {
    if (emptyPathMatch(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
      const s = new UrlSegmentGroup([], {});
      s._sourceSegment = segmentGroup;
      if (relativeLinkResolution === 'legacy') {
        s._segmentIndexShift = segmentGroup.segments.length;
      } else {
        s._segmentIndexShift = consumedSegments.length;
      }
      res[getOutlet(r)] = s;
    }
  }
  return {...children, ...res};
}

function createChildrenForEmptyPaths(
    segmentGroup: UrlSegmentGroup, consumedSegments: UrlSegment[], routes: Route[],
    primarySegment: UrlSegmentGroup): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  res[PRIMARY_OUTLET] = primarySegment;
  primarySegment._sourceSegment = segmentGroup;
  primarySegment._segmentIndexShift = consumedSegments.length;

  for (const r of routes) {
    if (r.path === '' && getOutlet(r) !== PRIMARY_OUTLET) {
      const s = new UrlSegmentGroup([], {});
      s._sourceSegment = segmentGroup;
      s._segmentIndexShift = consumedSegments.length;
      res[getOutlet(r)] = s;
    }
  }
  return res;
}

function containsEmptyPathMatchesWithNamedOutlets(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[]): boolean {
  return routes.some(
      r => emptyPathMatch(segmentGroup, slicedSegments, r) && getOutlet(r) !== PRIMARY_OUTLET);
}

function containsEmptyPathMatches(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[]): boolean {
  return routes.some(r => emptyPathMatch(segmentGroup, slicedSegments, r));
}

function emptyPathMatch(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], r: Route): boolean {
  if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === 'full') {
    return false;
  }

  return r.path === '';
}

/**
 * Determines if `route` is a path match for the `rawSegment`, `segments`, and `outlet` without
 * verifying that its children are a full match for the remainder of the `rawSegment` children as
 * well.
 */
export function isImmediateMatch(
    route: Route, rawSegment: UrlSegmentGroup, segments: UrlSegment[], outlet: string): boolean {
  // We allow matches to empty paths when the outlets differ so we can match a url like `/(b:b)` to
  // a config like
  // * `{path: '', children: [{path: 'b', outlet: 'b'}]}`
  // or even
  // * `{path: '', outlet: 'a', children: [{path: 'b', outlet: 'b'}]`
  //
  // The exception here is when the segment outlet is for the primary outlet. This would
  // result in a match inside the named outlet because all children there are written as primary
  // outlets. So we need to prevent child named outlet matches in a url like `/b` in a config like
  // * `{path: '', outlet: 'x' children: [{path: 'b'}]}`
  // This should only match if the url is `/(x:b)`.
  if (getOutlet(route) !== outlet &&
      (outlet === PRIMARY_OUTLET || !emptyPathMatch(rawSegment, segments, route))) {
    return false;
  }
  if (route.path === '**') {
    return true;
  }
  return match(rawSegment, route, segments).matched;
}

export function noLeftoversInUrl(
    segmentGroup: UrlSegmentGroup, segments: UrlSegment[], outlet: string): boolean {
  return segments.length === 0 && !segmentGroup.children[outlet];
}
