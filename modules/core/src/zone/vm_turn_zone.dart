library angular.zone;

import 'dart:async' as async;

class VmTurnZone {
  Function _onTurnStart;
  Function _onTurnDone;
  Function _onScheduleMicrotask;

  async.Zone _outerZone;
  async.Zone _innerZone;

  int _nestedRunCounter;

  VmTurnZone() {
    _nestedRunCounter = 0;
    _outerZone = async.Zone.current;
    _innerZone = _outerZone.fork(specification: new async.ZoneSpecification(
        run: _onRun,
        runUnary: _onRunUnary,
        scheduleMicrotask: _onMicrotask
    ));
  }
  
  initCallbacks({Function onTurnStart, Function onTurnDone, Function onScheduleMicrotask}) {
    this._onTurnStart = onTurnStart;
    this._onTurnDone = onTurnDone;
    this._onScheduleMicrotask = onScheduleMicrotask;
  }
  
  dynamic run(fn()) => _innerZone.run(fn);

  dynamic runOutsideAngular(fn()) => _outerZone.run(fn);
  

  dynamic _onRunBase(async.Zone self, async.ZoneDelegate delegate, async.Zone zone, fn()) {
    _nestedRunCounter++;
    try {
      if (_nestedRunCounter == 1 && _onTurnStart != null) delegate.run(zone, _onTurnStart);

      return fn();

    } finally {
      _nestedRunCounter--;
      if (_nestedRunCounter == 0 && _onTurnDone != null) _finishTurn(zone, delegate);
    }
  }

  dynamic _onRun(async.Zone self, async.ZoneDelegate delegate, async.Zone zone, fn()) =>
    _onRunBase(self, delegate, zone, () => delegate.run(zone, fn));

  dynamic _onRunUnary(async.Zone self, async.ZoneDelegate delegate, async.Zone zone, fn(args), args) =>
    _onRunBase(self, delegate, zone, () => delegate.runUnary(zone, fn, args));

  void _finishTurn(zone, delegate) {
    delegate.run(zone, _onTurnDone);
  }

  _onMicrotask(async.Zone self, async.ZoneDelegate delegate, async.Zone zone, fn) {
    if (this._onScheduleMicrotask != null) {
      this._onScheduleMicrotask(fn);
    } else {
      delegate.scheduleMicrotask(zone, fn);
    }
  }
}
