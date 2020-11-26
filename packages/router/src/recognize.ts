/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {Observable, Observer, of} from 'rxjs';

import {Data, ResolveData, Route, Routes} from './config';
import {ActivatedRouteSnapshot, inheritedParamsDataResolve, ParamsInheritanceStrategy, RouterStateSnapshot} from './router_state';
import {defaultUrlMatcher, PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlTree} from './url_tree';
import {forEach, last} from './utils/collection';
import {getOutlet} from './utils/config';
import {TreeNode} from './utils/tree';

class NoMatch {}

function newObservableError(e: unknown): Observable<RouterStateSnapshot> {
  // TODO(atscott): This pattern is used throughout the router code and can be `throwError` instead.
  return new Observable<RouterStateSnapshot>((obs: Observer<RouterStateSnapshot>) => obs.error(e));
}

export function recognize(
    rootComponentType: Type<any>|null, config: Routes, urlTree: UrlTree, url: string,
    paramsInheritanceStrategy: ParamsInheritanceStrategy = 'emptyOnly',
    relativeLinkResolution: 'legacy'|'corrected' = 'legacy'): Observable<RouterStateSnapshot> {
  try {
    const result = new Recognizer(
                       rootComponentType, config, urlTree, url, paramsInheritanceStrategy,
                       relativeLinkResolution)
                       .recognize();
    if (result === null) {
      return newObservableError(new NoMatch());
    } else {
      return of(result);
    }
  } catch (e) {
    // Catch the potential error from recognize due to duplicate outlet matches and return as an
    // `Observable` error instead.
    return newObservableError(e);
  }
}

export class Recognizer {
  constructor(
      private rootComponentType: Type<any>|null, private config: Routes, private urlTree: UrlTree,
      private url: string, private paramsInheritanceStrategy: ParamsInheritanceStrategy,
      private relativeLinkResolution: 'legacy'|'corrected') {}

  recognize(): RouterStateSnapshot|null {
    const rootSegmentGroup =
        split(this.urlTree.root, [], [], this.config, this.relativeLinkResolution).segmentGroup;

    const children = this.processSegmentGroup(this.config, rootSegmentGroup, PRIMARY_OUTLET);
    if (children === null) {
      return null;
    }

    const root = new ActivatedRouteSnapshot(
        [], Object.freeze({}), Object.freeze({...this.urlTree.queryParams}), this.urlTree.fragment!,
        {}, PRIMARY_OUTLET, this.rootComponentType, null, this.urlTree.root, -1, {});

    const rootNode = new TreeNode<ActivatedRouteSnapshot>(root, children);
    const routeState = new RouterStateSnapshot(this.url, rootNode);
    this.inheritParamsAndData(routeState._root);
    return routeState;
  }

  inheritParamsAndData(routeNode: TreeNode<ActivatedRouteSnapshot>): void {
    const route = routeNode.value;

    const i = inheritedParamsDataResolve(route, this.paramsInheritanceStrategy);
    route.params = Object.freeze(i.params);
    route.data = Object.freeze(i.data);

    routeNode.children.forEach(n => this.inheritParamsAndData(n));
  }

  processSegmentGroup(config: Route[], segmentGroup: UrlSegmentGroup, outlet: string):
      TreeNode<ActivatedRouteSnapshot>[]|null {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.processChildren(config, segmentGroup);
    }

