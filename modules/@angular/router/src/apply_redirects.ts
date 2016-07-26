/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/operator/first';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/concatAll';

import {Injector} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {from} from 'rxjs/observable/from';
import {of } from 'rxjs/observable/of';
import {EmptyError} from 'rxjs/util/EmptyError';

import {Route, Routes} from './config';
import {LoadedRouterConfig, RouterConfigLoader} from './router_config_loader';
import {PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlSegmentGroup, UrlTree} from './url_tree';
import {andObservables, merge, waitForMap, wrapIntoObservable} from './utils/collection';

class NoMatch {
  constructor(public segmentGroup: UrlSegmentGroup = null) {}
}

class AbsoluteRedirect {
  constructor(public segments: UrlSegment[]) {}
}

function noMatch(segmentGroup: UrlSegmentGroup): Observable<UrlSegmentGroup> {
  return new Observable<UrlSegmentGroup>(
      (obs: Observer<UrlSegmentGroup>) => obs.error(new NoMatch(segmentGroup)));
}

function absoluteRedirect(segments: UrlSegment[]): Observable<UrlSegmentGroup> {
  return new Observable<UrlSegmentGroup>(
      (obs: Observer<UrlSegmentGroup>) => obs.error(new AbsoluteRedirect(segments)));
}

function canLoadFails(route: Route): Observable<LoadedRouterConfig> {
  return new Observable<LoadedRouterConfig>(
      (obs: Observer<LoadedRouterConfig>) => obs.error(new Error(
          `Cannot load children because the guard of the route "path: '${route.path}'" returned false`)));
}


export function applyRedirects(
    injector: Injector, configLoader: RouterConfigLoader, urlTree: UrlTree,
    config: Routes): Observable<UrlTree> {
  return expandSegmentGroup(injector, configLoader, config, urlTree.root, PRIMARY_OUTLET)
      .map(rootSegmentGroup => createUrlTree(urlTree, rootSegmentGroup))
      .catch(e => {
        if (e instanceof AbsoluteRedirect) {
          return of (createUrlTree(
              urlTree,
              new UrlSegmentGroup([], {[PRIMARY_OUTLET]: new UrlSegmentGroup(e.segments, {})})));
        } else if (e instanceof NoMatch) {
          throw new Error(`Cannot match any routes: '${e.segmentGroup}'`);
        } else {
          throw e;
        }
      });
}

function createUrlTree(urlTree: UrlTree, rootCandidate: UrlSegmentGroup): UrlTree {
  const root = rootCandidate.segments.length > 0 ?
      new UrlSegmentGroup([], {[PRIMARY_OUTLET]: rootCandidate}) :
      rootCandidate;
  return new UrlTree(root, urlTree.queryParams, urlTree.fragment);
}

function expandSegmentGroup(
    injector: Injector, configLoader: RouterConfigLoader, routes: Route[],
    segmentGroup: UrlSegmentGroup, outlet: string): Observable<UrlSegmentGroup> {
  if (segmentGroup.segments.length === 0 && segmentGroup.hasChildren()) {
    return expandChildren(injector, configLoader, routes, segmentGroup)
        .map(children => new UrlSegmentGroup([], children));
  } else {
    return expandSegment(
        injector, configLoader, segmentGroup, routes, segmentGroup.segments, outlet, true);
  }
}

function expandChildren(
    injector: Injector, configLoader: RouterConfigLoader, routes: Route[],
    segmentGroup: UrlSegmentGroup): Observable<{[name: string]: UrlSegmentGroup}> {
  return waitForMap(
      segmentGroup.children, (childOutlet, child) => expandSegmentGroup(
                                 injector, configLoader, routes, child, childOutlet));
}

