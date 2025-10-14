/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵisInjectable as isInjectable} from '@angular/core';
import {equalParamsAndUrlSegments} from '../router_state';
import {equalPath} from '../url_tree';
import {shallowEqual} from '../utils/collection';
import {nodeChildrenAsMap} from '../utils/tree';
export class CanActivate {
  constructor(path) {
    this.path = path;
    this.route = this.path[this.path.length - 1];
  }
}
export class CanDeactivate {
  constructor(component, route) {
    this.component = component;
    this.route = route;
  }
}
export function getAllRouteGuards(future, curr, parentContexts) {
  const futureRoot = future._root;
  const currRoot = curr ? curr._root : null;
  return getChildRouteGuards(futureRoot, currRoot, parentContexts, [futureRoot.value]);
}
export function getCanActivateChild(p) {
  const canActivateChild = p.routeConfig ? p.routeConfig.canActivateChild : null;
  if (!canActivateChild || canActivateChild.length === 0) return null;
  return {node: p, guards: canActivateChild};
}
export function getTokenOrFunctionIdentity(tokenOrFunction, injector) {
  const NOT_FOUND = Symbol();
  const result = injector.get(tokenOrFunction, NOT_FOUND);
  if (result === NOT_FOUND) {
    if (typeof tokenOrFunction === 'function' && !isInjectable(tokenOrFunction)) {
      // We think the token is just a function so return it as-is
      return tokenOrFunction;
    } else {
      // This will throw the not found error
      return injector.get(tokenOrFunction);
    }
  }
  return result;
}
function getChildRouteGuards(
  futureNode,
  currNode,
  contexts,
  futurePath,
  checks = {
    canDeactivateChecks: [],
    canActivateChecks: [],
  },
) {
  const prevChildren = nodeChildrenAsMap(currNode);
  // Process the children of the future route
  futureNode.children.forEach((c) => {
    getRouteGuards(c, prevChildren[c.value.outlet], contexts, futurePath.concat([c.value]), checks);
    delete prevChildren[c.value.outlet];
  });
  // Process any children left from the current route (not active for the future route)
  Object.entries(prevChildren).forEach(([k, v]) =>
    deactivateRouteAndItsChildren(v, contexts.getContext(k), checks),
  );
  return checks;
}
function getRouteGuards(
  futureNode,
  currNode,
  parentContexts,
  futurePath,
  checks = {
    canDeactivateChecks: [],
    canActivateChecks: [],
  },
) {
  const future = futureNode.value;
  const curr = currNode ? currNode.value : null;
  const context = parentContexts ? parentContexts.getContext(futureNode.value.outlet) : null;
  // reusing the node
  if (curr && future.routeConfig === curr.routeConfig) {
    const shouldRun = shouldRunGuardsAndResolvers(
      curr,
      future,
      future.routeConfig.runGuardsAndResolvers,
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
function shouldRunGuardsAndResolvers(curr, future, mode) {
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
function deactivateRouteAndItsChildren(route, context, checks) {
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
//# sourceMappingURL=preactivation.js.map
