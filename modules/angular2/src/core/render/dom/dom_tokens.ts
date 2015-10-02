import {OpaqueToken, Binding} from 'angular2/src/core/di';
import {CONST_EXPR, StringWrapper, Math} from 'angular2/src/core/facade/lang';

export const DOCUMENT: OpaqueToken = CONST_EXPR(new OpaqueToken('DocumentToken'));

/**
 * A unique id (string) for an angular application.
 */
export const APP_ID: OpaqueToken = CONST_EXPR(new OpaqueToken('AppId'));

function _appIdRandomBindingFactory() {
  return `${_randomChar()}${_randomChar()}${_randomChar()}`;
}

/**
 * Bindings that will generate a random APP_ID_TOKEN.
 */
export const APP_ID_RANDOM_BINDING: Binding =
    CONST_EXPR(new Binding(APP_ID, {toFactory: _appIdRandomBindingFactory, deps: []}));

function _randomChar(): string {
  return StringWrapper.fromCharCode(97 + Math.floor(Math.random() * 25));
}
