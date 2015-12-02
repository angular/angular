/**
 * @module
 * @description
 * This module is used for writing tests for applications written in Angular.
 *
 * This module is not included in the `angular2` module; you must import the test module explicitly.
 *
 */
export * from './src/testing/testing';
export {ComponentFixture, TestComponentBuilder} from './src/testing/test_component_builder';
export * from './src/testing/test_injector';
export * from './src/testing/fake_async';

export {MockViewResolver} from 'angular2/src/mock/view_resolver_mock';
export {MockXHR} from 'angular2/src/compiler/xhr_mock';
export {MockNgZone} from 'angular2/src/mock/ng_zone_mock';
export {MockApplicationRef} from 'angular2/src/mock/mock_application_ref';
export {MockDirectiveResolver} from 'angular2/src/mock/directive_resolver_mock';
