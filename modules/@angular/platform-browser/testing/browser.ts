import {
  TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
  ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS
} from './browser_static';
import {BROWSER_APP_PROVIDERS} from '../index';
import {DirectiveResolver, ViewResolver} from '@angular/compiler';
import {
  MockDirectiveResolver,
  MockViewResolver,
  TestComponentRenderer,
  TestComponentBuilder
} from '@angular/compiler/testing';
import {DOMTestComponentRenderer} from './dom_test_component_renderer';

/**
 * Default platform providers for testing.
 */
export const TEST_BROWSER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[TEST_BROWSER_STATIC_PLATFORM_PROVIDERS];


export const ADDITIONAL_TEST_BROWSER_PROVIDERS = [
  /*@ts2dart_Provider*/ {provide: DirectiveResolver, useClass: MockDirectiveResolver},
  /*@ts2dart_Provider*/ {provide: ViewResolver, useClass: MockViewResolver},
  TestComponentBuilder,
  /*@ts2dart_Provider*/ {provide: TestComponentRenderer, useClass: DOMTestComponentRenderer},
];

/**
 * Default application providers for testing.
 */
export const TEST_BROWSER_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[
      BROWSER_APP_PROVIDERS,
      ADDITIONAL_TEST_BROWSER_STATIC_PROVIDERS,
      ADDITIONAL_TEST_BROWSER_PROVIDERS
    ];
