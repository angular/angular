/**
 * JS version of browser APIs. This library can only run in the browser.
 */

var win = window;

export {win as window};
export var document = window.document;
export var location = window.location;
export var gc = window.gc ? () => window.gc() : () => null;
