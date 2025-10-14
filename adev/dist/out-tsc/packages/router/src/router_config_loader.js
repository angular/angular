/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  Compiler,
  inject,
  Injectable,
  InjectionToken,
  NgModuleFactory,
  runInInjectionContext,
  ɵresolveComponentResources as resolveComponentResources,
} from '@angular/core';
import {ConnectableObservable, from, of, Subject} from 'rxjs';
import {finalize, map, mergeMap, refCount, switchMap, tap} from 'rxjs/operators';
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
export const ROUTES = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'ROUTES' : '',
);
let RouterConfigLoader = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var RouterConfigLoader = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RouterConfigLoader = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    componentLoaders = new WeakMap();
    childrenLoaders = new WeakMap();
    onLoadStartListener;
    onLoadEndListener;
    compiler = inject(Compiler);
    loadComponent(injector, route) {
      if (this.componentLoaders.get(route)) {
        return this.componentLoaders.get(route);
      } else if (route._loadedComponent) {
        return of(route._loadedComponent);
      }
      if (this.onLoadStartListener) {
        this.onLoadStartListener(route);
      }
      const loadRunner = wrapIntoObservable(
        runInInjectionContext(injector, () => route.loadComponent()),
      ).pipe(
        map(maybeUnwrapDefaultExport),
        switchMap(maybeResolveResources),
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
      const loader = new ConnectableObservable(loadRunner, () => new Subject()).pipe(refCount());
      this.componentLoaders.set(route, loader);
      return loader;
    }
    loadChildren(parentInjector, route) {
      if (this.childrenLoaders.get(route)) {
        return this.childrenLoaders.get(route);
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
      const loader = new ConnectableObservable(loadRunner, () => new Subject()).pipe(refCount());
      this.childrenLoaders.set(route, loader);
      return loader;
    }
  };
  return (RouterConfigLoader = _classThis);
})();
export {RouterConfigLoader};
/**
 * Executes a `route.loadChildren` callback and converts the result to an array of child routes and
 * an injector if that callback returned a module.
 *
 * This function is used for the route discovery during prerendering
 * in @angular-devkit/build-angular. If there are any updates to the contract here, it will require
 * an update to the extractor.
 */
export function loadChildren(route, compiler, parentInjector, onLoadEndListener) {
  return wrapIntoObservable(runInInjectionContext(parentInjector, () => route.loadChildren())).pipe(
    map(maybeUnwrapDefaultExport),
    switchMap(maybeResolveResources),
    mergeMap((t) => {
      if (t instanceof NgModuleFactory || Array.isArray(t)) {
        return of(t);
      } else {
        return from(compiler.compileModuleAsync(t));
      }
    }),
    map((factoryOrRoutes) => {
      if (onLoadEndListener) {
        onLoadEndListener(route);
      }
      // This injector comes from the `NgModuleRef` when lazy loading an `NgModule`. There is
      // no injector associated with lazy loading a `Route` array.
      let injector;
      let rawRoutes;
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
function isWrappedDefaultExport(value) {
  // We use `in` here with a string key `'default'`, because we expect `DefaultExport` objects to be
  // dynamically imported ES modules with a spec-mandated `default` key. Thus we don't expect that
  // `default` will be a renamed property.
  return value && typeof value === 'object' && 'default' in value;
}
function maybeUnwrapDefaultExport(input) {
  // As per `isWrappedDefaultExport`, the `default` key here is generated by the browser and not
  // subject to property renaming, so we reference it with bracket access.
  return isWrappedDefaultExport(input) ? input['default'] : input;
}
function maybeResolveResources(value) {
  // In JIT mode we usually resolve the resources of components on bootstrap, however
  // that won't have happened for lazy-loaded components. Attempt to load any pending
  // resources again here.
  if ((typeof ngJitMode === 'undefined' || ngJitMode) && typeof fetch === 'function') {
    return resolveComponentResources(fetch)
      .catch((error) => {
        console.error(error);
        return Promise.resolve();
      })
      .then(() => value);
  }
  return of(value);
}
//# sourceMappingURL=router_config_loader.js.map
