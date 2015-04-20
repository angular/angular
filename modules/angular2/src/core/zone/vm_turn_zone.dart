library angular.zone;

import 'dart:async' as async;
import 'package:stack_trace/stack_trace.dart' show Chain;

import 'dart:mirrors';

/**
 * A `Zone` wrapper that lets you schedule tasks after its private microtask queue is exhausted but
 * before the next "VM turn", i.e. event loop iteration.
 *
 * This lets you freely schedule microtasks that prepare data, and set an {@link onTurnDone} handler that
 * will consume that data after it's ready but before the browser has a chance to re-render.
 *
 * A VM turn consist of a single macrotask followed 0 to many microtasks.
 *
 * The wrapper maintains an "inner" and "outer" `Zone`. The application code will executes
 * in the "inner" zone unless `runOutsideAngular` is explicitely called.
 *
 * A typical application will create a singleton `VmTurnZone` whose outer `Zone` is the root `Zone`
 * and whose default `onTurnDone` runs the Angular digest.
 */
class VmTurnZone {
  Function _onTurnStart;
  Function _onTurnDone;
  Function _onErrorHandler;

  async.Zone _outerZone;
  async.Zone _innerZone;

  int _pendingMicrotasks = 0;

  bool _hasExecutedCodeInInnerZone = false;

  bool _inTurnStart = false;

  /**
   * Associates with this
   *
   * - an "outer" `Zone`, which is the one that created this.
   * - an "inner" `Zone`, which is a child of the outer `Zone`.
   *
   * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
   *               enabled in development mode as they significantly impact perf.
   */
  VmTurnZone({bool enableLongStackTrace}) {
    if (enableLongStackTrace) {
      _outerZone = Chain.capture(
        () {
          return async.Zone.current.fork(
              specification: new async.ZoneSpecification(
                  scheduleMicrotask: _scheduleMicrotask,
                  run: _outerRun,
                  runUnary: _outerRunUnary,
                  runBinary: _outerRunBinary
                  //,handleUncaughtError: (self, parent, zone, error, trace) => null
              ),
              zoneValues: {#_name: 'outer'}
          );
        }, onError: _onErrorWithLongStackTrace);
  } else {
      _outerZone = async.Zone.current.fork(
        specification: new async.ZoneSpecification(
          scheduleMicrotask: _scheduleMicrotask,
          run: _outerRun,
          runUnary: _outerRunUnary,
          runBinary: _outerRunBinary,
          handleUncaughtError: (self, parent, zone, error, trace) => _onErrorWithoutLongStackTrace(error, trace)
        ),
        zoneValues: {#_name: 'outer'}
      );
    }


    //_innerZone = _createInnerZoneWithErrorHandling(enableLongStackTrace);
    _innerZone = _createInnerZone(_outerZone);
  }

  /**
   * Initializes the zone hooks.
   *
   * @param {Function} onTurnStart called before code executes in the inner zone for each VM turn
   * @param {Function} onTurnDone called at the end of a VM turn if code has executed in the inner zone
   * @param {Function} onErrorHandler called when an exception is thrown by a macro or micro task
   */
  void initCallbacks({Function onTurnStart, Function onTurnDone, Function onErrorHandler}) {
    _onTurnStart = onTurnStart;
    _onTurnDone = onTurnDone;
    _onErrorHandler = onErrorHandler;
  }

  /**
   * Runs `fn` in the inner zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to make use of the
   * Angular's auto digest mechanism.
   *
   * ```
   * VmTurnZone zone = <ref to the application zone>;
   *
   * void functionCalledFromJS() {
   *   zone.run(() {
   *     // auto-digest will run after this function is called from JS
   *   });
   * }
   * ```
   */
  dynamic run(fn()) => _innerZone.run(fn);

  /**
   * Runs `fn` in the outer zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to escape Angular's
   * auto-digest mechanism.
   *
   * ```
   * void myFunction(VmTurnZone zone, Element element) {
   *   element.onClick.listen(() {
   *     // auto-digest will run after element click.
   *   });
   *   zone.runOutsideAngular(() {
   *     element.onMouseMove.listen(() {
   *       // auto-digest will NOT run after mouse move
   *     });
   *   });
   * }
   * ```
   */
  dynamic runOutsideAngular(fn()) => _outerZone.run(fn);

  async.Zone _createInnerZone(async.Zone zone) {
    return zone.fork(
      specification: new async.ZoneSpecification(
        run: _innerRun,
        runUnary: _innerRunUnary,
        runBinary: _innerRunBinary
      ),
      zoneValues: {#_name: 'inner'}
    );
  }

  dynamic _innerRun(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn()) {
    _maybeStartVmTurn(parent, zone);
    return parent.run(zone, fn);
  }

  dynamic _innerRunUnary(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn(arg), arg) {
    _maybeStartVmTurn(parent, zone);
    return parent.runUnary(zone, fn, arg);
  }

  dynamic _innerRunBinary(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn(arg1, arg2), arg1, arg2) {
    _maybeStartVmTurn(parent, zone);
    return parent.runBinary(zone, fn, arg1, arg2);
  }

  void _maybeStartVmTurn(async.ZoneDelegate parent, async.Zone zone) {
    if (!_hasExecutedCodeInInnerZone) {

      _hasExecutedCodeInInnerZone = true;
      if (_onTurnStart != null) {
        _inTurnStart = true;
        parent.run(zone, _onTurnStart);
      }
    }
  }

  dynamic _outerRun(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn()) {
    try {
      return parent.run(zone, fn);
    } catch (e, trace) {
      if (_onErrorHandler != null) {
        _onErrorHandler(e, [trace.toString()]);
      }
      rethrow;
    } finally {
      if (_pendingMicrotasks == 0) {
        if (_onTurnDone != null && !_inTurnStart && _hasExecutedCodeInInnerZone) {
          try {
            parent.run(_innerZone, _onTurnDone);
          } catch (e, trace) {
            if (_onErrorHandler != null) {
              _onErrorHandler(e, [trace.toString()]);
            }
            rethrow;
          } finally {
            _hasExecutedCodeInInnerZone = false;
          }
        }
      }
      _inTurnStart = false;
    }
  }

  dynamic _outerRunUnary(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn(arg), arg) =>
    _outerRun(self, parent, zone, () => fn(arg));

  dynamic _outerRunBinary(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn(arg1, arg2), arg1, arg2) =>
    _outerRun(self, parent, zone, () => fn(arg1, arg2));

  void _scheduleMicrotask(async.Zone self, async.ZoneDelegate parent, async.Zone zone, fn) {
    _pendingMicrotasks++;
    var microtask = () {
      try {
        fn();
      } finally {
        _pendingMicrotasks--;
      }
    };
    parent.scheduleMicrotask(zone, microtask);
  }

  void _onErrorWithLongStackTrace(exception, Chain chain) {
    print('+[_onErrorWithLongStackTrace]');
    final traces = chain.terse.traces.map((t) => t.toString()).toList();
    _onError(exception, traces, chain.traces[0]);
  }

  void _onErrorWithoutLongStackTrace(exception, StackTrace trace) {
    print('+[_onErrorWithoutLongStackTrace]');
    _onError(exception, [trace.toString()], trace);
  }

  void _onError(exception, List<String> traces, StackTrace singleTrace) {
    print('+[_onError]');
    if (_onErrorHandler != null) {
      _onErrorHandler(exception, traces);
    }
    throw exception;
  }
}
