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
exports.TestComponentBuilder = test_component_builder_1.TestComponentBuilder;
__export(require('./src/testing/test_injector'));
__export(require('./src/testing/fake_async'));
var view_resolver_mock_1 = require('angular2/src/mock/view_resolver_mock');
exports.MockViewResolver = view_resolver_mock_1.MockViewResolver;
var xhr_mock_1 = require('angular2/src/compiler/xhr_mock');
exports.MockXHR = xhr_mock_1.MockXHR;
var ng_zone_mock_1 = require('angular2/src/mock/ng_zone_mock');
exports.MockNgZone = ng_zone_mock_1.MockNgZone;
var mock_application_ref_1 = require('angular2/src/mock/mock_application_ref');
exports.MockApplicationRef = mock_application_ref_1.MockApplicationRef;
var directive_resolver_mock_1 = require('angular2/src/mock/directive_resolver_mock');
exports.MockDirectiveResolver = directive_resolver_mock_1.MockDirectiveResolver;
//# sourceMappingURL=testing.js.map