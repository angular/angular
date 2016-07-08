/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompilerConfig, DirectiveResolver, ViewResolver} from '@angular/compiler';
import {MockDirectiveResolver, MockViewResolver, OverridingTestComponentBuilder} from '@angular/compiler/testing';
import {AppModule, Compiler, CompilerFactory, PlatformRef, Provider, ReflectiveInjector, Type, createPlatformFactory} from '@angular/core';
import {TestComponentBuilder, TestComponentRenderer} from '@angular/core/testing';
import {BrowserTestModule, TEST_BROWSER_PLATFORM_PROVIDERS} from '@angular/platform-browser/testing';

import {BROWSER_APP_COMPILER_PROVIDERS, BROWSER_DYNAMIC_COMPILER_FACTORY, BROWSER_DYNAMIC_PLATFORM_PROVIDERS} from './index';
import {DOMTestComponentRenderer} from './testing/dom_test_component_renderer';

export * from './private_export_testing'

/**
 * CompilerFactory for browser dynamic test platform
 *
 * @experimental
 */
export const BROWSER_DYNAMIC_TEST_COMPILER_FACTORY = BROWSER_DYNAMIC_COMPILER_FACTORY.withDefaults({
  providers: [
    {provide: DirectiveResolver, useClass: MockDirectiveResolver},
    {provide: ViewResolver, useClass: MockViewResolver}
  ]
});


/**
 * Providers for the browser dynamic platform
 *
 * @experimental
 */
const BROWSER_DYNAMIC_TEST_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  TEST_BROWSER_PLATFORM_PROVIDERS,
  BROWSER_DYNAMIC_PLATFORM_PROVIDERS,
  {provide: CompilerFactory, useValue: BROWSER_DYNAMIC_TEST_COMPILER_FACTORY},
];

/**
 * @experimental API related to bootstrapping are still under review.
 */
export const browserDynamicTestPlatform =
    createPlatformFactory('browserDynamicTest', BROWSER_DYNAMIC_TEST_PLATFORM_PROVIDERS);

/**
 * AppModule for testing.
 *
 * @stable
 */
@AppModule({
  modules: [BrowserTestModule],
  providers: [
    {provide: TestComponentBuilder, useClass: OverridingTestComponentBuilder},
    {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
  ]
})
export class BrowserDynamicTestModule {
}