/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  createEnvironmentInjector,
  runInInjectionContext,
  Resource,
  effect,
  DestroyRef,
} from '@angular/core';
import {OperatorFunction, pipe} from 'rxjs';
import {ResourceContext, ResourceResult} from '../models';
import {NavigationTransition} from '../navigation_transition';
import {ActivatedRoute, ActivatedRouteSnapshot, initializeActivatedRoute} from '../router_state';
import {TreeNode} from '../utils/tree';
import {
  BLOCKING_SYMBOL,
  hasValueOrResolved,
  InternalRouterResource,
  routerResource,
  SOURCE_RESOURCE_SYMBOL,
} from '../router_resource';
import {switchTap} from './switch_tap';

export function setupAndRunResources(
  abortSignal: AbortSignal,
): OperatorFunction<NavigationTransition, NavigationTransition> {
  return pipe(
    switchTap(({newlyCreatedRoutes, targetRouterState}) => {
      if (!newlyCreatedRoutes || !targetRouterState || abortSignal.aborted) {
        return;
      }

      const resourceSetupPromises: Array<Promise<void>> = [];
      const blockingResourcePromises: Array<Promise<void>> = [];

      const traverse = (stateNode: TreeNode<ActivatedRoute>) => {
        const route = stateNode.value;
        if (route) {
          initializeActivatedRoute(route);
          processRoute(
            route,
            newlyCreatedRoutes,
            resourceSetupPromises,
            abortSignal,
            blockingResourcePromises,
          );
        }

        for (const childState of stateNode.children) {
          traverse(childState);
        }
      };

      traverse(targetRouterState._root);

      return Promise.all(resourceSetupPromises).then(() => Promise.all(blockingResourcePromises));
    }),
  );
}

function processRoute(
  route: ActivatedRoute,
  newlyCreatedRoutes: Set<ActivatedRoute>,
  resourceSetupPromises: Array<Promise<void>>,
  abortSignal: AbortSignal,
  blockingResourcePromises: Array<Promise<void>>,
) {
  const resources = route.routeConfig?.resources;
  if (!resources) {
    return;
  }

  if (newlyCreatedRoutes.has(route)) {
    // This route is new. We need to run its resources function once.
    resourceSetupPromises.push(
      setupNewRouterResources(route._futureSnapshot, route, abortSignal, blockingResourcePromises),
    );
  } else {
    updateExistingResources(route, blockingResourcePromises, abortSignal);
  }
}

async function setupNewRouterResources(
  snapshot: ActivatedRouteSnapshot,
  route: ActivatedRoute,
  abortSignal: AbortSignal,
  blockingResourcePromises: Promise<void>[],
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
  setupBlocking(route, wrappedResult, blockingResourcePromises, abortSignal);
}

function updateExistingResources(
  route: ActivatedRoute,
  blockingResourcePromises: Promise<void>[],
  abortSignal: AbortSignal,
) {
  // This route is reused. We must eagerly update the resource context signals
  // so that resources can react and fetch new data during the pending navigation.
  const currentResources = route.snapshot?.resources;
  if (!currentResources) {
    return;
  }

  Object.values(currentResources).forEach((r) => {
    const underlyingRes = (r as InternalRouterResource)[SOURCE_RESOURCE_SYMBOL];
    if (underlyingRes.status() === 'error') {
      // If a resource previously failed and the route is reused identically,
      // the parameter signals won't change, meaning the internal effect won't automatically refetch.
      // We must manually trigger a reload to ensure the new navigation attempts a retry.
      (underlyingRes as unknown as {reload?: () => boolean}).reload?.();
    }
  });

  route._futureSnapshot.resources = currentResources;
  setupBlocking(route, currentResources, blockingResourcePromises, abortSignal);
}

function setupBlocking(
  route: ActivatedRoute,
  resourceResult: ResourceResult,
  blockingResourcePromises: Array<Promise<void>>,
  abortSignal: AbortSignal,
) {
  if (abortSignal.aborted) return;
  const childInjector = route._localInjector;
  if (!childInjector || !resourceResult) return;

  for (const r of Object.values(resourceResult)) {
    const res = r as InternalRouterResource;
    if (res[BLOCKING_SYMBOL] === false) {
      continue;
    }
    const promise = new Promise<void>((resolve, reject) => {
      const underlyingRes = res[SOURCE_RESOURCE_SYMBOL];
      let isDestroyed = false;
      let unregisterOnDestroy: (() => void) | undefined;

      const cleanup = () => {
        isDestroyed = true;
        blockingEffect.destroy();
        unregisterOnDestroy?.();
        abortSignal.removeEventListener('abort', onAbort);
      };

      const onAbort = () => {
        cleanup();
        resolve();
      };

      abortSignal.addEventListener('abort', onAbort, {once: true});

      const blockingEffect = effect(
        () => {
          if (isDestroyed) {
            return;
          }
          const status = underlyingRes.status();
          if (status === 'error') {
            cleanup();
            reject(underlyingRes.error());
          } else if (hasValueOrResolved(underlyingRes)) {
            cleanup();
            resolve();
          }
        },
        {injector: childInjector, manualCleanup: true},
      );

      unregisterOnDestroy = childInjector.get(DestroyRef).onDestroy(() => {
        cleanup();
        resolve();
      });
    });
    blockingResourcePromises.push(promise);
  }
}
