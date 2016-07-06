/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModuleFactoryLoader, AppModuleRef, ComponentFactoryResolver, OpaqueToken} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {fromPromise} from 'rxjs/observable/fromPromise';

import {Route} from './config';

export const ROUTER_CONFIG = new OpaqueToken('ROUTER_CONFIG');

export class LoadedRouterConfig {
  constructor(public routes: Route[], public factoryResolver: ComponentFactoryResolver) {}
}

export class RouterConfigLoader {
  constructor(private loader: AppModuleFactoryLoader) {}

  load(path: string): Observable<LoadedRouterConfig> {
    return fromPromise(this.loader.load(path).then(r => {
      const ref = r.create();
      return new LoadedRouterConfig(ref.injector.get(ROUTER_CONFIG), ref.componentFactoryResolver);
    }));
  }
}