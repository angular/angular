'use strict';var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var MOUSE_EVENT_PROPERTIES = [
    "altKey",
    "button",
    "clientX",
    "clientY",
    "metaKey",
    "movementX",
    "movementY",
    "offsetX",
    "offsetY",
    "region",
    "screenX",
    "screenY",
    "shiftKey"
];
var KEYBOARD_EVENT_PROPERTIES = [
    'altkey',
    'charCode',
    'code',
    'ctrlKey',
    'isComposing',
    'key',
    'keyCode',
    'location',
    'metaKey',
    'repeat',
    'shiftKey',
    'which'
];
var EVENT_PROPERTIES = ['type', 'bubbles', 'cancelable'];
var NODES_WITH_VALUE = new collection_1.Set(["input", "select", "option", "button", "li", "meter", "progress", "param"]);
function serializeGenericEvent(e) {
    return serializeEvent(e, EVENT_PROPERTIES);
}
exports.serializeGenericEvent = serializeGenericEvent;
// TODO(jteplitz602): Allow users to specify the properties they need rather than always
// adding value and files #3374
function serializeEventWithTarget(e) {
    var serializedEvent = serializeEvent(e, EVENT_PROPERTIES);
    return addTarget(e, serializedEvent);
}
exports.serializeEventWithTarget = serializeEventWithTarget;
function serializeMouseEvent(e) {
    return serializeEvent(e, MOUSE_EVENT_PROPERTIES);
}
exports.serializeMouseEvent = serializeMouseEvent;
function serializeKeyboardEvent(e) {
    var serializedEvent = serializeEvent(e, KEYBOARD_EVENT_PROPERTIES);
    return addTarget(e, serializedEvent);
}
exports.serializeKeyboardEvent = serializeKeyboardEvent;
// TODO(jteplitz602): #3374. See above.
function addTarget(e, serializedEvent) {
    if (NODES_WITH_VALUE.has(e.target.tagName.toLowerCase())) {
        var target = e.target;
        serializedEvent['target'] = { 'value': target.value };
        if (lang_1.isPresent(target.files)) {
            serializedEvent['target']['files'] = target.files;
        }
    }
    return serializedEvent;
}
function serializeEvent(e, properties) {
    var serialized = {};
    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        serialized[prop] = e[prop];
    }
    return serialized;
}
//# sourceMappingURL=event_serializer.js.map