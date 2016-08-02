/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ANALYZE_FOR_ENTRY_COMPONENTS, APP_BOOTSTRAP_LISTENER, APP_INITIALIZER, ApplicationRef, ComponentResolver, Injector, NgModuleFactoryLoader, OpaqueToken, SystemJsNgModuleLoader} from '@angular/core';

import {Routes} from './config';
import {Router} from './router';
import {ROUTER_CONFIG, ROUTES} from './router_config_loader';
import {RouterOutletMap} from './router_outlet_map';
import {ActivatedRoute} from './router_state';
import {DefaultUrlSerializer, UrlSerializer} from './url_tree';

export const ROUTER_CONFIGURATION = new OpaqueToken('ROUTER_CONFIGURATION');

/**
 * @experimental
 */
export interface ExtraOptions {
  enableTracing?: boolean;
  useHash?: boolean;
}

export function setupRouter(
    ref: ApplicationRef, resolver: ComponentResolver, urlSerializer: UrlSerializer,
    outletMap: RouterOutletMap, location: Location, injector: Injector,
    loader: NgModuleFactoryLoader, config: Routes, opts: ExtraOptions = {}) {
  if (ref.componentTypes.length == 0) {
    throw new Error('Bootstrap at least one component before injecting Router.');
  }
  const componentType = ref.componentTypes[0];
  const r = new Router(
      componentType, resolver, urlSerializer, outletMap, location, injector, loader, config);

  if (opts.enableTracing) {
    r.events.subscribe(e => {
      console.group(`Router Event: ${(<any>e.constructor).name}`);
      console.log(e.toString());
      console.log(e);
      console.groupEnd();
    });
  }

  return r;
}

export function rootRoute(router: Router): ActivatedRoute {
  return router.routerState.root;
}

export function initialRouterNavigation(router: Router) {
  return () => { router.initialNavigation(); };
}

/**
 * An array of {@link Provider}s. To use the router, you must add this to your application.
 *
 * ### Example
 *
 * ```
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * class AppCmp {
 *   // ...
 * }
 *
 * const config = [
 *   {path: 'home', component: Home}
 * ];
 *
 * bootstrap(AppCmp, [provideRouter(config)]);
 * ```
 *
 * @deprecated use RouterModule instead
 */
export function provideRouter(routes: Routes, config: ExtraOptions = {}): any[] {
  return [
    {provide: ANALYZE_FOR_ENTRY_COMPONENTS, multi: true, useValue: routes},
    {provide: ROUTES, useExisting: ROUTER_CONFIG}, {provide: ROUTER_CONFIG, useValue: routes},

    {provide: ROUTER_CONFIGURATION, useValue: config}, Location,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: UrlSerializer, useClass: DefaultUrlSerializer},

    {
      provide: Router,
      useFactory: setupRouter,
      deps: [
        ApplicationRef, ComponentResolver, UrlSerializer, RouterOutletMap, Location, Injector,
        NgModuleFactoryLoader, ROUTES, ROUTER_CONFIGURATION
      ]
    },

    RouterOutletMap, {provide: ActivatedRoute, useFactory: rootRoute, deps: [Router]},

    // Trigger initial navigation
    provideRouterInitializer(), {provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader}
  ];
}

export function provideRouterInitializer() {
  return {
    provide: APP_BOOTSTRAP_LISTENER,
    multi: true,
    useFactory: initialRouterNavigation,
    deps: [Router]
  };
}

/**
 * Router configuration.
 *
 * ### Example
 *
 * ```
 * @NgModule({providers: [
 *   provideRoutes([{path: 'home', component: Home}])
 * ]})
 * class LazyLoadedModule {
 *   // ...
 * }
 * ```
 *
 * @deprecated
 */
export function provideRoutes(routes: Routes): any {
  return [
    {provide: ANALYZE_FOR_ENTRY_COMPONENTS, multi: true, useValue: routes},
    {provide: ROUTES, useValue: routes}
  ];
}

/**
 * Router configuration.
 *
 * ### Example
 *
 * ```
 * @NgModule({providers: [
 *   provideRouterOptions({enableTracing: true})
 * ]})
 * class LazyLoadedModule {
 *   // ...
 * }
 * ```
 *
 * @deprecated
 */
export function provideRouterConfig(config: ExtraOptions): any {
  return {provide: ROUTER_CONFIGURATION, useValue: config};
}
