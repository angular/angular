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
  ResourceParamsStatus,
  runInInjectionContext,
  signal,
} from '@angular/core';
import {OperatorFunction, pipe} from 'rxjs';
import {ResourceContext, ResourceResult, Route} from '../models';
import {NavigationTransition} from '../navigation_transition';
import {ActivatedRoute, initializeActivatedRoute} from '../router_state';
import {TreeNode} from '../utils/tree';
import {
  BLOCKING_SYMBOL,
  InternalRouterResource,
  routerResource,
  SOURCE_RESOURCE_SYMBOL,
} from '../router_resource';
import {switchTap} from './switch_tap';

/**
 * Initializes `_resourceContextSignal` (backing `ctx.resources` for descendants) on a route.
 *
 * Runs in a synchronous top-down pre-pass before any `resources` functions execute so that
 * descendants always have a signal to read even while an ancestor's async `resources` function
 * is still pending.
 */
function initializeRouteResources(route: ActivatedRoute): void {
  if (route._resourceContextSignal !== undefined) {
    return;
  }
  // Note: Inherited resources are bound to the parent `ActivatedRoute` at activation time.
  // If a custom `RouteReuseStrategy` detaches a child route while an ancestor route with
  // `resources` is deactivated, the ancestor's `_localInjector` (and its resources) will be
  // destroyed on deactivation, which is not supported when reattaching the child under a new parent.
  const parentContextSignal = route.parent?._resourceContextSignal;
  if (!route.routeConfig?.resources) {
    route._resourceContextSignal = parentContextSignal;
    return;
  }
  const ownRawResources = signal<ResourceResult | undefined>(undefined);
  route._ownRawResourcesSignal = ownRawResources;
  route._resourceContextSignal = computed(() => {
    const parentResources = parentContextSignal?.();
    const ownResources = ownRawResources();
    if (ownResources === undefined) {
      // Throw LOADING while this route's async `resources` setup is still in flight so
      // descendant resources reading `ctx.resources()` inside `params` stay in loading state.
      throw ResourceParamsStatus.LOADING;
    }
    return {
      ...parentResources,
      ...ownResources,
    };
  });
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
          processRoute(route, newlyCreatedRoutes, resourceSetupPromises, abortSignal);
        }

        for (const childState of stateNode.children) {
          traverse(childState);
        }
      };

      traverse(targetRouterState._root);

      return Promise.all(resourceSetupPromises).then(() => {
        finalizeResources(targetRouterState._root, blockingResourcePromises, abortSignal);
        return Promise.all(blockingResourcePromises);
      });
    }),
  );
}

/**
 * Populates `route.resources` and `route._futureSnapshot.resources` top-down once all
 * `resources` functions have completed, and registers blocking resource promises.
 */
function finalizeResources(
  stateNode: TreeNode<ActivatedRoute>,
  blockingResourcePromises: Array<Promise<void>>,
  abortSignal: AbortSignal,
): void {
  const route = stateNode.value;
  if (route && route._resourceContextSignal) {
    route.resources ??= {
      ...route.parent?.resources,
      ...route._ownResources,
    };
    route._futureSnapshot.resources = route.resources;
    if (route._ownResources) {
      setupBlocking(route, route._ownResources, blockingResourcePromises, abortSignal);
    }
  }
  for (const childState of stateNode.children) {
    finalizeResources(childState, blockingResourcePromises, abortSignal);
  }
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
    resourceSetupPromises.push(setupNewRouterResources(route, resources, abortSignal));
  } else {
    updateExistingResources(route);
  }
}

async function setupNewRouterResources(
  route: ActivatedRoute,
  resourcesFn: NonNullable<Route['resources']>,
  abortSignal: AbortSignal,
) {
  const parentInjector = route._futureSnapshot._environmentInjector;

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
    resources: route.parent?._resourceContextSignal ?? signal<ResourceResult>({}).asReadonly(),
  };

  const resourceResultRaw = runInInjectionContext(childInjector, () => resourcesFn(context));
  const resourceResult =
    resourceResultRaw instanceof Promise ? await resourceResultRaw : resourceResultRaw;
  if (abortSignal.aborted) return;
  if (!resourceResult) {
    route._ownRawResourcesSignal?.set({});
    return;
  }

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

  // `_ownResources` holds the `routerResource()` wrappers (which freeze state during navigation
  // for UI consumers on `ActivatedRoute.resources`), while `_ownRawResourcesSignal` exposes the
  // raw unfrozen resources to descendants via `ctx.resources()` so chained resources can resolve.
  route._ownResources = wrappedResult;
  route._ownRawResourcesSignal?.set(resourceResult);
}

function updateExistingResources(route: ActivatedRoute) {
  // This route is reused. If a resource previously failed and the route is reused identically,
  // the parameter signals won't change, meaning the internal effect won't automatically refetch.
  // We must manually trigger a reload to ensure the new navigation attempts a retry.
  const ownResources = route._ownResources;
  if (!ownResources) {
    return;
  }

  for (const r of Object.values(ownResources)) {
    const underlyingRes = (r as InternalRouterResource)[SOURCE_RESOURCE_SYMBOL];
    if (underlyingRes.status() === 'error') {
      (underlyingRes as Partial<InternalRouterResource>).reload?.();
    }
  }
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
    let unregisterDestroy: (() => void) | undefined;

    const cleanup = () => {
      isDestroyed = true;
      blockingEffect.destroy();
      unregisterDestroy?.();
      abortSignal.removeEventListener('abort', onDone);
    };

    const onDone = () => {
      cleanup();
      resolve();
    };

    abortSignal.addEventListener('abort', onDone, {once: true});

    const blockingEffect = effect(
      () => {
        if (isDestroyed) return;
        const status = underlyingRes.status();
        if (status === 'error') {
          cleanup();
          reject(underlyingRes.error());
        } else if (!underlyingRes.isLoading()) {
          cleanup();
          resolve();
        }
      },
      {injector, manualCleanup: true},
    );

    unregisterDestroy = injector.get(DestroyRef).onDestroy(onDone);
  });
}
