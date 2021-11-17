/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {createNgModuleRef, InjectFlags, InjectionToken, Injector, NgModuleFactory, Type} from '@angular/core';
import {ConnectableObservable, from, Observable, of, Subject} from 'rxjs';
import {catchError, map, mergeMap, refCount} from 'rxjs/operators';

import {LoadChildren, LoadedRouterConfig, Route} from './models';
import {flatten, wrapIntoObservable} from './utils/collection';
import {standardizeConfig} from './utils/config';

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

const isNgModuleFactory = (v: unknown): v is NgModuleFactory<unknown> =>
    v instanceof NgModuleFactory;

export class RouterConfigLoader {
  constructor(
      private injector: Injector, private onLoadStartListener?: (r: Route) => void,
      private onLoadEndListener?: (r: Route) => void) {}

  load(parentInjector: Injector, route: Route): Observable<LoadedRouterConfig> {
    if (route._loader$) {
      return route._loader$;
    }

    if (this.onLoadStartListener) {
      this.onLoadStartListener(route);
    }
    const ngModule$ = this.loadNgModule(route.loadChildren!);
    const loadRunner = ngModule$.pipe(
        map((ngModule: Type<unknown>|NgModuleFactory<unknown>) => {
          if (this.onLoadEndListener) {
            this.onLoadEndListener(route);
          }
          const ngModuleRef = isNgModuleFactory(ngModule) ?
              ngModule.create(parentInjector) :
              createNgModuleRef(ngModule, parentInjector);

          // When loading a module that doesn't provide `RouterModule.forChild()` preloader
          // will get stuck in an infinite loop. The child module's Injector will look to
          // its parent `Injector` when it doesn't find any ROUTES so it will return routes
          // for it's parent module instead.
          return new LoadedRouterConfig(
              flatten(ngModuleRef.injector.get(
                          ROUTES, undefined, InjectFlags.Self | InjectFlags.Optional))
                  .map(standardizeConfig),
              ngModuleRef);
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

  private loadNgModule(loadChildren: LoadChildren):
      Observable<Type<unknown>|NgModuleFactory<unknown>> {
    return wrapIntoObservable(loadChildren()).pipe(mergeMap((t: any) => {
      return isNgModuleFactory(t) ? of(t) : from(Promise.resolve(t));
    }));
  }
}
