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
