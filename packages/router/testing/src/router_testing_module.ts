/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {MockLocationStrategy, SpyLocation} from '@angular/common/testing';
import {Compiler, Injector, ModuleWithProviders, NgModule, Optional} from '@angular/core';
import {ChildrenOutletContexts, DefaultTitleStrategy, ExtraOptions, NoPreloading, PreloadingStrategy, provideRoutes, Route, Router, ROUTER_CONFIGURATION, RouteReuseStrategy, RouterModule, ROUTES, Routes, TitleStrategy, UrlHandlingStrategy, UrlSerializer, ɵassignExtraOptionsToRouter as assignExtraOptionsToRouter, ɵflatten as flatten, ɵROUTER_PROVIDERS as ROUTER_PROVIDERS} from '@angular/router';

import {EXTRA_ROUTER_TESTING_PROVIDERS} from './extra_router_testing_providers';

function isUrlHandlingStrategy(opts: ExtraOptions|
                               UrlHandlingStrategy): opts is UrlHandlingStrategy {
  // This property check is needed because UrlHandlingStrategy is an interface and doesn't exist at
  // runtime.
  return 'shouldProcessUrl' in opts;
}

/**
 * Router setup factory function used for testing. Only used internally to keep the factory that's
 * marked as publicApi cleaner (i.e. not having _both_ `TitleStrategy` and `DefaultTitleStrategy`).
 */
export function setupTestingRouterInternal(
    urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location,
    compiler: Compiler, injector: Injector, routes: Route[][],
    opts?: ExtraOptions|UrlHandlingStrategy, urlHandlingStrategy?: UrlHandlingStrategy,
    routeReuseStrategy?: RouteReuseStrategy, defaultTitleStrategy?: DefaultTitleStrategy,
    titleStrategy?: TitleStrategy) {
  return setupTestingRouter(
      urlSerializer, contexts, location, compiler, injector, routes, opts, urlHandlingStrategy,
      routeReuseStrategy, titleStrategy ?? defaultTitleStrategy);
}

/**
 * Router setup factory function used for testing.
 *
 * @publicApi
 */
export function setupTestingRouter(
    urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location,
    compiler: Compiler, injector: Injector, routes: Route[][],
    opts?: ExtraOptions|UrlHandlingStrategy|null, urlHandlingStrategy?: UrlHandlingStrategy,
    routeReuseStrategy?: RouteReuseStrategy, titleStrategy?: TitleStrategy) {
  const router =
      new Router(null!, urlSerializer, contexts, location, injector, compiler, flatten(routes));
  if (opts) {
    // Handle deprecated argument ordering.
    if (isUrlHandlingStrategy(opts)) {
      router.urlHandlingStrategy = opts;
    } else {
      // Handle ExtraOptions
      assignExtraOptionsToRouter(opts, router);
    }
  }

  if (urlHandlingStrategy) {
    router.urlHandlingStrategy = urlHandlingStrategy;
  }

  if (routeReuseStrategy) {
    router.routeReuseStrategy = routeReuseStrategy;
  }

  router.titleStrategy = titleStrategy;

  return router;
}

/**
 * @description
 *
 * Sets up the router to be used for testing.
 *
 * The modules sets up the router to be used for testing.
 * It provides spy implementations of `Location` and `LocationStrategy`.
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * beforeEach(() => {
 *   TestBed.configureTestingModule({
 *     imports: [
 *       RouterTestingModule.withRoutes(
 *         [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}]
 *       )
 *     ]
 *   });
 * });
 * ```
 *
 * @publicApi
 */
@NgModule({
  exports: [RouterModule],
  providers: [
    ROUTER_PROVIDERS,
    EXTRA_ROUTER_TESTING_PROVIDERS,
    {provide: Location, useClass: SpyLocation},
    {provide: LocationStrategy, useClass: MockLocationStrategy},
    {
      provide: Router,
      useFactory: setupTestingRouterInternal,
      deps: [
        UrlSerializer,
        ChildrenOutletContexts,
        Location,
        Compiler,
        Injector,
        ROUTES,
        ROUTER_CONFIGURATION,
        [UrlHandlingStrategy, new Optional()],
        [RouteReuseStrategy, new Optional()],
        [DefaultTitleStrategy, new Optional()],
        [TitleStrategy, new Optional()],
      ]
    },
    {provide: PreloadingStrategy, useExisting: NoPreloading},
    provideRoutes([]),
  ]
})
export class RouterTestingModule {
  static withRoutes(routes: Routes, config?: ExtraOptions):
      ModuleWithProviders<RouterTestingModule> {
    return {
      ngModule: RouterTestingModule,
      providers: [
        provideRoutes(routes),
        {provide: ROUTER_CONFIGURATION, useValue: config ? config : {}},
      ]
    };
  }
}
