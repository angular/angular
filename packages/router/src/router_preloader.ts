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
 * RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
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

  private processRoutes(
    injector: EnvironmentInjector,
    routes: Routes,
    hasUnloadedAncestorConfig = false,
    ancestors: Route[] = [],
  ): Observable<void> {
    const res: Observable<void>[] = [];
    for (const route of routes) {
      const hasPendingLoadConfig = Boolean(route.loadConfig && !route._configLoaded);
      const canCreateInjector = !hasUnloadedAncestorConfig && !hasPendingLoadConfig;
      const routeAncestors = [...ancestors, route];
      const injectorForCurrentRoute = canCreateInjector
        ? getOrCreateRouteInjectorIfNeeded(route, injector)
        : this.injector;
      if (canCreateInjector && route._loadedNgModuleFactory && !route._loadedInjector) {
        route._loadedInjector =
          route._loadedNgModuleFactory.create(injectorForCurrentRoute).injector;
      }
      const injectorForChildren = canCreateInjector
        ? (route._loadedInjector ?? injectorForCurrentRoute)
        : this.injector;

      // Note that `canLoad` is only checked as a condition that prevents `loadChildren` and not
      // `loadComponent`. `canLoad` guards only block loading of child routes by design. This
      // happens as a consequence of needing to descend into children for route matching immediately
      // while component loading is deferred until route activation. Because `canLoad` guards can
      // have side effects, we cannot execute them here so we instead skip preloading altogether
      // when present. Lastly, it remains to be decided whether `canLoad` should behave this way
      // at all. Code splitting and lazy loading is separate from client-side authorization checks
      // and should not be used as a security measure to prevent loading of code.
      if (
        // TODO(v23): Remove `canLoad` check once removed from 3p.
        (route.loadChildren && !route._loadedRoutes && (route as any).canLoad === undefined) ||
        (route.loadComponent && !route._loadedComponent) ||
        hasPendingLoadConfig
      ) {
        res.push(
          this.preloadConfig(injectorForCurrentRoute, route, canCreateInjector, routeAncestors),
        );
      }
      if (route.children || route._loadedRoutes) {
        res.push(
          this.processRoutes(
            injectorForChildren,
            (route.children ?? route._loadedRoutes)!,
            !canCreateInjector,
            routeAncestors,
          ),
        );
      }
    }
    return from(res).pipe(mergeAll());
  }

  private preloadConfig(
    injector: EnvironmentInjector,
    route: Route,
    canCreateInjector: boolean,
    ancestors: Route[],
  ): Observable<void> {
    return this.preloadingStrategy.preload(route, () => {
      if (injector.destroyed) {
        return of(null);
      }
      const loaders: Observable<unknown>[] = [];
      if (route.loadConfig && !route._configLoaded) {
        loaders.push(from(this.loader.loadConfig(route)));
      }
      if (route.loadComponent && !route._loadedComponent) {
        loaders.push(from(this.loader.loadComponent(injector, route)));
      }
      // TODO(v23): Remove `canLoad` check once removed from 3p.
      if (route.loadChildren && (route as any).canLoad === undefined) {
        loaders.push(
          from(
            this.loader.loadChildren(
              injector,
              route,
              canCreateInjector ? undefined : () => this.loader.hydrateRoutes(ancestors),
            ),
          ).pipe(
            mergeMap((config: LoadedRouterConfig) => {
              route._loadedRoutes = config.routes;
              route._loadedInjector = config.injector;
              route._loadedNgModuleFactory = config.factory;
              // If the loaded config was a module, use that as the module/module injector going
              // forward. Otherwise, continue using the current module/module injector.
              return this.processRoutes(
                config.injector ?? injector,
                config.routes,
                !canCreateInjector && !config.injector,
                ancestors,
              );
            }),
          ),
        );
      }
      return from(loaders).pipe(mergeAll()) as Observable<void>;
    });
  }
}
