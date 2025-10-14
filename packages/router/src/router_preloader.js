/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {createEnvironmentInjector, Injectable} from '@angular/core';
import {from, of} from 'rxjs';
import {catchError, concatMap, filter, mergeAll, mergeMap} from 'rxjs/operators';
import {NavigationEnd} from './events';
/**
 * @description
 *
 * Provides a preloading strategy.
 *
 * @publicApi
 */
export class PreloadingStrategy {}
/**
 * @description
 *
 * Provides a preloading strategy that preloads all modules as quickly as possible.
 *
 * ```ts
 * RouterModule.forRoot(ROUTES, {preloadingStrategy: PreloadAllModules})
 * ```
 *
 * @publicApi
 */
let PreloadAllModules = class PreloadAllModules {
  preload(route, fn) {
    return fn().pipe(catchError(() => of(null)));
  }
};
PreloadAllModules = __decorate([Injectable({providedIn: 'root'})], PreloadAllModules);
export {PreloadAllModules};
/**
 * @description
 *
 * Provides a preloading strategy that does not preload any modules.
 *
 * This strategy is enabled by default.
 *
 * @publicApi
 */
let NoPreloading = class NoPreloading {
  preload(route, fn) {
    return of(null);
  }
};
NoPreloading = __decorate([Injectable({providedIn: 'root'})], NoPreloading);
export {NoPreloading};
/**
 * The preloader optimistically loads all router configurations to
 * make navigations into lazily-loaded sections of the application faster.
 *
 * The preloader runs in the background. When the router bootstraps, the preloader
 * starts listening to all navigation events. After every such event, the preloader
 * will check if any configurations can be loaded lazily.
 *
 * If a route is protected by `canLoad` guards, the preloaded will not load it.
 *
 * @publicApi
 */
let RouterPreloader = class RouterPreloader {
  constructor(router, injector, preloadingStrategy, loader) {
    this.router = router;
    this.injector = injector;
    this.preloadingStrategy = preloadingStrategy;
    this.loader = loader;
  }
  setUpPreloading() {
    this.subscription = this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        concatMap(() => this.preload()),
      )
      .subscribe(() => {});
  }
  preload() {
    return this.processRoutes(this.injector, this.router.config);
  }
  /** @docs-private */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  processRoutes(injector, routes) {
    const res = [];
    for (const route of routes) {
      if (route.providers && !route._injector) {
        route._injector = createEnvironmentInjector(
          route.providers,
          injector,
          `Route: ${route.path}`,
        );
      }
      const injectorForCurrentRoute = route._injector ?? injector;
      const injectorForChildren = route._loadedInjector ?? injectorForCurrentRoute;
      // Note that `canLoad` is only checked as a condition that prevents `loadChildren` and not
      // `loadComponent`. `canLoad` guards only block loading of child routes by design. This
      // happens as a consequence of needing to descend into children for route matching immediately
      // while component loading is deferred until route activation. Because `canLoad` guards can
      // have side effects, we cannot execute them here so we instead skip preloading altogether
      // when present. Lastly, it remains to be decided whether `canLoad` should behave this way
      // at all. Code splitting and lazy loading is separate from client-side authorization checks
      // and should not be used as a security measure to prevent loading of code.
      if (
        (route.loadChildren && !route._loadedRoutes && route.canLoad === undefined) ||
        (route.loadComponent && !route._loadedComponent)
      ) {
        res.push(this.preloadConfig(injectorForCurrentRoute, route));
      }
      if (route.children || route._loadedRoutes) {
        res.push(this.processRoutes(injectorForChildren, route.children ?? route._loadedRoutes));
      }
    }
    return from(res).pipe(mergeAll());
  }
  preloadConfig(injector, route) {
    return this.preloadingStrategy.preload(route, () => {
      let loadedChildren$;
      if (route.loadChildren && route.canLoad === undefined) {
        loadedChildren$ = this.loader.loadChildren(injector, route);
      } else {
        loadedChildren$ = of(null);
      }
      const recursiveLoadChildren$ = loadedChildren$.pipe(
        mergeMap((config) => {
          if (config === null) {
            return of(void 0);
          }
          route._loadedRoutes = config.routes;
          route._loadedInjector = config.injector;
          // If the loaded config was a module, use that as the module/module injector going
          // forward. Otherwise, continue using the current module/module injector.
          return this.processRoutes(config.injector ?? injector, config.routes);
        }),
      );
      if (route.loadComponent && !route._loadedComponent) {
        const loadComponent$ = this.loader.loadComponent(injector, route);
        return from([recursiveLoadChildren$, loadComponent$]).pipe(mergeAll());
      } else {
        return recursiveLoadChildren$;
      }
    });
  }
};
RouterPreloader = __decorate([Injectable({providedIn: 'root'})], RouterPreloader);
export {RouterPreloader};
//# sourceMappingURL=router_preloader.js.map
