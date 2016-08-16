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
import {of } from 'rxjs/observable/of';

import {Data, ResolveData, Route, Routes} from './config';
import {ActivatedRouteSnapshot, InheritedResolve, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET, Params} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlTree, mapChildrenIntoArray} from './url_tree';
import {last, merge} from './utils/collection';
import {TreeNode} from './utils/tree';

class NoMatch {}

class InheritedFromParent {
  constructor(
      public parent: InheritedFromParent, public snapshot: ActivatedRouteSnapshot,
      public params: Params, public data: Data, public resolve: InheritedResolve) {}

  get allParams(): Params {
    return this.parent ? merge(this.parent.allParams, this.params) : this.params;
  }

  get allData(): Data { return this.parent ? merge(this.parent.allData, this.data) : this.data; }

  static empty(snapshot: ActivatedRouteSnapshot): InheritedFromParent {
    return new InheritedFromParent(null, snapshot, {}, {}, new InheritedResolve(null, {}));
  }
}

export function recognize(
    rootComponentType: Type<any>, config: Routes, urlTree: UrlTree,
    url: string): Observable<RouterStateSnapshot> {
  return new Recognizer(rootComponentType, config, urlTree, url).recognize();
}

class Recognizer {
  constructor(
      private rootComponentType: Type<any>, private config: Routes, private urlTree: UrlTree,
      private url: string) {}

  recognize(): Observable<RouterStateSnapshot> {
    try {
      const rootSegmentGroup = split(this.urlTree.root, [], [], this.config).segmentGroup;

      const children = this.processSegmentGroup(
          this.config, rootSegmentGroup, InheritedFromParent.empty(null), PRIMARY_OUTLET);

      const root = new ActivatedRouteSnapshot(
          [], Object.freeze({}), Object.freeze(this.urlTree.queryParams), this.urlTree.fragment, {},
          PRIMARY_OUTLET, this.rootComponentType, null, this.urlTree.root, -1,
          InheritedResolve.empty);

      const rootNode = new TreeNode<ActivatedRouteSnapshot>(root, children);

      return of (new RouterStateSnapshot(this.url, rootNode));

    } catch (e) {
      return new Observable<RouterStateSnapshot>(
          (obs: Observer<RouterStateSnapshot>) => obs.error(e));
    }
  }


  processSegmentGroup(
      config: Route[], segmentGroup: UrlSegmentGroup, inherited: InheritedFromParent,
      outlet: string): TreeNode<ActivatedRouteSnapshot>[] {
    if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
      return this.processChildren(config, segmentGroup, inherited);
    } else {
      return this.processSegment(config, segmentGroup, 0, segmentGroup.segments, inherited, outlet);
    }
  }

  processChildren(config: Route[], segmentGroup: UrlSegmentGroup, inherited: InheritedFromParent):
      TreeNode<ActivatedRouteSnapshot>[] {
    const children = mapChildrenIntoArray(
        segmentGroup,
        (child, childOutlet) => this.processSegmentGroup(config, child, inherited, childOutlet));
    checkOutletNameUniqueness(children);
    sortActivatedRouteSnapshots(children);
    return children;
  }

  processSegment(
      config: Route[], segmentGroup: UrlSegmentGroup, pathIndex: number, segments: UrlSegment[],
      inherited: InheritedFromParent, outlet: string): TreeNode<ActivatedRouteSnapshot>[] {
    for (let r of config) {
      try {
        return this.processSegmentAgainstRoute(
            r, segmentGroup, pathIndex, segments, inherited, outlet);
      } catch (e) {
        if (!(e instanceof NoMatch)) throw e;
      }
    }
    throw new NoMatch();
  }

  processSegmentAgainstRoute(
      route: Route, rawSegment: UrlSegmentGroup, pathIndex: number, segments: UrlSegment[],
      inherited: InheritedFromParent, outlet: string): TreeNode<ActivatedRouteSnapshot>[] {
    if (route.redirectTo) throw new NoMatch();

    if ((route.outlet ? route.outlet : PRIMARY_OUTLET) !== outlet) throw new NoMatch();

    const newInheritedResolve = new InheritedResolve(inherited.resolve, getResolve(route));

    if (route.path === '**') {
      const params = segments.length > 0 ? last(segments).parameters : {};
      const snapshot = new ActivatedRouteSnapshot(
          segments, Object.freeze(merge(inherited.allParams, params)),
          Object.freeze(this.urlTree.queryParams), this.urlTree.fragment,
          merge(inherited.allData, getData(route)), outlet, route.component, route,
          getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + segments.length,
          newInheritedResolve);
      return [new TreeNode<ActivatedRouteSnapshot>(snapshot, [])];
    }

    const {consumedSegments, parameters, lastChild} =
        match(rawSegment, route, segments, inherited.snapshot);
    const rawSlicedSegments = segments.slice(lastChild);
    const childConfig = getChildConfig(route);

    const {segmentGroup, slicedSegments} =
        split(rawSegment, consumedSegments, rawSlicedSegments, childConfig);

    const snapshot = new ActivatedRouteSnapshot(
        consumedSegments, Object.freeze(merge(inherited.allParams, parameters)),
        Object.freeze(this.urlTree.queryParams), this.urlTree.fragment,
        merge(inherited.allData, getData(route)), outlet, route.component, route,
        getSourceSegmentGroup(rawSegment), getPathIndexShift(rawSegment) + consumedSegments.length,
        newInheritedResolve);

    const newInherited = route.component ?
        InheritedFromParent.empty(snapshot) :
        new InheritedFromParent(
            inherited, snapshot, parameters, getData(route), newInheritedResolve);

    if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
      const children = this.processChildren(childConfig, segmentGroup, newInherited);
      return [new TreeNode<ActivatedRouteSnapshot>(snapshot, children)];

    } else if (childConfig.length === 0 && slicedSegments.length === 0) {
      return [new TreeNode<ActivatedRouteSnapshot>(snapshot, [])];

    } else {
      const children = this.processSegment(
          childConfig, segmentGroup, pathIndex + lastChild, slicedSegments, newInherited,
          PRIMARY_OUTLET);
      return [new TreeNode<ActivatedRouteSnapshot>(snapshot, children)];
    }
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
  } else if (route.loadChildren) {
    return (<any>route)._loadedConfig.routes;
  } else {
    return [];
  }
}

