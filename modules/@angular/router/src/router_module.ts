/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ApplicationRef, ComponentResolver, Injector, NgModule, NgModuleFactoryLoader, OpaqueToken, SystemJsNgModuleLoader} from '@angular/core';

import {ROUTER_CONFIGURATION, rootRoute, setupRouter} from './common_router_providers';
import {RouterLink, RouterLinkWithHref} from './directives/router_link';
import {RouterLinkActive} from './directives/router_link_active';
import {RouterOutlet} from './directives/router_outlet';
import {Router} from './router';
import {ROUTES} from './router_config_loader';
import {RouterOutletMap} from './router_outlet_map';
import {ActivatedRoute} from './router_state';
import {DefaultUrlSerializer, UrlSerializer} from './url_tree';



/**
 * @stable
 */
export const ROUTER_DIRECTIVES = [RouterOutlet, RouterLink, RouterLinkWithHref, RouterLinkActive];

export const ROUTER_PROVIDERS: any[] = [
  Location, {provide: LocationStrategy, useClass: PathLocationStrategy},
  {provide: UrlSerializer, useClass: DefaultUrlSerializer}, {
    provide: Router,
    useFactory: setupRouter,
    deps: [
      ApplicationRef, ComponentResolver, UrlSerializer, RouterOutletMap, Location, Injector,
      NgModuleFactoryLoader, ROUTES, ROUTER_CONFIGURATION
    ]
  },
  RouterOutletMap, {provide: ActivatedRoute, useFactory: rootRoute, deps: [Router]},
  {provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader},
  {provide: ROUTER_CONFIGURATION, useValue: {enableTracing: false}}
];


/**
 * Router module to be used for lazy loaded parts.
 *
 * ### Example
 *
 * ```
 * @NgModule({
 *   imports: [RouterModuleWithoutProviders]
 * })
 * class TeamsModule {}
 * ```
 *
 * @experimental We will soon have a way for the `RouterModule` to be imported with and without a
 * provider,
 * and then this module will be removed.
 */
@NgModule({declarations: ROUTER_DIRECTIVES, exports: ROUTER_DIRECTIVES})
export class RouterModuleWithoutProviders {
}

/**
 * Router module.
 *
 * ### Example
 *
 * ```
 * bootstrap(AppCmp, {modules: [RouterModule]});
 * ```
 *
 * @experimental
 */
@NgModule({exports: [RouterModuleWithoutProviders], providers: ROUTER_PROVIDERS})
export class RouterModule {
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
