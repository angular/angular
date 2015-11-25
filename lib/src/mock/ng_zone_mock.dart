library angular2.src.mock.ng_zone_mock;

import "package:angular2/src/core/zone/ng_zone.dart" show NgZone;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper;

class MockNgZone extends NgZone {
  /** @internal */
  EventEmitter<dynamic> _mockOnEventDone;
  MockNgZone() : super(enableLongStackTrace: false) {
    /* super call moved to initializer */;
    this._mockOnEventDone = new EventEmitter<dynamic>(false);
  }
  get onEventDone {
    return this._mockOnEventDone;
  }

  dynamic run(Function fn) {
    return fn();
  }

  dynamic runOutsideAngular(Function fn) {
    return fn();
  }

  void simulateZoneExit() {
    ObservableWrapper.callNext(this.onEventDone, null);
  }
}
