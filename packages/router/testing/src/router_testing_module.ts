/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {provideLocationMocks} from '@angular/common/testing';
import {Compiler, inject, Injector, ModuleWithProviders, NgModule} from '@angular/core';
import {ChildrenOutletContexts, ExtraOptions, NoPreloading, Route, Router, ROUTER_CONFIGURATION, RouteReuseStrategy, RouterModule, ROUTES, Routes, TitleStrategy, UrlHandlingStrategy, UrlSerializer, ɵROUTER_PROVIDERS as ROUTER_PROVIDERS, ɵwithPreloading as withPreloading} from '@angular/router';

function isUrlHandlingStrategy(opts: ExtraOptions|
                               UrlHandlingStrategy): opts is UrlHandlingStrategy {
  // This property check is needed because UrlHandlingStrategy is an interface and doesn't exist at
  // runtime.
  return 'shouldProcessUrl' in opts;
}

function throwInvalidConfigError(parameter: string): never {
  throw new Error(
      `Parameter ${parameter} does not match the one available in the injector. ` +
      '`setupTestingRouter` is meant to be used as a factory function with dependencies coming from DI.');
}

/**
 * Router setup factory function used for testing.
 *
 * @publicApi
 * @deprecated Use `provideRouter` or `RouterModule` instead.
 */
export function setupTestingRouter(
    urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location,
    compiler: Compiler, injector: Injector, routes: Route[][],
    opts?: ExtraOptions|UrlHandlingStrategy|null, urlHandlingStrategy?: UrlHandlingStrategy,
    routeReuseStrategy?: RouteReuseStrategy, titleStrategy?: TitleStrategy) {
  // Note: The checks below are to detect misconfigured providers and invalid uses of
  // `setupTestingRouter`. This function is not used internally (neither in router code or anywhere
  // in g3). It appears this function was exposed as publicApi by mistake and should not be used
  // externally either. However, if it is, the documented intent is to be used as a factory function
  // and parameter values should always match what's available in DI.
  if (urlSerializer !== inject(UrlSerializer)) {
    throwInvalidConfigError('urlSerializer');
  }
  if (contexts !== inject(ChildrenOutletContexts)) {
    throwInvalidConfigError('contexts');
  }
  if (location !== inject(Location)) {
    throwInvalidConfigError('location');
  }
  if (compiler !== inject(Compiler)) {
    throwInvalidConfigError('compiler');
  }
  if (injector !== inject(Injector)) {
    throwInvalidConfigError('injector');
  }
  if (routes !== inject(ROUTES)) {
    throwInvalidConfigError('routes');
  }
  if (opts) {
    // Handle deprecated argument ordering.
    if (isUrlHandlingStrategy(opts)) {
      if (opts !== inject(UrlHandlingStrategy)) {
        throwInvalidConfigError('opts (UrlHandlingStrategy)');
      }
    } else {
      if (opts !== inject(ROUTER_CONFIGURATION)) {
        throwInvalidConfigError('opts (ROUTER_CONFIGURATION)');
      }
    }
  }

  if (urlHandlingStrategy !== inject(UrlHandlingStrategy)) {
    throwInvalidConfigError('urlHandlingStrategy');
  }

  if (routeReuseStrategy !== inject(RouteReuseStrategy)) {
    throwInvalidConfigError('routeReuseStrategy');
  }

  if (titleStrategy !== inject(TitleStrategy)) {
    throwInvalidConfigError('titleStrategy');
  }

  return new Router();
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
 *       RouterModule.forRoot(
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
    provideLocationMocks(),
    withPreloading(NoPreloading).ɵproviders,
    {provide: ROUTES, multi: true, useValue: []},
  ]
})
export class RouterTestingModule {
  static withRoutes(routes: Routes, config?: ExtraOptions):
      ModuleWithProviders<RouterTestingModule> {
    return {
      ngModule: RouterTestingModule,
      providers: [
        {provide: ROUTES, multi: true, useValue: routes},
        {provide: ROUTER_CONFIGURATION, useValue: config ? config : {}},
      ]
    };
  }
}
