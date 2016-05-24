import { UrlTree, UrlSegment, equalUrlSegments } from './url_tree';
import { shallowEqual, flatten, first, merge } from './utils/collection';
import { TreeNode, rootNode } from './utils/tree';
import { RouterState, ActivatedRoute, Params, PRIMARY_OUTLET } from './router_state';
import { RouterConfig, Route } from './config';
import { ComponentResolver, ComponentFactory, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export function recognize(componentResolver: ComponentResolver, config: RouterConfig,
                          url: UrlTree, existingState: RouterState): Promise<RouterState> {
  const match = new MatchResult(existingState.root.component, config, [url.root], {}, rootNode(url).children, [], PRIMARY_OUTLET);
  return constructActivatedRoute(componentResolver, match, rootNode(existingState)).
    then(roots => {
      (<any>existingState.queryParams).next(url.queryParameters);
      (<any>existingState.fragment).next(url.fragment);
      return new RouterState(roots[0], existingState.queryParams, existingState.fragment);
    });
}

function constructActivatedRoute(componentResolver: ComponentResolver, match: MatchResult,
                                 existingRoute: TreeNode<ActivatedRoute> | null): Promise<TreeNode<ActivatedRoute>[]> {
  //TODO: remove the cast after Angular is fixed
  return componentResolver.resolveComponent(<any>match.component).then(factory => {
      const activatedRoute = createOrReuseRoute(match, factory, existingRoute);
      const existingChildren = existingRoute ? existingRoute.children : [];

      if (match.leftOverUrl.length > 0) {
        return recognizeMany(componentResolver, match.children, match.leftOverUrl, existingChildren)
          .then(checkOutletNameUniqueness)
          .then(children => [new TreeNode<ActivatedRoute>(activatedRoute, children)]);
      } else {
        return Promise.resolve([new TreeNode<ActivatedRoute>(activatedRoute, [])]);
      }
    });
}

function recognizeMany(componentResolver: ComponentResolver, config: Route[], urls: TreeNode<UrlSegment>[],
                       existingRoutes: TreeNode<ActivatedRoute>[]): Promise<TreeNode<ActivatedRoute>[]> {
  const recognized = urls.map(url => recognizeOne(componentResolver, config, url, existingRoutes));
  return Promise.all(<any>recognized).then(<any>flatten);
}

function createOrReuseRoute(match: MatchResult, factory: ComponentFactory<any>, existing: TreeNode<ActivatedRoute> | null): ActivatedRoute {
  if (existing) {
    const v = existing.value;
    if (v.component === match.component && v.outlet === match.outlet) {
      (<any>(v.params)).next(match.parameters);
      (<any>(v.urlSegments)).next(match.consumedUrlSegments);
      return v;
    }
  }
  return new ActivatedRoute(new BehaviorSubject(match.consumedUrlSegments), new BehaviorSubject(match.parameters), match.outlet,
    factory.componentType, factory);
}

function recognizeOne(componentResolver: ComponentResolver, config: Route[],
                    url: TreeNode<UrlSegment>,
                    existingRoutes: TreeNode<ActivatedRoute>[]): Promise<TreeNode<ActivatedRoute>[]> {
  let m;
  try {
    m = match(config, url);
  } catch (e) {
    return <any>Promise.reject(e);
  }

  const routesWithRightOutlet = existingRoutes.filter(r => r.value.outlet == m.outlet);
  const routeWithRightOutlet = routesWithRightOutlet.length > 0 ? routesWithRightOutlet[0] : null;

  const primary = constructActivatedRoute(componentResolver, m, routeWithRightOutlet);
  const secondary = recognizeMany(componentResolver, config, m.secondary, existingRoutes);
  return Promise.all([primary, secondary]).then(flatten).then(checkOutletNameUniqueness);
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

  const availableRoutes = config.map(r => `'${r.path}'`).join(", ");
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
