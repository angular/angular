import { UrlTree, UrlSegment } from './url_tree';
import { flatten, first, merge } from './utils/collection';
import { TreeNode, rootNode } from './utils/tree';
import { RouterState, ActivatedRoute } from './router_state';
import { Params, PRIMARY_OUTLET } from './shared';
import { RouterConfig, Route } from './config';
import { Type } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export function recognize(config: RouterConfig, url: UrlTree, existingState: RouterState): Observable<RouterState> {
  try {
    const match = new MatchResult(existingState.root.component, config, [url.root], {}, rootNode(url).children, [], PRIMARY_OUTLET);
    (<any>existingState.queryParams).next(url.queryParameters);
    (<any>existingState.fragment).next(url.fragment);
    const roots = constructActivatedRoute(match, rootNode(existingState));
    const res = new RouterState(roots[0], existingState.queryParams, existingState.fragment);
    return new Observable<RouterState>(obs => {
      obs.next(res);
      obs.complete();
    });
  } catch(e) {
    return new Observable<RouterState>(obs => obs.error(e));
  }
}

function constructActivatedRoute(match: MatchResult, existingRoute: TreeNode<ActivatedRoute> | null): TreeNode<ActivatedRoute>[] {
  const activatedRoute = createOrReuseRoute(match, existingRoute);
  const existingChildren = existingRoute ? existingRoute.children : [];

  if (match.leftOverUrl.length > 0) {
    const children = recognizeMany(match.children, match.leftOverUrl, existingChildren);
    checkOutletNameUniqueness(children);
    return [new TreeNode<ActivatedRoute>(activatedRoute, children)];
  } else {
    return [new TreeNode<ActivatedRoute>(activatedRoute, [])];
  }
}

function recognizeMany(config: Route[], urls: TreeNode<UrlSegment>[],
                       existingRoutes: TreeNode<ActivatedRoute>[]): TreeNode<ActivatedRoute>[] {
  return flatten(urls.map(url => recognizeOne(config, url, existingRoutes)));
}

function createOrReuseRoute(match: MatchResult, existing: TreeNode<ActivatedRoute> | null): ActivatedRoute {
  if (existing) {
    const v = existing.value;
    if (v.component === match.component && v.outlet === match.outlet) {
      (<any>(v.params)).next(match.parameters);
      (<any>(v.urlSegments)).next(match.consumedUrlSegments);
      return v;
    }
  }
  return new ActivatedRoute(new BehaviorSubject(match.consumedUrlSegments), new BehaviorSubject(match.parameters), match.outlet, match.component);
}

function recognizeOne(config: Route[], url: TreeNode<UrlSegment>,
                      existingRoutes: TreeNode<ActivatedRoute>[]): TreeNode<ActivatedRoute>[] {
  let m = match(config, url);

  const routesWithRightOutlet = existingRoutes.filter(r => r.value.outlet == m.outlet);
  const routeWithRightOutlet = routesWithRightOutlet.length > 0 ? routesWithRightOutlet[0] : null;

  const primary = constructActivatedRoute(m, routeWithRightOutlet);
  const secondary = recognizeMany(config, m.secondary, existingRoutes);
  const res = primary.concat(secondary);
  checkOutletNameUniqueness(res);
  return res;
}

function checkOutletNameUniqueness(nodes: TreeNode<ActivatedRoute>[]): TreeNode<ActivatedRoute>[] {
  let names = {};
  nodes.forEach(n => {
    let routeWithSameOutletName = names[n.value.outlet];
    if (routeWithSameOutletName) {
      const p = (<any>routeWithSameOutletName.urlSegments).value.map(s => s.toString()).join("/");
      const c = (<any>n.value.urlSegments).value.map(s => s.toString()).join("/");
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
      return new MatchResult(r.component, children, [], {}, [url], [], outlet);
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
    return new MatchResult(route.component, [], consumedUrl, last.parameters, [], [], PRIMARY_OUTLET);
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
    secondarySubtrees, outlet);
}

class MatchResult {
  constructor(public component: Type | string,
              public children: Route[],
              public consumedUrlSegments: UrlSegment[],
              public parameters: {[key: string]: string},
              public leftOverUrl: TreeNode<UrlSegment>[],
              public secondary: TreeNode<UrlSegment>[],
              public outlet: string
  ) {}
}