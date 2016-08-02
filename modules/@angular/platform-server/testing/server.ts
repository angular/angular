/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {analyzeAppProvidersForDeprecatedConfiguration} from '@angular/compiler';
import {platformCoreDynamicTesting} from '@angular/compiler/testing';
import {COMPILER_OPTIONS, CompilerFactory, NgModule, OpaqueToken, PLATFORM_COMMON_PROVIDERS, PLATFORM_INITIALIZER, PlatformRef, ReflectiveInjector, assertPlatform, createPlatform, createPlatformFactory, getPlatform} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule, TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';

import {Console} from '../core_private';
import {platformServer} from '../index';
import {Parse5DomAdapter} from '../src/parse5_adapter';
import {INTERNAL_SERVER_PLATFORM_PROVIDERS} from '../src/server';


/**
 * Platform for testing
 *
 * @experimental API related to bootstrapping are still under review.
 */
export const platformServerTesting = createPlatformFactory(
    platformCoreDynamicTesting, 'serverTesting', INTERNAL_SERVER_PLATFORM_PROVIDERS);

/**
 * @deprecated Use {@link platformServerTesting} instead
 */
export const serverTestingPlatform = platformServerTesting;

/**
 * NgModule for testing.
 *
 * @experimental API related to bootstrapping are still under review.
 */
@NgModule({exports: [BrowserDynamicTestingModule]})
export class ServerTestingModule {
}

/**
 * Providers of the `serverTestingPlatform` to be used for creating own platform based on this.
 *
 * @deprecated Use `platformServerTesting()` or create a custom platform factory via
 * `createPlatformFactory(platformServerTesting, ...)`
 */
export const TEST_SERVER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    // Note: This is not a real provider but a hack to still support the deprecated
    // `setBaseTestProviders` method!
    [(appProviders: any[]) => {
      const deprecatedConfiguration = analyzeAppProvidersForDeprecatedConfiguration(appProviders);
      const platformRef = createPlatformFactory(platformServerTesting, 'serverTestingDeprecated', [{
                                                  provide: COMPILER_OPTIONS,
                                                  useValue: deprecatedConfiguration.compilerOptions,
                                                  multi: true
                                                }])();

      @NgModule({
        exports: [ServerTestingModule],
        declarations: [deprecatedConfiguration.moduleDeclarations]
      })
      class DynamicTestModule {
      }

      const testInjector = TestBed.initTestEnvironment(DynamicTestModule, platformRef);
      const console: Console = testInjector.get(Console);
      deprecatedConfiguration.deprecationMessages.forEach((msg) => console.warn(msg));
    }];

/**
 * @deprecated Use initTestEnvironment with ServerTestModule instead. This is empty for backwards
 * compatibility,
 * as all of our bootstrap methods add a module implicitly, i.e. keeping this filled would add the
 * providers 2x.
 */
export const TEST_SERVER_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [];
