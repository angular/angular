import {StringMap} from 'angular2/src/facade/collection';

const MOUSE_EVENT_PROPERTIES = [
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

const KEYBOARD_EVENT_PROPERTIES = [
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

export function serializeMouseEvent(e: MouseEvent): StringMap<string, any> {
  return serializeEvent(e, MOUSE_EVENT_PROPERTIES);
}

export function serializeKeyboardEvent(e: KeyboardEvent): StringMap<string, any> {
  return serializeEvent(e, KEYBOARD_EVENT_PROPERTIES);
}

function serializeEvent(e: any, properties: List<string>): StringMap<string, any> {
  var serialized = {};
  for (var i = 0; i < properties.length; i++) {
    var prop = properties[i];
    serialized[prop] = e[prop];
  }
  return serialized;
}
