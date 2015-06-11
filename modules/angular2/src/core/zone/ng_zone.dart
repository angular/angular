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
 * The wrapper maintains an "inner" and "mount" `Zone`. The application code will executes
 * in the "inner" zone unless `runOutsideAngular` is explicitely called.
 *
 * A typical application will create a singleton `NgZone`. The mount zone is the `Zone` where the singleton has been
 * instantiated. The default `onTurnDone` runs the Angular change detection.
 */
class NgZone {
  Function _onTurnStart;
  Function _onTurnDone;
  Function _onErrorHandler;

  // Code executed in _mountZone does not trigger the onTurnDone.
  Zone _mountZone;
  // _innerZone is the child of _mountZone. Any code executed in this zone will trigger the
  // onTurnDone hook at the end of the current VM turn.
  Zone _innerZone;

  // Number of microtasks pending from _innerZone (& descendants)
  int _pendingMicrotasks = 0;
  // Whether some code has been executed in the _innerZone (& descendants) in the current turn
  bool _hasExecutedCodeInInnerZone = false;
  // _outerRun() call depth. 0 at the end of a macrotask
  // zone.run(() => {         // top-level call
  //   zone.run(() => {});    // nested call -> in-turn
  // });                      // we should only check for the end of a turn once the top-level run ends
  int _nestedRun = 0;

  bool _inVmTurnDone = false;

  /**
   * Associates with this
   *
   * - a "mount" [Zone], which is a the one that instantiated this.
   * - an "inner" [Zone], which is a child of the mount [Zone].
   *
   * @param {bool} enableLongStackTrace whether to enable long stack trace. They should only be
   *               enabled in development mode as they significantly impact perf.
   */
  NgZone({bool enableLongStackTrace}) {
    _mountZone = Zone.current;

    if (enableLongStackTrace) {
      _innerZone = Chain.capture(() => _createInnerZone(Zone.current),
          onError: _onErrorWithLongStackTrace);
    } else {
      _innerZone = _createInnerZone(Zone.current,
          handleUncaughtError: (Zone self, ZoneDelegate parent, Zone zone,
              error,
              StackTrace trace) => _onErrorWithoutLongStackTrace(error, trace));
    }
  }

  /**
   * Initializes the zone hooks.
   *
   * The given error handler should re-throw the passed exception. Otherwise, exceptions will not
   * propagate outside of the [NgZone] and can alter the application execution flow.
   * Not re-throwing could be used to help testing the code or advanced use cases.
   *
   * @param {Function} onTurnStart called before code executes in the inner zone for each VM turn
   * @param {Function} onTurnDone called at the end of a VM turn if code has executed in the inner zone
   * @param {Function} onErrorHandler called when an exception is thrown by a macro or micro task
   */
  void initCallbacks(
      {Function onTurnStart, Function onTurnDone, Function onErrorHandler}) {
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
   * NgZone zone = <ref to the application zone>;
   *
   * void functionCalledFromJS() {
   *   zone.run(() {
   *     // auto-digest will run after this function is called from JS
   *   });
   * }
   * ```
   */
  dynamic run(fn()) {
    // Using runGuarded() is required when executing sync code with Dart otherwise handleUncaughtError()
    // would not be called on exceptions.
    // see https://code.google.com/p/dart/issues/detail?id=19566 for details.
    return _innerZone.runGuarded(fn);
  }

  /**
   * Runs `fn` in the mount zone and returns whatever it returns.
   *
   * In a typical app where the inner zone is the Angular zone, this allows one to escape Angular's
   * auto-digest mechanism.
   *
   * ```
   * void myFunction(NgZone zone, Element element) {
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
  dynamic runOutsideAngular(fn()) {
    return _mountZone.run(fn);
  }

  void _maybeStartVmTurn(ZoneDelegate parent) {
    if (!_hasExecutedCodeInInnerZone) {
      _hasExecutedCodeInInnerZone = true;
      if (_onTurnStart != null) {
        parent.run(_innerZone, _onTurnStart);
      }
    }
  }

  dynamic _run(Zone self, ZoneDelegate parent, Zone zone, fn()) {
    try {
      _nestedRun++;
      _maybeStartVmTurn(parent);
      return parent.run(zone, fn);
    } finally {
      _nestedRun--;
      // If there are no more pending microtasks and we are not in a recursive call, this is the end of a turn
      if (_pendingMicrotasks == 0 && _nestedRun == 0 && !_inVmTurnDone) {
        if (_onTurnDone != null && _hasExecutedCodeInInnerZone) {
          // Trigger onTurnDone at the end of a turn if _innerZone has executed some code
          try {
            _inVmTurnDone = true;
            parent.run(_innerZone, _onTurnDone);
          } finally {
            _inVmTurnDone = false;
            _hasExecutedCodeInInnerZone = false;
          }
        }
      }
    }
  }

  dynamic _runUnary(Zone self, ZoneDelegate parent, Zone zone, fn(arg), arg) =>
      _run(self, parent, zone, () => fn(arg));

  dynamic _runBinary(Zone self, ZoneDelegate parent, Zone zone, fn(arg1, arg2),
      arg1, arg2) => _run(self, parent, zone, () => fn(arg1, arg2));

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

  // Called by Chain.capture() on errors when long stack traces are enabled
  void _onErrorWithLongStackTrace(error, Chain chain) {
    if (_onErrorHandler != null) {
      final traces = chain.terse.traces.map((t) => t.toString()).toList();
      _onErrorHandler(error, traces);
    } else {
      throw error;
    }
  }

  // Outer zone handleUnchaughtError when long stack traces are not used
  void _onErrorWithoutLongStackTrace(error, StackTrace trace) {
    if (_onErrorHandler != null) {
      _onErrorHandler(error, [trace.toString()]);
    } else {
      throw error;
    }
  }

  Zone _createInnerZone(Zone zone, {handleUncaughtError}) {
    return zone.fork(
        specification: new ZoneSpecification(
            scheduleMicrotask: _scheduleMicrotask,
            run: _run,
            runUnary: _runUnary,
            runBinary: _runBinary,
            handleUncaughtError: handleUncaughtError),
        zoneValues: {'_innerZone': true});
  }
}
