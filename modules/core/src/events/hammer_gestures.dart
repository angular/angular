library angular.events;
import './event_manager.dart';
import 'package:facade/dom.dart' show Element;

import 'dart:js' as js;

class HammerGesturesPlugin extends EventManagerPlugin {
  bool isEnabled() => js.context.hasProperty('Hammer');

  bool supports(String eventName) {
    var eventNames = ['swipe', 'tap', 'pinch', 'rotate'];

    return eventNames.indexOf(eventName) > -1;
  }

  addEventListener(Element element, String eventName, Function handler) {
    var zone = this.manager.zone;

    zone.runOutsideAngular(() {
      // TODO(vicb): max 1 manager per element
      // Creating the manager bind events, must be done outside of angular
      var mc = new js.JsObject(js.context['Hammer'], [element]);

      mc.callMethod('on', [
          eventName,
          (eventObj) {
            zone.run(() {
              handler(eventObj);
            });
          }
      ]);
    });
  }
}
