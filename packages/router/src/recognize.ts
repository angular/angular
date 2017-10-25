/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {of} from 'rxjs/observable/of';

import {Data, ResolveData, Route, Routes} from './config';
import {RouteSnapshot, inheritedParamsDataResolve} from './router_state';
import {defaultUrlMatcher, PRIMARY_OUTLET} from './shared';
import {mapChildrenIntoArray, UrlSegment, UrlSegmentGroup, UrlTree} from './url_tree';
import {forEach, last} from './utils/collection';
import {TreeNode} from './utils/tree';

class NoMatch {}

export function recognize(
    rootComponentType: Type<any>| null, config: Routes, urlTree: UrlTree,
    url: string): Observable<TreeNode<RouteSnapshot>> {
  return new Recognizer(config, urlTree, url).recognize();
}

class Recognizer {
  constructor(
      private config: Routes, private urlTree: UrlTree,
      private url: string) {}

  recognize(): Observable<TreeNode<RouteSnapshot>> {
    try {
      const rootSegmentGroup = split(this.urlTree.root, [], [], this.config).segmentGroup;

      const children = this.processSegmentGroup(this.config, rootSegmentGroup, PRIMARY_OUTLET, []);

      const root: RouteSnapshot = {
        url: [],
        params: Object.freeze({}),
        queryParams: Object.freeze(this.urlTree.queryParams),
        fragment: this.urlTree.fragment !,
        data: {},
        outlet: PRIMARY_OUTLET,
        configPath: [],
        urlTreeAddress: {urlSegmentGroupPath: [], urlSegmentIndex: -1}
      };

      const rootNode = {value: root, children};
      this.inheritParamsAndData(rootNode, rootNode);
      return of (rootNode);

    } catch (e) {
      return new Observable<TreeNode<RouteSnapshot>>(
          (obs: Observer<TreeNode<RouteSnapshot>>) => obs.error(e));
    }
  }

  inheritParamsAndData(root: TreeNode<RouteSnapshot>, routeNode: TreeNode<RouteSnapshot>): void {
    const route = routeNode.value;
  
    const i = inheritedParamsDataResolve(root, route, this.config);
    route.params = Object.freeze(i.params);
    route.data = Object.freeze(i.data);
  
    routeNode.children.forEach(n => this.inheritParamsAndData(root, n));
  }

  processSegmentGroup(config: Route[], segmentGroup: UrlSegmentGroup, outlet: string, configPath: number[]):
      TreeNode<RouteSnapshot>[] {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.processChildren(config, segmentGroup, configPath);
    }

    return this.processSegment(config, segmentGroup, segmentGroup.segments, outlet, configPath);
  }

  processChildren(config: Route[], segmentGroup: UrlSegmentGroup, configPath: number[]):
      TreeNode<RouteSnapshot>[] {
    const children = mapChildrenIntoArray(
        segmentGroup, (child, childOutlet) => this.processSegmentGroup(config, child, childOutlet, configPath));
    checkOutletNameUniqueness(children);
    sortActivatedRouteSnapshots(children);
    return children;
  }

  processSegment(
      config: Route[], segmentGroup: UrlSegmentGroup, segments: UrlSegment[],
      outlet: string, configPath: number[]): TreeNode<RouteSnapshot>[] {
    for (let i = 0; i < config.length; ++i) {
      const r = config[i];
      try {
        return this.processSegmentAgainstRoute(r, segmentGroup, segments, outlet, [...configPath, i]);
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
      route: Route, rawSegmentGroup: UrlSegmentGroup, segments: UrlSegment[],
      outlet: string, configPath: number[]): TreeNode<RouteSnapshot>[] {
    if (route.redirectTo) throw new NoMatch();

    if ((route.outlet || PRIMARY_OUTLET) !== outlet) throw new NoMatch();

    if (route.path === '**') {
      const urlSegmentGroupPath = getUrlSegmentGroupPath(getSourceSegmentGroup(rawSegmentGroup));
      const urlSegmentIndex = getPathIndexShift(rawSegmentGroup) + segments.length;
      const params = segments.length > 0 ? last(segments) !.parameters : {};
      const snapshot = {
        url: segments, // TODO: vsavkin covert it to POJO?
        params: Object.freeze(params),
        queryParams: Object.freeze(this.urlTree.queryParams),
        fragment: this.urlTree.fragment !,
        data: getData(route),
        outlet,
        configPath,
        urlTreeAddress: {urlSegmentGroupPath, urlSegmentIndex}
      };

      return [{value: snapshot, children: []}];
    }

    const {consumedSegments, parameters, lastChild} = match(rawSegmentGroup, route, segments);
    const rawSlicedSegments = segments.slice(lastChild);
    const childConfig = getChildConfig(route);

    const {segmentGroup, slicedSegments} =
        split(rawSegmentGroup, consumedSegments, rawSlicedSegments, childConfig);

    const urlSegmentGroupPath = getUrlSegmentGroupPath(getSourceSegmentGroup(rawSegmentGroup));

    const s = getSourceSegmentGroup(rawSegmentGroup);
    const urlSegmentIndex = getPathIndexShift(rawSegmentGroup) + consumedSegments.length;

    const snapshot = {
      url: consumedSegments, // TODO: vsavkin convert it to POJO?
      params: Object.freeze(parameters),
      queryParams: Object.freeze(this.urlTree.queryParams),
      fragment: this.urlTree.fragment !,
      data: getData(route),
      outlet,
      configPath,
      urlTreeAddress: {urlSegmentGroupPath, urlSegmentIndex}
    };

    if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
      const children = this.processChildren(childConfig, segmentGroup, configPath);
      return [{value: snapshot, children}];
    }

    if (childConfig.length === 0 && slicedSegments.length === 0) {
      return [{value: snapshot, children: []}];
    }

    const children = this.processSegment(childConfig, segmentGroup, slicedSegments, PRIMARY_OUTLET, configPath);
    return [{value: snapshot, children}];
  }
}

function getUrlSegmentGroupPath(g: UrlSegmentGroup): string[] {
  if (g.parent) {
    const p = getSourceSegmentGroup(g.parent);
    for(let k in p.children) {
      if (p.children[k] === g) {
        return [...getUrlSegmentGroupPath(p), k];
      }
    }
    throw new Error('should not happen');
  } else {
    return [];
  }
}

function sortActivatedRouteSnapshots(nodes: TreeNode<RouteSnapshot>[]): void {
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

function match(segmentGroup: UrlSegmentGroup, route: Route, segments: UrlSegment[]) {
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

function checkOutletNameUniqueness(nodes: TreeNode<RouteSnapshot>[]): void {
  const names: {[k: string]: RouteSnapshot} = {};
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
    config: Route[]) {
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
                                   segmentGroup, slicedSegments, config, segmentGroup.children));
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
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[],
    children: {[name: string]: UrlSegmentGroup}): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  for (const r of routes) {
    if (emptyPathMatch(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
      const s = new UrlSegmentGroup([], {});
      s._sourceSegment = segmentGroup;
      s._segmentIndexShift = segmentGroup.segments.length;
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
