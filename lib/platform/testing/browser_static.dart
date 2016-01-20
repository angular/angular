library angular2.platform.testing.browser_static;

import "package:angular2/core.dart"
    show
        APP_ID,
        DirectiveResolver,
        NgZone,
        Provider,
        ViewResolver,
        PLATFORM_COMMON_PROVIDERS,
        PLATFORM_INITIALIZER;
import "package:angular2/src/platform/browser_common.dart"
    show BROWSER_APP_COMMON_PROVIDERS;
import "package:angular2/src/platform/browser/browser_adapter.dart"
    show BrowserDomAdapter;
import "package:angular2/src/animate/animation_builder.dart"
    show AnimationBuilder;
import "package:angular2/src/mock/animation_builder_mock.dart"
    show MockAnimationBuilder;
import "package:angular2/src/mock/directive_resolver_mock.dart"
    show MockDirectiveResolver;
import "package:angular2/src/mock/view_resolver_mock.dart"
    show MockViewResolver;
import "package:angular2/src/mock/mock_location_strategy.dart"
    show MockLocationStrategy;
import "package:angular2/src/router/location_strategy.dart"
    show LocationStrategy;
import "package:angular2/src/mock/ng_zone_mock.dart" show MockNgZone;
import "package:angular2/src/platform/browser/xhr_impl.dart" show XHRImpl;
import "package:angular2/compiler.dart" show XHR;
import "package:angular2/src/testing/test_component_builder.dart"
    show TestComponentBuilder;
import "package:angular2/src/testing/utils.dart" show BrowserDetection;
import "package:angular2/platform/common_dom.dart" show ELEMENT_PROBE_PROVIDERS;
import "package:angular2/src/testing/utils.dart" show Log;

initBrowserTests() {
  BrowserDomAdapter.makeCurrent();
  BrowserDetection.setup();
}

/**
 * Default patform providers for testing without a compiler.
 */
const List<dynamic> TEST_BROWSER_STATIC_PLATFORM_PROVIDERS = const [
  PLATFORM_COMMON_PROVIDERS,
  const Provider(PLATFORM_INITIALIZER, useValue: initBrowserTests, multi: true)
];
const List<dynamic> ADDITIONAL_TEST_BROWSER_PROVIDERS = const [
  const Provider(APP_ID, useValue: "a"),
  ELEMENT_PROBE_PROVIDERS,
  const Provider(DirectiveResolver, useClass: MockDirectiveResolver),
  const Provider(ViewResolver, useClass: MockViewResolver),
  Log,
  TestComponentBuilder,
  const Provider(NgZone, useClass: MockNgZone),
  const Provider(LocationStrategy, useClass: MockLocationStrategy),
  const Provider(AnimationBuilder, useClass: MockAnimationBuilder)
];
/**
 * Default application providers for testing without a compiler.
 */
const List<dynamic> TEST_BROWSER_STATIC_APPLICATION_PROVIDERS = const [
  BROWSER_APP_COMMON_PROVIDERS,
  const Provider(XHR, useClass: XHRImpl),
  ADDITIONAL_TEST_BROWSER_PROVIDERS
];
