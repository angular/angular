/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {of } from 'rxjs/observable/of';

import {Route, RouterConfig} from './config';
import {PRIMARY_OUTLET} from './shared';
import {UrlPathWithParams, UrlSegment, UrlTree, mapChildren} from './url_tree';
import {merge} from './utils/collection';

class NoMatch {
  constructor(public segment: UrlSegment = null) {}
}
class GlobalRedirect {
  constructor(public paths: UrlPathWithParams[]) {}
}

export function applyRedirects(urlTree: UrlTree, config: RouterConfig): Observable<UrlTree> {
  try {
    return createUrlTree(urlTree, expandSegment(config, urlTree.root, PRIMARY_OUTLET));
  } catch (e) {
    if (e instanceof GlobalRedirect) {
      return createUrlTree(
          urlTree, new UrlSegment([], {[PRIMARY_OUTLET]: new UrlSegment(e.paths, {})}));
    } else if (e instanceof NoMatch) {
      return new Observable<UrlTree>(
          (obs: Observer<UrlTree>) =>
              obs.error(new Error(`Cannot match any routes: '${e.segment}'`)));
    } else {
      return new Observable<UrlTree>((obs: Observer<UrlTree>) => obs.error(e));
    }
  }
}

function createUrlTree(urlTree: UrlTree, rootCandidate: UrlSegment): Observable<UrlTree> {
  const root = rootCandidate.pathsWithParams.length > 0 ?
      new UrlSegment([], {[PRIMARY_OUTLET]: rootCandidate}) :
      rootCandidate;
  return of (new UrlTree(root, urlTree.queryParams, urlTree.fragment));
}

function expandSegment(routes: Route[], segment: UrlSegment, outlet: string): UrlSegment {
  if (segment.pathsWithParams.length === 0 && segment.hasChildren()) {
    return new UrlSegment([], expandSegmentChildren(routes, segment));
  } else {
    return expandPathsWithParams(segment, routes, segment.pathsWithParams, outlet, true);
  }
}

function expandSegmentChildren(routes: Route[], segment: UrlSegment): {[name: string]: UrlSegment} {
  return mapChildren(segment, (child, childOutlet) => expandSegment(routes, child, childOutlet));
}

function expandPathsWithParams(
    segment: UrlSegment, routes: Route[], paths: UrlPathWithParams[], outlet: string,
    allowRedirects: boolean): UrlSegment {
  for (let r of routes) {
    try {
      return expandPathsWithParamsAgainstRoute(segment, routes, r, paths, outlet, allowRedirects);
    } catch (e) {
      if (!(e instanceof NoMatch)) throw e;
    }
  }
  throw new NoMatch(segment);
}

function expandPathsWithParamsAgainstRoute(
    segment: UrlSegment, routes: Route[], route: Route, paths: UrlPathWithParams[], outlet: string,
    allowRedirects: boolean): UrlSegment {
  if (getOutlet(route) !== outlet) throw new NoMatch();
  if (route.redirectTo !== undefined && !allowRedirects) throw new NoMatch();

  if (route.redirectTo !== undefined) {
    return expandPathsWithParamsAgainstRouteUsingRedirect(segment, routes, route, paths, outlet);
  } else {
    return matchPathsWithParamsAgainstRoute(segment, route, paths);
  }
}

function expandPathsWithParamsAgainstRouteUsingRedirect(
    segment: UrlSegment, routes: Route[], route: Route, paths: UrlPathWithParams[],
    outlet: string): UrlSegment {
  if (route.path === '**') {
    return expandWildCardWithParamsAgainstRouteUsingRedirect(route);
  } else {
    return expandRegularPathWithParamsAgainstRouteUsingRedirect(
        segment, routes, route, paths, outlet);
  }
}

function expandWildCardWithParamsAgainstRouteUsingRedirect(route: Route): UrlSegment {
  const newPaths = applyRedirectCommands([], route.redirectTo, {});
  if (route.redirectTo.startsWith('/')) {
    throw new GlobalRedirect(newPaths);
  } else {
    return new UrlSegment(newPaths, {});
  }
}

