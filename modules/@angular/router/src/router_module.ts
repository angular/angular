/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF, HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation} from '@angular/common';
import {ANALYZE_FOR_ENTRY_COMPONENTS, APP_BOOTSTRAP_LISTENER, ApplicationRef, Compiler, Inject, Injector, ModuleWithProviders, NgModule, NgModuleFactoryLoader, OpaqueToken, Optional, Provider, SkipSelf, SystemJsNgModuleLoader} from '@angular/core';

import {Route, Routes} from './config';
import {RouterLink, RouterLinkWithHref} from './directives/router_link';
import {RouterLinkActive} from './directives/router_link_active';
import {RouterOutlet} from './directives/router_outlet';
import {ErrorHandler, Router} from './router';
import {ROUTES} from './router_config_loader';
import {RouterOutletMap} from './router_outlet_map';
import {ActivatedRoute} from './router_state';
import {DefaultUrlSerializer, UrlSerializer} from './url_tree';
import {flatten} from './utils/collection';



/**
 * @stable
 */
const ROUTER_DIRECTIVES = [RouterOutlet, RouterLink, RouterLinkWithHref, RouterLinkActive];

/**
 * @stable
 */
export const ROUTER_CONFIGURATION = new OpaqueToken('ROUTER_CONFIGURATION');

export const ROUTER_FORROOT_GUARD = new OpaqueToken('ROUTER_FORROOT_GUARD');

const pathLocationStrategy = {
  provide: LocationStrategy,
  useClass: PathLocationStrategy
};
const hashLocationStrategy = {
  provide: LocationStrategy,
  useClass: HashLocationStrategy
};

export const ROUTER_PROVIDERS: Provider[] = [
  Location, {provide: UrlSerializer, useClass: DefaultUrlSerializer}, {
    provide: Router,
    useFactory: setupRouter,
    deps: [
      ApplicationRef, UrlSerializer, RouterOutletMap, Location, Injector, NgModuleFactoryLoader,
      Compiler, ROUTES, ROUTER_CONFIGURATION
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
 * For submodules and lazy loaded submodules it should be used as follows:
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
 * @stable
 */
@NgModule({declarations: ROUTER_DIRECTIVES, exports: ROUTER_DIRECTIVES})
export class RouterModule {
  constructor(@Optional() @Inject(ROUTER_FORROOT_GUARD) guard: any) {}

  static forRoot(routes: Routes, config?: ExtraOptions): ModuleWithProviders {
    return {
      ngModule: RouterModule,
      providers: [
        ROUTER_PROVIDERS, provideRoutes(routes), {
          provide: ROUTER_FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[Router, new Optional(), new SkipSelf()]]
        },
        {provide: ROUTER_CONFIGURATION, useValue: config ? config : {}}, {
          provide: LocationStrategy,
          useFactory: provideLocationStrategy,
          deps: [
            PlatformLocation, [new Inject(APP_BASE_HREF), new Optional()], ROUTER_CONFIGURATION
          ]
        },
        provideRouterInitializer()
      ]
    };
  }

  static forChild(routes: Routes): ModuleWithProviders {
    return {ngModule: RouterModule, providers: [provideRoutes(routes)]};
  }
}

export function provideLocationStrategy(
    platformLocationStrategy: PlatformLocation, baseHref: string, options: ExtraOptions = {}) {
  return options.useHash ? new HashLocationStrategy(platformLocationStrategy, baseHref) :
                           new PathLocationStrategy(platformLocationStrategy, baseHref);
}

export function provideForRootGuard(router: Router): any {
  if (router) {
    throw new Error(
        `RouterModule.forRoot() called twice. Lazy loaded modules should use RouterModule.forChild() instead.`);
  }
  return 'guarded';
}

/**
 * @stable
 */
export function provideRoutes(routes: Routes): any {
  return [
    {provide: ANALYZE_FOR_ENTRY_COMPONENTS, multi: true, useValue: routes},
    {provide: ROUTES, multi: true, useValue: routes}
  ];
}


/**
 * Extra options used to configure the router.
 *
 * Set `enableTracing` to log router events to the console.
 * Set 'useHash' to true to enable HashLocationStrategy.
 * Set `errorHandler` to enable a custom ErrorHandler.
 *
 * @stable
 */
export interface ExtraOptions {
  enableTracing?: boolean;
  useHash?: boolean;
  initialNavigation?: boolean;
  errorHandler?: ErrorHandler;
}

export function setupRouter(
    ref: ApplicationRef, urlSerializer: UrlSerializer, outletMap: RouterOutletMap,
    location: Location, injector: Injector, loader: NgModuleFactoryLoader, compiler: Compiler,
    config: Route[][], opts: ExtraOptions = {}) {
  if (ref.componentTypes.length == 0) {
    throw new Error('Bootstrap at least one component before injecting Router.');
  }
  const componentType = ref.componentTypes[0];
  const r = new Router(
      componentType, urlSerializer, outletMap, location, injector, loader, compiler,
      flatten(config));

  if (opts.errorHandler) {
    r.errorHandler = opts.errorHandler;
  }

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

export function initialRouterNavigation(router: Router, opts: ExtraOptions) {
  return () => {
    if (opts.initialNavigation === false) {
      router.setUpLocationChangeListener();
    } else {
      router.initialNavigation();
    }
  };
}

export function provideRouterInitializer() {
  return {
    provide: APP_BOOTSTRAP_LISTENER,
    multi: true,
    useFactory: initialRouterNavigation,
    deps: [Router, ROUTER_CONFIGURATION]
  };
}
