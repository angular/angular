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
  Injectable,
  InjectionToken,
  Injector,
  NgModuleFactory,
  runInInjectionContext,
  Type,
} from '@angular/core';
import {ConnectableObservable, from, Observable, of, Subject} from 'rxjs';
import {finalize, map, mergeMap, refCount, tap} from 'rxjs/operators';

import {DefaultExport, LoadedRouterConfig, Route, Routes} from './models';
import {wrapIntoObservable} from './utils/collection';
import {assertStandalone, validateConfig} from './utils/config';
import {standardizeConfig} from './components/empty_outlet';

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
export const ROUTES = new InjectionToken<Route[][]>(ngDevMode ? 'ROUTES' : '');

type ComponentLoader = Observable<Type<unknown>>;

@Injectable({providedIn: 'root'})
export class RouterConfigLoader {
  private componentLoaders = new WeakMap<Route, ComponentLoader>();
  private childrenLoaders = new WeakMap<Route, Observable<LoadedRouterConfig>>();
  onLoadStartListener?: (r: Route) => void;
  onLoadEndListener?: (r: Route) => void;
  private readonly compiler = inject(Compiler);

  loadComponent(injector: EnvironmentInjector, route: Route): Observable<Type<unknown>> {
    if (this.componentLoaders.get(route)) {
      return this.componentLoaders.get(route)!;
    } else if (route._loadedComponent) {
      return of(route._loadedComponent);
    }

    if (this.onLoadStartListener) {
      this.onLoadStartListener(route);
    }
    const loadRunner = wrapIntoObservable(
      runInInjectionContext(injector, () => route.loadComponent!()),
    ).pipe(
      map(maybeUnwrapDefaultExport),
      tap((component) => {
        if (this.onLoadEndListener) {
          this.onLoadEndListener(route);
        }
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          assertStandalone(route.path ?? '', component);
        route._loadedComponent = component;
      }),
      finalize(() => {
        this.componentLoaders.delete(route);
      }),
    );
    // Use custom ConnectableObservable as share in runners pipe increasing the bundle size too much
    const loader = new ConnectableObservable(loadRunner, () => new Subject<Type<unknown>>()).pipe(
      refCount(),
    );
    this.componentLoaders.set(route, loader);
    return loader;
  }

  loadChildren(parentInjector: Injector, route: Route): Observable<LoadedRouterConfig> {
    if (this.childrenLoaders.get(route)) {
      return this.childrenLoaders.get(route)!;
    } else if (route._loadedRoutes) {
      return of({routes: route._loadedRoutes, injector: route._loadedInjector});
    }

    if (this.onLoadStartListener) {
      this.onLoadStartListener(route);
    }
    const moduleFactoryOrRoutes$ = loadChildren(
      route,
      this.compiler,
      parentInjector,
      this.onLoadEndListener,
    );
    const loadRunner = moduleFactoryOrRoutes$.pipe(
      finalize(() => {
        this.childrenLoaders.delete(route);
      }),
    );
    // Use custom ConnectableObservable as share in runners pipe increasing the bundle size too much
    const loader = new ConnectableObservable(
      loadRunner,
      () => new Subject<LoadedRouterConfig>(),
    ).pipe(refCount());
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
export function loadChildren(
  route: Route,
  compiler: Compiler,
  parentInjector: Injector,
  onLoadEndListener?: (r: Route) => void,
): Observable<LoadedRouterConfig> {
  return wrapIntoObservable(
    runInInjectionContext(parentInjector, () => route.loadChildren!()),
  ).pipe(
    map(maybeUnwrapDefaultExport),
    mergeMap((t) => {
      if (t instanceof NgModuleFactory || Array.isArray(t)) {
        return of(t);
      } else {
        return from(compiler.compileModuleAsync(t));
      }
    }),
    map((factoryOrRoutes: NgModuleFactory<any> | Routes) => {
      if (onLoadEndListener) {
        onLoadEndListener(route);
      }
      // This injector comes from the `NgModuleRef` when lazy loading an `NgModule`. There is
      // no injector associated with lazy loading a `Route` array.
      let injector: EnvironmentInjector | undefined;
      let rawRoutes: Route[];
      let requireStandaloneComponents = false;
      if (Array.isArray(factoryOrRoutes)) {
        rawRoutes = factoryOrRoutes;
        requireStandaloneComponents = true;
      } else {
        injector = factoryOrRoutes.create(parentInjector).injector;
        // When loading a module that doesn't provide `RouterModule.forChild()` preloader
        // will get stuck in an infinite loop. The child module's Injector will look to
        // its parent `Injector` when it doesn't find any ROUTES so it will return routes
        // for it's parent module instead.
        rawRoutes = injector.get(ROUTES, [], {optional: true, self: true}).flat();
      }
      const routes = rawRoutes.map(standardizeConfig);
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
        validateConfig(routes, route.path, requireStandaloneComponents);
      return {routes, injector};
    }),
  );
}

function isWrappedDefaultExport<T>(value: T | DefaultExport<T>): value is DefaultExport<T> {
  // We use `in` here with a string key `'default'`, because we expect `DefaultExport` objects to be
  // dynamically imported ES modules with a spec-mandated `default` key. Thus we don't expect that
  // `default` will be a renamed property.
  return value && typeof value === 'object' && 'default' in value;
}

function maybeUnwrapDefaultExport<T>(input: T | DefaultExport<T>): T {
  // As per `isWrappedDefaultExport`, the `default` key here is generated by the browser and not
  // subject to property renaming, so we reference it with bracket access.
  return isWrappedDefaultExport(input) ? input['default'] : input;
}
