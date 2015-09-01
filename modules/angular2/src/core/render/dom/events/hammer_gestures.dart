library angular.events;

import 'dart:html';
import './hammer_common.dart';
import 'package:angular2/src/core/facade/lang.dart' show BaseException;

import 'dart:js' as js;

class HammerGesturesPlugin extends HammerGesturesPluginCommon {
  bool supports(String eventName) {
    if (!super.supports(eventName)) return false;

    if (!js.context.hasProperty('Hammer')) {
      throw new BaseException(
          'Hammer.js is not loaded, can not bind ${eventName} event');
    }

    return true;
  }

  addEventListener(Element element, String eventName, Function handler) {
    var zone = this.manager.getZone();
    eventName = eventName.toLowerCase();

    zone.runOutsideAngular(() {
      // Creating the manager bind events, must be done outside of angular
      var mc = new js.JsObject(js.context['Hammer'], [element]);

      var jsObj = mc.callMethod('get', ['pinch']);
      jsObj.callMethod('set', [
        new js.JsObject.jsify({'enable': true})
      ]);
      jsObj = mc.callMethod('get', ['rotate']);
      jsObj.callMethod('set', [
        new js.JsObject.jsify({'enable': true})
      ]);

      mc.callMethod('on', [
        eventName,
        (eventObj) {
          zone.run(() {
            var dartEvent = new HammerEvent._fromJsEvent(eventObj);
            handler(dartEvent);
          });
        }
      ]);
    });
  }
}

class HammerEvent {
  num angle;
  num centerX;
  num centerY;
  int deltaTime;
  int deltaX;
  int deltaY;
  int direction;
  int distance;
  num rotation;
  num scale;
  Node target;
  int timeStamp;
  String type;
  num velocity;
  num velocityX;
  num velocityY;
  js.JsObject jsEvent;

  HammerEvent._fromJsEvent(js.JsObject event) {
    angle = event['angle'];
    var center = event['center'];
    centerX = center['x'];
    centerY = center['y'];
    deltaTime = event['deltaTime'];
    deltaX = event['deltaX'];
    deltaY = event['deltaY'];
    direction = event['direction'];
    distance = event['distance'];
    rotation = event['rotation'];
    scale = event['scale'];
    target = event['target'];
    timeStamp = event['timeStamp'];
    type = event['type'];
    velocity = event['velocity'];
    velocityX = event['velocityX'];
    velocityY = event['velocityY'];
    jsEvent = event;
  }
}
