/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {Observable, Observer, of } from 'rxjs';

import {Data, ResolveData, Route, Routes} from './config';
import {ActivatedRouteSnapshot, ParamsInheritanceStrategy, RouterStateSnapshot, inheritedParamsDataResolve} from './router_state';
import {PRIMARY_OUTLET, defaultUrlMatcher} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlTree, mapChildrenIntoArray} from './url_tree';
import {forEach, last} from './utils/collection';
import {TreeNode} from './utils/tree';

class NoMatch {}

export function recognize(
    rootComponentType: Type<any>| null, config: Routes, urlTree: UrlTree, url: string,
    paramsInheritanceStrategy: ParamsInheritanceStrategy = 'emptyOnly',
    relativeLinkResolution: 'legacy' | 'corrected' = 'legacy'): Observable<RouterStateSnapshot> {
  return new Recognizer(
             rootComponentType, config, urlTree, url, paramsInheritanceStrategy,
             relativeLinkResolution)
      .recognize();
}

class Recognizer {
  constructor(
      private rootComponentType: Type<any>|null, private config: Routes, private urlTree: UrlTree,
      private url: string, private paramsInheritanceStrategy: ParamsInheritanceStrategy,
      private relativeLinkResolution: 'legacy'|'corrected') {}

  recognize(): Observable<RouterStateSnapshot> {
    try {
      const rootSegmentGroup =
          split(this.urlTree.root, [], [], this.config, this.relativeLinkResolution).segmentGroup;

      const children = this.processSegmentGroup(this.config, rootSegmentGroup, PRIMARY_OUTLET);

      const root = new ActivatedRouteSnapshot(
          [], Object.freeze({}), Object.freeze({...this.urlTree.queryParams}),
          this.urlTree.fragment !, {}, PRIMARY_OUTLET, this.rootComponentType, null,
          this.urlTree.root, -1, {});

      const rootNode = new TreeNode<ActivatedRouteSnapshot>(root, children);
      const routeState = new RouterStateSnapshot(this.url, rootNode);
      this.inheritParamsAndData(routeState._root);
      return of (routeState);

    } catch (e) {
      return new Observable<RouterStateSnapshot>(
          (obs: Observer<RouterStateSnapshot>) => obs.error(e));
    }
  }

  inheritParamsAndData(routeNode: TreeNode<ActivatedRouteSnapshot>): void {
    const route = routeNode.value;

    const i = inheritedParamsDataResolve(route, this.paramsInheritanceStrategy);
    route.params = Object.freeze(i.params);
    route.data = Object.freeze(i.data);

    routeNode.children.forEach(n => this.inheritParamsAndData(n));
  }

  processSegmentGroup(config: Route[], segmentGroup: UrlSegmentGroup, outlet: string):
      TreeNode<ActivatedRouteSnapshot>[] {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.processChildren(config, segmentGroup);
    }

