/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, ProviderToken, ɵisInjectable as isInjectable} from '@angular/core';

import {RunGuardsAndResolvers} from '../models';
import {ChildrenOutletContexts, OutletContext} from '../router_outlet_context';
import {
  ActivatedRouteSnapshot,
  equalParamsAndUrlSegments,
  RouterStateSnapshot,
} from '../router_state';
import {equalPath} from '../url_tree';
import {shallowEqual} from '../utils/collection';
import {nodeChildrenAsMap, TreeNode} from '../utils/tree';

export class CanActivate {
  readonly route: ActivatedRouteSnapshot;
  constructor(public path: ActivatedRouteSnapshot[]) {
    this.route = this.path[this.path.length - 1];
  }
}

export class CanDeactivate {
  constructor(
    public component: Object | null,
    public route: ActivatedRouteSnapshot,
  ) {}
}

export declare type Checks = {
  canDeactivateChecks: CanDeactivate[];
  canActivateChecks: CanActivate[];
};

export function getAllRouteGuards(
  future: RouterStateSnapshot,
  curr: RouterStateSnapshot,
  parentContexts: ChildrenOutletContexts,
): Checks {
  const futureRoot = future._root;
  const currRoot = curr ? curr._root : null;

  return getChildRouteGuards(futureRoot, currRoot, parentContexts, [futureRoot.value]);
}

export function getCanActivateChild(
  p: ActivatedRouteSnapshot,
): {node: ActivatedRouteSnapshot; guards: any[]} | null {
  const canActivateChild = p.routeConfig ? p.routeConfig.canActivateChild : null;
  if (!canActivateChild || canActivateChild.length === 0) return null;
  return {node: p, guards: canActivateChild};
}

export function getTokenOrFunctionIdentity<T>(
  tokenOrFunction: Function | ProviderToken<T>,
  injector: Injector,
): Function | T {
  const NOT_FOUND = Symbol();
  const result = injector.get<T | Symbol>(tokenOrFunction as ProviderToken<T>, NOT_FOUND);
  if (result === NOT_FOUND) {
    if (typeof tokenOrFunction === 'function' && !isInjectable(tokenOrFunction)) {
      // We think the token is just a function so return it as-is
      return tokenOrFunction;
    } else {
      // This will throw the not found error
      return injector.get(tokenOrFunction as ProviderToken<T>);
    }
  }
  return result as T;
}

function getChildRouteGuards(
  futureNode: TreeNode<ActivatedRouteSnapshot>,
  currNode: TreeNode<ActivatedRouteSnapshot> | null,
  contexts: ChildrenOutletContexts | null,
  futurePath: ActivatedRouteSnapshot[],
  checks: Checks = {
    canDeactivateChecks: [],
    canActivateChecks: [],
  },
): Checks {
  const prevChildren = nodeChildrenAsMap(currNode);

  // Process the children of the future route
  futureNode.children.forEach((c) => {
    getRouteGuards(c, prevChildren[c.value.outlet], contexts, futurePath.concat([c.value]), checks);
    delete prevChildren[c.value.outlet];
  });

  // Process any children left from the current route (not active for the future route)
  Object.entries(prevChildren).forEach(([k, v]: [string, TreeNode<ActivatedRouteSnapshot>]) =>
    deactivateRouteAndItsChildren(v, contexts!.getContext(k), checks),
  );

  return checks;
}

function getRouteGuards(
  futureNode: TreeNode<ActivatedRouteSnapshot>,
  currNode: TreeNode<ActivatedRouteSnapshot>,
  parentContexts: ChildrenOutletContexts | null,
  futurePath: ActivatedRouteSnapshot[],
  checks: Checks = {
    canDeactivateChecks: [],
    canActivateChecks: [],
  },
): Checks {
  const future = futureNode.value;
  const curr = currNode ? currNode.value : null;
  const context = parentContexts ? parentContexts.getContext(futureNode.value.outlet) : null;

  // reusing the node
  if (curr && future.routeConfig === curr.routeConfig) {
    const shouldRun = shouldRunGuardsAndResolvers(
      curr,
      future,
      future.routeConfig!.runGuardsAndResolvers,
    );
    if (shouldRun) {
      checks.canActivateChecks.push(new CanActivate(futurePath));
    } else {
      // we need to set the data
      future.data = curr.data;
      future._resolvedData = curr._resolvedData;
    }

    // If we have a component, we need to go through an outlet.
    if (future.component) {
      getChildRouteGuards(
        futureNode,
        currNode,
        context ? context.children : null,
        futurePath,
        checks,
      );

      // if we have a componentless route, we recurse but keep the same outlet map.
    } else {
      getChildRouteGuards(futureNode, currNode, parentContexts, futurePath, checks);
    }

    if (shouldRun && context && context.outlet && context.outlet.isActivated) {
      checks.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, curr));
    }
  } else {
    if (curr) {
      deactivateRouteAndItsChildren(currNode, context, checks);
    }

    checks.canActivateChecks.push(new CanActivate(futurePath));
    // If we have a component, we need to go through an outlet.
    if (future.component) {
      getChildRouteGuards(futureNode, null, context ? context.children : null, futurePath, checks);

      // if we have a componentless route, we recurse but keep the same outlet map.
    } else {
      getChildRouteGuards(futureNode, null, parentContexts, futurePath, checks);
    }
  }

  return checks;
}

function shouldRunGuardsAndResolvers(
  curr: ActivatedRouteSnapshot,
  future: ActivatedRouteSnapshot,
  mode: RunGuardsAndResolvers | undefined,
): boolean {
  if (typeof mode === 'function') {
    return mode(curr, future);
  }
  switch (mode) {
    case 'pathParamsChange':
      return !equalPath(curr.url, future.url);

    case 'pathParamsOrQueryParamsChange':
      return (
        !equalPath(curr.url, future.url) || !shallowEqual(curr.queryParams, future.queryParams)
      );

    case 'always':
      return true;

    case 'paramsOrQueryParamsChange':
      return (
        !equalParamsAndUrlSegments(curr, future) ||
        !shallowEqual(curr.queryParams, future.queryParams)
      );

    case 'paramsChange':
    default:
      return !equalParamsAndUrlSegments(curr, future);
  }
}

function deactivateRouteAndItsChildren(
  route: TreeNode<ActivatedRouteSnapshot>,
  context: OutletContext | null,
  checks: Checks,
): void {
  const children = nodeChildrenAsMap(route);
  const r = route.value;

  Object.entries(children).forEach(([childName, node]) => {
    if (!r.component) {
      deactivateRouteAndItsChildren(node, context, checks);
    } else if (context) {
      deactivateRouteAndItsChildren(node, context.children.getContext(childName), checks);
    } else {
      deactivateRouteAndItsChildren(node, null, checks);
    }
  });

  if (!r.component) {
    checks.canDeactivateChecks.push(new CanDeactivate(null, r));
  } else if (context && context.outlet && context.outlet.isActivated) {
    checks.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, r));
  } else {
    checks.canDeactivateChecks.push(new CanDeactivate(null, r));
  }
}
