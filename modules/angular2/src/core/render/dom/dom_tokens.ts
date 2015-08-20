import {OpaqueToken, Binding} from 'angular2/di';
import {CONST_EXPR, StringWrapper, Math} from 'angular2/src/core/facade/lang';

export const DOCUMENT: OpaqueToken = CONST_EXPR(new OpaqueToken('DocumentToken'));

/**
 * A unique id (string) for an angular application.
 */
export const APP_ID: OpaqueToken = CONST_EXPR(new OpaqueToken('AppId'));

function _appIdRandomBindingFactory() {
  return `${randomChar()}${randomChar()}${randomChar()}`;
}

/**
 * Bindings that will generate a random APP_ID_TOKEN.
 */
export const APP_ID_RANDOM_BINDING: Binding =
    CONST_EXPR(new Binding(APP_ID, {toFactory: _appIdRandomBindingFactory, deps: []}));

/**
 * Defines when a compiled template should be stored as a string
 * rather than keeping its Nodes to preserve memory.
 */
export const MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE: OpaqueToken =
    CONST_EXPR(new OpaqueToken('MaxInMemoryElementsPerTemplate'));

function randomChar(): string {
  return StringWrapper.fromCharCode(97 + Math.floor(Math.random() * 25));
}
