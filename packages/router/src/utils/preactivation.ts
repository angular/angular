/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, ProviderToken, ɵisInjectable as isInjectable} from '@angular/core';

import {
  CanActivateChild,
  CanActivateChildFn,
  DeprecatedGuard,
  RunGuardsAndResolvers,
} from '../models';
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
  readonly route: ActivatedRouteSnapshot;
  readonly path: ActivatedRouteSnapshot[];
  constructor(
    public component: Object | null,
    path: Array<TreeNode<ActivatedRouteSnapshot>>,
  ) {
    this.path = path.map((c) => c.value);
    this.route = this.path[this.path.length - 1];
  }
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

  return getChildRouteGuards(futureRoot, currRoot ? [currRoot] : null, parentContexts, [
    futureRoot.value,
  ]);
}

export function getCanActivateChild(
  route: ActivatedRouteSnapshot,
): {route: ActivatedRouteSnapshot; guards: Array<CanActivateChildFn | DeprecatedGuard>} | null {
  const guards = route.routeConfig ? route.routeConfig.canActivateChild : null;
  if (!guards || guards.length === 0) return null;
  return {route, guards};
}

export function getTokenOrFunctionIdentity<TokenType, FunctionType>(
  tokenOrFunction: FunctionType | ProviderToken<TokenType> | string,
  injector: Injector,
): TokenType | FunctionType {
  const NOT_FOUND = Symbol();
  const result = injector.get(tokenOrFunction as ProviderToken<TokenType>, NOT_FOUND);
  if (result === NOT_FOUND) {
    if (typeof tokenOrFunction === 'function' && !isInjectable(tokenOrFunction)) {
      // We think the token is just a function so return it as-is
      return tokenOrFunction as FunctionType;
    } else {
      // This will throw the not found error
      return injector.get(tokenOrFunction as ProviderToken<TokenType>);
    }
  }
  return result as TokenType;
}

function getChildRouteGuards(
  futureNode: TreeNode<ActivatedRouteSnapshot>,
  currentPath: Array<TreeNode<ActivatedRouteSnapshot>> | null,
  contexts: ChildrenOutletContexts | null,
  futurePath: ActivatedRouteSnapshot[],
  checks: Checks = {
    canDeactivateChecks: [],
    canActivateChecks: [],
  },
): Checks {
  const currNode = currentPath ? currentPath[currentPath.length - 1] : null;
  const prevChildren = nodeChildrenAsMap(currNode);

  // Process the children of the future route
  futureNode.children.forEach((c) => {
    const currentChild = prevChildren[c.value.outlet] ?? null;
    const childPath = currentChild ? [...currentPath!, currentChild] : null;
    getRouteGuards(c, childPath, contexts, futurePath.concat([c.value]), checks);
    delete prevChildren[c.value.outlet];
  });

  // Process any children left from the current route (not active for the future route)
  Object.entries(prevChildren).forEach(([k, v]: [string, TreeNode<ActivatedRouteSnapshot>]) =>
    deactivateRouteAndItsChildren([...currentPath!, v], contexts!.getContext(k), checks),
  );

  return checks;
}

function getRouteGuards(
  futureNode: TreeNode<ActivatedRouteSnapshot>,
  currentPath: Array<TreeNode<ActivatedRouteSnapshot>> | null,
  parentContexts: ChildrenOutletContexts | null,
  futurePath: ActivatedRouteSnapshot[],
  checks: Checks = {
    canDeactivateChecks: [],
    canActivateChecks: [],
  },
): Checks {
  const currNode = currentPath ? currentPath[currentPath.length - 1] : null;
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
        currentPath,
        context ? context.children : null,
        futurePath,
        checks,
      );

      // if we have a componentless route, we recurse but keep the same outlet map.
    } else {
      getChildRouteGuards(futureNode, currentPath, parentContexts, futurePath, checks);
    }

    if (shouldRun && context && context.outlet && context.outlet.isActivated) {
      checks.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, currentPath!));
    }
  } else {
    if (curr) {
      deactivateRouteAndItsChildren(currentPath!, context, checks);
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
  currentPath: Array<TreeNode<ActivatedRouteSnapshot>>,
  context: OutletContext | null,
  checks: Checks,
): void {
  const route = currentPath[currentPath.length - 1];
  const children = nodeChildrenAsMap(route);
  const r = route.value;

  Object.entries(children).forEach(([childName, node]) => {
    const childPath = [...currentPath, node];
    if (!r.component) {
      deactivateRouteAndItsChildren(childPath, context, checks);
    } else if (context) {
      deactivateRouteAndItsChildren(childPath, context.children.getContext(childName), checks);
    } else {
      deactivateRouteAndItsChildren(childPath, null, checks);
    }
  });

  const childPath = [...currentPath, route];
  if (!r.component) {
    checks.canDeactivateChecks.push(new CanDeactivate(null, childPath));
  } else if (context && context.outlet && context.outlet.isActivated) {
    checks.canDeactivateChecks.push(new CanDeactivate(context.outlet.component, childPath));
  } else {
    checks.canDeactivateChecks.push(new CanDeactivate(null, childPath));
  }
}
