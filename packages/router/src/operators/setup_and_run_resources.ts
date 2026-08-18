/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createEnvironmentInjector, runInInjectionContext, Resource} from '@angular/core';
import {OperatorFunction, pipe} from 'rxjs';
import {ResourceContext, ResourceResult} from '../models';
import {NavigationTransition} from '../navigation_transition';
import {ActivatedRoute, ActivatedRouteSnapshot, initializeActivatedRoute} from '../router_state';
import {TreeNode} from '../utils/tree';
import {BLOCKING_SYMBOL, InternalRouterResource, routerResource} from '../router_resource';
import {switchTap} from './switch_tap';

export function setupAndRunResources(
  abortSignal: AbortSignal,
): OperatorFunction<NavigationTransition, NavigationTransition> {
  return pipe(
    switchTap(({newlyCreatedRoutes, targetRouterState}) => {
      if (!newlyCreatedRoutes || !targetRouterState) {
        return;
      }

      const resourceSetupPromises: Array<Promise<void>> = [];

      const traverse = (stateNode: TreeNode<ActivatedRoute>) => {
        const route = stateNode.value;
        if (route) {
          initializeActivatedRoute(route);
          processRoute(route, newlyCreatedRoutes, resourceSetupPromises, abortSignal);
        }

        for (const childState of stateNode.children) {
          traverse(childState);
        }
      };

      traverse(targetRouterState._root);

      return Promise.all(resourceSetupPromises);
      // TODO: wait for blocking resources
    }),
  );
}

function processRoute(
  route: ActivatedRoute,
  newlyCreatedRoutes: Set<ActivatedRoute>,
  resourceSetupPromises: Array<Promise<void>>,
  abortSignal: AbortSignal,
) {
  const resources = route.routeConfig?.resources;
  if (!resources) {
    return;
  }

  if (newlyCreatedRoutes.has(route)) {
    // This route is new. We need to run its resources function once.
    resourceSetupPromises.push(setupNewRouterResources(route._futureSnapshot, route, abortSignal));
  } else {
    updateExistingResources(route);
  }
}

async function setupNewRouterResources(
  snapshot: ActivatedRouteSnapshot,
  route: ActivatedRoute,
  abortSignal: AbortSignal,
) {
  const resourcesFn = snapshot?.routeConfig?.resources;
  const parentInjector = snapshot?._environmentInjector;
  if (!resourcesFn || !parentInjector) {
    return;
  }

  let childInjector = route._localInjector;
  if (!childInjector) {
    childInjector = createEnvironmentInjector([], parentInjector);
    route._localInjector = childInjector; // Attach to route for cleanup
  }

  const context: ResourceContext = {
    params: route.paramsSignal,
    queryParams: route.queryParamsSignal,
    fragment: route.fragmentSignal,
    data: route.dataSignal,
    snapshot: route._futureSnapshot,
  };

  const resourceResultRaw = runInInjectionContext(childInjector, () => resourcesFn(context));
  let resourceResult: ResourceResult;
  if (resourceResultRaw instanceof Promise) {
    resourceResult = await resourceResultRaw;
    // Bail out if the router cancelled the navigation (and destroyed our injector!)
    // while we were waiting.
    if (abortSignal.aborted) return;
  } else {
    resourceResult = resourceResultRaw as ResourceResult;
  }

  if (!resourceResult) return;

  const wrappedResult: ResourceResult = {};
  for (const [key, res] of Object.entries(resourceResult)) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (
        !res ||
        typeof res !== 'object' ||
        typeof (res as Partial<Resource<unknown>>).snapshot !== 'function'
      ) {
        throw new Error(
          `Invalid resource returned for key "${key}". Expected a Resource, but got ${res === null ? 'null' : typeof res}.`,
        );
      }
    }

    wrappedResult[key] = runInInjectionContext(childInjector, () => routerResource(res));
  }

  route.resources = route._futureSnapshot.resources = snapshot.resources = wrappedResult;
  prohibitBlockingResources(route, wrappedResult);
}

function updateExistingResources(route: ActivatedRoute) {
  // This route is reused. We must eagerly update the resource context signals
  // so that resources can react and fetch new data during the pending navigation.
  const currentResources = route.snapshot?.resources;
  if (!currentResources) {
    return;
  }

  route._futureSnapshot.resources = currentResources;
  prohibitBlockingResources(route, currentResources);
}

function prohibitBlockingResources(route: ActivatedRoute, resourceResult: ResourceResult) {
  const childInjector = route._localInjector;
  if (!childInjector || !resourceResult) return;

  for (const r of Object.values(resourceResult)) {
    const res = r as InternalRouterResource;
    if (res[BLOCKING_SYMBOL] === false) {
      continue;
    }
    throw new Error('blocking resources not implemented yet');
  }
}
