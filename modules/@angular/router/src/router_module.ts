/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF, HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation} from '@angular/common';
import {ApplicationRef, ComponentResolver, Inject, Injector, ModuleWithProviders, NgModule, NgModuleFactoryLoader, OpaqueToken, Optional, SystemJsNgModuleLoader} from '@angular/core';

import {ExtraOptions, ROUTER_CONFIGURATION, provideRouterConfig, provideRoutes, rootRoute, setupRouter} from './common_router_providers';
import {Routes} from './config';
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

const pathLocationStrategy = {
  provide: LocationStrategy,
  useClass: PathLocationStrategy
};
const hashLocationStrategy = {
  provide: LocationStrategy,
  useClass: HashLocationStrategy
};

export const ROUTER_PROVIDERS: any[] = [
  Location, {provide: UrlSerializer, useClass: DefaultUrlSerializer}, {
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
 * Router module.
 *
 * When registered at the root, it should be used as follows:
 *
 * ### Example
 *
 * ```
 * bootstrap(AppCmp, {imports: [RouterModule.forRoot(ROUTES)]});
 * ```
 *
 * For lazy loaded modules it should be used as follows:
 *
 * ### Example
 *
 * ```
 * @NgModule({
 *   imports: [RouterModule.forChild(CHILD_ROUTES)]
 * })
 * class Lazy {}
 * ```
 *
 * @experimental
 */
@NgModule({declarations: ROUTER_DIRECTIVES, exports: ROUTER_DIRECTIVES})
export class RouterModule {
  constructor(private injector: Injector, appRef: ApplicationRef) {
    // do the initialization only once
    if ((<any>injector).parent.get(RouterModule, null)) return;

    appRef.registerBootstrapListener(() => { injector.get(Router).initialNavigation(); });
  }

  static forRoot(routes: Routes, config?: ExtraOptions): ModuleWithProviders {
    return {
      ngModule: RouterModule,
      providers: [
        ROUTER_PROVIDERS, provideRoutes(routes), {provide: ROUTER_CONFIGURATION, useValue: config},
        {
          provide: LocationStrategy,
          useFactory: provideLocationStrategy,
          deps: [
            PlatformLocation, [new Inject(APP_BASE_HREF), new Optional()], ROUTER_CONFIGURATION
          ]
        }
      ]
    };
  }

  static forChild(routes: Routes): ModuleWithProviders {
    return {ngModule: RouterModule, providers: [provideRoutes(routes)]};
  }
}

function provideLocationStrategy(
    platformLocationStrategy: PlatformLocation, baseHref: string, options: ExtraOptions = {}) {
  return options.useHash ? new HashLocationStrategy(platformLocationStrategy, baseHref) :
                           new PathLocationStrategy(platformLocationStrategy, baseHref);
}