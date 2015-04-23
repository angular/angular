library angular.zone;

import 'dart:async';
import 'package:stack_trace/stack_trace.dart' show Chain;

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

  // Code executed in _outerZone does not trigger the onTurnDone.
  Zone _outerZone;
  // _innerZone is the child of _outerZone. Any code executed in this zone will trigger the
  // onTurnDone hook at the end of the current VM turn.
  Zone _innerZone;

  // Number of microtasks pending from _outerZone (& descendants)
  int _pendingMicrotasks = 0;
  // Whether some code has been executed in the _innerZone (& descendants) in the current turn
  bool _hasExecutedCodeInInnerZone = false;
  // Whether the onTurnStart hook is executing
  bool _inTurnStart = false;

  /**
   * Associates with this
   *
   * - an "outer" [Zone], which is a child of the one that created this.
   * - an "inner" [Zone], which is a child of the outer [Zone].
   *
   * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
   *               enabled in development mode as they significantly impact perf.
   */
  VmTurnZone({bool enableLongStackTrace}) {
    // The _outerZone captures microtask scheduling so that we can run onTurnDone when the queue
    // is exhausted and code has been executed in the _innerZone.
    if (enableLongStackTrace) {
      _outerZone = Chain.capture(
        () {
          return Zone.current.fork(
              specification: new ZoneSpecification(
                  scheduleMicrotask: _scheduleMicrotask,
                  run: _outerRun,
                  runUnary: _outerRunUnary,
                  runBinary: _outerRunBinary
              ),
              zoneValues: {'_name': 'outer'}
          );
        }, onError: _onErrorWithLongStackTrace);
  } else {
      _outerZone = Zone.current.fork(
        specification: new ZoneSpecification(
          scheduleMicrotask: _scheduleMicrotask,
          run: _outerRun,
          runUnary: _outerRunUnary,
          runBinary: _outerRunBinary,
          handleUncaughtError: (Zone self, ZoneDelegate parent, Zone zone, error, StackTrace trace) =>
              _onErrorWithoutLongStackTrace(error, trace)
        ),
        zoneValues: {'_name': 'outer'}
      );
    }

    // Instruments the inner [Zone] to detect when code is executed in this (or a descendant) zone.
    // Also runs the onTurnStart hook the first time this zone executes some code in each turn.
    _innerZone = _outerZone.fork(
      specification: new ZoneSpecification(
        run: _innerRun,
        runUnary: _innerRunUnary,
        runBinary: _innerRunBinary
      ),
      zoneValues: {'_name': 'inner'});
  }

  /**
   * Initializes the zone hooks.
   *
   * The given error handler should re-throw the passed exception. Otherwise, exceptions will not
   * propagate outside of the [VmTurnZone] and can alter the application execution flow.
   * Not re-throwing could be used to help testing the code or advanced use cases.
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

  // Executes code in the [_innerZone] & trigger the onTurnStart hook when code is executed for the
  // first time in a turn.
  dynamic _innerRun(Zone self, ZoneDelegate parent, Zone zone, fn()) {
    _maybeStartVmTurn(parent, zone);
    return parent.run(zone, fn);
  }

  dynamic _innerRunUnary(Zone self, ZoneDelegate parent, Zone zone, fn(arg), arg) {
    _maybeStartVmTurn(parent, zone);
    return parent.runUnary(zone, fn, arg);
  }

  dynamic _innerRunBinary(Zone self, ZoneDelegate parent, Zone zone, fn(arg1, arg2), arg1, arg2) {
    _maybeStartVmTurn(parent, zone);
    return parent.runBinary(zone, fn, arg1, arg2);
  }

  void _maybeStartVmTurn(ZoneDelegate parent, Zone zone) {
    if (!_hasExecutedCodeInInnerZone) {
      _hasExecutedCodeInInnerZone = true;
      if (_onTurnStart != null) {
        _inTurnStart = true;
        parent.run(zone, _onTurnStart);
      }
    }
  }

  dynamic _outerRun(Zone self, ZoneDelegate parent, Zone zone, fn()) {
    try {
      return parent.run(zone, fn);
    } catch (error, stackTrace) {
      // By default, Dart would propagate synchronous errors outside of the error zone,
      // see https://code.google.com/p/dart/issues/detail?id=19566
      // However we want to have the same behacior as for asynchronous error which is to call
      // the zone's handleUncaughtError.
      if (_onErrorHandler != null) {
        zone.handleUncaughtError(error, stackTrace);
      } else {
        rethrow;
      }
    } finally {
      // If there are no more pending microtasks, we are at the end of a VM turn (or in onTurnStart)
      if (_pendingMicrotasks == 0) {
        if (_onTurnDone != null && !_inTurnStart && _hasExecutedCodeInInnerZone) {
          // Trigger onTurnDone at the end of a turn if _innerZone has executed some code
          try {
            parent.run(_innerZone, _onTurnDone);
          } catch (error, stackTrace) {
            if (_onErrorHandler != null) {
              parent.handleUncaughtError(zone, error, stackTrace);
            } else {
              rethrow;
            }
          } finally {
            _hasExecutedCodeInInnerZone = false;
          }
        }
      }
      _inTurnStart = false;
    }
  }

  dynamic _outerRunUnary(Zone self, ZoneDelegate parent, Zone zone, fn(arg), arg) =>
    _outerRun(self, parent, zone, () => fn(arg));

  dynamic _outerRunBinary(Zone self, ZoneDelegate parent, Zone zone, fn(arg1, arg2), arg1, arg2) =>
    _outerRun(self, parent, zone, () => fn(arg1, arg2));

  void _scheduleMicrotask(Zone self, ZoneDelegate parent, Zone zone, fn) {
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
    final traces = chain.terse.traces.map((t) => t.toString()).toList();
    _onError(exception, traces, chain.traces[0]);
  }

  void _onErrorWithoutLongStackTrace(exception, StackTrace trace) {
    _onError(exception, [trace.toString()], trace);
  }

  void _onError(exception, List<String> traces, StackTrace singleTrace) {
    if (_onErrorHandler != null) {
      _onErrorHandler(exception, traces);
    } else {
      throw exception;
    }
  }
}