function expandSegment(
    injector: Injector, configLoader: RouterConfigLoader, segmentGroup: UrlSegmentGroup,
    routes: Route[], segments: UrlSegment[], outlet: string,
    allowRedirects: boolean): Observable<UrlSegmentGroup> {
  const processRoutes = of (...routes)
                            .map(r => {
                              return expandSegmentAgainstRoute(
                                         injector, configLoader, segmentGroup, routes, r, segments,
                                         outlet, allowRedirects)
                                  .catch((e) => {
                                    if (e instanceof NoMatch)
                                      return of (null);
                                    else
                                      throw e;
                                  });
                            })
                            .concatAll();

  return processRoutes.first(s => !!s).catch((e: any, _: any): Observable<UrlSegmentGroup> => {
    if (e instanceof EmptyError) {
      throw new NoMatch(segmentGroup);
    } else {
      throw e;
    }
  });
}

function expandSegmentAgainstRoute(
    injector: Injector, configLoader: RouterConfigLoader, segmentGroup: UrlSegmentGroup,
    routes: Route[], route: Route, paths: UrlSegment[], outlet: string,
    allowRedirects: boolean): Observable<UrlSegmentGroup> {
  if (getOutlet(route) !== outlet) return noMatch(segmentGroup);
  if (route.redirectTo !== undefined && !allowRedirects) return noMatch(segmentGroup);

  if (route.redirectTo !== undefined) {
    return expandSegmentAgainstRouteUsingRedirect(
        injector, configLoader, segmentGroup, routes, route, paths, outlet);
  } else {
    return matchSegmentAgainstRoute(injector, configLoader, segmentGroup, route, paths);
  }
}

function expandSegmentAgainstRouteUsingRedirect(
    injector: Injector, configLoader: RouterConfigLoader, segmentGroup: UrlSegmentGroup,
    routes: Route[], route: Route, segments: UrlSegment[],
    outlet: string): Observable<UrlSegmentGroup> {
  if (route.path === '**') {
    return expandWildCardWithParamsAgainstRouteUsingRedirect(route);
  } else {
    return expandRegularSegmentAgainstRouteUsingRedirect(
        injector, configLoader, segmentGroup, routes, route, segments, outlet);
  }
}

function expandWildCardWithParamsAgainstRouteUsingRedirect(route: Route):
    Observable<UrlSegmentGroup> {
  const newSegments = applyRedirectCommands([], route.redirectTo, {});
  if (route.redirectTo.startsWith('/')) {
    return absoluteRedirect(newSegments);
  } else {
    return of (new UrlSegmentGroup(newSegments, {}));
  }
}

function expandRegularSegmentAgainstRouteUsingRedirect(
    injector: Injector, configLoader: RouterConfigLoader, segmentGroup: UrlSegmentGroup,
    routes: Route[], route: Route, segments: UrlSegment[],
    outlet: string): Observable<UrlSegmentGroup> {
  const {matched, consumedSegments, lastChild, positionalParamSegments} =
      match(segmentGroup, route, segments);
  if (!matched) return noMatch(segmentGroup);

  const newSegments =
      applyRedirectCommands(consumedSegments, route.redirectTo, <any>positionalParamSegments);
  if (route.redirectTo.startsWith('/')) {
    return absoluteRedirect(newSegments);
  } else {
    return expandSegment(
        injector, configLoader, segmentGroup, routes, newSegments.concat(segments.slice(lastChild)),
        outlet, false);
  }
}

function matchSegmentAgainstRoute(
    injector: Injector, configLoader: RouterConfigLoader, rawSegmentGroup: UrlSegmentGroup,
    route: Route, segments: UrlSegment[]): Observable<UrlSegmentGroup> {
  if (route.path === '**') {
    return of (new UrlSegmentGroup(segments, {}));

  } else {
    const {matched, consumedSegments, lastChild} = match(rawSegmentGroup, route, segments);
    if (!matched) return noMatch(rawSegmentGroup);

    const rawSlicedSegments = segments.slice(lastChild);

    return getChildConfig(injector, configLoader, route).mergeMap(routerConfig => {
      const childInjector = routerConfig.injector;
      const childConfig = routerConfig.routes;
      const {segmentGroup, slicedSegments} =
          split(rawSegmentGroup, consumedSegments, rawSlicedSegments, childConfig);

      if (slicedSegments.length === 0 && segmentGroup.hasChildren()) {
        return expandChildren(childInjector, configLoader, childConfig, segmentGroup)
            .map(children => new UrlSegmentGroup(consumedSegments, children));

      } else if (childConfig.length === 0 && slicedSegments.length === 0) {
        return of (new UrlSegmentGroup(consumedSegments, {}));

      } else {
        return expandSegment(
                   childInjector, configLoader, segmentGroup, childConfig, slicedSegments,
                   PRIMARY_OUTLET, true)
            .map(cs => new UrlSegmentGroup(consumedSegments.concat(cs.segments), cs.children));
      }
    });
  }
}

