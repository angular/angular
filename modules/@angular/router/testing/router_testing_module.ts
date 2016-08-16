/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {MockLocationStrategy, SpyLocation} from '@angular/common/testing';
import {Compiler, ComponentResolver, Injectable, Injector, NgModule, NgModuleFactory, NgModuleFactoryLoader} from '@angular/core';

import {Route, Router, RouterOutletMap, UrlSerializer} from '../index';
import {ROUTES} from '../src/router_config_loader';
import {ROUTER_PROVIDERS, RouterModule} from '../src/router_module';
import {flatten} from '../src/utils/collection';



/**
 * A spy for {@link NgModuleFactoryLoader} that allows tests to simulate the loading of ng module
 * factories.
 *
 * @experimental
 */
@Injectable()
export class SpyNgModuleFactoryLoader implements NgModuleFactoryLoader {
  public stubbedModules: {[path: string]: any} = {};

  constructor(private compiler: Compiler) {}

  load(path: string): Promise<NgModuleFactory<any>> {
    if (this.stubbedModules[path]) {
      return this.compiler.compileModuleAsync(this.stubbedModules[path]);
    } else {
      return <any>Promise.reject(new Error(`Cannot find module ${path}`));
    }
  }
}

function setupTestingRouter(
    resolver: ComponentResolver, urlSerializer: UrlSerializer, outletMap: RouterOutletMap,
    location: Location, loader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector,
    routes: Route[][]) {
  return new Router(
      null, resolver, urlSerializer, outletMap, location, injector, loader, compiler,
      flatten(routes));
}

/**
 * A module setting up the router that should be used for testing.
 * It provides spy implementations of Location, LocationStrategy, and NgModuleFactoryLoader.
 *
 * # Example:
 *
 * ```
 * beforeEach(() => {
 *   configureModule({
 *     modules: [RouterTestingModule],
 *     providers: [provideRoutes(
 *         [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}])]
 *   });
 * });
 * ```
 *
 * @experimental
 */
@NgModule({
  exports: [RouterModule],
  providers: [
    ROUTER_PROVIDERS,
    {provide: Location, useClass: SpyLocation},
    {provide: LocationStrategy, useClass: MockLocationStrategy},
    {provide: NgModuleFactoryLoader, useClass: SpyNgModuleFactoryLoader},
    {
      provide: Router,
      useFactory: setupTestingRouter,
      deps: [
        ComponentResolver, UrlSerializer, RouterOutletMap, Location, NgModuleFactoryLoader,
        Compiler, Injector, ROUTES
      ]
    },
  ]
})
export class RouterTestingModule {
}
