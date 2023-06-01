/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, EnvironmentInjector, inject, Injectable, InjectFlags, InjectionToken, Injector, NgModuleFactory, Type} from '@angular/core';
import {ConnectableObservable, from, Observable, of, Subject} from 'rxjs';
import {finalize, map, mergeMap, refCount, tap} from 'rxjs/operators';

import {DefaultExport, LoadChildren, LoadChildrenCallback, LoadedRouterConfig, Route, Routes} from './models';
import {wrapIntoObservable} from './utils/collection';
import {assertStandalone, standardizeConfig, validateConfig} from './utils/config';



/**
 * The [DI token](guide/glossary/#di-token) for a router configuration.
 *
 * `ROUTES` is a low level API for router configuration via dependency injection.
 *
 * We recommend that in almost all cases to use higher level APIs such as `RouterModule.forRoot()`,
 * `provideRouter`, or `Router.resetConfig()`.
 *
 * @publicApi
 */
export const ROUTES = new InjectionToken<Route[][]>('ROUTES');

type ComponentLoader = Observable<Type<unknown>>;

@Injectable({providedIn: 'root'})
export class RouterConfigLoader {
  private componentLoaders = new WeakMap<Route, ComponentLoader>();
  private childrenLoaders = new WeakMap<Route, Observable<LoadedRouterConfig>>();
  onLoadStartListener?: (r: Route) => void;
  onLoadEndListener?: (r: Route) => void;
  private readonly compiler = inject(Compiler);

  loadComponent(route: Route): Observable<Type<unknown>> {
    if (this.componentLoaders.get(route)) {
      return this.componentLoaders.get(route)!;
    } else if (route._loadedComponent) {
      return of(route._loadedComponent);
    }

    if (this.onLoadStartListener) {
      this.onLoadStartListener(route);
    }
    const loadRunner = wrapIntoObservable(route.loadComponent!())
                           .pipe(
                               map(maybeUnwrapDefaultExport),
                               tap(component => {
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
    const loader =
        new ConnectableObservable(loadRunner, () => new Subject<Type<unknown>>()).pipe(refCount());
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
    const moduleFactoryOrRoutes$ = this.loadModuleFactoryOrRoutes(route.loadChildren!);
    const loadRunner = moduleFactoryOrRoutes$.pipe(
        map((factoryOrRoutes: NgModuleFactory<any>|Routes) => {
          if (this.onLoadEndListener) {
            this.onLoadEndListener(route);
          }
          // This injector comes from the `NgModuleRef` when lazy loading an `NgModule`. There is no
          // injector associated with lazy loading a `Route` array.
          let injector: EnvironmentInjector|undefined;
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
            rawRoutes = injector.get(ROUTES, [], InjectFlags.Self | InjectFlags.Optional).flat();
          }
          const routes = rawRoutes.map(standardizeConfig);
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
              validateConfig(routes, route.path, requireStandaloneComponents);
          return {routes, injector};
        }),
        finalize(() => {
          this.childrenLoaders.delete(route);
        }),
    );
    // Use custom ConnectableObservable as share in runners pipe increasing the bundle size too much
    const loader = new ConnectableObservable(loadRunner, () => new Subject<LoadedRouterConfig>())
                       .pipe(refCount());
    this.childrenLoaders.set(route, loader);
    return loader;
  }

  private loadModuleFactoryOrRoutes(loadChildren: LoadChildren):
      Observable<NgModuleFactory<any>|Routes> {
    return wrapIntoObservable((loadChildren as LoadChildrenCallback)())
        .pipe(
            map(maybeUnwrapDefaultExport),
            mergeMap((t) => {
              if (t instanceof NgModuleFactory || Array.isArray(t)) {
                return of(t);
              } else {
                return from(this.compiler.compileModuleAsync(t));
              }
            }),
        );
  }
}

function isWrappedDefaultExport<T>(value: T|DefaultExport<T>): value is DefaultExport<T> {
  // We use `in` here with a string key `'default'`, because we expect `DefaultExport` objects to be
  // dynamically imported ES modules with a spec-mandated `default` key. Thus we don't expect that
  // `default` will be a renamed property.
  return value && typeof value === 'object' && 'default' in value;
}

function maybeUnwrapDefaultExport<T>(input: T|DefaultExport<T>): T {
  // As per `isWrappedDefaultExport`, the `default` key here is generated by the browser and not
  // subject to property renaming, so we reference it with bracket access.
  return isWrappedDefaultExport(input) ? input['default'] : input;
}