function expandRegularPathWithParamsAgainstRouteUsingRedirect(
    segment: UrlSegment, routes: Route[], route: Route, paths: UrlPathWithParams[],
    outlet: string): UrlSegment {
  const {consumedPaths, lastChild, positionalParamSegments} = match(segment, route, paths);
  const newPaths =
      applyRedirectCommands(consumedPaths, route.redirectTo, <any>positionalParamSegments);
  if (route.redirectTo.startsWith('/')) {
    throw new GlobalRedirect(newPaths);
  } else {
    return expandPathsWithParams(
        segment, routes, newPaths.concat(paths.slice(lastChild)), outlet, false);
  }
}

function matchPathsWithParamsAgainstRoute(
    rawSegment: UrlSegment, route: Route, paths: UrlPathWithParams[]): UrlSegment {
  if (route.path === '**') {
    return new UrlSegment(paths, {});
  } else {
    const {consumedPaths, lastChild} = match(rawSegment, route, paths);
    const childConfig = route.children ? route.children : [];
    const rawSlicedPath = paths.slice(lastChild);

    const {segment, slicedPath} = split(rawSegment, consumedPaths, rawSlicedPath, childConfig);

    if (slicedPath.length === 0 && segment.hasChildren()) {
      const children = expandSegmentChildren(childConfig, segment);
      return new UrlSegment(consumedPaths, children);

    } else if (childConfig.length === 0 && slicedPath.length === 0) {
      return new UrlSegment(consumedPaths, {});

    } else {
      const cs = expandPathsWithParams(segment, childConfig, slicedPath, PRIMARY_OUTLET, true);
      return new UrlSegment(consumedPaths.concat(cs.pathsWithParams), cs.children);
    }
  }
}

function match(segment: UrlSegment, route: Route, paths: UrlPathWithParams[]): {
  consumedPaths: UrlPathWithParams[],
  lastChild: number,
  positionalParamSegments: {[k: string]: UrlPathWithParams}
} {
  if (route.path === '') {
    if ((route.terminal || route.pathMatch === 'full') &&
        (segment.hasChildren() || paths.length > 0)) {
      throw new NoMatch();
    } else {
      return {consumedPaths: [], lastChild: 0, positionalParamSegments: {}};
    }
  }

  const path = route.path;
  const parts = path.split('/');
  const positionalParamSegments: {[k: string]: UrlPathWithParams} = {};
  const consumedPaths: UrlPathWithParams[] = [];

  let currentIndex = 0;

  for (let i = 0; i < parts.length; ++i) {
    if (currentIndex >= paths.length) throw new NoMatch();
    const current = paths[currentIndex];

    const p = parts[i];
    const isPosParam = p.startsWith(':');

    if (!isPosParam && p !== current.path) throw new NoMatch();
    if (isPosParam) {
      positionalParamSegments[p.substring(1)] = current;
    }
    consumedPaths.push(current);
    currentIndex++;
  }

  if (route.terminal && (segment.hasChildren() || currentIndex < paths.length)) {
    throw new NoMatch();
  }

  return {consumedPaths, lastChild: currentIndex, positionalParamSegments};
}

function applyRedirectCommands(
    paths: UrlPathWithParams[], redirectTo: string,
    posParams: {[k: string]: UrlPathWithParams}): UrlPathWithParams[] {
  const r = redirectTo.startsWith('/') ? redirectTo.substring(1) : redirectTo;
  if (r === '') {
    return [];
  } else {
    return createPaths(redirectTo, r.split('/'), paths, posParams);
  }
}

function createPaths(
    redirectTo: string, parts: string[], segments: UrlPathWithParams[],
    posParams: {[k: string]: UrlPathWithParams}): UrlPathWithParams[] {
  return parts.map(
      p => p.startsWith(':') ? findPosParam(p, posParams, redirectTo) :
                               findOrCreatePath(p, segments));
}

