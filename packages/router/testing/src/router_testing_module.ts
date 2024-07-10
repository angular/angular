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
import {
  ChildrenOutletContexts,
  ExtraOptions,
  NoPreloading,
  Route,
  Router,
  ROUTER_CONFIGURATION,
  RouteReuseStrategy,
  RouterModule,
  ROUTES,
  Routes,
  TitleStrategy,
  UrlHandlingStrategy,
  UrlSerializer,
  withPreloading,
  ɵROUTER_PROVIDERS as ROUTER_PROVIDERS,
} from '@angular/router';

function isUrlHandlingStrategy(
  opts: ExtraOptions | UrlHandlingStrategy,
): opts is UrlHandlingStrategy {
  // This property check is needed because UrlHandlingStrategy is an interface and doesn't exist at
  // runtime.
  return 'shouldProcessUrl' in opts;
}

function throwInvalidConfigError(parameter: string): never {
  throw new Error(
    `Parameter ${parameter} does not match the one available in the injector. ` +
      '`setupTestingRouter` is meant to be used as a factory function with dependencies coming from DI.',
  );
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
 * @deprecated Use `provideRouter` or `RouterModule`/`RouterModule.forRoot` instead.
 * This module was previously used to provide a helpful collection of test fakes,
 * most notably those for `Location` and `LocationStrategy`.  These are generally not
 * required anymore, as `MockPlatformLocation` is provided in `TestBed` by default.
 * However, you can use them directly with `provideLocationMocks`.
 */
@NgModule({
  exports: [RouterModule],
  providers: [
    ROUTER_PROVIDERS,
    provideLocationMocks(),
    withPreloading(NoPreloading).ɵproviders,
    {provide: ROUTES, multi: true, useValue: []},
  ],
})
export class RouterTestingModule {
  static withRoutes(
    routes: Routes,
    config?: ExtraOptions,
  ): ModuleWithProviders<RouterTestingModule> {
    return {
      ngModule: RouterTestingModule,
      providers: [
        {provide: ROUTES, multi: true, useValue: routes},
        {provide: ROUTER_CONFIGURATION, useValue: config ? config : {}},
      ],
    };
  }
}
