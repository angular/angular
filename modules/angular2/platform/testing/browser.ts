import {
  TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
  ADDITIONAL_TEST_BROWSER_PROVIDERS
} from 'angular2/platform/testing/browser_static';

import {BROWSER_APP_PROVIDERS} from 'angular2/platform/browser';


import {CONST_EXPR} from 'angular2/src/facade/lang';

/**
 * Default patform providers for testing.
 */
export const TEST_BROWSER_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    CONST_EXPR([TEST_BROWSER_STATIC_PLATFORM_PROVIDERS]);

/**
 * Default application providers for testing.
 */
export const TEST_BROWSER_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    CONST_EXPR([BROWSER_APP_PROVIDERS, ADDITIONAL_TEST_BROWSER_PROVIDERS]);
