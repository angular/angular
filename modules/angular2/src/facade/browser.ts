/**
 * JS version of browser APIs. This library can only run in the browser.
 */
// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;

var win = window;

export {win as window};
export var document = window.document;
export var location = window.location;
export var gc = window.gc ? () => window.gc() : () => null;