function match(
    segmentGroup: UrlSegmentGroup, route: Route, segments: UrlSegment[],
    parent: ActivatedRouteSnapshot) {
  if (route.path === '') {
    if (route.pathMatch === 'full' && (segmentGroup.hasChildren() || segments.length > 0)) {
      throw new NoMatch();
    } else {
      const params = parent ? parent.params : {};
      return {consumedSegments: [], lastChild: 0, parameters: params};
    }
  }

  const path = route.path;
  const parts = path.split('/');
  const posParameters: {[key: string]: any} = {};
  const consumedSegments: UrlSegment[] = [];

  let currentIndex = 0;

  for (let i = 0; i < parts.length; ++i) {
    if (currentIndex >= segments.length) throw new NoMatch();
    const current = segments[currentIndex];

    const p = parts[i];
    const isPosParam = p.startsWith(':');

    if (!isPosParam && p !== current.path) throw new NoMatch();
    if (isPosParam) {
      posParameters[p.substring(1)] = current.path;
    }
    consumedSegments.push(current);
    currentIndex++;
  }

  if (route.pathMatch === 'full' &&
      (segmentGroup.hasChildren() || currentIndex < segments.length)) {
    throw new NoMatch();
  }

  const parameters = merge(posParameters, consumedSegments[consumedSegments.length - 1].parameters);
  return {consumedSegments, lastChild: currentIndex, parameters};
}

function checkOutletNameUniqueness(nodes: TreeNode<ActivatedRouteSnapshot>[]): void {
  const names: {[k: string]: ActivatedRouteSnapshot} = {};
  nodes.forEach(n => {
    let routeWithSameOutletName = names[n.value.outlet];
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

  } else if (
      slicedSegments.length === 0 &&
      containsEmptyPathMatches(segmentGroup, slicedSegments, config)) {
    const s = new UrlSegmentGroup(
        segmentGroup.segments, addEmptyPathsToChildrenIfNeeded(
                                   segmentGroup, slicedSegments, config, segmentGroup.children));
    s._sourceSegment = segmentGroup;
    s._segmentIndexShift = consumedSegments.length;
    return {segmentGroup: s, slicedSegments};

  } else {
    const s = new UrlSegmentGroup(segmentGroup.segments, segmentGroup.children);
    s._sourceSegment = segmentGroup;
    s._segmentIndexShift = consumedSegments.length;
    return {segmentGroup: s, slicedSegments};
  }
}

function addEmptyPathsToChildrenIfNeeded(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[],
    children: {[name: string]: UrlSegmentGroup}): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  for (let r of routes) {
    if (emptyPathMatch(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
      const s = new UrlSegmentGroup([], {});
      s._sourceSegment = segmentGroup;
      s._segmentIndexShift = segmentGroup.segments.length;
      res[getOutlet(r)] = s;
    }
  }
  return merge(children, res);
}

function createChildrenForEmptyPaths(
    segmentGroup: UrlSegmentGroup, consumedSegments: UrlSegment[], routes: Route[],
    primarySegment: UrlSegmentGroup): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  res[PRIMARY_OUTLET] = primarySegment;
  primarySegment._sourceSegment = segmentGroup;
  primarySegment._segmentIndexShift = consumedSegments.length;

  for (let r of routes) {
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
  return routes
             .filter(
                 r => emptyPathMatch(segmentGroup, slicedSegments, r) &&
                     getOutlet(r) !== PRIMARY_OUTLET)
             .length > 0;
}

function containsEmptyPathMatches(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[]): boolean {
  return routes.filter(r => emptyPathMatch(segmentGroup, slicedSegments, r)).length > 0;
}

function emptyPathMatch(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], r: Route): boolean {
  if ((segmentGroup.hasChildren() || slicedSegments.length > 0) && r.pathMatch === 'full')
    return false;
  return r.path === '' && r.redirectTo === undefined;
}

function getOutlet(route: Route): string {
  return route.outlet ? route.outlet : PRIMARY_OUTLET;
}

function getData(route: Route): Data {
  return route.data ? route.data : {};
}

function getResolve(route: Route): ResolveData {
  return route.resolve ? route.resolve : {};
}
