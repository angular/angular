/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, InjectionToken, Injector, NgModuleFactory, NgModuleFactoryLoader, NgModuleRef, ɵstringify as stringify} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {of } from 'rxjs/observable/of';
import {map} from 'rxjs/operator/map';
import {mergeMap} from 'rxjs/operator/mergeMap';
import {LoadChildren, LoadedRouterConfig, Route} from './config';
import {flatten, wrapIntoObservable} from './utils/collection';

/**
 * @docsNotRequired
 * @experimental
 */
export const ROUTES = new InjectionToken<Route[][]>('ROUTES');

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

    return map.call(moduleFactory$, (factory: NgModuleFactory<any>) => {
      if (this.onLoadEndListener) {
        this.onLoadEndListener(route);
      }

      const module = factory.create(parentInjector);

      const parentRoutes = new Set(flatten(parentInjector.get(ROUTES)));
      const moduleRoutes =
          flatten(module.injector.get(ROUTES)).filter(route => !parentRoutes.has(route));

      if (moduleRoutes.length === 0) {
        throw new Error(
            `A lazy loaded module must define at least 1 route, but it seems like the '${stringify(factory.moduleType)}' module hasn't defined any. Have you imported RouterModule.forChild(ROUTES) in this module?`);
      }

      return new LoadedRouterConfig(moduleRoutes, module);
    });
  }

  private loadModuleFactory(loadChildren: LoadChildren): Observable<NgModuleFactory<any>> {
    if (typeof loadChildren === 'string') {
      return fromPromise(this.loader.load(loadChildren));
    } else {
      return mergeMap.call(wrapIntoObservable(loadChildren()), (t: any) => {
        if (t instanceof NgModuleFactory) {
          return of (t);
        } else {
          return fromPromise(this.compiler.compileModuleAsync(t));
        }
      });
    }
  }
}
