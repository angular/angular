library angular2.platform.testing.browser;

import "package:angular2/platform/testing/browser_static.dart"
    show
        TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
        ADDITIONAL_TEST_BROWSER_PROVIDERS;
import "package:angular2/platform/browser.dart" show BROWSER_APP_PROVIDERS;

/**
 * Default patform providers for testing.
 */
const List<dynamic> TEST_BROWSER_PLATFORM_PROVIDERS = const [
  TEST_BROWSER_STATIC_PLATFORM_PROVIDERS
];
/**
 * Default application providers for testing.
 */
const List<dynamic> TEST_BROWSER_APPLICATION_PROVIDERS = const [
  BROWSER_APP_PROVIDERS,
  ADDITIONAL_TEST_BROWSER_PROVIDERS
];