    return this.processSegment(config, segmentGroup, segmentGroup.segments, outlet);
  }

  /**
   * Matches every child outlet in the `segmentGroup` to a `Route` in the config. Returns `null` if
   * we cannot find a match for _any_ of the children.
   *
   * @param config - The `Routes` to match against
   * @param segmentGroup - The `UrlSegmentGroup` whose children need to be matched against the
   *     config.
   */
  processChildren(config: Route[], segmentGroup: UrlSegmentGroup):
      TreeNode<ActivatedRouteSnapshot>[]|null {
    const children: Array<TreeNode<ActivatedRouteSnapshot>> = [];
    for (const childOutlet of Object.keys(segmentGroup.children)) {
      const child = segmentGroup.children[childOutlet];
      // Sort the config so that routes with outlets that match the one being activated appear
      // first, followed by routes for other outlets, which might match if they have an empty path.
      const sortedConfig = config.filter(r => getOutlet(r) === childOutlet);
      sortedConfig.push(...config.filter(r => getOutlet(r) !== childOutlet));
      const outletChildren = this.processSegmentGroup(sortedConfig, child, childOutlet);
      if (outletChildren === null) {
        // Configs must match all segment children so because we did not find a match for this
        // outlet, return `null`.
        return null;
      }
      children.push(...outletChildren);
    }
    // Because we may have matched two outlets to the same empty path segment, we can have multiple
    // activated results for the same outlet. We should merge the children of these results so the
    // final return value is only one `TreeNode` per outlet.
    const mergedChildren = mergeEmptyPathMatches(children);
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      // This should really never happen - we are only taking the first match for each outlet and
      // merge the empty path matches.
      checkOutletNameUniqueness(mergedChildren);
    }
    sortActivatedRouteSnapshots(mergedChildren);
    return mergedChildren;
  }

  processSegment(
      config: Route[], segmentGroup: UrlSegmentGroup, segments: UrlSegment[],
      outlet: string): TreeNode<ActivatedRouteSnapshot>[]|null {
    for (const r of config) {
      const children = this.processSegmentAgainstRoute(r, segmentGroup, segments, outlet);
      if (children !== null) {
        return children;
      }
    }
    if (this.noLeftoversInUrl(segmentGroup, segments, outlet)) {
      return [];
    }

    return null;
  }

  private noLeftoversInUrl(segmentGroup: UrlSegmentGroup, segments: UrlSegment[], outlet: string):
      boolean {
    return segments.length === 0 && !segmentGroup.children[outlet];
  }

  processSegmentAgainstRoute(
      route: Route, rawSegment: UrlSegmentGroup, segments: UrlSegment[],
      outlet: string): TreeNode<ActivatedRouteSnapshot>[]|null {
    if (!isImmediateMatch(route, rawSegment, segments, outlet)) return null;

    let snapshot: ActivatedRouteSnapshot;
    let consumedSegments: UrlSegment[] = [];
    let rawSlicedSegments: UrlSegment[] = [];

    if (route.path === '**') {
      const params = segments.length > 0 ? last(segments)!.parameters : {};
      snapshot = new ActivatedRouteSnapshot(
          segments, params, Object.freeze({...this.urlTree.queryParams}), this.urlTree.fragment!,
          getData(route), getOutlet(route), route.component!, route,
          getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + segments.length,
          getResolve(route));
    } else {
      const result: MatchResult|null = match(rawSegment, route, segments);
      if (result === null) {
        return null;
      }
      consumedSegments = result.consumedSegments;
      rawSlicedSegments = segments.slice(result.lastChild);

      snapshot = new ActivatedRouteSnapshot(
          consumedSegments, result.parameters, Object.freeze({...this.urlTree.queryParams}),
          this.urlTree.fragment!, getData(route), getOutlet(route), route.component!, route,
          getSourceSegmentGroup(rawSegment),
          getPathIndexShift(rawSegment) + consumedSegments.length, getResolve(route));
    }

    const childConfig: Route[] = getChildConfig(route);

    const {segmentGroup, slicedSegments} = split(
        rawSegment, consumedSegments, rawSlicedSegments, childConfig, this.relativeLinkResolution);

    if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
      const children = this.processChildren(childConfig, segmentGroup);
      if (children === null) {
        return null;
      }
      return [new TreeNode<ActivatedRouteSnapshot>(snapshot, children)];
    }

    if (childConfig.length === 0 && slicedSegments.length === 0) {
      return [new TreeNode<ActivatedRouteSnapshot>(snapshot, [])];
    }

    const matchedOnOutlet = getOutlet(route) === outlet;
    // If we matched a config due to empty path match on a different outlet, we need to continue
    // passing the current outlet for the segment rather than switch to PRIMARY.
    // Note that we switch to primary when we have a match because outlet configs look like this:
    // {path: 'a', outlet: 'a', children: [
    //  {path: 'b', component: B},
    //  {path: 'c', component: C},
    // ]}
    // Notice that the children of the named outlet are configured with the primary outlet
    const children = this.processSegment(
        childConfig, segmentGroup, slicedSegments, matchedOnOutlet ? PRIMARY_OUTLET : outlet);
    if (children === null) {
      return null;
    }
    return [new TreeNode<ActivatedRouteSnapshot>(snapshot, children)];
  }
}

function sortActivatedRouteSnapshots(nodes: TreeNode<ActivatedRouteSnapshot>[]): void {
  nodes.sort((a, b) => {
    if (a.value.outlet === PRIMARY_OUTLET) return -1;
    if (b.value.outlet === PRIMARY_OUTLET) return 1;
    return a.value.outlet.localeCompare(b.value.outlet);
  });
}

