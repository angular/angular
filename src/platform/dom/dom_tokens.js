'use strict';var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
/**
 * A DI Token representing the main rendering context. In a browser this is the DOM Document.
 *
 * Note: Document might not be available in the Application Context when Application and Rendering
 * Contexts are not the same (e.g. when running the application into a Web Worker).
 */
exports.DOCUMENT = lang_1.CONST_EXPR(new di_1.OpaqueToken('DocumentToken'));
//# sourceMappingURL=dom_tokens.js.map