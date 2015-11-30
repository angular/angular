library angular2.src.platform.dom.events.hammer_common;

import "package:angular2/core.dart" show EventManagerPlugin;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;

var _eventNames = {
  // pan
  "pan": true, "panstart": true, "panmove": true, "panend": true, "pancancel":
      true, "panleft": true, "panright": true, "panup": true, "pandown": true,
  // pinch
  "pinch": true, "pinchstart": true, "pinchmove": true, "pinchend": true,
  "pinchcancel": true, "pinchin": true, "pinchout": true,
  // press
  "press": true, "pressup": true,
  // rotate
  "rotate": true, "rotatestart": true, "rotatemove": true, "rotateend": true,
  "rotatecancel": true,
  // swipe
  "swipe": true, "swipeleft": true, "swiperight": true, "swipeup": true,
  "swipedown": true,
  // tap
  "tap": true
};

class HammerGesturesPluginCommon extends EventManagerPlugin {
  HammerGesturesPluginCommon() : super() {
    /* super call moved to initializer */;
  }
  bool supports(String eventName) {
    eventName = eventName.toLowerCase();
    return StringMapWrapper.contains(_eventNames, eventName);
  }
}
