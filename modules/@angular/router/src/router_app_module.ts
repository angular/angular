/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModule} from '@angular/core';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {APP_INITIALIZER, AppModuleFactoryLoader, ApplicationRef, ComponentResolver, Injector, OpaqueToken, SystemJsAppModuleLoader} from '@angular/core';

import {Router} from './router';
import {setupRouter, ROUTER_OPTIONS} from './common_router_providers';
import {ROUTER_CONFIG} from './router_config_loader';
import {RouterOutletMap} from './router_outlet_map';
import {ActivatedRoute} from './router_state';
import {DefaultUrlSerializer, UrlSerializer} from './url_tree';

import {RouterLink, RouterLinkWithHref} from './directives/router_link';
import {RouterLinkActive} from './directives/router_link_active';
import {RouterOutlet} from './directives/router_outlet';

/**
 * @stable
 */
export const ROUTER_DIRECTIVES = [RouterOutlet, RouterLink, RouterLinkWithHref, RouterLinkActive];


/**
 * Router module.
 *
 * ### Example
 *
 * ```
 * bootstrap(AppCmp, {modules: [RouterAppModule]});
 * ```
 *
 * @experimental
 */
@AppModule({
  directives: ROUTER_DIRECTIVES,
  providers: [
    Location, {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: UrlSerializer, useClass: DefaultUrlSerializer},
    {
      provide: Router,
      useFactory: setupRouter,
      deps: [
        ApplicationRef, ComponentResolver, UrlSerializer, RouterOutletMap, Location, Injector,
        AppModuleFactoryLoader, ROUTER_CONFIG, ROUTER_OPTIONS
      ]
    },
    RouterOutletMap,
    {provide: ActivatedRoute, useFactory: (r: Router) => r.routerState.root, deps: [Router]},
    {provide: AppModuleFactoryLoader, useClass: SystemJsAppModuleLoader},
    {provide: ROUTER_OPTIONS, useValue: {enableTracing: false}}
  ]
})
export class RouterAppModule {
  constructor(private injector: Injector) {
    setTimeout(() => {
      const appRef = injector.get(ApplicationRef);
      if (appRef.componentTypes.length == 0) {
        appRef.registerBootstrapListener(() => { injector.get(Router).initialNavigation(); });
      } else {
        injector.get(Router).initialNavigation();
      }
    }, 0);
  }
}