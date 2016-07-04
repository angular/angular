/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AppModule, OpaqueToken, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER, PlatformRef, ReflectiveInjector, assertPlatform, createPlatform, getPlatform} from '@angular/core';
import {BrowserDynamicTestModule, browserTestCompiler} from '@angular/platform-browser-dynamic/testing';

import {Parse5DomAdapter} from '../src/parse5_adapter';

const SERVER_TEST_PLATFORM_MARKER = new OpaqueToken('ServerTestPlatformMarker');

function initServerTests() {
  Parse5DomAdapter.makeCurrent();
}

/**
 * Creates a compiler for testing
 *
 * @stable
 */
export const serverTestCompiler = browserTestCompiler;

const TEST_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      PLATFORM_COMMON_PROVIDERS,
      /*@ts2dart_Provider*/ {provide: PLATFORM_INITIALIZER, useValue: initServerTests, multi: true},
      {provide: SERVER_TEST_PLATFORM_MARKER, useValue: true}
    ];

/**
 * Platform for testing
 *
 * @experimental API related to bootstrapping are still under review.
 */
export function serverTestPlatform(): PlatformRef {
  if (!getPlatform()) {
    createPlatform(ReflectiveInjector.resolveAndCreate(TEST_SERVER_PLATFORM_PROVIDERS));
  }
  return assertPlatform(SERVER_TEST_PLATFORM_MARKER);
}

/**
 * AppModule for testing.
 *
 * @stable
 */
@AppModule({modules: [BrowserDynamicTestModule]})
export class ServerTestModule {
}