function getChildConfig(route: Route): Route[] {
  if (route.children) {
    return route.children;
  }

  if (route.loadChildren) {
    return route._loadedConfig!.routes;
  }

  return [];
}

interface MatchResult {
  consumedSegments: UrlSegment[];
  lastChild: number;
  parameters: any;
}

function match(segmentGroup: UrlSegmentGroup, route: Route, segments: UrlSegment[]): MatchResult|
    null {
  if (route.path === '') {
    if (route.pathMatch === 'full' && (segmentGroup.hasChildren() || segments.length > 0)) {
      return null;
    }

    return {consumedSegments: [], lastChild: 0, parameters: {}};
  }

  const matcher = route.matcher || defaultUrlMatcher;
  const res = matcher(segments, segmentGroup, route);
  if (!res) return null;

  const posParams: {[n: string]: string} = {};
  forEach(res.posParams!, (v: UrlSegment, k: string) => {
    posParams[k] = v.path;
  });
  const parameters = res.consumed.length > 0 ?
      {...posParams, ...res.consumed[res.consumed.length - 1].parameters} :
      posParams;

  return {consumedSegments: res.consumed, lastChild: res.consumed.length, parameters};
}

/**
 * Finds `TreeNode`s with matching empty path route configs and merges them into `TreeNode` with the
 * children from each duplicate. This is necessary because different outlets can match a single
 * empty path route config and the results need to then be merged.
 */
function mergeEmptyPathMatches(nodes: Array<TreeNode<ActivatedRouteSnapshot>>):
    Array<TreeNode<ActivatedRouteSnapshot>> {
  const result: Array<TreeNode<ActivatedRouteSnapshot>> = [];

  function hasEmptyConfig(node: TreeNode<ActivatedRouteSnapshot>) {
    const config = node.value.routeConfig;
    return config && config.path === '' && config.redirectTo === undefined;
  }

  for (const node of nodes) {
    if (!hasEmptyConfig(node)) {
      result.push(node);
      continue;
    }

    const duplicateEmptyPathNode =
        result.find(resultNode => node.value.routeConfig === resultNode.value.routeConfig);
    if (duplicateEmptyPathNode !== undefined) {
      duplicateEmptyPathNode.children.push(...node.children);
    } else {
      result.push(node);
    }
  }
  return result;
}

function checkOutletNameUniqueness(nodes: TreeNode<ActivatedRouteSnapshot>[]): void {
  const names: {[k: string]: ActivatedRouteSnapshot} = {};
  nodes.forEach(n => {
    const routeWithSameOutletName = names[n.value.outlet];
    if (routeWithSameOutletName) {
      const p = routeWithSameOutletName.url.map(s => s.toString()).join('/');
      const c = n.value.url.map(s => s.toString()).join('/');
      throw new Error(`Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
    }
    names[n.value.outlet] = n.value;
  });
}

function getSourceSegmentGroup(segmentGroup: UrlSegmentGroup): UrlSegmentGroup {
  let s = segmentGroup;
  while (s._sourceSegment) {
    s = s._sourceSegment;
  }
  return s;
}

function getPathIndexShift(segmentGroup: UrlSegmentGroup): number {
  let s = segmentGroup;
  let res = (s._segmentIndexShift ? s._segmentIndexShift : 0);
  while (s._sourceSegment) {
    s = s._sourceSegment;
    res += (s._segmentIndexShift ? s._segmentIndexShift : 0);
  }
  return res - 1;
}

function split(
    segmentGroup: UrlSegmentGroup, consumedSegments: UrlSegment[], slicedSegments: UrlSegment[],
    config: Route[], relativeLinkResolution: 'legacy'|'corrected') {
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

  return r.path === '' && r.redirectTo === undefined;
}

function getData(route: Route): Data {
  return route.data || {};
}

function getResolve(route: Route): ResolveData {
  return route.resolve || {};
}

/**
 * Determines if `route` is a path match for the `rawSegment`, `segments`, and `outlet` without
 * verifying that its children are a full match for the remainder of the `rawSegment` children as
 * well.
 */
function isImmediateMatch(
    route: Route, rawSegment: UrlSegmentGroup, segments: UrlSegment[], outlet: string): boolean {
  if (route.redirectTo) {
    return false;
  }
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
  } else {
    return match(rawSegment, route, segments) !== null;
  }
}
