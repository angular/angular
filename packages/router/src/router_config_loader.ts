/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, InjectFlags, InjectionToken, Injector, NgModuleFactory} from '@angular/core';
import {ConnectableObservable, from, Observable, of, Subject} from 'rxjs';
import {catchError, map, mergeMap, refCount, tap} from 'rxjs/operators';

import {LoadChildren, LoadedRouterConfig, Route, Routes} from './models';
import {flatten, wrapIntoObservable} from './utils/collection';
import {standardizeConfig, validateConfig} from './utils/config';


const NG_DEV_MODE = typeof ngDevMode === 'undefined' || !!ngDevMode;

/**
 * The [DI token](guide/glossary/#di-token) for a router configuration.
 *
 * `ROUTES` is a low level API for router configuration via dependency injection.
 *
 * We recommend that in almost all cases to use higher level APIs such as `RouterModule.forRoot()`,
 * `RouterModule.forChild()`, `provideRoutes`, or `Router.resetConfig()`.
 *
 * @publicApi
 */
export const ROUTES = new InjectionToken<Route[][]>('ROUTES');

export class RouterConfigLoader {
  constructor(
      private injector: Injector, private compiler: Compiler,
      private onLoadStartListener?: (r: Route) => void,
      private onLoadEndListener?: (r: Route) => void) {}

  load(parentInjector: Injector, route: Route): Observable<LoadedRouterConfig> {
    if (route._loader$) {
      return route._loader$;
    }

    if (this.onLoadStartListener) {
      this.onLoadStartListener(route);
    }
    const moduleFactory$ = this.loadModuleFactory(route.loadChildren!);
    const loadRunner = moduleFactory$.pipe(
        map((factory: NgModuleFactory<any>) => {
          if (this.onLoadEndListener) {
            this.onLoadEndListener(route);
          }
          const injector = factory.create(parentInjector).injector;
          const routes =
              // When loading a module that doesn't provide `RouterModule.forChild()` preloader
              // will get stuck in an infinite loop. The child module's Injector will look to
              // its parent `Injector` when it doesn't find any ROUTES so it will return routes
              // for it's parent module instead.
              flatten(injector.get(ROUTES, [], InjectFlags.Self | InjectFlags.Optional))
                  .map(standardizeConfig);
          NG_DEV_MODE && validateConfig(routes);
          return {routes, injector};
        }),
        catchError((err) => {
          route._loader$ = undefined;
          throw err;
        }),
    );
    // Use custom ConnectableObservable as share in runners pipe increasing the bundle size too much
    route._loader$ = new ConnectableObservable(loadRunner, () => new Subject<LoadedRouterConfig>())
                         .pipe(refCount());
    return route._loader$;
  }

  private loadModuleFactory(loadChildren: LoadChildren): Observable<NgModuleFactory<any>> {
    return wrapIntoObservable(loadChildren()).pipe(mergeMap((t: any) => {
      if (t instanceof NgModuleFactory) {
        return of(t);
      } else {
        return from(this.compiler.compileModuleAsync(t));
      }
    }));
  }
}
