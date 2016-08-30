/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {MockLocationStrategy, SpyLocation} from '@angular/common/testing';
import {Compiler, Injectable, Injector, ModuleWithProviders, NgModule, NgModuleFactory, NgModuleFactoryLoader} from '@angular/core';
import {Route, Router, RouterModule, RouterOutletMap, Routes, UrlSerializer, provideRoutes} from '@angular/router';

import {ROUTER_PROVIDERS, ROUTES, flatten} from './private_import_router';

/**
 * A spy for {@link NgModuleFactoryLoader} that allows tests to simulate the loading of ng module
 * factories.
 *
 * @stable
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

/**
 * Router setup factory function used for testing.
 *
 * @stable
 */
export function setupTestingRouter(
    urlSerializer: UrlSerializer, outletMap: RouterOutletMap, location: Location,
    loader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector, routes: Route[][]) {
  return new Router(
      null, urlSerializer, outletMap, location, injector, loader, compiler, flatten(routes));
}

/**
 * A module setting up the router that should be used for testing.
 * It provides spy implementations of Location, LocationStrategy, and NgModuleFactoryLoader.
 *
 * # Example:
 *
 * ```
 * beforeEach(() => {
 *   TestBed.configureTestModule({
 *     modules: [
 *       RouterTestingModule.withRoutes(
 *         [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}])]
 *       )
 *     ]
 *   });
 * });
 * ```
 *
 * @stable
 */
@NgModule({
  exports: [RouterModule],
  providers: [
    ROUTER_PROVIDERS, {provide: Location, useClass: SpyLocation},
    {provide: LocationStrategy, useClass: MockLocationStrategy},
    {provide: NgModuleFactoryLoader, useClass: SpyNgModuleFactoryLoader}, {
      provide: Router,
      useFactory: setupTestingRouter,
      deps: [
        UrlSerializer, RouterOutletMap, Location, NgModuleFactoryLoader, Compiler, Injector, ROUTES
      ]
    },
    provideRoutes([])
  ]
})
export class RouterTestingModule {
  static withRoutes(routes: Routes): ModuleWithProviders {
    return {ngModule: RouterTestingModule, providers: [provideRoutes(routes)]};
  }
}
