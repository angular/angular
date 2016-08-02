/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactoryResolver, Injector, NgModuleFactoryLoader, OpaqueToken} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {fromPromise} from 'rxjs/observable/fromPromise';

import {Route} from './config';
import {flatten} from './utils/collection';


/**
 * @deprecated use Routes
 */
export const ROUTER_CONFIG = new OpaqueToken('ROUTER_CONFIG');
export const ROUTES = new OpaqueToken('ROUTES');

export class LoadedRouterConfig {
  constructor(
      public routes: Route[], public injector: Injector,
      public factoryResolver: ComponentFactoryResolver) {}
}

export class RouterConfigLoader {
  constructor(private loader: NgModuleFactoryLoader) {}

  load(parentInjector: Injector, path: string): Observable<LoadedRouterConfig> {
    return fromPromise(this.loader.load(path).then(r => {
      const ref = r.create(parentInjector);
      return new LoadedRouterConfig(
          flatten(ref.injector.get(ROUTES)), ref.injector, ref.componentFactoryResolver);
    }));
  }
}
