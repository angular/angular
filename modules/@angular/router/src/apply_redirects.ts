import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {of } from 'rxjs/observable/of';

import {Route, RouterConfig} from './config';
import {PRIMARY_OUTLET} from './shared';
import {UrlPathWithParams, UrlSegment, UrlTree, mapChildren} from './url_tree';

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

function createUrlTree(urlTree: UrlTree, root: UrlSegment): Observable<UrlTree> {
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
  if ((route.outlet ? route.outlet : PRIMARY_OUTLET) !== outlet) throw new NoMatch();
  if (route.redirectTo && !allowRedirects) throw new NoMatch();

  if (route.redirectTo) {
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
    segment: UrlSegment, route: Route, paths: UrlPathWithParams[]): UrlSegment {
  if (route.path === '**') {
    return new UrlSegment(paths, {});
  } else {
    const {consumedPaths, lastChild} = match(segment, route, paths);
    const childConfig = route.children ? route.children : [];
    const slicedPath = paths.slice(lastChild);

    if (childConfig.length === 0 && slicedPath.length === 0) {
      return new UrlSegment(consumedPaths, {});

      // TODO: check that the right segment is present
    } else if (slicedPath.length === 0 && segment.hasChildren()) {
      const children = expandSegmentChildren(childConfig, segment);
      return new UrlSegment(consumedPaths, children);

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
    if (route.terminal && (segment.hasChildren() || paths.length > 0)) {
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
  if (redirectTo.startsWith('/')) {
    const parts = redirectTo.substring(1).split('/');
    return createPaths(redirectTo, parts, paths, posParams);
  } else {
    const parts = redirectTo.split('/');
    return createPaths(redirectTo, parts, paths, posParams);
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
  const matchingIndex = paths.findIndex(s => s.path === part);
  if (matchingIndex > -1) {
    const r = paths[matchingIndex];
    paths.splice(matchingIndex);
    return r;
  } else {
    return new UrlPathWithParams(part, {});
  }
}
