library angular2.src.core.render.dom.dom_tokens;

import "package:angular2/src/core/di.dart" show OpaqueToken;

/**
 * A DI Token representing the main rendering context. In a browser this is the DOM Document.
 *
 * Note: Document might not be available in the Application Context when Application and Rendering
 * Contexts are not the same (e.g. when running the application into a Web Worker).
 */
const OpaqueToken DOCUMENT = const OpaqueToken("DocumentToken");
