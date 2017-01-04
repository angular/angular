/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, ComponentFactoryResolver, InjectionToken, Injector, NgModuleFactory, NgModuleFactoryLoader} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {of } from 'rxjs/observable/of';
import {map} from 'rxjs/operator/map';
import {mergeMap} from 'rxjs/operator/mergeMap';

import {LoadChildren, Route} from './config';
import {flatten, wrapIntoObservable} from './utils/collection';


/**
 * @experimental
 */
export const ROUTES = new InjectionToken<Route[][]>('ROUTES');

export class LoadedRouterConfig {
  constructor(
      public routes: Route[], public injector: Injector,
      public factoryResolver: ComponentFactoryResolver, public injectorFactory: Function) {}
}

export class RouterConfigLoader {
  constructor(private loader: NgModuleFactoryLoader, private compiler: Compiler) {}

  load(parentInjector: Injector, loadChildren: LoadChildren): Observable<LoadedRouterConfig> {
    return map.call(this.loadModuleFactory(loadChildren), (r: NgModuleFactory<any>) => {
      const ref = r.create(parentInjector);
      const injectorFactory = (parent: Injector) => r.create(parent).injector;
      return new LoadedRouterConfig(
          flatten(ref.injector.get(ROUTES)), ref.injector, ref.componentFactoryResolver,
          injectorFactory);
    });
  }

  private loadModuleFactory(loadChildren: LoadChildren): Observable<NgModuleFactory<any>> {
    if (typeof loadChildren === 'string') {
      return fromPromise(this.loader.load(loadChildren));
    } else {
      const offlineMode = this.compiler instanceof Compiler;
      return mergeMap.call(
          wrapIntoObservable(loadChildren()),
          (t: any) => offlineMode ? of (<any>t) : fromPromise(this.compiler.compileModuleAsync(t)));
    }
  }
}