function getChildConfig(injector: Injector, configLoader: RouterConfigLoader, route: Route):
    Observable<LoadedRouterConfig> {
  if (route.children) {
    return of (new LoadedRouterConfig(route.children, injector, null));
  } else if (route.loadChildren) {
    return runGuards(injector, route).mergeMap(shouldLoad => {
      if (shouldLoad) {
        return configLoader.load(injector, route.loadChildren).map(r => {
          (<any>route)._loadedConfig = r;
          return r;
        });
      } else {
        return canLoadFails(route);
      }
    });
  } else {
    return of (new LoadedRouterConfig([], injector, null));
  }
}

function runGuards(injector: Injector, route: Route): Observable<boolean> {
  const canLoad = route.canLoad;
  if (!canLoad || canLoad.length === 0) return of (true);
  const obs = from(canLoad).map(c => {
    const guard = injector.get(c);
    if (guard.canLoad) {
      return wrapIntoObservable(guard.canLoad(route));
    } else {
      return wrapIntoObservable(guard(route));
    }
  });
  return andObservables(obs);
}

function match(segmentGroup: UrlSegmentGroup, route: Route, segments: UrlSegment[]): {
  matched: boolean,
  consumedSegments: UrlSegment[],
  lastChild: number,
  positionalParamSegments: {[k: string]: UrlSegment}
} {
  const noMatch =
      {matched: false, consumedSegments: <any[]>[], lastChild: 0, positionalParamSegments: {}};
  if (route.path === '') {
    if ((route.terminal || route.pathMatch === 'full') &&
        (segmentGroup.hasChildren() || segments.length > 0)) {
      return {matched: false, consumedSegments: [], lastChild: 0, positionalParamSegments: {}};
    } else {
      return {matched: true, consumedSegments: [], lastChild: 0, positionalParamSegments: {}};
    }
  }

  const path = route.path;
  const parts = path.split('/');
  const positionalParamSegments: {[k: string]: UrlSegment} = {};
  const consumedSegments: UrlSegment[] = [];

  let currentIndex = 0;

  for (let i = 0; i < parts.length; ++i) {
    if (currentIndex >= segments.length) return noMatch;
    const current = segments[currentIndex];

    const p = parts[i];
    const isPosParam = p.startsWith(':');

    if (!isPosParam && p !== current.path) return noMatch;
    if (isPosParam) {
      positionalParamSegments[p.substring(1)] = current;
    }
    consumedSegments.push(current);
    currentIndex++;
  }

  if (route.terminal && (segmentGroup.hasChildren() || currentIndex < segments.length)) {
    return {matched: false, consumedSegments: [], lastChild: 0, positionalParamSegments: {}};
  }

  return {matched: true, consumedSegments, lastChild: currentIndex, positionalParamSegments};
}

function applyRedirectCommands(
    segments: UrlSegment[], redirectTo: string,
    posParams: {[k: string]: UrlSegment}): UrlSegment[] {
  const r = redirectTo.startsWith('/') ? redirectTo.substring(1) : redirectTo;
  if (r === '') {
    return [];
  } else {
    return createSegments(redirectTo, r.split('/'), segments, posParams);
  }
}

function createSegments(
    redirectTo: string, parts: string[], segments: UrlSegment[],
    posParams: {[k: string]: UrlSegment}): UrlSegment[] {
  return parts.map(
      p => p.startsWith(':') ? findPosParam(p, posParams, redirectTo) :
                               findOrCreateSegment(p, segments));
}

