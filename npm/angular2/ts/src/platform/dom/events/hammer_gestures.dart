library angular.events;

import 'dart:html';
import './hammer_common.dart';
import 'package:angular2/src/facade/exceptions.dart' show BaseException;
import "package:angular2/src/core/di.dart" show Injectable, Inject, OpaqueToken;

import 'dart:js' as js;

const OpaqueToken HAMMER_GESTURE_CONFIG = const OpaqueToken("HammerGestureConfig");

overrideDefault(js.JsObject mc, String eventName, Object config) {
  var jsObj = mc.callMethod('get', [eventName]);
  jsObj.callMethod('set', [
    new js.JsObject.jsify(config)
  ]);
}

@Injectable()
class HammerGestureConfig {
  List<String> events = [];
  Map overrides = {};

  buildHammer(Element element) {
    var mc = new js.JsObject(js.context['Hammer'], [element]);
    overrideDefault(mc, 'pinch', {'enable': true});
    overrideDefault(mc, 'rotate', {'enable': true});
    this.overrides.forEach((Object config, String eventName) => overrideDefault(mc, eventName, config));
    return mc;
  }

}

@Injectable()
class HammerGesturesPlugin extends HammerGesturesPluginCommon {
  HammerGestureConfig _config;

  HammerGesturesPlugin(@Inject(HAMMER_GESTURE_CONFIG) this._config) {}

  bool supports(String eventName) {
    if (!super.supports(eventName) && !this.isCustomEvent(eventName)) return false;

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
      var mc = this._config.buildHammer(element);

      mc.callMethod('on', [
        eventName,
        (eventObj) {
          zone.runGuarded(() {
            var dartEvent = new HammerEvent._fromJsEvent(eventObj);
            handler(dartEvent);
          });
        }
      ]);
    });
  }

  isCustomEvent(String eventName) { return this._config.events.indexOf(eventName) > -1; }

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
