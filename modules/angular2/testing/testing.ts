/**
 * @module
 * @description
 * This module is used for writing tests for applications written in Angular.
 *
 * This module is not included in the `angular2` module; you must import the test module explicitly.
 *
 */
export * from './src/testing';
export {ComponentFixture, TestComponentBuilder} from './src/test_component_builder';
export * from './src/test_injector';
export * from './src/fake_async';

export {MockViewResolver} from './src/mock/view_resolver_mock';
export {MockXHR} from './src/mock/xhr_mock';
export {MockNgZone} from './src/mock/ng_zone_mock';
export {MockApplicationRef} from './src/mock/mock_application_ref';
export {MockDirectiveResolver} from './src/mock/directive_resolver_mock';
