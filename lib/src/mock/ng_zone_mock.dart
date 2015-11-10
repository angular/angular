library angular2.src.mock.ng_zone_mock;

import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;

class MockNgZone extends NgZone {
  /** @internal */
  dynamic /* () => void */ _onEventDone;
  MockNgZone() : super(enableLongStackTrace: false) {
    /* super call moved to initializer */;
  }
  dynamic run(Function fn) {
    return fn();
  }

  dynamic runOutsideAngular(Function fn) {
    return fn();
  }

  void overrideOnEventDone(dynamic /* () => void */ fn,
      [bool opt_waitForAsync = false]) {
    this._onEventDone = fn;
  }

  void simulateZoneExit() {
    this._onEventDone();
  }
}
