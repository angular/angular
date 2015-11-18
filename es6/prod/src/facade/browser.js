/**
 * JS version of browser APIs. This library can only run in the browser.
 */
var win = window;
export { win as window };
export var document = window.document;
export var location = window.location;
export var gc = window['gc'] ? () => window['gc']() : () => null;
export var performance = window['performance'] ? window['performance'] : null;
export const Event = Event;
export const MouseEvent = MouseEvent;
export const KeyboardEvent = KeyboardEvent;
export const EventTarget = EventTarget;
export const History = History;
export const Location = Location;
export const EventListener = EventListener;
//# sourceMappingURL=browser.js.map