function findPosParam(
    part: string, posParams: {[k: string]: UrlPathWithParams},
    redirectTo: string): UrlPathWithParams {
  const paramName = part.substring(1);
  const pos = posParams[paramName];
  if (!pos) throw new Error(`Cannot redirect to '${redirectTo}'. Cannot find '${part}'.`);
  return pos;
}

function findOrCreatePath(part: string, paths: UrlPathWithParams[]): UrlPathWithParams {
  let idx = 0;
  for (const s of paths) {
    if (s.path === part) {
      paths.splice(idx);
      return s;
    }
    idx++;
  }
  return new UrlPathWithParams(part, {});
}


function split(
    segment: UrlSegment, consumedPaths: UrlPathWithParams[], slicedPath: UrlPathWithParams[],
    config: Route[]) {
  if (slicedPath.length > 0 &&
      containsEmptyPathRedirectsWithNamedOutlets(segment, slicedPath, config)) {
    const s = new UrlSegment(
        consumedPaths,
        createChildrenForEmptyPaths(config, new UrlSegment(slicedPath, segment.children)));
    return {segment: mergeTrivialChildren(s), slicedPath: []};

  } else if (slicedPath.length === 0 && containsEmptyPathRedirects(segment, slicedPath, config)) {
    const s = new UrlSegment(
        segment.pathsWithParams,
        addEmptyPathsToChildrenIfNeeded(segment, slicedPath, config, segment.children));
    return {segment: mergeTrivialChildren(s), slicedPath};

  } else {
    return {segment, slicedPath};
  }
}

function mergeTrivialChildren(s: UrlSegment): UrlSegment {
  if (s.numberOfChildren === 1 && s.children[PRIMARY_OUTLET]) {
    const c = s.children[PRIMARY_OUTLET];
    return new UrlSegment(s.pathsWithParams.concat(c.pathsWithParams), c.children);
  } else {
    return s;
  }
}

function addEmptyPathsToChildrenIfNeeded(
    segment: UrlSegment, slicedPath: UrlPathWithParams[], routes: Route[],
    children: {[name: string]: UrlSegment}): {[name: string]: UrlSegment} {
  const res: {[name: string]: UrlSegment} = {};
  for (let r of routes) {
    if (emptyPathRedirect(segment, slicedPath, r) && !children[getOutlet(r)]) {
      res[getOutlet(r)] = new UrlSegment([], {});
    }
  }
  return merge(children, res);
}

function createChildrenForEmptyPaths(
    routes: Route[], primarySegment: UrlSegment): {[name: string]: UrlSegment} {
  const res: {[name: string]: UrlSegment} = {};
  res[PRIMARY_OUTLET] = primarySegment;
  for (let r of routes) {
    if (r.path === '') {
      res[getOutlet(r)] = new UrlSegment([], {});
    }
  }
  return res;
}

function containsEmptyPathRedirectsWithNamedOutlets(
    segment: UrlSegment, slicedPath: UrlPathWithParams[], routes: Route[]): boolean {
  return routes
             .filter(
                 r => emptyPathRedirect(segment, slicedPath, r) && getOutlet(r) !== PRIMARY_OUTLET)
             .length > 0;
}

function containsEmptyPathRedirects(
    segment: UrlSegment, slicedPath: UrlPathWithParams[], routes: Route[]): boolean {
  return routes.filter(r => emptyPathRedirect(segment, slicedPath, r)).length > 0;
}

function emptyPathRedirect(
    segment: UrlSegment, slicedPath: UrlPathWithParams[], r: Route): boolean {
  if ((segment.hasChildren() || slicedPath.length > 0) && (r.terminal || r.pathMatch === 'full'))
    return false;
  return r.path === '' && r.redirectTo !== undefined;
}

function getOutlet(route: Route): string {
  return route.outlet ? route.outlet : PRIMARY_OUTLET;
}