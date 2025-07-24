/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createEnvironmentInjector, EnvironmentInjector, Injectable, OnDestroy} from '@angular/core';
import {from, Observable, of, Subscription} from 'rxjs';
import {catchError, concatMap, filter, mergeAll, mergeMap} from 'rxjs/operators';

import {Event, NavigationEnd} from './events';
import {LoadedRouterConfig, Route, Routes} from './models';
import {Router} from './router';
import {RouterConfigLoader} from './router_config_loader';

/**
 * @description
 *
 * Provides a preloading strategy.
 *
 * @publicApi
 */
export abstract class PreloadingStrategy {
  abstract preload(route: Route, fn: () => Observable<any>): Observable<any>;
}

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
@Injectable({providedIn: 'root'})
export class PreloadAllModules implements PreloadingStrategy {
  preload(route: Route, fn: () => Observable<any>): Observable<any> {
    return fn().pipe(catchError(() => of(null)));
  }
}

/**
 * @description
 *
 * Provides a preloading strategy that does not preload any modules.
 *
 * This strategy is enabled by default.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class NoPreloading implements PreloadingStrategy {
  preload(route: Route, fn: () => Observable<any>): Observable<any> {
    return of(null);
  }
}

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
@Injectable({providedIn: 'root'})
export class RouterPreloader implements OnDestroy {
  private subscription?: Subscription;

  constructor(
    private router: Router,
    private injector: EnvironmentInjector,
    private preloadingStrategy: PreloadingStrategy,
    private loader: RouterConfigLoader,
  ) {}

  setUpPreloading(): void {
    this.subscription = this.router.events
      .pipe(
        filter((e: Event) => e instanceof NavigationEnd),
        concatMap(() => this.preload()),
      )
      .subscribe(() => {});
  }

  preload(): Observable<any> {
    return this.processRoutes(this.injector, this.router.config);
  }

  /** @docs-private */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private processRoutes(injector: EnvironmentInjector, routes: Routes): Observable<void> {
    const res: Observable<any>[] = [];
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
        res.push(this.processRoutes(injectorForChildren, (route.children ?? route._loadedRoutes)!));
      }
    }
    return from(res).pipe(mergeAll());
  }

  private preloadConfig(injector: EnvironmentInjector, route: Route): Observable<void> {
    return this.preloadingStrategy.preload(route, () => {
      let loadedChildren$: Observable<LoadedRouterConfig | null>;
      if (route.loadChildren && route.canLoad === undefined) {
        loadedChildren$ = this.loader.loadChildren(injector, route);
      } else {
        loadedChildren$ = of(null);
      }

      const recursiveLoadChildren$ = loadedChildren$.pipe(
        mergeMap((config: LoadedRouterConfig | null) => {
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
}
