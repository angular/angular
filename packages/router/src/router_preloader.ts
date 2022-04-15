/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, Injectable, Injector, OnDestroy} from '@angular/core';
import {from, Observable, of, Subscription} from 'rxjs';
import {catchError, concatMap, filter, map, mergeAll, mergeMap} from 'rxjs/operators';

import {Event, NavigationEnd, RouteConfigLoadEnd, RouteConfigLoadStart} from './events';
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
 * ```
 * RouterModule.forRoot(ROUTES, {preloadingStrategy: PreloadAllModules})
 * ```
 *
 * @publicApi
 */
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
@Injectable()
export class RouterPreloader implements OnDestroy {
  private subscription?: Subscription;

  constructor(
      private router: Router, compiler: Compiler, private injector: Injector,
      private preloadingStrategy: PreloadingStrategy, private loader: RouterConfigLoader) {}

  setUpPreloading(): void {
    this.subscription =
        this.router.events
            .pipe(filter((e: Event) => e instanceof NavigationEnd), concatMap(() => this.preload()))
            .subscribe(() => {});
  }

  preload(): Observable<any> {
    return this.processRoutes(this.injector, this.router.config);
  }

  /** @nodoc */
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private processRoutes(injector: Injector, routes: Routes): Observable<void> {
    const res: Observable<any>[] = [];
    for (const route of routes) {
      // we already have the config loaded, just recurse
      if (route.loadChildren && !route.canLoad && route._loadedRoutes) {
        res.push(this.processRoutes(route._loadedInjector ?? injector, route._loadedRoutes));

        // no config loaded, fetch the config
      } else if (route.loadChildren && !route.canLoad) {
        res.push(this.preloadConfig(injector, route));

        // recurse into children
      } else if (route.children) {
        res.push(this.processRoutes(injector, route.children));
      }
    }
    return from(res).pipe(mergeAll(), map((_) => void 0));
  }

  private preloadConfig(injector: Injector, route: Route): Observable<void> {
    return this.preloadingStrategy.preload(route, () => {
      const loaded$ = route._loadedRoutes ?
          of({routes: route._loadedRoutes, injector: route._loadedInjector}) :
          this.loader.load(injector, route);
      return loaded$.pipe(mergeMap((config: LoadedRouterConfig) => {
        route._loadedRoutes = config.routes;
        route._loadedInjector = config.injector;
        // If the loaded config was a module, use that as the module/module injector going forward.
        // Otherwise, continue using the current module/module injector.
        return this.processRoutes(config.injector ?? injector, config.routes);
      }));
    });
  }
}
