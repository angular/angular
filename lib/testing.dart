/**
 * @module
 * @description
 * This module is used for writing tests for applications written in Angular.
 *
 * This module is not included in the `angular2` module; you must import the test module explicitly.
 *
 */
library angular2.testing;

export "src/testing/testing.dart";
export "src/testing/test_component_builder.dart"
    show ComponentFixture, RootTestComponent, TestComponentBuilder;
export "src/testing/test_injector.dart";
export "src/testing/fake_async.dart";
export "package:angular2/src/mock/view_resolver_mock.dart"
    show MockViewResolver;
export "package:angular2/src/compiler/xhr_mock.dart" show MockXHR;
export "package:angular2/src/mock/ng_zone_mock.dart" show MockNgZone;
export "package:angular2/src/mock/mock_application_ref.dart"
    show MockApplicationRef;
export "package:angular2/src/mock/directive_resolver_mock.dart"
    show MockDirectiveResolver;
