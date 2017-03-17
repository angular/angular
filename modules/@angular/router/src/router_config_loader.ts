/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, ComponentFactoryResolver, Injector, NgModuleFactory, NgModuleFactoryLoader, OpaqueToken} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {of } from 'rxjs/observable/of';
import {map} from 'rxjs/operator/map';
import {mergeMap} from 'rxjs/operator/mergeMap';

import {LoadChildren, Route} from './config';
import {flatten, wrapIntoObservable} from './utils/collection';

const UNDEFINED: any = {};

export class MergeInjector implements Injector {
  constructor(private componentInjector: Injector, private moduleInjector: Injector) {}

  get(token: any, notFoundValue?: any): any {
    const value = this.componentInjector.get(token, UNDEFINED);
    return value !== UNDEFINED ? value : this.moduleInjector.get(token, notFoundValue);
  }
}

/**
 * @experimental
 */
export const ROUTES = new OpaqueToken('ROUTES');

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
      const injectorFactory = (parent: Injector) => new MergeInjector(parent, ref.injector);
      return new LoadedRouterConfig(
          flatten(ref.injector.get(ROUTES)), ref.injector, ref.componentFactoryResolver,
          injectorFactory);
    });
  }

  private loadModuleFactory(loadChildren: LoadChildren): Observable<NgModuleFactory<any>> {
    if (typeof loadChildren === 'string') {
      return fromPromise(this.loader.load(loadChildren));
    } else {
      return mergeMap.call(wrapIntoObservable(loadChildren()), (t: NgModuleFactory<any>| any) => {
        if (t instanceof NgModuleFactory) {
          return of (t);
        } else {
          return fromPromise(this.compiler.compileModuleAsync(t));
        }
      });
    }
  }
}
