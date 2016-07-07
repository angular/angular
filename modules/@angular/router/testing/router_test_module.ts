/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {SpyLocation} from '@angular/common/testing';
import {MockLocationStrategy} from '@angular/common/testing/mock_location_strategy';
import {AppModule, AppModuleFactory, AppModuleFactoryLoader, Compiler, ComponentResolver, Injectable, Injector} from '@angular/core';

import {Router, RouterOutletMap, Routes, UrlSerializer} from '../index';
import {ROUTES} from '../src/router_config_loader';
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from '../src/router_module';


/**
 * A spy for {@link AppModuleFactoryLoader} that allows tests to simulate the loading of app module
 * factories.
 *
 * @experimental
 */
@Injectable()
export class SpyAppModuleFactoryLoader implements AppModuleFactoryLoader {
  public stubbedModules: {[path: string]: any} = {};

  constructor(private compiler: Compiler) {}

  load(path: string): Promise<AppModuleFactory<any>> {
    if (this.stubbedModules[path]) {
      return this.compiler.compileAppModuleAsync(this.stubbedModules[path]);
    } else {
      return <any>Promise.reject(new Error(`Cannot find module ${path}`));
    }
  }
}

/**
 * A module setting up the router that should be used for testing.
 * It provides spy implementations of Location, LocationStrategy, and AppModuleFactoryLoader.
 *
 * # Example:
 *
 * ```
 * beforeEach(() => {
 *   configureModule({
 *     modules: [RouterTestModule],
 *     providers: [provideRoutes(
 *         [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}])]
 *   });
 * });
 * ```
 *
 * @experimental
 */
@AppModule({
  directives: ROUTER_DIRECTIVES,
  providers: [
    ROUTER_PROVIDERS,
    {provide: Location, useClass: SpyLocation},
    {provide: LocationStrategy, useClass: MockLocationStrategy},
    {provide: AppModuleFactoryLoader, useClass: SpyAppModuleFactoryLoader},
    {
      provide: Router,
      useFactory: (resolver: ComponentResolver, urlSerializer: UrlSerializer,
                   outletMap: RouterOutletMap, location: Location, loader: AppModuleFactoryLoader,
                   injector: Injector, routes: Routes) => {
        return new Router(
            null, resolver, urlSerializer, outletMap, location, injector, loader, routes);
      },
      deps: [
        ComponentResolver, UrlSerializer, RouterOutletMap, Location, AppModuleFactoryLoader,
        Injector, ROUTES
      ]
    },
  ]
})
export class RouterTestModule {
}
