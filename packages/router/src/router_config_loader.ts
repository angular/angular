/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO(i): switch to fromPromise once it's expored in rxjs
import {Compiler, InjectionToken, Injector, NgModuleFactory, NgModuleFactoryLoader} from '@angular/core';
import {isPromise} from '@angular/core/src/util/lang';
import {Observable, from, of } from 'rxjs';
import {mergeMap, switchMap} from 'rxjs/operators';

import {LoadChildren, LoadedRouterConfig, Route, standardizeConfig} from './config';
import {flatten, wrapIntoObservable} from './utils/collection';


/**
 * The [DI token](guide/glossary/#di-token) for a router configuration.
 * @see `ROUTES`
 * @publicApi
 */
export const ROUTES = new InjectionToken<Route[][]>('ROUTES');

/**
 * An injection token that allows you to provide one or more initialization functions.
 * These function are injected when a route is loaded. If any of these functions returns
 * a Promise, initialization does not complete until the Promise is resolved.
 *
 * You can, for example, create a factory function that loads language data
 * or an external configuration, and provide that function to the `ROUTER_INITIALIZER` token.
 * That way, the function is executed during the router loading process,
 * and the needed data is available when the route is loaded.
 *
 * @publicApi
 */
export const ROUTE_INITIALIZER = new InjectionToken<Array<() => void>>('Router loader Initializer');

export class RouterConfigLoader {
  constructor(
      private loader: NgModuleFactoryLoader, private compiler: Compiler,
      private onLoadStartListener?: (r: Route) => void,
      private onLoadEndListener?: (r: Route) => void) {}

  load(parentInjector: Injector, route: Route): Observable<LoadedRouterConfig> {
    if (this.onLoadStartListener) {
      this.onLoadStartListener(route);
    }

    const moduleFactory$ = this.loadModuleFactory(route.loadChildren !);

    return moduleFactory$.pipe(switchMap((factory: NgModuleFactory<any>) => {
      if (this.onLoadEndListener) {
        this.onLoadEndListener(route);
      }

      const module = factory.create(parentInjector);
      const routeInits: (() => any)[] = module.injector.get(ROUTE_INITIALIZER, () => {});

      return from(
          this.runInitializers(routeInits)
              .then(
                  () => new LoadedRouterConfig(
                      flatten(module.injector.get(ROUTES)).map(standardizeConfig), module)));

    }));
  }

  private runInitializers(routeInits: (() => any)[]): Promise<unknown> {
    return new Promise((res, rej) => {
      const asyncInitPromises: Promise<any>[] = [];

      if (routeInits) {
        for (let i = 0; i < routeInits.length; i++) {
          const initResult = routeInits[i]();
          if (isPromise(initResult)) {
            asyncInitPromises.push(initResult);
          }
        }
      }

      Promise.all(asyncInitPromises).then(() => { res(); }).catch(e => { rej(e); });

      if (asyncInitPromises.length === 0) {
        res();
      }
    });
  }

  private loadModuleFactory(loadChildren: LoadChildren): Observable<NgModuleFactory<any>> {
    if (typeof loadChildren === 'string') {
      return from(this.loader.load(loadChildren));
    } else {
      return wrapIntoObservable(loadChildren()).pipe(mergeMap((t: any) => {
        if (t instanceof NgModuleFactory) {
          return of (t);
        } else {
          return from(this.compiler.compileModuleAsync(t));
        }
      }));
    }
  }
}
