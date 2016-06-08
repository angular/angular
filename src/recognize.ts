import {Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {of } from 'rxjs/observable/of';

import {match} from './apply_redirects';
import {Route, RouterConfig} from './config';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {PRIMARY_OUTLET} from './shared';
import {UrlSegment, UrlTree} from './url_tree';
import {first, flatten, forEach, merge} from './utils/collection';
import {TreeNode} from './utils/tree';

class CannotRecognize {}

export function recognize(
    rootComponentType: Type, config: RouterConfig, url: UrlTree): Observable<RouterStateSnapshot> {
  try {
    const match = new MatchResult(
        rootComponentType, config, [url.root], {}, url._root.children, [], PRIMARY_OUTLET, null,
        url.root);
    const roots = constructActivatedRoute(match);
    return of (new RouterStateSnapshot(roots[0], url.queryParams, url.fragment));
  } catch (e) {
    if (e instanceof CannotRecognize) {
      return new Observable<RouterStateSnapshot>(
          obs => obs.error(new Error('Cannot match any routes')));
    } else {
      return new Observable<RouterStateSnapshot>(obs => obs.error(e));
    }
  }
}

function constructActivatedRoute(match: MatchResult): TreeNode<ActivatedRouteSnapshot>[] {
  const activatedRoute = createActivatedRouteSnapshot(match);
  const children = match.leftOverUrl.length > 0 ?
      recognizeMany(match.children, match.leftOverUrl) :
      recognizeLeftOvers(match.children, match.lastUrlSegment);
  checkOutletNameUniqueness(children);
  children.sort((a, b) => {
    if (a.value.outlet === PRIMARY_OUTLET) return -1;
    if (b.value.outlet === PRIMARY_OUTLET) return 1;
    return a.value.outlet.localeCompare(b.value.outlet);
  });
  return [new TreeNode<ActivatedRouteSnapshot>(activatedRoute, children)];
}

function recognizeLeftOvers(
    config: Route[], lastUrlSegment: UrlSegment): TreeNode<ActivatedRouteSnapshot>[] {
  if (!config) return [];
  const mIndex = matchIndex(config, [], lastUrlSegment);
  return mIndex ? constructActivatedRoute(mIndex) : [];
}

function recognizeMany(
    config: Route[], urls: TreeNode<UrlSegment>[]): TreeNode<ActivatedRouteSnapshot>[] {
  return flatten(urls.map(url => recognizeOne(config, url)));
}

function createActivatedRouteSnapshot(match: MatchResult): ActivatedRouteSnapshot {
  return new ActivatedRouteSnapshot(
      match.consumedUrlSegments, match.parameters, match.outlet, match.component, match.route,
      match.lastUrlSegment);
}

function recognizeOne(
    config: Route[], url: TreeNode<UrlSegment>): TreeNode<ActivatedRouteSnapshot>[] {
  const matches = matchNode(config, url);
  for (let match of matches) {
    try {
      const primary = constructActivatedRoute(match);
      const secondary = recognizeMany(config, match.secondary);
      const res = primary.concat(secondary);
      checkOutletNameUniqueness(res);
      return res;
    } catch (e) {
      if (!(e instanceof CannotRecognize)) {
        throw e;
      }
    }
  }
  throw new CannotRecognize();
}

function checkOutletNameUniqueness(nodes: TreeNode<ActivatedRouteSnapshot>[]):
    TreeNode<ActivatedRouteSnapshot>[] {
  let names = {};
  nodes.forEach(n => {
    let routeWithSameOutletName = names[n.value.outlet];
    if (routeWithSameOutletName) {
      const p = routeWithSameOutletName.urlSegments.map(s => s.toString()).join('/');
      const c = n.value.urlSegments.map(s => s.toString()).join('/');
      throw new Error(`Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
    }
    names[n.value.outlet] = n.value;
  });
  return nodes;
}

function matchNode(config: Route[], url: TreeNode<UrlSegment>): MatchResult[] {
  const res = [];
  for (let r of config) {
    if (r.index) {
      res.push(createIndexMatch(r, [url], url.value));
    } else {
      const m = matchWithParts(r, url);
      if (m) res.push(m);
    }
  }
  return res;
}

function createIndexMatch(
    r: Route, leftOverUrls: TreeNode<UrlSegment>[], lastUrlSegment: UrlSegment): MatchResult {
  const outlet = r.outlet ? r.outlet : PRIMARY_OUTLET;
  const children = r.children ? r.children : [];
  return new MatchResult(
      r.component, children, [], lastUrlSegment.parameters, leftOverUrls, [], outlet, r,
      lastUrlSegment);
}

function matchIndex(
    config: Route[], leftOverUrls: TreeNode<UrlSegment>[], lastUrlSegment: UrlSegment): MatchResult|
    null {
  for (let r of config) {
    if (r.index) {
      return createIndexMatch(r, leftOverUrls, lastUrlSegment);
    }
  }
  return null;
}

function matchWithParts(route: Route, url: TreeNode<UrlSegment>): MatchResult|null {
  if (!route.path) return null;
  if ((route.outlet ? route.outlet : PRIMARY_OUTLET) !== url.value.outlet) return null;

  const path = route.path.startsWith('/') ? route.path.substring(1) : route.path;
  if (path === '**') {
    const consumedUrl = [];
    let u: TreeNode<UrlSegment>|null = url;
    while (u) {
      consumedUrl.push(u.value);
      u = first(u.children);
    }
    const last = consumedUrl[consumedUrl.length - 1];
    return new MatchResult(
        route.component, [], consumedUrl, last.parameters, [], [], PRIMARY_OUTLET, route, last);
  }

  const m = match(route, url);
  if (!m) return null;
  const {consumedUrlSegments, lastSegment, lastParent, positionalParamSegments} = m;

  const p = lastSegment.value.parameters;
  const posParams = {};
  forEach(positionalParamSegments, (v, k) => { posParams[k] = v.path; });
  const parameters = <{[key: string]: string}>merge(p, posParams);
  const secondarySubtrees = lastParent ? lastParent.children.slice(1) : [];
  const children = route.children ? route.children : [];
  const outlet = route.outlet ? route.outlet : PRIMARY_OUTLET;

  return new MatchResult(
      route.component, children, consumedUrlSegments, parameters, lastSegment.children,
      secondarySubtrees, outlet, route, lastSegment.value);
}

class MatchResult {
  constructor(
      public component: Type|string, public children: Route[],
      public consumedUrlSegments: UrlSegment[], public parameters: {[key: string]: string},
      public leftOverUrl: TreeNode<UrlSegment>[], public secondary: TreeNode<UrlSegment>[],
      public outlet: string, public route: Route|null, public lastUrlSegment: UrlSegment) {}
}