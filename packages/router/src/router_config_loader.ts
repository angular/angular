/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Compiler,
  EnvironmentInjector,
  inject,
  InjectionToken,
  Injector,
  ɵmaybeUnwrapDefaultExport as maybeUnwrapDefaultExport,
  NgModuleFactory,
  ɵresolveComponentResources as resolveComponentResources,
  runInInjectionContext,
  Service,
  Type,
} from '@angular/core';

import {standardizeConfig} from './components/empty_outlet';
import {LoadedRouterConfig, Route, Routes} from './models';
import {wrapIntoPromise} from './utils/collection';
import {assertStandalone, validateConfig} from './utils/config';

/**
 * The DI token for a router configuration.
 *
 * `ROUTES` is a low level API for router configuration via dependency injection.
 *
 * We recommend that in almost all cases to use higher level APIs such as `RouterModule.forRoot()`,
 * `provideRouter`, or `Router.resetConfig()`.
 *
 * @publicApi
 */
export const ROUTES = new InjectionToken<Route[][]>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'ROUTES' : '',
);

@Service()
export class RouterConfigLoader {
  private componentLoaders = new WeakMap<Route, Promise<Type<unknown>>>();
  private childrenLoaders = new WeakMap<Route, Promise<LoadedRouterConfig>>();
  onLoadStartListener?: (r: Route) => void;
  onLoadEndListener?: (r: Route) => void;
  private readonly compiler = inject(Compiler);

  async loadComponent(injector: EnvironmentInjector, route: Route): Promise<Type<unknown>> {
    if (this.componentLoaders.get(route)) {
      return this.componentLoaders.get(route)!;
    } else if (route._loadedComponent) {
      return Promise.resolve(route._loadedComponent);
    }

    if (this.onLoadStartListener) {
      this.onLoadStartListener(route);
    }
    const loader = (async () => {
      try {
        const loaded = await wrapIntoPromise(
          runInInjectionContext(injector, () => route.loadComponent!()),
        );
        const component = await maybeResolveResources(maybeUnwrapDefaultExport(loaded));

        if (this.onLoadEndListener) {
          this.onLoadEndListener(route);
        }
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          assertStandalone(route.path ?? '', component);
        route._loadedComponent = component;
        return component;
      } finally {
        this.componentLoaders.delete(route);
      }
    })();
    this.componentLoaders.set(route, loader);
    return loader;
  }

  loadChildren(parentInjector: Injector, route: Route): Promise<LoadedRouterConfig> {
    if (this.childrenLoaders.get(route)) {
      return this.childrenLoaders.get(route)!;
    } else if (route._loadedRoutes) {
      return Promise.resolve({routes: route._loadedRoutes, injector: route._loadedInjector});
    }

    if (this.onLoadStartListener) {
      this.onLoadStartListener(route);
    }
    const loader = (async () => {
      try {
        const result = await loadChildren(
          route,
          this.compiler,
          parentInjector,
          this.onLoadEndListener,
        );
        route._loadedRoutes = result.routes;
        route._loadedInjector = result.injector;
        route._loadedNgModuleFactory = result.factory;
        return result;
      } finally {
        this.childrenLoaders.delete(route);
      }
    })();
    this.childrenLoaders.set(route, loader);
    return loader;
  }
}

/**
 * Executes a `route.loadChildren` callback and converts the result to an array of child routes and
 * an injector if that callback returned a module.
 *
 * This function is used for the route discovery during prerendering
 * in @angular-devkit/build-angular. If there are any updates to the contract here, it will require
 * an update to the extractor.
 */
export async function loadChildren(
  route: Route,
  compiler: Compiler,
  parentInjector: Injector,
  onLoadEndListener?: (r: Route) => void,
): Promise<LoadedRouterConfig> {
  const loaded = await wrapIntoPromise(
    runInInjectionContext(parentInjector, () => route.loadChildren!()),
  );
  const t = await maybeResolveResources(maybeUnwrapDefaultExport(loaded));

  let factoryOrRoutes: NgModuleFactory<any> | Routes;
  if (t instanceof NgModuleFactory || Array.isArray(t)) {
    factoryOrRoutes = t;
  } else {
    factoryOrRoutes = await compiler.compileModuleAsync(t);
  }

  if (onLoadEndListener) {
    onLoadEndListener(route);
  }
  // This injector comes from the `NgModuleRef` when lazy loading an `NgModule`. There is
  // no injector associated with lazy loading a `Route` array.
  let injector: EnvironmentInjector | undefined;
  let rawRoutes: Route[];
  let requireStandaloneComponents = false;
  let factory: NgModuleFactory<unknown> | undefined = undefined;
  if (Array.isArray(factoryOrRoutes)) {
    rawRoutes = factoryOrRoutes;
    requireStandaloneComponents = true;
  } else {
    injector = factoryOrRoutes.create(parentInjector).injector;
    factory = factoryOrRoutes;
    // When loading a module that doesn't provide `RouterModule.forChild()` preloader
    // will get stuck in an infinite loop. The child module's Injector will look to
    // its parent `Injector` when it doesn't find any ROUTES so it will return routes
    // for it's parent module instead.
    rawRoutes = injector.get(ROUTES, [], {optional: true, self: true}).flat();
  }
  const routes = rawRoutes.map(standardizeConfig);
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    validateConfig(routes, route.path, requireStandaloneComponents);
  return {routes, injector, factory};
}

async function maybeResolveResources<T>(value: T): Promise<T> {
  // In JIT mode we usually resolve the resources of components on bootstrap, however
  // that won't have happened for lazy-loaded. Attempt to load any pending
  // resources again here.
  if ((typeof ngJitMode === 'undefined' || ngJitMode) && typeof fetch === 'function') {
    try {
      await resolveComponentResources(fetch);
    } catch (error) {
      console.error(error);
    }
  }

  return value;
}
