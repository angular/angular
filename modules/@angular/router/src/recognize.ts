import {Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {of } from 'rxjs/observable/of';

import {Route, RouterConfig} from './config';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET} from './shared';
import {UrlPathWithParams, UrlSegment, UrlTree, mapChildrenIntoArray} from './url_tree';
import {last, merge} from './utils/collection';
import {TreeNode} from './utils/tree';

class NoMatch {
  constructor(public segment: UrlSegment = null) {}
}

export function recognize(
    rootComponentType: Type, config: RouterConfig, urlTree: UrlTree,
    url: string): Observable<RouterStateSnapshot> {
  try {
    const children = processSegment(config, urlTree.root, PRIMARY_OUTLET);
    const root = new ActivatedRouteSnapshot(
        [], {}, PRIMARY_OUTLET, rootComponentType, null, urlTree.root, -1);
    const rootNode = new TreeNode<ActivatedRouteSnapshot>(root, children);
    return of (new RouterStateSnapshot(url, rootNode, urlTree.queryParams, urlTree.fragment));
  } catch (e) {
    if (e instanceof NoMatch) {
      return new Observable<RouterStateSnapshot>(
          obs => obs.error(new Error(`Cannot match any routes: '${e.segment}'`)));
    } else {
      return new Observable<RouterStateSnapshot>(obs => obs.error(e));
    }
  }
}

function processSegment(
    config: Route[], segment: UrlSegment, outlet: string): TreeNode<ActivatedRouteSnapshot>[] {
  if (segment.pathsWithParams.length === 0 && Object.keys(segment.children).length > 0) {
    return processSegmentChildren(config, segment);
  } else {
    return [processPathsWithParams(config, segment, 0, segment.pathsWithParams, outlet)];
  }
}

function processSegmentChildren(
    config: Route[], segment: UrlSegment): TreeNode<ActivatedRouteSnapshot>[] {
  const children = mapChildrenIntoArray(
      segment, (child, childOutlet) => processSegment(config, child, childOutlet));
  checkOutletNameUniqueness(children);
  sortActivatedRouteSnapshots(children);
  return children;
}

function sortActivatedRouteSnapshots(nodes: TreeNode<ActivatedRouteSnapshot>[]): void {
  nodes.sort((a, b) => {
    if (a.value.outlet === PRIMARY_OUTLET) return -1;
    if (b.value.outlet === PRIMARY_OUTLET) return 1;
    return a.value.outlet.localeCompare(b.value.outlet);
  });
}

function processPathsWithParams(
    config: Route[], segment: UrlSegment, pathIndex: number, paths: UrlPathWithParams[],
    outlet: string): TreeNode<ActivatedRouteSnapshot> {
  for (let r of config) {
    try {
      return processPathsWithParamsAgainstRoute(r, segment, pathIndex, paths, outlet);
    } catch (e) {
      if (!(e instanceof NoMatch)) throw e;
    }
  }
  throw new NoMatch(segment);
}

function processPathsWithParamsAgainstRoute(
    route: Route, segment: UrlSegment, pathIndex: number, paths: UrlPathWithParams[],
    outlet: string): TreeNode<ActivatedRouteSnapshot> {
  if (route.redirectTo) throw new NoMatch();
  if ((route.outlet ? route.outlet : PRIMARY_OUTLET) !== outlet) throw new NoMatch();

  if (route.path === '**') {
    const params = paths.length > 0 ? last(paths).parameters : {};
    const snapshot =
        new ActivatedRouteSnapshot(paths, params, outlet, route.component, route, segment, -1);
    return new TreeNode<ActivatedRouteSnapshot>(snapshot, []);
  }

  const {consumedPaths, parameters, lastChild} = match(segment, route, paths);

  const snapshot = new ActivatedRouteSnapshot(
      consumedPaths, parameters, outlet, route.component, route, segment,
      pathIndex + lastChild - 1);
  const slicedPath = paths.slice(lastChild);
  const childConfig = route.children ? route.children : [];

  if (childConfig.length === 0 && slicedPath.length === 0) {
    return new TreeNode<ActivatedRouteSnapshot>(snapshot, []);

    // TODO: check that the right segment is present
  } else if (slicedPath.length === 0 && Object.keys(segment.children).length > 0) {
    const children = processSegmentChildren(childConfig, segment);
    return new TreeNode<ActivatedRouteSnapshot>(snapshot, children);

  } else {
    const child = processPathsWithParams(
        childConfig, segment, pathIndex + lastChild, slicedPath, PRIMARY_OUTLET);
    return new TreeNode<ActivatedRouteSnapshot>(snapshot, [child]);
  }
}

function match(segment: UrlSegment, route: Route, paths: UrlPathWithParams[]) {
  if (route.index || route.path === '' || route.path === '/') {
    if (route.terminal && (Object.keys(segment.children).length > 0 || paths.length > 0)) {
      throw new NoMatch();
    } else {
      return {consumedPaths: [], lastChild: 0, parameters: {}};
    }
  }

  const path = route.path.startsWith('/') ? route.path.substring(1) : route.path;
  const parts = path.split('/');
  const posParameters: {[key: string]: any} = {};
  const consumedPaths = [];

  let currentIndex = 0;

  for (let i = 0; i < parts.length; ++i) {
    if (currentIndex >= paths.length) throw new NoMatch();
    const current = paths[currentIndex];

    const p = parts[i];
    const isPosParam = p.startsWith(':');

    if (!isPosParam && p !== current.path) throw new NoMatch();
    if (isPosParam) {
      posParameters[p.substring(1)] = current.path;
    }
    consumedPaths.push(current);
    currentIndex++;
  }

  if (route.terminal && (Object.keys(segment.children).length > 0 || currentIndex < paths.length)) {
    throw new NoMatch();
  }

  const parameters = merge(posParameters, consumedPaths[consumedPaths.length - 1].parameters);
  return {consumedPaths, lastChild: currentIndex, parameters};
}

function checkOutletNameUniqueness(nodes: TreeNode<ActivatedRouteSnapshot>[]): void {
  const names = {};
  nodes.forEach(n => {
    let routeWithSameOutletName = names[n.value.outlet];
    if (routeWithSameOutletName) {
      const p = routeWithSameOutletName.urlSegments.map(s => s.toString()).join('/');
      const c = n.value.url.map(s => s.toString()).join('/');
      throw new Error(`Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
    }
    names[n.value.outlet] = n.value;
  });
}