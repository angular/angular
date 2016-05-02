import {
  TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
  ADDITIONAL_TEST_BROWSER_PROVIDERS
} from '@angular/platform-browser/testing';
import {BROWSER_APP_DYNAMIC_PROVIDERS} from '../index';


/**
 * Default platform providers for testing.
 */
export const TEST_BROWSER_DYNAMIC_PLATFORM_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[TEST_BROWSER_STATIC_PLATFORM_PROVIDERS];

/**
 * Default application providers for testing.
 */
export const TEST_BROWSER_DYNAMIC_APPLICATION_PROVIDERS: Array<any /*Type | Provider | any[]*/> =
    /*@ts2dart_const*/[BROWSER_APP_DYNAMIC_PROVIDERS, ADDITIONAL_TEST_BROWSER_PROVIDERS];
