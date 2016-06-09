import {DirectiveResolver, ViewResolver} from '@angular/compiler';
import {MockDirectiveResolver, MockViewResolver, TestComponentBuilder, TestComponentRenderer} from '@angular/compiler/testing';

import {BROWSER_APP_COMPILER_PROVIDERS, BROWSER_APP_PROVIDERS} from '../index';

import {ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS, TEST_BROWSER_STATIC_PLATFORM_PROVIDERS} from './browser_static';
import {DOMTestComponentRenderer} from './dom_test_component_renderer';


/**
 * Default platform providers for testing.
 */
export const TEST_BROWSER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    [TEST_BROWSER_STATIC_PLATFORM_PROVIDERS];


export const ADDITIONAL_TEST_BROWSER_PROVIDERS = [
  {provide: DirectiveResolver, useClass: MockDirectiveResolver},
  {provide: ViewResolver, useClass: MockViewResolver},
  TestComponentBuilder,
  {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
];

/**
 * Default application providers for testing.
 */
export const TEST_BROWSER_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  BROWSER_APP_PROVIDERS, BROWSER_APP_COMPILER_PROVIDERS, ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS,
  ADDITIONAL_TEST_BROWSER_PROVIDERS
];
