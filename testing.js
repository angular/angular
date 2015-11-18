'use strict';function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
/**
 * @module
 * @description
 * This module is used for writing tests for applications written in Angular.
 *
 * This module is not included in the `angular2` module; you must import the test module explicitly.
 *
 */
__export(require('./src/testing/testing'));
var test_component_builder_1 = require('./src/testing/test_component_builder');
exports.ComponentFixture = test_component_builder_1.ComponentFixture;
exports.RootTestComponent = test_component_builder_1.RootTestComponent;
exports.TestComponentBuilder = test_component_builder_1.TestComponentBuilder;
__export(require('./src/testing/test_injector'));
__export(require('./src/testing/fake_async'));
//# sourceMappingURL=testing.js.map