function findPosParam(
    part: string, posParams: {[k: string]: UrlSegment}, redirectTo: string): UrlSegment {
  const paramName = part.substring(1);
  const pos = posParams[paramName];
  if (!pos) throw new Error(`Cannot redirect to '${redirectTo}'. Cannot find '${part}'.`);
  return pos;
}

function findOrCreateSegment(part: string, segments: UrlSegment[]): UrlSegment {
  let idx = 0;
  for (const s of segments) {
    if (s.path === part) {
      segments.splice(idx);
      return s;
    }
    idx++;
  }
  return new UrlSegment(part, {});
}


function split(
    segmentGroup: UrlSegmentGroup, consumedSegments: UrlSegment[], slicedSegments: UrlSegment[],
    config: Route[]) {
  if (slicedSegments.length > 0 &&
      containsEmptyPathRedirectsWithNamedOutlets(segmentGroup, slicedSegments, config)) {
    const s = new UrlSegmentGroup(
        consumedSegments, createChildrenForEmptySegments(
                              config, new UrlSegmentGroup(slicedSegments, segmentGroup.children)));
    return {segmentGroup: mergeTrivialChildren(s), slicedSegments: []};

  } else if (
      slicedSegments.length === 0 &&
      containsEmptyPathRedirects(segmentGroup, slicedSegments, config)) {
    const s = new UrlSegmentGroup(
        segmentGroup.segments, addEmptySegmentsToChildrenIfNeeded(
                                   segmentGroup, slicedSegments, config, segmentGroup.children));
    return {segmentGroup: mergeTrivialChildren(s), slicedSegments};

  } else {
    return {segmentGroup, slicedSegments};
  }
}

function mergeTrivialChildren(s: UrlSegmentGroup): UrlSegmentGroup {
  if (s.numberOfChildren === 1 && s.children[PRIMARY_OUTLET]) {
    const c = s.children[PRIMARY_OUTLET];
    return new UrlSegmentGroup(s.segments.concat(c.segments), c.children);
  } else {
    return s;
  }
}

function addEmptySegmentsToChildrenIfNeeded(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[],
    children: {[name: string]: UrlSegmentGroup}): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  for (let r of routes) {
    if (emptyPathRedirect(segmentGroup, slicedSegments, r) && !children[getOutlet(r)]) {
      res[getOutlet(r)] = new UrlSegmentGroup([], {});
    }
  }
  return merge(children, res);
}

function createChildrenForEmptySegments(
    routes: Route[], primarySegmentGroup: UrlSegmentGroup): {[name: string]: UrlSegmentGroup} {
  const res: {[name: string]: UrlSegmentGroup} = {};
  res[PRIMARY_OUTLET] = primarySegmentGroup;
  for (let r of routes) {
    if (r.path === '' && getOutlet(r) !== PRIMARY_OUTLET) {
      res[getOutlet(r)] = new UrlSegmentGroup([], {});
    }
  }
  return res;
}

function containsEmptyPathRedirectsWithNamedOutlets(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[]): boolean {
  return routes
             .filter(
                 r => emptyPathRedirect(segmentGroup, slicedSegments, r) &&
                     getOutlet(r) !== PRIMARY_OUTLET)
             .length > 0;
}

function containsEmptyPathRedirects(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], routes: Route[]): boolean {
  return routes.filter(r => emptyPathRedirect(segmentGroup, slicedSegments, r)).length > 0;
}

function emptyPathRedirect(
    segmentGroup: UrlSegmentGroup, slicedSegments: UrlSegment[], r: Route): boolean {
  if ((segmentGroup.hasChildren() || slicedSegments.length > 0) &&
      (r.terminal || r.pathMatch === 'full'))
    return false;
  return r.path === '' && r.redirectTo !== undefined;
}

function getOutlet(route: Route): string {
  return route.outlet ? route.outlet : PRIMARY_OUTLET;
}