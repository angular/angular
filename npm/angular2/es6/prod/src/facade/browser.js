/**
 * JS version of browser APIs. This library can only run in the browser.
 */
var win = window;
export { win as window };
export var document = window.document;
export var location = window.location;
export var gc = window['gc'] ? () => window['gc']() : () => null;
export var performance = window['performance'] ? window['performance'] : null;
export const Event = window['Event'];
export const MouseEvent = window['MouseEvent'];
export const KeyboardEvent = window['KeyboardEvent'];
export const EventTarget = window['EventTarget'];
export const History = window['History'];
export const Location = window['Location'];
export const EventListener = window['EventListener'];
