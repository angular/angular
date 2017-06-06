library angular2.src.web_workers.event_serializer;

import 'dart:core';
import 'dart:html';

// List of all elements with HTML value attribute.
// Taken from: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
final Set<String> NODES_WITH_VALUE = new Set<String>.from([
  "input",
  "select",
  "option",
  "button",
  "li",
  "meter",
  "progress",
  "param",
  "textarea"
]);

Map<String, dynamic> serializeGenericEvent(dynamic e) {
  var serialized = new Map<String, dynamic>();
  serialized['bubbles'] = e.bubbles;
  serialized['cancelable'] = e.cancelable;
  serialized['defaultPrevented'] = e.defaultPrevented;
  serialized['eventPhase'] = e.eventPhase;
  serialized['timeStamp'] = e.timeStamp;
  serialized['type'] = e.type;
  return serialized;
}

// TODO(jteplitz602): Allow users to specify the properties they need rather than always
// adding value #3374
Map<String, dynamic> serializeEventWithTarget(dynamic e) {
  var serializedEvent = serializeGenericEvent(e);
  return addTarget(e, serializedEvent);
}

Map<String, dynamic> serializeMouseEvent(dynamic e) {
  var serialized = new Map<String, dynamic>();
  serialized['altKey'] = e.altKey;
  serialized['bubbles'] = e.bubbles;
  serialized['button'] = e.button;
  serialized['cancelable'] = e.cancelable;
  serialized['client'] = serializePoint(e.client);
  serialized['ctrlKey'] = e.ctrlKey;
  serialized['defaultPrevented'] = e.defaultPrevented;
  serialized['detail'] = e.detail;
  serialized['eventPhase'] = e.eventPhase;
  serialized['layer'] = serializePoint(e.layer);
  serialized['metaKey'] = e.metaKey;
  serialized['offset'] = serializePoint(e.offset);
  serialized['page'] = serializePoint(e.page);
  serialized['region'] = e.region;
  serialized['screen'] = serializePoint(e.screen);
  serialized['shiftKey'] = e.shiftKey;
  serialized['timeStamp'] = e.timeStamp;
  serialized['type'] = e.type;
  return serialized;
}

Map<String, dynamic> serializePoint(Point point) {
  var serialized = new Map<String, dynamic>();
  serialized['magnitude'] = point.magnitude;
  serialized['x'] = point.x;
  serialized['y'] = point.y;
  return serialized;
}

Map<String, dynamic> serializeKeyboardEvent(dynamic e) {
  var serialized = new Map<String, dynamic>();
  serialized['altKey'] = e.altKey;
  serialized['bubbles'] = e.bubbles;
  serialized['cancelable'] = e.cancelable;
  serialized['charCode'] = e.charCode;
  serialized['ctrlKey'] = e.ctrlKey;
  serialized['defaultPrevented'] = e.defaultPrevented;
  serialized['detail'] = e.detail;
  serialized['eventPhase'] = e.eventPhase;
  serialized['keyCode'] = e.keyCode;
  serialized['keyLocation'] = e.keyLocation;
  serialized['location'] = e.location;
  serialized['repeat'] = e.repeat;
  serialized['shiftKey'] = e.shiftKey;
  serialized['timeStamp'] = e.timeStamp;
  serialized['type'] = e.type;
  //return addTarget(e, serialized);
  return serialized;
}

Map<String, dynamic> serializeTransitionEvent(dynamic e) {
  var serialized = serializeGenericEvent(e);
  serialized['propertyName'] = e.propertyName;
  serialized['elapsedTime'] = e.elapsedTime;
  serialized['pseudoElement'] = e.pseudoElement;
  return addTarget(e, serialized);
}

// TODO(jteplitz602): #3374. See above.
Map<String, dynamic> addTarget(
    dynamic e, Map<String, dynamic> serializedEvent) {
  if (NODES_WITH_VALUE.contains(e.target.tagName.toLowerCase())) {
    serializedEvent['target'] = {'value': e.target.value};
    if (e.target is InputElement) {
      serializedEvent['target']['files'] = e.target.files;
    }
  }
  return serializedEvent;
}
