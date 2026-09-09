/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  computed,
  createEnvironmentInjector,
  DestroyRef,
  effect,
  EnvironmentInjector,
  Resource,
  runInInjectionContext,
  signal,
  ɵWritable as Writable,
} from '@angular/core';
import {OperatorFunction, pipe} from 'rxjs';
import {ResourceContext, ResourceResult} from '../models';
import {NavigationTransition} from '../navigation_transition';
import {ActivatedRoute, ActivatedRouteSnapshot, initializeActivatedRoute} from '../router_state';
import {TreeNode} from '../utils/tree';
import {
  BLOCKING_SYMBOL,
  InternalRouterResource,
  routerResource,
  SOURCE_RESOURCE_SYMBOL,
} from '../router_resource';
import {switchTap} from './switch_tap';

function initializeRouteResources(route: ActivatedRoute): void {
  if (route._resourceContextSignal !== undefined) {
    return;
  }
  const writableRoute = route as Writable<ActivatedRoute>;
  writableRoute._ownResourcesSignal = signal<ResourceResult>({});
  writableRoute._resourceContextSignal = computed(() => ({
    ...route.parent?._resourceContextSignal?.(),
    ...writableRoute._ownResourcesSignal!(),
  }));
}

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
          if (
            route.routeConfig?.resources !== undefined ||
            route.parent?._resourceContextSignal !== undefined
          ) {
            initializeRouteResources(route);
          }
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

      return Promise.all(resourceSetupPromises).then(() => {
        finalizeResources(targetRouterState._root);
        return Promise.all(blockingResourcePromises);
      });
    }),
  );
}

function finalizeResources(stateNode: TreeNode<ActivatedRoute>): void {
  const route = stateNode.value;
  if (route && route._resourceContextSignal) {
    const resources = route._resourceContextSignal();
    route.resources = resources;
    if (route.snapshot) {
      (route.snapshot as Writable<ActivatedRouteSnapshot>).resources = resources;
    }
    (route._futureSnapshot as Writable<ActivatedRouteSnapshot>).resources = resources;
  }
  for (const childState of stateNode.children) {
    finalizeResources(childState);
  }
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
    // TODO: Consider providing ActivatedRoute to the resource injector.
    childInjector = createEnvironmentInjector([], parentInjector);
    route._localInjector = childInjector; // Attach to route for cleanup
  }

  const context: ResourceContext = {
    params: route.paramsSignal,
    queryParams: route.queryParamsSignal,
    fragment: route.fragmentSignal,
    data: route.dataSignal,
    resources: route._resourceContextSignal!,
  };

  const resourceResultRaw = runInInjectionContext(childInjector, () => resourcesFn(context));
  const resourceResult =
    resourceResultRaw instanceof Promise ? await resourceResultRaw : resourceResultRaw;
  if (abortSignal.aborted || !resourceResult) return;

  const wrappedResult: ResourceResult = {};
  runInInjectionContext(childInjector, () => {
    for (const [key, res] of Object.entries(resourceResult)) {
      if (
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
        (!res ||
          typeof res !== 'object' ||
          typeof (res as Partial<Resource<unknown>>).snapshot !== 'function')
      ) {
        throw new Error(
          `Invalid resource returned for key "${key}". Expected a Resource, but got ${res === null ? 'null' : typeof res}.`,
        );
      }
      wrappedResult[key] = routerResource(res);
    }
  });

  route._ownResourcesSignal?.set(wrappedResult);
  setupBlocking(route, wrappedResult, blockingResourcePromises, abortSignal);
}

function updateExistingResources(
  route: ActivatedRoute,
  blockingResourcePromises: Promise<void>[],
  abortSignal: AbortSignal,
) {
  // This route is reused. We must eagerly update the resource context signals
  // so that resources can react and fetch new data during the pending navigation.
  const ownResources = route._ownResourcesSignal?.();
  if (!ownResources || Object.keys(ownResources).length === 0) {
    return;
  }

  for (const r of Object.values(ownResources)) {
    const underlyingRes = (r as InternalRouterResource)[SOURCE_RESOURCE_SYMBOL];
    if (underlyingRes.status() === 'error') {
      // If a resource previously failed and the route is reused identically,
      // the parameter signals won't change, meaning the internal effect won't automatically refetch.
      // We must manually trigger a reload to ensure the new navigation attempts a retry.
      (underlyingRes as InternalRouterResource).reload?.();
    }
  }

  setupBlocking(route, ownResources, blockingResourcePromises, abortSignal);
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

  for (const res of Object.values(resourceResult)) {
    const internalRes = res as InternalRouterResource;
    if (internalRes[BLOCKING_SYMBOL] !== false) {
      blockingResourcePromises.push(waitForResource(internalRes, childInjector, abortSignal));
    }
  }
}

function waitForResource(
  resource: InternalRouterResource,
  injector: EnvironmentInjector,
  abortSignal: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const underlyingRes = resource[SOURCE_RESOURCE_SYMBOL];
    let isDestroyed = false;
    let cleanup: (() => void) | undefined;

    const onDone = () => {
      cleanup?.();
      resolve();
    };

    abortSignal.addEventListener('abort', onDone, {once: true});

    const blockingEffect = effect(
      () => {
        if (isDestroyed) return;
        const status = underlyingRes.status();
        if (status === 'error') {
          cleanup?.();
          reject(underlyingRes.error());
        } else if (!underlyingRes.isLoading()) {
          cleanup?.();
          resolve();
        }
      },
      {injector, manualCleanup: true},
    );

    const unregisterDestroy = injector.get(DestroyRef).onDestroy(onDone);

    cleanup = () => {
      isDestroyed = true;
      blockingEffect.destroy();
      unregisterDestroy();
      abortSignal.removeEventListener('abort', onDone);
    };
  });
}
