import {OpaqueToken} from 'angular2/src/core/di';
import {CONST_EXPR} from 'angular2/src/core/facade/lang';

/**
 * A DI Token representing the main rendering context. In a browser this is the DOM Document.
 *
 * Note: Document might not be available in the Application Context when Application and Rendering
 * Contexts are not the same (e.g. when running the application into a Web Worker).
 */
export const DOCUMENT: OpaqueToken = CONST_EXPR(new OpaqueToken('DocumentToken'));
