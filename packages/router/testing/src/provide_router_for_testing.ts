/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {MockLocationStrategy, SpyLocation} from '@angular/common/testing';
import {Provider} from '@angular/core';
import {provideRouter, RouterFeatures, Routes} from '@angular/router';


/**
 * Sets up providers necessary to enable `Router` functionality for tests.
 *
 * Allows to configure a set of routes as well as extra features that should be enabled.
 * Provides spy implementations of `Location` and `LocationStrategy` interfaces.
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * const testRoutes: Routes = [
 *   {path: '', component: BlankCmp},
 *   {path: 'simple', component: SimpleCmp}
 * ];
 *
 * beforeEach(() => {
 *   TestBed.configureTestingModule({
 *     providers: [
 *       provideRouterForTesting(testRoutes,
 *         withDebugTracing(),
 *         withRouterConfig({paramsInheritanceStrategy: 'always'}),
 *       )
 *     ]
 *   });
 * });
 * ```
 *
 * @see `provideRouter`
 *
 * @param routes A set of `Route`s to use during the test.
 * @param features Optional features to configure additional router behaviors.
 * @returns A set of providers to setup Router for testing.
 */
export function provideRouterForTesting(
    routes: Routes = [], ...features: RouterFeatures[]): Provider[] {
  return [
    ...provideRouter(routes, ...features),
    {provide: Location, useClass: SpyLocation},
    {provide: LocationStrategy, useClass: MockLocationStrategy},
  ];
}
