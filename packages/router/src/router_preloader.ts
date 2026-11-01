/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnvironmentInjector, Injectable, OnDestroy, Service} from '@angular/core';
import {from, Observable, of, Subscription} from 'rxjs';
import {catchError, concatMap, filter, mergeAll, mergeMap} from 'rxjs/operators';

import {Event, NavigationEnd} from './events';
import {LoadedRouterConfig, Route, Routes} from './models';
import {Router} from './router';
import {RouterConfigLoader} from './router_config_loader';
import {getOrCreateRouteInjectorIfNeeded} from './utils/config';

/**
 * @description
 *
 * Provides a preloading strategy.
 *
 * @see [Preloading strategy](guide/routing/customizing-route-behavior#preloading-strategy)
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
 * ```ts
 * export const appConfig: ApplicationConfig = {
 * providers: [
 *   provideRouter(
 *     routes,
 *     withPreloading(PreloadAllModules)
 *   )
 * ]
 * };
 * ```
 *
 *
 * @see [Preloading strategy](guide/routing/customizing-route-behavior#preloading-strategy)
 *
 * @publicApi
 */
@Service()
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
 * @see [Preloading strategy](guide/routing/customizing-route-behavior#preloading-strategy)
 *
 * @publicApi
 */
@Service()
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
    this.subscription?.unsubscribe();
  }

  private processRoutes(injector: EnvironmentInjector, routes: Routes): Observable<void> {
    const res: Observable<void>[] = [];
    for (const route of routes) {
      const injectorForCurrentRoute = getOrCreateRouteInjectorIfNeeded(route, injector);
      if (route._loadedNgModuleFactory && !route._loadedInjector) {
        route._loadedInjector =
          route._loadedNgModuleFactory.create(injectorForCurrentRoute).injector;
      }
      const injectorForChildren = route._loadedInjector ?? injectorForCurrentRoute;

      // Note that `canLoad` is only checked as a condition that prevents `loadChildren` and not
      // `loadComponent`. `canLoad` guards only block loading of child routes by design. This
      // happens as a consequence of needing to descend into children for route matching immediately
      // while component loading is deferred until route activation. Because `canLoad` guards can
      // have side effects, we cannot execute them here so we instead skip preloading altogether
      // when present. Lastly, it remains to be decided whether `canLoad` should behave this way
      // at all. Code splitting and lazy loading is separate from client-side authorization checks
      // and should not be used as a security measure to prevent loading of code.
      const hasPendingLoadConfig = Boolean(route.loadConfig && !route._configLoaded);
      if (
        // TODO: Remove `canLoad` check once removed from 3p.
        (route.loadChildren && !route._loadedRoutes && (route as any).canLoad === undefined) ||
        (route.loadComponent && !route._loadedComponent) ||
        hasPendingLoadConfig
      ) {
        res.push(this.preloadConfig(injectorForCurrentRoute, route, hasPendingLoadConfig));
      }
      if (!hasPendingLoadConfig && (route.children || route._loadedRoutes)) {
        res.push(this.processRoutes(injectorForChildren, (route.children ?? route._loadedRoutes)!));
      }
    }
    return from(res).pipe(mergeAll());
  }

  private preloadConfig(
    injector: EnvironmentInjector,
    route: Route,
    hasPendingLoadConfig: boolean,
  ): Observable<void> {
    return this.preloadingStrategy.preload(route, () => {
      if (injector.destroyed) {
        return of(null);
      }
      const loadConfig$: Observable<unknown> =
        route.loadConfig && !route._configLoaded ? from(this.loader.loadConfig(route)) : of(null);

      return loadConfig$.pipe(
        mergeMap(() => {
          if (injector.destroyed) {
            return of(void 0);
          }
          injector = getOrCreateRouteInjectorIfNeeded(route, injector);
          // TODO: Remove `canLoad` check once removed from 3p.
          const loadedChildren$: Observable<LoadedRouterConfig | null> =
            route.loadChildren && (route as any).canLoad === undefined
              ? from(this.loader.loadChildren(injector, route))
              : of(null);

          const recursiveLoadChildren$ = loadedChildren$.pipe(
            mergeMap((config: LoadedRouterConfig | null) => {
              if (config !== null) {
                route._loadedRoutes = config.routes;
                route._loadedInjector = config.injector;
                route._loadedNgModuleFactory = config.factory;
              }
              const childRoutes =
                config?.routes ??
                (hasPendingLoadConfig ? (route.children ?? route._loadedRoutes) : null);
              // If the loaded config was a module, use that as the module/module injector going
              // forward. Otherwise, continue using the current module/module injector.
              return childRoutes
                ? this.processRoutes(route._loadedInjector ?? injector, childRoutes)
                : of(void 0);
            }),
          );
          if (route.loadComponent && !route._loadedComponent) {
            const loadComponent$ = this.loader.loadComponent(injector, route);
            return from([recursiveLoadChildren$, loadComponent$]).pipe(mergeAll());
          } else {
            return recursiveLoadChildren$;
          }
        }),
      );
    });
  }
}
