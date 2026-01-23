/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideLocationMocks} from '@angular/common/testing';
import {ModuleWithProviders, NgModule} from '@angular/core';
import {
  ExtraOptions,
  NoPreloading,
  ROUTER_CONFIGURATION,
  RouterModule,
  ROUTES,
  Routes,
  withPreloading,
  ɵROUTER_PROVIDERS as ROUTER_PROVIDERS,
} from '../../index';

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
 * ```ts
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
