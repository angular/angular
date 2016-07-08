/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModule, CompilerFactory, OpaqueToken, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER, PlatformRef, ReflectiveInjector, assertPlatform, createPlatform, createPlatformFactory, getPlatform} from '@angular/core';
import {BROWSER_DYNAMIC_TEST_COMPILER_FACTORY, BrowserDynamicTestModule} from '@angular/platform-browser-dynamic/testing';

import {Parse5DomAdapter} from '../src/parse5_adapter';

function initServerTests() {
  Parse5DomAdapter.makeCurrent();
}

const TEST_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      PLATFORM_COMMON_PROVIDERS,
      /*@ts2dart_Provider*/ {provide: PLATFORM_INITIALIZER, useValue: initServerTests, multi: true},
      {provide: CompilerFactory, useValue: BROWSER_DYNAMIC_TEST_COMPILER_FACTORY},
    ];

/**
 * Platform for testing
 *
 * @experimental API related to bootstrapping are still under review.
 */
export const serverTestPlatform =
    createPlatformFactory('serverTest', TEST_SERVER_PLATFORM_PROVIDERS);

/**
 * AppModule for testing.
 *
 * @stable
 */
@AppModule({modules: [BrowserDynamicTestModule]})
export class ServerTestModule {
}
