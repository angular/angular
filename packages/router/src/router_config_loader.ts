/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, InjectionToken, Injector, NgModuleFactory, NgModuleFactoryLoader} from '@angular/core';
// TODO(i): switch to fromPromise once it's expored in rxjs
import {Observable, from, of } from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {LoadChildren, LoadedRouterConfig, Route, standardizeConfig} from './config';
import {flatten, wrapIntoObservable} from './utils/collection';

/**
 * @docsNotRequired
 * @publicApi
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

    return moduleFactory$.pipe(map((factory: NgModuleFactory<any>) => {
      if (this.onLoadEndListener) {
        this.onLoadEndListener(route);
      }

      const module = factory.create(parentInjector);

      return new LoadedRouterConfig(
          flatten(module.injector.get(ROUTES)).map(standardizeConfig), module);
    }));
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
