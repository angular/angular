library angular.zone;

import 'dart:async' as async;
import 'package:stack_trace/stack_trace.dart' show Chain;

class VmTurnZone {
  Function _onTurnStart;
  Function _onTurnDone;
  Function _onScheduleMicrotask;
  Function _onErrorHandler;

  async.Zone _outerZone;
  async.Zone _innerZone;

  int _nestedRunCounter;

  VmTurnZone({bool enableLongStackTrace}) {
    _nestedRunCounter = 0;
    _outerZone = async.Zone.current;
    _innerZone = _createInnerZoneWithErrorHandling(enableLongStackTrace);
  }

  initCallbacks({Function onTurnStart, Function onTurnDone, Function onScheduleMicrotask, Function onErrorHandler}) {
    this._onTurnStart = onTurnStart;
    this._onTurnDone = onTurnDone;
    this._onScheduleMicrotask = onScheduleMicrotask;
    this._onErrorHandler = onErrorHandler;
  }

  dynamic run(fn()) => _innerZone.run(fn);

  dynamic runOutsideAngular(fn()) => _outerZone.run(fn);


  async.Zone _createInnerZoneWithErrorHandling(bool enableLongStackTrace) {
    if (enableLongStackTrace) {
      return Chain.capture(() {
        return _createInnerZone(async.Zone.current);
      }, onError: this._onErrorWithLongStackTrace);
    } else {
      return async.runZoned(() {
        return _createInnerZone(async.Zone.current);
      }, onError: this._onErrorWithoutLongStackTrace);
    }
  }

  async.Zone _createInnerZone(async.Zone zone) {
    return zone.fork(specification: new async.ZoneSpecification(
        run: _onRun,
        runUnary: _onRunUnary,
        scheduleMicrotask: _onMicrotask
    ));
  }

  dynamic _onRunBase(async.Zone self, async.ZoneDelegate delegate, async.Zone zone, fn()) {
    _nestedRunCounter++;
    try {
      if (_nestedRunCounter == 1 && _onTurnStart != null) delegate.run(zone, _onTurnStart);
      return fn();
    } catch (e, s) {
      if (_onErrorHandler != null && _nestedRunCounter == 1) {
        _onErrorHandler(e, [s.toString()]);
      } else {
        rethrow;
      }
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
      _onScheduleMicrotask(fn);
    } else {
      delegate.scheduleMicrotask(zone, fn);
    }
  }

  _onErrorWithLongStackTrace(exception, Chain chain) {
    final traces = chain.terse.traces.map((t) => t.toString()).toList();
    _onError(exception, traces, chain.traces[0]);
  }
  _onErrorWithoutLongStackTrace(exception, StackTrace trace) {
    _onError(exception, [trace.toString()], trace);
  }

  _onError(exception, List<String> traces, StackTrace singleTrace) {
    if (_onErrorHandler != null) {
      _onErrorHandler(exception, traces);
    } else {
      _outerZone.handleUncaughtError(exception, singleTrace);
    }
  }
}