    return this.processSegment(config, segmentGroup, segmentGroup.segments, outlet);
  }

  processChildren(config: Route[], segmentGroup: UrlSegmentGroup):
      TreeNode<ActivatedRouteSnapshot>[] {
    const children = mapChildrenIntoArray(
        segmentGroup, (child, childOutlet) => this.processSegmentGroup(config, child, childOutlet));
    checkOutletNameUniqueness(children);
    sortActivatedRouteSnapshots(children);
    return children;
  }

  processSegment(
      config: Route[], segmentGroup: UrlSegmentGroup, segments: UrlSegment[],
      outlet: string): TreeNode<ActivatedRouteSnapshot>[] {
    for (const r of config) {
      try {
        return this.processSegmentAgainstRoute(r, segmentGroup, segments, outlet);
      } catch (e) {
        if (!(e instanceof NoMatch)) throw e;
      }
    }
    if (this.noLeftoversInUrl(segmentGroup, segments, outlet)) {
      return [];
    }

    throw new NoMatch();
  }

  private noLeftoversInUrl(segmentGroup: UrlSegmentGroup, segments: UrlSegment[], outlet: string):
      boolean {
    return segments.length === 0 && !segmentGroup.children[outlet];
  }

  processSegmentAgainstRoute(
      route: Route, rawSegment: UrlSegmentGroup, segments: UrlSegment[],
      outlet: string): TreeNode<ActivatedRouteSnapshot>[] {
    if (route.redirectTo) throw new NoMatch();

    if ((route.outlet || PRIMARY_OUTLET) !== outlet) throw new NoMatch();

    let snapshot: ActivatedRouteSnapshot;
    let consumedSegments: UrlSegment[] = [];
    let rawSlicedSegments: UrlSegment[] = [];

    if (route.path === '**') {
      const params = segments.length > 0 ? last(segments) !.parameters : {};
      snapshot = new ActivatedRouteSnapshot(
          segments, params, Object.freeze({...this.urlTree.queryParams}), this.urlTree.fragment !,
          getData(route), outlet, route.component !, route, getSourceSegmentGroup(rawSegment),
          getPathIndexShift(rawSegment) + segments.length, getResolve(route));
    } else {
      const result: MatchResult = match(rawSegment, route, segments);
      consumedSegments = result.consumedSegments;
      rawSlicedSegments = segments.slice(result.lastChild);

      snapshot = new ActivatedRouteSnapshot(
          consumedSegments, result.parameters, Object.freeze({...this.urlTree.queryParams}),
          this.urlTree.fragment !, getData(route), outlet, route.component !, route,
          getSourceSegmentGroup(rawSegment),
          getPathIndexShift(rawSegment) + consumedSegments.length, getResolve(route));
    }

    const childConfig: Route[] = getChildConfig(route);

    const {segmentGroup, slicedSegments} = split(
        rawSegment, consumedSegments, rawSlicedSegments, childConfig, this.relativeLinkResolution);

    if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
      const children = this.processChildren(childConfig, segmentGroup);
      return [new TreeNode<ActivatedRouteSnapshot>(snapshot, children)];
    }

    if (childConfig.length === 0 && slicedSegments.length === 0) {
      return [new TreeNode<ActivatedRouteSnapshot>(snapshot, [])];
    }

    const children = this.processSegment(childConfig, segmentGroup, slicedSegments, PRIMARY_OUTLET);
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
    return route._loadedConfig !.routes;
  }

  return [];
}

interface MatchResult {
  consumedSegments: UrlSegment[];
  lastChild: number;
  parameters: any;
}

function match(segmentGroup: UrlSegmentGroup, route: Route, segments: UrlSegment[]): MatchResult {
  if (route.path === '') {
    if (route.pathMatch === 'full' && (segmentGroup.hasChildren() || segments.length > 0)) {
      throw new NoMatch();
    }

    return {consumedSegments: [], lastChild: 0, parameters: {}};
  }

  const matcher = route.matcher || defaultUrlMatcher;
  const res = matcher(segments, segmentGroup, route);
  if (!res) throw new NoMatch();

  const posParams: {[n: string]: string} = {};
  forEach(res.posParams !, (v: UrlSegment, k: string) => { posParams[k] = v.path; });
  const parameters = res.consumed.length > 0 ?
      {...posParams, ...res.consumed[res.consumed.length - 1].parameters} :
      posParams;

  return {consumedSegments: res.consumed, lastChild: res.consumed.length, parameters};
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
    config: Route[], relativeLinkResolution: 'legacy' | 'corrected') {
  if (slicedSegments.length > 0 &&
      containsEmptyPathMatchesWithNamedOutlets(segmentGroup, slicedSegments, config)) {
    const s = new UrlSegmentGroup(
        consumedSegments, createChildrenForEmptyPaths(
                              segmentGroup, consumedSegments, config,
                              new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
    s._sourceSegment = segmentGroup;
    s._segmentIndexShift = consumedSegments.length;
    return {segmentGroup: s, slicedSegments: []};
  }

  if (slicedSegments.length === 0 &&
      containsEmptyPathMatches(segmentGroup, slicedSegments, config)) {
    const s = new UrlSegmentGroup(
        segmentGroup.segments, addEmptyPathsToChildrenIfNeeded(
                                   segmentGroup, consumedSegments, slicedSegments, config,
                                   segmentGroup.children, relativeLinkResolution));
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
    relativeLinkResolution: 'legacy' | 'corrected'): {[name: string]: UrlSegmentGroup} {
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

function getOutlet(route: Route): string {
  return route.outlet || PRIMARY_OUTLET;
}

function getData(route: Route): Data {
  return route.data || {};
}

function getResolve(route: Route): ResolveData {
  return route.resolve || {};
}
