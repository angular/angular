import { UrlTree, UrlSegment } from './url_tree';
import { flatten, first, merge } from './utils/collection';
import { TreeNode } from './utils/tree';
import { RouterStateCandidate, ActivatedRouteCandidate } from './router_state';
import { Params, PRIMARY_OUTLET } from './shared';
import { RouterConfig, Route } from './config';
import { Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';

export function recognize(rootComponentType: Type, config: RouterConfig, url: UrlTree): Observable<RouterStateCandidate> {
  try {
    const match = new MatchResult(rootComponentType, config, [url.root], {}, url._root.children, [], PRIMARY_OUTLET, null);
    const roots = constructActivatedRoute(match);
    const res = new RouterStateCandidate(roots[0], url.queryParameters, url.fragment);
    return new Observable<RouterStateCandidate>(obs => {
      obs.next(res);
      obs.complete();
    });
  } catch(e) {
    return new Observable<RouterStateCandidate>(obs => obs.error(e));
  }
}

function constructActivatedRoute(match: MatchResult): TreeNode<ActivatedRouteCandidate>[] {
  const activatedRoute = createActivatedRouteCandidate(match);
  if (match.leftOverUrl.length > 0) {
    const children = recognizeMany(match.children, match.leftOverUrl);
    checkOutletNameUniqueness(children);
    children.sort((a, b) => {
      if (a.value.outlet === PRIMARY_OUTLET) return -1;
      if (b.value.outlet === PRIMARY_OUTLET) return 1;
      return a.value.outlet.localeCompare(b.value.outlet)
    });
    return [new TreeNode<ActivatedRouteCandidate>(activatedRoute, children)];
  } else {
    return [new TreeNode<ActivatedRouteCandidate>(activatedRoute, [])];
  }
}

function recognizeMany(config: Route[], urls: TreeNode<UrlSegment>[]): TreeNode<ActivatedRouteCandidate>[] {
  return flatten(urls.map(url => recognizeOne(config, url)));
}

function createActivatedRouteCandidate(match: MatchResult): ActivatedRouteCandidate {
  return new ActivatedRouteCandidate(match.consumedUrlSegments, match.parameters, match.outlet, match.component, match.route);
}

function recognizeOne(config: Route[], url: TreeNode<UrlSegment>): TreeNode<ActivatedRouteCandidate>[] {
  const m = match(config, url);
  const primary = constructActivatedRoute(m);
  const secondary = recognizeMany(config, m.secondary);
  const res = primary.concat(secondary);
  checkOutletNameUniqueness(res);
  return res;
}

function checkOutletNameUniqueness(nodes: TreeNode<ActivatedRouteCandidate>[]): TreeNode<ActivatedRouteCandidate>[] {
  let names = {};
  nodes.forEach(n => {
    let routeWithSameOutletName = names[n.value.outlet];
    if (routeWithSameOutletName) {
      const p = routeWithSameOutletName.urlSegments.map(s => s.toString()).join("/");
      const c = n.value.urlSegments.map(s => s.toString()).join("/");
      throw new Error(`Two segments cannot have the same outlet name: '${p}' and '${c}'.`);
    }
    names[n.value.outlet] = n.value;
  });
  return nodes;
}

function match(config: Route[], url: TreeNode<UrlSegment>): MatchResult {
  const m = matchNonIndex(config, url);
  if (m) return m;

  const mIndex = matchIndex(config, url);
  if (mIndex) return mIndex;

  const availableRoutes = config.map(r => {
    const outlet = !r.outlet ? '' : `${r.outlet}:`;
    return `'${outlet}${r.path}'`;
  }).join(", ");
  throw new Error(
    `Cannot match any routes. Current segment: '${url.value}'. Available routes: [${availableRoutes}].`);
}

function matchNonIndex(config: Route[], url: TreeNode<UrlSegment>): MatchResult | null {
  for (let r of config) {
    let m = matchWithParts(r, url);
    if (m) return m;
  }
  return null;
}

function matchIndex(config: Route[], url: TreeNode<UrlSegment>): MatchResult | null {
  for (let r of config) {
    if (r.index) {
      const outlet = r.outlet ? r.outlet : PRIMARY_OUTLET;
      const children = r.children ? r.children : [];
      return new MatchResult(r.component, children, [], {}, [url], [], outlet, r);
    }
  }
  return null;
}

function matchWithParts(route: Route, url: TreeNode<UrlSegment>): MatchResult | null {
  if (!route.path) return null;
  if ((route.outlet ? route.outlet : PRIMARY_OUTLET) !== url.value.outlet) return null;

  const path = route.path.startsWith("/") ? route.path.substring(1) : route.path;
  if (path === "**") {
    const consumedUrl = [];
    let u:TreeNode<UrlSegment>|null = url;
    while (u) {
      consumedUrl.push(u.value);
      u = first(u.children);
    }
    const last = consumedUrl[consumedUrl.length - 1];
    return new MatchResult(route.component, [], consumedUrl, last.parameters, [], [], PRIMARY_OUTLET, route);
  }

  const parts = path.split("/");
  const positionalParams = {};
  const consumedUrlSegments = [];

  let lastParent: TreeNode<UrlSegment>|null = null;
  let lastSegment: TreeNode<UrlSegment>|null = null;

  let current: TreeNode<UrlSegment>|null = url;
  for (let i = 0; i < parts.length; ++i) {
    if (!current) return null;

    const p = parts[i];
    const isLastSegment = i === parts.length - 1;
    const isLastParent = i === parts.length - 2;
    const isPosParam = p.startsWith(":");

    if (!isPosParam && p != current.value.path) return null;
    if (isLastSegment) {
      lastSegment = current;
    }
    if (isLastParent) {
      lastParent = current;
    }

    if (isPosParam) {
      positionalParams[p.substring(1)] = current.value.path;
    }

    consumedUrlSegments.push(current.value);

    current = first(current.children);
  }

  if (!lastSegment) throw "Cannot be reached";

  const p = lastSegment.value.parameters;
  const parameters = <{[key: string]: string}>merge(p, positionalParams);
  const secondarySubtrees = lastParent ? lastParent.children.slice(1) : [];
  const children = route.children ? route.children : [];
  const outlet = route.outlet ? route.outlet : PRIMARY_OUTLET;

  return new MatchResult(route.component, children, consumedUrlSegments, parameters, lastSegment.children,
    secondarySubtrees, outlet, route);
}

class MatchResult {
  constructor(public component: Type | string,
              public children: Route[],
              public consumedUrlSegments: UrlSegment[],
              public parameters: {[key: string]: string},
              public leftOverUrl: TreeNode<UrlSegment>[],
              public secondary: TreeNode<UrlSegment>[],
              public outlet: string,
              public route: Route
  ) {}
}