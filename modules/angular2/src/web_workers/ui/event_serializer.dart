library angular2.src.web_workers.event_serializer;

import 'package:angular2/src/core/facade/collection.dart';
// TODO(jteplitz602): Remove Mirrors from serialization #3348
@MirrorsUsed(
    symbols: "altKey, bubbles, button, cancelable, client, ctrlKey, " +
        "defaultPrevented, detail, eventPhase, layer, metaKey, offset, page, region, screen, " +
        "shiftKey, timeStamp, type, magnitude, x, y, charCode, keyCode, keyLocation, location, repeat")
import 'dart:mirrors';
import 'dart:core';
import 'dart:html';

// These Maps can't be const due to a dartj2 bug (see http://github.com/dart-lang/sdk/issues/21825)
// Once that bug is fixed these should be const
final Map MOUSE_EVENT_PROPERTIES = {
  #altKey: bool,
  #bubbles: bool,
  #button: int,
  #cancelable: bool,
  #client: Point,
  #ctrlKey: bool,
  #defaultPrevented: bool,
  #detail: int,
  #eventPhase: int,
  #layer: Point,
  #metaKey: bool,
  #offset: Point,
  #page: Point,
  #region: String,
  #screen: Point,
  #shiftKey: bool,
  #timeStamp: int,
  #type: String
};

final Map KEYBOARD_EVENT_PROPERTIES = {
  #altKey: bool,
  #bubbles: bool,
  #cancelable: bool,
  #charCode: int,
  #ctrlKey: bool,
  #defaultPrevented: bool,
  #detail: int,
  #eventPhase: int,
  #keyCode: int,
  #keyLocation: int,
  #layer: Point,
  #location: int,
  #repeat: bool,
  #shiftKey: bool,
  #timeStamp: int,
  #type: String
};

final Map EVENT_PROPERTIES = {
  #bubbles: bool,
  #cancelable: bool,
  #defaultPrevented: bool,
  #eventPhase: int,
  #timeStamp: int,
  #type: String
};

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
  "param"
]);

Map<String, dynamic> serializeGenericEvent(dynamic e) {
  return serializeEvent(e, EVENT_PROPERTIES);
}

// TODO(jteplitz602): Allow users to specify the properties they need rather than always
// adding value #3374
Map<String, dynamic> serializeEventWithTarget(dynamic e) {
  var serializedEvent = serializeEvent(e, EVENT_PROPERTIES);
  return addTarget(e, serializedEvent);
}

Map<String, dynamic> serializeMouseEvent(dynamic e) {
  return serializeEvent(e, MOUSE_EVENT_PROPERTIES);
}

Map<String, dynamic> serializeKeyboardEvent(dynamic e) {
  var serializedEvent = serializeEvent(e, KEYBOARD_EVENT_PROPERTIES);
  return addTarget(e, serializedEvent);
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

Map<String, dynamic> serializeEvent(dynamic e, Map<Symbol, Type> PROPERTIES) {
  var serialized = StringMapWrapper.create();
  var mirror = reflect(e);
  PROPERTIES.forEach((property, type) {
    var value = mirror.getField(property).reflectee;
    var propertyName = MirrorSystem.getName(property);
    if (type == int || type == bool || type == String) {
      serialized[propertyName] = value;
    } else if (type == Point) {
      var point = reflect(value);
      serialized[propertyName] = {
        'magnitude': point.getField(#magnitude).reflectee,
        'x': point.getField(#x).reflectee,
        'y': point.getField(#y).reflectee
      };
    }
  });

  return serialized;
}
