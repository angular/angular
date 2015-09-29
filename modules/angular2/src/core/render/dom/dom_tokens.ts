import {OpaqueToken, Binding} from 'angular2/src/core/di';
import {CONST_EXPR, StringWrapper, Math} from 'angular2/src/core/facade/lang';

/**
 * A DI Token representing the main rendering context. In a browser this is the DOM Document.
 *
 * Note: Document might not be available in the Application Context when Application and Rendering
 * Contexts are not the same (e.g. when running the application into a Web Worker).
 */
export const DOCUMENT: OpaqueToken = CONST_EXPR(new OpaqueToken('DocumentToken'));

/**
 * A DI Token representing a unique string id assigned to the application by Angular and used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated} is being used.
 *
 * If you need to avoid randomly generated value to be used as an application id, you can provide
 * a custom value via a DI binding <!-- TODO: provider --> configuring the root {@link Injector}
 * using this token.
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
